package com.mota.knowledge.service;

import com.mota.knowledge.entity.ChunkUpload;

import java.util.List;
import java.util.Map;

/**
 * 分片上传服务接口
 */
public interface ChunkUploadService {

    /**
     * 初始化分片上传
     * @param fileName 文件名
     * @param fileSize 文件大小
     * @param totalChunks 总分片数
     * @param md5Hash 文件MD5
     * @return 上传ID和已上传的分片信息
     */
    Map<String, Object> initUpload(String fileName, Long fileSize, Integer totalChunks, String md5Hash);

    /**
     * 上传分片
     * @param uploadId 上传ID
     * @param chunkIndex 分片索引
     * @param chunkData 分片数据
     * @param chunkMd5 分片MD5
     * @return 上传结果
     */
    ChunkUpload uploadChunk(String uploadId, Integer chunkIndex, byte[] chunkData, String chunkMd5);

    /**
     * 获取上传进度
     * @param uploadId 上传ID
     * @return 上传进度信息
     */
    Map<String, Object> getUploadProgress(String uploadId);

    /**
     * 获取已上传的分片列表
     * @param uploadId 上传ID
     * @return 已上传的分片索引列表
     */
    List<Integer> getUploadedChunks(String uploadId);

    /**
     * 合并分片
     * @param uploadId 上传ID
     * @param projectId 项目ID
     * @param parentId 父文件夹ID
     * @return 合并后的文件ID
     */
    Long mergeChunks(String uploadId, Long projectId, Long parentId);

    /**
     * 取消上传
     * @param uploadId 上传ID
     */
    void cancelUpload(String uploadId);

    /**
     * 清理过期的上传任务
     * @param expireHours 过期时间（小时）
     */
    void cleanExpiredUploads(Integer expireHours);

    /**
     * 秒传检查（根据MD5检查文件是否已存在）
     * @param md5Hash 文件MD5
     * @return 如果文件已存在，返回文件ID；否则返回null
     */
    Long checkInstantUpload(String md5Hash);
}