/**
 * 项目筛选和视图切换组件
 */

import React from 'react'
import { Input, Select, Space, Segmented } from 'antd'
import {
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TableOutlined,
} from '@ant-design/icons'
import ViewSaver from '@/components/ViewSaver'
import type { ViewConfigData } from '@/services/api/viewConfig'
import styles from './index.module.css'

export type ViewMode = 'grid' | 'list' | 'gantt' | 'calendar' | 'kanban'

export interface ProjectFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (value: ViewMode) => void
  currentViewConfig?: ViewConfigData
  onApplyViewConfig?: (config: ViewConfigData) => void
  showViewSaver?: boolean
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  currentViewConfig,
  onApplyViewConfig,
  showViewSaver = true,
}) => {
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'planning', label: '规划中' },
    { value: 'active', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'suspended', label: '已暂停' },
    { value: 'archived', label: '已归档' },
  ]

  const viewModeOptions = [
    { value: 'grid', icon: <AppstoreOutlined />, label: '卡片' },
    { value: 'list', icon: <UnorderedListOutlined />, label: '列表' },
    { value: 'gantt', icon: <BarChartOutlined />, label: '甘特图' },
    { value: 'calendar', icon: <CalendarOutlined />, label: '日历' },
    { value: 'kanban', icon: <TableOutlined />, label: '看板' },
  ]

  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <Input
          placeholder="搜索项目"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 240 }}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={onStatusChange}
          style={{ width: 120 }}
          options={statusOptions}
        />
      </div>
      <div className={styles.viewToggle}>
        <Space>
          {showViewSaver && currentViewConfig && onApplyViewConfig && (
            <ViewSaver
              viewType="project"
              currentConfig={currentViewConfig}
              onApplyView={onApplyViewConfig}
            />
          )}
          <Segmented
            value={viewMode}
            onChange={(value) => onViewModeChange(value as ViewMode)}
            options={viewModeOptions}
          />
        </Space>
      </div>
    </div>
  )
}

export default ProjectFilters