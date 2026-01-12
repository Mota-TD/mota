package com.mota.knowledge.service;

import com.mota.knowledge.entity.FileVersion;

import java.util.List;

/**
 * 文件版本服务接口
 */
public interface FileVersionService {

    /**
     * 创建新版本
     */
    FileVersion createVersion(Long fileId, String changeDescription);

    /**
     * 获取文件的所有版本
     */
    List<FileVersion> getFileVersions(Long fileId);

    /**
     * 获取指定版本
     */
    FileVersion getVersion(Long versionId);

    /**
     * 获取文件的最新版本
     */
    FileVersion getLatestVersion(Long fileId);

    /**
     * 获取指定版本号的版本
     */
    FileVersion getVersionByNumber(Long fileId, Integer versionNumber);

    /**
     * 回滚到指定版本
     */
    FileVersion rollbackToVersion(Long fileId, Long versionId);

    /**
     * 比较两个版本
     */
    Object compareVersions(Long versionId1, Long versionId2);

    /**
     * 删除版本
     */
    void deleteVersion(Long versionId);

    /**
     * 清理旧版本（保留最近N个版本）
     */
    void cleanOldVersions(Long fileId, Integer keepCount);
}