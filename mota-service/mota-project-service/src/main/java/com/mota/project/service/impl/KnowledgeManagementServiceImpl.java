package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.knowledge.FileCategory;
import com.mota.project.entity.knowledge.FileTag;
import com.mota.project.entity.knowledge.KnowledgeFile;
import com.mota.project.entity.knowledge.KnowledgeFileTag;
import com.mota.project.mapper.knowledge.FileCategoryMapper;
import com.mota.project.mapper.knowledge.FileTagMapper;
import com.mota.project.mapper.knowledge.KnowledgeFileMapper;
import com.mota.project.mapper.knowledge.KnowledgeFileTagMapper;
import com.mota.project.service.KnowledgeManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 知识管理服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeManagementServiceImpl implements KnowledgeManagementService {

    private final KnowledgeFileMapper knowledgeFileMapper;
    private final FileCategoryMapper fileCategoryMapper;
    private final FileTagMapper fileTagMapper;
    private final KnowledgeFileTagMapper knowledgeFileTagMapper;

    // ========== 文件管理 ==========

    @Override
    public Page<KnowledgeFile> getFiles(Long projectId, Long folderId, String category,
                                         List<String> tags, String keyword, int page, int pageSize) {
        Page<KnowledgeFile> pageParam = new Page<>(page, pageSize);
        
        LambdaQueryWrapper<KnowledgeFile> wrapper = new LambdaQueryWrapper<>();
        
        if (projectId != null) {
            wrapper.eq(KnowledgeFile::getProjectId, projectId);
        }
        if (folderId != null) {
            wrapper.eq(KnowledgeFile::getFolderId, folderId);
        }
        if (StringUtils.hasText(category)) {
            wrapper.eq(KnowledgeFile::getCategory, category);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(KnowledgeFile::getName, keyword)
                    .or().like(KnowledgeFile::getOriginalName, keyword));
        }
        
        wrapper.orderByDesc(KnowledgeFile::getCreatedAt);
        
        Page<KnowledgeFile> result = knowledgeFileMapper.selectPage(pageParam, wrapper);
        
        // 填充标签信息
        for (KnowledgeFile file : result.getRecords()) {
            List<String> fileTags = knowledgeFileMapper.selectTagsByFileId(file.getId());
            file.setTags(fileTags);
        }
        
        return result;
    }

    @Override
    public KnowledgeFile getFileById(Long fileId) {
        KnowledgeFile file = knowledgeFileMapper.selectById(fileId);
        if (file != null) {
            List<String> tags = knowledgeFileMapper.selectTagsByFileId(fileId);
            file.setTags(tags);
        }
        return file;
    }

    @Override
    @Transactional
    public KnowledgeFile createFile(KnowledgeFile file) {
        file.setCreatedAt(LocalDateTime.now());
        file.setUpdatedAt(LocalDateTime.now());
        if (file.getStatus() == null) {
            file.setStatus("completed");
        }
        knowledgeFileMapper.insert(file);
        
        // 更新分类文件数量
        if (StringUtils.hasText(file.getCategory())) {
            fileCategoryMapper.incrementFileCount(file.getCategory());
        }
        
        return file;
    }

    @Override
    @Transactional
    public KnowledgeFile updateFile(Long fileId, KnowledgeFile file) {
        KnowledgeFile existing = knowledgeFileMapper.selectById(fileId);
        if (existing == null) {
            throw new RuntimeException("文件不存在");
        }
        
        // 更新分类文件数量
        if (!existing.getCategory().equals(file.getCategory())) {
            if (StringUtils.hasText(existing.getCategory())) {
                fileCategoryMapper.decrementFileCount(existing.getCategory());
            }
            if (StringUtils.hasText(file.getCategory())) {
                fileCategoryMapper.incrementFileCount(file.getCategory());
            }
        }
        
        file.setId(fileId);
        file.setUpdatedAt(LocalDateTime.now());
        knowledgeFileMapper.updateById(file);
        
        return getFileById(fileId);
    }

    @Override
    @Transactional
    public boolean deleteFile(Long fileId) {
        KnowledgeFile file = knowledgeFileMapper.selectById(fileId);
        if (file == null) {
            return false;
        }
        
        // 删除标签关联
        knowledgeFileTagMapper.deleteByFileId(fileId);
        
        // 更新分类文件数量
        if (StringUtils.hasText(file.getCategory())) {
            fileCategoryMapper.decrementFileCount(file.getCategory());
        }
        
        return knowledgeFileMapper.deleteById(fileId) > 0;
    }

    @Override
    @Transactional
    public int batchDeleteFiles(List<Long> fileIds) {
        int count = 0;
        for (Long fileId : fileIds) {
            if (deleteFile(fileId)) {
                count++;
            }
        }
        return count;
    }

    @Override
    @Transactional
    public KnowledgeFile moveFile(Long fileId, Long folderId) {
        KnowledgeFile file = knowledgeFileMapper.selectById(fileId);
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        
        file.setFolderId(folderId);
        file.setUpdatedAt(LocalDateTime.now());
        knowledgeFileMapper.updateById(file);
        
        return getFileById(fileId);
    }

    @Override
    @Transactional
    public KnowledgeFile setFileCategory(Long fileId, String category) {
        KnowledgeFile file = knowledgeFileMapper.selectById(fileId);
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        
        // 更新分类文件数量
        if (StringUtils.hasText(file.getCategory())) {
            fileCategoryMapper.decrementFileCount(file.getCategory());
        }
        if (StringUtils.hasText(category)) {
            fileCategoryMapper.incrementFileCount(category);
        }
        
        file.setCategory(category);
        file.setUpdatedAt(LocalDateTime.now());
        knowledgeFileMapper.updateById(file);
        
        return getFileById(fileId);
    }

    @Override
    @Transactional
    public KnowledgeFile setFileTags(Long fileId, List<String> tags) {
        KnowledgeFile file = knowledgeFileMapper.selectById(fileId);
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        
        // 删除现有标签关联
        knowledgeFileTagMapper.deleteByFileId(fileId);
        
        // 添加新标签
        for (String tagName : tags) {
            FileTag tag = fileTagMapper.selectByName(tagName);
            if (tag == null) {
                // 创建新标签
                tag = new FileTag();
                tag.setName(tagName);
                tag.setFileCount(0);
                tag.setCreatedAt(LocalDateTime.now());
                fileTagMapper.insert(tag);
            }
            
            // 创建关联
            KnowledgeFileTag fileTag = new KnowledgeFileTag();
            fileTag.setFileId(fileId);
            fileTag.setTagId(tag.getId());
            fileTag.setCreatedAt(LocalDateTime.now());
            knowledgeFileTagMapper.insert(fileTag);
            
            // 更新标签文件数量
            fileTagMapper.incrementFileCount(tag.getId());
        }
        
        return getFileById(fileId);
    }

    @Override
    @Transactional
    public KnowledgeFile addFileTag(Long fileId, String tagName) {
        KnowledgeFile file = knowledgeFileMapper.selectById(fileId);
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        
        FileTag tag = fileTagMapper.selectByName(tagName);
        if (tag == null) {
            // 创建新标签
            tag = new FileTag();
            tag.setName(tagName);
            tag.setFileCount(0);
            tag.setCreatedAt(LocalDateTime.now());
            fileTagMapper.insert(tag);
        }
        
        // 检查是否已存在关联
        LambdaQueryWrapper<KnowledgeFileTag> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(KnowledgeFileTag::getFileId, fileId)
               .eq(KnowledgeFileTag::getTagId, tag.getId());
        if (knowledgeFileTagMapper.selectCount(wrapper) == 0) {
            // 创建关联
            KnowledgeFileTag fileTag = new KnowledgeFileTag();
            fileTag.setFileId(fileId);
            fileTag.setTagId(tag.getId());
            fileTag.setCreatedAt(LocalDateTime.now());
            knowledgeFileTagMapper.insert(fileTag);
            
            // 更新标签文件数量
            fileTagMapper.incrementFileCount(tag.getId());
        }
        
        return getFileById(fileId);
    }

    @Override
    @Transactional
    public KnowledgeFile removeFileTag(Long fileId, String tagName) {
        KnowledgeFile file = knowledgeFileMapper.selectById(fileId);
        if (file == null) {
            throw new RuntimeException("文件不存在");
        }
        
        FileTag tag = fileTagMapper.selectByName(tagName);
        if (tag != null) {
            // 删除关联
            LambdaQueryWrapper<KnowledgeFileTag> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(KnowledgeFileTag::getFileId, fileId)
                   .eq(KnowledgeFileTag::getTagId, tag.getId());
            if (knowledgeFileTagMapper.delete(wrapper) > 0) {
                // 更新标签文件数量
                fileTagMapper.decrementFileCount(tag.getId());
            }
        }
        
        return getFileById(fileId);
    }

    // ========== 分类管理 ==========

    @Override
    public List<FileCategory> getAllCategories() {
        return fileCategoryMapper.selectList(new LambdaQueryWrapper<FileCategory>()
                .orderByAsc(FileCategory::getSortOrder)
                .orderByAsc(FileCategory::getId));
    }

    @Override
    public List<FileCategory> getCategoryTree() {
        List<FileCategory> topCategories = fileCategoryMapper.selectTopCategories();
        for (FileCategory category : topCategories) {
            loadChildren(category);
        }
        return topCategories;
    }

    private void loadChildren(FileCategory parent) {
        List<FileCategory> children = fileCategoryMapper.selectByParentId(parent.getId());
        parent.setChildren(children);
        for (FileCategory child : children) {
            loadChildren(child);
        }
    }

    @Override
    @Transactional
    public FileCategory createCategory(FileCategory category) {
        category.setFileCount(0);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        fileCategoryMapper.insert(category);
        return category;
    }

    @Override
    @Transactional
    public FileCategory updateCategory(Long id, FileCategory category) {
        FileCategory existing = fileCategoryMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("分类不存在");
        }
        
        category.setId(id);
        category.setUpdatedAt(LocalDateTime.now());
        fileCategoryMapper.updateById(category);
        
        return fileCategoryMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean deleteCategory(Long id) {
        // 检查是否有子分类
        List<FileCategory> children = fileCategoryMapper.selectByParentId(id);
        if (!children.isEmpty()) {
            throw new RuntimeException("该分类下有子分类，无法删除");
        }
        
        // 检查是否有文件使用该分类
        FileCategory category = fileCategoryMapper.selectById(id);
        if (category != null && category.getFileCount() > 0) {
            throw new RuntimeException("该分类下有文件，无法删除");
        }
        
        return fileCategoryMapper.deleteById(id) > 0;
    }

    // ========== 标签管理 ==========

    @Override
    public List<FileTag> getAllTags() {
        return fileTagMapper.selectList(new LambdaQueryWrapper<FileTag>()
                .orderByDesc(FileTag::getFileCount)
                .orderByAsc(FileTag::getName));
    }

    @Override
    public List<FileTag> getPopularTags(int limit) {
        return fileTagMapper.selectPopularTags(limit);
    }

    @Override
    @Transactional
    public FileTag createTag(String name, String color) {
        // 检查是否已存在
        FileTag existing = fileTagMapper.selectByName(name);
        if (existing != null) {
            throw new RuntimeException("标签已存在");
        }
        
        FileTag tag = new FileTag();
        tag.setName(name);
        tag.setColor(color);
        tag.setFileCount(0);
        tag.setCreatedAt(LocalDateTime.now());
        fileTagMapper.insert(tag);
        
        return tag;
    }

    @Override
    @Transactional
    public boolean deleteTag(Long id) {
        // 删除所有文件关联
        knowledgeFileTagMapper.deleteByTagId(id);
        
        return fileTagMapper.deleteById(id) > 0;
    }
}