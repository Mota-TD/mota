/**
 * 资源利用率组件
 * RM-005: 资源利用率图表
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Table, Tag, Spin, Empty, Radio, Avatar } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, UserOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ResourceUtilizationData, MemberUtilization } from '@/services/api/resourceManagement'
import { getResourceUtilization } from '@/services/api/resourceManagement'
import styles from './index.module.css'

interface ResourceUtilizationProps {
  teamId?: string | number
  startDate: string
  endDate: string
}

const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({
  teamId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ResourceUtilizationData | null>(null)
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY')

  useEffect(() => {
    fetchData()
  }, [teamId, startDate, endDate, period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getResourceUtilization({ teamId, period, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取资源利用率失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUtilizationColor = (status: string) => {
    switch (status) {
      case 'LOW': return '#faad14'
      case 'OPTIMAL': return '#52c41a'
      case 'HIGH': return '#1890ff'
      case 'OVERUTILIZED': return '#ff4d4f'
      default: return '#1890ff'
    }
  }

  const getUtilizationText = (status: string) => {
    switch (status) {
      case 'LOW': return '低'
      case 'OPTIMAL': return '最佳'
      case 'HIGH': return '高'
      case 'OVERUTILIZED': return '过度'
      default: return '未知'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return <ArrowUpOutlined style={{ color: '#52c41a' }} />
      case 'DOWN': return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      case 'STABLE': return <MinusOutlined style={{ color: '#8c8c8c' }} />
      default: return null
    }
  }

  // 利用率趋势图
  const getTrendOption = () => {
    if (!data?.utilizationTrends) return {}
    
    const trends = data.utilizationTrends
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['可用工时', '实际工时', '利用率'],
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
          name: '工时',
          position: 'left'
        },
        {
          type: 'value',
          name: '利用率(%)',
          position: 'right',
          max: 120
        }
      ],
      series: [
        {
          name: '可用工时',
          type: 'bar',
          data: trends.map(t => Number(t.availableHours) || 0),
          itemStyle: { color: '#d9d9d9' }
        },
        {
          name: '实际工时',
          type: 'bar',
          data: trends.map(t => Number(t.actualHours) || 0),
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '利用率',
          type: 'line',
          yAxisIndex: 1,
          data: trends.map(t => Number(t.utilizationPercentage) || 0),
          itemStyle: { color: '#52c41a' },
          markLine: {
            data: [
              { yAxis: Number(data.targetUtilization) || 0, name: '目标' }
            ],
            lineStyle: { color: '#ff4d4f', type: 'dashed' }
          }
        }
      ]
    }
  }

  // 项目利用率饼图
  const getProjectPieOption = () => {
    if (!data?.projectUtilizations) return {}
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}h ({d}%)'
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
          data: data.projectUtilizations.map(p => ({
            name: p.projectName,
            value: Number(p.actualHours) || 0
          }))
        }
      ]
    }
  }

  // 利用率分布图
  const getDistributionOption = () => {
    if (!data?.distribution) return {}
    
    const dist = data.distribution
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: [
            { name: '低利用率(<50%)', value: dist.lowCount, itemStyle: { color: '#faad14' } },
            { name: '最佳(50%-80%)', value: dist.optimalCount, itemStyle: { color: '#52c41a' } },
            { name: '高利用率(80%-100%)', value: dist.highCount, itemStyle: { color: '#1890ff' } },
            { name: '过度利用(>100%)', value: dist.overutilizedCount, itemStyle: { color: '#ff4d4f' } }
          ],
          label: {
            formatter: '{b}\n{c}人'
          }
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
      render: (text: string, record: MemberUtilization) => (
        <div className={styles.memberCell}>
          <Avatar size="small" src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div className={styles.memberName}>{text}</div>
            <div className={styles.memberDept}>{record.department}</div>
          </div>
        </div>
      )
    },
    {
      title: '可用工时',
      dataIndex: 'availableHours',
      key: 'availableHours',
      render: (val: number) => `${Number(val) || 0}h`
    },
    {
      title: '已分配',
      dataIndex: 'allocatedHours',
      key: 'allocatedHours',
      render: (val: number) => `${Number(val || 0).toFixed(1)}h`
    },
    {
      title: '实际工时',
      dataIndex: 'actualHours',
      key: 'actualHours',
      render: (val: number) => `${Number(val || 0).toFixed(1)}h`
    },
    {
      title: '利用率',
      dataIndex: 'utilizationPercentage',
      key: 'utilizationPercentage',
      render: (val: number, record: MemberUtilization) => (
        <Progress
          percent={Number(val) || 0}
          size="small"
          strokeColor={getUtilizationColor(record.utilizationStatus)}
          format={() => `${Number(val || 0).toFixed(0)}%`}
        />
      ),
      sorter: (a: MemberUtilization, b: MemberUtilization) => Number(a.utilizationPercentage) - Number(b.utilizationPercentage)
    },
    {
      title: '效率指数',
      dataIndex: 'efficiencyIndex',
      key: 'efficiencyIndex',
      render: (val: number) => Number(val || 0).toFixed(2)
    },
    {
      title: '状态',
      dataIndex: 'utilizationStatus',
      key: 'utilizationStatus',
      render: (status: string) => (
        <Tag color={getUtilizationColor(status)}>{getUtilizationText(status)}</Tag>
      )
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => getTrendIcon(trend)
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
    return <Empty description="暂无利用率数据" />
  }

  return (
    <div className={styles.container}>
      {/* 周期选择 */}
      <div className={styles.periodSelector}>
        <Radio.Group value={period} onChange={e => setPeriod(e.target.value)}>
          <Radio.Button value="DAILY">按日</Radio.Button>
          <Radio.Button value="WEEKLY">按周</Radio.Button>
          <Radio.Button value="MONTHLY">按月</Radio.Button>
        </Radio.Group>
      </div>

      {/* 概览统计 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="团队平均利用率"
              value={Number(data.teamAverageUtilization || 0).toFixed(1)}
              suffix="%"
              valueStyle={{
                color: Number(data.teamAverageUtilization) >= 50 && Number(data.teamAverageUtilization) <= 80
                  ? '#52c41a'
                  : Number(data.teamAverageUtilization) > 80
                    ? '#ff4d4f'
                    : '#faad14'
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="目标利用率" 
              value={data.targetUtilization}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="最佳利用率人数" 
              value={data.distribution?.optimalCount || 0}
              suffix="人"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="过度利用人数" 
              value={data.distribution?.overutilizedCount || 0}
              suffix="人"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={12}>
          <Card title="利用率趋势" className={styles.chartCard}>
            <ReactECharts 
              option={getTrendOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="项目工时分布" className={styles.chartCard}>
            <ReactECharts 
              option={getProjectPieOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="利用率分布" className={styles.chartCard}>
            <ReactECharts 
              option={getDistributionOption()} 
              style={{ height: 300 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 成员列表 */}
      <Card title="成员利用率详情" className={styles.tableCard}>
        <Table 
          dataSource={data.memberUtilizations}
          columns={memberColumns}
          rowKey="userId"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default ResourceUtilization