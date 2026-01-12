package com.mota.collab.service;

import com.mota.collab.entity.DocumentVersion;

import java.util.List;

/**
 * 文档版本服务接口
 */
public interface DocumentVersionService {

    /**
     * 创建版本（自动保存）
     */
    DocumentVersion createAutoVersion(Long documentId, String content, String plainText);

    /**
     * 创建版本（手动保存）
     */
    DocumentVersion createManualVersion(Long documentId, String content, String plainText, String changeSummary);

    /**
     * 获取版本详情
     */
    DocumentVersion getById(Long versionId);

    /**
     * 获取文档的版本历史
     */
    List<DocumentVersion> listVersions(Long documentId);

    /**
     * 获取文档的主要版本列表
     */
    List<DocumentVersion> listMajorVersions(Long documentId);

    /**
     * 获取文档的最新版本
     */
    DocumentVersion getLatestVersion(Long documentId);

    /**
     * 获取指定版本号的版本
     */
    DocumentVersion getByVersionNumber(Long documentId, Integer versionNumber);

    /**
     * 回滚到指定版本
     */
    DocumentVersion rollbackToVersion(Long documentId, Long versionId);

    /**
     * 比较两个版本的差异
     */
    String compareVersions(Long versionId1, Long versionId2);

    /**
     * 删除版本
     */
    void deleteVersion(Long versionId);

    /**
     * 清理旧版本（保留最近N个版本）
     */
    void cleanupOldVersions(Long documentId, int keepCount);
}