/**
 * 平均完成时间组件
 * RP-006: 任务平均完成时间
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Spin, Empty } from 'antd'
import { 
  ClockCircleOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  FieldTimeOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { AvgCompletionTimeData, CompletionTimeByPriority } from '@/services/api/reportAnalytics'
import { getAvgCompletionTime } from '@/services/api/reportAnalytics'
import styles from './index.module.css'

interface AvgCompletionTimeProps {
  teamId?: number
  projectId?: number
  startDate: string
  endDate: string
}

const AvgCompletionTime: React.FC<AvgCompletionTimeProps> = ({
  teamId,
  projectId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AvgCompletionTimeData | null>(null)

  useEffect(() => {
    fetchData()
  }, [teamId, projectId, startDate, endDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getAvgCompletionTime({ teamId, projectId, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取平均完成时间失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChangeIcon = (change: number) => {
    // 完成时间减少是好事
    if (change < 0) return <ArrowDownOutlined style={{ color: '#52c41a' }} />
    if (change > 0) return <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
    return null
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#ff4d4f'
      case 'HIGH': return '#fa8c16'
      case 'MEDIUM': return '#1890ff'
      case 'LOW': return '#52c41a'
      default: return '#8c8c8c'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '紧急'
      case 'HIGH': return '高'
      case 'MEDIUM': return '中'
      case 'LOW': return '低'
      default: return priority
    }
  }

  // 完成时间分布柱状图
  const getDistributionOption = () => {
    if (!data?.distribution) return {}
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0]
          return `${item.name}<br/>任务数: ${item.value}<br/>占比: ${data.distribution.find(d => d.range === item.name)?.percentage?.toFixed(1)}%`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.distribution.map(d => d.range),
        axisLabel: { fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: '任务数'
      },
      series: [
        {
          type: 'bar',
          data: data.distribution.map(d => ({
            value: d.count,
            itemStyle: {
              color: d.range.includes('>14') ? '#ff4d4f' : 
                     d.range.includes('7-14') ? '#fa8c16' :
                     d.range.includes('3-7') ? '#faad14' :
                     d.range.includes('1-3') ? '#1890ff' : '#52c41a'
            }
          }))
        }
      ]
    }
  }

  // 完成时间趋势图
  const getTrendOption = () => {
    if (!data?.trends) return {}
    
    const trends = data.trends
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['平均天数', '中位数', '任务数'],
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
          name: '天数',
          position: 'left'
        },
        {
          type: 'value',
          name: '任务数',
          position: 'right'
        }
      ],
      series: [
        {
          name: '平均天数',
          type: 'line',
          data: trends.map(t => t.avgDays?.toFixed(1)),
          itemStyle: { color: '#1890ff' },
          smooth: true
        },
        {
          name: '中位数',
          type: 'line',
          data: trends.map(t => t.medianDays?.toFixed(1)),
          itemStyle: { color: '#52c41a' },
          smooth: true,
          lineStyle: { type: 'dashed' }
        },
        {
          name: '任务数',
          type: 'bar',
          yAxisIndex: 1,
          data: trends.map(t => t.taskCount),
          itemStyle: { color: '#d9d9d9' }
        }
      ]
    }
  }

  // 按优先级完成时间柱状图
  const getPriorityOption = () => {
    if (!data?.byPriority) return {}
    
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['平均天数', '最短', '最长'],
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
        data: data.byPriority.map(p => getPriorityText(p.priority)),
        axisLabel: { fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: '天数'
      },
      series: [
        {
          name: '平均天数',
          type: 'bar',
          data: data.byPriority.map(p => ({
            value: p.avgDays?.toFixed(1),
            itemStyle: { color: getPriorityColor(p.priority) }
          }))
        },
        {
          name: '最短',
          type: 'scatter',
          data: data.byPriority.map(p => p.minDays?.toFixed(1)),
          itemStyle: { color: '#52c41a' },
          symbolSize: 10
        },
        {
          name: '最长',
          type: 'scatter',
          data: data.byPriority.map(p => p.maxDays?.toFixed(1)),
          itemStyle: { color: '#ff4d4f' },
          symbolSize: 10
        }
      ]
    }
  }

  // 按类型完成时间表格列
  const typeColumns = [
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType'
    },
    {
      title: '平均天数',
      dataIndex: 'avgDays',
      key: 'avgDays',
      render: (val: number) => `${val?.toFixed(1)} 天`,
      sorter: (a: any, b: any) => a.avgDays - b.avgDays
    },
    {
      title: '任务数',
      dataIndex: 'taskCount',
      key: 'taskCount',
      sorter: (a: any, b: any) => a.taskCount - b.taskCount
    }
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return <Empty description="暂无完成时间数据" />
  }

  return (
    <div className={styles.container}>
      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="已完成任务" 
              value={data.totalCompletedTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className={styles.statCard}>
            <Statistic 
              title="平均完成天数" 
              value={data.avgCompletionDays?.toFixed(1)}
              suffix="天"
              prefix={<FieldTimeOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className={styles.changeInfo}>
              {getChangeIcon(data.avgDaysChange)}
              <span style={{ color: data.avgDaysChange < 0 ? '#52c41a' : '#ff4d4f' }}>
                {Math.abs(data.avgDaysChange || 0).toFixed(1)} 天 vs 上期
              </span>
            </div>
          </Card>
        </Col>
        <Col span={5}>
          <Card className={styles.statCard}>
            <Statistic 
              title="中位数" 
              value={data.medianCompletionDays?.toFixed(1)}
              suffix="天"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className={styles.statCard}>
            <Statistic 
              title="最短完成" 
              value={data.minCompletionDays?.toFixed(1)}
              suffix="天"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card className={styles.statCard}>
            <Statistic 
              title="最长完成" 
              value={data.maxCompletionDays?.toFixed(1)}
              suffix="天"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={12}>
          <Card title="完成时间分布" className={styles.chartCard}>
            <ReactECharts 
              option={getDistributionOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="完成时间趋势" className={styles.chartCard}>
            <ReactECharts 
              option={getTrendOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className={styles.chartRow}>
        <Col span={12}>
          <Card title="按优先级完成时间" className={styles.chartCard}>
            <ReactECharts 
              option={getPriorityOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="按类型完成时间" className={styles.chartCard}>
            <Table 
              dataSource={data.byType}
              columns={typeColumns}
              rowKey="taskType"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AvgCompletionTime