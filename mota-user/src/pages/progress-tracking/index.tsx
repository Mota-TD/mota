/**
 * 进度跟踪页面
 * 集成燃尽图、燃起图、速度趋势和AI进度预测
 */

import { useState, useEffect } from 'react'
import {
  Card,
  Tabs,
  Select,
  Space,
  Breadcrumb,
  message,
  Empty,
  Spin
} from 'antd'
import {
  LineChartOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  HomeOutlined,
  ProjectOutlined
} from '@ant-design/icons'
import { useSearchParams, Link } from 'react-router-dom'
import BurndownChart from '@/components/BurndownChart'
import BurnupChart from '@/components/BurnupChart'
import VelocityTrend from '@/components/VelocityTrend'
import AIProgressPrediction from '@/components/AIProgressPrediction'
import { projectApi } from '@/services/api'
import styles from './index.module.css'

interface Project {
  id: number
  name: string
  status: string
}

const ProgressTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('burndown')

  // 从URL参数获取项目ID
  useEffect(() => {
    const projectIdParam = searchParams.get('projectId')
    if (projectIdParam) {
      setSelectedProjectId(Number(projectIdParam))
    }
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const result = await projectApi.getProjects()
      const projectList = result?.list || []
      setProjects(projectList as unknown as Project[])
      
      // 如果没有选中项目且有项目列表，选择第一个
      if (!selectedProjectId && projectList.length > 0) {
        const firstProjectId = Number(projectList[0].id)
        setSelectedProjectId(firstProjectId)
        setSearchParams({ projectId: String(firstProjectId) })
      }
    } catch (error) {
      console.error('Load projects error:', error)
      message.error('加载项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectChange = (projectId: number) => {
    setSelectedProjectId(projectId)
    setSearchParams({ projectId: String(projectId) })
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const tabItems = [
    {
      key: 'burndown',
      label: (
        <span>
          <LineChartOutlined />
          燃尽图
        </span>
      ),
      children: selectedProjectId ? (
        <BurndownChart projectId={selectedProjectId} />
      ) : (
        <Empty description="请选择项目" />
      )
    },
    {
      key: 'burnup',
      label: (
        <span>
          <RiseOutlined />
          燃起图
        </span>
      ),
      children: selectedProjectId ? (
        <BurnupChart projectId={selectedProjectId} />
      ) : (
        <Empty description="请选择项目" />
      )
    },
    {
      key: 'velocity',
      label: (
        <span>
          <ThunderboltOutlined />
          速度趋势
        </span>
      ),
      children: selectedProjectId ? (
        <VelocityTrend projectId={selectedProjectId} />
      ) : (
        <Empty description="请选择项目" />
      )
    },
    {
      key: 'ai-prediction',
      label: (
        <span>
          <RobotOutlined />
          AI进度预测
        </span>
      ),
      children: selectedProjectId ? (
        <AIProgressPrediction projectId={selectedProjectId} />
      ) : (
        <Empty description="请选择项目" />
      )
    }
  ]

  if (loading && projects.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 面包屑导航 */}
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item>
          <Link to="/dashboard">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/projects">
            <ProjectOutlined /> 项目管理
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>进度跟踪</Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题和项目选择 */}
      <div className={styles.header}>
        <h1 className={styles.title}>进度跟踪</h1>
        <Space>
          <span>选择项目:</span>
          <Select
            value={selectedProjectId}
            onChange={handleProjectChange}
            style={{ width: 250 }}
            placeholder="请选择项目"
            showSearch
            optionFilterProp="children"
            loading={loading}
          >
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
          {selectedProject && (
            <Link to={`/projects/${selectedProjectId}`}>
              查看项目详情
            </Link>
          )}
        </Space>
      </div>

      {/* 功能说明 */}
      <Card className={styles.infoCard}>
        <div className={styles.infoContent}>
          <h3>📊 进度跟踪功能说明</h3>
          <ul>
            <li><strong>燃尽图</strong>：展示Sprint级别的剩余工作量变化趋势，帮助团队了解是否按计划完成任务</li>
            <li><strong>燃起图</strong>：展示项目整体完成工作量的累积趋势，同时显示范围变化情况</li>
            <li><strong>速度趋势</strong>：分析团队在多个Sprint中的交付速度变化，预测未来产能</li>
            <li><strong>AI进度预测</strong>：基于历史数据和当前进度，AI智能预测项目完成时间和风险</li>
          </ul>
        </div>
      </Card>

      {/* 标签页内容 */}
      <Card className={styles.mainCard}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  )
}

export default ProgressTrackingPage