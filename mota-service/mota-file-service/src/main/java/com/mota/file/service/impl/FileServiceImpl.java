package com.mota.file.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.common.core.exception.BusinessException;
import com.mota.file.config.MinioConfig;
import com.mota.file.dto.*;
import com.mota.file.entity.ChunkUploadTask;
import com.mota.file.entity.FileAccessLog;
import com.mota.file.entity.FileInfo;
import com.mota.file.mapper.ChunkUploadTaskMapper;
import com.mota.file.mapper.FileAccessLogMapper;
import com.mota.file.mapper.FileInfoMapper;
import com.mota.file.service.FileService;
import com.mota.file.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 文件服务实现
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileInfoMapper fileInfoMapper;
    private final ChunkUploadTaskMapper chunkUploadTaskMapper;
    private final FileAccessLogMapper fileAccessLogMapper;
    private final StorageService storageService;
    private final MinioConfig minioConfig;
    private final ObjectMapper objectMapper;
    private final Tika tika = new Tika();

    @Override
    @Transactional
    public FileInfoVO uploadFile(MultipartFile file, FileUploadRequest request,
                                  Long tenantId, Long userId, String userName) {
        try {
            // 计算文件MD5
            String md5Hash = DigestUtil.md5Hex(file.getInputStream());
            
            // 检查秒传
            FileInfo existingFile = fileInfoMapper.findByMd5Hash(md5Hash, tenantId);
            if (existingFile != null) {
                log.info("秒传成功: md5={}, fileId={}", md5Hash, existingFile.getId());
                return FileInfoVO.fromEntity(existingFile);
            }

            // 获取文件信息
            String originalFilename = file.getOriginalFilename();
            String extension = FileUtil.extName(originalFilename);
            String mimeType = tika.detect(file.getInputStream(), originalFilename);
            String category = getFileCategory(mimeType);

            // 生成存储路径
            String storageName = IdUtil.fastSimpleUUID() + "." + extension;
            String storagePath = generateStoragePath(tenantId, category, storageName);
            
            // 选择存储桶
            String bucketName = Boolean.TRUE.equals(request.getIsPublic()) 
                    ? minioConfig.getPublicBucket() 
                    : minioConfig.getDefaultBucket();

            // 上传文件
            String fileUrl = storageService.uploadFile(bucketName, storagePath, 
                    file.getInputStream(), mimeType, file.getSize());

            // 保存文件信息
            FileInfo fileInfo = new FileInfo();
            fileInfo.setTenantId(tenantId);
            fileInfo.setFileName(originalFilename);
            fileInfo.setStorageName(storageName);
            fileInfo.setFilePath(storagePath);
            fileInfo.setFileUrl(fileUrl);
            fileInfo.setFileSize(file.getSize());
            fileInfo.setMimeType(mimeType);
            fileInfo.setExtension(extension);
            fileInfo.setMd5Hash(md5Hash);
            fileInfo.setBucketName(bucketName);
            fileInfo.setStorageType(FileInfo.StorageType.MINIO);
            fileInfo.setCategory(category);
            fileInfo.setBusinessType(request.getBusinessType());
            fileInfo.setBusinessId(request.getBusinessId());
            fileInfo.setIsPublic(request.getIsPublic());
            fileInfo.setAccessCount(0L);
            fileInfo.setDownloadCount(0L);
            fileInfo.setUploadUserId(userId);
            fileInfo.setUploadUserName(userName);
            fileInfo.setStatus(FileInfo.Status.NORMAL);

            fileInfoMapper.insert(fileInfo);

            // 异步生成缩略图
            if (FileInfo.Category.IMAGE.equals(category) && Boolean.TRUE.equals(request.getGenerateThumbnail())) {
                generateThumbnailAsync(fileInfo, request.getThumbnailWidth(), request.getThumbnailHeight());
            }

            return FileInfoVO.fromEntity(fileInfo);
        } catch (Exception e) {
            log.error("上传文件失败", e);
            throw new BusinessException("上传文件失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<FileInfoVO> uploadFiles(List<MultipartFile> files, FileUploadRequest request,
                                         Long tenantId, Long userId, String userName) {
        return files.stream()
                .map(file -> uploadFile(file, request, tenantId, userId, userName))
                .collect(Collectors.toList());
    }

    @Override
    public FileInfoVO checkInstantUpload(String md5Hash, Long tenantId) {
        FileInfo fileInfo = fileInfoMapper.findByMd5Hash(md5Hash, tenantId);
        return FileInfoVO.fromEntity(fileInfo);
    }

    @Override
    @Transactional
    public ChunkUploadInitResponse initChunkUpload(ChunkUploadInitRequest request,
                                                    Long tenantId, Long userId) {
        // 检查秒传
        FileInfo existingFile = fileInfoMapper.findByMd5Hash(request.getMd5Hash(), tenantId);
        if (existingFile != null) {
            return ChunkUploadInitResponse.instantUpload(FileInfoVO.fromEntity(existingFile));
        }

        // 检查断点续传
        ChunkUploadTask existingTask = chunkUploadTaskMapper.findByMd5Hash(request.getMd5Hash(), tenantId);
        if (existingTask != null) {
            List<Integer> uploadedChunks = parseUploadedIndexes(existingTask.getUploadedIndexes());
            return ChunkUploadInitResponse.resumeUpload(
                    existingTask.getUploadId(),
                    uploadedChunks,
                    existingTask.getTotalChunks(),
                    existingTask.getChunkSize(),
                    existingTask.getExpireTime()
            );
        }

        // 创建新的上传任务
        String uploadId = IdUtil.fastSimpleUUID();
        int totalChunks = (int) Math.ceil((double) request.getFileSize() / request.getChunkSize());
        
        String extension = FileUtil.extName(request.getFileName());
        String storageName = IdUtil.fastSimpleUUID() + "." + extension;
        String mimeType = request.getMimeType() != null ? request.getMimeType() : "application/octet-stream";
        String category = getFileCategory(mimeType);
        String storagePath = generateStoragePath(tenantId, category, storageName);
        
        String bucketName = Boolean.TRUE.equals(request.getIsPublic()) 
                ? minioConfig.getPublicBucket() 
                : minioConfig.getDefaultBucket();

        ChunkUploadTask task = new ChunkUploadTask();
        task.setTenantId(tenantId);
        task.setUploadId(uploadId);
        task.setFileName(request.getFileName());
        task.setFileSize(request.getFileSize());
        task.setMd5Hash(request.getMd5Hash());
        task.setMimeType(mimeType);
        task.setBucketName(bucketName);
        task.setStoragePath(storagePath);
        task.setChunkSize(request.getChunkSize());
        task.setTotalChunks(totalChunks);
        task.setUploadedChunks(0);
        task.setUploadedIndexes("[]");
        task.setStatus(ChunkUploadTask.Status.UPLOADING);
        task.setUploadUserId(userId);
        task.setExpireTime(LocalDateTime.now().plusDays(1));

        chunkUploadTaskMapper.insert(task);

        return ChunkUploadInitResponse.newUpload(uploadId, totalChunks, request.getChunkSize(), task.getExpireTime());
    }

    @Override
    @Transactional
    public boolean uploadChunk(String uploadId, int chunkIndex, MultipartFile file, Long tenantId) {
        ChunkUploadTask task = chunkUploadTaskMapper.findByUploadId(uploadId, tenantId);
        if (task == null) {
            throw new BusinessException("上传任务不存在");
        }
        if (task.getStatus() != ChunkUploadTask.Status.UPLOADING) {
            throw new BusinessException("上传任务状态异常");
        }

        try {
            // 上传分片
            String partObjectName = task.getStoragePath() + ".part" + chunkIndex;
            storageService.uploadFile(task.getBucketName(), partObjectName, 
                    file.getInputStream(), "application/octet-stream", file.getSize());

            // 更新已上传分片信息
            List<Integer> uploadedIndexes = parseUploadedIndexes(task.getUploadedIndexes());
            if (!uploadedIndexes.contains(chunkIndex)) {
                uploadedIndexes.add(chunkIndex);
                uploadedIndexes.sort(Integer::compareTo);
            }

            String indexesJson = objectMapper.writeValueAsString(uploadedIndexes);
            chunkUploadTaskMapper.updateUploadProgress(task.getId(), uploadedIndexes.size(), indexesJson);

            return true;
        } catch (Exception e) {
            log.error("上传分片失败: uploadId={}, chunkIndex={}", uploadId, chunkIndex, e);
            throw new BusinessException("上传分片失败");
        }
    }

    @Override
    @Transactional
    public FileInfoVO completeChunkUpload(String uploadId, Long tenantId, Long userId, String userName) {
        ChunkUploadTask task = chunkUploadTaskMapper.findByUploadId(uploadId, tenantId);
        if (task == null) {
            throw new BusinessException("上传任务不存在");
        }

        List<Integer> uploadedIndexes = parseUploadedIndexes(task.getUploadedIndexes());
        if (uploadedIndexes.size() != task.getTotalChunks()) {
            throw new BusinessException("分片未全部上传完成");
        }

        try {
            // 合并分片
            List<String> partNames = new ArrayList<>();
            for (int i = 0; i < task.getTotalChunks(); i++) {
                partNames.add(task.getStoragePath() + ".part" + i);
            }

            String fileUrl = storageService.completeMultipartUpload(
                    task.getBucketName(), task.getStoragePath(), uploadId, partNames);

            // 保存文件信息
            String extension = FileUtil.extName(task.getFileName());
            String category = getFileCategory(task.getMimeType());

            FileInfo fileInfo = new FileInfo();
            fileInfo.setTenantId(tenantId);
            fileInfo.setFileName(task.getFileName());
            fileInfo.setStorageName(FileUtil.getName(task.getStoragePath()));
            fileInfo.setFilePath(task.getStoragePath());
            fileInfo.setFileUrl(fileUrl);
            fileInfo.setFileSize(task.getFileSize());
            fileInfo.setMimeType(task.getMimeType());
            fileInfo.setExtension(extension);
            fileInfo.setMd5Hash(task.getMd5Hash());
            fileInfo.setBucketName(task.getBucketName());
            fileInfo.setStorageType(FileInfo.StorageType.MINIO);
            fileInfo.setCategory(category);
            fileInfo.setIsPublic(minioConfig.getPublicBucket().equals(task.getBucketName()));
            fileInfo.setAccessCount(0L);
            fileInfo.setDownloadCount(0L);
            fileInfo.setUploadUserId(userId);
            fileInfo.setUploadUserName(userName);
            fileInfo.setStatus(FileInfo.Status.NORMAL);

            fileInfoMapper.insert(fileInfo);

            // 更新任务状态
            chunkUploadTaskMapper.completeTask(task.getId(), fileInfo.getId());

            return FileInfoVO.fromEntity(fileInfo);
        } catch (Exception e) {
            log.error("完成分片上传失败: uploadId={}", uploadId, e);
            throw new BusinessException("完成分片上传失败");
        }
    }

    @Override
    @Transactional
    public void cancelChunkUpload(String uploadId, Long tenantId) {
        ChunkUploadTask task = chunkUploadTaskMapper.findByUploadId(uploadId, tenantId);
        if (task == null) {
            return;
        }

        // 删除已上传的分片
        storageService.abortMultipartUpload(task.getBucketName(), task.getStoragePath(), uploadId);

        // 更新任务状态
        chunkUploadTaskMapper.cancelTask(task.getId());
    }

    @Override
    public List<Integer> getUploadProgress(String uploadId, Long tenantId) {
        ChunkUploadTask task = chunkUploadTaskMapper.findByUploadId(uploadId, tenantId);
        if (task == null) {
            throw new BusinessException("上传任务不存在");
        }
        return parseUploadedIndexes(task.getUploadedIndexes());
    }

    @Override
    public FileInfoVO getFileInfo(Long fileId, Long tenantId) {
        FileInfo fileInfo = fileInfoMapper.selectById(fileId);
        if (fileInfo == null || !fileInfo.getTenantId().equals(tenantId)) {
            throw new BusinessException("文件不存在");
        }
        return FileInfoVO.fromEntity(fileInfo);
    }

    @Override
    public InputStream downloadFile(Long fileId, Long tenantId) {
        FileInfo fileInfo = fileInfoMapper.selectById(fileId);
        if (fileInfo == null || !fileInfo.getTenantId().equals(tenantId)) {
            throw new BusinessException("文件不存在");
        }

        // 增加下载次数
        fileInfoMapper.incrementDownloadCount(fileId);

        return storageService.downloadFile(fileInfo.getBucketName(), fileInfo.getFilePath());
    }

    @Override
    public String getPresignedUrl(Long fileId, Long tenantId, int expiry) {
        FileInfo fileInfo = fileInfoMapper.selectById(fileId);
        if (fileInfo == null || !fileInfo.getTenantId().equals(tenantId)) {
            throw new BusinessException("文件不存在");
        }

        // 增加访问次数
        fileInfoMapper.incrementAccessCount(fileId);

        return storageService.getPresignedUrl(fileInfo.getBucketName(), fileInfo.getFilePath(), expiry);
    }

    @Override
    @Transactional
    public void deleteFile(Long fileId, Long tenantId) {
        FileInfo fileInfo = fileInfoMapper.selectById(fileId);
        if (fileInfo == null || !fileInfo.getTenantId().equals(tenantId)) {
            throw new BusinessException("文件不存在");
        }

        // 标记为已删除
        fileInfo.setStatus(FileInfo.Status.DELETED);
        fileInfo.setDeletedAt(LocalDateTime.now());
        fileInfoMapper.updateById(fileInfo);
    }

    @Override
    @Transactional
    public void deleteFiles(List<Long> fileIds, Long tenantId) {
        for (Long fileId : fileIds) {
            deleteFile(fileId, tenantId);
        }
    }

    @Override
    public List<FileInfoVO> listFiles(String businessType, Long businessId, Long tenantId) {
        LambdaQueryWrapper<FileInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FileInfo::getTenantId, tenantId)
                .eq(FileInfo::getStatus, FileInfo.Status.NORMAL);
        
        if (businessType != null) {
            wrapper.eq(FileInfo::getBusinessType, businessType);
        }
        if (businessId != null) {
            wrapper.eq(FileInfo::getBusinessId, businessId);
        }
        
        wrapper.orderByDesc(FileInfo::getCreateTime);

        return fileInfoMapper.selectList(wrapper).stream()
                .map(FileInfoVO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Async
    public void recordAccess(Long fileId, String accessType, Long userId, String userName,
                             String ip, String userAgent) {
        try {
            FileInfo fileInfo = fileInfoMapper.selectById(fileId);
            if (fileInfo == null) {
                return;
            }

            FileAccessLog log = new FileAccessLog();
            log.setTenantId(fileInfo.getTenantId());
            log.setFileId(fileId);
            log.setAccessType(accessType);
            log.setUserId(userId);
            log.setUserName(userName);
            log.setAccessIp(ip);
            log.setUserAgent(userAgent);
            log.setAccessTime(LocalDateTime.now());
            log.setSuccess(true);

            fileAccessLogMapper.insert(log);
        } catch (Exception e) {
            log.error("记录文件访问失败: fileId={}", fileId, e);
        }
    }

    /**
     * 生成存储路径
     */
    private String generateStoragePath(Long tenantId, String category, String storageName) {
        String datePath = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return String.format("%d/%s/%s/%s", tenantId, category, datePath, storageName);
    }

    /**
     * 获取文件分类
     */
    private String getFileCategory(String mimeType) {
        if (mimeType == null) {
            return FileInfo.Category.OTHER;
        }
        if (mimeType.startsWith("image/")) {
            return FileInfo.Category.IMAGE;
        }
        if (mimeType.startsWith("video/")) {
            return FileInfo.Category.VIDEO;
        }
        if (mimeType.startsWith("audio/")) {
            return FileInfo.Category.AUDIO;
        }
        if (mimeType.contains("pdf") || mimeType.contains("word") || mimeType.contains("excel") 
                || mimeType.contains("powerpoint") || mimeType.contains("text")) {
            return FileInfo.Category.DOCUMENT;
        }
        if (mimeType.contains("zip") || mimeType.contains("rar") || mimeType.contains("tar") 
                || mimeType.contains("gzip")) {
            return FileInfo.Category.ARCHIVE;
        }
        return FileInfo.Category.OTHER;
    }

    /**
     * 解析已上传分片索引
     */
    private List<Integer> parseUploadedIndexes(String indexesJson) {
        try {
            if (indexesJson == null || indexesJson.isEmpty()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(indexesJson, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * 异步生成缩略图
     */
    @Async
    public void generateThumbnailAsync(FileInfo fileInfo, int width, int height) {
        // 缩略图生成逻辑将在ThumbnailService中实现
        log.info("异步生成缩略图: fileId={}, width={}, height={}", fileInfo.getId(), width, height);
    }
}