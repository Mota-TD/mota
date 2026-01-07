package com.mota.project.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.knowledge.FileCategory;
import com.mota.project.entity.knowledge.FileTag;
import com.mota.project.entity.knowledge.KnowledgeFile;

import java.util.List;

/**
 * 知识管理服务接口
 */
public interface KnowledgeManagementService {

    // ========== 文件管理 ==========

    /**
     * 分页查询文件列表
     */
    Page<KnowledgeFile> getFiles(Long projectId, Long folderId, String category, 
                                  List<String> tags, String keyword, int page, int pageSize);

    /**
     * 获取文件详情
     */
    KnowledgeFile getFileById(Long fileId);

    /**
     * 创建文件记录
     */
    KnowledgeFile createFile(KnowledgeFile file);

    /**
     * 更新文件信息
     */
    KnowledgeFile updateFile(Long fileId, KnowledgeFile file);

    /**
     * 删除文件
     */
    boolean deleteFile(Long fileId);

    /**
     * 批量删除文件
     */
    int batchDeleteFiles(List<Long> fileIds);

    /**
     * 移动文件到文件夹
     */
    KnowledgeFile moveFile(Long fileId, Long folderId);

    /**
     * 设置文件分类
     */
    KnowledgeFile setFileCategory(Long fileId, String category);

    /**
     * 设置文件标签
     */
    KnowledgeFile setFileTags(Long fileId, List<String> tags);

    /**
     * 添加文件标签
     */
    KnowledgeFile addFileTag(Long fileId, String tag);

    /**
     * 移除文件标签
     */
    KnowledgeFile removeFileTag(Long fileId, String tag);

    // ========== 分类管理 ==========

    /**
     * 获取所有分类
     */
    List<FileCategory> getAllCategories();

    /**
     * 获取分类树
     */
    List<FileCategory> getCategoryTree();

    /**
     * 创建分类
     */
    FileCategory createCategory(FileCategory category);

    /**
     * 更新分类
     */
    FileCategory updateCategory(Long id, FileCategory category);

    /**
     * 删除分类
     */
    boolean deleteCategory(Long id);

    // ========== 标签管理 ==========

    /**
     * 获取所有标签
     */
    List<FileTag> getAllTags();

    /**
     * 获取热门标签
     */
    List<FileTag> getPopularTags(int limit);

    /**
     * 创建标签
     */
    FileTag createTag(String name, String color);

    /**
     * 删除标签
     */
    boolean deleteTag(Long id);
}