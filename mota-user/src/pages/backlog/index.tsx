import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Select,
  Input,
  Tag,
  Avatar,
  Checkbox,
  Modal,
  message,
  Empty,
  Spin,
  Dropdown,
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  DragOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { issueApi, projectApi, sprintApi } from '@/services/mock/api'
import styles from './index.module.css'

interface Issue {
  id: number
  key: string
  title: string
  type: string
  status: string
  priority: string
  assignee: number | null
  assigneeName?: string | null
  storyPoints: number
  projectId: number
  sprintId: number | null
}

/**
 * 需求池页面
 */
const Backlog = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<Issue[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<number | undefined>()
  const [selectedIssues, setSelectedIssues] = useState<number[]>([])
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>()
  const [planModalVisible, setPlanModalVisible] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<number | undefined>()

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadData()
    }
  }, [selectedProject])

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

  const loadData = async () => {
    if (!selectedProject) {
      setIssues([])
      setSprints([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      // 加载未规划的事项（没有分配到迭代的）
      const issuesRes = await issueApi.getIssues({ projectId: selectedProject })
      const allIssues = issuesRes.data.list || []
      // 过滤出未分配到迭代的事项
      const backlogIssues = allIssues.filter((i: any) => !i.sprintId)
      setIssues(backlogIssues as Issue[])
      
      // 加载迭代列表
      const sprintsRes = await sprintApi.getSprints({ projectId: selectedProject })
      const sprintList = Array.isArray(sprintsRes.data) ? sprintsRes.data : (sprintsRes.data as any).list || []
      setSprints(sprintList)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectIssue = (issueId: number, checked: boolean) => {
    if (checked) {
      setSelectedIssues([...selectedIssues, issueId])
    } else {
      setSelectedIssues(selectedIssues.filter(id => id !== issueId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(filteredIssues.map(i => i.id))
    } else {
      setSelectedIssues([])
    }
  }

  const handlePlanToSprint = async () => {
    if (!selectedSprint || selectedIssues.length === 0) {
      message.warning('请选择迭代和事项')
      return
    }
    
    try {
      // 模拟批量更新
      for (const issueId of selectedIssues) {
        await issueApi.updateIssue(issueId, { sprintId: selectedSprint })
      }
      message.success(`已将 ${selectedIssues.length} 个需求规划到迭代`)
      setPlanModalVisible(false)
      setSelectedIssues([])
      setSelectedSprint(undefined)
      loadData()
    } catch (error) {
      message.error('规划失败')
    }
  }

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      story: { color: 'green', text: '需求' },
      task: { color: 'blue', text: '任务' },
      bug: { color: 'red', text: '缺陷' },
      epic: { color: 'purple', text: '史诗' }
    }
    const t = typeMap[type] || { color: 'default', text: type }
    return <Tag color={t.color}>{t.text}</Tag>
  }

  const getPriorityTag = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      highest: { color: '#ff4d4f', text: '最高' },
      high: { color: '#fa8c16', text: '高' },
      medium: { color: '#1677ff', text: '中' },
      low: { color: '#52c41a', text: '低' },
      lowest: { color: '#8c8c8c', text: '最低' }
    }
    const p = priorityMap[priority] || { color: '#8c8c8c', text: priority }
    return <Tag color={p.color}>{p.text}</Tag>
  }

  const filteredIssues = issues.filter(issue => {
    let match = true
    if (searchText) {
      match = match && (
        issue.title.toLowerCase().includes(searchText.toLowerCase()) ||
        issue.key.toLowerCase().includes(searchText.toLowerCase())
      )
    }
    if (typeFilter) {
      match = match && issue.type === typeFilter
    }
    if (priorityFilter) {
      match = match && issue.priority === priorityFilter
    }
    return match
  })

  const totalStoryPoints = filteredIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)

  return (
    <div className={styles.backlog}>
      <div className={styles.header}>
        <h2>需求池</h2>
        <div className={styles.headerActions}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/issues')}
          >
            新建需求
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
          <Input
            placeholder="搜索需求"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="类型"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 100 }}
            allowClear
            options={[
              { value: 'story', label: '需求' },
              { value: 'task', label: '任务' },
              { value: 'bug', label: '缺陷' }
            ]}
          />
          <Select
            placeholder="优先级"
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: 100 }}
            allowClear
            options={[
              { value: 'highest', label: '最高' },
              { value: 'high', label: '高' },
              { value: 'medium', label: '中' },
              { value: 'low', label: '低' },
              { value: 'lowest', label: '最低' }
            ]}
          />
        </div>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            共 <strong>{filteredIssues.length}</strong> 个需求
          </span>
          <span className={styles.statItem}>
            总计 <strong>{totalStoryPoints}</strong> 故事点
          </span>
        </div>
      </div>

      {selectedIssues.length > 0 && (
        <div className={styles.batchActions}>
          <span>已选择 {selectedIssues.length} 项</span>
          <Button
            type="primary"
            size="small"
            onClick={() => setPlanModalVisible(true)}
          >
            规划到迭代
          </Button>
          <Button size="small" onClick={() => setSelectedIssues([])}>
            取消选择
          </Button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <Empty
          description="需求池为空"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/issues')}>
            新建需求
          </Button>
        </Empty>
      ) : (
        <div className={styles.issueList}>
          <div className={styles.listHeader}>
            <Checkbox
              checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
              indeterminate={selectedIssues.length > 0 && selectedIssues.length < filteredIssues.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className={styles.colTitle}>标题</span>
            <span className={styles.colType}>类型</span>
            <span className={styles.colPriority}>优先级</span>
            <span className={styles.colPoints}>故事点</span>
            <span className={styles.colAssignee}>负责人</span>
            <span className={styles.colActions}>操作</span>
          </div>
          
          {filteredIssues.map(issue => (
            <div
              key={issue.id}
              className={`${styles.issueItem} ${selectedIssues.includes(issue.id) ? styles.selected : ''}`}
            >
              <Checkbox
                checked={selectedIssues.includes(issue.id)}
                onChange={(e) => handleSelectIssue(issue.id, e.target.checked)}
              />
              <div className={styles.issueTitle}>
                <DragOutlined className={styles.dragHandle} />
                <span className={styles.issueKey}>{issue.key}</span>
                <a onClick={() => navigate(`/issues/${issue.id}`)}>{issue.title}</a>
              </div>
              <div className={styles.issueType}>
                {getTypeTag(issue.type)}
              </div>
              <div className={styles.issuePriority}>
                {getPriorityTag(issue.priority)}
              </div>
              <div className={styles.issuePoints}>
                <Tag>{issue.storyPoints || '-'}</Tag>
              </div>
              <div className={styles.issueAssignee}>
                {issue.assigneeName ? (
                  <Tooltip title={issue.assigneeName}>
                    <Avatar size="small">{issue.assigneeName.charAt(0)}</Avatar>
                  </Tooltip>
                ) : (
                  <Avatar size="small" icon={<UserOutlined />} />
                )}
              </div>
              <div className={styles.issueActions}>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'plan',
                        icon: <CalendarOutlined />,
                        label: '规划到迭代',
                        onClick: () => {
                          setSelectedIssues([issue.id])
                          setPlanModalVisible(true)
                        }
                      },
                      {
                        key: 'view',
                        label: '查看详情',
                        onClick: () => navigate(`/issues/${issue.id}`)
                      }
                    ]
                  }}
                  trigger={['click']}
                >
                  <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 迭代面板 */}
      <div className={styles.sprintPanel}>
        <h3>迭代列表</h3>
        {sprints.length === 0 ? (
          <Empty description="暂无迭代" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className={styles.sprintList}>
            {sprints.map(sprint => (
              <Card
                key={sprint.id}
                size="small"
                className={styles.sprintCard}
                onClick={() => navigate(`/iterations/${sprint.id}`)}
              >
                <div className={styles.sprintHeader}>
                  <span className={styles.sprintName}>{sprint.name}</span>
                  <Tag color={sprint.status === 'active' ? 'processing' : 'default'}>
                    {sprint.status === 'active' ? '进行中' : sprint.status === 'completed' ? '已完成' : '规划中'}
                  </Tag>
                </div>
                <div className={styles.sprintMeta}>
                  <span>{sprint.startDate} ~ {sprint.endDate}</span>
                </div>
                <div className={styles.sprintProgress}>
                  <span>{sprint.completedPoints} / {sprint.totalPoints} 故事点</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="规划到迭代"
        open={planModalVisible}
        onCancel={() => {
          setPlanModalVisible(false)
          setSelectedSprint(undefined)
        }}
        onOk={handlePlanToSprint}
        okText="确认规划"
        cancelText="取消"
      >
        <div className={styles.planModal}>
          <p>将 {selectedIssues.length} 个需求规划到：</p>
          <Select
            placeholder="选择迭代"
            value={selectedSprint}
            onChange={setSelectedSprint}
            style={{ width: '100%' }}
            options={sprints
              .filter(s => s.status !== 'completed')
              .map(s => ({ value: s.id, label: s.name }))
            }
          />
        </div>
      </Modal>
    </div>
  )
}

export default Backlog