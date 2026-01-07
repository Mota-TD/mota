package com.mota.project.controller;

import com.mota.project.entity.Document;
import com.mota.project.entity.DocumentAccessLog;
import com.mota.project.entity.DocumentCollaborator;
import com.mota.project.entity.DocumentFavorite;
import com.mota.project.entity.DocumentVersion;
import com.mota.project.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * 文档控制器
 */
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    // ========== 文档CRUD ==========

    @PostMapping
    public ResponseEntity<Document> createDocument(@RequestBody Document document) {
        return ResponseEntity.ok(documentService.createDocument(document));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long id, @RequestBody Document document) {
        return ResponseEntity.ok(documentService.updateDocument(id, document));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.deleteDocument(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Document> getDocumentWithDetails(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentWithDetails(id));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Document>> getProjectDocuments(
            @PathVariable Long projectId,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(documentService.getProjectDocuments(projectId, folderId, status));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getUserDocuments(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(documentService.getUserDocuments(userId, status, page, pageSize));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Document>> searchDocuments(
            @RequestParam String keyword,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(documentService.searchDocuments(keyword, projectId, userId, page, pageSize));
    }

    // ========== 文档发布 ==========

    @PostMapping("/{id}/publish")
    public ResponseEntity<Document> publishDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.publishDocument(id));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Document> archiveDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.archiveDocument(id));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Document> restoreDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.restoreDocument(id));
    }

    // ========== 版本管理 ==========

    @PostMapping("/{documentId}/versions")
    public ResponseEntity<DocumentVersion> saveVersion(
            @PathVariable Long documentId,
            @RequestParam Long editorId,
            @RequestParam(required = false) String editorName,
            @RequestParam String content,
            @RequestParam(required = false) String changeSummary,
            @RequestParam(defaultValue = "minor") String versionType) {
        return ResponseEntity.ok(documentService.saveVersion(documentId, editorId, editorName, content, changeSummary, versionType));
    }

    @GetMapping("/{documentId}/versions")
    public ResponseEntity<List<DocumentVersion>> getDocumentVersions(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getDocumentVersions(documentId));
    }

    @GetMapping("/{documentId}/versions/{versionNumber}")
    public ResponseEntity<DocumentVersion> getVersion(
            @PathVariable Long documentId,
            @PathVariable Integer versionNumber) {
        return ResponseEntity.ok(documentService.getVersion(documentId, versionNumber));
    }

    @PostMapping("/{documentId}/rollback/{versionNumber}")
    public ResponseEntity<Document> rollbackToVersion(
            @PathVariable Long documentId,
            @PathVariable Integer versionNumber,
            @RequestParam Long operatorId) {
        return ResponseEntity.ok(documentService.rollbackToVersion(documentId, versionNumber, operatorId));
    }

    @GetMapping("/{documentId}/versions/compare")
    public ResponseEntity<Map<String, Object>> compareVersions(
            @PathVariable Long documentId,
            @RequestParam Integer version1,
            @RequestParam Integer version2) {
        return ResponseEntity.ok(documentService.compareVersions(documentId, version1, version2));
    }

    // ========== 协作管理 ==========

    @PostMapping("/{documentId}/collaborators")
    public ResponseEntity<DocumentCollaborator> addCollaborator(
            @PathVariable Long documentId,
            @RequestParam Long userId,
            @RequestParam String permission) {
        return ResponseEntity.ok(documentService.addCollaborator(documentId, userId, permission));
    }

    @DeleteMapping("/{documentId}/collaborators/{userId}")
    public ResponseEntity<Boolean> removeCollaborator(
            @PathVariable Long documentId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(documentService.removeCollaborator(documentId, userId));
    }

    @PutMapping("/{documentId}/collaborators/{userId}/permission")
    public ResponseEntity<DocumentCollaborator> updateCollaboratorPermission(
            @PathVariable Long documentId,
            @PathVariable Long userId,
            @RequestParam String permission) {
        return ResponseEntity.ok(documentService.updateCollaboratorPermission(documentId, userId, permission));
    }

    @GetMapping("/{documentId}/collaborators")
    public ResponseEntity<List<DocumentCollaborator>> getDocumentCollaborators(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getDocumentCollaborators(documentId));
    }

    @GetMapping("/{documentId}/permission")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable Long documentId,
            @RequestParam Long userId,
            @RequestParam String permission) {
        return ResponseEntity.ok(documentService.hasPermission(documentId, userId, permission));
    }

    @PutMapping("/{documentId}/collaborators/{userId}/online-status")
    public ResponseEntity<Void> updateCollaboratorOnlineStatus(
            @PathVariable Long documentId,
            @PathVariable Long userId,
            @RequestParam boolean isOnline,
            @RequestParam(required = false) Integer cursorPosition) {
        documentService.updateCollaboratorOnlineStatus(documentId, userId, isOnline, cursorPosition);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{documentId}/collaborators/online")
    public ResponseEntity<List<DocumentCollaborator>> getOnlineCollaborators(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getOnlineCollaborators(documentId));
    }

    // ========== 模板管理 ==========

    @GetMapping("/templates")
    public ResponseEntity<List<Document>> getDocumentTemplates(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(documentService.getDocumentTemplates(category));
    }

    @PostMapping("/from-template/{templateId}")
    public ResponseEntity<Document> createFromTemplate(
            @PathVariable Long templateId,
            @RequestParam Long projectId,
            @RequestParam Long creatorId,
            @RequestParam(required = false) String title) {
        return ResponseEntity.ok(documentService.createFromTemplate(templateId, projectId, creatorId, title));
    }

    @PostMapping("/{documentId}/save-as-template")
    public ResponseEntity<Document> saveAsTemplate(
            @PathVariable Long documentId,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(documentService.saveAsTemplate(documentId, category));
    }

    // ========== 统计 ==========

    @PostMapping("/{documentId}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long documentId) {
        documentService.incrementViewCount(documentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{documentId}/like")
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long documentId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(documentService.toggleLike(documentId, userId));
    }

    @GetMapping("/{documentId}/stats")
    public ResponseEntity<Map<String, Object>> getDocumentStats(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getDocumentStats(documentId));
    }

    // ========== 收藏夹功能 ==========

    @PostMapping("/{documentId}/favorite")
    public ResponseEntity<DocumentFavorite> addFavorite(
            @PathVariable Long documentId,
            @RequestParam Long userId,
            @RequestParam(required = false) String folderName,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(documentService.addFavorite(userId, documentId, folderName, note));
    }

    @DeleteMapping("/{documentId}/favorite")
    public ResponseEntity<Boolean> removeFavorite(
            @PathVariable Long documentId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(documentService.removeFavorite(userId, documentId));
    }

    @GetMapping("/{documentId}/favorite/check")
    public ResponseEntity<Boolean> isFavorited(
            @PathVariable Long documentId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(documentService.isFavorited(userId, documentId));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<DocumentFavorite>> getUserFavorites(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(documentService.getUserFavorites(userId, page, pageSize));
    }

    @GetMapping("/favorites/folder")
    public ResponseEntity<List<DocumentFavorite>> getUserFavoritesByFolder(
            @RequestParam Long userId,
            @RequestParam String folderName) {
        return ResponseEntity.ok(documentService.getUserFavoritesByFolder(userId, folderName));
    }

    @GetMapping("/favorites/folders")
    public ResponseEntity<List<Map<String, Object>>> getUserFavoriteFolders(@RequestParam Long userId) {
        return ResponseEntity.ok(documentService.getUserFavoriteFolders(userId));
    }

    @PutMapping("/{documentId}/favorite/folder")
    public ResponseEntity<Boolean> updateFavoriteFolder(
            @PathVariable Long documentId,
            @RequestParam Long userId,
            @RequestParam String folderName) {
        return ResponseEntity.ok(documentService.updateFavoriteFolder(userId, documentId, folderName));
    }

    @PostMapping("/favorites/batch/delete")
    public ResponseEntity<Boolean> batchRemoveFavorites(
            @RequestParam Long userId,
            @RequestBody List<Long> documentIds) {
        return ResponseEntity.ok(documentService.batchRemoveFavorites(userId, documentIds));
    }

    // ========== 最近访问功能 ==========

    @PostMapping("/{documentId}/access")
    public ResponseEntity<Void> recordAccess(
            @PathVariable Long documentId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "view") String accessType) {
        documentService.recordAccess(userId, documentId, accessType);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recent")
    public ResponseEntity<List<DocumentAccessLog>> getRecentAccess(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(documentService.getRecentAccess(userId, limit));
    }

    @DeleteMapping("/recent/clear")
    public ResponseEntity<Boolean> clearAccessHistory(@RequestParam Long userId) {
        return ResponseEntity.ok(documentService.clearAccessHistory(userId));
    }

    // ========== 导出功能 ==========

    @GetMapping("/{documentId}/export/pdf")
    public ResponseEntity<byte[]> exportToPdf(@PathVariable Long documentId) {
        Document document = documentService.getDocumentById(documentId);
        byte[] pdfContent = documentService.exportToPdf(documentId);
        
        String filename = URLEncoder.encode(document.getTitle() + ".pdf", StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }

    @GetMapping("/{documentId}/export/word")
    public ResponseEntity<byte[]> exportToWord(@PathVariable Long documentId) {
        Document document = documentService.getDocumentById(documentId);
        byte[] wordContent = documentService.exportToWord(documentId);
        
        String filename = URLEncoder.encode(document.getTitle() + ".doc", StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/msword"))
                .body(wordContent);
    }

    @GetMapping("/{documentId}/export/markdown")
    public ResponseEntity<String> exportToMarkdown(@PathVariable Long documentId) {
        Document document = documentService.getDocumentById(documentId);
        String markdownContent = documentService.exportToMarkdown(documentId);
        
        String filename = URLEncoder.encode(document.getTitle() + ".md", StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/markdown; charset=UTF-8"))
                .body(markdownContent);
    }

    @GetMapping("/{documentId}/export/html")
    public ResponseEntity<String> exportToHtml(@PathVariable Long documentId) {
        Document document = documentService.getDocumentById(documentId);
        String htmlContent = documentService.exportToHtml(documentId);
        
        String filename = URLEncoder.encode(document.getTitle() + ".html", StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_HTML)
                .body(htmlContent);
    }
}