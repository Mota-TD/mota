package com.mota.collab.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.difflib.DiffUtils;
import com.github.difflib.patch.AbstractDelta;
import com.github.difflib.patch.Patch;
import com.mota.collab.entity.Document;
import com.mota.collab.entity.DocumentVersion;
import com.mota.collab.mapper.DocumentMapper;
import com.mota.collab.mapper.DocumentVersionMapper;
import com.mota.collab.service.DocumentVersionService;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 文档版本服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentVersionServiceImpl implements DocumentVersionService {

    private final DocumentVersionMapper versionMapper;
    private final DocumentMapper documentMapper;

    @Override
    @Transactional
    public DocumentVersion createAutoVersion(Long documentId, String content, String plainText) {
        return createVersion(documentId, content, plainText, null, "auto", false);
    }

    @Override
    @Transactional
    public DocumentVersion createManualVersion(Long documentId, String content, String plainText, String changeSummary) {
        return createVersion(documentId, content, plainText, changeSummary, "manual", true);
    }

    private DocumentVersion createVersion(Long documentId, String content, String plainText, 
                                          String changeSummary, String changeType, boolean isMajor) {
        DocumentVersion version = new DocumentVersion();
        version.setTenantId(TenantContext.getTenantId());
        version.setDocumentId(documentId);
        version.setVersionNumber(versionMapper.getNextVersionNumber(documentId));
        version.setContent(content);
        version.setPlainText(plainText);
        version.setChangeSummary(changeSummary);
        version.setChangeType(changeType);
        version.setIsMajor(isMajor);
        version.setCreatedBy(UserContext.getUserId());
        
        // 获取文档标题
        Document document = documentMapper.selectById(documentId);
        if (document != null) {
            version.setTitle(document.getTitle());
        }
        
        // 计算字数和大小
        if (plainText != null) {
            version.setWordCount(plainText.length());
        }
        if (content != null) {
            version.setContentSize((long) content.getBytes().length);
        }
        
        // 计算与上一版本的差异
        DocumentVersion previousVersion = versionMapper.selectLatestVersion(documentId);
        if (previousVersion != null && previousVersion.getContent() != null && content != null) {
            String diff = generateDiff(previousVersion.getContent(), content);
            version.setDiffContent(diff);
        }
        
        versionMapper.insert(version);
        
        log.info("创建文档版本: documentId={}, versionNumber={}, changeType={}", 
                documentId, version.getVersionNumber(), changeType);
        return version;
    }

    @Override
    public DocumentVersion getById(Long versionId) {
        DocumentVersion version = versionMapper.selectById(versionId);
        if (version == null) {
            throw new BusinessException("版本不存在");
        }
        return version;
    }

    @Override
    public List<DocumentVersion> listVersions(Long documentId) {
        return versionMapper.selectByDocumentId(documentId);
    }

    @Override
    public List<DocumentVersion> listMajorVersions(Long documentId) {
        return versionMapper.selectMajorVersions(documentId);
    }

    @Override
    public DocumentVersion getLatestVersion(Long documentId) {
        return versionMapper.selectLatestVersion(documentId);
    }

    @Override
    public DocumentVersion getByVersionNumber(Long documentId, Integer versionNumber) {
        return versionMapper.selectByVersionNumber(documentId, versionNumber);
    }

    @Override
    @Transactional
    public DocumentVersion rollbackToVersion(Long documentId, Long versionId) {
        DocumentVersion targetVersion = versionMapper.selectById(versionId);
        if (targetVersion == null) {
            throw new BusinessException("目标版本不存在");
        }
        
        if (!targetVersion.getDocumentId().equals(documentId)) {
            throw new BusinessException("版本不属于该文档");
        }
        
        // 更新文档内容
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new BusinessException("文档不存在");
        }
        
        document.setContent(targetVersion.getContent());
        document.setPlainText(targetVersion.getPlainText());
        document.setVersion(document.getVersion() + 1);
        documentMapper.updateById(document);
        
        // 创建回滚版本记录
        DocumentVersion rollbackVersion = createVersion(
            documentId, 
            targetVersion.getContent(), 
            targetVersion.getPlainText(),
            "回滚到版本 " + targetVersion.getVersionNumber(),
            "restore",
            true
        );
        
        log.info("回滚文档版本: documentId={}, targetVersionId={}, newVersionNumber={}", 
                documentId, versionId, rollbackVersion.getVersionNumber());
        
        return rollbackVersion;
    }

    @Override
    public String compareVersions(Long versionId1, Long versionId2) {
        DocumentVersion version1 = versionMapper.selectById(versionId1);
        DocumentVersion version2 = versionMapper.selectById(versionId2);
        
        if (version1 == null || version2 == null) {
            throw new BusinessException("版本不存在");
        }
        
        String content1 = version1.getContent() != null ? version1.getContent() : "";
        String content2 = version2.getContent() != null ? version2.getContent() : "";
        
        return generateDiff(content1, content2);
    }

    @Override
    @Transactional
    public void deleteVersion(Long versionId) {
        DocumentVersion version = versionMapper.selectById(versionId);
        if (version == null) {
            throw new BusinessException("版本不存在");
        }
        
        // 不允许删除最新版本
        DocumentVersion latestVersion = versionMapper.selectLatestVersion(version.getDocumentId());
        if (latestVersion != null && latestVersion.getId().equals(versionId)) {
            throw new BusinessException("不能删除最新版本");
        }
        
        versionMapper.deleteById(versionId);
        log.info("删除文档版本: versionId={}", versionId);
    }

    @Override
    @Transactional
    public void cleanupOldVersions(Long documentId, int keepCount) {
        List<DocumentVersion> versions = versionMapper.selectByDocumentId(documentId);
        
        if (versions.size() <= keepCount) {
            return;
        }
        
        // 保留最新的keepCount个版本和所有主要版本
        List<Long> versionsToDelete = versions.stream()
            .skip(keepCount)
            .filter(v -> !v.getIsMajor())
            .map(DocumentVersion::getId)
            .collect(Collectors.toList());
        
        if (!versionsToDelete.isEmpty()) {
            LambdaQueryWrapper<DocumentVersion> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(DocumentVersion::getId, versionsToDelete);
            versionMapper.delete(wrapper);
            
            log.info("清理旧版本: documentId={}, deletedCount={}", documentId, versionsToDelete.size());
        }
    }

    /**
     * 生成两个内容之间的差异
     */
    private String generateDiff(String original, String revised) {
        try {
            List<String> originalLines = Arrays.asList(original.split("\n"));
            List<String> revisedLines = Arrays.asList(revised.split("\n"));
            
            Patch<String> patch = DiffUtils.diff(originalLines, revisedLines);
            
            StringBuilder diff = new StringBuilder();
            for (AbstractDelta<String> delta : patch.getDeltas()) {
                diff.append(delta.toString()).append("\n");
            }
            
            return diff.toString();
        } catch (Exception e) {
            log.error("生成差异失败", e);
            return "";
        }
    }
}