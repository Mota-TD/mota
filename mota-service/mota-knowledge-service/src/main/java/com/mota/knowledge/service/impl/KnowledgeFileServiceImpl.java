package com.mota.knowledge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.knowledge.entity.KnowledgeFile;
import com.mota.knowledge.mapper.KnowledgeFileMapper;
import com.mota.knowledge.service.KnowledgeFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 知识文件服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeFileServiceImpl implements KnowledgeFileService {

    private final KnowledgeFileMapper fileMapper;

    @Override
    @Transactional
    public KnowledgeFile uploadFile(Long enterpriseId, Long projectId, Long parentId, 
                                     MultipartFile file, Long userId) {
        KnowledgeFile knowledgeFile = new KnowledgeFile();
        knowledgeFile.setEnterpriseId(enterpriseId);
        knowledgeFile.setProjectId(projectId);
        knowledgeFile.setParentId(parentId);
        knowledgeFile.setName(file.getOriginalFilename());
        knowledgeFile.setType("file");
        knowledgeFile.setFileType(getFileExtension(file.getOriginalFilename()));
        knowledgeFile.setFileSize(file.getSize());
        knowledgeFile.setVersion(1);
        knowledgeFile.setStatus("published");
        knowledgeFile.setCreatedBy(userId);
        knowledgeFile.setCreatedAt(LocalDateTime.now());
        knowledgeFile.setUpdatedAt(LocalDateTime.now());
        knowledgeFile.setDeleted(0);
        
        // TODO: 实际文件存储逻辑（MinIO/OSS）
        String filePath = "/files/" + UUID.randomUUID() + "/" + file.getOriginalFilename();
        knowledgeFile.setFilePath(filePath);
        
        fileMapper.insert(knowledgeFile);
        return knowledgeFile;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    @Override
    @Transactional
    public KnowledgeFile createFolder(Long enterpriseId, Long projectId, Long parentId, 
                                       String name, Long userId) {
        KnowledgeFile folder = new KnowledgeFile();
        folder.setEnterpriseId(enterpriseId);
        folder.setProjectId(projectId);
        folder.setParentId(parentId);
        folder.setName(name);
        folder.setType("folder");
        folder.setStatus("published");
        folder.setCreatedBy(userId);
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());
        folder.setDeleted(0);
        
        fileMapper.insert(folder);
        return folder;
    }

    @Override
    public IPage<KnowledgeFile> getFileList(Long enterpriseId, Long projectId, Long parentId, 
                                             int page, int size) {
        Page<KnowledgeFile> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<KnowledgeFile> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(KnowledgeFile::getEnterpriseId, enterpriseId)
               .eq(KnowledgeFile::getDeleted, 0);
        
        if (projectId != null) {
            wrapper.eq(KnowledgeFile::getProjectId, projectId);
        }
        if (parentId != null) {
            wrapper.eq(KnowledgeFile::getParentId, parentId);
        } else {
            wrapper.isNull(KnowledgeFile::getParentId);
        }
        
        // 文件夹排在前面
        wrapper.orderByDesc(KnowledgeFile::getType)
               .orderByDesc(KnowledgeFile::getUpdatedAt);
        
        return fileMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public KnowledgeFile getFileById(Long id) {
        return fileMapper.selectById(id);
    }

    @Override
    @Transactional
    public void updateFile(Long id, String name, String content) {
        KnowledgeFile file = fileMapper.selectById(id);
        if (file != null) {
            if (name != null) {
                file.setName(name);
            }
            if (content != null) {
                file.setContent(content);
                file.setVersion(file.getVersion() + 1);
            }
            file.setUpdatedAt(LocalDateTime.now());
            fileMapper.updateById(file);
        }
    }

    @Override
    @Transactional
    public void deleteFile(Long id) {
        KnowledgeFile file = fileMapper.selectById(id);
        if (file != null) {
            file.setDeleted(1);
            file.setUpdatedAt(LocalDateTime.now());
            fileMapper.updateById(file);
        }
    }

    @Override
    @Transactional
    public void moveFile(Long id, Long targetFolderId) {
        KnowledgeFile file = fileMapper.selectById(id);
        if (file != null) {
            file.setParentId(targetFolderId);
            file.setUpdatedAt(LocalDateTime.now());
            fileMapper.updateById(file);
        }
    }

    @Override
    @Transactional
    public KnowledgeFile copyFile(Long id, Long targetFolderId) {
        KnowledgeFile source = fileMapper.selectById(id);
        if (source == null) {
            return null;
        }
        
        KnowledgeFile copy = new KnowledgeFile();
        copy.setEnterpriseId(source.getEnterpriseId());
        copy.setProjectId(source.getProjectId());
        copy.setParentId(targetFolderId);
        copy.setName(source.getName() + " (副本)");
        copy.setType(source.getType());
        copy.setFileType(source.getFileType());
        copy.setFileSize(source.getFileSize());
        copy.setFilePath(source.getFilePath());
        copy.setContent(source.getContent());
        copy.setVersion(1);
        copy.setStatus("published");
        copy.setCreatedBy(source.getCreatedBy());
        copy.setCreatedAt(LocalDateTime.now());
        copy.setUpdatedAt(LocalDateTime.now());
        copy.setDeleted(0);
        
        fileMapper.insert(copy);
        return copy;
    }

    @Override
    public IPage<KnowledgeFile> searchFiles(Long enterpriseId, String keyword, int page, int size) {
        Page<KnowledgeFile> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<KnowledgeFile> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(KnowledgeFile::getEnterpriseId, enterpriseId)
               .eq(KnowledgeFile::getDeleted, 0)
               .and(w -> w.like(KnowledgeFile::getName, keyword)
                         .or()
                         .like(KnowledgeFile::getContent, keyword))
               .orderByDesc(KnowledgeFile::getUpdatedAt);
        
        return fileMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public List<KnowledgeFile> getRecentFiles(Long userId, int limit) {
        LambdaQueryWrapper<KnowledgeFile> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(KnowledgeFile::getCreatedBy, userId)
               .eq(KnowledgeFile::getDeleted, 0)
               .eq(KnowledgeFile::getType, "file")
               .orderByDesc(KnowledgeFile::getUpdatedAt)
               .last("LIMIT " + limit);
        
        return fileMapper.selectList(wrapper);
    }

    @Override
    public String getDownloadUrl(Long id) {
        KnowledgeFile file = fileMapper.selectById(id);
        if (file == null || file.getFilePath() == null) {
            return null;
        }
        // TODO: 生成实际的下载URL（MinIO/OSS预签名URL）
        return "/api/knowledge/files/" + id + "/download";
    }
}