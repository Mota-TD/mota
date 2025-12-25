/**
 * 速度趋势组件
 * 团队速度趋势分析
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
  Table,
  message,
  Collapse,
  List,
  Select
} from 'antd'
import {
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  TeamOutlined,
  TrophyOutlined,
  BulbOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { progressTrackingApi, VelocityTrendData, SprintVelocity } from '@/services/api/progressTracking'
import styles from './index.module.css'

const { Panel } = Collapse

interface VelocityTrendProps {
  projectId: number
  sprintCount?: number
  onSprintCountChange?: (count: number) => void
}

const VelocityTrend: React.FC<VelocityTrendProps> = ({
  projectId,
  sprintCount = 6,
  onSprintCountChange
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<VelocityTrendData | null>(null)
  const [selectedSprintCount, setSelectedSprintCount] = useState(sprintCount)

  useEffect(() => {
    loadData()
  }, [projectId, selectedSprintCount])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await progressTrackingApi.getVelocityTrend(projectId, selectedSprintCount)
      setData(result)
    } catch (error) {
      console.error('Load velocity trend error:', error)
      message.error('加载速度趋势数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSprintCountChange = (value: number) => {
    setSelectedSprintCount(value)
    onSprintCountChange?.(value)
  }

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />
      case 'decreasing':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <MinusOutlined style={{ color: '#1677ff' }} />
    }
  }

  // 生成ECharts配置
  const chartOption = useMemo(() => {
    if (!data || !data.sprintVelocities) return {}

    const sprints = data.sprintVelocities
    const sprintNames = sprints.map(s => s.sprintName)
    const plannedData = sprints.map(s => s.plannedPoints)
    const completedData = sprints.map(s => s.completedPoints)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['计划点数', '完成点数', '平均速度'],
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
        data: sprintNames,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '故事点',
        nameLocation: 'middle',
        nameGap: 40
      },
      series: [
        {
          name: '计划点数',
          type: 'bar',
          data: plannedData,
          itemStyle: {
            color: '#1677ff',
            opacity: 0.6
          },
          barWidth: '30%'
        },
        {
          name: '完成点数',
          type: 'bar',
          data: completedData,
          itemStyle: {
            color: '#52c41a'
          },
          barWidth: '30%'
        },
        {
          name: '平均速度',
          type: 'line',
          data: sprints.map(() => data.averageVelocity),
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

  // Sprint详情表格列
  const columns = [
    {
      title: 'Sprint',
      dataIndex: 'sprintName',
      key: 'sprintName',
      width: 100
    },
    {
      title: '日期范围',
      key: 'dateRange',
      width: 180,
      render: (_: unknown, record: SprintVelocity) => (
        <span>{record.startDate} ~ {record.endDate}</span>
      )
    },
    {
      title: '计划/完成',
      key: 'points',
      width: 120,
      render: (_: unknown, record: SprintVelocity) => (
        <span>
          {record.plannedPoints} / <span style={{ color: '#52c41a' }}>{record.completedPoints}</span>
        </span>
      )
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 100,
      render: (rate: number) => (
        <Tag color={rate >= 90 ? 'green' : rate >= 70 ? 'orange' : 'red'}>
          {rate?.toFixed(0)}%
        </Tag>
      )
    },
    {
      title: '团队规模',
      dataIndex: 'teamSize',
      key: 'teamSize',
      width: 80,
      render: (size: number) => <span>{size}人</span>
    },
    {
      title: '人均产出',
      dataIndex: 'pointsPerMember',
      key: 'pointsPerMember',
      width: 100,
      render: (points: number) => <span>{points?.toFixed(1)}点</span>
    }
  ]

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
          <ThunderboltOutlined />
          <span>速度趋势</span>
          <Tag color={progressTrackingApi.getVelocityTrendColor(data.velocityTrend)}>
            {getTrendIcon(data.velocityTrend)}
            {progressTrackingApi.getVelocityTrendText(data.velocityTrend)}
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <span>分析周期:</span>
          <Select
            value={selectedSprintCount}
            onChange={handleSprintCountChange}
            style={{ width: 120 }}
            options={[
              { value: 3, label: '最近3个Sprint' },
              { value: 6, label: '最近6个Sprint' },
              { value: 10, label: '最近10个Sprint' }
            ]}
          />
        </Space>
      }
    >
      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={4}>
          <Statistic
            title="平均速度"
            value={data.averageVelocity?.toFixed(1)}
            prefix={<TrophyOutlined />}
            suffix="点/Sprint"
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="速度变化"
            value={Math.abs(data.velocityChangePercentage || 0).toFixed(1)}
            prefix={getTrendIcon(data.velocityTrend)}
            suffix="%"
            valueStyle={{ 
              color: data.velocityTrend === 'increasing' ? '#52c41a' : 
                     data.velocityTrend === 'decreasing' ? '#ff4d4f' : '#1677ff' 
            }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="最高速度"
            value={data.maxVelocity}
            suffix="点"
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="最低速度"
            value={data.minVelocity}
            suffix="点"
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="团队规模"
            value={data.teamSize}
            prefix={<TeamOutlined />}
            suffix="人"
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="预测下Sprint"
            value={data.predictedNextVelocity}
            suffix="点"
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
      </Row>

      {/* 图表 */}
      <div className={styles.chartContainer}>
        <ReactECharts 
          option={chartOption} 
          style={{ height: 350 }}
          notMerge={true}
        />
      </div>

      {/* Sprint详情表格 */}
      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={data.sprintVelocities}
          rowKey="sprintId"
          size="small"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </div>

      {/* 分析与建议 */}
      {data.analysis && (
        <Collapse className={styles.analysisSection} defaultActiveKey={['analysis']}>
          <Panel 
            header={
              <Space>
                <BulbOutlined />
                <span>速度分析与建议</span>
              </Space>
            } 
            key="analysis"
          >
            <div className={styles.analysisContent}>
              <div className={styles.conclusion}>
                <strong>分析结论：</strong>{data.analysis.conclusion}
              </div>
              
              {data.analysis.factors && data.analysis.factors.length > 0 && (
                <div className={styles.factors}>
                  <strong>影响因素：</strong>
                  <List
                    size="small"
                    dataSource={data.analysis.factors}
                    renderItem={(item) => (
                      <List.Item>• {item}</List.Item>
                    )}
                  />
                </div>
              )}
              
              {data.analysis.suggestions && data.analysis.suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  <strong>改进建议：</strong>
                  <List
                    size="small"
                    dataSource={data.analysis.suggestions}
                    renderItem={(item) => (
                      <List.Item>
                        <Tag color="blue">建议</Tag> {item}
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          </Panel>
        </Collapse>
      )}
    </Card>
  )
}

export default VelocityTrend