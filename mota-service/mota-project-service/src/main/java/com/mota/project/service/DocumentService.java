package com.mota.project.service;

import com.mota.project.entity.Document;
import com.mota.project.entity.DocumentAccessLog;
import com.mota.project.entity.DocumentCollaborator;
import com.mota.project.entity.DocumentFavorite;
import com.mota.project.entity.DocumentVersion;

import java.util.List;
import java.util.Map;

/**
 * 文档服务接口
 */
public interface DocumentService {

    // ========== 文档CRUD ==========

    /**
     * 创建文档
     */
    Document createDocument(Document document);

    /**
     * 更新文档
     */
    Document updateDocument(Long id, Document document);

    /**
     * 删除文档
     */
    boolean deleteDocument(Long id);

    /**
     * 获取文档详情
     */
    Document getDocumentById(Long id);

    /**
     * 获取文档详情（包含协作者和版本信息）
     */
    Document getDocumentWithDetails(Long id);

    /**
     * 获取项目文档列表
     */
    List<Document> getProjectDocuments(Long projectId, Long folderId, String status);

    /**
     * 获取用户创建的文档
     */
    List<Document> getUserDocuments(Long userId, String status, int page, int pageSize);

    /**
     * 搜索文档
     */
    List<Document> searchDocuments(String keyword, Long projectId, Long userId, int page, int pageSize);

    // ========== 文档发布 ==========

    /**
     * 发布文档
     */
    Document publishDocument(Long id);

    /**
     * 归档文档
     */
    Document archiveDocument(Long id);

    /**
     * 恢复文档
     */
    Document restoreDocument(Long id);

    // ========== 版本管理 ==========

    /**
     * 保存新版本
     */
    DocumentVersion saveVersion(Long documentId, Long editorId, String editorName, 
                                 String content, String changeSummary, String versionType);

    /**
     * 获取文档版本列表
     */
    List<DocumentVersion> getDocumentVersions(Long documentId);

    /**
     * 获取指定版本
     */
    DocumentVersion getVersion(Long documentId, Integer versionNumber);

    /**
     * 回滚到指定版本
     */
    Document rollbackToVersion(Long documentId, Integer versionNumber, Long operatorId);

    /**
     * 比较两个版本
     */
    Map<String, Object> compareVersions(Long documentId, Integer version1, Integer version2);

    // ========== 协作管理 ==========

    /**
     * 添加协作者
     */
    DocumentCollaborator addCollaborator(Long documentId, Long userId, String permission);

    /**
     * 移除协作者
     */
    boolean removeCollaborator(Long documentId, Long userId);

    /**
     * 更新协作者权限
     */
    DocumentCollaborator updateCollaboratorPermission(Long documentId, Long userId, String permission);

    /**
     * 获取文档协作者列表
     */
    List<DocumentCollaborator> getDocumentCollaborators(Long documentId);

    /**
     * 检查用户是否有权限
     */
    boolean hasPermission(Long documentId, Long userId, String requiredPermission);

    /**
     * 更新协作者在线状态
     */
    void updateCollaboratorOnlineStatus(Long documentId, Long userId, boolean isOnline, Integer cursorPosition);

    /**
     * 获取在线协作者
     */
    List<DocumentCollaborator> getOnlineCollaborators(Long documentId);

    // ========== 模板管理 ==========

    /**
     * 获取文档模板列表
     */
    List<Document> getDocumentTemplates(String category);

    /**
     * 从模板创建文档
     */
    Document createFromTemplate(Long templateId, Long projectId, Long creatorId, String title);

    /**
     * 保存为模板
     */
    Document saveAsTemplate(Long documentId, String category);

    // ========== 统计 ==========

    /**
     * 增加浏览次数
     */
    void incrementViewCount(Long documentId);

    /**
     * 点赞/取消点赞
     */
    boolean toggleLike(Long documentId, Long userId);

    /**
     * 获取文档统计信息
     */
    Map<String, Object> getDocumentStats(Long documentId);

    // ========== 收藏夹功能 ==========

    /**
     * 添加收藏
     */
    DocumentFavorite addFavorite(Long userId, Long documentId, String folderName, String note);

    /**
     * 取消收藏
     */
    boolean removeFavorite(Long userId, Long documentId);

    /**
     * 检查是否已收藏
     */
    boolean isFavorited(Long userId, Long documentId);

    /**
     * 获取用户收藏列表
     */
    List<DocumentFavorite> getUserFavorites(Long userId, int page, int pageSize);

    /**
     * 获取用户收藏列表（按收藏夹分类）
     */
    List<DocumentFavorite> getUserFavoritesByFolder(Long userId, String folderName);

    /**
     * 获取用户的收藏夹分类列表
     */
    List<Map<String, Object>> getUserFavoriteFolders(Long userId);

    /**
     * 更新收藏夹分类
     */
    boolean updateFavoriteFolder(Long userId, Long documentId, String folderName);

    /**
     * 批量删除收藏
     */
    boolean batchRemoveFavorites(Long userId, List<Long> documentIds);

    // ========== 最近访问功能 ==========

    /**
     * 记录访问
     */
    void recordAccess(Long userId, Long documentId, String accessType);

    /**
     * 获取最近访问的文档
     */
    List<DocumentAccessLog> getRecentAccess(Long userId, int limit);

    /**
     * 清除访问记录
     */
    boolean clearAccessHistory(Long userId);

    // ========== 导出功能 ==========

    /**
     * 导出为PDF
     */
    byte[] exportToPdf(Long documentId);

    /**
     * 导出为Word
     */
    byte[] exportToWord(Long documentId);

    /**
     * 导出为Markdown
     */
    String exportToMarkdown(Long documentId);

    /**
     * 导出为HTML
     */
    String exportToHtml(Long documentId);
}