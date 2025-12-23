import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, Spin, Tag, Typography, Tabs } from 'antd'
import { 
  RocketOutlined, 
  ClockCircleOutlined,
  BugOutlined,
  ToolOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  PauseCircleOutlined
} from '@ant-design/icons'
import * as metricsApi from '@/services/api/metrics'
import styles from './index.module.css'

const { Title, Text } = Typography

interface DoraMetric {
  value: number
  unit: string
  trend: number
  level: string
}

interface Metrics {
  dora: {
    deploymentFrequency: DoraMetric
    leadTime: DoraMetric
    changeFailureRate: DoraMetric
    mttr: DoraMetric
  }
  codeQuality: {
    coverage: number
    duplication: number
    technicalDebt: string
    codeSmells: number
  }
  buildStats: {
    total: number
    success: number
    failed: number
    successRate: number
  }
  issueStats: {
    completed: number
    inProgress: number
    pending: number
  }
}

const MetricsPage = () => {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const res = await metricsApi.getMetrics()
      setMetrics(res as any)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'elite': return '#52c41a'
      case 'high': return '#1890ff'
      case 'medium': return '#faad14'
      case 'low': return '#ff4d4f'
      default: return '#999'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'elite': return '精英'
      case 'high': return '高效'
      case 'medium': return '中等'
      case 'low': return '待改进'
      default: return level
    }
  }

  const renderTrend = (trend: number) => {
    if (trend > 0) {
      return (
        <span className={styles.trendUp}>
          <ArrowUpOutlined /> {Math.abs(trend)}%
        </span>
      )
    } else if (trend < 0) {
      return (
        <span className={styles.trendDown}>
          <ArrowDownOutlined /> {Math.abs(trend)}%
        </span>
      )
    }
    return <span className={styles.trendNeutral}>持平</span>
  }

  if (loading || !metrics) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  const doraItems = [
    {
      key: 'dora',
      label: 'DORA 指标',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <RocketOutlined className={styles.metricIcon} style={{ color: '#2b7de9' }} />
                <Tag color={getLevelColor(metrics.dora.deploymentFrequency.level)}>
                  {getLevelText(metrics.dora.deploymentFrequency.level)}
                </Tag>
              </div>
              <Statistic
                title="部署频率"
                value={metrics.dora.deploymentFrequency.value}
                suffix={metrics.dora.deploymentFrequency.unit}
              />
              <div className={styles.trend}>
                较上周 {renderTrend(metrics.dora.deploymentFrequency.trend)}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <ClockCircleOutlined className={styles.metricIcon} style={{ color: '#10b981' }} />
                <Tag color={getLevelColor(metrics.dora.leadTime.level)}>
                  {getLevelText(metrics.dora.leadTime.level)}
                </Tag>
              </div>
              <Statistic
                title="变更前置时间"
                value={metrics.dora.leadTime.value}
                suffix={metrics.dora.leadTime.unit}
              />
              <div className={styles.trend}>
                较上周 {renderTrend(metrics.dora.leadTime.trend)}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <BugOutlined className={styles.metricIcon} style={{ color: '#f59e0b' }} />
                <Tag color={getLevelColor(metrics.dora.changeFailureRate.level)}>
                  {getLevelText(metrics.dora.changeFailureRate.level)}
                </Tag>
              </div>
              <Statistic
                title="变更失败率"
                value={metrics.dora.changeFailureRate.value}
                suffix={metrics.dora.changeFailureRate.unit}
              />
              <div className={styles.trend}>
                较上周 {renderTrend(metrics.dora.changeFailureRate.trend)}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <ToolOutlined className={styles.metricIcon} style={{ color: '#8b5cf6' }} />
                <Tag color={getLevelColor(metrics.dora.mttr.level)}>
                  {getLevelText(metrics.dora.mttr.level)}
                </Tag>
              </div>
              <Statistic
                title="平均恢复时间"
                value={metrics.dora.mttr.value}
                suffix={metrics.dora.mttr.unit}
              />
              <div className={styles.trend}>
                较上周 {renderTrend(metrics.dora.mttr.trend)}
              </div>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'quality',
      label: '代码质量',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Title level={5}>测试覆盖率</Title>
              <Progress
                type="circle"
                percent={metrics.codeQuality.coverage}
                strokeColor={metrics.codeQuality.coverage >= 80 ? '#52c41a' : metrics.codeQuality.coverage >= 60 ? '#faad14' : '#ff4d4f'}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Title level={5}>代码重复率</Title>
              <Progress
                type="circle"
                percent={metrics.codeQuality.duplication}
                strokeColor={metrics.codeQuality.duplication <= 5 ? '#52c41a' : metrics.codeQuality.duplication <= 10 ? '#faad14' : '#ff4d4f'}
                format={(percent) => `${percent}%`}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Statistic
                title="技术债务"
                value={metrics.codeQuality.technicalDebt}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.metricCard}>
              <Statistic
                title="代码异味"
                value={metrics.codeQuality.codeSmells}
                suffix="个"
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'build',
      label: '构建统计',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card className={styles.metricCard}>
              <Title level={5}>构建成功率</Title>
              <Progress
                percent={metrics.buildStats.successRate}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size="default"
              />
              <div className={styles.buildStats}>
                <div>
                  <Text type="success">成功: {metrics.buildStats.success}</Text>
                </div>
                <div>
                  <Text type="danger">失败: {metrics.buildStats.failed}</Text>
                </div>
                <div>
                  <Text>总计: {metrics.buildStats.total}</Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card className={styles.metricCard}>
              <Title level={5}>事项完成情况</Title>
              <div className={styles.issueStats}>
                <div className={styles.issueStat}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                  <div>
                    <div className={styles.issueValue}>{metrics.issueStats.completed}</div>
                    <div className={styles.issueLabel}>已完成</div>
                  </div>
                </div>
                <div className={styles.issueStat}>
                  <SyncOutlined style={{ color: '#1890ff', fontSize: 24 }} />
                  <div>
                    <div className={styles.issueValue}>{metrics.issueStats.inProgress}</div>
                    <div className={styles.issueLabel}>进行中</div>
                  </div>
                </div>
                <div className={styles.issueStat}>
                  <PauseCircleOutlined style={{ color: '#999', fontSize: 24 }} />
                  <div>
                    <div className={styles.issueValue}>{metrics.issueStats.pending}</div>
                    <div className={styles.issueLabel}>待处理</div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3}>效能度量</Title>
        <Text type="secondary">基于 DORA 指标的研发效能分析</Text>
      </div>

      <Tabs items={doraItems} />
    </div>
  )
}

export default MetricsPage