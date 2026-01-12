package com.mota.file.service;

import java.io.InputStream;
import java.util.List;

/**
 * 存储服务接口
 * 
 * @author mota
 */
public interface StorageService {

    /**
     * 上传文件
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @param inputStream 输入流
     * @param contentType 内容类型
     * @param size 文件大小
     * @return 文件URL
     */
    String uploadFile(String bucketName, String objectName, InputStream inputStream, 
                      String contentType, long size);

    /**
     * 上传分片
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @param uploadId 上传ID
     * @param partNumber 分片编号
     * @param inputStream 输入流
     * @param size 分片大小
     * @return 分片ETag
     */
    String uploadPart(String bucketName, String objectName, String uploadId, 
                      int partNumber, InputStream inputStream, long size);

    /**
     * 初始化分片上传
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @param contentType 内容类型
     * @return 上传ID
     */
    String initiateMultipartUpload(String bucketName, String objectName, String contentType);

    /**
     * 完成分片上传
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @param uploadId 上传ID
     * @param partETags 分片ETag列表
     * @return 文件URL
     */
    String completeMultipartUpload(String bucketName, String objectName, String uploadId, 
                                    List<String> partETags);

    /**
     * 取消分片上传
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @param uploadId 上传ID
     */
    void abortMultipartUpload(String bucketName, String objectName, String uploadId);

    /**
     * 下载文件
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @return 输入流
     */
    InputStream downloadFile(String bucketName, String objectName);

    /**
     * 删除文件
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     */
    void deleteFile(String bucketName, String objectName);

    /**
     * 批量删除文件
     *
     * @param bucketName 存储桶名称
     * @param objectNames 对象名称列表
     */
    void deleteFiles(String bucketName, List<String> objectNames);

    /**
     * 检查文件是否存在
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @return 是否存在
     */
    boolean fileExists(String bucketName, String objectName);

    /**
     * 获取文件URL
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @return 文件URL
     */
    String getFileUrl(String bucketName, String objectName);

    /**
     * 获取预签名URL（用于临时访问）
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @param expiry 过期时间（秒）
     * @return 预签名URL
     */
    String getPresignedUrl(String bucketName, String objectName, int expiry);

    /**
     * 获取预签名上传URL
     *
     * @param bucketName 存储桶名称
     * @param objectName 对象名称
     * @param expiry 过期时间（秒）
     * @return 预签名上传URL
     */
    String getPresignedUploadUrl(String bucketName, String objectName, int expiry);

    /**
     * 复制文件
     *
     * @param sourceBucket 源存储桶
     * @param sourceObject 源对象名称
     * @param destBucket 目标存储桶
     * @param destObject 目标对象名称
     */
    void copyFile(String sourceBucket, String sourceObject, String destBucket, String destObject);

    /**
     * 确保存储桶存在
     *
     * @param bucketName 存储桶名称
     */
    void ensureBucketExists(String bucketName);
}