package com.mota.file.service;

import com.mota.file.dto.*;
import com.mota.file.entity.FileInfo;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

/**
 * 文件服务接口
 * 
 * @author mota
 */
public interface FileService {

    /**
     * 上传文件
     *
     * @param file 文件
     * @param request 上传请求
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param userName 用户名
     * @return 文件信息
     */
    FileInfoVO uploadFile(MultipartFile file, FileUploadRequest request, 
                          Long tenantId, Long userId, String userName);

    /**
     * 批量上传文件
     *
     * @param files 文件列表
     * @param request 上传请求
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param userName 用户名
     * @return 文件信息列表
     */
    List<FileInfoVO> uploadFiles(List<MultipartFile> files, FileUploadRequest request,
                                  Long tenantId, Long userId, String userName);

    /**
     * 秒传检查
     *
     * @param md5Hash 文件MD5
     * @param tenantId 租户ID
     * @return 如果存在返回文件信息，否则返回null
     */
    FileInfoVO checkInstantUpload(String md5Hash, Long tenantId);

    /**
     * 初始化分片上传
     *
     * @param request 初始化请求
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @return 初始化响应
     */
    ChunkUploadInitResponse initChunkUpload(ChunkUploadInitRequest request, 
                                             Long tenantId, Long userId);

    /**
     * 上传分片
     *
     * @param uploadId 上传ID
     * @param chunkIndex 分片索引
     * @param file 分片文件
     * @param tenantId 租户ID
     * @return 是否成功
     */
    boolean uploadChunk(String uploadId, int chunkIndex, MultipartFile file, Long tenantId);

    /**
     * 完成分片上传
     *
     * @param uploadId 上传ID
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param userName 用户名
     * @return 文件信息
     */
    FileInfoVO completeChunkUpload(String uploadId, Long tenantId, Long userId, String userName);

    /**
     * 取消分片上传
     *
     * @param uploadId 上传ID
     * @param tenantId 租户ID
     */
    void cancelChunkUpload(String uploadId, Long tenantId);

    /**
     * 获取分片上传进度
     *
     * @param uploadId 上传ID
     * @param tenantId 租户ID
     * @return 已上传的分片索引列表
     */
    List<Integer> getUploadProgress(String uploadId, Long tenantId);

    /**
     * 获取文件信息
     *
     * @param fileId 文件ID
     * @param tenantId 租户ID
     * @return 文件信息
     */
    FileInfoVO getFileInfo(Long fileId, Long tenantId);

    /**
     * 获取文件下载流
     *
     * @param fileId 文件ID
     * @param tenantId 租户ID
     * @return 输入流
     */
    InputStream downloadFile(Long fileId, Long tenantId);

    /**
     * 获取文件预签名URL
     *
     * @param fileId 文件ID
     * @param tenantId 租户ID
     * @param expiry 过期时间（秒）
     * @return 预签名URL
     */
    String getPresignedUrl(Long fileId, Long tenantId, int expiry);

    /**
     * 删除文件
     *
     * @param fileId 文件ID
     * @param tenantId 租户ID
     */
    void deleteFile(Long fileId, Long tenantId);

    /**
     * 批量删除文件
     *
     * @param fileIds 文件ID列表
     * @param tenantId 租户ID
     */
    void deleteFiles(List<Long> fileIds, Long tenantId);

    /**
     * 查询文件列表
     *
     * @param businessType 业务类型
     * @param businessId 业务ID
     * @param tenantId 租户ID
     * @return 文件列表
     */
    List<FileInfoVO> listFiles(String businessType, Long businessId, Long tenantId);

    /**
     * 记录文件访问
     *
     * @param fileId 文件ID
     * @param accessType 访问类型
     * @param userId 用户ID
     * @param userName 用户名
     * @param ip IP地址
     * @param userAgent 用户代理
     */
    void recordAccess(Long fileId, String accessType, Long userId, String userName, 
                      String ip, String userAgent);
}