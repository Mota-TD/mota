import request from '../request'

// 燃尽图数据点
export interface BurndownDataPoint {
  date: string
  value: number
  completed: number
}

// 燃尽图数据
export interface BurndownChartData {
  projectId: number
  projectName: string
  sprintId?: number
  sprintName?: string
  startDate: string
  endDate: string
  totalPoints: number
  idealLine: BurndownDataPoint[]
  actualLine: BurndownDataPoint[]
  predictedLine: BurndownDataPoint[]
  remainingPoints: number
  completionPercentage: number
  onTrack: boolean
  deviationDays: number
}

// 燃起图数据点
export interface BurnupDataPoint {
  date: string
  value: number
  dailyCompleted: number
}

// 范围数据点
export interface ScopeDataPoint {
  date: string
  totalScope: number
  scopeChange: number
  changeReason?: string
}

// 燃起图数据
export interface BurnupChartData {
  projectId: number
  projectName: string
  startDate: string
  endDate: string
  totalScope: number
  scopeLine: ScopeDataPoint[]
  completedLine: BurnupDataPoint[]
  idealLine: BurnupDataPoint[]
  predictedLine: BurnupDataPoint[]
  completedPoints: number
  completionPercentage: number
  scopeChange: number
  scopeChangePercentage: number
  predictedCompletionDate?: string
  onTrack: boolean
}

// Sprint速度数据
export interface SprintVelocity {
  sprintId: number
  sprintName: string
  startDate: string
  endDate: string
  plannedPoints: number
  completedPoints: number
  completionRate: number
  committedTasks: number
  completedTasks: number
  addedTasks: number
  removedTasks: number
  teamSize: number
  pointsPerMember: number
}

// 速度分析
export interface VelocityAnalysis {
  period: string
  conclusion: string
  factors: string[]
  suggestions: string[]
}

// 速度趋势数据
export interface VelocityTrendData {
  projectId: number
  projectName: string
  teamId: number
  teamName: string
  sprintVelocities: SprintVelocity[]
  averageVelocity: number
  velocityTrend: 'increasing' | 'decreasing' | 'stable'
  velocityChangePercentage: number
  maxVelocity: number
  minVelocity: number
  velocityStdDev: number
  predictedNextVelocity: number
  predictionConfidence: number
  teamSize: number
  velocityPerMember: number
  analysis: VelocityAnalysis
}

// 完成概率
export interface CompletionProbability {
  date: string
  probability: number
  cumulativeProbability: number
}

// 风险因素
export interface RiskFactor {
  id: string
  name: string
  type: 'resource' | 'scope' | 'technical' | 'external'
  severity: 'low' | 'medium' | 'high' | 'critical'
  impactDays: number
  probability: number
  description: string
  mitigation: string
}

// 加速建议
export interface AccelerationSuggestion {
  id: string
  title: string
  description: string
  savedDays: number
  difficulty: 'easy' | 'medium' | 'hard'
  resourceRequirement: string
  priority: number
}

// 进度趋势点
export interface ProgressTrendPoint {
  date: string
  actualProgress?: number
  plannedProgress: number
  predictedProgress?: number
  isPredicted: boolean
}

// 里程碑预测
export interface MilestonePrediction {
  milestoneId: number
  milestoneName: string
  plannedDate: string
  predictedDate: string
  completionProbability: number
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed'
  deviationDays: number
}

// AI进度预测数据
export interface AIProgressPredictionData {
  projectId: number
  projectName: string
  currentProgress: number
  plannedCompletionDate: string
  predictedCompletionDate: string
  confidence: number
  predictionStatus: 'on_track' | 'at_risk' | 'delayed' | 'ahead'
  deviationDays: number
  completionProbabilities: CompletionProbability[]
  riskFactors: RiskFactor[]
  accelerationSuggestions: AccelerationSuggestion[]
  historicalAccuracy: number
  modelVersion: string
  predictionTime: string
  progressTrend: ProgressTrendPoint[]
  milestonePredictions: MilestonePrediction[]
}

// 进度跟踪API
export const progressTrackingApi = {
  /**
   * 获取燃尽图数据
   */
  getBurndownChart: (projectId: number, sprintId?: number): Promise<BurndownChartData> => {
    const params: Record<string, string | number | boolean | undefined> = sprintId ? { sprintId } : {}
    return request.get(`/api/v1/progress/burndown/${projectId}`, params)
  },

  /**
   * 获取燃起图数据
   */
  getBurnupChart: (projectId: number): Promise<BurnupChartData> => {
    return request.get(`/api/v1/progress/burnup/${projectId}`)
  },

  /**
   * 获取速度趋势数据
   */
  getVelocityTrend: (projectId: number, sprintCount?: number): Promise<VelocityTrendData> => {
    const params: Record<string, string | number | boolean | undefined> = sprintCount ? { sprintCount } : {}
    return request.get(`/api/v1/progress/velocity/${projectId}`, params)
  },

  /**
   * 获取AI进度预测数据
   */
  getAIProgressPrediction: (projectId: number): Promise<AIProgressPredictionData> => {
    return request.get(`/api/v1/progress/ai-prediction/${projectId}`)
  },

  /**
   * 获取预测状态文本
   */
  getPredictionStatusText: (status: string): string => {
    const statusMap: Record<string, string> = {
      on_track: '按计划进行',
      at_risk: '存在风险',
      delayed: '已延迟',
      ahead: '提前完成'
    }
    return statusMap[status] || status
  },

  /**
   * 获取预测状态颜色
   */
  getPredictionStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      on_track: 'green',
      at_risk: 'orange',
      delayed: 'red',
      ahead: 'blue'
    }
    return colorMap[status] || 'default'
  },

  /**
   * 获取风险等级文本
   */
  getRiskSeverityText: (severity: string): string => {
    const severityMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '严重'
    }
    return severityMap[severity] || severity
  },

  /**
   * 获取风险等级颜色
   */
  getRiskSeverityColor: (severity: string): string => {
    const colorMap: Record<string, string> = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'magenta'
    }
    return colorMap[severity] || 'default'
  },

  /**
   * 获取速度趋势文本
   */
  getVelocityTrendText: (trend: string): string => {
    const trendMap: Record<string, string> = {
      increasing: '上升趋势',
      decreasing: '下降趋势',
      stable: '保持稳定'
    }
    return trendMap[trend] || trend
  },

  /**
   * 获取速度趋势颜色
   */
  getVelocityTrendColor: (trend: string): string => {
    const colorMap: Record<string, string> = {
      increasing: 'green',
      decreasing: 'red',
      stable: 'blue'
    }
    return colorMap[trend] || 'default'
  }
}

export default progressTrackingApi