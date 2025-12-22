import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Avatar,
  Tag,
  Progress,
  Dropdown,
  Modal,
  Form,
  message,
  Empty,
  Spin
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import { projectApi } from '@/services/mock/api'
import styles from './index.module.css'

/**
 * 项目列表页面
 */
const Projects = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchText, statusFilter])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await projectApi.getProjects()
      setProjects(res.data.list || res.data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = [...projects]
    
    if (searchText) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.key.toLowerCase().includes(searchText.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    setFilteredProjects(filtered)
  }

  const handleCreateProject = async (values: any) => {
    try {
      await projectApi.createProject(values)
      message.success('项目创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      loadProjects()
    } catch (error: any) {
      message.error(error.message || '创建失败')
    }
  }

  const handleToggleStar = async (projectId: number, starred: boolean) => {
    try {
      // 模拟收藏/取消收藏
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, starred: !starred } : p
      ))
      message.success(starred ? '已取消收藏' : '已收藏')
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除项目后，所有相关数据将被清除，此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await projectApi.deleteProject(projectId)
          message.success('项目已删除')
          loadProjects()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: '进行中' },
      completed: { color: 'blue', text: '已完成' },
      archived: { color: 'default', text: '已归档' }
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const getProjectMenuItems = (project: any) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑项目',
      onClick: () => navigate(`/projects/${project.id}/settings`)
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '项目设置',
      onClick: () => navigate(`/settings`)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除项目',
      danger: true,
      onClick: () => handleDeleteProject(project.id)
    }
  ]

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredProjects.map(project => (
        <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
          <Card
            className={styles.projectCard}
            hoverable
            onClick={() => navigate(`/projects/${project.id}`)}
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
                  icon={project.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleStar(project.id, project.starred)
                  }}
                />
                <Dropdown
                  menu={{ items: getProjectMenuItems(project) }}
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
        </Col>
      ))}
    </Row>
  )

  const renderListView = () => (
    <div className={styles.listView}>
      {filteredProjects.map(project => (
        <Card
          key={project.id}
          className={styles.listItem}
          hoverable
          onClick={() => navigate(`/projects/${project.id}`)}
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
                icon={project.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleStar(project.id, project.starred)
                }}
              />
              <Dropdown
                menu={{ items: getProjectMenuItems(project) }}
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
      ))}
    </div>
  )

  return (
    <div className={styles.projects}>
      <div className={styles.header}>
        <h2>项目管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          新建项目
        </Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="搜索项目"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '进行中' },
              { value: 'completed', label: '已完成' },
              { value: 'archived', label: '已归档' }
            ]}
          />
        </div>
        <div className={styles.viewToggle}>
          <Button
            type={viewMode === 'grid' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('grid')}
          />
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('list')}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Empty
          description="暂无项目"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>
            创建第一个项目
          </Button>
        </Empty>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      <Modal
        title="创建项目"
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
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="key"
            label="项目标识"
            rules={[
              { required: true, message: '请输入项目标识' },
              { pattern: /^[A-Z][A-Z0-9]*$/, message: '项目标识必须以大写字母开头，只能包含大写字母和数字' }
            ]}
          >
            <Input placeholder="如：PROJ" />
          </Form.Item>
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
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

export default Projects