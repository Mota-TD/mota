import { useState, useEffect } from 'react'
import { Card, Typography, Select, Space, Tag, Progress, Empty, Spin, Tooltip } from 'antd'
import {
  ProjectOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import * as projectApi from '@/services/api/project'
import styles from './index.module.css'

const { Title, Text } = Typography

interface Project {
  id: number
  name: string
  key: string
  status: string
  color?: string
  progress?: number
  startDate?: string
  endDate?: string
}

/**
 * 项目甘特图页面
 * 以时间线形式展示项目进度
 */
const ProjectGantt = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await projectApi.getProjects()
      // 添加模拟的日期数据
      const projectsWithDates = (res.list || []).map((p: Project, index: number) => ({
        ...p,
        startDate: `2024-0${(index % 3) + 1}-01`,
        endDate: `2024-0${(index % 3) + 4}-30`,
      }))
      setProjects(projectsWithDates)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: '#faad14',
      active: '#1677ff',
      completed: '#52c41a',
      archived: '#8c8c8c',
    }
    return colors[status] || '#1677ff'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      planning: '规划中',
      active: '进行中',
      completed: '已完成',
      archived: '已归档',
    }
    return texts[status] || status
  }

  // 生成月份列表
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  // 计算项目在甘特图中的位置和宽度
  const calculateBarStyle = (project: Project) => {
    const startMonth = project.startDate ? parseInt(project.startDate.split('-')[1]) : 1
    const endMonth = project.endDate ? parseInt(project.endDate.split('-')[1]) : 12
    const left = ((startMonth - 1) / 12) * 100
    const width = ((endMonth - startMonth + 1) / 12) * 100
    return { left: `${left}%`, width: `${width}%` }
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
          <Title level={4} style={{ margin: 0 }}>项目甘特图</Title>
          <Text type="secondary">以时间线形式查看项目进度</Text>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
              options={[
                { value: 'month', label: '按月查看' },
                { value: 'quarter', label: '按季度查看' },
                { value: 'year', label: '按年查看' },
              ]}
            />
          </Space>
        </div>
      </div>

      <Card className={styles.ganttCard}>
        {projects.length === 0 ? (
          <Empty description="暂无项目" />
        ) : (
          <div className={styles.ganttContainer}>
            {/* 时间轴头部 */}
            <div className={styles.ganttHeader}>
              <div className={styles.projectColumn}>
                <Text strong>项目名称</Text>
              </div>
              <div className={styles.timelineHeader}>
                {months.map((month) => (
                  <div key={month} className={styles.monthCell}>
                    {month}
                  </div>
                ))}
              </div>
            </div>

            {/* 项目行 */}
            <div className={styles.ganttBody}>
              {projects.map((project) => (
                <div key={project.id} className={styles.ganttRow}>
                  <div className={styles.projectColumn}>
                    <div className={styles.projectInfo}>
                      <ProjectOutlined style={{ color: project.color || '#1677ff' }} />
                      <div className={styles.projectMeta}>
                        <Text strong className={styles.projectName}>{project.name}</Text>
                        <Text type="secondary" className={styles.projectKey}>{project.key}</Text>
                      </div>
                    </div>
                  </div>
                  <div className={styles.timelineCell}>
                    <div className={styles.gridLines}>
                      {months.map((_, index) => (
                        <div key={index} className={styles.gridLine} />
                      ))}
                    </div>
                    <Tooltip
                      title={
                        <div>
                          <div>{project.name}</div>
                          <div>进度: {project.progress || 0}%</div>
                          <div>状态: {getStatusText(project.status)}</div>
                        </div>
                      }
                    >
                      <div
                        className={styles.ganttBar}
                        style={{
                          ...calculateBarStyle(project),
                          backgroundColor: project.color || getStatusColor(project.status),
                        }}
                      >
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${project.progress || 0}%` }}
                        />
                        <span className={styles.barLabel}>{project.progress || 0}%</span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 图例 */}
      <div className={styles.legend}>
        <Text type="secondary">图例：</Text>
        <Space>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: '#faad14' }} />
            规划中
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: '#1677ff' }} />
            进行中
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: '#52c41a' }} />
            已完成
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: '#8c8c8c' }} />
            已归档
          </span>
        </Space>
      </div>
    </div>
  )
}

export default ProjectGantt