/**
 * 团队效能指标组件
 * RP-004: 团队效能KPI展示
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Tag, Spin, Empty, Radio } from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { TeamEfficiencyKPI } from '@/services/api/reportAnalytics'
import { getTeamEfficiency } from '@/services/api/reportAnalytics'
import styles from './index.module.css'

interface TeamEfficiencyProps {
  teamId?: number
  startDate: string
  endDate: string
}

const TeamEfficiency: React.FC<TeamEfficiencyProps> = ({
  teamId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TeamEfficiencyKPI | null>(null)
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('WEEKLY')

  useEffect(() => {
    fetchData()
  }, [teamId, startDate, endDate, period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getTeamEfficiency({ teamId, period, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取团队效能数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpOutlined style={{ color: '#52c41a' }} />
    if (change < 0) return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
    return null
  }

  const getChangeColor = (change: number, inverse = false) => {
    if (inverse) {
      return change > 0 ? '#ff4d4f' : change < 0 ? '#52c41a' : '#8c8c8c'
    }
    return change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#8c8c8c'
  }

  // 效能趋势图
  const getTrendOption = () => {
    if (!data?.trends) return {}
    
    const trends = data.trends
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['完成率', '准时率', '速度'],
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
        data: trends.map(t => t.period),
        axisLabel: { fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          name: '百分比(%)',
          position: 'left',
          max: 100
        },
        {
          type: 'value',
          name: '速度',
          position: 'right'
        }
      ],
      series: [
        {
          name: '完成率',
          type: 'line',
          data: trends.map(t => t.completionRate != null ? Number(t.completionRate).toFixed(1) : null),
          itemStyle: { color: '#1890ff' },
          smooth: true
        },
        {
          name: '准时率',
          type: 'line',
          data: trends.map(t => t.onTimeRate != null ? Number(t.onTimeRate).toFixed(1) : null),
          itemStyle: { color: '#52c41a' },
          smooth: true
        },
        {
          name: '速度',
          type: 'bar',
          yAxisIndex: 1,
          data: trends.map(t => t.velocity != null ? Number(t.velocity).toFixed(1) : null),
          itemStyle: { color: '#faad14' }
        }
      ]
    }
  }

  // 质量指标雷达图
  const getQualityRadarOption = () => {
    if (!data) return {}
    
    return {
      tooltip: {},
      radar: {
        indicator: [
          { name: '完成率', max: 100 },
          { name: '准时率', max: 100 },
          { name: '首次通过率', max: 100 },
          { name: '利用率', max: 100 },
          { name: '质量得分', max: 100 }
        ]
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                data.completionRate || 0,
                data.onTimeCompletionRate || 0,
                data.firstTimePassRate || 0,
                data.utilizationRate || 0,
                100 - (data.bugRate || 0) - (data.reworkRate || 0)
              ],
              name: '团队效能',
              areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
              lineStyle: { color: '#1890ff' },
              itemStyle: { color: '#1890ff' }
            }
          ]
        }
      ]
    }
  }

  // 时间分配饼图
  const getTimeDistributionOption = () => {
    if (!data) return {}
    
    const totalTime = (data.focusTime || 0) + (data.meetingTime || 0)
    const otherTime = Math.max(0, 40 - totalTime) // 假设每周40小时
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}h ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c}h'
          },
          data: [
            { name: '专注时间', value: data.focusTime != null ? Number(data.focusTime).toFixed(1) : 0, itemStyle: { color: '#52c41a' } },
            { name: '会议时间', value: data.meetingTime != null ? Number(data.meetingTime).toFixed(1) : 0, itemStyle: { color: '#faad14' } },
            { name: '其他', value: otherTime.toFixed(1), itemStyle: { color: '#d9d9d9' } }
          ]
        }
      ]
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return <Empty description="暂无效能数据" />
  }

  return (
    <div className={styles.container}>
      {/* 周期选择 */}
      <div className={styles.periodSelector}>
        <Radio.Group value={period} onChange={e => setPeriod(e.target.value)}>
          <Radio.Button value="WEEKLY">按周</Radio.Button>
          <Radio.Button value="MONTHLY">按月</Radio.Button>
          <Radio.Button value="QUARTERLY">按季度</Radio.Button>
        </Radio.Group>
      </div>

      {/* 核心KPI卡片 */}
      <Row gutter={16} className={styles.kpiRow}>
        <Col span={6}>
          <Card className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <CheckCircleOutlined className={styles.kpiIcon} style={{ color: '#1890ff' }} />
              <span className={styles.kpiTitle}>完成率</span>
            </div>
            <div className={styles.kpiValue}>
              <Progress
                type="circle"
                percent={data.completionRate}
                size={80}
                strokeColor="#1890ff"
                format={percent => `${typeof percent === 'number' ? percent.toFixed(1) : '0.0'}%`}
              />
            </div>
            <div className={styles.kpiChange} style={{ color: getChangeColor(data.completionRateChange) }}>
              {getChangeIcon(data.completionRateChange)}
              <span>{Math.abs(Number(data.completionRateChange) || 0).toFixed(1)}% vs 上期</span>
            </div>
            <div className={styles.kpiDetail}>
              {data.completedTasks} / {data.totalTasks} 任务
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <ClockCircleOutlined className={styles.kpiIcon} style={{ color: '#52c41a' }} />
              <span className={styles.kpiTitle}>准时完成率</span>
            </div>
            <div className={styles.kpiValue}>
              <Progress
                type="circle"
                percent={data.onTimeCompletionRate}
                size={80}
                strokeColor="#52c41a"
                format={percent => `${typeof percent === 'number' ? percent.toFixed(1) : '0.0'}%`}
              />
            </div>
            <div className={styles.kpiChange} style={{ color: getChangeColor(data.onTimeRateChange) }}>
              {getChangeIcon(data.onTimeRateChange)}
              <span>{Math.abs(Number(data.onTimeRateChange) || 0).toFixed(1)}% vs 上期</span>
            </div>
            <div className={styles.kpiDetail}>
              平均 {data.avgCompletionDays != null ? Number(data.avgCompletionDays).toFixed(1) : '-'} 天完成
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <ThunderboltOutlined className={styles.kpiIcon} style={{ color: '#faad14' }} />
              <span className={styles.kpiTitle}>团队速度</span>
            </div>
            <div className={styles.kpiValue}>
              <Statistic 
                value={data.velocity} 
                suffix="任务/周"
                valueStyle={{ fontSize: 28, fontWeight: 600 }}
              />
            </div>
            <div className={styles.kpiChange} style={{ color: getChangeColor(data.velocityChange) }}>
              {getChangeIcon(data.velocityChange)}
              <span>{Math.abs(Number(data.velocityChange) || 0).toFixed(1)} vs 上期</span>
            </div>
            <div className={styles.kpiDetail}>
              利用率 {data.utilizationRate != null ? Number(data.utilizationRate).toFixed(1) : '-'}%
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <SafetyOutlined className={styles.kpiIcon} style={{ color: '#722ed1' }} />
              <span className={styles.kpiTitle}>质量指标</span>
            </div>
            <div className={styles.kpiValue}>
              <Progress
                type="circle"
                percent={data.firstTimePassRate}
                size={80}
                strokeColor="#722ed1"
                format={percent => `${typeof percent === 'number' ? percent.toFixed(1) : '0.0'}%`}
              />
            </div>
            <div className={styles.kpiMeta}>
              <Tag color="red">Bug率: {data.bugRate != null ? Number(data.bugRate).toFixed(1) : '-'}%</Tag>
              <Tag color="orange">返工率: {data.reworkRate != null ? Number(data.reworkRate).toFixed(1) : '-'}%</Tag>
            </div>
            <div className={styles.kpiDetail}>
              首次通过率
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={12}>
          <Card title="效能趋势" className={styles.chartCard}>
            <ReactECharts 
              option={getTrendOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="效能雷达" className={styles.chartCard}>
            <ReactECharts 
              option={getQualityRadarOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="时间分配" className={styles.chartCard}>
            <ReactECharts 
              option={getTimeDistributionOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default TeamEfficiency