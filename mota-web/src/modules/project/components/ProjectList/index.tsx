/**
 * 项目列表组件 - 重构版
 * 使用模块化组件替代原有的3108行单文件
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Spin, Empty, Row, Col, message, Pagination } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useProjectStore, useFilteredProjects } from '../../store/projectStore'
import ProjectCard from '../ProjectCard'
import ProjectFilters from '../ProjectFilters'
import ProjectSettings from '../ProjectSettings'
import type { ViewMode } from '../ProjectFilters'
import type { Project } from '@/services/api/project'
import styles from './index.module.css'

export interface ProjectListProps {
  showCreateButton?: boolean
  defaultViewMode?: ViewMode
  pageSize?: number
}

const ProjectList: React.FC<ProjectListProps> = ({
  showCreateButton = true,
  defaultViewMode = 'grid',
  pageSize = 12
}) => {
  const navigate = useNavigate()
  
  // 使用 Zustand store
  const {
    loading,
    error,
    filters,
    viewMode: storeViewMode,
    fetchProjects,
    setFilters,
    setViewMode: setStoreViewMode,
    toggleStar,
    archiveProject,
    deleteProject
  } = useProjectStore()

  // 使用过滤后的项目列表
  const filteredProjects = useFilteredProjects()

  // 本地状态
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)
  
  // 设置抽屉
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // 加载项目列表
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // 同步视图模式
  useEffect(() => {
    if (storeViewMode === 'grid' || storeViewMode === 'list') {
      setViewMode(storeViewMode as ViewMode)
    }
  }, [storeViewMode])

  // 分页后的项目列表
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProjects.slice(start, start + pageSize)
  }, [filteredProjects, currentPage, pageSize])

  // 处理搜索
  const handleSearchChange = useCallback((value: string) => {
    setFilters({ search: value })
    setCurrentPage(1)
  }, [setFilters])

  // 处理状态筛选
  const handleStatusChange = useCallback((value: string) => {
    setFilters({ status: value as 'all' | 'planning' | 'active' | 'completed' | 'suspended' | 'archived' })
    setCurrentPage(1)
  }, [setFilters])

  // 处理视图切换
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    if (mode === 'grid' || mode === 'list') {
      setStoreViewMode(mode)
    }
  }, [setStoreViewMode])

  // 处理收藏
  const handleToggleStar = useCallback(async (projectId: string) => {
    try {
      await toggleStar(projectId)
      message.success('操作成功')
    } catch {
      message.error('操作失败')
    }
  }, [toggleStar])

  // 处理归档
  const handleArchive = useCallback(async (projectId: string) => {
    try {
      await archiveProject(projectId)
      message.success('项目已归档')
    } catch {
      message.error('归档失败')
    }
  }, [archiveProject])

  // 处理删除
  const handleDelete = useCallback(async (projectId: string) => {
    try {
      await deleteProject(projectId)
      message.success('项目已删除')
    } catch {
      message.error('删除失败')
    }
  }, [deleteProject])

  // 打开设置
  const handleOpenSettings = useCallback((project: Project) => {
    setSelectedProject(project)
    setSettingsVisible(true)
  }, [])

  // 关闭设置
  const handleCloseSettings = useCallback(() => {
    setSettingsVisible(false)
    setSelectedProject(null)
  }, [])

  // 设置保存后刷新
  const handleSettingsSave = useCallback(() => {
    fetchProjects()
  }, [fetchProjects])

  // 渲染项目卡片
  const renderProjectCards = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="加载中..." />
        </div>
      )
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <Empty description={error} />
          <Button onClick={() => fetchProjects()}>
            重试
          </Button>
        </div>
      )
    }

    if (paginatedProjects.length === 0) {
      return (
        <Empty
          description={filters.search || filters.status !== 'all' ? '没有找到匹配的项目' : '暂无项目'}
          className={styles.emptyContainer}
        >
          {showCreateButton && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/projects/create')}
            >
              创建第一个项目
            </Button>
          )}
        </Empty>
      )
    }

    if (viewMode === 'grid') {
      return (
        <Row gutter={[16, 16]}>
          {paginatedProjects.map(project => (
            <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
              <ProjectCard
                project={project}
                viewMode="grid"
                onClick={() => navigate(`/projects/${project.id}`)}
                onToggleStar={() => handleToggleStar(project.id)}
                onSettings={() => handleOpenSettings(project)}
                onDelete={() => handleDelete(project.id)}
              />
            </Col>
          ))}
        </Row>
      )
    }

    // 列表视图
    return (
      <div className={styles.listView}>
        {paginatedProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            viewMode="list"
            onClick={() => navigate(`/projects/${project.id}`)}
            onToggleStar={() => handleToggleStar(project.id)}
            onSettings={() => handleOpenSettings(project)}
            onDelete={() => handleDelete(project.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>项目</h1>
          <span className={styles.count}>
            共 {filteredProjects.length} 个项目
          </span>
        </div>
        {showCreateButton && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/projects/create')}
          >
            创建项目
          </Button>
        )}
      </div>

      {/* 筛选工具栏 */}
      <ProjectFilters
        searchText={filters.search || ''}
        onSearchChange={handleSearchChange}
        statusFilter={filters.status || 'all'}
        onStatusChange={handleStatusChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showViewSaver={false}
      />

      {/* 项目列表 */}
      {renderProjectCards()}

      {/* 分页 */}
      {!loading && filteredProjects.length > pageSize && (
        <div className={styles.pagination}>
          <Pagination
            current={currentPage}
            total={filteredProjects.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showTotal={(total) => `共 ${total} 个项目`}
          />
        </div>
      )}

      {/* 项目设置抽屉 */}
      <ProjectSettings
        visible={settingsVisible}
        project={selectedProject}
        onClose={handleCloseSettings}
        onSave={handleSettingsSave}
        onArchive={handleSettingsSave}
        onDelete={() => {
          handleCloseSettings()
          fetchProjects()
        }}
      />
    </div>
  )
}

export default ProjectList