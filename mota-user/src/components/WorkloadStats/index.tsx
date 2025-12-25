/**
 * 工作量统计组件
 * RM-001: 个人任务负载可视化
 */

import React, { useEffect, useState } from 'react'
import { Card, Progress, Statistic, Row, Col, Avatar, Tag, Spin, Empty, Tooltip } from 'antd'
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { WorkloadStatsData } from '@/services/api/resourceManagement'
import { getTeamWorkloadStats } from '@/services/api/resourceManagement'
import styles from './index.module.css'

interface WorkloadStatsProps {
  teamId?: number
  startDate: string
  endDate: string
  onUserClick?: (userId: number) => void
}

const WorkloadStats: React.FC<WorkloadStatsProps> = ({
  teamId,
  startDate,
  endDate,
  onUserClick
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<WorkloadStatsData[]>([])

  useEffect(() => {
    fetchData()
  }, [teamId, startDate, endDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getTeamWorkloadStats({ teamId, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取工作量统计失败:', error)
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

  const getChartOption = (item: WorkloadStatsData) => {
    const dailyData = item.dailyWorkloads || []
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
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
        data: dailyData.map(d => d.date.slice(5)),
        axisLabel: { fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '工时',
        axisLabel: { fontSize: 10 }
      },
      series: [
        {
          name: '计划工时',
          type: 'bar',
          data: dailyData.map(d => d.plannedHours),
          itemStyle: { color: '#91d5ff' }
        },
        {
          name: '实际工时',
          type: 'bar',
          data: dailyData.map(d => d.actualHours?.toFixed(1)),
          itemStyle: { color: '#1890ff' }
        }
      ]
    }
  }

  const getProjectPieOption = (item: WorkloadStatsData) => {
    const projectData = item.projectWorkloads || []
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}h ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          data: projectData.map(p => ({
            name: p.projectName,
            value: p.totalHours?.toFixed(1)
          }))
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

  if (!data || data.length === 0) {
    return <Empty description="暂无工作量数据" />
  }

  return (
    <div className={styles.container}>
      <Row gutter={[16, 16]}>
        {data.map(item => (
          <Col xs={24} sm={12} lg={8} xl={6} key={item.userId}>
            <Card 
              className={styles.userCard}
              hoverable
              onClick={() => onUserClick?.(item.userId)}
            >
              <div className={styles.userHeader}>
                <Avatar 
                  size={48} 
                  src={item.avatar} 
                  icon={<UserOutlined />}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{item.userName}</div>
                  <Tag color={getStatusColor(item.workloadStatus)}>
                    {getStatusText(item.workloadStatus)}
                  </Tag>
                </div>
              </div>

              <div className={styles.workloadProgress}>
                <div className={styles.progressLabel}>
                  <span>工作负载</span>
                  <span>{item.workloadPercentage?.toFixed(1)}%</span>
                </div>
                <Progress 
                  percent={item.workloadPercentage} 
                  strokeColor={getStatusColor(item.workloadStatus)}
                  showInfo={false}
                />
              </div>

              <Row gutter={8} className={styles.statsRow}>
                <Col span={6}>
                  <Tooltip title="总任务数">
                    <Statistic 
                      value={item.totalTasks} 
                      valueStyle={{ fontSize: 16 }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Tooltip>
                </Col>
                <Col span={6}>
                  <Tooltip title="进行中">
                    <Statistic 
                      value={item.inProgressTasks} 
                      valueStyle={{ fontSize: 16, color: '#1890ff' }}
                    />
                  </Tooltip>
                </Col>
                <Col span={6}>
                  <Tooltip title="已完成">
                    <Statistic 
                      value={item.completedTasks} 
                      valueStyle={{ fontSize: 16, color: '#52c41a' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Tooltip>
                </Col>
                <Col span={6}>
                  <Tooltip title="逾期">
                    <Statistic 
                      value={item.overdueTasks} 
                      valueStyle={{ fontSize: 16, color: '#ff4d4f' }}
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </Tooltip>
                </Col>
              </Row>

              <div className={styles.hoursInfo}>
                <div className={styles.hoursItem}>
                  <span className={styles.hoursLabel}>已用工时</span>
                  <span className={styles.hoursValue}>{item.usedHours?.toFixed(1)}h</span>
                </div>
                <div className={styles.hoursItem}>
                  <span className={styles.hoursLabel}>剩余工时</span>
                  <span className={styles.hoursValue}>{item.remainingHours?.toFixed(1)}h</span>
                </div>
              </div>

              {item.dailyWorkloads && item.dailyWorkloads.length > 0 && (
                <div className={styles.chartContainer}>
                  <ReactECharts 
                    option={getChartOption(item)} 
                    style={{ height: 120 }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              )}

              {item.projectWorkloads && item.projectWorkloads.length > 0 && (
                <div className={styles.projectList}>
                  <div className={styles.projectTitle}>项目分布</div>
                  {item.projectWorkloads.slice(0, 3).map(p => (
                    <div key={p.projectId} className={styles.projectItem}>
                      <span className={styles.projectName}>{p.projectName}</span>
                      <span className={styles.projectHours}>{p.totalHours?.toFixed(1)}h ({p.hoursPercentage?.toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default WorkloadStats