import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import {
  Button,
  Tag,
  Progress,
  Avatar,
  Space,
  Spin,
  message,
  Dropdown,
  Modal,
  Drawer,
  Form,
  Input,
  Slider,
  Select,
  DatePicker,
  Upload,
  List,
  Timeline,
  Tooltip,
  Divider
} from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FlagOutlined,
  SubnodeOutlined,
  SaveOutlined,
  UploadOutlined,
  RobotOutlined,
  HistoryOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileOutlined,
  LoadingOutlined,
  BulbOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getTaskDetail,
  updateTask,
  updateTaskProgressEnhanced,
  getTaskProgressHistory,
  generateAIProgressDescription,
  completeTask,
  deleteTask,
  getTaskStatusText,
  getTaskStatusColor,
  getTaskPriorityText,
  getTaskPriorityColor,
  getMilestoneById,
  TaskStatus,
  TaskPriority
} from '@/services/api/milestone'
import type { MilestoneTask, Milestone, ProgressRecord, ProgressAttachment } from '@/services/api/milestone'
import styles from './index.module.css'

const { TextArea } = Input

/**
 * 里程碑任务详情页面
 */
const MilestoneTaskDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<MilestoneTask | null>(null)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  
  // 更新进度抽屉
  const [updateProgressDrawerVisible, setUpdateProgressDrawerVisible] = useState(false)
  const [updateProgressLoading, setUpdateProgressLoading] = useState(false)
  const [progressForm] = Form.useForm()
  
  // 增强进度更新
  const [progressDescription, setProgressDescription] = useState('')
  const [progressFileList, setProgressFileList] = useState<UploadFile[]>([])
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiPolishing, setAiPolishing] = useState(false)
  
  // 进度历史
  const [progressHistoryVisible, setProgressHistoryVisible] = useState(false)
  const [progressHistory, setProgressHistory] = useState<ProgressRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  
  // 编辑任务抽屉
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm] = Form.useForm()

  useEffect(() => {
    if (id) {
      loadData(id)
    }
  }, [id])

  const loadData = async (taskId: string) => {
    setLoading(true)
    try {
      const taskRes = await getTaskDetail(taskId)
      setTask(taskRes)
      
      // 加载里程碑信息
      if (taskRes.milestoneId) {
        try {
          const milestoneRes = await getMilestoneById(taskRes.milestoneId)
          setMilestone(milestoneRes)
        } catch {
          // 忽略错误
        }
      }
    } catch (error) {
      console.error('Failed to load task:', error)
      message.error('加载任务失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载进度历史
  const loadProgressHistory = async () => {
    if (!id) return
    setHistoryLoading(true)
    try {
      const history = await getTaskProgressHistory(id)
      setProgressHistory(history || [])
    } catch (error) {
      console.error('Failed to load progress history:', error)
      message.error('加载进度历史失败')
    } finally {
      setHistoryLoading(false)
    }
  }

  // 更新进度（增强版）
  const handleUpdateProgress = async (values: { progress: number }) => {
    if (!task) return
    
    setUpdateProgressLoading(true)
    try {
      // 构建附件列表
      const attachments: ProgressAttachment[] = progressFileList
        .filter(file => file.status === 'done' && file.response?.url)
        .map(file => ({
          fileName: file.name,
          fileUrl: file.response?.url || file.url || '',
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size
        }))
      
      await updateTaskProgressEnhanced(task.id, {
        progress: values.progress,
        description: progressDescription,
        attachments: attachments.length > 0 ? attachments : undefined
      })
      
      message.success('进度更新成功')
      setUpdateProgressDrawerVisible(false)
      progressForm.resetFields()
      setProgressDescription('')
      setProgressFileList([])
      loadData(id!)
    } catch (error) {
      console.error('Update progress error:', error)
      message.error('更新失败，请重试')
    } finally {
      setUpdateProgressLoading(false)
    }
  }

  // AI生成进度描述
  const handleAIGenerate = async () => {
    if (!task) return
    
    setAiGenerating(true)
    try {
      const currentProgress = progressForm.getFieldValue('progress') || task.progress
      const response = await generateAIProgressDescription(task.id, {
        taskName: task.name,
        taskDescription: task.description,
        currentProgress: currentProgress,
        previousProgress: task.progress,
        actionType: 'generate'
      })
      
      if (response.success && response.description) {
        setProgressDescription(response.description)
        message.success('AI已生成进度描述')
      } else {
        message.error(response.errorMessage || 'AI生成失败')
      }
    } catch (error) {
      console.error('AI generate error:', error)
      message.error('AI生成失败，请重试')
    } finally {
      setAiGenerating(false)
    }
  }

  // AI润色进度描述
  const handleAIPolish = async () => {
    if (!task || !progressDescription.trim()) {
      message.warning('请先输入进度描述')
      return
    }
    
    setAiPolishing(true)
    try {
      const currentProgress = progressForm.getFieldValue('progress') || task.progress
      const response = await generateAIProgressDescription(task.id, {
        taskName: task.name,
        taskDescription: task.description,
        currentProgress: currentProgress,
        previousProgress: task.progress,
        userInput: progressDescription,
        actionType: 'polish'
      })
      
      if (response.success && response.description) {
        setProgressDescription(response.description)
        message.success('AI已润色进度描述')
      } else {
        message.error(response.errorMessage || 'AI润色失败')
      }
    } catch (error) {
      console.error('AI polish error:', error)
      message.error('AI润色失败，请重试')
    } finally {
      setAiPolishing(false)
    }
  }

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/v1/files/upload',
    headers: {
      'X-User-Id': user?.id?.toString() || ''
    },
    fileList: progressFileList,
    onChange(info) {
      setProgressFileList(info.fileList)
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    },
    onRemove(file) {
      setProgressFileList(prev => prev.filter(f => f.uid !== file.uid))
    },
    beforeUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('文件大小不能超过10MB')
        return false
      }
      return true
    }
  }

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImageOutlined />
    if (fileType.includes('pdf')) return <FilePdfOutlined />
    if (fileType.includes('word') || fileType.includes('document')) return <FileWordOutlined />
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileExcelOutlined />
    return <FileOutlined />
  }

  // 解析附件JSON
  const parseAttachments = (attachmentsJson?: string): ProgressAttachment[] => {
    if (!attachmentsJson) return []
    try {
      return JSON.parse(attachmentsJson)
    } catch {
      return []
    }
  }

  // 完成任务
  const handleCompleteTask = async () => {
    if (!task) return
    
    Modal.confirm({
      title: '确认完成',
      content: '确认将此任务标记为已完成吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await completeTask(task.id)
          message.success('任务已完成')
          loadData(id!)
        } catch {
          message.error('操作失败')
        }
      }
    })
  }

  // 删除任务
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确认删除此任务吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTask(id!)
          message.success('任务已删除')
          navigate(-1)
        } catch {
          message.error('删除失败')
        }
      }
    })
  }

  // 打开编辑抽屉
  const handleOpenEdit = () => {
    if (task) {
      editForm.setFieldsValue({
        name: task.name,
        description: task.description,
        priority: task.priority,
        status: task.status,
        startDate: task.startDate ? dayjs(task.startDate) : null,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null
      })
      setEditDrawerVisible(true)
    }
  }

  // 保存编辑
  const handleSaveEdit = async (values: {
    name: string
    description?: string
    priority: string
    status: string
    startDate?: dayjs.Dayjs
    dueDate?: dayjs.Dayjs
  }) => {
    if (!task) return
    
    setEditLoading(true)
    try {
      await updateTask(task.id, {
        name: values.name,
        description: values.description,
        priority: values.priority as TaskPriority,
        status: values.status as TaskStatus,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined
      })
      message.success('任务更新成功')
      setEditDrawerVisible(false)
      loadData(id!)
    } catch (error) {
      console.error('Update task error:', error)
      message.error('更新失败，请重试')
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>任务不存在</h2>
          <Button type="primary" onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 任务头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ marginRight: 8 }}
          />
          <div className={styles.taskIcon}>
            <FlagOutlined />
          </div>
          <div className={styles.taskInfo}>
            <div className={styles.taskTitle}>
              <h1 className={styles.taskName}>{task.name}</h1>
              <Tag color={getTaskStatusColor(task.status)}>{getTaskStatusText(task.status)}</Tag>
              <Tag color={getTaskPriorityColor(task.priority)}>{getTaskPriorityText(task.priority)}</Tag>
              <Tag color="orange">里程碑任务</Tag>
            </div>
            <p className={styles.taskDesc}>{task.description || '暂无描述'}</p>
            <div className={styles.taskMeta}>
              <span>
                <UserOutlined /> 
                {task.assigneeName ? (
                  <Space>
                    <Avatar size="small" src={task.assigneeAvatar}>{task.assigneeName?.charAt(0)}</Avatar>
                    {task.assigneeName}
                  </Space>
                ) : '未分配'}
              </span>
              <span><CalendarOutlined /> {task.startDate || '-'} ~ {task.dueDate || '-'}</span>
              {milestone && (
                <span>
                  <FlagOutlined /> 
                  <a onClick={() => navigate(`/projects/${milestone.projectId}`)}>
                    {milestone.name}
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
        <Space>
          {task.status !== TaskStatus.COMPLETED && (
            <>
              <Button 
                icon={<RiseOutlined />}
                onClick={() => {
                  progressForm.setFieldValue('progress', task.progress)
                  setUpdateProgressDrawerVisible(true)
                }}
              >
                更新进度
              </Button>
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleCompleteTask}
              >
                完成任务
              </Button>
            </>
          )}
          <Button icon={<EditOutlined />} onClick={handleOpenEdit}>
            编辑
          </Button>
          <Dropdown
            menu={{
              items: [
                { type: 'divider' },
                { key: 'delete', label: '删除任务', danger: true, onClick: handleDelete }
              ]
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* 主内容区 */}
      <div className={styles.contentGrid}>
        <div className={styles.mainContent}>
          {/* 进度卡片 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>任务进度</h3>
            </div>
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>当前进度</span>
                <span className={styles.progressValue}>{task.progress}%</span>
              </div>
              <Progress
                percent={task.progress}
                showInfo={false}
                strokeColor={{
                  '0%': '#fa8c16',
                  '100%': '#faad14',
                }}
                size={{ height: 12 }}
              />
            </div>
          </div>

          {/* 子任务列表 */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <SubnodeOutlined style={{ marginRight: 8 }} />
                  子任务 ({task.subTasks.length})
                </h3>
              </div>
              <div className={styles.subtaskList}>
                {task.subTasks.map(subTask => (
                  <div 
                    key={subTask.id} 
                    className={styles.subtaskItem}
                    onClick={() => navigate(`/milestones/tasks/${subTask.id}`)}
                  >
                    <div className={styles.subtaskInfo}>
                      <span className={styles.subtaskName}>{subTask.name}</span>
                      <Tag color={getTaskStatusColor(subTask.status)} style={{ marginLeft: 8 }}>
                        {getTaskStatusText(subTask.status)}
                      </Tag>
                    </div>
                    <Progress percent={subTask.progress} size="small" style={{ width: 100 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.sideContent}>
          {/* 任务详情 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>任务详情</h3>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>状态</span>
                <span className={styles.infoValue}>
                  <Tag color={getTaskStatusColor(task.status)}>{getTaskStatusText(task.status)}</Tag>
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>优先级</span>
                <span className={styles.infoValue}>
                  <Tag color={getTaskPriorityColor(task.priority)}>{getTaskPriorityText(task.priority)}</Tag>
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>负责人</span>
                <span className={styles.infoValue}>
                  {task.assigneeName ? (
                    <Space>
                      <Avatar size="small" src={task.assigneeAvatar}>{task.assigneeName?.charAt(0)}</Avatar>
                      {task.assigneeName}
                    </Space>
                  ) : '未分配'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>开始日期</span>
                <span className={styles.infoValue}>{task.startDate || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>截止日期</span>
                <span className={styles.infoValue}>{task.dueDate || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>所属里程碑</span>
                <span className={styles.infoValue}>
                  {milestone ? (
                    <a onClick={() => navigate(`/projects/${milestone.projectId}`)}>
                      {milestone.name}
                    </a>
                  ) : task.milestoneName || '-'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>创建时间</span>
                <span className={styles.infoValue}>{task.createdAt ? dayjs(task.createdAt).format('YYYY-MM-DD HH:mm') : '-'}</span>
              </div>
              {task.completedAt && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>完成时间</span>
                  <span className={styles.infoValue}>{dayjs(task.completedAt).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>快捷操作</h3>
            </div>
            <div className={styles.quickActions}>
              <Button
                block
                icon={<RiseOutlined />}
                onClick={() => {
                  progressForm.setFieldValue('progress', task.progress)
                  setUpdateProgressDrawerVisible(true)
                }}
                disabled={task.status === TaskStatus.COMPLETED}
              >
                更新进度
              </Button>
              <Button
                block
                icon={<EditOutlined />}
                onClick={handleOpenEdit}
              >
                编辑任务
              </Button>
            </div>
          </div>

          {/* 进度历史按钮 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>进度历史</h3>
            </div>
            <Button
              block
              icon={<HistoryOutlined />}
              onClick={() => {
                setProgressHistoryVisible(true)
                loadProgressHistory()
              }}
            >
              查看进度更新历史
            </Button>
          </div>
        </div>
      </div>

      {/* 更新进度抽屉（增强版） */}
      <Drawer
        title="更新任务进度"
        placement="right"
        width={600}
        onClose={() => {
          setUpdateProgressDrawerVisible(false)
          setProgressDescription('')
          setProgressFileList([])
        }}
        open={updateProgressDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setUpdateProgressDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={updateProgressLoading} onClick={() => progressForm.submit()}>
              更新进度
            </Button>
          </div>
        }
      >
        <Form
          form={progressForm}
          layout="vertical"
          onFinish={handleUpdateProgress}
        >
          <Form.Item
            name="progress"
            label="当前进度"
            rules={[{ required: true, message: '请设置进度' }]}
          >
            <Slider 
              marks={{
                0: '0%',
                25: '25%',
                50: '50%',
                75: '75%',
                100: '100%'
              }}
            />
          </Form.Item>

          <Divider />

          <Form.Item label="进度描述">
            <div style={{ marginBottom: 8 }}>
              <Space>
                <Tooltip title="AI自动生成进度描述">
                  <Button
                    icon={aiGenerating ? <LoadingOutlined /> : <RobotOutlined />}
                    onClick={handleAIGenerate}
                    loading={aiGenerating}
                    disabled={aiPolishing}
                  >
                    AI生成
                  </Button>
                </Tooltip>
                <Tooltip title="AI润色已输入的描述">
                  <Button
                    icon={aiPolishing ? <LoadingOutlined /> : <BulbOutlined />}
                    onClick={handleAIPolish}
                    loading={aiPolishing}
                    disabled={aiGenerating || !progressDescription.trim()}
                  >
                    AI润色
                  </Button>
                </Tooltip>
              </Space>
            </div>
            <TextArea
              rows={6}
              placeholder="请输入进度描述，支持详细说明本次进度更新的内容..."
              value={progressDescription}
              onChange={(e) => setProgressDescription(e.target.value)}
            />
            <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
              支持富文本格式，可使用AI生成或润色描述
            </div>
          </Form.Item>

          <Form.Item label="上传附件（进度证明）">
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>上传文件</Button>
            </Upload>
            <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
              支持图片、文档等文件，单个文件不超过10MB
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 进度历史抽屉 */}
      <Drawer
        title="进度更新历史"
        placement="right"
        width={600}
        onClose={() => setProgressHistoryVisible(false)}
        open={progressHistoryVisible}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : progressHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无进度更新记录
          </div>
        ) : (
          <Timeline
            items={progressHistory.map((record) => {
              const attachments = parseAttachments(record.attachments)
              return {
                color: record.currentProgress >= 100 ? 'green' : 'blue',
                children: (
                  <div className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyProgress}>
                        {record.previousProgress}% → {record.currentProgress}%
                      </span>
                      <span className={styles.historyTime}>
                        {record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                      </span>
                    </div>
                    {record.description && (
                      <div 
                        className={styles.historyDescription}
                        dangerouslySetInnerHTML={{ __html: record.description }}
                      />
                    )}
                    {attachments.length > 0 && (
                      <div className={styles.historyAttachments}>
                        <div style={{ marginBottom: 4, color: '#666' }}>附件：</div>
                        <List
                          size="small"
                          dataSource={attachments}
                          renderItem={(att) => (
                            <List.Item>
                              <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                {getFileIcon(att.fileType)} {att.fileName}
                              </a>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )
              }
            })}
          />
        )}
      </Drawer>

      {/* 编辑任务抽屉 */}
      <Drawer
        title="编辑任务"
        placement="right"
        width={500}
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setEditDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={editLoading} onClick={() => editForm.submit()} icon={<SaveOutlined />}>
              保存
            </Button>
          </div>
        }
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveEdit}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select
              options={[
                { value: TaskStatus.PENDING, label: '待处理' },
                { value: TaskStatus.IN_PROGRESS, label: '进行中' },
                { value: TaskStatus.COMPLETED, label: '已完成' },
                { value: TaskStatus.CANCELLED, label: '已取消' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select
              options={[
                { value: TaskPriority.LOW, label: '低' },
                { value: TaskPriority.MEDIUM, label: '中' },
                { value: TaskPriority.HIGH, label: '高' },
                { value: TaskPriority.URGENT, label: '紧急' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="开始日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="截止日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default MilestoneTaskDetail