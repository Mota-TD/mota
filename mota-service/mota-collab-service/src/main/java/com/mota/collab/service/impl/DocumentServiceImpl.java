package com.mota.collab.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.collab.entity.Document;
import com.mota.collab.mapper.DocumentMapper;
import com.mota.collab.service.DocumentService;
import com.mota.collab.service.DocumentVersionService;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文档服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentMapper documentMapper;
    private final DocumentVersionService versionService;

    @Override
    @Transactional
    public Document createDocument(Document document) {
        document.setTenantId(TenantContext.getTenantId());
        document.setCreatedBy(UserContext.getUserId());
        document.setLastEditedBy(UserContext.getUserId());
        document.setLastEditedAt(LocalDateTime.now());
        document.setVersion(1);
        document.setViewCount(0);
        document.setIsFavorite(false);
        document.setIsPinned(false);
        document.setIsLocked(false);
        document.setIsFolder(false);
        
        if (document.getStatus() == null) {
            document.setStatus("draft");
        }
        if (document.getDocType() == null) {
            document.setDocType("markdown");
        }
        if (document.getPermissionLevel() == null) {
            document.setPermissionLevel("private");
        }
        
        // 计算字数
        if (document.getPlainText() != null) {
            document.setWordCount(document.getPlainText().length());
            document.setReadingTime(Math.max(1, document.getWordCount() / 200));
        }
        
        documentMapper.insert(document);
        
        // 创建初始版本
        if (document.getContent() != null) {
            versionService.createAutoVersion(document.getId(), document.getContent(), document.getPlainText());
        }
        
        log.info("创建文档成功: documentId={}, title={}", document.getId(), document.getTitle());
        return document;
    }

    @Override
    @Transactional
    public Document createFolder(Long parentId, String title, Long projectId) {
        Document folder = new Document();
        folder.setParentId(parentId);
        folder.setTitle(title);
        folder.setProjectId(projectId);
        folder.setIsFolder(true);
        folder.setDocType("folder");
        folder.setStatus("published");
        folder.setTenantId(TenantContext.getTenantId());
        folder.setCreatedBy(UserContext.getUserId());
        
        documentMapper.insert(folder);
        
        log.info("创建文件夹成功: folderId={}, title={}", folder.getId(), title);
        return folder;
    }

    @Override
    @Transactional
    public Document updateDocument(Document document) {
        Document existing = documentMapper.selectById(document.getId());
        if (existing == null) {
            throw new BusinessException("文档不存在");
        }
        
        if (existing.getIsLocked() && !existing.getLockedBy().equals(UserContext.getUserId())) {
            throw new BusinessException("文档已被锁定，无法编辑");
        }
        
        document.setLastEditedBy(UserContext.getUserId());
        document.setLastEditedAt(LocalDateTime.now());
        document.setVersion(existing.getVersion() + 1);
        
        // 计算字数
        if (document.getPlainText() != null) {
            document.setWordCount(document.getPlainText().length());
            document.setReadingTime(Math.max(1, document.getWordCount() / 200));
        }
        
        documentMapper.updateById(document);
        
        log.info("更新文档成功: documentId={}", document.getId());
        return document;
    }

    @Override
    @Transactional
    public Document updateContent(Long documentId, String content, String plainText) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException("文档不存在");
        }
        
        if (document.getIsLocked() && !document.getLockedBy().equals(UserContext.getUserId())) {
            throw new BusinessException("文档已被锁定，无法编辑");
        }
        
        document.setContent(content);
        document.setPlainText(plainText);
        document.setLastEditedBy(UserContext.getUserId());
        document.setLastEditedAt(LocalDateTime.now());
        document.setVersion(document.getVersion() + 1);
        
        // 计算字数
        if (plainText != null) {
            document.setWordCount(plainText.length());
            document.setReadingTime(Math.max(1, document.getWordCount() / 200));
        }
        
        documentMapper.updateById(document);
        
        // 创建自动版本
        versionService.createAutoVersion(documentId, content, plainText);
        
        return document;
    }

    @Override
    public Document getById(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException("文档不存在");
        }
        return document;
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException("文档不存在");
        }
        
        // 如果是文件夹，检查是否有子文档
        if (document.getIsFolder()) {
            int childCount = documentMapper.countByParentId(documentId);
            if (childCount > 0) {
                throw new BusinessException("文件夹不为空，无法删除");
            }
        }
        
        documentMapper.deleteById(documentId);
        log.info("删除文档成功: documentId={}", documentId);
    }

    @Override
    @Transactional
    public void batchDelete(List<Long> documentIds) {
        for (Long documentId : documentIds) {
            deleteDocument(documentId);
        }
    }

    @Override
    @Transactional
    public void moveDocument(Long documentId, Long targetFolderId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException("文档不存在");
        }
        
        // 验证目标文件夹
        if (targetFolderId != null) {
            Document targetFolder = documentMapper.selectById(targetFolderId);
            if (targetFolder == null || !targetFolder.getIsFolder()) {
                throw new BusinessException("目标文件夹不存在");
            }
            
            // 防止移动到自己或子文件夹
            if (documentId.equals(targetFolderId)) {
                throw new BusinessException("不能移动到自身");
            }
        }
        
        document.setParentId(targetFolderId);
        documentMapper.updateById(document);
        
        log.info("移动文档成功: documentId={}, targetFolderId={}", documentId, targetFolderId);
    }

    @Override
    @Transactional
    public Document copyDocument(Long documentId, Long targetFolderId) {
        Document source = documentMapper.selectById(documentId);
        if (source == null) {
            throw new BusinessException("文档不存在");
        }
        
        Document copy = new Document();
        copy.setParentId(targetFolderId);
        copy.setProjectId(source.getProjectId());
        copy.setTitle(source.getTitle() + " (副本)");
        copy.setContent(source.getContent());
        copy.setPlainText(source.getPlainText());
        copy.setDocType(source.getDocType());
        copy.setCodeLanguage(source.getCodeLanguage());
        copy.setStatus("draft");
        copy.setIsFolder(false);
        copy.setIcon(source.getIcon());
        copy.setCoverImage(source.getCoverImage());
        copy.setWordCount(source.getWordCount());
        copy.setReadingTime(source.getReadingTime());
        copy.setPermissionLevel(source.getPermissionLevel());
        
        return createDocument(copy);
    }

    @Override
    public List<Document> listByParentId(Long parentId) {
        return documentMapper.selectByParentId(parentId);
    }

    @Override
    public List<Document> listByProjectId(Long projectId) {
        return documentMapper.selectByProjectId(projectId);
    }

    @Override
    public List<Document> listFavorites(Long userId) {
        return documentMapper.selectFavorites(userId);
    }

    @Override
    public List<Document> listRecentDocuments(Long userId, int limit) {
        return documentMapper.selectRecentDocuments(userId, limit);
    }

    @Override
    public IPage<Document> searchDocuments(Page<Document> page, String keyword, Long projectId, String docType) {
        return documentMapper.searchDocuments(page, keyword, projectId, docType);
    }

    @Override
    public List<Document> getDocumentPath(Long documentId) {
        return documentMapper.selectDocumentPath(documentId);
    }

    @Override
    @Transactional
    public void toggleFavorite(Long documentId, boolean favorite) {
        LambdaUpdateWrapper<Document> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Document::getId, documentId)
               .set(Document::getIsFavorite, favorite);
        documentMapper.update(null, wrapper);
    }

    @Override
    @Transactional
    public void togglePinned(Long documentId, boolean pinned) {
        LambdaUpdateWrapper<Document> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Document::getId, documentId)
               .set(Document::getIsPinned, pinned);
        documentMapper.update(null, wrapper);
    }

    @Override
    @Transactional
    public void lockDocument(Long documentId, Long userId) {
        LambdaUpdateWrapper<Document> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Document::getId, documentId)
               .set(Document::getIsLocked, true)
               .set(Document::getLockedBy, userId)
               .set(Document::getLockedAt, LocalDateTime.now());
        documentMapper.update(null, wrapper);
        
        log.info("锁定文档: documentId={}, userId={}", documentId, userId);
    }

    @Override
    @Transactional
    public void unlockDocument(Long documentId) {
        LambdaUpdateWrapper<Document> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Document::getId, documentId)
               .set(Document::getIsLocked, false)
               .set(Document::getLockedBy, null)
               .set(Document::getLockedAt, null);
        documentMapper.update(null, wrapper);
        
        log.info("解锁文档: documentId={}", documentId);
    }

    @Override
    @Transactional
    public void archiveDocument(Long documentId) {
        LambdaUpdateWrapper<Document> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Document::getId, documentId)
               .set(Document::getStatus, "archived");
        documentMapper.update(null, wrapper);
        
        log.info("归档文档: documentId={}", documentId);
    }

    @Override
    @Transactional
    public void publishDocument(Long documentId) {
        LambdaUpdateWrapper<Document> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Document::getId, documentId)
               .set(Document::getStatus, "published");
        documentMapper.update(null, wrapper);
        
        log.info("发布文档: documentId={}", documentId);
    }

    @Override
    public void incrementViewCount(Long documentId) {
        documentMapper.incrementViewCount(documentId);
    }

    @Override
    @Transactional
    public void updateSortOrder(Long documentId, Integer sortOrder) {
        LambdaUpdateWrapper<Document> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Document::getId, documentId)
               .set(Document::getSortOrder, sortOrder);
        documentMapper.update(null, wrapper);
    }
}