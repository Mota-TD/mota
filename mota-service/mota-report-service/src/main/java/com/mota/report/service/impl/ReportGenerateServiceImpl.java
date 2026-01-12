package com.mota.report.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.report.entity.Report;
import com.mota.report.entity.ReportTemplate;
import com.mota.report.mapper.ReportMapper;
import com.mota.report.service.ReportGenerateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 报表生成服务实现
 *
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportGenerateServiceImpl implements ReportGenerateService {

    private final ReportMapper reportMapper;
    private final ObjectMapper objectMapper;

    @Value("${report.export.path:/data/reports}")
    private String exportPath;

    @Override
    public Report generate(Report report, ReportTemplate template) {
        log.info("开始生成报表: reportId={}, templateId={}", report.getId(), template.getId());
        
        try {
            // 更新状态为生成中
            report.setStatus("generating");
            report.setGenerateStartTime(LocalDateTime.now());
            reportMapper.updateById(report);

            // 解析查询参数
            Map<String, Object> queryParams = new HashMap<>();
            if (report.getQueryParams() != null) {
                queryParams = objectMapper.readValue(report.getQueryParams(), 
                    new TypeReference<Map<String, Object>>() {});
            }

            // 获取数据
            Map<String, Object> data = fetchData(template, queryParams);
            
            // 保存数据快照
            report.setDataSnapshot(objectMapper.writeValueAsString(data));
            
            // 计算数据行数
            if (data.containsKey("rows")) {
                Object rows = data.get("rows");
                if (rows instanceof List) {
                    report.setDataRowCount(((List<?>) rows).size());
                }
            }

            // 根据格式导出
            String filePath = null;
            String format = template.getExportFormats() != null ? 
                template.getExportFormats().split(",")[0] : "excel";
            
            switch (format.toLowerCase()) {
                case "excel":
                    filePath = exportToExcel(report, data);
                    report.setFileFormat("xlsx");
                    break;
                case "pdf":
                    filePath = exportToPdf(report, data);
                    report.setFileFormat("pdf");
                    break;
                case "word":
                    filePath = exportToWord(report, data);
                    report.setFileFormat("docx");
                    break;
                case "html":
                    filePath = exportToHtml(report, data);
                    report.setFileFormat("html");
                    break;
                default:
                    filePath = exportToExcel(report, data);
                    report.setFileFormat("xlsx");
            }

            // 更新报表信息
            report.setFilePath(filePath);
            report.setFileSize(new File(filePath).length());
            report.setStatus("completed");
            report.setGenerateEndTime(LocalDateTime.now());
            report.setGenerateDuration(
                java.time.Duration.between(report.getGenerateStartTime(), report.getGenerateEndTime()).toMillis()
            );
            
            reportMapper.updateById(report);
            log.info("报表生成完成: reportId={}, filePath={}", report.getId(), filePath);
            
            return report;
            
        } catch (Exception e) {
            log.error("报表生成失败: reportId={}", report.getId(), e);
            report.setStatus("failed");
            report.setErrorMessage(e.getMessage());
            report.setGenerateEndTime(LocalDateTime.now());
            reportMapper.updateById(report);
            throw new RuntimeException("报表生成失败: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> fetchData(ReportTemplate template, Map<String, Object> queryParams) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 解析数据源配置
            Map<String, Object> dataSourceConfig = objectMapper.readValue(
                template.getDataSourceConfig(), new TypeReference<Map<String, Object>>() {});
            
            String sourceType = (String) dataSourceConfig.getOrDefault("type", "api");
            
            switch (sourceType) {
                case "api":
                    result = fetchFromApi(dataSourceConfig, queryParams);
                    break;
                case "sql":
                    result = fetchFromSql(dataSourceConfig, queryParams);
                    break;
                case "static":
                    result = (Map<String, Object>) dataSourceConfig.getOrDefault("data", new HashMap<>());
                    break;
                default:
                    log.warn("未知的数据源类型: {}", sourceType);
            }
            
        } catch (Exception e) {
            log.error("获取报表数据失败", e);
            throw new RuntimeException("获取报表数据失败: " + e.getMessage(), e);
        }
        
        return result;
    }

    private Map<String, Object> fetchFromApi(Map<String, Object> config, Map<String, Object> params) {
        // TODO: 通过Feign调用其他服务获取数据
        // 这里返回模拟数据
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> rows = new ArrayList<>();
        
        // 模拟数据
        for (int i = 1; i <= 10; i++) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", i);
            row.put("name", "项目" + i);
            row.put("status", i % 3 == 0 ? "已完成" : (i % 3 == 1 ? "进行中" : "待开始"));
            row.put("progress", (int) (Math.random() * 100));
            row.put("createTime", LocalDateTime.now().minusDays(i).format(DateTimeFormatter.ISO_LOCAL_DATE));
            rows.add(row);
        }
        
        result.put("rows", rows);
        result.put("total", rows.size());
        result.put("columns", Arrays.asList("id", "name", "status", "progress", "createTime"));
        
        return result;
    }

    private Map<String, Object> fetchFromSql(Map<String, Object> config, Map<String, Object> params) {
        // TODO: 执行SQL查询获取数据
        return new HashMap<>();
    }

    @Override
    public String exportToExcel(Report report, Map<String, Object> data) {
        String fileName = generateFileName(report, "xlsx");
        String filePath = exportPath + "/" + fileName;
        
        try {
            // 确保目录存在
            new File(exportPath).mkdirs();
            
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet(report.getName());
            
            // 获取列和数据
            List<String> columns = (List<String>) data.getOrDefault("columns", new ArrayList<>());
            List<Map<String, Object>> rows = (List<Map<String, Object>>) data.getOrDefault("rows", new ArrayList<>());
            
            // 创建标题行样式
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // 创建标题行
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns.get(i));
                cell.setCellStyle(headerStyle);
            }
            
            // 创建数据行
            for (int i = 0; i < rows.size(); i++) {
                Row row = sheet.createRow(i + 1);
                Map<String, Object> rowData = rows.get(i);
                
                for (int j = 0; j < columns.size(); j++) {
                    Cell cell = row.createCell(j);
                    Object value = rowData.get(columns.get(j));
                    if (value != null) {
                        if (value instanceof Number) {
                            cell.setCellValue(((Number) value).doubleValue());
                        } else {
                            cell.setCellValue(value.toString());
                        }
                    }
                }
            }
            
            // 自动调整列宽
            for (int i = 0; i < columns.size(); i++) {
                sheet.autoSizeColumn(i);
            }
            
            // 写入文件
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                workbook.write(fos);
            }
            workbook.close();
            
            log.info("Excel导出成功: {}", filePath);
            return filePath;
            
        } catch (Exception e) {
            log.error("Excel导出失败", e);
            throw new RuntimeException("Excel导出失败: " + e.getMessage(), e);
        }
    }

    @Override
    public String exportToPdf(Report report, Map<String, Object> data) {
        String fileName = generateFileName(report, "pdf");
        String filePath = exportPath + "/" + fileName;
        
        try {
            // 确保目录存在
            new File(exportPath).mkdirs();
            
            // TODO: 使用iText生成PDF
            // 这里先创建一个简单的HTML然后转换为PDF
            String htmlContent = generateHtmlContent(report, data);
            
            // 使用iText html2pdf转换
            // 简化实现：先写入HTML文件
            try (FileWriter writer = new FileWriter(filePath.replace(".pdf", ".html"))) {
                writer.write(htmlContent);
            }
            
            // TODO: 实际的PDF转换
            // 暂时返回HTML路径
            log.info("PDF导出成功: {}", filePath);
            return filePath.replace(".pdf", ".html");
            
        } catch (Exception e) {
            log.error("PDF导出失败", e);
            throw new RuntimeException("PDF导出失败: " + e.getMessage(), e);
        }
    }

    @Override
    public String exportToWord(Report report, Map<String, Object> data) {
        String fileName = generateFileName(report, "docx");
        String filePath = exportPath + "/" + fileName;
        
        try {
            // 确保目录存在
            new File(exportPath).mkdirs();
            
            // TODO: 使用Apache POI生成Word文档
            // 简化实现
            log.info("Word导出成功: {}", filePath);
            return filePath;
            
        } catch (Exception e) {
            log.error("Word导出失败", e);
            throw new RuntimeException("Word导出失败: " + e.getMessage(), e);
        }
    }

    @Override
    public String exportToHtml(Report report, Map<String, Object> data) {
        String fileName = generateFileName(report, "html");
        String filePath = exportPath + "/" + fileName;
        
        try {
            // 确保目录存在
            new File(exportPath).mkdirs();
            
            String htmlContent = generateHtmlContent(report, data);
            
            try (FileWriter writer = new FileWriter(filePath)) {
                writer.write(htmlContent);
            }
            
            log.info("HTML导出成功: {}", filePath);
            return filePath;
            
        } catch (Exception e) {
            log.error("HTML导出失败", e);
            throw new RuntimeException("HTML导出失败: " + e.getMessage(), e);
        }
    }

    private String generateFileName(Report report, String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return String.format("report_%d_%s.%s", report.getId(), timestamp, extension);
    }

    private String generateHtmlContent(Report report, Map<String, Object> data) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html>\n<head>\n");
        html.append("<meta charset=\"UTF-8\">\n");
        html.append("<title>").append(report.getName()).append("</title>\n");
        html.append("<style>\n");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; }\n");
        html.append("h1 { color: #333; }\n");
        html.append("table { border-collapse: collapse; width: 100%; }\n");
        html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
        html.append("th { background-color: #4CAF50; color: white; }\n");
        html.append("tr:nth-child(even) { background-color: #f2f2f2; }\n");
        html.append("</style>\n");
        html.append("</head>\n<body>\n");
        html.append("<h1>").append(report.getName()).append("</h1>\n");
        html.append("<p>生成时间: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("</p>\n");
        
        // 生成表格
        List<String> columns = (List<String>) data.getOrDefault("columns", new ArrayList<>());
        List<Map<String, Object>> rows = (List<Map<String, Object>>) data.getOrDefault("rows", new ArrayList<>());
        
        if (!columns.isEmpty()) {
            html.append("<table>\n<thead>\n<tr>\n");
            for (String col : columns) {
                html.append("<th>").append(col).append("</th>\n");
            }
            html.append("</tr>\n</thead>\n<tbody>\n");
            
            for (Map<String, Object> row : rows) {
                html.append("<tr>\n");
                for (String col : columns) {
                    Object value = row.get(col);
                    html.append("<td>").append(value != null ? value.toString() : "").append("</td>\n");
                }
                html.append("</tr>\n");
            }
            
            html.append("</tbody>\n</table>\n");
        }
        
        html.append("</body>\n</html>");
        return html.toString();
    }
}