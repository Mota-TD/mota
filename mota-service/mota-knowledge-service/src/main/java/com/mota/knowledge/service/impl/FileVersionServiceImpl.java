package com.mota.knowledge.service.impl;

import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.knowledge.entity.FileVersion;
import com.mota.knowledge.entity.KnowledgeFile;
import com.mota.knowledge.mapper.FileVersionMapper;
import com.mota.knowledge.mapper.KnowledgeFileMapper;
import com.mota.knowledge.service.FileVersionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 文件版本服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileVersionServiceImpl implements FileVersionService {

    private final FileVersionMapper versionMapper;
    private final KnowledgeFileMapper fileMapper;

    @Override
    @Transactional
    public FileVersion createVersion(Long fileId, String changeDescription) {
        KnowledgeFile file = fileMapper.selectById(fileId);
        if (file == null) {
            throw new BusinessException("文件不存在");
        }

        // 获取当前最新版本号
        FileVersion latestVersion = versionMapper.selectLatestVersion(fileId);
        int newVersionNumber = latestVersion != null ? latestVersion.getVersionNumber() + 1 : 1;

        // 创建新版本
        FileVersion version = new FileVersion();
        version.setTenantId(TenantContext.getTenantId());
        version.setFileId(fileId);
        version.setVersionNumber(newVersionNumber);
        version.setFileName(file.getName());
        version.setFileSize(file.getFileSize());
        version.setStoragePath(file.getStoragePath());
        version.setMd5Hash(file.getMd5Hash());
        version.setChangeDescription(changeDescription);
        version.setCreatedBy(UserContext.getUserId());

        versionMapper.insert(version);

        // 更新文件的版本号
        file.setVersion(newVersionNumber);
        fileMapper.updateById(file);

        log.info("创建文件版本: fileId={}, version={}", fileId, newVersionNumber);
        return version;
    }

    @Override
    public List<FileVersion> getFileVersions(Long fileId) {
        return versionMapper.selectByFileId(fileId);
    }

    @Override
    public FileVersion getVersion(Long versionId) {
        return versionMapper.selectById(versionId);
    }

    @Override
    public FileVersion getLatestVersion(Long fileId) {
        return versionMapper.selectLatestVersion(fileId);
    }

    @Override
    public FileVersion getVersionByNumber(Long fileId, Integer versionNumber) {
        return versionMapper.selectByVersionNumber(fileId, versionNumber);
    }

    @Override
    @Transactional
    public FileVersion rollbackToVersion(Long fileId, Long versionId) {
        FileVersion targetVersion = versionMapper.selectById(versionId);
        if (targetVersion == null || !targetVersion.getFileId().equals(fileId)) {
            throw new BusinessException("版本不存在");
        }

        KnowledgeFile file = fileMapper.selectById(fileId);
        if (file == null) {
            throw new BusinessException("文件不存在");
        }

        // 创建回滚版本记录
        FileVersion rollbackVersion = createVersion(fileId, 
            "回滚到版本 " + targetVersion.getVersionNumber());

        // 恢复文件内容
        file.setStoragePath(targetVersion.getStoragePath());
        file.setFileSize(targetVersion.getFileSize());
        file.setMd5Hash(targetVersion.getMd5Hash());
        fileMapper.updateById(file);

        log.info("回滚文件版本: fileId={}, targetVersion={}, newVersion={}", 
            fileId, targetVersion.getVersionNumber(), rollbackVersion.getVersionNumber());
        
        return rollbackVersion;
    }

    @Override
    public Object compareVersions(Long versionId1, Long versionId2) {
        FileVersion version1 = versionMapper.selectById(versionId1);
        FileVersion version2 = versionMapper.selectById(versionId2);

        if (version1 == null || version2 == null) {
            throw new BusinessException("版本不存在");
        }

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("version1", version1);
        comparison.put("version2", version2);
        comparison.put("sizeDiff", version2.getFileSize() - version1.getFileSize());
        comparison.put("sameContent", version1.getMd5Hash() != null && 
            version1.getMd5Hash().equals(version2.getMd5Hash()));

        // TODO: 如果是文本文件，可以进行内容差异比较
        
        return comparison;
    }

    @Override
    @Transactional
    public void deleteVersion(Long versionId) {
        FileVersion version = versionMapper.selectById(versionId);
        if (version == null) {
            return;
        }

        // 检查是否是最新版本
        FileVersion latestVersion = versionMapper.selectLatestVersion(version.getFileId());
        if (latestVersion != null && latestVersion.getId().equals(versionId)) {
            throw new BusinessException("不能删除最新版本");
        }

        versionMapper.deleteById(versionId);
        log.info("删除文件版本: versionId={}", versionId);
    }

    @Override
    @Transactional
    public void cleanOldVersions(Long fileId, Integer keepCount) {
        List<FileVersion> versions = versionMapper.selectByFileId(fileId);
        
        if (versions.size() <= keepCount) {
            return;
        }

        // 删除旧版本（保留最新的keepCount个）
        for (int i = keepCount; i < versions.size(); i++) {
            versionMapper.deleteById(versions.get(i).getId());
        }

        log.info("清理旧版本: fileId={}, deleted={}", fileId, versions.size() - keepCount);
    }
}