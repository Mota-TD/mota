package com.mota.file.service.impl;

import com.mota.file.config.MinioConfig;
import com.mota.file.service.StorageService;
import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * MinIO存储服务实现
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageServiceImpl implements StorageService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @Override
    public String uploadFile(String bucketName, String objectName, InputStream inputStream,
                             String contentType, long size) {
        try {
            ensureBucketExists(bucketName);
            
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(inputStream, size, -1)
                    .contentType(contentType)
                    .build());
            
            return getFileUrl(bucketName, objectName);
        } catch (Exception e) {
            log.error("上传文件失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("上传文件失败", e);
        }
    }

    @Override
    public String uploadPart(String bucketName, String objectName, String uploadId,
                             int partNumber, InputStream inputStream, long size) {
        // MinIO的分片上传需要使用特殊的API
        // 这里简化处理，实际应使用MinIO的分片上传API
        try {
            String partObjectName = objectName + ".part" + partNumber;
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(partObjectName)
                    .stream(inputStream, size, -1)
                    .build());
            return partObjectName;
        } catch (Exception e) {
            log.error("上传分片失败: bucket={}, object={}, part={}", bucketName, objectName, partNumber, e);
            throw new RuntimeException("上传分片失败", e);
        }
    }

    @Override
    public String initiateMultipartUpload(String bucketName, String objectName, String contentType) {
        // MinIO使用不同的分片上传机制
        // 返回一个唯一标识符作为uploadId
        return java.util.UUID.randomUUID().toString();
    }

    @Override
    public String completeMultipartUpload(String bucketName, String objectName, String uploadId,
                                          List<String> partETags) {
        try {
            // 合并所有分片
            List<ComposeSource> sources = partETags.stream()
                    .map(partName -> ComposeSource.builder()
                            .bucket(bucketName)
                            .object(partName)
                            .build())
                    .collect(Collectors.toList());

            minioClient.composeObject(ComposeObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .sources(sources)
                    .build());

            // 删除分片文件
            deleteFiles(bucketName, partETags);

            return getFileUrl(bucketName, objectName);
        } catch (Exception e) {
            log.error("完成分片上传失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("完成分片上传失败", e);
        }
    }

    @Override
    public void abortMultipartUpload(String bucketName, String objectName, String uploadId) {
        // 删除已上传的分片
        try {
            // 列出并删除所有分片
            Iterable<io.minio.Result<io.minio.messages.Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucketName)
                            .prefix(objectName + ".part")
                            .build());
            
            List<String> partNames = new ArrayList<>();
            for (io.minio.Result<io.minio.messages.Item> result : results) {
                partNames.add(result.get().objectName());
            }
            
            if (!partNames.isEmpty()) {
                deleteFiles(bucketName, partNames);
            }
        } catch (Exception e) {
            log.error("取消分片上传失败: bucket={}, object={}", bucketName, objectName, e);
        }
    }

    @Override
    public InputStream downloadFile(String bucketName, String objectName) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.error("下载文件失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("下载文件失败", e);
        }
    }

    @Override
    public void deleteFile(String bucketName, String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.error("删除文件失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("删除文件失败", e);
        }
    }

    @Override
    public void deleteFiles(String bucketName, List<String> objectNames) {
        try {
            List<DeleteObject> objects = objectNames.stream()
                    .map(DeleteObject::new)
                    .collect(Collectors.toList());

            Iterable<Result<DeleteError>> results = minioClient.removeObjects(
                    RemoveObjectsArgs.builder()
                            .bucket(bucketName)
                            .objects(objects)
                            .build());

            for (Result<DeleteError> result : results) {
                DeleteError error = result.get();
                log.error("删除文件失败: {}", error.objectName());
            }
        } catch (Exception e) {
            log.error("批量删除文件失败: bucket={}", bucketName, e);
            throw new RuntimeException("批量删除文件失败", e);
        }
    }

    @Override
    public boolean fileExists(String bucketName, String objectName) {
        try {
            minioClient.statObject(StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getFileUrl(String bucketName, String objectName) {
        return minioConfig.getEndpoint() + "/" + bucketName + "/" + objectName;
    }

    @Override
    public String getPresignedUrl(String bucketName, String objectName, int expiry) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(objectName)
                    .expiry(expiry, TimeUnit.SECONDS)
                    .build());
        } catch (Exception e) {
            log.error("获取预签名URL失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("获取预签名URL失败", e);
        }
    }

    @Override
    public String getPresignedUploadUrl(String bucketName, String objectName, int expiry) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.PUT)
                    .bucket(bucketName)
                    .object(objectName)
                    .expiry(expiry, TimeUnit.SECONDS)
                    .build());
        } catch (Exception e) {
            log.error("获取预签名上传URL失败: bucket={}, object={}", bucketName, objectName, e);
            throw new RuntimeException("获取预签名上传URL失败", e);
        }
    }

    @Override
    public void copyFile(String sourceBucket, String sourceObject, String destBucket, String destObject) {
        try {
            minioClient.copyObject(CopyObjectArgs.builder()
                    .bucket(destBucket)
                    .object(destObject)
                    .source(CopySource.builder()
                            .bucket(sourceBucket)
                            .object(sourceObject)
                            .build())
                    .build());
        } catch (Exception e) {
            log.error("复制文件失败: from {}/{} to {}/{}", sourceBucket, sourceObject, destBucket, destObject, e);
            throw new RuntimeException("复制文件失败", e);
        }
    }

    @Override
    public void ensureBucketExists(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(bucketName)
                    .build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(bucketName)
                        .build());
                log.info("创建存储桶: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("确保存储桶存在失败: {}", bucketName, e);
            throw new RuntimeException("确保存储桶存在失败", e);
        }
    }
}