/**
 * 任务评论/讨论组件
 * 支持嵌套回复、@提及、附件等功能
 */

import { useState, useEffect, useRef } from 'react'
import {
  Card,
  Avatar,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Empty,
  Spin,
  Upload,
  Mentions
} from 'antd'
import {
  CommentOutlined,
  SendOutlined,
  LikeOutlined,
  LikeFilled,
  DeleteOutlined,
  PaperClipOutlined,
  UserOutlined,
  ReloadOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { taskCommentApi } from '@/services/api'
import type { TaskComment } from '@/services/api/taskComment'
import styles from './index.module.css'

const { TextArea } = Input
const { Option } = Mentions

interface TaskCommentsProps {
  taskId: number
  currentUserId?: number
  projectMembers?: Array<{ id: number; name: string; avatar?: string }>
  onCommentChange?: () => void
}

const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  currentUserId,
  projectMembers = [],
  onCommentChange
}) => {
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<TaskComment | null>(null)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploadingAttachments, setUploadingAttachments] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mentionsRef = useRef<any>(null)

  useEffect(() => {
    loadComments()
  }, [taskId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await taskCommentApi.getCommentsByTaskId(taskId)
      setComments(data || [])
    } catch (error) {
      console.error('Load comments error:', error)
      message.error('加载评论失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('请输入评论内容')
      return
    }

    setSubmitting(true)
    try {
      // 创建评论
      const comment = await taskCommentApi.createTaskComment({
        taskId,
        content: content.trim(),
        parentId: replyTo?.id
      })
      
      // 如果有待上传的附件，上传附件
      if (pendingAttachments.length > 0) {
        setUploadingAttachments(true)
        for (const file of pendingAttachments) {
          try {
            await taskCommentApi.uploadCommentAttachment(comment.id, file)
          } catch (error) {
            console.error('Upload attachment error:', error)
            message.warning(`附件 ${file.name} 上传失败`)
          }
        }
        setUploadingAttachments(false)
      }
      
      message.success('评论已发送')
      setContent('')
      setReplyTo(null)
      setFileList([])
      setPendingAttachments([])
      loadComments()
      onCommentChange?.()
    } catch (error) {
      console.error('Submit comment error:', error)
      message.error('发送失败')
    } finally {
      setSubmitting(false)
      setUploadingAttachments(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    try {
      await taskCommentApi.deleteTaskComment(commentId)
      message.success('评论已删除')
      loadComments()
      onCommentChange?.()
    } catch (error) {
      console.error('Delete comment error:', error)
      message.error('删除失败')
    }
  }

  const handleLike = async (comment: TaskComment) => {
    try {
      if (comment.liked) {
        await taskCommentApi.unlikeComment(comment.id)
      } else {
        await taskCommentApi.likeComment(comment.id)
      }
      loadComments()
    } catch (error) {
      console.error('Like comment error:', error)
    }
  }

  const handleReply = (comment: TaskComment) => {
    setReplyTo(comment)
    setContent(`@${comment.userName} `)
    // Focus on mentions input
    setTimeout(() => {
      mentionsRef.current?.focus()
    }, 100)
  }

  // 处理附件选择
  const handleFileSelect: UploadProps['beforeUpload'] = (file) => {
    // 检查文件大小（限制 10MB）
    if (file.size > 10 * 1024 * 1024) {
      message.error(`文件 ${file.name} 超过 10MB 限制`)
      return Upload.LIST_IGNORE
    }
    
    // 添加到待上传列表
    setPendingAttachments(prev => [...prev, file])
    return false // 阻止自动上传
  }

  // 处理附件移除
  const handleFileRemove = (file: UploadFile) => {
    setPendingAttachments(prev =>
      prev.filter(f => f.name !== file.name)
    )
  }

  const cancelReply = () => {
    setReplyTo(null)
    setContent('')
  }

  const formatTime = (time: string): string => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  // 解析评论内容中的@提及
  const renderContent = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const parts = text.split(mentionRegex)
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // 这是@提及的用户名
        return (
          <Tag key={index} color="blue" style={{ margin: '0 2px' }}>
            @{part}
          </Tag>
        )
      }
      return part
    })
  }

  const renderComment = (comment: TaskComment, isReply = false) => (
    <div className={`${styles.commentItem} ${isReply ? styles.replyItem : ''}`} key={comment.id}>
      <div className={styles.commentHeader}>
        <Avatar
          size={isReply ? 28 : 36}
          src={comment.userAvatar}
          icon={<UserOutlined />}
        />
        <div className={styles.commentInfo}>
          <span className={styles.authorName}>{comment.userName}</span>
          <span className={styles.commentTime}>{formatTime(comment.createdAt || '')}</span>
        </div>
      </div>
      
      <div className={styles.commentContent}>
        {renderContent(comment.content)}
      </div>

      {/* 附件 */}
      {comment.attachments && comment.attachments.length > 0 && (
        <div className={styles.attachments}>
          {comment.attachments.map((att, idx) => (
            <a key={idx} href={att.fileUrl} target="_blank" rel="noopener noreferrer">
              <PaperClipOutlined /> {att.fileName}
            </a>
          ))}
        </div>
      )}

      <div className={styles.commentActions}>
        <Space size="middle">
          <Tooltip title={comment.liked ? '取消点赞' : '点赞'}>
            <Button
              type="text"
              size="small"
              icon={comment.liked ? <LikeFilled style={{ color: '#1677ff' }} /> : <LikeOutlined />}
              onClick={() => handleLike(comment)}
            >
              {comment.likeCount || 0}
            </Button>
          </Tooltip>
          
          <Button
            type="text"
            size="small"
            onClick={() => handleReply(comment)}
          >
            回复
          </Button>
          
          {currentUserId === comment.userId && (
            <Popconfirm
              title="确定删除此评论？"
              onConfirm={() => handleDelete(comment.id)}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      </div>

      {/* 嵌套回复 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <CommentOutlined />
            <span>讨论</span>
            <Tag>{comments.length}</Tag>
          </Space>
        }
        extra={
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={loadComments}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        {/* 评论输入区 */}
        <div className={styles.inputArea}>
          {replyTo && (
            <div className={styles.replyHint}>
              回复 <Tag>{replyTo.userName}</Tag>
              <Button type="link" size="small" onClick={cancelReply}>
                取消
              </Button>
            </div>
          )}
          
          <div className={styles.inputWrapper}>
            {projectMembers.length > 0 ? (
              <Mentions
                ref={mentionsRef}
                value={content}
                onChange={setContent}
                placeholder="输入评论内容，使用 @ 提及成员..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                maxLength={1000}
                style={{ width: '100%' }}
              >
                {projectMembers.map(member => (
                  <Option key={String(member.id)} value={member.name}>
                    <Space>
                      <Avatar size="small" src={member.avatar} icon={<UserOutlined />} />
                      {member.name}
                    </Space>
                  </Option>
                ))}
              </Mentions>
            ) : (
              <TextArea
                ref={inputRef as any}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入评论内容，使用 @ 提及成员..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                maxLength={1000}
                showCount
              />
            )}
            
            {/* 附件预览 */}
            {pendingAttachments.length > 0 && (
              <div className={styles.pendingAttachments}>
                {pendingAttachments.map((file, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => setPendingAttachments(prev => prev.filter((_, i) => i !== index))}
                  >
                    <PaperClipOutlined /> {file.name}
                  </Tag>
                ))}
              </div>
            )}
            
            <div className={styles.inputActions}>
              <Space>
                <Upload
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={handleFileSelect}
                  onRemove={handleFileRemove}
                  maxCount={3}
                  showUploadList={false}
                >
                  <Button
                    type="text"
                    icon={uploadingAttachments ? <LoadingOutlined /> : <PaperClipOutlined />}
                    size="small"
                    disabled={pendingAttachments.length >= 3}
                  >
                    附件 {pendingAttachments.length > 0 && `(${pendingAttachments.length})`}
                  </Button>
                </Upload>
              </Space>
              
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                loading={submitting || uploadingAttachments}
                disabled={!content.trim()}
              >
                {uploadingAttachments ? '上传中...' : '发送'}
              </Button>
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        <div className={styles.commentList}>
          {loading ? (
            <div className={styles.loading}>
              <Spin />
            </div>
          ) : comments.length > 0 ? (
            comments.map(comment => renderComment(comment))
          ) : (
            <Empty description="暂无评论" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Card>
    </div>
  )
}

export default TaskComments