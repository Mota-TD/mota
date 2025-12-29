/**
 * Wiki文档实时协作编辑器
 * 支持多人同时编辑、实时同步、版本控制
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Card,
  Button,
  Input,
  Space,
  Avatar,
  Tooltip,
  Badge,
  Spin,
  message,
  Modal,
  Select,
  Tag,
  Divider,
  Dropdown,
  Menu,
  Typography,
  Row,
  Col,
  List,
  Popover,
  Alert,
  Progress
} from 'antd'
import {
  SaveOutlined,
  ShareAltOutlined,
  UserOutlined,
  HistoryOutlined,
  CommentOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  BranchesOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { wsClient } from '@/services/websocket/wsClient'
import { recommendationEngine } from '../../services/intelligentRecommendation'
import styles from './index.module.css'

const { TextArea } = Input
const { Text, Title } = Typography

// 协作用户信息
interface CollaboratorInfo {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'online' | 'away' | 'offline'
  lastActivity: string
  currentSection?: string
  cursorPosition?: number
}

// 文档版本信息
interface DocumentVersion {
  id: string
  version: number
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  changeLog: string
  size: number
  wordCount: number
}

// 实时编辑事件
interface EditEvent {
  type: 'insert' | 'delete' | 'replace' | 'cursor_move' | 'selection'
  userId: string
  position: number
  length: number
  content?: string
  timestamp: number
}

// 评论信息
interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  position: number
  selection: string
  replies: Comment[]
  createdAt: string
  resolved: boolean
}

// 知识推荐
interface KnowledgeRecommendation {
  id: string
  title: string
  type: 'link' | 'template' | 'reference' | 'example'
  url?: string
  content?: string
  relevance: number
  source: string
}

interface WikiCollaborationEditorProps {
  documentId: string
  projectId?: string
  initialContent?: string
  initialTitle?: string
  readOnly?: boolean
  onSave?: (content: string, title: string) => void
  onContentChange?: (content: string) => void
  className?: string
}

const WikiCollaborationEditor: React.FC<WikiCollaborationEditorProps> = ({
  documentId,
  projectId,
  initialContent = '',
  initialTitle = '',
  readOnly = false,
  onSave,
  onContentChange,
  className
}) => {
  // 基础状态
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // 协作状态
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'conflict' | 'offline'>('synced')

  // 版本控制
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null)

  // 评论系统
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [commentPosition, setCommentPosition] = useState(0)

  // 知识推荐
  const [recommendations, setRecommendations] = useState<KnowledgeRecommendation[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)

  // 编辑器引用
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastChangeRef = useRef<number>(Date.now())

  // 初始化WebSocket连接
  useEffect(() => {
    if (!documentId) return

    const handleConnection = () => {
      setIsConnected(true)
      setSyncStatus('synced')
      
      // 加入文档协作房间
      wsClient.emit('join_document', {
        documentId,
        projectId,
        userInfo: {
          id: 'current_user', // TODO: 从用户状态获取
          name: '当前用户',
          avatar: '',
          role: 'editor'
        }
      })
    }

    const handleDisconnection = () => {
      setIsConnected(false)
      setSyncStatus('offline')
    }

    const handleCollaboratorJoin = (collaborator: CollaboratorInfo) => {
      setCollaborators(prev => {
        const existing = prev.find(c => c.id === collaborator.id)
        if (existing) {
          return prev.map(c => c.id === collaborator.id ? collaborator : c)
        }
        return [...prev, collaborator]
      })
    }

    const handleCollaboratorLeave = (collaboratorId: string) => {
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
    }

    const handleEditEvent = (event: EditEvent) => {
      if (event.userId === 'current_user') return // 忽略自己的编辑事件
      
      applyRemoteEdit(event)
      updateCollaboratorActivity(event.userId, event.position)
    }

    const handleCommentAdd = (comment: Comment) => {
      setComments(prev => [...prev, comment])
    }

    const handleSyncStatus = (status: 'synced' | 'syncing' | 'conflict') => {
      setSyncStatus(status)
    }

    // 注册事件监听
    wsClient.on('connect', handleConnection)
    wsClient.on('disconnect', handleDisconnection)
    wsClient.on('collaborator_join', handleCollaboratorJoin)
    wsClient.on('collaborator_leave', handleCollaboratorLeave)
    wsClient.on('document_edit', handleEditEvent)
    wsClient.on('comment_add', handleCommentAdd)
    wsClient.on('sync_status', handleSyncStatus)

    // 连接WebSocket
    // WebSocket已在wsClient中自动连接

    return () => {
      // 清理事件监听
      wsClient.off('connect', handleConnection)
      wsClient.off('disconnect', handleDisconnection)
      wsClient.off('collaborator_join', handleCollaboratorJoin)
      wsClient.off('collaborator_leave', handleCollaboratorLeave)
      wsClient.off('document_edit', handleEditEvent)
      wsClient.off('comment_add', handleCommentAdd)
      wsClient.off('sync_status', handleSyncStatus)

      // 离开协作房间
      wsClient.emit('leave_document', { documentId })
    }
  }, [documentId, projectId])

  // 自动保存
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (content !== initialContent || title !== initialTitle) {
        handleAutoSave()
      }
    }, 2000) // 2秒后自动保存

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [content, title])

  // 处理内容变更
  const handleContentChange = useCallback((value: string) => {
    const now = Date.now()
    const changeEvent: EditEvent = {
      type: 'replace',
      userId: 'current_user',
      position: 0,
      length: content.length,
      content: value,
      timestamp: now
    }

    setContent(value)
    lastChangeRef.current = now
    setSyncStatus('syncing')

    // 发送编辑事件到其他协作者
    if (isConnected) {
      wsClient.emit('document_edit', {
        documentId,
        event: changeEvent
      })
    }

    // 通知父组件
    onContentChange?.(value)

    // 更新推荐
    updateRecommendations(value)
  }, [content, isConnected, documentId, onContentChange])

  // 应用远程编辑
  const applyRemoteEdit = useCallback((event: EditEvent) => {
    setContent(prevContent => {
      let newContent = prevContent
      
      switch (event.type) {
        case 'replace':
          newContent = event.content || ''
          break
        case 'insert':
          newContent = prevContent.slice(0, event.position) + 
                      (event.content || '') + 
                      prevContent.slice(event.position)
          break
        case 'delete':
          newContent = prevContent.slice(0, event.position) + 
                      prevContent.slice(event.position + event.length)
          break
      }
      
      return newContent
    })

    setSyncStatus('synced')
  }, [])

  // 更新协作者活动状态
  const updateCollaboratorActivity = useCallback((userId: string, position: number) => {
    setCollaborators(prev => prev.map(collaborator => {
      if (collaborator.id === userId) {
        return {
          ...collaborator,
          lastActivity: new Date().toISOString(),
          cursorPosition: position,
          status: 'online' as const
        }
      }
      return collaborator
    }))
  }, [])

  // 自动保存
  const handleAutoSave = useCallback(async () => {
    if (readOnly) return

    try {
      setSaving(true)
      
      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLastSaved(new Date())
      setSyncStatus('synced')
      
      // 发送保存事件
      if (isConnected) {
        wsClient.emit('document_save', {
          documentId,
          title,
          content,
          timestamp: Date.now()
        })
      }

    } catch (error) {
      console.error('自动保存失败:', error)
      message.error('自动保存失败，请手动保存')
    } finally {
      setSaving(false)
    }
  }, [documentId, title, content, isConnected, readOnly])

  // 手动保存
  const handleSave = useCallback(async () => {
    if (readOnly) return

    try {
      setSaving(true)
      await handleAutoSave()
      onSave?.(content, title)
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }, [content, title, readOnly, onSave, handleAutoSave])

  // 更新智能推荐
  const updateRecommendations = useCallback(async (currentContent: string) => {
    if (!currentContent.trim() || !projectId) return

    try {
      const context = {
        userId: 'current_user',
        projectId,
        currentDocument: documentId,
        searchQuery: currentContent.slice(-100) // 最后100个字符作为上下文
      }

      const result = await recommendationEngine.getRecommendations(context)
      
      const wikiRecommendations: KnowledgeRecommendation[] = result.recommendations
        .filter((item: any) => item.type === 'document' || item.type === 'knowledge_node')
        .slice(0, 5)
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          type: 'reference' as const,
          content: item.description,
          relevance: item.relevanceScore,
          source: item.source.name
        }))

      setRecommendations(wikiRecommendations)
    } catch (error) {
      console.error('获取推荐失败:', error)
    }
  }, [projectId, documentId])

  // 处理文本选择
  const handleTextSelection = useCallback(() => {
    if (!editorRef.current) return

    const start = editorRef.current.selectionStart
    const end = editorRef.current.selectionEnd
    
    if (start !== end) {
      const selection = content.slice(start, end)
      setSelectedText(selection)
      setCommentPosition(start)
    }
  }, [content])

  // 添加评论
  const handleAddComment = useCallback(async (commentContent: string) => {
    if (!selectedText || !commentContent.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      content: commentContent,
      author: {
        id: 'current_user',
        name: '当前用户',
        avatar: ''
      },
      position: commentPosition,
      selection: selectedText,
      replies: [],
      createdAt: new Date().toISOString(),
      resolved: false
    }

    setComments(prev => [...prev, newComment])

    // 发送评论事件
    if (isConnected) {
      wsClient.emit('comment_add', {
        documentId,
        comment: newComment
      })
    }

    setSelectedText('')
    message.success('评论已添加')
  }, [selectedText, commentPosition, documentId, isConnected])

  // 渲染协作者列表
  const renderCollaborators = () => (
    <Space size="small">
      {collaborators.map(collaborator => (
        <Tooltip
          key={collaborator.id}
          title={
            <div>
              <div>{collaborator.name}</div>
              <div>角色: {collaborator.role}</div>
              <div>状态: {collaborator.status}</div>
              {collaborator.currentSection && (
                <div>正在编辑: {collaborator.currentSection}</div>
              )}
            </div>
          }
        >
          <Badge
            status={collaborator.status === 'online' ? 'success' : 'default'}
            dot
          >
            <Avatar
              size="small"
              src={collaborator.avatar}
              icon={!collaborator.avatar ? <UserOutlined /> : undefined}
            />
          </Badge>
        </Tooltip>
      ))}
    </Space>
  )

  // 渲染同步状态
  const renderSyncStatus = () => {
    const statusConfig = {
      synced: { icon: <CheckCircleOutlined />, color: 'success', text: '已同步' },
      syncing: { icon: <SyncOutlined spin />, color: 'processing', text: '同步中' },
      conflict: { icon: <WarningOutlined />, color: 'warning', text: '冲突' },
      offline: { icon: <WarningOutlined />, color: 'error', text: '离线' }
    }

    const config = statusConfig[syncStatus]
    
    return (
      <Space size="small">
        <Badge status={config.color as any} />
        {config.icon}
        <Text type="secondary">{config.text}</Text>
        {lastSaved && (
          <Text type="secondary">
            最后保存: {lastSaved.toLocaleTimeString()}
          </Text>
        )}
      </Space>
    )
  }

  // 渲染推荐面板
  const renderRecommendations = () => (
    <Card 
      title="智能推荐" 
      size="small"
      extra={
        <Button 
          type="text" 
          size="small" 
          onClick={() => setShowRecommendations(!showRecommendations)}
        >
          {showRecommendations ? '隐藏' : '显示'}
        </Button>
      }
    >
      {showRecommendations && (
        <List
          size="small"
          dataSource={recommendations}
          renderItem={item => (
            <List.Item className={styles.recommendationItem}>
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    <Progress
                      percent={Math.round(item.relevance * 100)}
                      size="small"
                      showInfo={false}
                      style={{ width: 50 }}
                    />
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">{item.content}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag>{item.source}</Tag>
                      <Tag color="blue">{item.type}</Tag>
                    </div>
                  </div>
                }
              />
              <Button size="small" type="link">
                插入引用
              </Button>
            </List.Item>
          )}
        />
      )}
    </Card>
  )

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 工具栏 */}
      <Card className={styles.toolbar}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="文档标题"
                variant="borderless"
                className={styles.titleInput}
                readOnly={readOnly}
              />
              <Divider type="vertical" />
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                disabled={readOnly}
              >
                保存
              </Button>
              <Button
                icon={<ShareAltOutlined />}
                onClick={() => {/* TODO: 分享逻辑 */}}
              >
                分享
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setShowVersionHistory(true)}
              >
                版本历史
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              {renderCollaborators()}
              <Divider type="vertical" />
              {renderSyncStatus()}
              <Button
                icon={<CommentOutlined />}
                onClick={() => setShowComments(!showComments)}
                type={comments.length > 0 ? 'primary' : 'default'}
              >
                评论 ({comments.length})
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 编辑器区域 */}
      <div className={styles.editorArea}>
        <Row gutter={16} style={{ height: '100%' }}>
          {/* 主编辑器 */}
          <Col span={showRecommendations || showComments ? 16 : 24}>
            <Card className={styles.editorCard}>
              <TextArea
                ref={editorRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onSelect={handleTextSelection}
                placeholder="在此编写文档内容..."
                className={styles.editor}
                readOnly={readOnly}
                autoSize={{ minRows: 20 }}
              />
              
              {/* 协作光标指示器 */}
              {collaborators.map(collaborator => 
                collaborator.cursorPosition !== undefined && (
                  <div
                    key={collaborator.id}
                    className={styles.collaboratorCursor}
                    style={{
                      top: Math.floor(collaborator.cursorPosition / 80) * 20 + 'px',
                      left: (collaborator.cursorPosition % 80) * 8 + 'px'
                    }}
                  >
                    <div className={styles.cursorLine} />
                    <div className={styles.cursorLabel}>
                      {collaborator.name}
                    </div>
                  </div>
                )
              )}
            </Card>
          </Col>

          {/* 侧边栏 */}
          {(showRecommendations || showComments) && (
            <Col span={8}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* 推荐面板 */}
                {showRecommendations && renderRecommendations()}

                {/* 评论面板 */}
                {showComments && (
                  <Card title="评论" size="small">
                    <List
                      size="small"
                      dataSource={comments}
                      renderItem={comment => (
                        <List.Item className={styles.commentItem}>
                          <List.Item.Meta
                            avatar={<Avatar size="small" src={comment.author.avatar} />}
                            title={
                              <Space>
                                <Text strong>{comment.author.name}</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </Text>
                              </Space>
                            }
                            description={
                              <div>
                                <Text>{comment.content}</Text>
                                {comment.selection && (
                                  <div className={styles.commentSelection}>
                                    引用: "{comment.selection}"
                                  </div>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    
                    {selectedText && (
                      <div className={styles.addComment}>
                        <Alert
                          message={`选中文本: "${selectedText}"`}
                          type="info"
                          closable
                          onClose={() => setSelectedText('')}
                          style={{ marginBottom: 8 }}
                        />
                        <Input.Group compact>
                          <Input
                            placeholder="添加评论..."
                            onPressEnter={(e) => {
                              handleAddComment(e.currentTarget.value)
                              e.currentTarget.value = ''
                            }}
                          />
                        </Input.Group>
                      </div>
                    )}
                  </Card>
                )}
              </Space>
            </Col>
          )}
        </Row>
      </div>

      {/* 版本历史模态框 */}
      <Modal
        title="版本历史"
        visible={showVersionHistory}
        onCancel={() => setShowVersionHistory(false)}
        footer={null}
        width={800}
      >
        <List
          dataSource={versions}
          renderItem={version => (
            <List.Item
              actions={[
                <Button key="restore" type="link">恢复</Button>,
                <Button key="compare" type="link">对比</Button>
              ]}
            >
              <List.Item.Meta
                title={`v${version.version} - ${version.title}`}
                description={
                  <Space direction="vertical" size="small">
                    <div>
                      <Space>
                        <Avatar size="small" src={version.author.avatar} />
                        <Text>{version.author.name}</Text>
                        <Text type="secondary">{version.createdAt}</Text>
                      </Space>
                    </div>
                    <div>
                      <Text type="secondary">{version.changeLog}</Text>
                    </div>
                    <div>
                      <Space>
                        <Text type="secondary">大小: {version.size}字符</Text>
                        <Text type="secondary">字数: {version.wordCount}</Text>
                      </Space>
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}

export default WikiCollaborationEditor