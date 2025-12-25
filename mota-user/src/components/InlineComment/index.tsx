/**
 * 行内评论和区域批注组件 (DC-008, DC-009)
 * 支持在文档中添加行内评论和选中区域批注
 */

import React, { useState, useEffect, useRef } from 'react'
import { 
  Card, 
  Button, 
  Input, 
  List, 
  Avatar, 
  Tooltip, 
  Popover, 
  Tag, 
  Space, 
  message, 
  Badge,
  Dropdown,
  Modal,
  Empty
} from 'antd'
import {
  CommentOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  MoreOutlined,
  PushpinOutlined,
  HighlightOutlined,
  MessageOutlined,
  SendOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import styles from './index.module.css'

// 评论类型
interface Comment {
  id: number
  documentId: number
  userId: number
  userName: string
  userAvatar?: string
  content: string
  position: CommentPosition
  parentId?: number
  replies?: Comment[]
  isResolved: boolean
  createdAt: string
  updatedAt: string
}

// 评论位置
interface CommentPosition {
  type: 'line' | 'range'
  startLine: number
  endLine?: number
  startColumn?: number
  endColumn?: number
  selectedText?: string
}

// 批注类型
interface Annotation {
  id: number
  documentId: number
  userId: number
  userName: string
  content: string
  color: string
  position: AnnotationPosition
  createdAt: string
}

// 批注位置
interface AnnotationPosition {
  startOffset: number
  endOffset: number
  selectedText: string
}

// 批注颜色
const ANNOTATION_COLORS = [
  { value: '#fff3cd', label: '黄色', border: '#ffc107' },
  { value: '#d4edda', label: '绿色', border: '#28a745' },
  { value: '#cce5ff', label: '蓝色', border: '#007bff' },
  { value: '#f8d7da', label: '红色', border: '#dc3545' },
  { value: '#e2e3e5', label: '灰色', border: '#6c757d' },
  { value: '#d1ecf1', label: '青色', border: '#17a2b8' }
]

interface InlineCommentProps {
  documentId: number
  userId: number
  userName: string
  content: string
  comments?: Comment[]
  annotations?: Annotation[]
  onAddComment?: (comment: Partial<Comment>) => void
  onDeleteComment?: (commentId: number) => void
  onResolveComment?: (commentId: number) => void
  onReplyComment?: (commentId: number, content: string) => void
  onAddAnnotation?: (annotation: Partial<Annotation>) => void
  onDeleteAnnotation?: (annotationId: number) => void
  readOnly?: boolean
}

const InlineComment: React.FC<InlineCommentProps> = ({
  documentId,
  userId,
  userName,
  content,
  comments: initialComments = [],
  annotations: initialAnnotations = [],
  onAddComment,
  onDeleteComment,
  onResolveComment,
  onReplyComment,
  onAddAnnotation,
  onDeleteAnnotation,
  readOnly = false
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations)
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showAnnotationPicker, setShowAnnotationPicker] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [newAnnotationContent, setNewAnnotationContent] = useState('')
  const [selectedAnnotationColor, setSelectedAnnotationColor] = useState(ANNOTATION_COLORS[0])
  const [activeComment, setActiveComment] = useState<Comment | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showCommentPanel, setShowCommentPanel] = useState(true)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  
  const contentRef = useRef<HTMLDivElement>(null)

  // 模拟初始评论数据
  useEffect(() => {
    if (initialComments.length === 0) {
      const mockComments: Comment[] = [
        {
          id: 1,
          documentId,
          userId: 2,
          userName: '张三',
          content: '这段描述需要更详细一些',
          position: { type: 'line', startLine: 3 },
          isResolved: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          replies: [
            {
              id: 11,
              documentId,
              userId: 3,
              userName: '李四',
              content: '同意，我来补充一下',
              position: { type: 'line', startLine: 3 },
              parentId: 1,
              isResolved: false,
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              updatedAt: new Date(Date.now() - 1800000).toISOString()
            }
          ]
        },
        {
          id: 2,
          documentId,
          userId: 3,
          userName: '李四',
          content: '这里有个拼写错误',
          position: { 
            type: 'range', 
            startLine: 5, 
            endLine: 5, 
            startColumn: 10, 
            endColumn: 15,
            selectedText: '错误文本'
          },
          isResolved: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]
      setComments(mockComments)
    }

    if (initialAnnotations.length === 0) {
      const mockAnnotations: Annotation[] = [
        {
          id: 1,
          documentId,
          userId: 2,
          userName: '张三',
          content: '重点内容',
          color: ANNOTATION_COLORS[0].value,
          position: { startOffset: 50, endOffset: 80, selectedText: '重要的文本内容' },
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      setAnnotations(mockAnnotations)
    }
  }, [documentId, initialComments.length, initialAnnotations.length])

  // 处理文本选择
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectedText('')
      setSelectionRange(null)
      return
    }

    const text = selection.toString().trim()
    if (text) {
      setSelectedText(text)
      
      // 获取选区位置
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
      
      // 计算偏移量
      if (contentRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect()
        const startOffset = range.startOffset
        const endOffset = range.endOffset
        setSelectionRange({ start: startOffset, end: endOffset })
      }
    }
  }

  // 添加评论
  const handleAddComment = () => {
    if (!newCommentContent.trim()) {
      message.warning('请输入评论内容')
      return
    }

    const lines = content.substring(0, selectionRange?.start || 0).split('\n')
    const startLine = lines.length

    const newComment: Comment = {
      id: Date.now(),
      documentId,
      userId,
      userName,
      content: newCommentContent,
      position: {
        type: selectedText ? 'range' : 'line',
        startLine,
        selectedText: selectedText || undefined
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: []
    }

    setComments(prev => [...prev, newComment])
    onAddComment?.(newComment)
    setNewCommentContent('')
    setShowCommentInput(false)
    setSelectedText('')
    message.success('评论已添加')
  }

  // 添加批注
  const handleAddAnnotation = () => {
    if (!selectedText || !selectionRange) {
      message.warning('请先选择要批注的文本')
      return
    }

    const newAnnotation: Annotation = {
      id: Date.now(),
      documentId,
      userId,
      userName,
      content: newAnnotationContent,
      color: selectedAnnotationColor.value,
      position: {
        startOffset: selectionRange.start,
        endOffset: selectionRange.end,
        selectedText
      },
      createdAt: new Date().toISOString()
    }

    setAnnotations(prev => [...prev, newAnnotation])
    onAddAnnotation?.(newAnnotation)
    setNewAnnotationContent('')
    setShowAnnotationPicker(false)
    setSelectedText('')
    message.success('批注已添加')
  }

  // 删除评论
  const handleDeleteComment = (commentId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      onOk: () => {
        setComments(prev => prev.filter(c => c.id !== commentId))
        onDeleteComment?.(commentId)
        message.success('评论已删除')
      }
    })
  }

  // 解决评论
  const handleResolveComment = (commentId: number) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, isResolved: true } : c
    ))
    onResolveComment?.(commentId)
    message.success('评论已标记为已解决')
  }

  // 回复评论
  const handleReplyComment = (commentId: number) => {
    if (!replyContent.trim()) {
      message.warning('请输入回复内容')
      return
    }

    const reply: Comment = {
      id: Date.now(),
      documentId,
      userId,
      userName,
      content: replyContent,
      position: { type: 'line', startLine: 0 },
      parentId: commentId,
      isResolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), reply]
        }
      }
      return c
    }))
    onReplyComment?.(commentId, replyContent)
    setReplyContent('')
    setActiveComment(null)
    message.success('回复已发送')
  }

  // 删除批注
  const handleDeleteAnnotation = (annotationId: number) => {
    setAnnotations(prev => prev.filter(a => a.id !== annotationId))
    onDeleteAnnotation?.(annotationId)
    message.success('批注已删除')
  }

  // 渲染带批注的内容
  const renderAnnotatedContent = () => {
    let result = content
    
    // 按位置排序批注（从后往前处理，避免位置偏移）
    const sortedAnnotations = [...annotations].sort(
      (a, b) => b.position.startOffset - a.position.startOffset
    )

    // 这里简化处理，实际项目中需要更复杂的逻辑
    return (
      <div 
        ref={contentRef}
        className={styles.content}
        onMouseUp={handleTextSelection}
      >
        <pre className={styles.preContent}>
          {content.split('\n').map((line, index) => {
            const lineComments = comments.filter(
              c => c.position.startLine === index + 1 && !c.isResolved
            )
            
            return (
              <div key={index} className={styles.line}>
                <span className={styles.lineNumber}>{index + 1}</span>
                <span className={styles.lineContent}>
                  {line || ' '}
                  {lineComments.length > 0 && (
                    <Tooltip title={`${lineComments.length} 条评论`}>
                      <Badge 
                        count={lineComments.length} 
                        size="small"
                        className={styles.commentBadge}
                      >
                        <CommentOutlined className={styles.commentIcon} />
                      </Badge>
                    </Tooltip>
                  )}
                </span>
              </div>
            )
          })}
        </pre>
      </div>
    )
  }

  // 渲染选择工具栏
  const renderSelectionToolbar = () => {
    if (!selectedText) return null

    return (
      <div 
        className={styles.selectionToolbar}
        style={{
          left: popoverPosition.x,
          top: popoverPosition.y
        }}
      >
        <Space>
          <Tooltip title="添加评论">
            <Button
              type="text"
              size="small"
              icon={<CommentOutlined />}
              onClick={() => setShowCommentInput(true)}
            />
          </Tooltip>
          <Tooltip title="添加批注">
            <Button
              type="text"
              size="small"
              icon={<HighlightOutlined />}
              onClick={() => setShowAnnotationPicker(true)}
            />
          </Tooltip>
        </Space>
      </div>
    )
  }

  // 渲染评论输入框
  const renderCommentInput = () => {
    if (!showCommentInput) return null

    return (
      <Modal
        title="添加评论"
        open={showCommentInput}
        onCancel={() => {
          setShowCommentInput(false)
          setNewCommentContent('')
        }}
        footer={null}
        width={500}
      >
        <div className={styles.commentInputModal}>
          {selectedText && (
            <div className={styles.selectedTextPreview}>
              <Tag color="blue">选中文本</Tag>
              <div className={styles.selectedText}>"{selectedText}"</div>
            </div>
          )}
          <Input.TextArea
            value={newCommentContent}
            onChange={e => setNewCommentContent(e.target.value)}
            placeholder="输入评论内容..."
            rows={4}
            autoFocus
          />
          <div className={styles.commentInputActions}>
            <Button onClick={() => setShowCommentInput(false)}>取消</Button>
            <Button type="primary" onClick={handleAddComment}>
              添加评论
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  // 渲染批注颜色选择器
  const renderAnnotationPicker = () => {
    if (!showAnnotationPicker) return null

    return (
      <Modal
        title="添加批注"
        open={showAnnotationPicker}
        onCancel={() => {
          setShowAnnotationPicker(false)
          setNewAnnotationContent('')
        }}
        footer={null}
        width={500}
      >
        <div className={styles.annotationPickerModal}>
          <div className={styles.selectedTextPreview}>
            <Tag color="blue">选中文本</Tag>
            <div className={styles.selectedText}>"{selectedText}"</div>
          </div>
          
          <div className={styles.colorPicker}>
            <span className={styles.colorLabel}>选择颜色：</span>
            <Space>
              {ANNOTATION_COLORS.map(color => (
                <Tooltip key={color.value} title={color.label}>
                  <div
                    className={`${styles.colorOption} ${
                      selectedAnnotationColor.value === color.value ? styles.selected : ''
                    }`}
                    style={{ 
                      backgroundColor: color.value,
                      borderColor: color.border
                    }}
                    onClick={() => setSelectedAnnotationColor(color)}
                  />
                </Tooltip>
              ))}
            </Space>
          </div>

          <Input.TextArea
            value={newAnnotationContent}
            onChange={e => setNewAnnotationContent(e.target.value)}
            placeholder="添加批注说明（可选）..."
            rows={3}
          />
          
          <div className={styles.annotationActions}>
            <Button onClick={() => setShowAnnotationPicker(false)}>取消</Button>
            <Button type="primary" onClick={handleAddAnnotation}>
              添加批注
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  // 渲染评论面板
  const renderCommentPanel = () => {
    const unresolvedComments = comments.filter(c => !c.isResolved)
    const resolvedComments = comments.filter(c => c.isResolved)

    return (
      <div className={styles.commentPanel}>
        <div className={styles.panelHeader}>
          <Space>
            <MessageOutlined />
            <span>评论 ({comments.length})</span>
          </Space>
          <Button
            type="text"
            size="small"
            icon={showCommentPanel ? <CloseOutlined /> : <CommentOutlined />}
            onClick={() => setShowCommentPanel(!showCommentPanel)}
          />
        </div>

        {showCommentPanel && (
          <div className={styles.panelContent}>
            {comments.length === 0 ? (
              <Empty 
                description="暂无评论" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <>
                {/* 未解决的评论 */}
                {unresolvedComments.length > 0 && (
                  <div className={styles.commentSection}>
                    <div className={styles.sectionTitle}>
                      待处理 ({unresolvedComments.length})
                    </div>
                    <List
                      dataSource={unresolvedComments}
                      renderItem={comment => (
                        <div key={comment.id} className={styles.commentItem}>
                          <div className={styles.commentHeader}>
                            <Space>
                              <Avatar size="small" icon={<UserOutlined />}>
                                {comment.userName.charAt(0)}
                              </Avatar>
                              <span className={styles.userName}>{comment.userName}</span>
                              <span className={styles.commentTime}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </Space>
                            {!readOnly && (
                              <Dropdown
                                menu={{
                                  items: [
                                    {
                                      key: 'resolve',
                                      icon: <CheckOutlined />,
                                      label: '标记为已解决',
                                      onClick: () => handleResolveComment(comment.id)
                                    },
                                    {
                                      key: 'delete',
                                      icon: <DeleteOutlined />,
                                      label: '删除',
                                      danger: true,
                                      onClick: () => handleDeleteComment(comment.id)
                                    }
                                  ]
                                }}
                              >
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                              </Dropdown>
                            )}
                          </div>
                          
                          {comment.position.selectedText && (
                            <div className={styles.quotedText}>
                              "{comment.position.selectedText}"
                            </div>
                          )}
                          
                          <div className={styles.commentContent}>
                            {comment.content}
                          </div>

                          {/* 回复列表 */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className={styles.replies}>
                              {comment.replies.map(reply => (
                                <div key={reply.id} className={styles.replyItem}>
                                  <Space>
                                    <Avatar size="small" icon={<UserOutlined />}>
                                      {reply.userName.charAt(0)}
                                    </Avatar>
                                    <span className={styles.userName}>{reply.userName}</span>
                                  </Space>
                                  <div className={styles.replyContent}>
                                    {reply.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 回复输入 */}
                          {!readOnly && (
                            <div className={styles.replyInput}>
                              {activeComment?.id === comment.id ? (
                                <Space.Compact style={{ width: '100%' }}>
                                  <Input
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    placeholder="输入回复..."
                                    onPressEnter={() => handleReplyComment(comment.id)}
                                  />
                                  <Button 
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={() => handleReplyComment(comment.id)}
                                  />
                                </Space.Compact>
                              ) : (
                                <Button
                                  type="text"
                                  size="small"
                                  onClick={() => setActiveComment(comment)}
                                >
                                  回复
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}

                {/* 已解决的评论 */}
                {resolvedComments.length > 0 && (
                  <div className={styles.commentSection}>
                    <div className={styles.sectionTitle}>
                      已解决 ({resolvedComments.length})
                    </div>
                    <List
                      dataSource={resolvedComments}
                      renderItem={comment => (
                        <div key={comment.id} className={`${styles.commentItem} ${styles.resolved}`}>
                          <div className={styles.commentHeader}>
                            <Space>
                              <Avatar size="small" icon={<UserOutlined />}>
                                {comment.userName.charAt(0)}
                              </Avatar>
                              <span className={styles.userName}>{comment.userName}</span>
                              <Tag color="success" icon={<CheckOutlined />}>已解决</Tag>
                            </Space>
                          </div>
                          <div className={styles.commentContent}>
                            {comment.content}
                          </div>
                        </div>
                      )}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 批注列表 */}
        {annotations.length > 0 && (
          <div className={styles.annotationSection}>
            <div className={styles.sectionTitle}>
              <PushpinOutlined /> 批注 ({annotations.length})
            </div>
            <List
              dataSource={annotations}
              renderItem={annotation => (
                <div 
                  key={annotation.id} 
                  className={styles.annotationItem}
                  style={{ borderLeftColor: ANNOTATION_COLORS.find(c => c.value === annotation.color)?.border }}
                >
                  <div className={styles.annotationHeader}>
                    <Space>
                      <div 
                        className={styles.annotationColor}
                        style={{ backgroundColor: annotation.color }}
                      />
                      <span className={styles.userName}>{annotation.userName}</span>
                    </Space>
                    {!readOnly && (
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteAnnotation(annotation.id)}
                      />
                    )}
                  </div>
                  <div className={styles.annotationText}>
                    "{annotation.position.selectedText}"
                  </div>
                  {annotation.content && (
                    <div className={styles.annotationNote}>
                      {annotation.content}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.editorArea}>
        {renderAnnotatedContent()}
        {renderSelectionToolbar()}
      </div>
      {renderCommentPanel()}
      {renderCommentInput()}
      {renderAnnotationPicker()}
    </div>
  )
}

export default InlineComment