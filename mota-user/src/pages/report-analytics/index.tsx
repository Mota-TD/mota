/**
 * 报表分析页面
 * 集成所有报表分析组件：团队效能指标、平均完成时间、逾期率统计、成员贡献度
 */

import React, { useState, useEffect, useRef } from 'react'
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
import { getDepartmentsByOrgId } from '@/services/api/department'
import styles from './index.module.css'

const { RangePicker } = DatePicker
const { TabPane } = Tabs

// 默认团队列表
const DEFAULT_TEAMS = [
  { id: 1, name: '总经办' },
  { id: 2, name: '运营部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '营销部' },
  { id: 5, name: '财务部' },
  { id: 6, name: '行政部' },
  { id: 7, name: '科技部' }
]

// 特殊值表示"全部团队"
const ALL_TEAMS_VALUE = 0

const ReportAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('efficiency')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ])
  // 默认选中"全部团队"
  const [teamId, setTeamId] = useState<number>(ALL_TEAMS_VALUE)
  const [teams, setTeams] = useState<{ id: number; name: string }[]>(DEFAULT_TEAMS)
  const [teamsLoading, setTeamsLoading] = useState(false)
  
  // 使用 ref 防止重复请求
  const teamsLoadedRef = useRef(false)
  const loadingRef = useRef(false)

  // 加载团队列表（使用部门作为团队）
  useEffect(() => {
    // 防止重复请求
    if (teamsLoadedRef.current || loadingRef.current) {
      return
    }
    
    const loadTeams = async () => {
      loadingRef.current = true
      setTeamsLoading(true)
      try {
        const data = await getDepartmentsByOrgId('default')
        // 将部门数据转换为团队选项
        const teamOptions = (data || []).map((dept: any) => ({
          id: Number(dept.id),
          name: dept.name
        }))
        if (teamOptions.length > 0) {
          setTeams(teamOptions)
        }
        teamsLoadedRef.current = true
      } catch (error) {
        console.error('加载团队列表失败:', error)
        // 保持使用默认团队列表
      } finally {
        setTeamsLoading(false)
        loadingRef.current = false
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
              onChange={(value) => setTeamId(value ?? ALL_TEAMS_VALUE)}
              style={{ width: 150 }}
              loading={teamsLoading}
              options={[
                { value: ALL_TEAMS_VALUE, label: '全部团队' },
                ...teams.map(t => ({ value: t.id, label: t.name }))
              ]}
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
              teamId={teamId === ALL_TEAMS_VALUE ? undefined : teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane
            tab={<span><ClockCircleOutlined />完成时间</span>}
            key="completion"
          >
            <AvgCompletionTime
              teamId={teamId === ALL_TEAMS_VALUE ? undefined : teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane
            tab={<span><WarningOutlined />逾期分析</span>}
            key="overdue"
          >
            <OverdueRate
              teamId={teamId === ALL_TEAMS_VALUE ? undefined : teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane
            tab={<span><TrophyOutlined />成员贡献</span>}
            key="contribution"
          >
            <MemberContribution
              teamId={teamId === ALL_TEAMS_VALUE ? undefined : teamId}
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