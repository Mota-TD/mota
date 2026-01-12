package com.mota.report.service;

import com.mota.report.entity.Report;
import com.mota.report.entity.ReportTemplate;

import java.util.Map;

/**
 * 报表生成服务接口
 *
 * @author mota
 */
public interface ReportGenerateService {

    /**
     * 生成报表
     *
     * @param report   报表实例
     * @param template 报表模板
     * @return 生成的报表
     */
    Report generate(Report report, ReportTemplate template);

    /**
     * 获取报表数据
     *
     * @param template    报表模板
     * @param queryParams 查询参数
     * @return 报表数据
     */
    Map<String, Object> fetchData(ReportTemplate template, Map<String, Object> queryParams);

    /**
     * 导出为Excel
     *
     * @param report 报表实例
     * @param data   报表数据
     * @return 文件路径
     */
    String exportToExcel(Report report, Map<String, Object> data);

    /**
     * 导出为PDF
     *
     * @param report 报表实例
     * @param data   报表数据
     * @return 文件路径
     */
    String exportToPdf(Report report, Map<String, Object> data);

    /**
     * 导出为Word
     *
     * @param report 报表实例
     * @param data   报表数据
     * @return 文件路径
     */
    String exportToWord(Report report, Map<String, Object> data);

    /**
     * 导出为HTML
     *
     * @param report 报表实例
     * @param data   报表数据
     * @return 文件路径
     */
    String exportToHtml(Report report, Map<String, Object> data);
}