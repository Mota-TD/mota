/**
 * 项目详情头部组件
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Space, Dropdown, Modal } from 'antd'
import type { MenuProps } from 'antd'
import {
  ArrowLeftOutlined,
  StarOutlined,
  StarFilled,
  EditOutlined,
  SettingOutlined,
  MoreOutlined,
  TeamOutlined,
  InboxOutlined,
  UndoOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  UserOutlined,
  ApartmentOutlined,
  FlagOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Project } from '../../types'
import { PROJECT_STATUS_CONFIG, PRIORITY_CONFIG, DeptTaskStats } from './types'
import styles from './index.module.css'

export interface ProjectHeaderProps {
  project: Project
  starred: boolean
  isArchived: boolean
  deptTaskStats: DeptTaskStats
  milestonesCount: number
  membersCount: number
  onToggleStar: () => void
  onEdit: () => void
  onSettings: () => void
  onManageMembers: () => void
  onUpdateStatus: (status: string) => void
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  starred,
  isArchived,
  deptTaskStats,
  milestonesCount,
  membersCount,
  onToggleStar,
  onEdit,
  onSettings,
  onManageMembers,
  onUpdateStatus,
  onArchive,
  onRestore,
  onDelete
}) => {
  const navigate = useNavigate()

  const getStatusTag = (status: string) => {
    const config = PROJECT_STATUS_CONFIG[status] || { color: 'default', text: status }
    const iconMap: Record<string, React.ReactNode> = {
      planning: <ClockCircleOutlined />,
      active: <PlayCircleOutlined />,
      completed: <CheckCircleOutlined />,
      suspended: <PauseCircleOutlined />,
      cancelled: <StopOutlined />,
      archived: <InboxOutlined />
    }
    return (
      <Tag color={config.color} icon={iconMap[status]}>
        {config.text}
      </Tag>
    )
  }

  const getPriorityTag = (priority: string) => {
    const config = PRIORITY_CONFIG[priority] || { color: 'default', text: priority }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 状态切换菜单项
  const statusMenuItems: MenuProps['items'] = Object.entries(PROJECT_STATUS_CONFIG)
    .filter(([key]) => key !== 'archived' && key !== project.status)
    .map(([key, config]) => ({
      key,
      label: `切换为${config.text}`,
      onClick: () => onUpdateStatus(key)
    }))

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑项目',
      onClick: onEdit,
      disabled: isArchived
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '项目设置',
      onClick: onSettings
    },
    {
      key: 'members',
      icon: <TeamOutlined />,
      label: '成员管理',
      onClick: onManageMembers,
      disabled: isArchived
    },
    { type: 'divider' },
    ...statusMenuItems,
    { type: 'divider' },
    isArchived ? {
      key: 'restore',
      icon: <UndoOutlined />,
      label: '恢复项目',
      onClick: onRestore
    } : {
      key: 'archive',
      icon: <InboxOutlined />,
      label: '归档项目',
      onClick: () => {
        Modal.confirm({
          title: '确认归档',
          icon: <InboxOutlined />,
          content: '归档后项目将变为只读状态，可以随时恢复。确定要归档此项目吗？',
          okText: '确认归档',
          cancelText: '取消',
          onOk: onArchive
        })
      }
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除项目',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '确认删除',
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
          content: (
            <div>
              <p>删除项目后，所有相关数据将被清除，此操作不可恢复。</p>
              <p style={{ color: '#ff4d4f' }}>包括：部门任务、执行任务、里程碑、成员关系等</p>
            </div>
          ),
          okText: '确认删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => {
            onDelete()
            navigate('/projects')
          }
        })
      }
    }
  ]

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/projects')}
          style={{ marginRight: 8 }}
        />
        <div
          className={styles.projectAvatar}
          style={{ backgroundColor: project.color || '#2b7de9' }}
        >
          {project.name.charAt(0)}
        </div>
        <div className={styles.projectInfo}>
          <div className={styles.projectTitle}>
            <h1 className={styles.projectName}>{project.name}</h1>
            <span className={styles.projectKey}>{project.key}</span>
            {getStatusTag(project.status)}
            {project.priority && getPriorityTag(project.priority)}
          </div>
          <p className={styles.projectDesc}>{project.description || '暂无描述'}</p>
          <div className={styles.projectMeta}>
            <span><UserOutlined /> {membersCount} 成员</span>
            <span><ApartmentOutlined /> {deptTaskStats.total} 部门任务</span>
            <span><FlagOutlined /> {milestonesCount} 里程碑</span>
            {project.startDate && project.endDate && (
              <span>
                <CalendarOutlined /> {dayjs(project.startDate).format('YYYY-MM-DD')} ~ {dayjs(project.endDate).format('YYYY-MM-DD')}
              </span>
            )}
          </div>
        </div>
      </div>
      <Space>
        <Button
          type="text"
          icon={starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
          onClick={onToggleStar}
        />
        <Button icon={<EditOutlined />} onClick={onEdit} disabled={isArchived}>
          编辑
        </Button>
        <Button icon={<SettingOutlined />} onClick={onSettings}>
          设置
        </Button>
        <Dropdown menu={{ items: moreMenuItems }}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      </Space>
    </div>
  )
}

export default ProjectHeader