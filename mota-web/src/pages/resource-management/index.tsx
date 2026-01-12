/**
 * 资源管理页面
 * 集成所有资源管理组件：工作量统计、团队分布、工作量预警、资源日历、资源利用率、跨项目冲突
 */

import React, { useState, useEffect, useRef } from 'react'
import { Tabs, DatePicker, Select, Card, Space, message } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  AlertOutlined,
  CalendarOutlined,
  BarChartOutlined,
  WarningOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import WorkloadStats from '@/components/WorkloadStats'
import TeamDistribution from '@/components/TeamDistribution'
import WorkloadAlert from '@/components/WorkloadAlert'
import ResourceCalendar from '@/components/ResourceCalendar'
import ResourceUtilization from '@/components/ResourceUtilization'
import ProjectConflict from '@/components/ProjectConflict'
import { getDepartmentsByOrgId, Department } from '@/services/api/department'
import styles from './index.module.css'

const { RangePicker } = DatePicker
const { TabPane } = Tabs

const ResourceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workload')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ])
  const [teamId, setTeamId] = useState<string | undefined>(undefined)
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  
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
      setLoading(true)
      try {
        // 使用默认组织ID获取部门列表
        const departments = await getDepartmentsByOrgId('default')
        const teamList = departments.map((dept: Department) => ({
          id: dept.id,
          name: dept.name
        }))
        setTeams(teamList)
        teamsLoadedRef.current = true
        // 如果有团队，默认选择第一个
        if (teamList.length > 0) {
          setTeamId(teamList[0].id)
        }
      } catch (error) {
        console.error('加载团队列表失败:', error)
        // 如果API失败，不设置默认团队
        setTeams([])
        setTeamId(undefined)
      } finally {
        setLoading(false)
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>资源管理</h1>
        <p className={styles.subtitle}>管理团队资源分配、监控工作负载、检测资源冲突</p>
      </div>

      {/* 筛选器 */}
      <Card className={styles.filterCard}>
        <Space size="large">
          <div className={styles.filterItem}>
            <span className={styles.filterLabel}>团队:</span>
            <Select
              value={teamId}
              onChange={(value) => setTeamId(value || undefined)}
              style={{ width: 200 }}
              loading={loading}
              placeholder="请选择团队"
              allowClear
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
            tab={<span><UserOutlined />工作量统计</span>}
            key="workload"
          >
            <WorkloadStats
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane
            tab={<span><TeamOutlined />团队分布</span>}
            key="distribution"
          >
            <TeamDistribution
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane
            tab={<span><AlertOutlined />工作量预警</span>}
            key="alert"
          >
            <WorkloadAlert teamId={teamId} />
          </TabPane>

          <TabPane
            tab={<span><CalendarOutlined />资源日历</span>}
            key="calendar"
          >
            <ResourceCalendar
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane
            tab={<span><BarChartOutlined />资源利用率</span>}
            key="utilization"
          >
            <ResourceUtilization
              teamId={teamId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabPane>

          <TabPane
            tab={<span><WarningOutlined />跨项目冲突</span>}
            key="conflict"
          >
            <ProjectConflict
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

export default ResourceManagementPage