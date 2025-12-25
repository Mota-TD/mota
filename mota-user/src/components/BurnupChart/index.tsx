/**
 * 燃起图组件
 * 项目整体燃起图展示
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
  RiseOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { progressTrackingApi, BurnupChartData } from '@/services/api/progressTracking'
import styles from './index.module.css'

interface BurnupChartProps {
  projectId: number
}

const BurnupChart: React.FC<BurnupChartProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BurnupChartData | null>(null)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await progressTrackingApi.getBurnupChart(projectId)
      setData(result)
    } catch (error) {
      console.error('Load burnup chart error:', error)
      message.error('加载燃起图数据失败')
    } finally {
      setLoading(false)
    }
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
    data.scopeLine?.forEach(p => dateSet.add(p.date))
    data.completedLine?.forEach(p => dateSet.add(p.date))
    data.idealLine?.forEach(p => dateSet.add(p.date))
    data.predictedLine?.forEach(p => dateSet.add(p.date))
    
    const dates = Array.from(dateSet).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    )

    // 构建数据映射
    const scopeMap = new Map(data.scopeLine?.map(p => [p.date, p.totalScope]) || [])
    const completedMap = new Map(data.completedLine?.map(p => [p.date, p.value]) || [])
    const idealMap = new Map(data.idealLine?.map(p => [p.date, p.value]) || [])
    const predictedMap = new Map(data.predictedLine?.map(p => [p.date, p.value]) || [])

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['总范围', '已完成', '理想进度', '预测进度'],
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
        name: '任务数',
        nameLocation: 'middle',
        nameGap: 40,
        min: 0
      },
      series: [
        {
          name: '总范围',
          type: 'line',
          data: dates.map(d => scopeMap.get(d) ?? null),
          lineStyle: {
            color: '#722ed1',
            width: 2
          },
          itemStyle: {
            color: '#722ed1'
          },
          areaStyle: {
            color: 'rgba(114, 46, 209, 0.1)'
          },
          symbol: 'none'
        },
        {
          name: '已完成',
          type: 'line',
          data: dates.map(d => completedMap.get(d) ?? null),
          lineStyle: {
            color: '#52c41a',
            width: 3
          },
          itemStyle: {
            color: '#52c41a'
          },
          areaStyle: {
            color: 'rgba(82, 196, 26, 0.2)'
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: '理想进度',
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
          name: '预测进度',
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
          <RiseOutlined />
          <span>燃起图</span>
        </Space>
      }
      extra={
        <Space>
          {data.onTrack ? (
            <Tag icon={<CheckCircleOutlined />} color="success">按计划进行</Tag>
          ) : (
            <Tag icon={<WarningOutlined />} color="warning">进度落后</Tag>
          )}
          {data.scopeChange !== 0 && (
            <Tag color={data.scopeChange > 0 ? 'orange' : 'green'}>
              范围{data.scopeChange > 0 ? '增加' : '减少'} {Math.abs(data.scopeChange)}
            </Tag>
          )}
        </Space>
      }
    >
      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Statistic
            title="总范围"
            value={data.totalScope}
            prefix={<TrophyOutlined />}
            suffix="个任务"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="已完成"
            value={data.completedPoints}
            prefix={<CheckCircleOutlined />}
            suffix="个"
            valueStyle={{ color: '#52c41a' }}
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
            title="预计完成"
            value={data.predictedCompletionDate || '-'}
            prefix={<CalendarOutlined />}
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
      </Row>

      {/* 范围变化提示 */}
      {data.scopeChange !== 0 && (
        <div className={styles.scopeChangeInfo}>
          <Space>
            <WarningOutlined style={{ color: '#faad14' }} />
            <span>
              范围变化: {data.scopeChange > 0 ? '+' : ''}{data.scopeChange} 
              ({data.scopeChangePercentage?.toFixed(1)}%)
            </span>
          </Space>
        </div>
      )}

      {/* 图表 */}
      <div className={styles.chartContainer}>
        <ReactECharts 
          option={chartOption} 
          style={{ height: 400 }}
          notMerge={true}
        />
      </div>

      {/* 图例说明 */}
      <div className={styles.legendInfo}>
        <Space size="large">
          <span><span className={styles.legendDot} style={{ backgroundColor: '#722ed1' }} /> 总范围：项目总任务数（含范围变化）</span>
          <span><span className={styles.legendDot} style={{ backgroundColor: '#52c41a' }} /> 已完成：累计完成的任务数</span>
          <span><span className={styles.legendDot} style={{ backgroundColor: '#1677ff' }} /> 理想进度：按计划应完成的任务数</span>
          <span><span className={styles.legendDot} style={{ backgroundColor: '#faad14' }} /> 预测进度：基于当前速度的预测</span>
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

export default BurnupChart