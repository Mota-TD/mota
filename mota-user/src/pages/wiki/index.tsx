import { useState, useEffect } from 'react'
import { Card, Tree, Input, Button, Empty, Spin, Typography, Space, Breadcrumb, Dropdown, Modal, Form, message } from 'antd'
import { 
  FileTextOutlined, 
  FolderOutlined, 
  PlusOutlined, 
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  HomeOutlined
} from '@ant-design/icons'
import * as wikiApi from '@/services/api/wiki'
import * as userApi from '@/services/api/user'
import styles from './index.module.css'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

interface WikiPage {
  id: number
  title: string
  parentId: number | null
  content: string
  author: number
  updatedAt: string
}

interface User {
  id: number
  name: string
  avatar: string
}

interface TreeNode {
  key: string
  title: string
  icon: React.ReactNode
  children?: TreeNode[]
  isLeaf?: boolean
  data: WikiPage
}

const WikiPage = () => {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<WikiPage[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null)
  const [searchText, setSearchText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pagesRes, usersRes] = await Promise.all([
        wikiApi.getWikiPages(),
        userApi.getUsers()
      ])
      const pagesList = (pagesRes as any).list || pagesRes || []
      const usersList = (usersRes as any).list || usersRes || []
      setPages(pagesList)
      setUsers(usersList)
      
      // 默认选中第一个页面
      if (pagesList.length > 0) {
        setSelectedPage(pagesList[0])
      }
    } catch (error) {
      console.error('Failed to load wiki pages:', error)
    } finally {
      setLoading(false)
    }
  }

  // 构建树形结构
  const buildTreeData = (): TreeNode[] => {
    const rootPages = pages.filter(p => p.parentId === null)
    
    const buildNode = (page: WikiPage): TreeNode => {
      const children = pages.filter(p => p.parentId === page.id)
      return {
        key: String(page.id),
        title: page.title,
        icon: children.length > 0 ? <FolderOutlined /> : <FileTextOutlined />,
        children: children.length > 0 ? children.map(buildNode) : undefined,
        isLeaf: children.length === 0,
        data: page
      }
    }
    
    return rootPages.map(buildNode)
  }

  // 过滤搜索结果
  const filteredTreeData = (): TreeNode[] => {
    if (!searchText) return buildTreeData()
    
    const filtered = pages.filter(p => 
      p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.content.toLowerCase().includes(searchText.toLowerCase())
    )
    
    return filtered.map(page => ({
      key: String(page.id),
      title: page.title,
      icon: <FileTextOutlined />,
      isLeaf: true,
      data: page
    }))
  }

  const handleSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const page = pages.find(p => p.id === Number(selectedKeys[0]))
      if (page) {
        setSelectedPage(page)
        setIsEditing(false)
      }
    }
  }

  const handleEdit = () => {
    if (selectedPage) {
      setEditContent(selectedPage.content)
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (selectedPage) {
      // 模拟保存
      setSelectedPage({ ...selectedPage, content: editContent })
      setPages(pages.map(p => 
        p.id === selectedPage.id ? { ...p, content: editContent } : p
      ))
      setIsEditing(false)
      message.success('保存成功')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent('')
  }

  const handleCreatePage = () => {
    setIsModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      // 模拟创建页面
      const newPage: WikiPage = {
        id: pages.length + 1,
        title: values.title,
        parentId: values.parentId || null,
        content: values.content || '# ' + values.title + '\n\n开始编写内容...',
        author: 1,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setPages([...pages, newPage])
      setSelectedPage(newPage)
      setIsModalOpen(false)
      form.resetFields()
      message.success('页面创建成功')
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleDelete = () => {
    if (selectedPage) {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除页面"${selectedPage.title}"吗？`,
        onOk: () => {
          setPages(pages.filter(p => p.id !== selectedPage.id))
          setSelectedPage(pages.find(p => p.id !== selectedPage.id) || null)
          message.success('删除成功')
        }
      })
    }
  }

  const getAuthorName = (authorId: number) => {
    const user = users.find(u => u.id === authorId)
    return user?.name || '未知用户'
  }

  const renderContent = () => {
    if (!selectedPage) {
      return (
        <Empty 
          description="请选择一个页面或创建新页面"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePage}>
            创建页面
          </Button>
        </Empty>
      )
    }

    if (isEditing) {
      return (
        <div className={styles.editor}>
          <div className={styles.editorHeader}>
            <Input 
              value={selectedPage.title}
              onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
              className={styles.titleInput}
            />
            <Space>
              <Button onClick={handleCancel}>取消</Button>
              <Button type="primary" onClick={handleSave}>保存</Button>
            </Space>
          </div>
          <TextArea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={styles.contentEditor}
            placeholder="使用 Markdown 格式编写内容..."
            autoSize={{ minRows: 20 }}
          />
        </div>
      )
    }

    return (
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <Breadcrumb items={[
            { title: <><HomeOutlined /> 知识管理</> },
            { title: selectedPage.title }
          ]} />
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
            <Dropdown menu={{
              items: [
                { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true, onClick: handleDelete }
              ]
            }}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>
        
        <Title level={2}>{selectedPage.title}</Title>
        
        <div className={styles.pageMeta}>
          <Text type="secondary">
            作者: {getAuthorName(selectedPage.author)} · 更新于 {selectedPage.updatedAt}
          </Text>
        </div>
        
        <div className={styles.pageBody}>
          {selectedPage.content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
              return <Title key={index} level={1}>{line.slice(2)}</Title>
            } else if (line.startsWith('## ')) {
              return <Title key={index} level={2}>{line.slice(3)}</Title>
            } else if (line.startsWith('### ')) {
              return <Title key={index} level={3}>{line.slice(4)}</Title>
            } else if (line.trim()) {
              return <Paragraph key={index}>{line}</Paragraph>
            }
            return <br key={index} />
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Title level={4} style={{ margin: 0 }}>知识管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={handleCreatePage}
          >
            新建文档
          </Button>
        </div>
        
        <Input
          placeholder="搜索页面..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={styles.searchInput}
          allowClear
        />
        
        <div className={styles.treeContainer}>
          <Tree
            showIcon
            defaultExpandAll
            selectedKeys={selectedPage ? [String(selectedPage.id)] : []}
            onSelect={handleSelect}
            treeData={filteredTreeData()}
          />
        </div>
      </div>
      
      <div className={styles.content}>
        <Card className={styles.contentCard}>
          {renderContent()}
        </Card>
      </div>

      <Modal
        title="新建文档"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="文档标题"
            rules={[{ required: true, message: '请输入文档标题' }]}
          >
            <Input placeholder="请输入文档标题" />
          </Form.Item>
          <Form.Item
            name="parentId"
            label="父级目录"
          >
            <Input placeholder="可选，留空则为顶级目录" />
          </Form.Item>
          <Form.Item
            name="content"
            label="初始内容"
          >
            <TextArea rows={4} placeholder="可选，文档初始内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WikiPage