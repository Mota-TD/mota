/**
 * TaskTree 组件
 * 以树形结构展示任务层级关系
 */

import React, { useCallback, useMemo } from 'react'
import { Tree, Input, Button, Select, Space, Spin, Empty, Tag, Progress, Avatar, Tooltip, Dropdown } from 'antd'
import type { TreeProps } from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  SearchOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTaskTree } from './useTaskTree'
import type { TaskTreeProps, TreeNodeData, GroupBy } from './types'
import styles from './index.module.css'

const { Search } = Input

/**
 * 获取状态图标
 */
const getStatusIcon = (status: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    pending: <ClockCircleOutlined style={{ color: '#d9d9d9' }} />,
    planning: <ClockCircleOutlined style={{ color: '#722ed1' }} />,
    in_progress: <SyncOutlined spin style={{ color: '#1890ff' }} />,
    paused: <PauseCircleOutlined style={{ color: '#faad14' }} />,
    completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    cancelled: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  }
  return iconMap[status] || <ClockCircleOutlined />
}

/**
 * 获取状态标签
 */
const getStatusTag = (status: string) => {
  const config: Record<string, { color: string; text: string }> = {
    pending: { color: 'default', text: '待开始' },
    planning: { color: 'purple', text: '计划中' },
    in_progress: { color: 'processing', text: '进行中' },
    paused: { color: 'warning', text: '已暂停' },
    completed: { color: 'success', text: '已完成' },
    cancelled: { color: 'error', text: '已取消' },
  }
  const { color, text } = config[status] || { color: 'default', text: status }
  return <Tag color={color}>{text}</Tag>
}

/**
 * 获取优先级标签
 */
const getPriorityTag = (priority: string) => {
  const config: Record<string, { color: string; text: string }> = {
    low: { color: 'green', text: '低' },
    medium: { color: 'blue', text: '中' },
    high: { color: 'orange', text: '高' },
    urgent: { color: 'red', text: '紧急' },
  }
  const { color, text } = config[priority] || { color: 'default', text: priority }
  return <Tag color={color}>{text}</Tag>
}

/**
 * 分组选项
 */
const groupByOptions = [
  { value: 'department-task', label: '按部门任务' },
  { value: 'status', label: '按状态' },
  { value: 'priority', label: '按优先级' },
  { value: 'assignee', label: '按执行人' },
  { value: 'none', label: '不分组' },
]

