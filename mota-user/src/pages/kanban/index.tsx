import { useEffect, useState } from 'react'
import { Avatar, Tag, Button, Select, Input, Dropdown, message, Spin } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { issueApi, projectApi, sprintApi } from '@/services/mock/api'
import styles from './index.module.css'

interface KanbanColumn {
  id: string
  title: string
  status: string
  issues: any[]
  limit?: number
}

/**
 * 看板页面
 */
const Kanban = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<number | undefined>()
  const [selectedSprint, setSelectedSprint] = useState<number | undefined>()
  const [searchText, setSearchText] = useState('')
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'open', title: '待处理', status: 'open', issues: [], limit: 10 },
    { id: 'in_progress', title: '进行中', status: 'in_progress', issues: [], limit: 5 },
    { id: 'testing', title: '测试中', status: 'testing', issues: [], limit: 5 },
    { id: 'done', title: '已完成', status: 'done', issues: [] }
  ])
  const [draggedIssue, setDraggedIssue] = useState<any>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadSprints()
    }
  }, [selectedProject])

  useEffect(() => {
    loadIssues()
  }, [selectedProject, selectedSprint])

  const loadProjects = async () => {
    try {
      const res = await projectApi.getProjects()
      const projectList = res.data.list || res.data
      setProjects(projectList)
      if (projectList.length > 0) {
        setSelectedProject(projectList[0].id)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadSprints = async () => {
    try {
      const res = await sprintApi.getSprints({ projectId: selectedProject! })
      const sprintList = Array.isArray(res.data) ? res.data : (res.data as any).list || []
      setSprints(sprintList)
      const activeSprint = sprintList.find((s: any) => s.status === 'active')
      if (activeSprint) {
        setSelectedSprint(activeSprint.id)
      }
    } catch (error) {
      console.error('Failed to load sprints:', error)
    }
  }

  const loadIssues = async () => {
    if (!selectedProject) return
    
    setLoading(true)
    try {
      const res = await issueApi.getIssues({
        projectId: selectedProject,
        sprintId: selectedSprint
      })
      const issues = res.data.list || []
      
      // 按状态分组
      const newColumns = columns.map(col => ({
        ...col,
        issues: issues.filter((issue: any) => issue.status === col.status)
      }))
      setColumns(newColumns)
    } catch (error) {
      console.error('Failed to load issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, issue: any) => {
    setDraggedIssue(issue)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault()
    
    if (!draggedIssue) return
    
    // 检查 WIP 限制
    if (targetColumn.limit && targetColumn.issues.length >= targetColumn.limit) {
      message.warning(`${targetColumn.title} 列已达到在制品限制 (${targetColumn.limit})`)
      return
    }
    
    // 更新本地状态
    const newColumns = columns.map(col => {
      if (col.id === targetColumn.id) {
        return {
          ...col,
          issues: [...col.issues, { ...draggedIssue, status: col.status }]
        }
      }
      return {
        ...col,
        issues: col.issues.filter(issue => issue.id !== draggedIssue.id)
      }
    })
    setColumns(newColumns)
    
    // 调用 API 更新
    try {
      await issueApi.updateIssue(draggedIssue.id, { status: targetColumn.status })
      message.success('状态已更新')
    } catch (error) {
      message.error('更新失败')
      loadIssues() // 回滚
    }
    
    setDraggedIssue(null)
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      story: '#52c41a',
      task: '#1677ff',
      bug: '#ff4d4f',
      epic: '#722ed1'
    }
    return colors[type] || '#8c8c8c'
  }

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, { color: string; icon: string }> = {
      highest: { color: '#ff4d4f', icon: '⬆⬆' },
      high: { color: '#fa8c16', icon: '⬆' },
      medium: { color: '#1677ff', icon: '➡' },
      low: { color: '#52c41a', icon: '⬇' },
      lowest: { color: '#8c8c8c', icon: '⬇⬇' }
    }
    const p = icons[priority] || icons.medium
    return <span style={{ color: p.color }}>{p.icon}</span>
  }

  const renderIssueCard = (issue: any) => (
    <div
      key={issue.id}
      className={styles.issueCard}
      draggable
      onDragStart={(e) => handleDragStart(e, issue)}
    >
      <div className={styles.cardHeader}>
        <span
          className={styles.issueType}
          style={{ backgroundColor: getTypeColor(issue.type) }}
        />
        <span className={styles.issueKey}>{issue.key}</span>
        <span className={styles.issuePriority}>{getPriorityIcon(issue.priority)}</span>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.issueTitle}>{issue.title}</p>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          {issue.storyPoints && (
            <Tag className={styles.storyPoints}>{issue.storyPoints}</Tag>
          )}
          {issue.dueDate && (
            <span className={styles.dueDate}>
              <ClockCircleOutlined /> {issue.dueDate}
            </span>
          )}
        </div>
        {issue.assigneeName ? (
          <Avatar size="small" className={styles.assignee}>
            {issue.assigneeName.charAt(0)}
          </Avatar>
        ) : (
          <Avatar size="small" icon={<UserOutlined />} className={styles.assignee} />
        )}
      </div>
    </div>
  )

  return (
    <div className={styles.kanban}>
      <div className={styles.header}>
        <h2>项目看板</h2>
        <div className={styles.headerActions}>
          <Button type="primary" icon={<PlusOutlined />}>
            新建任务
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Select
            placeholder="选择项目"
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 180 }}
            options={projects.map(p => ({ value: p.id, label: p.name }))}
          />
          <Select
            placeholder="选择迭代"
            value={selectedSprint}
            onChange={setSelectedSprint}
            style={{ width: 180 }}
            allowClear
            options={sprints.map(s => ({ value: s.id, label: s.name }))}
          />
          <Input
            placeholder="搜索任务"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : (
        <div className={styles.board}>
          {columns.map(column => (
            <div
              key={column.id}
              className={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column)}
            >
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span>{column.title}</span>
                  <span className={styles.columnCount}>{column.issues.length}</span>
                  {column.limit && (
                    <span className={styles.columnLimit}>/ {column.limit}</span>
                  )}
                </div>
                <Dropdown
                  menu={{
                    items: [
                      { key: 'add', label: '添加任务' },
                      { key: 'settings', label: '列设置' }
                    ]
                  }}
                  trigger={['click']}
                >
                  <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
              <div className={styles.columnBody}>
                {column.issues.map(issue => renderIssueCard(issue))}
                {column.issues.length === 0 && (
                  <div className={styles.emptyColumn}>
                    拖拽任务到此处
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Kanban