package com.mota.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.redis.service.RedisService;
import com.mota.knowledge.entity.ChunkUpload;
import com.mota.knowledge.entity.KnowledgeFile;
import com.mota.knowledge.mapper.ChunkUploadMapper;
import com.mota.knowledge.mapper.KnowledgeFileMapper;
import com.mota.knowledge.service.ChunkUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 分片上传服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChunkUploadServiceImpl implements ChunkUploadService {

    private final ChunkUploadMapper chunkUploadMapper;
    private final KnowledgeFileMapper fileMapper;
    private final RedisService redisService;

    private static final String UPLOAD_CACHE_PREFIX = "chunk:upload:";
    private static final String TEMP_DIR = "/tmp/mota/chunks/";
    private static final long CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    @Override
    @Transactional
    public Map<String, Object> initUpload(String fileName, Long fileSize, Integer totalChunks, String md5Hash) {
        // 检查是否可以秒传
        Long existingFileId = checkInstantUpload(md5Hash);
        if (existingFileId != null) {
            Map<String, Object> result = new HashMap<>();
            result.put("instantUpload", true);
            result.put("fileId", existingFileId);
            return result;
        }

        // 检查是否有未完成的上传任务
        ChunkUpload existingUpload = chunkUploadMapper.selectByMd5(TenantContext.getTenantId(), md5Hash);
        if (existingUpload != null && "uploading".equals(existingUpload.getStatus())) {
            Map<String, Object> result = new HashMap<>();
            result.put("instantUpload", false);
            result.put("uploadId", existingUpload.getUploadId());
            result.put("uploadedChunks", getUploadedChunks(existingUpload.getUploadId()));
            return result;
        }

        // 创建新的上传任务
        String uploadId = UUID.randomUUID().toString().replace("-", "");
        
        ChunkUpload upload = new ChunkUpload();
        upload.setTenantId(TenantContext.getTenantId());
        upload.setUploadId(uploadId);
        upload.setFileName(fileName);
        upload.setFileSize(fileSize);
        upload.setChunkSize(CHUNK_SIZE);
        upload.setTotalChunks(totalChunks);
        upload.setUploadedChunks(0);
        upload.setMd5Hash(md5Hash);
        upload.setStatus("uploading");
        upload.setCreatedBy(UserContext.getUserId());
        upload.setExpireAt(LocalDateTime.now().plusHours(24));

        chunkUploadMapper.insert(upload);

        // 创建临时目录
        createTempDir(uploadId);

        Map<String, Object> result = new HashMap<>();
        result.put("instantUpload", false);
        result.put("uploadId", uploadId);
        result.put("uploadedChunks", new ArrayList<>());
        return result;
    }

    @Override
    @Transactional
    public ChunkUpload uploadChunk(String uploadId, Integer chunkIndex, byte[] chunkData, String chunkMd5) {
        ChunkUpload upload = chunkUploadMapper.selectByUploadId(uploadId);
        if (upload == null) {
            throw new BusinessException("上传任务不存在");
        }

        if (!"uploading".equals(upload.getStatus())) {
            throw new BusinessException("上传任务状态异常");
        }

        if (chunkIndex < 0 || chunkIndex >= upload.getTotalChunks()) {
            throw new BusinessException("分片索引无效");
        }

        // 保存分片到临时文件
        String chunkPath = getChunkPath(uploadId, chunkIndex);
        try {
            Files.write(Paths.get(chunkPath), chunkData);
        } catch (IOException e) {
            throw new BusinessException("保存分片失败: " + e.getMessage());
        }

        // 记录已上传的分片
        String cacheKey = UPLOAD_CACHE_PREFIX + uploadId + ":chunks";
        redisService.setCacheSetValue(cacheKey, chunkIndex.toString());
        redisService.expire(cacheKey, 24, TimeUnit.HOURS);

        // 更新上传进度
        Set<String> uploadedSet = redisService.getCacheSet(cacheKey);
        int uploadedCount = uploadedSet != null ? uploadedSet.size() : 0;
        upload.setUploadedChunks(uploadedCount);
        chunkUploadMapper.updateById(upload);

        log.info("上传分片: uploadId={}, chunkIndex={}, progress={}/{}", 
            uploadId, chunkIndex, uploadedCount, upload.getTotalChunks());

        return upload;
    }

    @Override
    public Map<String, Object> getUploadProgress(String uploadId) {
        ChunkUpload upload = chunkUploadMapper.selectByUploadId(uploadId);
        if (upload == null) {
            throw new BusinessException("上传任务不存在");
        }

        Map<String, Object> progress = new HashMap<>();
        progress.put("uploadId", uploadId);
        progress.put("fileName", upload.getFileName());
        progress.put("fileSize", upload.getFileSize());
        progress.put("totalChunks", upload.getTotalChunks());
        progress.put("uploadedChunks", upload.getUploadedChunks());
        progress.put("status", upload.getStatus());
        progress.put("progress", upload.getTotalChunks() > 0 
            ? (double) upload.getUploadedChunks() / upload.getTotalChunks() * 100 : 0);

        return progress;
    }

    @Override
    public List<Integer> getUploadedChunks(String uploadId) {
        String cacheKey = UPLOAD_CACHE_PREFIX + uploadId + ":chunks";
        Set<String> uploadedSet = redisService.getCacheSet(cacheKey);
        
        if (uploadedSet == null || uploadedSet.isEmpty()) {
            return new ArrayList<>();
        }

        return uploadedSet.stream()
            .map(Integer::parseInt)
            .sorted()
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Long mergeChunks(String uploadId, Long projectId, Long parentId) {
        ChunkUpload upload = chunkUploadMapper.selectByUploadId(uploadId);
        if (upload == null) {
            throw new BusinessException("上传任务不存在");
        }

        if (!upload.getUploadedChunks().equals(upload.getTotalChunks())) {
            throw new BusinessException("分片未全部上传完成");
        }

        // 合并分片
        String mergedPath = mergeTempFiles(uploadId, upload.getTotalChunks(), upload.getFileName());

        // 创建文件记录
        KnowledgeFile file = new KnowledgeFile();
        file.setTenantId(upload.getTenantId());
        file.setProjectId(projectId);
        file.setParentId(parentId);
        file.setName(upload.getFileName());
        file.setOriginalName(upload.getFileName());
        file.setFileSize(upload.getFileSize());
        file.setStoragePath(mergedPath);
        file.setMd5Hash(upload.getMd5Hash());
        file.setStatus("published");
        file.setVersion(1);
        file.setCreatedBy(upload.getCreatedBy());

        // 解析文件扩展名
        String extension = "";
        int dotIndex = upload.getFileName().lastIndexOf('.');
        if (dotIndex > 0) {
            extension = upload.getFileName().substring(dotIndex + 1).toLowerCase();
        }
        file.setExtension(extension);
        file.setMimeType(getMimeType(extension));

        fileMapper.insert(file);

        // 更新上传状态
        upload.setStatus("completed");
        upload.setFileId(file.getId());
        chunkUploadMapper.updateById(upload);

        // 清理临时文件
        cleanTempFiles(uploadId);

        log.info("合并分片完成: uploadId={}, fileId={}", uploadId, file.getId());
        return file.getId();
    }

    @Override
    @Transactional
    public void cancelUpload(String uploadId) {
        ChunkUpload upload = chunkUploadMapper.selectByUploadId(uploadId);
        if (upload == null) {
            return;
        }

        upload.setStatus("cancelled");
        chunkUploadMapper.updateById(upload);

        // 清理临时文件和缓存
        cleanTempFiles(uploadId);
        String cacheKey = UPLOAD_CACHE_PREFIX + uploadId + ":chunks";
        redisService.deleteObject(cacheKey);

        log.info("取消上传: uploadId={}", uploadId);
    }

    @Override
    @Transactional
    public void cleanExpiredUploads(Integer expireHours) {
        LocalDateTime expireTime = LocalDateTime.now().minusHours(expireHours);
        List<ChunkUpload> expiredUploads = chunkUploadMapper.selectExpired(expireTime);

        for (ChunkUpload upload : expiredUploads) {
            cancelUpload(upload.getUploadId());
            chunkUploadMapper.deleteById(upload.getId());
        }

        log.info("清理过期上传任务: count={}", expiredUploads.size());
    }

    @Override
    public Long checkInstantUpload(String md5Hash) {
        if (md5Hash == null || md5Hash.isEmpty()) {
            return null;
        }

        LambdaQueryWrapper<KnowledgeFile> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(KnowledgeFile::getTenantId, TenantContext.getTenantId())
               .eq(KnowledgeFile::getMd5Hash, md5Hash)
               .eq(KnowledgeFile::getDeleted, false)
               .last("LIMIT 1");

        KnowledgeFile existingFile = fileMapper.selectOne(wrapper);
        return existingFile != null ? existingFile.getId() : null;
    }

    // ==================== 辅助方法 ====================

    private void createTempDir(String uploadId) {
        Path dirPath = Paths.get(TEMP_DIR + uploadId);
        try {
            Files.createDirectories(dirPath);
        } catch (IOException e) {
            throw new BusinessException("创建临时目录失败: " + e.getMessage());
        }
    }

    private String getChunkPath(String uploadId, Integer chunkIndex) {
        return TEMP_DIR + uploadId + "/" + chunkIndex;
    }

    private String mergeTempFiles(String uploadId, Integer totalChunks, String fileName) {
        String mergedDir = TEMP_DIR + "merged/";
        String mergedPath = mergedDir + uploadId + "_" + fileName;

        try {
            Files.createDirectories(Paths.get(mergedDir));
            
            try (FileOutputStream fos = new FileOutputStream(mergedPath)) {
                for (int i = 0; i < totalChunks; i++) {
                    String chunkPath = getChunkPath(uploadId, i);
                    byte[] chunkData = Files.readAllBytes(Paths.get(chunkPath));
                    fos.write(chunkData);
                }
            }
        } catch (IOException e) {
            throw new BusinessException("合并分片失败: " + e.getMessage());
        }

        return mergedPath;
    }

    private void cleanTempFiles(String uploadId) {
        Path dirPath = Paths.get(TEMP_DIR + uploadId);
        try {
            if (Files.exists(dirPath)) {
                Files.walk(dirPath)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            log.warn("删除临时文件失败: {}", path);
                        }
                    });
            }
        } catch (IOException e) {
            log.warn("清理临时目录失败: {}", uploadId);
        }
    }

    private String getMimeType(String extension) {
        Map<String, String> mimeTypes = new HashMap<>();
        mimeTypes.put("pdf", "application/pdf");
        mimeTypes.put("doc", "application/msword");
        mimeTypes.put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        mimeTypes.put("xls", "application/vnd.ms-excel");
        mimeTypes.put("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        mimeTypes.put("ppt", "application/vnd.ms-powerpoint");
        mimeTypes.put("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        mimeTypes.put("txt", "text/plain");
        mimeTypes.put("md", "text/markdown");
        mimeTypes.put("jpg", "image/jpeg");
        mimeTypes.put("jpeg", "image/jpeg");
        mimeTypes.put("png", "image/png");
        mimeTypes.put("gif", "image/gif");
        mimeTypes.put("zip", "application/zip");
        mimeTypes.put("rar", "application/x-rar-compressed");

        return mimeTypes.getOrDefault(extension, "application/octet-stream");
    }
}