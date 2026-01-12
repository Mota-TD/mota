package com.mota.collab.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.collab.entity.Document;

import java.util.List;

/**
 * 文档服务接口
 */
public interface DocumentService {

    /**
     * 创建文档
     */
    Document createDocument(Document document);

    /**
     * 创建文件夹
     */
    Document createFolder(Long parentId, String title, Long projectId);

    /**
     * 更新文档
     */
    Document updateDocument(Document document);

    /**
     * 更新文档内容
     */
    Document updateContent(Long documentId, String content, String plainText);

    /**
     * 获取文档详情
     */
    Document getById(Long documentId);

    /**
     * 删除文档
     */
    void deleteDocument(Long documentId);

    /**
     * 批量删除文档
     */
    void batchDelete(List<Long> documentIds);

    /**
     * 移动文档到指定文件夹
     */
    void moveDocument(Long documentId, Long targetFolderId);

    /**
     * 复制文档
     */
    Document copyDocument(Long documentId, Long targetFolderId);

    /**
     * 获取文件夹下的文档列表
     */
    List<Document> listByParentId(Long parentId);

    /**
     * 获取项目下的文档列表
     */
    List<Document> listByProjectId(Long projectId);

    /**
     * 获取用户收藏的文档
     */
    List<Document> listFavorites(Long userId);

    /**
     * 获取用户最近访问的文档
     */
    List<Document> listRecentDocuments(Long userId, int limit);

    /**
     * 搜索文档
     */
    IPage<Document> searchDocuments(Page<Document> page, String keyword, Long projectId, String docType);

    /**
     * 获取文档路径（面包屑）
     */
    List<Document> getDocumentPath(Long documentId);

    /**
     * 收藏/取消收藏文档
     */
    void toggleFavorite(Long documentId, boolean favorite);

    /**
     * 置顶/取消置顶文档
     */
    void togglePinned(Long documentId, boolean pinned);

    /**
     * 锁定文档
     */
    void lockDocument(Long documentId, Long userId);

    /**
     * 解锁文档
     */
    void unlockDocument(Long documentId);

    /**
     * 归档文档
     */
    void archiveDocument(Long documentId);

    /**
     * 发布文档
     */
    void publishDocument(Long documentId);

    /**
     * 增加访问次数
     */
    void incrementViewCount(Long documentId);

    /**
     * 更新排序
     */
    void updateSortOrder(Long documentId, Integer sortOrder);
}