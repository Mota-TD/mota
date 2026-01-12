/**
 * TaskDetail 组件
 * 任务详情展示，支持抽屉模式和页面模式
 */

import React, { useState } from 'react'
import {
  Drawer,
  Tabs,
  Tag,
  Button,
  Progress,
  Spin,
  Empty,
  Dropdown,
  Modal,
  Input,
  Checkbox,
  Upload,
  message,
  Tooltip,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  CommentOutlined,
  PaperClipOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { TaskDetailProps, TaskDetailTab } from './types'
import { DEFAULT_TABS } from './types'
import { useTaskDetail, useTaskProgress, useTotalTimeSpent } from './useTaskDetail'
import { TaskStatus, TASK_STATUS_CONFIG, PRIORITY_CONFIG } from '../../types'
import styles from './index.module.css'

/**
 * 概览 Tab 内容
 */
const OverviewTab: React.FC<{
  task: NonNullable<ReturnType<typeof useTaskDetail>['data']['task']>
  subtasks: ReturnType<typeof useTaskDetail>['data']['subtasks']
}> = ({ task, subtasks }) => {
  const progress = useTaskProgress(subtasks)
  const statusConfig = TASK_STATUS_CONFIG[task.status as TaskStatus]
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  return (
    <div className={styles.tabContent}>
      {/* 描述 */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionTitle}>
          <InfoCircleOutlined className={styles.sectionIcon} />
          任务描述
        </div>
        <div className={task.description ? styles.description : styles.emptyDescription}>
          {task.description || '暂无描述'}
        </div>
      </div>

      {/* 进度 */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>任务进度</span>
          <span className={styles.progressValue}>{task.progress}%</span>
        </div>
        <Progress percent={task.progress} showInfo={false} />
      </div>

      {/* 基本信息 */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionTitle}>
          <InfoCircleOutlined className={styles.sectionIcon} />
          基本信息
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>状态</span>
            <span className={styles.infoValue}>
              <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>优先级</span>
            <span className={styles.infoValue}>
              <Tag color={priorityConfig?.color}>{priorityConfig?.label}</Tag>
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>负责人</span>
            <span className={styles.infoValue}>
              {task.assigneeName || '-'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>所属项目</span>
            <span className={styles.infoValue}>
              {task.projectName || '-'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>开始日期</span>
            <span className={styles.infoValue}>{formatDate(task.startDate)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>截止日期</span>
            <span className={styles.infoValue}>{formatDate(task.endDate)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>创建时间</span>
            <span className={styles.infoValue}>{formatDate(task.createdAt)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>更新时间</span>
            <span className={styles.infoValue}>{formatDate(task.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* 子任务进度 */}
      {subtasks.length > 0 && (
        <div className={styles.overviewSection}>
          <div className={styles.sectionTitle}>
            <UnorderedListOutlined className={styles.sectionIcon} />
            子任务进度
          </div>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              {subtasks.filter(s => s.completed).length} / {subtasks.length} 已完成
            </span>
            <span className={styles.progressValue}>{progress}%</span>
          </div>
          <Progress percent={progress} showInfo={false} status="active" />
        </div>
      )}
    </div>
  )
}

/**
 * 子任务 Tab 内容
 */
const SubtasksTab: React.FC<{
  subtasks: ReturnType<typeof useTaskDetail>['data']['subtasks']
  actions: ReturnType<typeof useTaskDetail>['subtaskActions']
}> = ({ subtasks, actions }) => {
  const [newSubtaskName, setNewSubtaskName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (!newSubtaskName.trim()) return
    await actions.add(newSubtaskName.trim())
    setNewSubtaskName('')
    setIsAdding(false)
    message.success('子任务已添加')
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.subtaskList}>
        {subtasks.map((subtask) => (
          <div key={subtask.id} className={styles.subtaskItem}>
            <Checkbox
              checked={subtask.completed}
              onChange={() => actions.toggle(subtask.id)}
              className={styles.subtaskCheckbox}
            />
            <span className={`${styles.subtaskName} ${subtask.completed ? styles.completed : ''}`}>
              {subtask.name}
            </span>
            <div className={styles.subtaskActions}>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => actions.delete(subtask.id)}
              />
            </div>
          </div>
        ))}

        {isAdding ? (
          <div className={styles.subtaskItem}>
            <Input
              placeholder="输入子任务名称"
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              onPressEnter={handleAdd}
              autoFocus
              suffix={
                <Button type="link" size="small" onClick={handleAdd}>
                  添加
                </Button>
              }
            />
          </div>
        ) : (
          <div className={styles.addSubtask} onClick={() => setIsAdding(true)}>
            <PlusOutlined />
            <span>添加子任务</span>
          </div>
        )}
      </div>

      {subtasks.length === 0 && !isAdding && (
        <Empty description="暂无子任务" />
      )}
    </div>
  )
}

/**
 * 评论 Tab 内容
 */
const CommentsTab: React.FC<{
  comments: ReturnType<typeof useTaskDetail>['data']['comments']
  actions: ReturnType<typeof useTaskDetail>['commentActions']
}> = ({ comments, actions }) => {
  const [newComment, setNewComment] = useState('')

  const handleAdd = async () => {
    if (!newComment.trim()) return
    await actions.add(newComment.trim())
    setNewComment('')
    message.success('评论已发布')
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.commentList}>
        {comments.map((comment) => (
          <div key={comment.id} className={styles.commentItem}>
            <div className={styles.commentAvatar}>
              {comment.userAvatar ? (
                <img src={comment.userAvatar} alt={comment.userName} />
              ) : (
                <UserOutlined />
              )}
            </div>
            <div className={styles.commentContent}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>{comment.userName}</span>
                <span className={styles.commentTime}>{formatTime(comment.createdAt)}</span>
              </div>
              <div className={styles.commentText}>{comment.content}</div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <Empty description="暂无评论" />
      )}

      <div className={styles.commentInput}>
        <Input.TextArea
          placeholder="输入评论..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
        />
        <Button type="primary" onClick={handleAdd} disabled={!newComment.trim()}>
          发布
        </Button>
      </div>
    </div>
  )
}

/**
 * 附件 Tab 内容
 */
const AttachmentsTab: React.FC<{
  attachments: ReturnType<typeof useTaskDetail>['data']['attachments']
  actions: ReturnType<typeof useTaskDetail>['attachmentActions']
}> = ({ attachments, actions }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    return '📎'
  }

  return (
    <div className={styles.tabContent}>
      <Upload.Dragger
        showUploadList={false}
        beforeUpload={(file) => {
          actions.upload(file)
          return false
        }}
        className={styles.uploadArea}
      >
        <p className={styles.uploadIcon}>
          <UploadOutlined />
        </p>
        <p className={styles.uploadText}>点击或拖拽文件到此处上传</p>
      </Upload.Dragger>

      <div className={styles.attachmentList} style={{ marginTop: 16 }}>
        {attachments.map((attachment) => (
          <div key={attachment.id} className={styles.attachmentItem}>
            <div className={styles.attachmentIcon}>
              {getFileIcon(attachment.fileType)}
            </div>
            <div className={styles.attachmentInfo}>
              <div className={styles.attachmentName}>{attachment.fileName}</div>
              <div className={styles.attachmentMeta}>
                {formatFileSize(attachment.fileSize)} · {new Date(attachment.uploadedAt).toLocaleDateString('zh-CN')}
              </div>
            </div>
            <div className={styles.attachmentActions}>
              <Tooltip title="下载">
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => actions.download(attachment.id)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => actions.delete(attachment.id)}
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      {attachments.length === 0 && (
        <Empty description="暂无附件" style={{ marginTop: 24 }} />
      )}
    </div>
  )
}

/**
 * 工时 Tab 内容
 */
const TimeLogsTab: React.FC<{
  timeLogs: ReturnType<typeof useTaskDetail>['data']['timeLogs']
  actions: ReturnType<typeof useTaskDetail>['timeLogActions']
}> = ({ timeLogs, actions }) => {
  const { hours, minutes } = useTotalTimeSpent(timeLogs)

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h > 0) return `${h}小时${m > 0 ? ` ${m}分钟` : ''}`
    return `${m}分钟`
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.timeLogSummary}>
        <span className={styles.summaryLabel}>总工时</span>
        <span className={styles.summaryValue}>
          {hours > 0 ? `${hours}小时` : ''}{minutes > 0 ? ` ${minutes}分钟` : hours === 0 ? '0分钟' : ''}
        </span>
      </div>

      <div className={styles.timeLogList}>
        {timeLogs.map((log) => (
          <div key={log.id} className={styles.timeLogItem}>
            <div className={styles.timeLogIcon}>
              <ClockCircleOutlined />
            </div>
            <div className={styles.timeLogContent}>
              <div className={styles.timeLogHeader}>
                <span className={styles.timeLogDuration}>{formatDuration(log.duration)}</span>
                <span className={styles.timeLogDate}>
                  {new Date(log.startTime).toLocaleDateString('zh-CN')}
                </span>
              </div>
              {log.description && (
                <div className={styles.timeLogDescription}>{log.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {timeLogs.length === 0 && (
        <Empty description="暂无工时记录" />
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        style={{ width: '100%', marginTop: 16 }}
        onClick={() => {
          // TODO: 打开添加工时对话框
          message.info('添加工时功能开发中')
        }}
      >
        记录工时
      </Button>
    </div>
  )
}

/**
 * TaskDetail 主组件
 */
const TaskDetail: React.FC<TaskDetailProps> = ({
  taskId,
  task: propTask,
  asDrawer = false,
  visible = true,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  readonly = false,
  className,
  style,
}) => {
  const {
    data,
    activeTab,
    setActiveTab,
    refresh,
    updateStatus,
    deleteTask,
    subtaskActions,
    commentActions,
    attachmentActions,
    timeLogActions,
    saving,
  } = useTaskDetail({ taskId, task: propTask })

  const { task, subtasks, comments, attachments, timeLogs, loading, error } = data

  // 删除确认
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个任务吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await deleteTask()
        onDelete?.(taskId)
        onClose?.()
        message.success('任务已删除')
      },
    })
  }

  // 状态变更菜单
  const statusMenuItems: MenuProps['items'] = Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => ({
    key: status,
    label: config.label,
    onClick: async () => {
      await updateStatus(status as TaskStatus)
      onStatusChange?.(taskId, status)
      message.success('状态已更新')
    },
  }))

  // 更多操作菜单
  const moreMenuItems: MenuProps['items'] = [
    { key: 'refresh', label: '刷新', onClick: refresh },
    { type: 'divider' },
    { key: 'delete', label: '删除', danger: true, onClick: handleDelete },
  ]

  // Tab 图标映射
  const tabIcons: Record<TaskDetailTab, React.ReactNode> = {
    overview: <InfoCircleOutlined />,
    subtasks: <UnorderedListOutlined />,
    comments: <CommentOutlined />,
    attachments: <PaperClipOutlined />,
    timeLogs: <ClockCircleOutlined />,
    history: <HistoryOutlined />,
  }

  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <Spin size="large" tip="加载中..." />
        </div>
      )
    }

    if (error) {
      return <Empty description={error} />
    }

    if (!task) {
      return <Empty description="任务不存在" />
    }

    const statusConfig = TASK_STATUS_CONFIG[task.status as TaskStatus]

    return (
      <div className={styles.taskDetail}>
        {/* 头部 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.taskTitle}>
              <h2 className={styles.titleText}>{task.name}</h2>
              <Tag color={statusConfig?.color} className={styles.statusTag}>
                {statusConfig?.label}
              </Tag>
            </div>
            <div className={styles.taskMeta}>
              <span className={styles.metaItem}>
                <UserOutlined />
                {task.assigneeName || '未分配'}
              </span>
              <span className={styles.metaItem}>
                <CalendarOutlined />
                {task.endDate ? new Date(task.endDate).toLocaleDateString('zh-CN') : '无截止日期'}
              </span>
              <span className={styles.metaItem}>
                <FlagOutlined />
                {PRIORITY_CONFIG[task.priority]?.label || task.priority}
              </span>
            </div>
          </div>
          {!readonly && (
            <div className={styles.headerRight}>
              <Dropdown menu={{ items: statusMenuItems }} trigger={['click']}>
                <Button>更改状态</Button>
              </Dropdown>
              <Button icon={<EditOutlined />} onClick={() => onEdit?.(task)}>
                编辑
              </Button>
              <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            </div>
          )}
        </div>

        {/* Tab 内容 */}
        <div className={styles.content}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TaskDetailTab)}
            items={DEFAULT_TABS.map((tab) => ({
              key: tab.key,
              label: (
                <span>
                  {tabIcons[tab.key]}
                  <span style={{ marginLeft: 4 }}>{tab.label}</span>
                  {tab.key === 'subtasks' && subtasks.length > 0 && (
                    <Tag style={{ marginLeft: 4 }}>{subtasks.length}</Tag>
                  )}
                  {tab.key === 'comments' && comments.length > 0 && (
                    <Tag style={{ marginLeft: 4 }}>{comments.length}</Tag>
                  )}
                  {tab.key === 'attachments' && attachments.length > 0 && (
                    <Tag style={{ marginLeft: 4 }}>{attachments.length}</Tag>
                  )}
                </span>
              ),
              children: (
                <>
                  {tab.key === 'overview' && <OverviewTab task={task} subtasks={subtasks} />}
                  {tab.key === 'subtasks' && <SubtasksTab subtasks={subtasks} actions={subtaskActions} />}
                  {tab.key === 'comments' && <CommentsTab comments={comments} actions={commentActions} />}
                  {tab.key === 'attachments' && <AttachmentsTab attachments={attachments} actions={attachmentActions} />}
                  {tab.key === 'timeLogs' && <TimeLogsTab timeLogs={timeLogs} actions={timeLogActions} />}
                  {tab.key === 'history' && (
                    <div className={styles.tabContent}>
                      <Empty description="历史记录功能开发中" />
                    </div>
                  )}
                </>
              ),
            }))}
          />
        </div>
      </div>
    )
  }

  // 抽屉模式
  if (asDrawer) {
    return (
      <Drawer
        open={visible}
        onClose={onClose}
        width={640}
        title={null}
        closable
        className={styles.taskDetailDrawer}
        styles={{ body: { padding: 0 } }}
      >
        {renderContent()}
      </Drawer>
    )
  }

  // 页面模式
  return (
    <div className={`${styles.taskDetail} ${className || ''}`} style={style}>
      {renderContent()}
    </div>
  )
}

export default TaskDetail
export type { TaskDetailProps } from './types'
export { useTaskDetail, useTaskProgress, useTotalTimeSpent } from './useTaskDetail'