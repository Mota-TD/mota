/**
 * 燃尽图组件
 * Sprint级别燃尽图展示
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
  message
} from 'antd'
import {
  LineChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { progressTrackingApi, BurndownChartData } from '@/services/api/progressTracking'
import styles from './index.module.css'

interface BurndownChartProps {
  // API 模式 - 通过 projectId 加载数据
  projectId?: string | number
  sprintId?: number
  onSprintChange?: (sprintId: number) => void
  // 直接数据模式 - 直接传入数据
  title?: string
  startDate?: string
  endDate?: string
  totalPoints?: number
  completedByDate?: { date: string; completed: number }[]
  height?: number
  showLegend?: boolean
  unit?: string
}

const BurndownChart: React.FC<BurndownChartProps> = ({
  projectId,
  sprintId,
  title,
  startDate: propStartDate,
  endDate: propEndDate,
  totalPoints: propTotalPoints,
  completedByDate,
  height = 400,
  showLegend = true,
  unit = '任务'
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BurndownChartData | null>(null)

  useEffect(() => {
    // 如果提供了 projectId，从 API 加载数据
    if (projectId) {
      loadData()
    } else if (completedByDate && propStartDate && propEndDate && propTotalPoints !== undefined) {
      // 如果直接提供了数据，构建本地数据
      buildLocalData()
    }
  }, [projectId, sprintId, completedByDate, propStartDate, propEndDate, propTotalPoints])

  const loadData = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const result = await progressTrackingApi.getBurndownChart(projectId, sprintId)
      setData(result)
    } catch (error) {
      console.error('Load burndown chart error:', error)
      message.error('加载燃尽图数据失败')
    } finally {
      setLoading(false)
    }
  }

  const buildLocalData = () => {
    if (!completedByDate || !propStartDate || !propEndDate || propTotalPoints === undefined) return
    
    // 计算累计完成数
    let cumulative = 0
    const actualLine = completedByDate.map(item => {
      cumulative += item.completed
      return {
        date: item.date,
        value: propTotalPoints - cumulative,
        completed: item.completed
      }
    })

    // 计算理想燃尽线
    const start = new Date(propStartDate)
    const end = new Date(propEndDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const dailyBurn = propTotalPoints / totalDays
    
    const idealLine: { date: string; value: number; completed: number }[] = []
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      idealLine.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, propTotalPoints - dailyBurn * i),
        completed: Math.round(dailyBurn)
      })
    }

    const remaining = propTotalPoints - cumulative
    const completionPercentage = propTotalPoints > 0 ? ((propTotalPoints - remaining) / propTotalPoints) * 100 : 0

    setData({
      projectId: 0,
      projectName: title || '燃尽图',
      sprintName: title || '燃尽图',
      startDate: propStartDate,
      endDate: propEndDate,
      totalPoints: propTotalPoints,
      remainingPoints: remaining,
      completionPercentage,
      idealLine,
      actualLine,
      predictedLine: [],
      onTrack: remaining <= (propTotalPoints - cumulative),
      deviationDays: 0
    })
  }

  // 格式化日期显示
  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  // 生成ECharts配置
  const chartOption = useMemo(() => {
    if (!data) return {}

    // 收集所有日期
    const dateSet = new Set<string>()
    data.idealLine?.forEach(p => dateSet.add(p.date))
    data.actualLine?.forEach(p => dateSet.add(p.date))
    data.predictedLine?.forEach(p => dateSet.add(p.date))
    
    const dates = Array.from(dateSet).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    )

    // 构建数据映射
    const idealMap = new Map(data.idealLine?.map(p => [p.date, p.value]) || [])
    const actualMap = new Map(data.actualLine?.map(p => [p.date, p.value]) || [])
    const predictedMap = new Map(data.predictedLine?.map(p => [p.date, p.value]) || [])

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['理想燃尽线', '实际燃尽线', '预测燃尽线'],
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
        data: dates.map(formatDate),
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '剩余任务数',
        nameLocation: 'middle',
        nameGap: 40,
        min: 0
      },
      series: [
        {
          name: '理想燃尽线',
          type: 'line',
          data: dates.map(d => idealMap.get(d) ?? null),
          lineStyle: {
            color: '#1677ff',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#1677ff'
          },
          symbol: 'none'
        },
        {
          name: '实际燃尽线',
          type: 'line',
          data: dates.map(d => actualMap.get(d) ?? null),
          lineStyle: {
            color: '#52c41a',
            width: 3
          },
          itemStyle: {
            color: '#52c41a'
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: '预测燃尽线',
          type: 'line',
          data: dates.map(d => predictedMap.get(d) ?? null),
          lineStyle: {
            color: '#faad14',
            width: 2,
            type: 'dashed'
          },
          itemStyle: {
            color: '#faad14'
          },
          symbol: 'none'
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
    <Card
      className={styles.container}
      title={
        <Space>
          <LineChartOutlined />
          <span>燃尽图</span>
          {data.sprintName && <Tag color="blue">{data.sprintName}</Tag>}
        </Space>
      }
      extra={
        <Space>
          {data.onTrack ? (
            <Tag icon={<CheckCircleOutlined />} color="success">按计划进行</Tag>
          ) : (
            <Tag icon={<WarningOutlined />} color="warning">
              {data.deviationDays > 0 ? `落后${data.deviationDays}天` : `提前${Math.abs(data.deviationDays)}天`}
            </Tag>
          )}
        </Space>
      }
    >
      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Statistic
            title="总任务数"
            value={data.totalPoints}
            prefix={<TrophyOutlined />}
            suffix="个"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="剩余任务"
            value={data.remainingPoints}
            prefix={<ClockCircleOutlined />}
            suffix="个"
            valueStyle={{ color: data.remainingPoints > 0 ? '#faad14' : '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="完成进度"
            value={data.completionPercentage?.toFixed(1)}
            suffix="%"
            valueStyle={{ color: '#1677ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="偏差天数"
            value={Math.abs(data.deviationDays)}
            prefix={data.deviationDays > 0 ? '落后' : data.deviationDays < 0 ? '提前' : ''}
            suffix="天"
            valueStyle={{ 
              color: data.deviationDays > 0 ? '#ff4d4f' : 
                     data.deviationDays < 0 ? '#52c41a' : '#1677ff' 
            }}
          />
        </Col>
      </Row>

      {/* 图表 */}
      <div className={styles.chartContainer}>
        <ReactECharts
          option={chartOption}
          style={{ height }}
          notMerge={true}
        />
      </div>

      {/* 图例说明 */}
      <div className={styles.legendInfo}>
        <Space size="large">
          <span><span className={styles.legendDot} style={{ backgroundColor: '#1677ff' }} /> 理想燃尽线：按计划每日应完成的工作量</span>
          <span><span className={styles.legendDot} style={{ backgroundColor: '#52c41a' }} /> 实际燃尽线：实际每日剩余工作量</span>
          <span><span className={styles.legendDot} style={{ backgroundColor: '#faad14' }} /> 预测燃尽线：基于当前速度的预测</span>
        </Space>
      </div>

      {/* 时间范围 */}
      <div className={styles.dateRange}>
        <Space>
          <span>开始日期: {data.startDate}</span>
          <span>|</span>
          <span>结束日期: {data.endDate}</span>
        </Space>
      </div>
    </Card>
  )
}

export default BurndownChart