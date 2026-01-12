package com.mota.file.task;

import com.mota.file.entity.ChunkUploadTask;
import com.mota.file.entity.FileInfo;
import com.mota.file.mapper.ChunkUploadTaskMapper;
import com.mota.file.mapper.FileInfoMapper;
import com.mota.file.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文件清理定时任务
 * 
 * @author mota
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FileCleanupTask {

    private final FileInfoMapper fileInfoMapper;
    private final ChunkUploadTaskMapper chunkUploadTaskMapper;
    private final StorageService storageService;

    /**
     * 已删除文件保留天数
     */
    @Value("${file.cleanup.deleted-retention-days:30}")
    private int deletedRetentionDays;

    /**
     * 每次清理的最大数量
     */
    @Value("${file.cleanup.batch-size:100}")
    private int batchSize;

    /**
     * 清理已删除的文件（每天凌晨2点执行）
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupDeletedFiles() {
        log.info("开始清理已删除文件...");
        
        LocalDateTime beforeTime = LocalDateTime.now().minusDays(deletedRetentionDays);
        int totalCleaned = 0;
        
        try {
            List<FileInfo> deletedFiles;
            do {
                deletedFiles = fileInfoMapper.findDeletedFilesBefore(beforeTime, batchSize);
                
                for (FileInfo fileInfo : deletedFiles) {
                    try {
                        // 删除存储中的文件
                        storageService.deleteFile(fileInfo.getBucketName(), fileInfo.getFilePath());
                        
                        // 删除缩略图
                        if (fileInfo.getThumbnailPath() != null) {
                            try {
                                storageService.deleteFile(fileInfo.getBucketName(), 
                                        extractPath(fileInfo.getThumbnailPath()));
                            } catch (Exception e) {
                                log.warn("删除缩略图失败: {}", fileInfo.getThumbnailPath());
                            }
                        }
                        
                        // 删除预览文件
                        if (fileInfo.getPreviewPath() != null) {
                            try {
                                storageService.deleteFile(fileInfo.getBucketName(),
                                        extractPath(fileInfo.getPreviewPath()));
                            } catch (Exception e) {
                                log.warn("删除预览文件失败: {}", fileInfo.getPreviewPath());
                            }
                        }
                        
                        // 删除数据库记录
                        fileInfoMapper.deleteById(fileInfo.getId());
                        totalCleaned++;
                        
                    } catch (Exception e) {
                        log.error("清理文件失败: fileId={}", fileInfo.getId(), e);
                    }
                }
                
            } while (!deletedFiles.isEmpty());
            
            log.info("已删除文件清理完成，共清理 {} 个文件", totalCleaned);
        } catch (Exception e) {
            log.error("清理已删除文件任务执行失败", e);
        }
    }

    /**
     * 清理过期的分片上传任务（每小时执行）
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void cleanupExpiredChunkTasks() {
        log.info("开始清理过期的分片上传任务...");
        
        int totalCleaned = 0;
        
        try {
            List<ChunkUploadTask> expiredTasks;
            do {
                expiredTasks = chunkUploadTaskMapper.findExpiredTasks(LocalDateTime.now(), batchSize);
                
                for (ChunkUploadTask task : expiredTasks) {
                    try {
                        // 删除已上传的分片
                        storageService.abortMultipartUpload(task.getBucketName(), 
                                task.getStoragePath(), task.getUploadId());
                        
                        // 标记任务为过期
                        chunkUploadTaskMapper.markAsExpired(task.getId());
                        totalCleaned++;
                        
                    } catch (Exception e) {
                        log.error("清理分片上传任务失败: taskId={}", task.getId(), e);
                    }
                }
                
            } while (!expiredTasks.isEmpty());
            
            log.info("过期分片上传任务清理完成，共清理 {} 个任务", totalCleaned);
        } catch (Exception e) {
            log.error("清理过期分片上传任务执行失败", e);
        }
    }

    /**
     * 清理临时文件（每天凌晨3点执行）
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupTempFiles() {
        log.info("开始清理临时文件...");
        
        // TODO: 实现临时文件清理逻辑
        // 1. 列出临时存储桶中的文件
        // 2. 删除超过24小时的临时文件
        
        log.info("临时文件清理完成");
    }

    /**
     * 从URL中提取路径
     */
    private String extractPath(String url) {
        if (url == null) {
            return null;
        }
        // 简单处理，假设URL格式为 http://endpoint/bucket/path
        int lastSlashIndex = url.lastIndexOf('/');
        if (lastSlashIndex > 0) {
            return url.substring(lastSlashIndex + 1);
        }
        return url;
    }
}