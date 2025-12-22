import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Empty,
  Spin,
  Dropdown,
  Statistic
} from 'antd'
import {
  PlusOutlined,
  CalendarOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { sprintApi, projectApi } from '@/services/mock/api'
import styles from './index.module.css'

interface Sprint {
  id: number
  name: string
  projectId: number
  status: string
  startDate: string
  endDate: string
  goal: string
  totalPoints: number
  completedPoints: number
}

/**
 * 迭代列表页面
 */
const Iterations = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<number | undefined>()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    loadSprints()
  }, [selectedProject, statusFilter])

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
    if (!selectedProject) {
      setSprints([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const params: any = { projectId: selectedProject }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const res = await sprintApi.getSprints(params)
      const sprintList = Array.isArray(res.data) ? res.data : (res.data as any).list || []
      setSprints(sprintList)
    } catch (error) {
      console.error('Failed to load sprints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSprint = async (values: any) => {
    try {
      await sprintApi.createSprint({
        ...values,
        projectId: selectedProject,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD')
      })
      message.success('迭代创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      loadSprints()
    } catch (error: any) {
      message.error(error.message || '创建失败')
    }
  }

  const handleDeleteSprint = (sprintId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除迭代后，相关数据将被清除，此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 模拟删除
          setSprints(sprints.filter(s => s.id !== sprintId))
          message.success('迭代已删除')
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      planning: { color: 'default', text: '规划中', icon: <ClockCircleOutlined /> },
      active: { color: 'processing', text: '进行中', icon: <PlayCircleOutlined /> },
      completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> }
    }
    const s = statusMap[status] || { color: 'default', text: status, icon: null }
    return <Tag color={s.color} icon={s.icon}>{s.text}</Tag>
  }

  const getSprintMenuItems = (sprint: Sprint) => [
    {
      key: 'view',
      icon: <CalendarOutlined />,
      label: '查看详情',
      onClick: () => navigate(`/iterations/${sprint.id}`)
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑迭代'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除迭代',
      danger: true,
      onClick: () => handleDeleteSprint(sprint.id)
    }
  ]

  const getDaysRemaining = (endDate: string) => {
    const end = dayjs(endDate)
    const now = dayjs()
    const days = end.diff(now, 'day')
    return days > 0 ? days : 0
  }

  const getProgressPercent = (sprint: Sprint) => {
    if (sprint.totalPoints === 0) return 0
    return Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
  }

  return (
    <div className={styles.iterations}>
      <div className={styles.header}>
        <h2>迭代管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建迭代
        </Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Select
            placeholder="选择项目"
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 200 }}
            options={projects.map(p => ({ value: p.id, label: p.name }))}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'planning', label: '规划中' },
              { value: 'active', label: '进行中' },
              { value: 'completed', label: '已完成' }
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : sprints.length === 0 ? (
        <Empty
          description="暂无迭代"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>
            创建第一个迭代
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {sprints.map(sprint => (
            <Col xs={24} sm={12} lg={8} key={sprint.id}>
              <Card
                className={styles.sprintCard}
                hoverable
                onClick={() => navigate(`/iterations/${sprint.id}`)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.sprintInfo}>
                    <h3 className={styles.sprintName}>{sprint.name}</h3>
                    {getStatusTag(sprint.status)}
                  </div>
                  <Dropdown
                    menu={{ items: getSprintMenuItems(sprint) }}
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

                <div className={styles.cardBody}>
                  <p className={styles.sprintGoal}>
                    {sprint.goal || '暂无迭代目标'}
                  </p>
                  
                  <div className={styles.dateRange}>
                    <CalendarOutlined />
                    <span>{sprint.startDate} ~ {sprint.endDate}</span>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span>完成进度</span>
                      <span>{sprint.completedPoints} / {sprint.totalPoints} 故事点</span>
                    </div>
                    <Progress
                      percent={getProgressPercent(sprint)}
                      strokeColor="#1677ff"
                      size="small"
                    />
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="剩余天数"
                        value={getDaysRemaining(sprint.endDate)}
                        suffix="天"
                        valueStyle={{ fontSize: 16 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="完成率"
                        value={getProgressPercent(sprint)}
                        suffix="%"
                        valueStyle={{ fontSize: 16, color: '#52c41a' }}
                      />
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="创建迭代"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSprint}
        >
          <Form.Item
            name="name"
            label="迭代名称"
            rules={[{ required: true, message: '请输入迭代名称' }]}
          >
            <Input placeholder="如：Sprint 1" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="迭代周期"
            rules={[{ required: true, message: '请选择迭代周期' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="goal"
            label="迭代目标"
          >
            <Input.TextArea rows={3} placeholder="请输入迭代目标" />
          </Form.Item>
          <Form.Item>
            <div className={styles.formActions}>
              <Button onClick={() => {
                setCreateModalVisible(false)
                form.resetFields()
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Iterations