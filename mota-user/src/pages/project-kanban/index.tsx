import { useState, useEffect } from 'react'
import { Card, Row, Col, Avatar, Tag, Progress, Typography, Empty, Spin, Input, Select, Space } from 'antd'
import {
  ProjectOutlined,
  SearchOutlined,
  TeamOutlined
} from '@ant-design/icons'
import * as projectApi from '@/services/api/project'
import styles from './index.module.css'

const { Title, Text } = Typography

interface Project {
  id: number
  name: string
  key: string
  description?: string
  status: string
  color?: string
  progress?: number
  memberCount?: number
  issueCount?: number
}

/**
 * 项目看板页面
 * 以看板形式展示项目状态
 */
const ProjectKanban = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await projectApi.getProjects()
      setProjects(res.list || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // 按状态分组项目
  const groupedProjects = {
    planning: projects.filter(p => p.status === 'planning'),
    active: projects.filter(p => p.status === 'active'),
    completed: projects.filter(p => p.status === 'completed'),
    archived: projects.filter(p => p.status === 'archived'),
  }

  const statusConfig = {
    planning: { title: '规划中', color: '#faad14' },
    active: { title: '进行中', color: '#1677ff' },
    completed: { title: '已完成', color: '#52c41a' },
    archived: { title: '已归档', color: '#8c8c8c' },
  }

  const renderProjectCard = (project: Project) => (
    <Card key={project.id} className={styles.projectCard} hoverable>
      <div className={styles.cardHeader}>
        <Avatar
          shape="square"
          size={40}
          style={{ backgroundColor: project.color || '#1677ff' }}
        >
          {project.name.charAt(0)}
        </Avatar>
        <div className={styles.cardTitle}>
          <Text strong>{project.name}</Text>
          <Text type="secondary" className={styles.projectKey}>{project.key}</Text>
        </div>
      </div>
      <div className={styles.cardBody}>
        <Text type="secondary" className={styles.description}>
          {project.description || '暂无描述'}
        </Text>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.stats}>
          <span><TeamOutlined /> {project.memberCount || 0}</span>
          <span><ProjectOutlined /> {project.issueCount || 0}</span>
        </div>
        <Progress 
          percent={project.progress || 0} 
          size="small" 
          showInfo={false}
          strokeColor={project.color || '#1677ff'}
        />
      </div>
    </Card>
  )

  const renderColumn = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status]
    const columnProjects = groupedProjects[status]
    
    return (
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <div className={styles.columnTitle}>
            <span className={styles.statusDot} style={{ backgroundColor: config.color }} />
            <Text strong>{config.title}</Text>
            <Tag>{columnProjects.length}</Tag>
          </div>
        </div>
        <div className={styles.columnContent}>
          {columnProjects.length === 0 ? (
            <Empty description="暂无项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            columnProjects.map(renderProjectCard)
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Title level={4} style={{ margin: 0 }}>项目看板</Title>
          <Text type="secondary">以看板形式查看所有项目状态</Text>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Input
              placeholder="搜索项目"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Space>
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        {renderColumn('planning')}
        {renderColumn('active')}
        {renderColumn('completed')}
        {renderColumn('archived')}
      </div>
    </div>
  )
}

export default ProjectKanban