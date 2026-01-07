package com.mota.knowledge.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.knowledge.entity.KnowledgeFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 知识文件服务接口
 */
public interface KnowledgeFileService {

    /**
     * 上传文件
     */
    KnowledgeFile uploadFile(Long enterpriseId, Long projectId, Long parentId, MultipartFile file, Long userId);

    /**
     * 创建文件夹
     */
    KnowledgeFile createFolder(Long enterpriseId, Long projectId, Long parentId, String name, Long userId);

    /**
     * 获取文件列表
     */
    IPage<KnowledgeFile> getFileList(Long enterpriseId, Long projectId, Long parentId, int page, int size);

    /**
     * 获取文件详情
     */
    KnowledgeFile getFileById(Long id);

    /**
     * 更新文件
     */
    void updateFile(Long id, String name, String content);

    /**
     * 删除文件
     */
    void deleteFile(Long id);

    /**
     * 移动文件
     */
    void moveFile(Long id, Long targetFolderId);

    /**
     * 复制文件
     */
    KnowledgeFile copyFile(Long id, Long targetFolderId);

    /**
     * 搜索文件
     */
    IPage<KnowledgeFile> searchFiles(Long enterpriseId, String keyword, int page, int size);

    /**
     * 获取最近文件
     */
    List<KnowledgeFile> getRecentFiles(Long userId, int limit);

    /**
     * 获取文件下载URL
     */
    String getDownloadUrl(Long id);
}