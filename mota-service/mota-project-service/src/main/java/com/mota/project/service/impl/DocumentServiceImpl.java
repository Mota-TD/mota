package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.project.entity.Document;
import com.mota.project.entity.DocumentAccessLog;
import com.mota.project.entity.DocumentCollaborator;
import com.mota.project.entity.DocumentFavorite;
import com.mota.project.entity.DocumentVersion;
import com.mota.project.mapper.DocumentAccessLogMapper;
import com.mota.project.mapper.DocumentFavoriteMapper;
import com.mota.project.mapper.DocumentMapper;
import com.mota.project.mapper.DocumentVersionMapper;
import com.mota.project.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 文档服务实现类
 */
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentMapper documentMapper;
    private final DocumentVersionMapper documentVersionMapper;
    private final DocumentFavoriteMapper documentFavoriteMapper;
    private final DocumentAccessLogMapper documentAccessLogMapper;

    // ========== 文档CRUD ==========

    @Override
    @Transactional
    public Document createDocument(Document document) {
        document.setCurrentVersion(1);
        document.setViewCount(0);
        document.setCreatedAt(LocalDateTime.now());
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.insert(document);
        
        // 创建初始版本
        DocumentVersion version = new DocumentVersion();
        version.setDocumentId(document.getId());
        version.setVersionNumber(1);
        version.setTitle(document.getTitle());
        version.setContent(document.getContent());
        version.setEditorId(document.getCreatorId());
        version.setVersionType("major");
        version.setChangeSummary("初始版本");
        version.setCreatedAt(LocalDateTime.now());
        documentVersionMapper.insert(version);
        
        return document;
    }

    @Override
    @Transactional
    public Document updateDocument(Long id, Document document) {
        Document existing = documentMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("文档不存在");
        }
        
        document.setId(id);
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        
        return documentMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean deleteDocument(Long id) {
        return documentMapper.deleteById(id) > 0;
    }

    @Override
    public Document getDocumentById(Long id) {
        return documentMapper.selectById(id);
    }

    @Override
    public Document getDocumentWithDetails(Long id) {
        Document document = documentMapper.selectById(id);
        if (document != null) {
            // 加载协作者和版本信息
            document.setCollaborators(getDocumentCollaborators(id));
            document.setVersions(getDocumentVersions(id));
        }
        return document;
    }

    @Override
    public List<Document> getProjectDocuments(Long projectId, Long folderId, String status) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Document::getProjectId, projectId);
        if (folderId != null) {
            wrapper.eq(Document::getFolderId, folderId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Document::getStatus, status);
        }
        wrapper.orderByDesc(Document::getUpdatedAt);
        return documentMapper.selectList(wrapper);
    }

    @Override
    public List<Document> getUserDocuments(Long userId, String status, int page, int pageSize) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Document::getCreatorId, userId);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Document::getStatus, status);
        }
        wrapper.orderByDesc(Document::getUpdatedAt);
        int offset = (page - 1) * pageSize;
        wrapper.last("LIMIT " + offset + ", " + pageSize);
        return documentMapper.selectList(wrapper);
    }

    @Override
    public List<Document> searchDocuments(String keyword, Long projectId, Long userId, int page, int pageSize) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Document::getTitle, keyword)
                    .or().like(Document::getContent, keyword));
        }
        if (projectId != null) {
            wrapper.eq(Document::getProjectId, projectId);
        }
        if (userId != null) {
            wrapper.eq(Document::getCreatorId, userId);
        }
        wrapper.orderByDesc(Document::getUpdatedAt);
        int offset = (page - 1) * pageSize;
        wrapper.last("LIMIT " + offset + ", " + pageSize);
        return documentMapper.selectList(wrapper);
    }

    // ========== 文档发布 ==========

    @Override
    @Transactional
    public Document publishDocument(Long id) {
        Document document = documentMapper.selectById(id);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        document.setStatus("published");
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        return document;
    }

    @Override
    @Transactional
    public Document archiveDocument(Long id) {
        Document document = documentMapper.selectById(id);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        document.setStatus("archived");
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        return document;
    }

    @Override
    @Transactional
    public Document restoreDocument(Long id) {
        Document document = documentMapper.selectById(id);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        document.setStatus("draft");
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        return document;
    }

    // ========== 版本管理 ==========

    @Override
    @Transactional
    public DocumentVersion saveVersion(Long documentId, Long editorId, String editorName,
                                        String content, String changeSummary, String versionType) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        int newVersionNumber = document.getCurrentVersion() + 1;
        
        DocumentVersion version = new DocumentVersion();
        version.setDocumentId(documentId);
        version.setVersionNumber(newVersionNumber);
        version.setTitle(document.getTitle());
        version.setContent(content);
        version.setEditorId(editorId);
        version.setEditorName(editorName);
        version.setVersionType(versionType);
        version.setChangeSummary(changeSummary);
        version.setCreatedAt(LocalDateTime.now());
        documentVersionMapper.insert(version);
        
        // 更新文档当前版本和内容
        document.setContent(content);
        document.setCurrentVersion(newVersionNumber);
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        
        return version;
    }

    @Override
    public List<DocumentVersion> getDocumentVersions(Long documentId) {
        LambdaQueryWrapper<DocumentVersion> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DocumentVersion::getDocumentId, documentId);
        wrapper.orderByDesc(DocumentVersion::getVersionNumber);
        return documentVersionMapper.selectList(wrapper);
    }

    @Override
    public DocumentVersion getVersion(Long documentId, Integer versionNumber) {
        return documentVersionMapper.selectByVersionNumber(documentId, versionNumber);
    }

    @Override
    @Transactional
    public Document rollbackToVersion(Long documentId, Integer versionNumber, Long operatorId) {
        DocumentVersion version = documentVersionMapper.selectByVersionNumber(documentId, versionNumber);
        if (version == null) {
            throw new RuntimeException("版本不存在");
        }
        
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        document.setTitle(version.getTitle());
        document.setContent(version.getContent());
        document.setUpdatedAt(LocalDateTime.now());
        
        // 创建回滚版本记录
        int newVersionNumber = document.getCurrentVersion() + 1;
        DocumentVersion rollbackVersion = new DocumentVersion();
        rollbackVersion.setDocumentId(documentId);
        rollbackVersion.setVersionNumber(newVersionNumber);
        rollbackVersion.setTitle(version.getTitle());
        rollbackVersion.setContent(version.getContent());
        rollbackVersion.setEditorId(operatorId);
        rollbackVersion.setVersionType("rollback");
        rollbackVersion.setChangeSummary("回滚到版本 " + versionNumber);
        rollbackVersion.setCreatedAt(LocalDateTime.now());
        documentVersionMapper.insert(rollbackVersion);
        
        document.setCurrentVersion(newVersionNumber);
        documentMapper.updateById(document);
        
        return document;
    }

    @Override
    public Map<String, Object> compareVersions(Long documentId, Integer version1, Integer version2) {
        DocumentVersion v1 = documentVersionMapper.selectByVersionNumber(documentId, version1);
        DocumentVersion v2 = documentVersionMapper.selectByVersionNumber(documentId, version2);
        
        if (v1 == null || v2 == null) {
            throw new RuntimeException("版本不存在");
        }
        
        Map<String, Object> diff = new HashMap<>();
        diff.put("version1", version1);
        diff.put("version2", version2);
        diff.put("content1", v1.getContent());
        diff.put("content2", v2.getContent());
        diff.put("title1", v1.getTitle());
        diff.put("title2", v2.getTitle());
        diff.put("editor1", v1.getEditorName());
        diff.put("editor2", v2.getEditorName());
        diff.put("createdAt1", v1.getCreatedAt());
        diff.put("createdAt2", v2.getCreatedAt());
        
        return diff;
    }

    // ========== 协作管理 ==========

    @Override
    @Transactional
    public DocumentCollaborator addCollaborator(Long documentId, Long userId, String permission) {
        // TODO: 实现添加协作者
        DocumentCollaborator collaborator = new DocumentCollaborator();
        collaborator.setDocumentId(documentId);
        collaborator.setUserId(userId);
        collaborator.setPermission(permission);
        collaborator.setCreatedAt(LocalDateTime.now());
        return collaborator;
    }

    @Override
    @Transactional
    public boolean removeCollaborator(Long documentId, Long userId) {
        // TODO: 实现移除协作者
        return true;
    }

    @Override
    @Transactional
    public DocumentCollaborator updateCollaboratorPermission(Long documentId, Long userId, String permission) {
        // TODO: 实现更新协作者权限
        DocumentCollaborator collaborator = new DocumentCollaborator();
        collaborator.setDocumentId(documentId);
        collaborator.setUserId(userId);
        collaborator.setPermission(permission);
        return collaborator;
    }

    @Override
    public List<DocumentCollaborator> getDocumentCollaborators(Long documentId) {
        // TODO: 实现协作者查询
        return List.of();
    }

    @Override
    public boolean hasPermission(Long documentId, Long userId, String requiredPermission) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            return false;
        }
        
        // 创建者拥有所有权限
        if (document.getCreatorId().equals(userId)) {
            return true;
        }
        
        // TODO: 检查协作者权限
        return false;
    }

    @Override
    @Transactional
    public void updateCollaboratorOnlineStatus(Long documentId, Long userId, boolean isOnline, Integer cursorPosition) {
        // TODO: 实现更新协作者在线状态
    }

    @Override
    public List<DocumentCollaborator> getOnlineCollaborators(Long documentId) {
        // TODO: 实现获取在线协作者
        return List.of();
    }

    // ========== 模板管理 ==========

    @Override
    public List<Document> getDocumentTemplates(String category) {
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Document::getIsTemplate, true);
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Document::getTemplateCategory, category);
        }
        wrapper.orderByDesc(Document::getUpdatedAt);
        return documentMapper.selectList(wrapper);
    }

    @Override
    @Transactional
    public Document createFromTemplate(Long templateId, Long projectId, Long creatorId, String title) {
        Document template = documentMapper.selectById(templateId);
        if (template == null || !template.getIsTemplate()) {
            throw new RuntimeException("模板不存在");
        }
        
        Document newDocument = new Document();
        newDocument.setTitle(title != null ? title : template.getTitle() + " (副本)");
        newDocument.setContent(template.getContent());
        newDocument.setContentType(template.getContentType());
        newDocument.setProjectId(projectId);
        newDocument.setCreatorId(creatorId);
        newDocument.setIsTemplate(false);
        newDocument.setStatus("draft");
        
        return createDocument(newDocument);
    }

    @Override
    @Transactional
    public Document saveAsTemplate(Long documentId, String category) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        document.setIsTemplate(true);
        document.setTemplateCategory(category);
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        
        return document;
    }

    // ========== 统计 ==========

    @Override
    @Transactional
    public void incrementViewCount(Long documentId) {
        documentMapper.incrementViewCount(documentId);
    }

    @Override
    @Transactional
    public boolean toggleLike(Long documentId, Long userId) {
        // TODO: 实现点赞/取消点赞逻辑
        // 这里需要一个文档点赞表来记录用户的点赞状态
        // 暂时返回true表示点赞成功
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        // 简单实现：增加点赞数
        Integer likeCount = document.getLikeCount();
        if (likeCount == null) {
            likeCount = 0;
        }
        document.setLikeCount(likeCount + 1);
        document.setUpdatedAt(LocalDateTime.now());
        documentMapper.updateById(document);
        
        return true;
    }

    @Override
    public Map<String, Object> getDocumentStats(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            return Map.of();
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("viewCount", document.getViewCount());
        stats.put("likeCount", document.getLikeCount());
        stats.put("versionCount", document.getCurrentVersion());
        stats.put("createdAt", document.getCreatedAt());
        stats.put("updatedAt", document.getUpdatedAt());
        
        return stats;
    }

    // ========== 收藏夹功能 ==========

    @Override
    @Transactional
    public DocumentFavorite addFavorite(Long userId, Long documentId, String folderName, String note) {
        // 检查是否已收藏
        if (documentFavoriteMapper.isFavorited(userId, documentId)) {
            throw new RuntimeException("文档已收藏");
        }
        
        // 检查文档是否存在
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        DocumentFavorite favorite = new DocumentFavorite();
        favorite.setUserId(userId);
        favorite.setDocumentId(documentId);
        favorite.setFolderName(folderName);
        favorite.setNote(note);
        favorite.setCreatedAt(LocalDateTime.now());
        
        documentFavoriteMapper.insert(favorite);
        
        // 设置文档信息
        favorite.setDocumentTitle(document.getTitle());
        favorite.setDocumentSummary(document.getSummary());
        favorite.setDocumentStatus(document.getStatus());
        
        return favorite;
    }

    @Override
    @Transactional
    public boolean removeFavorite(Long userId, Long documentId) {
        return documentFavoriteMapper.deleteFavorite(userId, documentId) > 0;
    }

    @Override
    public boolean isFavorited(Long userId, Long documentId) {
        return documentFavoriteMapper.isFavorited(userId, documentId);
    }

    @Override
    public List<DocumentFavorite> getUserFavorites(Long userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return documentFavoriteMapper.selectUserFavoritesWithDetails(userId, offset, pageSize);
    }

    @Override
    public List<DocumentFavorite> getUserFavoritesByFolder(Long userId, String folderName) {
        return documentFavoriteMapper.selectUserFavoritesByFolder(userId, folderName);
    }

    @Override
    public List<Map<String, Object>> getUserFavoriteFolders(Long userId) {
        return documentFavoriteMapper.selectUserFolders(userId);
    }

    @Override
    @Transactional
    public boolean updateFavoriteFolder(Long userId, Long documentId, String folderName) {
        return documentFavoriteMapper.updateFolderName(userId, documentId, folderName) > 0;
    }

    @Override
    @Transactional
    public boolean batchRemoveFavorites(Long userId, List<Long> documentIds) {
        return documentFavoriteMapper.batchDeleteFavorites(userId, documentIds) > 0;
    }

    // ========== 最近访问功能 ==========

    @Override
    @Transactional
    public void recordAccess(Long userId, Long documentId, String accessType) {
        documentAccessLogMapper.upsertAccessLog(userId, documentId, accessType != null ? accessType : "view");
    }

    @Override
    public List<DocumentAccessLog> getRecentAccess(Long userId, int limit) {
        return documentAccessLogMapper.selectRecentAccessWithDetails(userId, limit);
    }

    @Override
    @Transactional
    public boolean clearAccessHistory(Long userId) {
        return documentAccessLogMapper.clearUserAccessLogs(userId) >= 0;
    }

    // ========== 导出功能 ==========

    @Override
    public byte[] exportToPdf(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        // 生成PDF内容
        // 这里使用简单的HTML转PDF方式，实际项目中可以使用iText、Flying Saucer等库
        String htmlContent = generateHtmlForExport(document);
        
        // 简化实现：返回HTML内容的字节数组
        // 实际项目中应该使用PDF生成库
        String pdfPlaceholder = "PDF Export: " + document.getTitle() + "\n\n" +
                               stripHtml(document.getContent());
        return pdfPlaceholder.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] exportToWord(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        // 生成Word文档
        // 这里使用简单的方式，实际项目中可以使用Apache POI等库
        StringBuilder wordContent = new StringBuilder();
        wordContent.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        wordContent.append("<?mso-application progid=\"Word.Document\"?>\n");
        wordContent.append("<w:wordDocument xmlns:w=\"http://schemas.microsoft.com/office/word/2003/wordml\">\n");
        wordContent.append("<w:body>\n");
        wordContent.append("<w:p><w:r><w:t>").append(escapeXml(document.getTitle())).append("</w:t></w:r></w:p>\n");
        wordContent.append("<w:p><w:r><w:t>").append(escapeXml(stripHtml(document.getContent()))).append("</w:t></w:r></w:p>\n");
        wordContent.append("</w:body>\n");
        wordContent.append("</w:wordDocument>");
        
        return wordContent.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String exportToMarkdown(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        StringBuilder markdown = new StringBuilder();
        markdown.append("# ").append(document.getTitle()).append("\n\n");
        
        if (document.getSummary() != null && !document.getSummary().isEmpty()) {
            markdown.append("> ").append(document.getSummary()).append("\n\n");
        }
        
        // 如果内容已经是Markdown格式，直接返回
        if ("markdown".equals(document.getContentType())) {
            markdown.append(document.getContent());
        } else {
            // 如果是HTML或富文本，进行简单转换
            markdown.append(htmlToMarkdown(document.getContent()));
        }
        
        markdown.append("\n\n---\n");
        markdown.append("*导出时间: ").append(LocalDateTime.now()).append("*\n");
        
        return markdown.toString();
    }

    @Override
    public String exportToHtml(Long documentId) {
        Document document = documentMapper.selectById(documentId);
        if (document == null) {
            throw new RuntimeException("文档不存在");
        }
        
        return generateHtmlForExport(document);
    }

    // ========== 私有辅助方法 ==========

    private String generateHtmlForExport(Document document) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"zh-CN\">\n");
        html.append("<head>\n");
        html.append("  <meta charset=\"UTF-8\">\n");
        html.append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("  <title>").append(escapeHtml(document.getTitle())).append("</title>\n");
        html.append("  <style>\n");
        html.append("    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; ");
        html.append("           max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }\n");
        html.append("    h1 { color: #1a1a1a; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }\n");
        html.append("    .summary { color: #666; font-style: italic; margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px; }\n");
        html.append("    .content { color: #333; }\n");
        html.append("    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }\n");
        html.append("  </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        html.append("  <h1>").append(escapeHtml(document.getTitle())).append("</h1>\n");
        
        if (document.getSummary() != null && !document.getSummary().isEmpty()) {
            html.append("  <div class=\"summary\">").append(escapeHtml(document.getSummary())).append("</div>\n");
        }
        
        html.append("  <div class=\"content\">\n");
        if ("markdown".equals(document.getContentType())) {
            // 简单的Markdown转HTML（实际项目中应使用专业的Markdown解析库）
            html.append(markdownToHtml(document.getContent()));
        } else {
            html.append(document.getContent());
        }
        html.append("  </div>\n");
        
        html.append("  <div class=\"footer\">\n");
        html.append("    <p>导出时间: ").append(LocalDateTime.now()).append("</p>\n");
        html.append("  </div>\n");
        html.append("</body>\n");
        html.append("</html>");
        
        return html.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }

    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", "")
                   .replaceAll("&nbsp;", " ")
                   .replaceAll("&lt;", "<")
                   .replaceAll("&gt;", ">")
                   .replaceAll("&amp;", "&")
                   .replaceAll("&quot;", "\"");
    }

    private String htmlToMarkdown(String html) {
        if (html == null) return "";
        // 简单的HTML到Markdown转换
        String markdown = html;
        markdown = markdown.replaceAll("<h1[^>]*>(.*?)</h1>", "# $1\n\n");
        markdown = markdown.replaceAll("<h2[^>]*>(.*?)</h2>", "## $1\n\n");
        markdown = markdown.replaceAll("<h3[^>]*>(.*?)</h3>", "### $1\n\n");
        markdown = markdown.replaceAll("<h4[^>]*>(.*?)</h4>", "#### $1\n\n");
        markdown = markdown.replaceAll("<p[^>]*>(.*?)</p>", "$1\n\n");
        markdown = markdown.replaceAll("<br\\s*/?>", "\n");
        markdown = markdown.replaceAll("<strong[^>]*>(.*?)</strong>", "**$1**");
        markdown = markdown.replaceAll("<b[^>]*>(.*?)</b>", "**$1**");
        markdown = markdown.replaceAll("<em[^>]*>(.*?)</em>", "*$1*");
        markdown = markdown.replaceAll("<i[^>]*>(.*?)</i>", "*$1*");
        markdown = markdown.replaceAll("<code[^>]*>(.*?)</code>", "`$1`");
        markdown = markdown.replaceAll("<a[^>]*href=\"([^\"]+)\"[^>]*>(.*?)</a>", "[$2]($1)");
        markdown = markdown.replaceAll("<li[^>]*>(.*?)</li>", "- $1\n");
        markdown = markdown.replaceAll("<[^>]*>", "");
        return markdown;
    }

    private String markdownToHtml(String markdown) {
        if (markdown == null) return "";
        // 简单的Markdown到HTML转换
        String html = markdown;
        // 标题
        html = html.replaceAll("(?m)^#### (.+)$", "<h4>$1</h4>");
        html = html.replaceAll("(?m)^### (.+)$", "<h3>$1</h3>");
        html = html.replaceAll("(?m)^## (.+)$", "<h2>$1</h2>");
        html = html.replaceAll("(?m)^# (.+)$", "<h1>$1</h1>");
        // 粗体和斜体
        html = html.replaceAll("\\*\\*(.+?)\\*\\*", "<strong>$1</strong>");
        html = html.replaceAll("\\*(.+?)\\*", "<em>$1</em>");
        // 代码
        html = html.replaceAll("`(.+?)`", "<code>$1</code>");
        // 链接
        html = html.replaceAll("\\[(.+?)\\]\\((.+?)\\)", "<a href=\"$2\">$1</a>");
        // 列表
        html = html.replaceAll("(?m)^- (.+)$", "<li>$1</li>");
        // 段落
        html = html.replaceAll("(?m)^(?!<[hlu]|<li)(.+)$", "<p>$1</p>");
        // 换行
        html = html.replaceAll("\n\n", "<br><br>");
        return html;
    }
}