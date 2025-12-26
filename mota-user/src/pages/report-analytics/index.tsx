/**
 * 报表分析页面
 * 集成所有报表分析组件：团队效能指标、平均完成时间、逾期率统计、成员贡献度
 */

import React, { useState, useEffect } from 'react'
import { Tabs, DatePicker, Select, Card, Space, Button, message } from 'antd'
import { 
  DashboardOutlined, 
  ClockCircleOutlined, 
  WarningOutlined,
  TrophyOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import TeamEfficiency from '@/components/TeamEfficiency'
import AvgCompletionTime from '@/components/AvgCompletionTime'
import OverdueRate from '@/components/OverdueRate'
import MemberContribution from '@/components/MemberContribution'
import styles from './index.module.css'

const { RangePicker } = DatePicker
const { TabPane } = Tabs

const ReportAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('efficiency')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ])
  const [teamId, setTeamId] = useState<number>(0)
  const [teams, setTeams] = useState<{ id: number; name: string }[]>([])

  // 加载团队列表
  useEffect(() => {
    const loadTeams = async () => {
      try {
        // TODO: 从API获取团队列表
        // const data = await getTeams()
        // setTeams(data)
        setTeams([])
      } catch (error) {
        console.error('加载团队列表失败:', error)
        message.error('加载团队列表失败')
        setTeams([])
      }
    }
    loadTeams()
  }, [])

  const startDate = dateRange[0].format('YYYY-MM-DD')
  const endDate = dateRange[1].format('YYYY-MM-DD')

  const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]])
    }
  }

  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出报表', { activeTab, teamId, startDate, endDate })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>报表分析</h1>
        <p className={styles.subtitle}>团队效能分析、任务完成情况统计、成员贡献度排行</p>
      </div>

      {/* 筛选器 */}
      <Card className={styles.filterCard}>
        <Space size="large">
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>团队:</span>
            <Select
              value={teamId}
              onChange={setTeamId}
              style={{ width: 150 }}
              options={teams.map(t => ({ value: t.id, label: t.name }))}
            />
          </div>
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>时间范围:</span>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              allowClear={false}
            />
          </div>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出报表
          </Button>
        </Space>
      </Card>

      {/* 标签页 */}
      <Card className={styles.contentCard}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
        >
          <TabPane 
            tab={<span><DashboardOutlined />团队效能</span>} 
            key="efficiency"
          >
            <TeamEfficiency 
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane 
            tab={<span><ClockCircleOutlined />完成时间</span>} 
            key="completion"
          >
            <AvgCompletionTime 
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane 
            tab={<span><WarningOutlined />逾期分析</span>} 
            key="overdue"
          >
            <OverdueRate 
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane 
            tab={<span><TrophyOutlined />成员贡献</span>} 
            key="contribution"
          >
            <MemberContribution 
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default ReportAnalyticsPage