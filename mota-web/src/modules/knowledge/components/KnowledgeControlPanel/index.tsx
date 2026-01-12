/**
 * 知识管理统一控制面板
 * 集成知识库管理、智能推荐、协作编辑、统计分析等功能
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Input,
  Select,
  Table,
  List,
  Avatar,
  Tag,
  Progress,
  Tooltip,
  Space,
  Tabs,
  Modal,
  Form,
  Upload,
  message,
  Dropdown,
  Menu,
  Typography,
  Alert,
  Badge,
  Empty,
  DatePicker,
  Divider,
  Switch
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  BookOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  TagOutlined,
  FolderOutlined,
  UploadOutlined,
  FilterOutlined,
  MoreOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  RobotOutlined
} from '@ant-design/icons'
import { recommendationEngine } from '../../services/intelligentRecommendation'
import WikiCollaborationEditor from '../WikiCollaborationEditor'
import styles from './index.module.css'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

// 知识文档
interface KnowledgeDocument {
  id: string
  title: string
  content: string
  type: 'document' | 'wiki' | 'template' | 'guide'
  category: string
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  collaborators: Array<{
    id: string
    name: string
    role: 'owner' | 'editor' | 'viewer'
  }>
  stats: {
    views: number
    likes: number
    shares: number
    downloads: number
    comments: number
  }
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  size: number
  wordCount: number
}

// 知识统计
interface KnowledgeStats {
  totalDocuments: number
  totalViews: number
  totalAuthors: number
  activeCollaborators: number
  documentsThisWeek: number
  viewsThisWeek: number
  topCategories: Array<{
    name: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    type: 'create' | 'edit' | 'view' | 'share'
    document: string
    user: string
    timestamp: string
  }>
}

// 知识图谱节点
interface KnowledgeNode {
  id: string
  name: string
  type: 'concept' | 'person' | 'project' | 'technology' | 'process'
  description: string
  connections: number
  importance: number
  category: string
}

interface KnowledgeControlPanelProps {
  projectId?: string
  className?: string
}

const KnowledgeControlPanel: React.FC<KnowledgeControlPanelProps> = ({
  projectId,
  className
}) => {
  // 基础状态
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // 数据状态
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [stats, setStats] = useState<KnowledgeStats | null>(null)
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([])
  
  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [selectedType, setSelectedType] = useState<string>()
  const [filterStatus, setFilterStatus] = useState<string>()
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null)
  
  // 表单状态
  const [createForm] = Form.useForm()
  
  // 初始化数据
  useEffect(() => {
    loadInitialData()
  }, [projectId])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadDocuments(),
        loadStats(),
        loadKnowledgeNodes()
      ])
    } catch (error) {
      console.error('加载知识管理数据失败:', error)
      message.error('数据加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载文档列表
  const loadDocuments = async () => {
    try {
      // 模拟API调用
      const mockDocuments: KnowledgeDocument[] = [
        {
          id: '1',
          title: '项目管理最佳实践指南',
          content: '这是一份详细的项目管理指南...',
          type: 'guide',
          category: '项目管理',
          tags: ['项目管理', '最佳实践', '流程'],
          author: { id: '1', name: '张三', avatar: '' },
          collaborators: [
            { id: '1', name: '张三', role: 'owner' },
            { id: '2', name: '李四', role: 'editor' }
          ],
          stats: { views: 156, likes: 23, shares: 8, downloads: 45, comments: 12 },
          status: 'published',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T16:45:00Z',
          size: 15680,
          wordCount: 3200
        },
        {
          id: '2',
          title: 'AI技术应用方案',
          content: '人工智能在项目管理中的应用...',
          type: 'document',
          category: '技术文档',
          tags: ['AI', '技术方案', '创新'],
          author: { id: '3', name: '王五', avatar: '' },
          collaborators: [
            { id: '3', name: '王五', role: 'owner' }
          ],
          stats: { views: 89, likes: 15, shares: 3, downloads: 22, comments: 6 },
          status: 'published',
          createdAt: '2024-01-18T09:15:00Z',
          updatedAt: '2024-01-18T14:30:00Z',
          size: 12450,
          wordCount: 2100
        }
      ]
      setDocuments(mockDocuments)
    } catch (error) {
      console.error('加载文档失败:', error)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const mockStats: KnowledgeStats = {
        totalDocuments: 145,
        totalViews: 15620,
        totalAuthors: 28,
        activeCollaborators: 15,
        documentsThisWeek: 8,
        viewsThisWeek: 1240,
        topCategories: [
          { name: '项目管理', count: 45, percentage: 31 },
          { name: '技术文档', count: 38, percentage: 26 },
          { name: '流程规范', count: 32, percentage: 22 },
          { name: '培训材料', count: 30, percentage: 21 }
        ],
        recentActivity: [
          { type: 'create', document: '新项目启动流程', user: '张三', timestamp: '2024-01-20T16:30:00Z' },
          { type: 'edit', document: 'API开发规范', user: '李四', timestamp: '2024-01-20T15:45:00Z' },
          { type: 'view', document: '代码审查指南', user: '王五', timestamp: '2024-01-20T14:20:00Z' }
        ]
      }
      setStats(mockStats)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 加载知识图谱节点
  const loadKnowledgeNodes = async () => {
    try {
      const mockNodes: KnowledgeNode[] = [
        {
          id: '1',
          name: '敏捷开发',
          type: 'concept',
          description: '一种软件开发方法论',
          connections: 15,
          importance: 0.9,
          category: '方法论'
        },
        {
          id: '2',
          name: 'React框架',
          type: 'technology',
          description: '前端开发框架',
          connections: 28,
          importance: 0.85,
          category: '技术栈'
        }
      ]
      setKnowledgeNodes(mockNodes)
    } catch (error) {
      console.error('加载知识节点失败:', error)
    }
  }

  // 搜索文档
  const handleSearch = useCallback(async (keyword: string) => {
    setSearchKeyword(keyword)
    // TODO: 实现搜索逻辑
    if (keyword) {
      message.info(`搜索关键词: ${keyword}`)
    }
  }, [])

  // 筛选文档
  const filteredDocuments = documents.filter(doc => {
    if (searchKeyword && !doc.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false
    }
    if (selectedCategory && doc.category !== selectedCategory) {
      return false
    }
    if (selectedType && doc.type !== selectedType) {
      return false
    }
    if (filterStatus && doc.status !== filterStatus) {
      return false
    }
    return true
  })

  // 创建新文档
  const handleCreateDocument = async (values: any) => {
    try {
      console.log('创建文档:', values)
      message.success('文档创建成功')
      setShowCreateModal(false)
      createForm.resetFields()
      await loadDocuments()
    } catch (error) {
      message.error('创建文档失败')
    }
  }

  // 编辑文档
  const handleEditDocument = (document: KnowledgeDocument) => {
    setSelectedDocument(document)
    setShowEditorModal(true)
  }

  // 删除文档
  const handleDeleteDocument = async (documentId: string) => {
    try {
      console.log('删除文档:', documentId)
      message.success('文档删除成功')
      await loadDocuments()
    } catch (error) {
      message.error('删除文档失败')
    }
  }

  // 文档操作菜单
  const getDocumentActions = (document: KnowledgeDocument) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEditDocument(document)}>
        编辑
      </Menu.Item>
      <Menu.Item key="share" icon={<ShareAltOutlined />}>
        分享
      </Menu.Item>
      <Menu.Item key="download" icon={<DownloadOutlined />}>
        下载
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteDocument(document.id)}>
        删除
      </Menu.Item>
    </Menu>
  )

  // 文档表格列定义
  const documentColumns = [
    {
      title: '文档标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: KnowledgeDocument) => (
        <Space>
          <FileTextOutlined />
          <div>
            <div className={styles.documentTitle}>{title}</div>
            <Text type="secondary">
              {record.wordCount} 字 · {record.author.name} · {new Date(record.updatedAt).toLocaleDateString()}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig = {
          document: { color: 'blue', text: '文档' },
          wiki: { color: 'green', text: 'Wiki' },
          template: { color: 'orange', text: '模板' },
          guide: { color: 'purple', text: '指南' }
        }
        const config = typeConfig[type as keyof typeof typeConfig] || { color: 'default', text: type }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>
    },
    {
      title: '协作者',
      dataIndex: 'collaborators',
      key: 'collaborators',
      render: (collaborators: any[]) => (
        <Avatar.Group maxCount={3} size="small">
          {collaborators.map(user => (
            <Tooltip key={user.id} title={`${user.name} (${user.role})`}>
              <Avatar src={user.avatar}>{user.name[0]}</Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
      )
    },
    {
      title: '统计',
      dataIndex: 'stats',
      key: 'stats',
      render: (stats: any) => (
        <Space size="small">
          <Tooltip title="浏览量">
            <span><EyeOutlined /> {stats.views}</span>
          </Tooltip>
          <Tooltip title="点赞">
            <span><StarOutlined /> {stats.likes}</span>
          </Tooltip>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          draft: { color: 'default', text: '草稿' },
          published: { color: 'success', text: '已发布' },
          archived: { color: 'warning', text: '已归档' }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
        return <Badge status={config.color as any} text={config.text} />
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: KnowledgeDocument) => (
        <Dropdown overlay={getDocumentActions(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ]

  // 渲染概览页面
  const renderOverview = () => (
    <div className={styles.overview}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总文档数"
              value={stats?.totalDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={stats?.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="活跃作者"
              value={stats?.totalAuthors}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="本周新增"
              value={stats?.documentsThisWeek}
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 分类分布 */}
        <Col xs={24} md={12}>
          <Card title="分类分布" extra={<BarChartOutlined />}>
            {stats?.topCategories.map(category => (
              <div key={category.name} className={styles.categoryItem}>
                <div className={styles.categoryHeader}>
                  <span>{category.name}</span>
                  <span>{category.count} 篇</span>
                </div>
                <Progress
                  percent={category.percentage}
                  size="small"
                  strokeColor={`hsl(${category.percentage * 3.6}, 70%, 50%)`}
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} md={12}>
          <Card title="最近活动" extra={<ClockCircleOutlined />}>
            <List
              size="small"
              dataSource={stats?.recentActivity || []}
              renderItem={activity => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        icon={
                          activity.type === 'create' ? <PlusOutlined /> :
                          activity.type === 'edit' ? <EditOutlined /> :
                          activity.type === 'view' ? <EyeOutlined /> :
                          <ShareAltOutlined />
                        }
                      />
                    }
                    title={activity.document}
                    description={
                      <Space>
                        <span>{activity.user}</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )

  // 渲染文档管理页面
  const renderDocuments = () => (
    <div className={styles.documents}>
      {/* 搜索和筛选栏 */}
      <Card className={styles.filterCard}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索文档标题、内容、标签..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Space>
              <Select
                placeholder="分类"
                allowClear
                style={{ width: 120 }}
                onChange={setSelectedCategory}
              >
                <Option value="项目管理">项目管理</Option>
                <Option value="技术文档">技术文档</Option>
                <Option value="流程规范">流程规范</Option>
                <Option value="培训材料">培训材料</Option>
              </Select>
              <Select
                placeholder="类型"
                allowClear
                style={{ width: 100 }}
                onChange={setSelectedType}
              >
                <Option value="document">文档</Option>
                <Option value="wiki">Wiki</Option>
                <Option value="template">模板</Option>
                <Option value="guide">指南</Option>
              </Select>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 100 }}
                onChange={setFilterStatus}
              >
                <Option value="draft">草稿</Option>
                <Option value="published">已发布</Option>
                <Option value="archived">已归档</Option>
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowCreateModal(true)}
              >
                新建文档
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 文档表格 */}
      <Card>
        <Table
          columns={documentColumns}
          dataSource={filteredDocuments}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredDocuments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>
    </div>
  )

  // 渲染知识图谱页面
  const renderKnowledgeGraph = () => (
    <div className={styles.knowledgeGraph}>
      <Card title="知识图谱" extra={<ApartmentOutlined />}>
        <Row gutter={16}>
          <Col span={16}>
            <div className={styles.graphContainer}>
              {/* TODO: 集成知识图谱可视化组件 */}
              <Empty description="知识图谱可视化组件开发中" />
            </div>
          </Col>
          <Col span={8}>
            <Card title="重要节点" size="small">
              <List
                size="small"
                dataSource={knowledgeNodes}
                renderItem={node => (
                  <List.Item>
                    <List.Item.Meta
                      title={node.name}
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">{node.description}</Text>
                          <div>
                            <Tag color="blue">{node.type}</Tag>
                            <span>重要度: {Math.round(node.importance * 100)}%</span>
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Card className={styles.header}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <BookOutlined /> 知识管理中心
            </Title>
            <Text type="secondary">统一管理团队知识资产，提升协作效率</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<RobotOutlined />} type="primary" ghost>
                AI助手
              </Button>
              <Button icon={<BulbOutlined />}>
                智能推荐
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className={styles.tabs}>
        <TabPane
          tab={<span><TrophyOutlined />概览</span>}
          key="overview"
        >
          {renderOverview()}
        </TabPane>
        <TabPane
          tab={<span><FileTextOutlined />文档管理</span>}
          key="documents"
        >
          {renderDocuments()}
        </TabPane>
        <TabPane
          tab={<span><ApartmentOutlined />知识图谱</span>}
          key="knowledge-graph"
        >
          {renderKnowledgeGraph()}
        </TabPane>
        <TabPane
          tab={<span><ThunderboltOutlined />智能推荐</span>}
          key="recommendations"
        >
          <Card>
            <Empty description="智能推荐功能开发中" />
          </Card>
        </TabPane>
      </Tabs>

      {/* 创建文档模态框 */}
      <Modal
        title="创建新文档"
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        width={600}
      >
        <Form form={createForm} onFinish={handleCreateDocument} layout="vertical">
          <Form.Item
            name="title"
            label="文档标题"
            rules={[{ required: true, message: '请输入文档标题' }]}
          >
            <Input placeholder="输入文档标题" />
          </Form.Item>
          <Form.Item
            name="type"
            label="文档类型"
            rules={[{ required: true, message: '请选择文档类型' }]}
          >
            <Select placeholder="选择文档类型">
              <Option value="document">文档</Option>
              <Option value="wiki">Wiki</Option>
              <Option value="template">模板</Option>
              <Option value="guide">指南</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input placeholder="输入文档分类" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="添加标签" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑器模态框 */}
      <Modal
        title={selectedDocument?.title}
        visible={showEditorModal}
        onCancel={() => setShowEditorModal(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ height: 'calc(100vh - 200px)', padding: 0 }}
      >
        {selectedDocument && (
          <WikiCollaborationEditor
            documentId={selectedDocument.id}
            projectId={projectId}
            initialContent={selectedDocument.content}
            initialTitle={selectedDocument.title}
            onSave={(content, title) => {
              message.success('文档已保存')
              setShowEditorModal(false)
              loadDocuments()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default KnowledgeControlPanel