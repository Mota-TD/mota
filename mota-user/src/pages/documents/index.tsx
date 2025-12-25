/**
 * 文档管理页面
 * 集成所有文档协作功能：代码编辑、实时协作、行内评论、版本管理
 */

import { useEffect, useState } from 'react'
import { Card, Typography, Spin, Button, List, Empty, Tag, Space, Input, message, Tabs, Modal, Segmented } from 'antd'
import { 
  FileTextOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  EyeOutlined,
  CodeOutlined,
  TeamOutlined,
  CommentOutlined,
  HistoryOutlined,
  FileMarkdownOutlined
} from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import DocumentEditor from '@/components/DocumentEditor'
import CodeEditor from '@/components/CodeEditor'
import CollaborativeEditor from '@/components/CollaborativeEditor'
import InlineComment from '@/components/InlineComment'
import VersionDiff from '@/components/VersionDiff'
import styles from './index.module.css'

const { Title, Text } = Typography
const { Search } = Input

// 模拟文档列表数据
const mockDocuments = [
  {
    id: 1,
    title: '项目需求文档',
    description: '详细描述项目的功能需求和技术要求',
    updatedAt: '2024-01-15 14:30',
    author: '张三',
    viewCount: 128,
    currentVersion: 5,
    type: 'markdown'
  },
  {
    id: 2,
    title: '技术架构设计',
    description: '系统技术架构和模块设计说明',
    updatedAt: '2024-01-14 10:20',
    author: '李四',
    viewCount: 86,
    currentVersion: 3,
    type: 'markdown'
  },
  {
    id: 3,
    title: 'API接口文档',
    description: '后端API接口规范和使用说明',
    updatedAt: '2024-01-13 16:45',
    author: '王五',
    viewCount: 256,
    currentVersion: 8,
    type: 'code'
  },
  {
    id: 4,
    title: '数据库设计文档',
    description: '数据库表结构和关系设计',
    updatedAt: '2024-01-12 09:15',
    author: '赵六',
    viewCount: 64,
    currentVersion: 2,
    type: 'markdown'
  }
]

// 模拟文档内容
const mockDocumentContent = `# 项目需求文档

## 1. 项目概述

本项目是一个企业级项目管理平台，旨在提供高效的团队协作和项目管理功能。

## 2. 功能需求

### 2.1 用户管理
- 用户注册和登录
- 角色权限管理
- 个人信息维护

### 2.2 项目管理
- 项目创建和配置
- 任务分配和跟踪
- 进度报告生成

### 2.3 文档协作
- 在线文档编辑
- 实时协作功能
- 版本历史管理

## 3. 技术要求

- 前端：React + TypeScript + Ant Design
- 后端：Spring Boot + MyBatis
- 数据库：MySQL + Redis

## 4. 交付标准

- 完整的功能实现
- 单元测试覆盖率 > 80%
- 性能满足并发要求
`

// 模拟代码内容
const mockCodeContent = `// API 接口定义
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 用户接口
export const userApi = {
  // 获取用户信息
  getUserInfo: (userId: number): Promise<ApiResponse<User>> => {
    return request.get(\`/api/users/\${userId}\`);
  },
  
  // 更新用户信息
  updateUser: (userId: number, data: Partial<User>): Promise<ApiResponse<User>> => {
    return request.put(\`/api/users/\${userId}\`, data);
  },
  
  // 获取用户列表
  getUserList: (params: UserListParams): Promise<ApiResponse<PageResult<User>>> => {
    return request.get('/api/users', { params });
  }
};

// 项目接口
export const projectApi = {
  // 获取项目列表
  getProjects: (): Promise<ApiResponse<Project[]>> => {
    return request.get('/api/projects');
  },
  
  // 创建项目
  createProject: (data: CreateProjectDto): Promise<ApiResponse<Project>> => {
    return request.post('/api/projects', data);
  }
};
`

type EditorMode = 'view' | 'edit' | 'collaborate' | 'comment' | 'version' | 'code'

