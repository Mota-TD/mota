/**
 * 工作量预警组件
 * RM-003: 过载/空闲预警提示
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Avatar, Tag, List, Button, Spin, Empty, Badge, Tooltip, Modal, message } from 'antd'
import { 
  AlertOutlined, 
  UserOutlined, 
  WarningOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { WorkloadAlertData, Alert } from '@/services/api/resourceManagement'
import { getWorkloadAlerts, resolveAlert } from '@/services/api/resourceManagement'
import styles from './index.module.css'

interface WorkloadAlertProps {
  teamId?: number
  onAlertClick?: (alert: Alert) => void
}

const WorkloadAlert: React.FC<WorkloadAlertProps> = ({
  teamId,
  onAlertClick
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<WorkloadAlertData | null>(null)

  useEffect(() => {
    fetchData()
  }, [teamId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getWorkloadAlerts({ teamId })
      setData(result)
    } catch (error) {
      console.error('获取工作量预警失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (alertId: number) => {
    Modal.confirm({
      title: '确认处理',
      content: '确定要将此预警标记为已处理吗？',
      onOk: async () => {
        try {
          await resolveAlert(alertId)
          message.success('预警已处理')
          fetchData()
        } catch (error) {
          message.error('处理失败')
        }
      }
    })
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERLOAD': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'IDLE': return <ClockCircleOutlined style={{ color: '#faad14' }} />
      case 'NEAR_OVERLOAD': return <WarningOutlined style={{ color: '#fa8c16' }} />
      case 'DEADLINE_RISK': return <AlertOutlined style={{ color: '#ff4d4f' }} />
      default: return <AlertOutlined />
    }
  }

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'OVERLOAD': return '过载'
      case 'IDLE': return '空闲'
      case 'NEAR_OVERLOAD': return '即将过载'
      case 'DEADLINE_RISK': return '截止日期风险'
      default: return '未知'
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'OVERLOAD': return '#ff4d4f'
      case 'IDLE': return '#faad14'
      case 'NEAR_OVERLOAD': return '#fa8c16'
      case 'DEADLINE_RISK': return '#ff4d4f'
      default: return '#1890ff'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'red'
      case 'MEDIUM': return 'orange'
      case 'LOW': return 'blue'
      default: return 'default'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'HIGH': return '高'
      case 'MEDIUM': return '中'
      case 'LOW': return '低'
      default: return '未知'
    }
  }

  // 预警趋势图
  const getTrendOption = () => {
    if (!data?.alertTrend) return {}
    
    const trend = data.alertTrend
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['过载', '空闲', '正常'],
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
        data: trend.map(t => t.date.slice(5))
      },
      yAxis: {
        type: 'value',
        name: '人数'
      },
      series: [
        {
          name: '过载',
          type: 'bar',
          stack: 'total',
          data: trend.map(t => t.overloadCount),
          itemStyle: { color: '#ff4d4f' }
        },
        {
          name: '空闲',
          type: 'bar',
          stack: 'total',
          data: trend.map(t => t.idleCount),
          itemStyle: { color: '#faad14' }
        },
        {
          name: '正常',
          type: 'bar',
          stack: 'total',
          data: trend.map(t => t.normalCount),
          itemStyle: { color: '#52c41a' }
        }
      ]
    }
  }

  // 预警类型分布
  const getTypePieOption = () => {
    if (!data) return {}
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}'
          },
          data: [
            { name: '过载', value: data.overloadAlerts, itemStyle: { color: '#ff4d4f' } },
            { name: '空闲', value: data.idleAlerts, itemStyle: { color: '#faad14' } },
            { name: '即将过载', value: data.nearOverloadAlerts, itemStyle: { color: '#fa8c16' } }
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
    return <Empty description="暂无预警数据" />
  }

  return (
    <div className={styles.container}>
      {/* 预警统计 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="预警总数" 
              value={data.totalAlerts}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="过载预警" 
              value={data.overloadAlerts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="空闲预警" 
              value={data.idleAlerts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="即将过载" 
              value={data.nearOverloadAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={16}>
          <Card title="预警趋势" className={styles.chartCard}>
            <ReactECharts 
              option={getTrendOption()} 
              style={{ height: 250 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="预警类型分布" className={styles.chartCard}>
            <ReactECharts 
              option={getTypePieOption()} 
              style={{ height: 250 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 预警列表 */}
      <Card title="预警详情" className={styles.alertListCard}>
        <List
          dataSource={data.alerts}
          renderItem={(alert) => (
            <List.Item
              className={styles.alertItem}
              actions={[
                <Button 
                  key="resolve"
                  type="link" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleResolve(alert.alertId)}
                  disabled={alert.resolved}
                >
                  {alert.resolved ? '已处理' : '处理'}
                </Button>
              ]}
              onClick={() => onAlertClick?.(alert)}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!alert.resolved} offset={[-5, 5]}>
                    <Avatar 
                      size={48} 
                      src={alert.avatar} 
                      icon={<UserOutlined />}
                    />
                  </Badge>
                }
                title={
                  <div className={styles.alertTitle}>
                    <span className={styles.alertTitleText}>{alert.title}</span>
                    <Tag color={getLevelColor(alert.alertLevel)}>
                      {getLevelText(alert.alertLevel)}
                    </Tag>
                    <Tag color={getAlertTypeColor(alert.alertType)}>
                      {getAlertTypeIcon(alert.alertType)} {getAlertTypeText(alert.alertType)}
                    </Tag>
                  </div>
                }
                description={
                  <div className={styles.alertDesc}>
                    <p>{alert.description}</p>
                    <div className={styles.alertMeta}>
                      <span>当前负载: <strong>{alert.currentWorkload?.toFixed(1)}%</strong></span>
                      <span>建议负载: <strong>{alert.suggestedWorkload?.toFixed(1)}%</strong></span>
                      <span>受影响任务: <strong>{alert.affectedTasks}</strong></span>
                    </div>
                    {alert.suggestions && alert.suggestions.length > 0 && (
                      <div className={styles.suggestions}>
                        <strong>建议:</strong>
                        <ul>
                          {alert.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default WorkloadAlert