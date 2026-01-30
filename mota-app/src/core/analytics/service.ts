/**
 * 报表分析服务实现
 */

import http from '../http/request';
import {
  ReportType,
  TimeRange,
  type ReportData,
  type ReportRequest,
  type TrendPrediction,
  type AnomalyDetection,
  type AIInsight
} from './types';

/**
 * 报表分析服务类
 */
class AnalyticsService {
  private readonly baseUrl = '/api/analytics';

  /**
   * 获取报表数据
   */
  async getReport(request: ReportRequest): Promise<ReportData> {
    return await http.post<ReportData>(`${this.baseUrl}/report`, request);
  }

  /**
   * 获取趋势预测
   */
  async getTrendPrediction(
    metric: string,
    days: number = 7
  ): Promise<TrendPrediction[]> {
    return await http.get<TrendPrediction[]>(`${this.baseUrl}/trend`, {
      metric,
      days
    });
  }

  /**
   * 异常检测
   */
  async detectAnomalies(
    metric: string,
    timeRange: TimeRange
  ): Promise<AnomalyDetection[]> {
    return await http.get<AnomalyDetection[]>(`${this.baseUrl}/anomaly`, {
      metric,
      timeRange
    });
  }

  /**
   * 获取AI洞察
   */
  async getInsights(projectId?: string): Promise<AIInsight[]> {
    return await http.get<AIInsight[]>(`${this.baseUrl}/insights`, {
      projectId
    });
  }

  /**
   * 导出报表
   */
  async exportReport(
    request: ReportRequest,
    format: 'pdf' | 'excel' | 'image' = 'pdf'
  ): Promise<string> {
    const response = await http.post<{ url: string }>(`${this.baseUrl}/export`, {
      ...request,
      format
    });
    return response.url;
  }

  /**
   * 获取报表类型列表
   */
  getReportTypes(): Array<{ value: ReportType; label: string; icon: string }> {
    return [
      { value: ReportType.PROJECT_OVERVIEW, label: '项目概览', icon: '📊' },
      { value: ReportType.TASK_STATISTICS, label: '任务统计', icon: '✅' },
      { value: ReportType.TEAM_PERFORMANCE, label: '团队效能', icon: '👥' },
      { value: ReportType.PROGRESS_ANALYSIS, label: '进度分析', icon: '📈' },
      { value: ReportType.RISK_ASSESSMENT, label: '风险评估', icon: '⚠️' }
    ];
  }

  /**
   * 获取时间范围列表
   */
  getTimeRanges(): Array<{ value: TimeRange; label: string }> {
    return [
      { value: TimeRange.TODAY, label: '今日' },
      { value: TimeRange.THIS_WEEK, label: '本周' },
      { value: TimeRange.THIS_MONTH, label: '本月' },
      { value: TimeRange.THIS_QUARTER, label: '本季度' },
      { value: TimeRange.THIS_YEAR, label: '本年' },
      { value: TimeRange.CUSTOM, label: '自定义' }
    ];
  }

  /**
   * 格式化指标值
   */
  formatMetricValue(value: number, unit?: string): string {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'h') {
      return `${value.toFixed(1)}小时`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  }

  /**
   * 获取趋势图标
   */
  getTrendIcon(trend?: 'up' | 'down' | 'stable'): string {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  }

  /**
   * 获取重要度颜色
   */
  getImportanceColor(importance: 'high' | 'medium' | 'low'): string {
    if (importance === 'high') return '#EF4444';
    if (importance === 'medium') return '#F59E0B';
    return '#10B981';
  }
}

// 导出单例
export const analyticsService = new AnalyticsService();