const DocumentsPage = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState(mockDocuments)
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<typeof mockDocuments[0] | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>('view')
  const [documentContent, setDocumentContent] = useState(mockDocumentContent)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocType, setNewDocType] = useState<'markdown' | 'code'>('markdown')

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (value: string) => {
    if (value.trim()) {
      const filtered = mockDocuments.filter(d =>
        d.title.toLowerCase().includes(value.toLowerCase()) ||
        d.description.toLowerCase().includes(value.toLowerCase())
      )
      setDocuments(filtered)
    } else {
      setDocuments(mockDocuments)
    }
  }

  const handleCreateDocument = () => {
    if (!newDocTitle.trim()) {
      message.warning('请输入文档标题')
      return
    }
    
    const newDoc = {
      id: Date.now(),
      title: newDocTitle,
      description: '新建文档',
      updatedAt: new Date().toLocaleString(),
      author: user?.name || '当前用户',
      viewCount: 0,
      currentVersion: 1,
      type: newDocType
    }
    
    setDocuments(prev => [newDoc, ...prev])
    setShowCreateModal(false)
    setNewDocTitle('')
    message.success('文档创建成功')
  }

  const handleSelectDocument = (doc: typeof mockDocuments[0], mode: EditorMode = 'view') => {
    setSelectedDocId(doc.id)
    setSelectedDoc(doc)
    setEditorMode(mode)
    setDocumentContent(doc.type === 'code' ? mockCodeContent : mockDocumentContent)
  }

  const handleBack = () => {
    setSelectedDocId(null)
    setSelectedDoc(null)
    setEditorMode('view')
  }

  const handleContentChange = (content: string) => {
    setDocumentContent(content)
  }

  const handleSaveVersion = (summary: string) => {
    message.success(`版本已保存: ${summary}`)
  }

  const handleRollback = (versionNumber: number) => {
    message.success(`已回滚到版本 ${versionNumber}`)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  // 如果选中了文档，显示编辑器
  if (selectedDocId && selectedDoc) {
    return (
      <div className={styles.container}>
        <div className={styles.editorHeader}>
          <div className={styles.headerLeft}>
            <Button onClick={handleBack}>返回文档列表</Button>
            <Title level={4} style={{ margin: '0 16px' }}>
              {selectedDoc.title}
            </Title>
            <Tag color={selectedDoc.type === 'code' ? 'purple' : 'blue'}>
              {selectedDoc.type === 'code' ? '代码' : 'Markdown'}
            </Tag>
          </div>
          <div className={styles.headerRight}>
            <Segmented
              value={editorMode}
              onChange={(value) => setEditorMode(value as EditorMode)}
              options={[
                { value: 'view', label: '查看', icon: <EyeOutlined /> },
                { value: 'edit', label: '编辑', icon: <EditOutlined /> },
                { value: 'code', label: '代码', icon: <CodeOutlined /> },
                { value: 'collaborate', label: '协作', icon: <TeamOutlined /> },
                { value: 'comment', label: '评论', icon: <CommentOutlined /> },
                { value: 'version', label: '版本', icon: <HistoryOutlined /> }
              ]}
            />
          </div>
        </div>

        <div className={styles.editorContent}>
          {editorMode === 'view' && (
            <DocumentEditor
              documentId={selectedDocId}
              userId={user?.id || 1}
              readOnly={true}
              onSave={() => message.success('文档保存成功')}
            />
          )}

          {editorMode === 'edit' && (
            <DocumentEditor
              documentId={selectedDocId}
              userId={user?.id || 1}
              readOnly={false}
              onSave={() => message.success('文档保存成功')}
            />
          )}

          {editorMode === 'code' && (
            <CodeEditor
              value={documentContent}
              onChange={handleContentChange}
              language={selectedDoc.type === 'code' ? 'typescript' : 'markdown'}
              theme="dark"
              height="calc(100vh - 200px)"
            />
          )}

          {editorMode === 'collaborate' && (
            <CollaborativeEditor
              documentId={selectedDocId}
              userId={user?.id || 1}
              userName={user?.name || '当前用户'}
              content={documentContent}
              onChange={handleContentChange}
              onSave={handleContentChange}
            />
          )}

          {editorMode === 'comment' && (
            <InlineComment
              documentId={selectedDocId}
              userId={user?.id || 1}
              userName={user?.name || '当前用户'}
              content={documentContent}
            />
          )}

          {editorMode === 'version' && (
            <VersionDiff
              documentId={selectedDocId}
              currentContent={documentContent}
              onRollback={handleRollback}
              onSaveVersion={handleSaveVersion}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Title level={3}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            文档管理
          </Title>
          <p className={styles.description}>
            创建、编辑和管理项目文档，支持多人协作、代码编辑和版本控制
          </p>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Search
              placeholder="搜索文档"
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
              新建文档
            </Button>
          </Space>
        </div>
      </div>

      {/* 功能说明卡片 */}
      <div className={styles.featureCards}>
        <Card className={styles.featureCard} size="small">
          <Space>
            <CodeOutlined className={styles.featureIcon} style={{ color: '#722ed1' }} />
            <div>
              <div className={styles.featureTitle}>代码编辑</div>
              <div className={styles.featureDesc}>语法高亮、多语言支持</div>
            </div>
          </Space>
        </Card>
        <Card className={styles.featureCard} size="small">
          <Space>
            <TeamOutlined className={styles.featureIcon} style={{ color: '#1890ff' }} />
            <div>
              <div className={styles.featureTitle}>实时协作</div>
              <div className={styles.featureDesc}>多人同时编辑、光标同步</div>
            </div>
          </Space>
        </Card>
        <Card className={styles.featureCard} size="small">
          <Space>
            <CommentOutlined className={styles.featureIcon} style={{ color: '#52c41a' }} />
            <div>
              <div className={styles.featureTitle}>行内评论</div>
              <div className={styles.featureDesc}>评论批注、协作讨论</div>
            </div>
          </Space>
        </Card>
        <Card className={styles.featureCard} size="small">
          <Space>
            <HistoryOutlined className={styles.featureIcon} style={{ color: '#faad14' }} />
            <div>
              <div className={styles.featureTitle}>版本管理</div>
              <div className={styles.featureDesc}>历史记录、版本对比</div>
            </div>
          </Space>
        </Card>
      </div>

      <Card className={styles.documentCard}>
        {documents.length === 0 ? (
          <Empty description="暂无文档">
            <Button type="primary" onClick={() => setShowCreateModal(true)}>
              创建第一个文档
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={documents}
            renderItem={(doc) => (
              <List.Item
                className={styles.documentItem}
                actions={[
                  <Button
                    key="view"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleSelectDocument(doc, 'view')}
                  >
                    查看
                  </Button>,
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleSelectDocument(doc, 'edit')}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="collaborate"
                    type="text"
                    icon={<TeamOutlined />}
                    onClick={() => handleSelectDocument(doc, 'collaborate')}
                  >
                    协作
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className={styles.docIcon}>
                      {doc.type === 'code' ? <CodeOutlined /> : <FileMarkdownOutlined />}
                    </div>
                  }
                  title={
                    <Space>
                      <a onClick={() => handleSelectDocument(doc, 'view')}>{doc.title}</a>
                      <Tag color="blue">v{doc.currentVersion}</Tag>
                      <Tag color={doc.type === 'code' ? 'purple' : 'green'}>
                        {doc.type === 'code' ? '代码' : 'Markdown'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div className={styles.docMeta}>
                      <Text type="secondary">{doc.description}</Text>
                      <div className={styles.docInfo}>
                        <span>作者: {doc.author}</span>
                        <span>浏览: {doc.viewCount}</span>
                        <span>更新: {doc.updatedAt}</span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 创建文档弹窗 */}
      <Modal
        title="新建文档"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false)
          setNewDocTitle('')
        }}
        onOk={handleCreateDocument}
        okText="创建"
      >
        <div className={styles.createForm}>
          <div className={styles.formItem}>
            <label>文档标题</label>
            <Input
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              placeholder="请输入文档标题"
            />
          </div>
          <div className={styles.formItem}>
            <label>文档类型</label>
            <Segmented
              value={newDocType}
              onChange={(value) => setNewDocType(value as 'markdown' | 'code')}
              options={[
                { value: 'markdown', label: 'Markdown 文档', icon: <FileMarkdownOutlined /> },
                { value: 'code', label: '代码文件', icon: <CodeOutlined /> }
              ]}
              block
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DocumentsPage