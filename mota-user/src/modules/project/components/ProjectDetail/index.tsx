/**
 * 项目详情组件
 * 展示项目的完整信息，包括概览、任务、里程碑、成员等
 */

import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, Spin, Empty, Button, Modal, message } from 'antd'
import type { TabsProps } from 'antd'
import {
  DashboardOutlined,
  ApartmentOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  ProjectOutlined,
  FlagOutlined,
  TeamOutlined,
  FileTextOutlined,
  RobotOutlined,
  BookOutlined
} from '@ant-design/icons'
import { useProjectDetail } from './useProjectDetail'
import ProjectHeader from './ProjectHeader'
import OverviewTab from './tabs/OverviewTab'
import type { TabKey, ProjectDetailProps, ProjectActivity } from './types'
import styles from './index.module.css'

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId: propProjectId }) => {
  const { id: paramId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = propProjectId || paramId || ''

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [membersModalVisible, setMembersModalVisible] = useState(false)

  const {
    project,
    members,
    milestones,
    statistics,
    departmentTasks,
    tasks,
    departments,
    users,
    activities,
    taskDependencies,
    criticalPath,
    loading,
    starred,
    isArchived,
    deptTaskStats,
    reload,
    toggleStar,
    archiveProject,
    restoreProject,
    updateStatus,
    deleteProject
  } = useProjectDetail({ projectId })

  // 处理编辑
  const handleEdit = useCallback(() => {
    setEditModalVisible(true)
  }, [])

  // 处理设置
  const handleSettings = useCallback(() => {
    setSettingsVisible(true)
  }, [])

  // 处理成员管理
  const handleManageMembers = useCallback(() => {
    setMembersModalVisible(true)
  }, [])

  // 转换活动数据格式
  const convertActivities = (): ProjectActivity[] => {
    return activities.map(activity => ({
      id: String(activity.id),
      type: activity.action,
      content: activity.target,
      userId: String(activity.userId),
      userName: activity.user?.name || activity.user?.nickname || '未知用户',
      userAvatar: activity.user?.avatar,
      createdAt: activity.time,
      projectId
    }))
  }

  // 标签页配置
  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: (
        <span>
          <DashboardOutlined />
          概览
        </span>
      ),
      children: project ? (
        <OverviewTab
          project={project}
          members={members}
          milestones={milestones}
          deptTaskStats={deptTaskStats}
          activities={convertActivities()}
        />
      ) : null
    },
    {
      key: 'department-tasks',
      label: (
        <span>
          <ApartmentOutlined />
          部门任务
        </span>
      ),
      children: (
        <div className={styles.deptTasksTab}>
          <Empty description="部门任务功能开发中" />
        </div>
      )
    },
    {
      key: 'tasks',
      label: (
        <span>
          <UnorderedListOutlined />
          执行任务
        </span>
      ),
      children: (
        <div className={styles.tasksTab}>
          <Empty description="执行任务功能开发中" />
        </div>
      )
    },
    {
      key: 'gantt',
      label: (
        <span>
          <BarChartOutlined />
          甘特图
        </span>
      ),
      children: (
        <div className={styles.ganttTab}>
          <Empty description="甘特图功能开发中" />
        </div>
      )
    },
    {
      key: 'kanban',
      label: (
        <span>
          <ProjectOutlined />
          看板
        </span>
      ),
      children: (
        <div className={styles.kanbanTab}>
          <Empty description="看板功能开发中" />
        </div>
      )
    },
    {
      key: 'milestones',
      label: (
        <span>
          <FlagOutlined />
          里程碑
        </span>
      ),
      children: (
        <div className={styles.milestonesTab}>
          <Empty description="里程碑功能开发中" />
        </div>
      )
    },
    {
      key: 'members',
      label: (
        <span>
          <TeamOutlined />
          成员
        </span>
      ),
      children: (
        <div className={styles.membersTab}>
          <Empty description="成员管理功能开发中" />
        </div>
      )
    },
    {
      key: 'work-plan-approval',
      label: (
        <span>
          <FileTextOutlined />
          工作计划审批
        </span>
      ),
      children: (
        <div className={styles.wikiTab}>
          <Empty description="工作计划审批功能开发中" />
        </div>
      )
    },
    {
      key: 'ai-assistant',
      label: (
        <span>
          <RobotOutlined />
          AI 助手
        </span>
      ),
      children: (
        <div className={styles.aiTab}>
          <Empty description="AI 助手功能开发中" />
        </div>
      )
    },
    {
      key: 'wiki',
      label: (
        <span>
          <BookOutlined />
          Wiki
        </span>
      ),
      children: (
        <div className={styles.wikiTab}>
          <Empty description="Wiki 功能开发中" />
        </div>
      )
    }
  ]

  // 加载中
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="加载项目详情..." />
      </div>
    )
  }

  // 项目不存在
  if (!project) {
    return (
      <div className={styles.notFound}>
        <Empty description="项目不存在或已被删除">
          <Button type="primary" onClick={() => navigate('/projects')}>
            返回项目列表
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 项目头部 */}
      <ProjectHeader
        project={project}
        starred={starred}
        isArchived={isArchived}
        deptTaskStats={deptTaskStats}
        milestonesCount={milestones.length}
        membersCount={members.length}
        onToggleStar={toggleStar}
        onEdit={handleEdit}
        onSettings={handleSettings}
        onManageMembers={handleManageMembers}
        onUpdateStatus={updateStatus}
        onArchive={archiveProject}
        onRestore={restoreProject}
        onDelete={deleteProject}
      />

      {/* 标签页内容 */}
      <div className={styles.tabContent}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={tabItems}
          size="large"
        />
      </div>

      {/* TODO: 编辑项目弹窗 */}
      {/* TODO: 项目设置抽屉 */}
      {/* TODO: 成员管理弹窗 */}
    </div>
  )
}

export default ProjectDetail