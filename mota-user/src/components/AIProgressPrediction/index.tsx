/**
 * AI进度预测组件
 * AI预测项目完成时间
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  Spin,
  Empty,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Progress,
  List,
  Alert,
  Timeline,
  Collapse,
  message,
  Tooltip,
  Badge
} from 'antd'
import {
  RobotOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
  RocketOutlined,
  FlagOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { progressTrackingApi, AIProgressPredictionData } from '@/services/api/progressTracking'
import styles from './index.module.css'

const { Panel } = Collapse

interface AIProgressPredictionProps {
  projectId: number
}

const AIProgressPrediction: React.FC<AIProgressPredictionProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AIProgressPredictionData | null>(null)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await progressTrackingApi.getAIProgressPrediction(projectId)
      setData(result)
    } catch (error) {
      console.error('Load AI prediction error:', error)
      message.error('加载AI预测数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'ahead':
        return <RocketOutlined style={{ color: '#1677ff' }} />
      case 'at_risk':
        return <WarningOutlined style={{ color: '#faad14' }} />
      case 'delayed':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <ClockCircleOutlined />
    }
  }

  // 生成进度趋势图配置
  const trendChartOption = useMemo(() => {
    if (!data || !data.progressTrend) return {}

    const dates = data.progressTrend.map(p => {
      const d = new Date(p.date)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    
    const actualData = data.progressTrend.map(p => p.actualProgress ?? null)
    const plannedData = data.progressTrend.map(p => p.plannedProgress)
    const predictedData = data.progressTrend.map(p => p.predictedProgress ?? null)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['实际进度', '计划进度', '预测进度'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '进度 (%)',
        min: 0,
        max: 100
      },
      series: [
        {
          name: '实际进度',
          type: 'line',
          data: actualData,
          lineStyle: { color: '#52c41a', width: 3 },
          itemStyle: { color: '#52c41a' },
          areaStyle: { color: 'rgba(82, 196, 26, 0.1)' },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: '计划进度',
          type: 'line',
          data: plannedData,
          lineStyle: { color: '#1677ff', width: 2, type: 'dashed' },
          itemStyle: { color: '#1677ff' },
          symbol: 'none'
        },
        {
          name: '预测进度',
          type: 'line',
          data: predictedData,
          lineStyle: { color: '#722ed1', width: 2, type: 'dashed' },
          itemStyle: { color: '#722ed1' },
          symbol: 'none'
        }
      ]
    }
  }, [data])

  // 生成完成概率分布图配置
  const probabilityChartOption = useMemo(() => {
    if (!data || !data.completionProbabilities) return {}

    const dates = data.completionProbabilities.map(p => {
      const d = new Date(p.date)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    const probabilities = data.completionProbabilities.map(p => (p.probability * 100).toFixed(0))

    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '概率 (%)',
        max: 100
      },
      series: [
        {
          type: 'bar',
          data: probabilities,
          itemStyle: {
            color: '#722ed1'
          },
          barWidth: '60%'
        }
      ]
    }
  }, [data])

  if (loading) {
    return (
      <Card className={styles.container}>
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className={styles.container}>
        <Empty description="暂无数据" />
      </Card>
    )
  }

  return (
    <div className={styles.container}>
      {/* 预测概览卡片 */}
      <Card
        className={styles.overviewCard}
        title={
          <Space>
            <RobotOutlined />
            <span>AI进度预测</span>
            <Tag color={progressTrackingApi.getPredictionStatusColor(data.predictionStatus)}>
              {getStatusIcon(data.predictionStatus)}
              {progressTrackingApi.getPredictionStatusText(data.predictionStatus)}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="预测置信度">
              <Tag color="purple">置信度: {(data.confidence * 100).toFixed(0)}%</Tag>
            </Tooltip>
            <Tooltip title="历史准确度">
              <Tag color="blue">历史准确度: {(data.historicalAccuracy * 100).toFixed(0)}%</Tag>
            </Tooltip>
          </Space>
        }
      >
        {/* 预测状态提示 */}
        {data.predictionStatus === 'delayed' && (
          <Alert
            message="项目进度预警"
            description={`预计延迟 ${data.deviationDays} 天完成，建议采取措施加速项目进度。`}
            type="error"
            showIcon
            className={styles.alertBox}
          />
        )}
        {data.predictionStatus === 'at_risk' && (
          <Alert
            message="项目存在风险"
            description="当前进度存在一定风险，请关注下方风险因素并及时处理。"
            type="warning"
            showIcon
            className={styles.alertBox}
          />
        )}

        {/* 核心指标 */}
        <Row gutter={16} className={styles.statsRow}>
          <Col span={6}>
            <Statistic
              title="当前进度"
              value={data.currentProgress}
              suffix="%"
              prefix={<Progress type="circle" percent={data.currentProgress} size={40} />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="计划完成日期"
              value={data.plannedCompletionDate}
              prefix={<FlagOutlined />}
              valueStyle={{ fontSize: 16 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="预测完成日期"
              value={data.predictedCompletionDate}
              prefix={<RobotOutlined />}
              valueStyle={{ 
                fontSize: 16,
                color: data.deviationDays > 0 ? '#ff4d4f' : 
                       data.deviationDays < 0 ? '#52c41a' : '#1677ff'
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="偏差天数"
              value={Math.abs(data.deviationDays)}
              prefix={data.deviationDays > 0 ? '延迟' : data.deviationDays < 0 ? '提前' : ''}
              suffix="天"
              valueStyle={{ 
                color: data.deviationDays > 0 ? '#ff4d4f' : 
                       data.deviationDays < 0 ? '#52c41a' : '#1677ff'
              }}
            />
          </Col>
        </Row>

        {/* 进度趋势图 */}
        <div className={styles.chartSection}>
          <h4>进度趋势预测</h4>
          <ReactECharts 
            option={trendChartOption} 
            style={{ height: 300 }}
            notMerge={true}
          />
        </div>
      </Card>

      {/* 里程碑预测 */}
      {data.milestonePredictions && data.milestonePredictions.length > 0 && (
        <Card 
          className={styles.milestoneCard}
          title={
            <Space>
              <FlagOutlined />
              <span>里程碑预测</span>
            </Space>
          }
        >
          <Timeline mode="left">
            {data.milestonePredictions.map((milestone) => (
              <Timeline.Item
                key={milestone.milestoneId}
                color={
                  milestone.status === 'completed' ? 'green' :
                  milestone.status === 'on_track' ? 'blue' :
                  milestone.status === 'at_risk' ? 'orange' : 'red'
                }
                label={milestone.predictedDate}
              >
                <div className={styles.milestoneItem}>
                  <Space>
                    <span className={styles.milestoneName}>{milestone.milestoneName}</span>
                    <Tag color={
                      milestone.status === 'completed' ? 'green' :
                      milestone.status === 'on_track' ? 'blue' :
                      milestone.status === 'at_risk' ? 'orange' : 'red'
                    }>
                      {milestone.status === 'completed' ? '已完成' :
                       milestone.status === 'on_track' ? '按计划' :
                       milestone.status === 'at_risk' ? '有风险' : '已延迟'}
                    </Tag>
                  </Space>
                  <div className={styles.milestoneInfo}>
                    <span>计划: {milestone.plannedDate}</span>
                    {milestone.deviationDays !== 0 && (
                      <span style={{ 
                        color: milestone.deviationDays > 0 ? '#ff4d4f' : '#52c41a',
                        marginLeft: 12
                      }}>
                        {milestone.deviationDays > 0 ? `延迟${milestone.deviationDays}天` : `提前${Math.abs(milestone.deviationDays)}天`}
                      </span>
                    )}
                    <span style={{ marginLeft: 12 }}>
                      完成概率: {(milestone.completionProbability * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* 风险因素和加速建议 */}
      <Row gutter={16}>
        {/* 风险因素 */}
        {data.riskFactors && data.riskFactors.length > 0 && (
          <Col span={12}>
            <Card 
              className={styles.riskCard}
              title={
                <Space>
                  <WarningOutlined />
                  <span>风险因素</span>
                  <Badge count={data.riskFactors.length} />
                </Space>
              }
            >
              <List
                dataSource={data.riskFactors}
                renderItem={(risk) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Tag color={progressTrackingApi.getRiskSeverityColor(risk.severity)}>
                          {progressTrackingApi.getRiskSeverityText(risk.severity)}
                        </Tag>
                      }
                      title={risk.name}
                      description={
                        <div>
                          <p>{risk.description}</p>
                          <Space>
                            <Tag>影响: {risk.impactDays}天</Tag>
                            <Tag>概率: {(risk.probability * 100).toFixed(0)}%</Tag>
                          </Space>
                          {risk.mitigation && (
                            <div className={styles.mitigation}>
                              <BulbOutlined /> 缓解措施: {risk.mitigation}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        )}

        {/* 加速建议 */}
        {data.accelerationSuggestions && data.accelerationSuggestions.length > 0 && (
          <Col span={data.riskFactors && data.riskFactors.length > 0 ? 12 : 24}>
            <Card 
              className={styles.suggestionCard}
              title={
                <Space>
                  <ThunderboltOutlined />
                  <span>加速建议</span>
                </Space>
              }
            >
              <List
                dataSource={data.accelerationSuggestions}
                renderItem={(suggestion, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Badge count={index + 1} style={{ backgroundColor: '#722ed1' }} />
                      }
                      title={suggestion.title}
                      description={
                        <div>
                          <p>{suggestion.description}</p>
                          <Space>
                            <Tag color="green">节省: {suggestion.savedDays}天</Tag>
                            <Tag color={
                              suggestion.difficulty === 'easy' ? 'green' :
                              suggestion.difficulty === 'medium' ? 'orange' : 'red'
                            }>
                              难度: {suggestion.difficulty === 'easy' ? '简单' :
                                     suggestion.difficulty === 'medium' ? '中等' : '困难'}
                            </Tag>
                          </Space>
                          {suggestion.resourceRequirement && (
                            <div className={styles.resource}>
                              资源需求: {suggestion.resourceRequirement}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* 完成概率分布 */}
      <Card 
        className={styles.probabilityCard}
        title={
          <Space>
            <RobotOutlined />
            <span>完成概率分布</span>
          </Space>
        }
      >
        <ReactECharts 
          option={probabilityChartOption} 
          style={{ height: 200 }}
          notMerge={true}
        />
      </Card>

      {/* 预测信息 */}
      <div className={styles.predictionInfo}>
        <Space>
          <span>模型版本: {data.modelVersion}</span>
          <span>|</span>
          <span>预测时间: {data.predictionTime}</span>
        </Space>
      </div>
    </div>
  )
}

export default AIProgressPrediction