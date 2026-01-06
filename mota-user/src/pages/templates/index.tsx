/**
 * 模板库页面
 * 集成模板库管理功能
 * 功能包括：
 * - TP-001: 系统模板 - 预置文档模板
 * - TP-002: 自定义模板 - 创建自定义模板
 * - TP-003: 模板分类 - 模板分类管理
 * - TP-004: 模板共享 - 团队共享模板
 * - TP-005: 模板使用 - 一键从模板创建文档
 * - TP-006: 任务模板 - 任务流程模板
 * - TP-007: 项目模板 - 项目结构模板
 * - TP-008: 模板统计 - 模板使用统计
 */

import { useState, useEffect, useRef } from 'react'
import { Typography, Breadcrumb, message, Card, Row, Col, Statistic, Button, Space, Tabs, Dropdown, Menu, Modal, Form, Input, Select, Tag, Tooltip } from 'antd'
import { 
  HomeOutlined, 
  AppstoreOutlined, 
  FileTextOutlined, 
  CheckSquareOutlined, 
  ProjectOutlined, 
  ApartmentOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  StarOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  SettingOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import TemplateLibrary from '@/components/TemplateLibrary'
import * as templateApi from '@/services/api/templateLibrary'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const TemplatesPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [stats, setStats] = useState<templateApi.TemplateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false)
  const [quickCreateType, setQuickCreateType] = useState<templateApi.TemplateType>('document')
  const [form] = Form.useForm()

  // 从URL参数获取默认类型
  const defaultType = searchParams.get('type') as templateApi.TemplateType | null

  // 防止重复请求的 ref
  const statsLoadedRef = useRef(false)
  const loadingRef = useRef(false)

  // 加载统计数据
  useEffect(() => {
    if (statsLoadedRef.current || loadingRef.current) {
      return
    }
    loadStats()
  }, [])

  const loadStats = async () => {
    loadingRef.current = true
    setLoading(true)
    try {
      const statsData = await templateApi.getTemplateStats()
      setStats(statsData)
      statsLoadedRef.current = true
    } catch (error) {
      console.error('Failed to load template stats:', error)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  // 处理从模板创建
  const handleCreateFromTemplate = (type: string, itemId: number) => {
    switch (type) {
      case 'document':
        message.success('文档创建成功，正在跳转...')
        navigate(`/documents/${itemId}`)
        break
      case 'task':
        message.success('任务创建成功，正在跳转...')
        navigate(`/tasks/${itemId}`)
        break
      case 'project':
        message.success('项目创建成功，正在跳转...')
        navigate(`/projects/${itemId}`)
        break
      default:
        break
    }
  }

  // 快速创建模板
  const handleQuickCreate = async () => {
    try {
      const values = await form.validateFields()
      const template = await templateApi.createTemplate({
        name: values.name,
        description: values.description,
        type: quickCreateType,
        category: values.category || '未分类',
        tags: values.tags || [],
        content: JSON.stringify({})
      })
      message.success('模板创建成功')
      setShowQuickCreateModal(false)
      form.resetFields()
      // 刷新页面
      window.location.reload()
    } catch (error: any) {
      message.error(error?.message || '创建模板失败')
    }
  }

  // 导入模板
  const handleImportTemplate = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string
            await templateApi.importTemplate(content, 'json')
            message.success('模板导入成功')
            window.location.reload()
          } catch (error: any) {
            message.error(error?.message || '导入模板失败')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // 快捷操作菜单
  const quickActionsMenu = (
    <Menu>
      <Menu.Item 
        key="doc" 
        icon={<FileTextOutlined />}
        onClick={() => {
          setQuickCreateType('document')
          setShowQuickCreateModal(true)
        }}
      >
        创建文档模板
      </Menu.Item>
      <Menu.Item 
        key="task" 
        icon={<CheckSquareOutlined />}
        onClick={() => {
          setQuickCreateType('task')
          setShowQuickCreateModal(true)
        }}
      >
        创建任务模板
      </Menu.Item>
      <Menu.Item 
        key="project" 
        icon={<ProjectOutlined />}
        onClick={() => {
          setQuickCreateType('project')
          setShowQuickCreateModal(true)
        }}
      >
        创建项目模板
      </Menu.Item>
      <Menu.Item 
        key="workflow" 
        icon={<ApartmentOutlined />}
        onClick={() => {
          setQuickCreateType('workflow')
          setShowQuickCreateModal(true)
        }}
      >
        创建工作流模板
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="import" icon={<UploadOutlined />} onClick={handleImportTemplate}>
        导入模板
      </Menu.Item>
    </Menu>
  )

  // 获取类型标签颜色
  const getTypeColor = (type: templateApi.TemplateType) => {
    const colors: Record<templateApi.TemplateType, string> = {
      document: '#1890ff',
      task: '#52c41a',
      project: '#722ed1',
      workflow: '#fa8c16'
    }
    return colors[type]
  }

  return (
    <div className={styles.container}>
      {/* 面包屑导航 */}
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> 首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <AppstoreOutlined /> 模板库
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* 页面标题和操作 */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className={styles.headerIcon}>
            <AppstoreOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>模板库</Title>
            <Text type="secondary" className={styles.description}>
              浏览和管理文档、任务、项目模板，快速创建标准化内容
            </Text>
          </div>
        </div>
        <Space>
          <Tooltip title="查看帮助">
            <Button icon={<QuestionCircleOutlined />} />
          </Tooltip>
          <Tooltip title="模板设置">
            <Button icon={<SettingOutlined />} onClick={() => navigate('/settings?tab=templates')} />
          </Tooltip>
          <Dropdown overlay={quickActionsMenu} trigger={['click']}>
            <Button type="primary" icon={<PlusOutlined />}>
              新建模板
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div style={{ padding: '0 24px', marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small" hoverable onClick={() => navigate('/templates?type=document')}>
                <Statistic
                  title={<span><FileTextOutlined style={{ color: '#1890ff', marginRight: 8 }} />文档模板</span>}
                  value={stats.documentTemplates}
                  suffix="个"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" hoverable onClick={() => navigate('/templates?type=task')}>
                <Statistic
                  title={<span><CheckSquareOutlined style={{ color: '#52c41a', marginRight: 8 }} />任务模板</span>}
                  value={stats.taskTemplates}
                  suffix="个"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" hoverable onClick={() => navigate('/templates?type=project')}>
                <Statistic
                  title={<span><ProjectOutlined style={{ color: '#722ed1', marginRight: 8 }} />项目模板</span>}
                  value={stats.projectTemplates}
                  suffix="个"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" hoverable onClick={() => navigate('/templates?type=workflow')}>
                <Statistic
                  title={<span><ApartmentOutlined style={{ color: '#fa8c16', marginRight: 8 }} />工作流模板</span>}
                  value={stats.workflowTemplates}
                  suffix="个"
                />
              </Card>
            </Col>
          </Row>
          
          {/* 快捷入口 */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Card size="small">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong><ThunderboltOutlined style={{ color: '#faad14', marginRight: 8 }} />总使用次数</Text>
                    <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>{stats.totalUseCount.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary">平均评分</Text>
                    <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8, color: '#faad14' }}>
                      <StarOutlined /> {stats.averageRating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Text strong><HistoryOutlined style={{ marginRight: 8 }} />最近使用</Text>
                <div style={{ marginTop: 8 }}>
                  {stats.recentlyUsed.slice(0, 3).map(t => (
                    <Tag 
                      key={t.id} 
                      color={getTypeColor(t.type)}
                      style={{ marginBottom: 4, cursor: 'pointer' }}
                      onClick={() => navigate(`/templates?id=${t.id}`)}
                    >
                      {t.name}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Text strong><StarOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />热门模板</Text>
                <div style={{ marginTop: 8 }}>
                  {stats.popularTemplates.slice(0, 3).map(t => (
                    <Tag 
                      key={t.id} 
                      color={getTypeColor(t.type)}
                      style={{ marginBottom: 4, cursor: 'pointer' }}
                      onClick={() => navigate(`/templates?id=${t.id}`)}
                    >
                      {t.name}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* 模板库组件 */}
      <div style={{ padding: '0 24px 24px' }}>
        <TemplateLibrary
          defaultType={defaultType || undefined}
          showStats={false}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      </div>

      {/* 快速创建模板弹窗 */}
      <Modal
        title={
          <Space>
            {quickCreateType === 'document' && <FileTextOutlined style={{ color: '#1890ff' }} />}
            {quickCreateType === 'task' && <CheckSquareOutlined style={{ color: '#52c41a' }} />}
            {quickCreateType === 'project' && <ProjectOutlined style={{ color: '#722ed1' }} />}
            {quickCreateType === 'workflow' && <ApartmentOutlined style={{ color: '#fa8c16' }} />}
            创建{templateApi.getTemplateTypeLabel(quickCreateType)}
          </Space>
        }
        open={showQuickCreateModal}
        onCancel={() => {
          setShowQuickCreateModal(false)
          form.resetFields()
        }}
        onOk={handleQuickCreate}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="模板描述"
          >
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
          >
            <Select placeholder="选择分类">
              <Select.Option value="产品文档">产品文档</Select.Option>
              <Select.Option value="技术文档">技术文档</Select.Option>
              <Select.Option value="办公文档">办公文档</Select.Option>
              <Select.Option value="开发任务">开发任务</Select.Option>
              <Select.Option value="测试任务">测试任务</Select.Option>
              <Select.Option value="敏捷项目">敏捷项目</Select.Option>
              <Select.Option value="产品项目">产品项目</Select.Option>
              <Select.Option value="审批流程">审批流程</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TemplatesPage