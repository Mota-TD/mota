import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  message, 
  DatePicker,
  InputNumber,
  Row,
  Col,
  Divider,
  Tag
} from 'antd'
import { 
  ArrowLeftOutlined,
  BugOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  RocketOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { TextArea } = Input

// 事项类型
const issueTypes = [
  { value: 'story', label: '用户故事', icon: <FileTextOutlined />, color: '#52c41a' },
  { value: 'task', label: '任务', icon: <CheckSquareOutlined />, color: '#2b7de9' },
  { value: 'bug', label: '缺陷', icon: <BugOutlined />, color: '#f5222d' },
  { value: 'feature', label: '新功能', icon: <RocketOutlined />, color: '#722ed1' },
]

// 优先级
const priorities = [
  { value: 'highest', label: '最高', color: '#f5222d' },
  { value: 'high', label: '高', color: '#fa8c16' },
  { value: 'medium', label: '中', color: '#faad14' },
  { value: 'low', label: '低', color: '#52c41a' },
  { value: 'lowest', label: '最低', color: '#8c8c8c' },
]

// 模拟项目数据
const mockProjects = [
  { id: '1', name: '摩塔项目管理系统', key: 'MOTA' },
  { id: '2', name: '电商平台重构', key: 'SHOP' },
  { id: '3', name: '移动端App开发', key: 'APP' },
]

// 模拟迭代数据
const mockSprints = [
  { id: '1', name: 'Sprint 1 - 基础功能', projectId: '1' },
  { id: '2', name: 'Sprint 2 - 核心功能', projectId: '1' },
  { id: '3', name: 'Sprint 3 - 优化完善', projectId: '1' },
]

// 模拟成员数据
const mockMembers = [
  { id: '1', name: '张三', avatar: '' },
  { id: '2', name: '李四', avatar: '' },
  { id: '3', name: '王五', avatar: '' },
]

/**
 * 创建事项页面
 */
const CreateIssue = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('task')
  const [selectedProject, setSelectedProject] = useState(projectId || '')

  // 获取当前项目的迭代
  const filteredSprints = mockSprints.filter(s => s.projectId === selectedProject)

  // 提交表单
  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true)
    try {
      // 模拟创建事项
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Create issue:', values)
      
      message.success('事项创建成功')
      navigate('/issues')
    } catch {
      message.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    const t = issueTypes.find(i => i.value === type)
    return t ? t.icon : null
  }

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    const t = issueTypes.find(i => i.value === type)
    return t ? t.color : '#2b7de9'
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/issues')}
          className={styles.backBtn}
        >
          返回事项列表
        </Button>
        <h1 className={styles.title}>创建新事项</h1>
        <p className={styles.subtitle}>填写事项信息，分配任务给团队成员</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card className={styles.formCard}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                type: 'task',
                priority: 'medium',
                projectId: projectId || undefined,
                storyPoints: 1
              }}
            >
              {/* 事项类型 */}
              <Form.Item label="事项类型" required>
                <div className={styles.typeSelector}>
                  {issueTypes.map(type => (
                    <div
                      key={type.value}
                      className={`${styles.typeItem} ${selectedType === type.value ? styles.typeItemActive : ''}`}
                      style={{ 
                        borderColor: selectedType === type.value ? type.color : undefined,
                        backgroundColor: selectedType === type.value ? `${type.color}10` : undefined
                      }}
                      onClick={() => {
                        setSelectedType(type.value)
                        form.setFieldValue('type', type.value)
                      }}
                    >
                      <span style={{ color: type.color, fontSize: 20 }}>{type.icon}</span>
                      <span className={styles.typeLabel}>{type.label}</span>
                    </div>
                  ))}
                </div>
                <Form.Item name="type" hidden>
                  <Input />
                </Form.Item>
              </Form.Item>

              <Divider />

              {/* 基本信息 */}
              <Form.Item 
                label="事项标题" 
                name="title"
                rules={[{ required: true, message: '请输入事项标题' }]}
              >
                <Input 
                  size="large" 
                  placeholder="请输入事项标题"
                  prefix={<span style={{ color: getTypeColor(selectedType) }}>{getTypeIcon(selectedType)}</span>}
                />
              </Form.Item>

              <Form.Item 
                label="事项描述" 
                name="description"
              >
                <TextArea 
                  rows={6} 
                  placeholder="请详细描述事项内容、验收标准等信息"
                  maxLength={2000}
                  showCount
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label="所属项目" 
                    name="projectId"
                    rules={[{ required: true, message: '请选择所属项目' }]}
                  >
                    <Select 
                      size="large" 
                      placeholder="请选择项目"
                      onChange={(value) => setSelectedProject(value)}
                    >
                      {mockProjects.map(p => (
                        <Select.Option key={p.id} value={p.id}>
                          <Tag color="blue">{p.key}</Tag> {p.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="所属迭代" 
                    name="sprintId"
                  >
                    <Select 
                      size="large" 
                      placeholder="请选择迭代（可选）"
                      allowClear
                      disabled={!selectedProject}
                    >
                      {filteredSprints.map(s => (
                        <Select.Option key={s.id} value={s.id}>
                          {s.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item 
                    label="优先级" 
                    name="priority"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      {priorities.map(p => (
                        <Select.Option key={p.value} value={p.value}>
                          <Tag color={p.color}>{p.label}</Tag>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item 
                    label="负责人" 
                    name="assigneeId"
                  >
                    <Select size="large" placeholder="请选择负责人" allowClear>
                      {mockMembers.map(m => (
                        <Select.Option key={m.id} value={m.id}>
                          {m.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item 
                    label="故事点" 
                    name="storyPoints"
                  >
                    <InputNumber 
                      size="large" 
                      min={0} 
                      max={100} 
                      style={{ width: '100%' }}
                      placeholder="估算工作量"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="开始日期" name="startDate">
                    <DatePicker 
                      size="large" 
                      style={{ width: '100%' }}
                      placeholder="选择开始日期"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="截止日期" name="dueDate">
                    <DatePicker 
                      size="large" 
                      style={{ width: '100%' }}
                      placeholder="选择截止日期"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* 提交按钮 */}
              <Form.Item>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    loading={loading}
                  >
                    创建事项
                  </Button>
                  <Button 
                    size="large"
                    onClick={() => {
                      handleSubmit(form.getFieldsValue()).then(() => {
                        form.resetFields()
                        form.setFieldValue('type', selectedType)
                      })
                    }}
                    loading={loading}
                  >
                    创建并继续
                  </Button>
                  <Button size="large" onClick={() => navigate('/issues')}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* 快捷提示 */}
          <Card className={styles.tipsCard} title="创建提示">
            <ul className={styles.tipsList}>
              <li><strong>用户故事</strong>：描述用户需求和价值</li>
              <li><strong>任务</strong>：具体的开发或工作任务</li>
              <li><strong>缺陷</strong>：需要修复的Bug</li>
              <li><strong>新功能</strong>：新增的产品功能</li>
            </ul>
            <Divider />
            <ul className={styles.tipsList}>
              <li>故事点用于估算工作量</li>
              <li>可以先创建再分配到迭代</li>
              <li>设置截止日期便于跟踪进度</li>
            </ul>
          </Card>

          {/* 快捷操作 */}
          <Card className={styles.quickCard} title="快捷操作" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={() => navigate('/projects/create')}>
                创建新项目
              </Button>
              <Button block onClick={() => navigate('/iterations/create')}>
                创建新迭代
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CreateIssue