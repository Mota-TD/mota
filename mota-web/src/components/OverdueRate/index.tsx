/**
 * 逾期率统计组件
 * RP-007: 任务逾期率分析
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Avatar, Spin, Empty, Progress } from 'antd'
import { 
  WarningOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { OverdueRateData, OverdueTask, OverdueByMember } from '@/services/api/reportAnalytics'
import { getOverdueRate } from '@/services/api/reportAnalytics'
import styles from './index.module.css'

interface OverdueRateProps {
  teamId?: number
  projectId?: number
  startDate: string
  endDate: string
}

const OverdueRate: React.FC<OverdueRateProps> = ({
  teamId,
  projectId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OverdueRateData | null>(null)

  useEffect(() => {
    fetchData()
  }, [teamId, projectId, startDate, endDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getOverdueRate({ teamId, projectId, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取逾期率数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChangeIcon = (change: number) => {
    // 逾期率减少是好事
    if (change < 0) return <ArrowDownOutlined style={{ color: '#52c41a' }} />
    if (change > 0) return <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
    return null
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'red'
      case 'HIGH': return 'orange'
      case 'MEDIUM': return 'blue'
      case 'LOW': return 'green'
      default: return 'default'
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

  // 逾期趋势图
  const getTrendOption = () => {
    if (!data?.trends) return {}
    
    const trends = data.trends
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['总任务', '逾期任务', '逾期率'],
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
          name: '任务数',
          position: 'left'
        },
        {
          type: 'value',
          name: '逾期率(%)',
          position: 'right',
          max: 100
        }
      ],
      series: [
        {
          name: '总任务',
          type: 'bar',
          data: trends.map(t => t.totalTasks),
          itemStyle: { color: '#d9d9d9' }
        },
        {
          name: '逾期任务',
          type: 'bar',
          data: trends.map(t => t.overdueTasks),
          itemStyle: { color: '#ff4d4f' }
        },
        {
          name: '逾期率',
          type: 'line',
          yAxisIndex: 1,
          data: trends.map(t => t.overdueRate != null ? Number(t.overdueRate).toFixed(1) : null),
          itemStyle: { color: '#faad14' },
          smooth: true
        }
      ]
    }
  }

  // 严重程度分布饼图
  const getSeverityOption = () => {
    if (!data) return {}
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}个 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          data: [
            { name: '轻微(1-3天)', value: data.slightlyOverdue, itemStyle: { color: '#faad14' } },
            { name: '中度(3-7天)', value: data.moderatelyOverdue, itemStyle: { color: '#fa8c16' } },
            { name: '严重(>7天)', value: data.severelyOverdue, itemStyle: { color: '#ff4d4f' } }
          ]
        }
      ]
    }
  }

  // 原因分析饼图
  const getReasonOption = () => {
    if (!data?.reasons) return {}
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}个 ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: data.reasons.map((r, i) => ({
            name: r.reason,
            value: r.count,
            itemStyle: { 
              color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'][i % 6]
            }
          })),
          label: {
            formatter: '{b}\n{c}个'
          }
        }
      ]
    }
  }

  // 逾期任务表格列
  const taskColumns = [
    {
      title: '任务',
      dataIndex: 'taskName',
      key: 'taskName',
      ellipsis: true
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true
    },
    {
      title: '负责人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      render: (text: string, record: OverdueTask) => (
        <div className={styles.assigneeCell}>
          <Avatar size="small" src={record.assigneeAvatar} icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate'
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      render: (days: number) => (
        <Tag color={days > 7 ? 'red' : days > 3 ? 'orange' : 'gold'}>
          {days} 天
        </Tag>
      ),
      sorter: (a: OverdueTask, b: OverdueTask) => a.overdueDays - b.overdueDays
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{getPriorityText(priority)}</Tag>
      )
    }
  ]

  // 按成员逾期表格列
  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: OverdueByMember) => (
        <div className={styles.memberCell}>
          <Avatar size="small" src={record.avatar} icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: '总任务',
      dataIndex: 'totalTasks',
      key: 'totalTasks'
    },
    {
      title: '逾期任务',
      dataIndex: 'overdueTasks',
      key: 'overdueTasks',
      render: (val: number) => (
        <span style={{ color: val > 0 ? '#ff4d4f' : '#52c41a' }}>{val}</span>
      )
    },
    {
      title: '逾期率',
      dataIndex: 'overdueRate',
      key: 'overdueRate',
      render: (val: number) => (
        <Progress
          percent={val}
          size="small"
          strokeColor={val > 30 ? '#ff4d4f' : val > 15 ? '#faad14' : '#52c41a'}
          format={() => `${typeof val === 'number' ? val.toFixed(1) : '0.0'}%`}
        />
      ),
      sorter: (a: OverdueByMember, b: OverdueByMember) => a.overdueRate - b.overdueRate
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
    return <Empty description="暂无逾期数据" />
  }

  return (
    <div className={styles.container}>
      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="总任务数" 
              value={data.totalTasks}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="逾期任务" 
              value={data.overdueTasks}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="逾期率"
              value={data.overdueRate != null ? Number(data.overdueRate).toFixed(1) : '0.0'}
              suffix="%"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: Number(data.overdueRate || 0) > 20 ? '#ff4d4f' : '#faad14' }}
            />
            <div className={styles.changeInfo}>
              {getChangeIcon(Number(data.overdueRateChange || 0))}
              <span style={{ color: Number(data.overdueRateChange || 0) < 0 ? '#52c41a' : '#ff4d4f' }}>
                {Math.abs(Number(data.overdueRateChange) || 0).toFixed(1)}% vs 上期
              </span>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="平均逾期天数"
              value={data.avgOverdueDays != null ? Number(data.avgOverdueDays).toFixed(1) : '0.0'}
              suffix="天"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="严重逾期(>7天)" 
              value={data.severelyOverdue}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className={styles.statCard}>
            <Statistic 
              title="中度逾期(3-7天)" 
              value={data.moderatelyOverdue}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={12}>
          <Card title="逾期趋势" className={styles.chartCard}>
            <ReactECharts 
              option={getTrendOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="严重程度分布" className={styles.chartCard}>
            <ReactECharts 
              option={getSeverityOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="逾期原因分析" className={styles.chartCard}>
            <ReactECharts 
              option={getReasonOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className={styles.chartRow}>
        <Col span={14}>
          <Card title="逾期任务列表" className={styles.tableCard}>
            <Table 
              dataSource={data.overdueTasks_list?.slice(0, 10)}
              columns={taskColumns}
              rowKey="taskId"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="按成员逾期统计" className={styles.tableCard}>
            <Table 
              dataSource={data.byMember}
              columns={memberColumns}
              rowKey="userId"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default OverdueRate