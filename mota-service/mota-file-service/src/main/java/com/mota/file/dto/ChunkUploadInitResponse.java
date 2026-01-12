package com.mota.file.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 分片上传初始化响应
 * 
 * @author mota
 */
@Data
public class ChunkUploadInitResponse {

    /**
     * 上传ID
     */
    private String uploadId;

    /**
     * 是否秒传成功
     */
    private Boolean instantUpload = false;

    /**
     * 秒传成功时的文件信息
     */
    private FileInfoVO fileInfo;

    /**
     * 是否断点续传
     */
    private Boolean resumeUpload = false;

    /**
     * 已上传的分片索引列表
     */
    private List<Integer> uploadedChunks;

    /**
     * 总分片数
     */
    private Integer totalChunks;

    /**
     * 分片大小
     */
    private Long chunkSize;

    /**
     * 过期时间
     */
    private LocalDateTime expireTime;

    /**
     * 上传URL（用于直传到存储）
     */
    private String uploadUrl;

    /**
     * 创建秒传成功响应
     */
    public static ChunkUploadInitResponse instantUpload(FileInfoVO fileInfo) {
        ChunkUploadInitResponse response = new ChunkUploadInitResponse();
        response.setInstantUpload(true);
        response.setFileInfo(fileInfo);
        return response;
    }

    /**
     * 创建断点续传响应
     */
    public static ChunkUploadInitResponse resumeUpload(String uploadId, List<Integer> uploadedChunks,
                                                        Integer totalChunks, Long chunkSize, LocalDateTime expireTime) {
        ChunkUploadInitResponse response = new ChunkUploadInitResponse();
        response.setUploadId(uploadId);
        response.setResumeUpload(true);
        response.setUploadedChunks(uploadedChunks);
        response.setTotalChunks(totalChunks);
        response.setChunkSize(chunkSize);
        response.setExpireTime(expireTime);
        return response;
    }

    /**
     * 创建新上传响应
     */
    public static ChunkUploadInitResponse newUpload(String uploadId, Integer totalChunks, 
                                                     Long chunkSize, LocalDateTime expireTime) {
        ChunkUploadInitResponse response = new ChunkUploadInitResponse();
        response.setUploadId(uploadId);
        response.setTotalChunks(totalChunks);
        response.setChunkSize(chunkSize);
        response.setExpireTime(expireTime);
        return response;
    }
}