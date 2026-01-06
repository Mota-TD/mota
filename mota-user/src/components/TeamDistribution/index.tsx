/**
 * 团队工作量分布组件
 * RM-002: 团队工作量分布图
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Avatar, Progress, Tag, Spin, Empty, Table } from 'antd'
import { TeamOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { TeamDistributionData, MemberWorkload } from '@/services/api/resourceManagement'
import { getTeamDistribution } from '@/services/api/resourceManagement'
import styles from './index.module.css'

interface TeamDistributionProps {
  teamId?: string | number
  startDate: string
  endDate: string
}

const TeamDistribution: React.FC<TeamDistributionProps> = ({
  teamId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TeamDistributionData | null>(null)

  useEffect(() => {
    if (teamId) {
      fetchData()
    } else {
      setData(null)
    }
  }, [teamId, startDate, endDate])

  const fetchData = async () => {
    if (!teamId) return
    setLoading(true)
    try {
      const result = await getTeamDistribution(teamId, startDate, endDate)
      setData(result)
    } catch (error) {
      console.error('获取团队分布数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIGHT': return '#52c41a'
      case 'NORMAL': return '#1890ff'
      case 'HEAVY': return '#faad14'
      case 'OVERLOAD': return '#ff4d4f'
      default: return '#1890ff'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LIGHT': return '轻松'
      case 'NORMAL': return '正常'
      case 'HEAVY': return '繁忙'
      case 'OVERLOAD': return '过载'
      default: return '未知'
    }
  }

  // 成员工作量柱状图
  const getMemberBarOption = () => {
    if (!data?.memberWorkloads) return {}
    
    const members = data.memberWorkloads
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['任务数', '工时', '完成率'],
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
        data: members.map(m => m.userName),
        axisLabel: { 
          rotate: 30,
          fontSize: 11
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '数量/工时',
          position: 'left'
        },
        {
          type: 'value',
          name: '完成率(%)',
          position: 'right',
          max: 100
        }
      ],
      series: [
        {
          name: '任务数',
          type: 'bar',
          data: members.map(m => Number(m.taskCount) || 0),
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '工时',
          type: 'bar',
          data: members.map(m => Number(m.hours) || 0),
          itemStyle: { color: '#52c41a' }
        },
        {
          name: '完成率',
          type: 'line',
          yAxisIndex: 1,
          data: members.map(m => Number(m.completionRate) || 0),
          itemStyle: { color: '#faad14' }
        }
      ]
    }
  }

  // 状态分布饼图
  const getStatusPieOption = () => {
    if (!data?.statusDistribution) return {}
    
    const dist = data.statusDistribution
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
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
            { name: '待处理', value: dist.pending, itemStyle: { color: '#d9d9d9' } },
            { name: '进行中', value: dist.inProgress, itemStyle: { color: '#1890ff' } },
            { name: '已完成', value: dist.completed, itemStyle: { color: '#52c41a' } },
            { name: '逾期', value: dist.overdue, itemStyle: { color: '#ff4d4f' } },
            { name: '已取消', value: dist.cancelled, itemStyle: { color: '#8c8c8c' } }
          ]
        }
      ]
    }
  }

  // 优先级分布饼图
  const getPriorityPieOption = () => {
    if (!data?.priorityDistribution) return {}
    
    const dist = data.priorityDistribution
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
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
            { name: '紧急', value: dist.urgent, itemStyle: { color: '#ff4d4f' } },
            { name: '高', value: dist.high, itemStyle: { color: '#faad14' } },
            { name: '中', value: dist.medium, itemStyle: { color: '#1890ff' } },
            { name: '低', value: dist.low, itemStyle: { color: '#52c41a' } }
          ]
        }
      ]
    }
  }

  // 成员表格列
  const memberColumns = [
    {
      title: '成员',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: MemberWorkload) => (
        <div className={styles.memberCell}>
          <Avatar size="small" src={record.avatar} icon={<UserOutlined />} />
          <span className={styles.memberName}>{text}</span>
        </div>
      )
    },
    {
      title: '任务数',
      dataIndex: 'taskCount',
      key: 'taskCount',
      sorter: (a: MemberWorkload, b: MemberWorkload) => Number(a.taskCount) - Number(b.taskCount)
    },
    {
      title: '工时',
      dataIndex: 'hours',
      key: 'hours',
      render: (val: number) => `${Number(val || 0).toFixed(1)}h`,
      sorter: (a: MemberWorkload, b: MemberWorkload) => Number(a.hours) - Number(b.hours)
    },
    {
      title: '负载',
      dataIndex: 'workloadPercentage',
      key: 'workloadPercentage',
      render: (val: number, record: MemberWorkload) => (
        <Progress
          percent={Number(val) || 0}
          size="small"
          strokeColor={getStatusColor(record.workloadStatus)}
          format={() => `${Number(val || 0).toFixed(0)}%`}
        />
      ),
      sorter: (a: MemberWorkload, b: MemberWorkload) => Number(a.workloadPercentage) - Number(b.workloadPercentage)
    },
    {
      title: '状态',
      dataIndex: 'workloadStatus',
      key: 'workloadStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (val: number) => `${Number(val || 0).toFixed(1)}%`,
      sorter: (a: MemberWorkload, b: MemberWorkload) => Number(a.completionRate) - Number(b.completionRate)
    }
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!teamId) {
    return <Empty description="请选择一个团队查看分布数据" />
  }

  if (!data) {
    return <Empty description="暂无团队数据" />
  }

  return (
    <div className={styles.container}>
      {/* 团队概览 */}
      <Card className={styles.overviewCard}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic 
              title="团队名称" 
              value={data.teamName}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic 
              title="成员数" 
              value={data.activeMembers}
              suffix={`/ ${data.totalMembers}`}
            />
          </Col>
          <Col span={4}>
            <Statistic 
              title="总任务数" 
              value={data.totalTasks}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="总工时"
              value={Number(data.totalHours || 0).toFixed(0)}
              suffix="h"
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="平均负载"
              value={Number(data.averageWorkload || 0).toFixed(1)}
              suffix="%"
              valueStyle={{
                color: Number(data.averageWorkload) > 80 ? '#ff4d4f' :
                       Number(data.averageWorkload) > 60 ? '#faad14' : '#52c41a'
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={12}>
          <Card title="成员工作量分布" className={styles.chartCard}>
            <ReactECharts 
              option={getMemberBarOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="任务状态分布" className={styles.chartCard}>
            <ReactECharts 
              option={getStatusPieOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="优先级分布" className={styles.chartCard}>
            <ReactECharts 
              option={getPriorityPieOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 成员列表 */}
      <Card title="成员详情" className={styles.tableCard}>
        <Table 
          dataSource={data.memberWorkloads}
          columns={memberColumns}
          rowKey="userId"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default TeamDistribution