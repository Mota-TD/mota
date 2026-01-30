/**
 * 报表分析类型定义
 */

/**
 * 报表类型
 */
export enum ReportType {
  /** 项目概览 */
  PROJECT_OVERVIEW = 'project_overview',
  /** 任务统计 */
  TASK_STATISTICS = 'task_statistics',
  /** 团队效能 */
  TEAM_PERFORMANCE = 'team_performance',
  /** 进度分析 */
  PROGRESS_ANALYSIS = 'progress_analysis',
  /** 风险评估 */
  RISK_ASSESSMENT = 'risk_assessment'
}

/**
 * 时间范围
 */
export enum TimeRange {
  /** 今日 */
  TODAY = 'today',
  /** 本周 */
  THIS_WEEK = 'this_week',
  /** 本月 */
  THIS_MONTH = 'this_month',
  /** 本季度 */
  THIS_QUARTER = 'this_quarter',
  /** 本年 */
  THIS_YEAR = 'this_year',
  /** 自定义 */
  CUSTOM = 'custom'
}

/**
 * 图表类型
 */
export enum ChartType {
  /** 折线图 */
  LINE = 'line',
  /** 柱状图 */
  BAR = 'bar',
  /** 饼图 */
  PIE = 'pie',
  /** 雷达图 */
  RADAR = 'radar',
  /** 散点图 */
  SCATTER = 'scatter'
}

/**
 * 数据点
 */
export interface DataPoint {
  /** 标签 */
  label: string;
  /** 值 */
  value: number;
  /** 额外数据 */
  extra?: Record<string, any>;
}

/**
 * 图表数据
 */
export interface ChartData {
  /** 图表类型 */
  type: ChartType;
  /** 标题 */
  title: string;
  /** 数据系列 */
  series: Array<{
    name: string;
    data: DataPoint[];
  }>;
  /** 配置选项 */
  options?: Record<string, any>;
}

/**
 * 统计指标
 */
export interface Metric {
  /** 指标名称 */
  name: string;
  /** 当前值 */
  value: number;
  /** 单位 */
  unit?: string;
  /** 变化率 */
  change?: number;
  /** 趋势 */
  trend?: 'up' | 'down' | 'stable';
  /** 目标值 */
  target?: number;
}

/**
 * AI洞察
 */
export interface AIInsight {
  /** 洞察ID */
  id: string;
  /** 洞察类型 */
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 重要度 */
  importance: 'high' | 'medium' | 'low';
  /** 相关数据 */
  relatedData?: any;
  /** 建议操作 */
  actions?: string[];
}

/**
 * 报表数据
 */
export interface ReportData {
  /** 报表类型 */
  type: ReportType;
  /** 时间范围 */
  timeRange: TimeRange;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 关键指标 */
  metrics: Metric[];
  /** 图表数据 */
  charts: ChartData[];
  /** AI洞察 */
  insights: AIInsight[];
  /** 生成时间 */
  generateTime: string;
}

/**
 * 报表请求
 */
export interface ReportRequest {
  /** 报表类型 */
  type: ReportType;
  /** 时间范围 */
  timeRange: TimeRange;
  /** 自定义开始时间 */
  startTime?: string;
  /** 自定义结束时间 */
  endTime?: string;
  /** 项目ID */
  projectId?: string;
  /** 团队ID */
  teamId?: string;
}

/**
 * 趋势预测
 */
export interface TrendPrediction {
  /** 预测时间点 */
  time: string;
  /** 预测值 */
  value: number;
  /** 置信区间 */
  confidence: {
    lower: number;
    upper: number;
  };
}

/**
 * 异常检测结果
 */
export interface AnomalyDetection {
  /** 异常时间 */
  time: string;
  /** 异常值 */
  value: number;
  /** 异常分数 */
  score: number;
  /** 异常原因 */
  reason: string;
}