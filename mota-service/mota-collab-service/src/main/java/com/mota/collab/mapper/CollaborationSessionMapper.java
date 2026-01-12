package com.mota.collab.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.collab.entity.CollaborationSession;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 协作会话Mapper
 */
@Mapper
public interface CollaborationSessionMapper extends BaseMapper<CollaborationSession> {

    /**
     * 查询文档的活跃会话
     */
    @Select("SELECT * FROM collaboration_session WHERE document_id = #{documentId} AND status = 'active' ORDER BY joined_at ASC")
    List<CollaborationSession> selectActiveSessionsByDocument(@Param("documentId") Long documentId);

    /**
     * 查询用户的会话
     */
    @Select("SELECT * FROM collaboration_session WHERE user_id = #{userId} AND status = 'active'")
    List<CollaborationSession> selectActiveSessionsByUser(@Param("userId") Long userId);

    /**
     * 根据会话ID查询
     */
    @Select("SELECT * FROM collaboration_session WHERE session_id = #{sessionId}")
    CollaborationSession selectBySessionId(@Param("sessionId") String sessionId);

    /**
     * 更新光标位置
     */
    @Update("UPDATE collaboration_session SET cursor_position = #{cursorPosition}, last_active_at = NOW() WHERE session_id = #{sessionId}")
    int updateCursorPosition(@Param("sessionId") String sessionId, @Param("cursorPosition") String cursorPosition);

    /**
     * 更新选区范围
     */
    @Update("UPDATE collaboration_session SET selection_range = #{selectionRange}, last_active_at = NOW() WHERE session_id = #{sessionId}")
    int updateSelectionRange(@Param("sessionId") String sessionId, @Param("selectionRange") String selectionRange);

    /**
     * 更新会话状态
     */
    @Update("UPDATE collaboration_session SET status = #{status}, left_at = CASE WHEN #{status} = 'disconnected' THEN NOW() ELSE left_at END WHERE session_id = #{sessionId}")
    int updateSessionStatus(@Param("sessionId") String sessionId, @Param("status") String status);

    /**
     * 统计文档的在线用户数
     */
    @Select("SELECT COUNT(DISTINCT user_id) FROM collaboration_session WHERE document_id = #{documentId} AND status = 'active'")
    int countOnlineUsers(@Param("documentId") Long documentId);

    /**
     * 清理过期会话（超过30分钟未活动）
     */
    @Update("UPDATE collaboration_session SET status = 'disconnected', left_at = NOW() WHERE status = 'active' AND last_active_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)")
    int cleanupExpiredSessions();

    /**
     * 删除用户在文档中的所有会话
     */
    @Delete("DELETE FROM collaboration_session WHERE document_id = #{documentId} AND user_id = #{userId}")
    int deleteByDocumentAndUser(@Param("documentId") Long documentId, @Param("userId") Long userId);

    /**
     * 根据文档ID和用户ID查询会话
     */
    @Select("SELECT * FROM collaboration_session WHERE document_id = #{documentId} AND user_id = #{userId} AND status = 'active' LIMIT 1")
    CollaborationSession selectByDocumentAndUser(@Param("documentId") Long documentId, @Param("userId") Long userId);

    /**
     * 更新最后活跃时间
     */
    @Update("UPDATE collaboration_session SET last_active_at = NOW() WHERE session_id = #{sessionId}")
    int updateLastActiveTime(@Param("sessionId") String sessionId);
}