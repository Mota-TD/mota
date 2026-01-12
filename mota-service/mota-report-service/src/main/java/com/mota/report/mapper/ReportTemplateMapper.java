package com.mota.report.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.report.entity.ReportTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 报表模板Mapper
 *
 * @author mota
 */
@Mapper
public interface ReportTemplateMapper extends BaseMapper<ReportTemplate> {

    /**
     * 根据编码查询模板
     */
    @Select("SELECT * FROM report_template WHERE code = #{code} AND tenant_id = #{tenantId} AND deleted = 0")
    ReportTemplate findByCode(@Param("code") String code, @Param("tenantId") Long tenantId);

    /**
     * 查询系统模板
     */
    @Select("SELECT * FROM report_template WHERE is_system = 1 AND status = 1 AND deleted = 0")
    List<ReportTemplate> findSystemTemplates();

    /**
     * 查询公开模板
     */
    @Select("SELECT * FROM report_template WHERE tenant_id = #{tenantId} AND is_public = 1 AND status = 1 AND deleted = 0")
    List<ReportTemplate> findPublicTemplates(@Param("tenantId") Long tenantId);

    /**
     * 按分类查询模板
     */
    @Select("SELECT * FROM report_template WHERE tenant_id = #{tenantId} AND category = #{category} AND status = 1 AND deleted = 0")
    List<ReportTemplate> findByCategory(@Param("tenantId") Long tenantId, @Param("category") String category);

    /**
     * 按类型查询模板
     */
    @Select("SELECT * FROM report_template WHERE tenant_id = #{tenantId} AND type = #{type} AND status = 1 AND deleted = 0")
    List<ReportTemplate> findByType(@Param("tenantId") Long tenantId, @Param("type") String type);

    /**
     * 查询用户创建的模板
     */
    @Select("SELECT * FROM report_template WHERE tenant_id = #{tenantId} AND created_by = #{userId} AND deleted = 0")
    List<ReportTemplate> findByCreator(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 增加使用次数
     */
    @Update("UPDATE report_template SET usage_count = usage_count + 1 WHERE id = #{id}")
    int incrementUsageCount(@Param("id") Long id);

    /**
     * 查询热门模板
     */
    @Select("SELECT * FROM report_template WHERE tenant_id = #{tenantId} AND status = 1 AND deleted = 0 " +
            "ORDER BY usage_count DESC LIMIT #{limit}")
    List<ReportTemplate> findPopularTemplates(@Param("tenantId") Long tenantId, @Param("limit") int limit);

    /**
     * 分页查询模板
     */
    @Select("<script>" +
            "SELECT * FROM report_template WHERE tenant_id = #{tenantId} AND deleted = 0 " +
            "<if test='keyword != null and keyword != \"\"'>" +
            "AND (name LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%')) " +
            "</if>" +
            "<if test='category != null and category != \"\"'>" +
            "AND category = #{category} " +
            "</if>" +
            "<if test='type != null and type != \"\"'>" +
            "AND type = #{type} " +
            "</if>" +
            "ORDER BY created_at DESC" +
            "</script>")
    IPage<ReportTemplate> findByCondition(Page<ReportTemplate> page,
                                          @Param("tenantId") Long tenantId,
                                          @Param("keyword") String keyword,
                                          @Param("category") String category,
                                          @Param("type") String type);
}