const TaskTree: React.FC<TaskTreeProps> = ({
  projectId,
  departmentTasks = [],
  tasks = [],
  checkable = false,
  checkedKeys = [],
  onCheck,
  selectedKey,
  onSelect,
  expandedKeys: propExpandedKeys,
  onExpand,
  showSearch = true,
  searchValue: propSearchValue,
  onSearch,
  showToolbar = true,
  draggable = false,
  onDrop,
  showProgress = true,
  showStatus = true,
  showAssignee = true,
  showDate = true,
  loading = false,
  emptyText = '暂无任务',
  className,
  style,
}) => {
  const {
    treeData,
    expandedKeys,
    setExpandedKeys,
    expandAll,
    collapseAll,
    filterBySearch,
    groupBy,
    setGroupBy,
    sort,
    setSort,
  } = useTaskTree({
    departmentTasks,
    tasks,
    searchValue: propSearchValue,
  })

  // 处理展开
  const handleExpand = useCallback((keys: React.Key[]) => {
    const stringKeys = keys.map(k => String(k))
    setExpandedKeys(stringKeys)
    onExpand?.(stringKeys)
  }, [setExpandedKeys, onExpand])

  // 处理选择
  const handleSelect = useCallback((keys: React.Key[], info: { node: DataNode }) => {
    if (keys.length > 0) {
      const key = String(keys[0])
      const node = findNodeByKey(treeData, key)
      if (node) {
        onSelect?.(key, node)
      }
    }
  }, [treeData, onSelect])

  // 处理勾选
  const handleCheck = useCallback((
    checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] },
    info: { node: DataNode; checked: boolean }
  ) => {
    const checkedArray = Array.isArray(checked) ? checked : checked.checked
    const stringKeys = checkedArray.map(k => String(k))
    const node = findNodeByKey(treeData, String(info.node.key))
    if (node) {
      onCheck?.(stringKeys, { node, checked: info.checked })
    }
  }, [treeData, onCheck])

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    filterBySearch(value)
    onSearch?.(value)
  }, [filterBySearch, onSearch])

  // 查找节点
  const findNodeByKey = (nodes: TreeNodeData[], key: string): TreeNodeData | null => {
    for (const node of nodes) {
      if (node.key === key) return node
      if (node.children) {
        const found = findNodeByKey(node.children, key)
        if (found) return found
      }
    }
    return null
  }

  // 渲染节点标题
  const renderNodeTitle = useCallback((node: TreeNodeData) => {
    const isTask = node.type === 'task'
    const isDeptTask = node.type === 'department-task'
    
    // 节点操作菜单
    const menuItems = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
      },
    ]

    return (
      <div className={styles.nodeContent}>
        {/* 节点图标 */}
        <span className={styles.nodeIcon}>
          {isDeptTask ? (
            <ApartmentOutlined style={{ color: '#722ed1' }} />
          ) : (
            getStatusIcon(node.status || 'pending')
          )}
        </span>

        {/* 节点标题 */}
        <span className={`${styles.nodeTitle} ${isDeptTask ? styles.nodeTitleDeptTask : ''}`}>
          {node.title}
        </span>

        {/* 节点元数据 */}
        <div className={styles.nodeMeta}>
          {/* 进度 */}
          {showProgress && node.progress !== undefined && (
            <div className={styles.nodeProgress}>
              <Progress percent={node.progress} size="small" showInfo={false} />
            </div>
          )}

          {/* 状态 */}
          {showStatus && node.status && (
            <div className={styles.nodeStatus}>
              {getStatusTag(node.status)}
            </div>
          )}

          {/* 优先级 */}
          {node.priority && (
            <div className={styles.nodePriority}>
              {getPriorityTag(node.priority)}
            </div>
          )}

          {/* 执行人 */}
          {showAssignee && node.assigneeName && (
            <Tooltip title={node.assigneeName}>
              <div className={styles.nodeAssignee}>
                <Avatar size="small" icon={<UserOutlined />}>
                  {node.assigneeName?.charAt(0)}
                </Avatar>
              </div>
            </Tooltip>
          )}

          {/* 日期 */}
          {showDate && node.endDate && (
            <span className={`${styles.nodeDate} ${
              node.status !== 'completed' && dayjs(node.endDate).isBefore(dayjs()) 
                ? styles.nodeDateOverdue 
                : ''
            }`}>
              {dayjs(node.endDate).format('MM-DD')}
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className={styles.nodeActions}>
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>
    )
  }, [showProgress, showStatus, showAssignee, showDate])

  // 转换为 Ant Design Tree 数据格式
  const antTreeData: DataNode[] = useMemo(() => {
    const convert = (nodes: TreeNodeData[]): DataNode[] => {
      return nodes.map(node => ({
        key: node.key,
        title: renderNodeTitle(node),
        children: node.children ? convert(node.children) : undefined,
        isLeaf: node.isLeaf,
        disabled: node.disabled,
        selectable: node.selectable !== false,
        checkable: node.checkable !== false,
      }))
    }
    return convert(treeData)
  }, [treeData, renderNodeTitle])

  // 使用的展开 keys
  const effectiveExpandedKeys = propExpandedKeys || expandedKeys

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${className || ''}`} style={style}>
      {/* 工具栏 */}
      {showToolbar && (
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {showSearch && (
              <Search
                placeholder="搜索任务..."
                allowClear
                onSearch={handleSearch}
                className={styles.searchInput}
                prefix={<SearchOutlined />}
              />
            )}
            <Select
              value={groupBy}
              onChange={setGroupBy}
              options={groupByOptions}
              style={{ width: 140 }}
              placeholder="分组方式"
            />
          </div>
          <div className={styles.toolbarRight}>
            <Space>
              <Tooltip title="展开全部">
                <Button
                  type="text"
                  icon={<ExpandAltOutlined />}
                  onClick={expandAll}
                />
              </Tooltip>
              <Tooltip title="折叠全部">
                <Button
                  type="text"
                  icon={<ShrinkOutlined />}
                  onClick={collapseAll}
                />
              </Tooltip>
              <Tooltip title="刷新">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
      )}

      {/* 树内容 */}
      <div className={styles.treeContainer}>
        {antTreeData.length === 0 ? (
          <Empty description={emptyText} />
        ) : (
          <Tree
            treeData={antTreeData}
            expandedKeys={effectiveExpandedKeys}
            onExpand={handleExpand}
            selectedKeys={selectedKey ? [selectedKey] : []}
            onSelect={handleSelect}
            checkable={checkable}
            checkedKeys={checkedKeys}
            onCheck={handleCheck}
            draggable={draggable}
            blockNode
            showLine={{ showLeafIcon: false }}
          />
        )}
      </div>
    </div>
  )
}

export default TaskTree
export type { TaskTreeProps } from './types'