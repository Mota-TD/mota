/**
 * 成员贡献度组件
 * RP-008: 成员贡献度排行
 */

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Avatar, Spin, Empty, Progress, Radio } from 'antd'
import { 
  TrophyOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  MinusOutlined,
  UserOutlined,
  CrownOutlined,
  StarOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { MemberContributionData, MemberContribution as MemberContributionType } from '@/services/api/reportAnalytics'
import { getMemberContribution } from '@/services/api/reportAnalytics'
import styles from './index.module.css'

interface MemberContributionProps {
  teamId?: number
  startDate: string
  endDate: string
}

const MemberContribution: React.FC<MemberContributionProps> = ({
  teamId,
  startDate,
  endDate
}) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MemberContributionData | null>(null)
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('MONTHLY')

  useEffect(() => {
    fetchData()
  }, [teamId, startDate, endDate, period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getMemberContribution({ teamId, period, startDate, endDate })
      setData(result)
    } catch (error) {
      console.error('获取成员贡献度失败:', error)
    } finally {
      setLoading(false)
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#faad14', fontSize: 18 }} />
    if (rank === 2) return <CrownOutlined style={{ color: '#bfbfbf', fontSize: 16 }} />
    if (rank === 3) return <CrownOutlined style={{ color: '#d48806', fontSize: 14 }} />
    return <span className={styles.rankNumber}>{rank}</span>
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a'
    if (score >= 60) return '#1890ff'
    if (score >= 40) return '#faad14'
    return '#ff4d4f'
  }

  // 贡献度分布饼图
  const getDistributionOption = () => {
    if (!data?.distribution) return {}
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)'
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
          data: data.distribution.map((d, i) => ({
            name: d.level,
            value: d.count,
            itemStyle: { 
              color: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'][i % 4]
            }
          }))
        }
      ]
    }
  }

  // 贡献趋势图
  const getTrendOption = () => {
    if (!data?.trends) return {}
    
    const trends = data.trends
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['平均得分', '最高得分', '最低得分'],
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
      yAxis: {
        type: 'value',
        name: '得分',
        max: 100
      },
      series: [
        {
          name: '平均得分',
          type: 'line',
          data: trends.map(t => t.avgScore?.toFixed(1)),
          itemStyle: { color: '#1890ff' },
          smooth: true,
          areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
        },
        {
          name: '最高得分',
          type: 'line',
          data: trends.map(t => t.topContributorScore?.toFixed(1)),
          itemStyle: { color: '#52c41a' },
          smooth: true,
          lineStyle: { type: 'dashed' }
        },
        {
          name: '最低得分',
          type: 'line',
          data: trends.map(t => t.bottomContributorScore?.toFixed(1)),
          itemStyle: { color: '#ff4d4f' },
          smooth: true,
          lineStyle: { type: 'dashed' }
        }
      ]
    }
  }

  // 成员贡献雷达图（Top 5）
  const getRadarOption = () => {
    if (!data?.topContributors) return {}
    
    const top5 = data.topContributors.slice(0, 5)
    return {
      tooltip: {},
      legend: {
        data: top5.map(m => m.userName),
        bottom: 0
      },
      radar: {
        indicator: [
          { name: '完成率', max: 100 },
          { name: '准时率', max: 100 },
          { name: '工时贡献', max: 100 },
          { name: '协作指数', max: 100 },
          { name: '综合得分', max: 100 }
        ]
      },
      series: [
        {
          type: 'radar',
          data: top5.map((m, i) => ({
            value: [
              m.completionRate || 0,
              m.onTimeRate || 0,
              m.hoursPercentage || 0,
              Math.min(100, (m.commentsCount + m.reviewsCount + m.helpedOthers) * 5),
              m.contributionScore || 0
            ],
            name: m.userName,
            lineStyle: { 
              color: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'][i % 5]
            },
            areaStyle: { 
              color: ['rgba(24,144,255,0.2)', 'rgba(82,196,26,0.2)', 'rgba(250,173,20,0.2)', 'rgba(255,77,79,0.2)', 'rgba(114,46,209,0.2)'][i % 5]
            }
          }))
        }
      ]
    }
  }

  // 成员表格列
  const memberColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      render: (rank: number) => (
        <div className={styles.rankCell}>
          {getRankIcon(rank)}
        </div>
      )
    },
    {
      title: '成员',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: MemberContributionType) => (
        <div className={styles.memberCell}>
          <Avatar size="small" src={record.avatar} icon={<UserOutlined />} />
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{text}</div>
            <div className={styles.memberDept}>{record.department} · {record.position}</div>
          </div>
        </div>
      )
    },
    {
      title: '贡献得分',
      dataIndex: 'contributionScore',
      key: 'contributionScore',
      render: (score: number, record: MemberContributionType) => (
        <div className={styles.scoreCell}>
          <Progress 
            type="circle" 
            percent={score} 
            size={50}
            strokeColor={getScoreColor(score)}
            format={() => score?.toFixed(0)}
          />
          <div className={styles.scoreTrend}>
            {getTrendIcon(record.trend)}
            <span style={{ color: record.scoreChange > 0 ? '#52c41a' : record.scoreChange < 0 ? '#ff4d4f' : '#8c8c8c' }}>
              {record.scoreChange > 0 ? '+' : ''}{record.scoreChange?.toFixed(1)}
            </span>
          </div>
        </div>
      ),
      sorter: (a: MemberContributionType, b: MemberContributionType) => a.contributionScore - b.contributionScore,
      defaultSortOrder: 'descend' as const
    },
    {
      title: '任务完成',
      dataIndex: 'completedTasks',
      key: 'completedTasks',
      render: (val: number, record: MemberContributionType) => (
        <div>
          <div>{val} / {record.totalTasks}</div>
          <Progress 
            percent={record.completionRate} 
            size="small" 
            showInfo={false}
            strokeColor="#1890ff"
          />
        </div>
      )
    },
    {
      title: '工时贡献',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (val: number, record: MemberContributionType) => (
        <div>
          <div>{val?.toFixed(1)}h</div>
          <Tag color="blue">{record.hoursPercentage?.toFixed(1)}%</Tag>
        </div>
      )
    },
    {
      title: '准时率',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      render: (val: number) => (
        <Tag color={val >= 90 ? 'green' : val >= 70 ? 'blue' : 'orange'}>
          {val?.toFixed(1)}%
        </Tag>
      )
    },
    {
      title: '协作指数',
      dataIndex: 'commentsCount',
      key: 'collaboration',
      render: (_: any, record: MemberContributionType) => (
        <div className={styles.collaborationCell}>
          <span title="评论数">💬 {record.commentsCount}</span>
          <span title="评审数">👁 {record.reviewsCount}</span>
          <span title="帮助他人">🤝 {record.helpedOthers}</span>
        </div>
      )
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
    return <Empty description="暂无贡献度数据" />
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

      {/* 统计卡片 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="团队成员" 
              value={data.totalMembers}
              suffix="人"
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="平均贡献得分" 
              value={data.avgContributionScore?.toFixed(1)}
              prefix={<StarOutlined />}
              valueStyle={{ color: getScoreColor(data.avgContributionScore) }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="核心贡献者" 
              value={data.distribution?.find(d => d.level === '核心贡献者')?.count || 0}
              suffix="人"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="待提升成员" 
              value={data.distribution?.find(d => d.level === '待提升')?.count || 0}
              suffix="人"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Top 贡献者展示 */}
      <Card title="🏆 Top 贡献者" className={styles.topCard}>
        <Row gutter={16}>
          {data.topContributors?.slice(0, 3).map((member, index) => (
            <Col span={8} key={member.userId}>
              <div className={`${styles.topMember} ${styles[`top${index + 1}`]}`}>
                <div className={styles.topRank}>{getRankIcon(index + 1)}</div>
                <Avatar size={64} src={member.avatar} icon={<UserOutlined />} />
                <div className={styles.topName}>{member.userName}</div>
                <div className={styles.topDept}>{member.department}</div>
                <div className={styles.topScore}>
                  <span className={styles.scoreValue}>{member.contributionScore?.toFixed(0)}</span>
                  <span className={styles.scoreLabel}>分</span>
                </div>
                <div className={styles.topStats}>
                  <Tag color="blue">完成 {member.completedTasks} 任务</Tag>
                  <Tag color="green">准时率 {member.onTimeRate?.toFixed(0)}%</Tag>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 图表区域 */}
      <Row gutter={16} className={styles.chartRow}>
        <Col span={8}>
          <Card title="贡献度分布" className={styles.chartCard}>
            <ReactECharts 
              option={getDistributionOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="贡献趋势" className={styles.chartCard}>
            <ReactECharts 
              option={getTrendOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Top 5 能力雷达" className={styles.chartCard}>
            <ReactECharts 
              option={getRadarOption()} 
              style={{ height: 280 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 成员列表 */}
      <Card title="成员贡献度排行" className={styles.tableCard}>
        <Table 
          dataSource={data.members}
          columns={memberColumns}
          rowKey="userId"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  )
}

export default MemberContribution