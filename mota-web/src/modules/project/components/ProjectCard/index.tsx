/**
 * 项目卡片组件
 * 用于网格视图和列表视图展示项目
 */

import React from 'react'
import { Card, Avatar, Tag, Progress, Button, Dropdown, Tooltip, Space } from 'antd'
import {
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import styles from './index.module.css'

// 项目状态配置
const PROJECT_STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  planning: { color: 'orange', text: '规划中' },
  active: { color: 'green', text: '进行中' },
  completed: { color: 'blue', text: '已完成' },
  suspended: { color: 'gold', text: '已暂停' },
  cancelled: { color: 'red', text: '已取消' },
  archived: { color: 'default', text: '已归档' }
}

export interface Project {
  id: string
  name: string
  key: string
  description?: string
  status: string
  color?: string
  progress?: number
  memberCount?: number
  issueCount?: number
  starred?: number
  startDate?: string
  endDate?: string
  priority?: string
  visibility?: string
  ownerId?: string
}

export interface ProjectCardProps {
  project: Project
  viewMode: 'grid' | 'list'
  onEdit?: (project: Project) => void
  onSettings?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onToggleStar?: (projectId: string, starred: number) => void
  onClick?: (project: Project) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onEdit,
  onSettings,
  onDelete,
  onToggleStar,
  onClick,
}) => {
  const getStatusTag = (status: string) => {
    const s = PROJECT_STATUS_CONFIG[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑项目',
      onClick: (info) => {
        info.domEvent.stopPropagation()
        onEdit?.(project)
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '项目设置',
      onClick: (info) => {
        info.domEvent.stopPropagation()
        onSettings?.(project)
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除项目',
      danger: true,
      onClick: (info) => {
        info.domEvent.stopPropagation()
        onDelete?.(project.id)
      }
    }
  ]

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleStar?.(project.id, project.starred || 0)
  }

  const handleCardClick = () => {
    onClick?.(project)
  }

  if (viewMode === 'grid') {
    return (
      <Card
        className={styles.projectCard}
        hoverable
        onClick={handleCardClick}
      >
        <div className={styles.cardHeader}>
          <Avatar
            shape="square"
            size={48}
            style={{ backgroundColor: project.color || '#1677ff' }}
          >
            {project.name.charAt(0)}
          </Avatar>
          <div className={styles.cardActions}>
            <Button
              type="text"
              size="small"
              icon={project.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={handleStarClick}
            />
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </div>
        <div className={styles.cardBody}>
          <h3 className={styles.projectName}>{project.name}</h3>
          <p className={styles.projectKey}>{project.key}</p>
          <p className={styles.projectDesc}>
            {project.description || '暂无描述'}
          </p>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.projectMeta}>
            {getStatusTag(project.status)}
            <span className={styles.memberCount}>
              {project.memberCount} 成员
            </span>
          </div>
          <Progress
            percent={project.progress || 0}
            size="small"
            showInfo={false}
            strokeColor="#1677ff"
          />
        </div>
      </Card>
    )
  }

  // 列表视图
  return (
    <Card
      className={styles.listItem}
      hoverable
      onClick={handleCardClick}
    >
      <div className={styles.listItemContent}>
        <Avatar
          shape="square"
          size={40}
          style={{ backgroundColor: project.color || '#1677ff' }}
        >
          {project.name.charAt(0)}
        </Avatar>
        <div className={styles.listItemInfo}>
          <div className={styles.listItemHeader}>
            <h3>{project.name}</h3>
            <span className={styles.projectKey}>{project.key}</span>
          </div>
          <p className={styles.projectDesc}>
            {project.description || '暂无描述'}
          </p>
        </div>
        <div className={styles.listItemMeta}>
          {getStatusTag(project.status)}
          <span>{project.memberCount} 成员</span>
          <span>{project.issueCount} 事项</span>
        </div>
        <div className={styles.listItemProgress}>
          <Progress
            percent={project.progress || 0}
            size="small"
            strokeColor="#1677ff"
          />
        </div>
        <div className={styles.listItemActions}>
          <Button
            type="text"
            icon={project.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={handleStarClick}
          />
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      </div>
    </Card>
  )
}

export default ProjectCard