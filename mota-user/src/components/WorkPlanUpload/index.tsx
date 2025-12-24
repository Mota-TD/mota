/**
 * 工作计划上传组件
 * 用于部门负责人上传工作计划/方案
 */

import { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Space,
  Tag,
  List,
  Popconfirm,
  Spin,
  Alert
} from 'antd'
import {
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  SendOutlined,
  SaveOutlined,
  PaperClipOutlined
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { workPlanApi } from '@/services/api'
import type { WorkPlan, WorkPlanAttachment, WorkPlanStatus } from '@/services/api/workPlan'
import styles from './index.module.css'

const { TextArea } = Input

interface WorkPlanUploadProps {
  departmentTaskId: number
  requireApproval?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

const WorkPlanUpload: React.FC<WorkPlanUploadProps> = ({
  departmentTaskId,
  requireApproval = false,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [workPlan, setWorkPlan] = useState<WorkPlan | null>(null)
  const [attachments, setAttachments] = useState<WorkPlanAttachment[]>([])
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [, setUploadingFiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadWorkPlan()
  }, [departmentTaskId])

  const loadWorkPlan = async () => {
    setLoading(true)
    try {
      const plan = await workPlanApi.getWorkPlanByDepartmentTaskId(departmentTaskId)
      if (plan) {
        setWorkPlan(plan)
        form.setFieldsValue({
          summary: plan.summary,
          resourceRequirement: plan.resourceRequirement
        })
        if (plan.attachments) {
          setAttachments(plan.attachments)
        }
      }
    } catch (error) {
      console.error('Load work plan error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      if (workPlan) {
        // 更新现有工作计划
        await workPlanApi.updateWorkPlan(workPlan.id, {
          summary: values.summary,
          resourceRequirement: values.resourceRequirement
        })
        message.success('草稿已保存')
      } else {
        // 创建新工作计划
        const newPlan = await workPlanApi.createWorkPlan({
          departmentTaskId,
          summary: values.summary,
          resourceRequirement: values.resourceRequirement
        })
        setWorkPlan(newPlan)
        message.success('草稿已保存')
      }
      
      loadWorkPlan()
    } catch (error) {
      console.error('Save draft error:', error)
      message.error('保存失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let planId = workPlan?.id

      if (!planId) {
        // 先创建工作计划
        const newPlan = await workPlanApi.createWorkPlan({
          departmentTaskId,
          summary: values.summary,
          resourceRequirement: values.resourceRequirement
        })
        planId = newPlan.id
      } else {
        // 更新工作计划
        await workPlanApi.updateWorkPlan(planId, {
          summary: values.summary,
          resourceRequirement: values.resourceRequirement
        })
      }

      // 提交审批
      await workPlanApi.submitWorkPlan(planId)
      
      message.success(requireApproval ? '工作计划已提交审批' : '工作计划已提交')
      onSuccess?.()
    } catch (error) {
      console.error('Submit work plan error:', error)
      message.error('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess: uploadSuccess, onError } = options
    const uploadFile = file as File

    if (!workPlan) {
      message.warning('请先保存草稿后再上传附件')
      onError?.(new Error('请先保存草稿'))
      return
    }

    const fileId = `${uploadFile.name}-${Date.now()}`
    setUploadingFiles(prev => new Set(prev).add(fileId))

    try {
      const attachment = await workPlanApi.uploadWorkPlanAttachment(workPlan.id, uploadFile)
      setAttachments(prev => [...prev, attachment])
      uploadSuccess?.(attachment)
      message.success(`${uploadFile.name} 上传成功`)
    } catch (error) {
      console.error('Upload error:', error)
      onError?.(error as Error)
      message.error(`${uploadFile.name} 上传失败`)
    } finally {
      setUploadingFiles(prev => {
        const next = new Set(prev)
        next.delete(fileId)
        return next
      })
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!workPlan) return

    try {
      await workPlanApi.deleteWorkPlanAttachment(workPlan.id, attachmentId)
      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
      message.success('附件已删除')
    } catch (error) {
      console.error('Delete attachment error:', error)
      message.error('删除失败')
    }
  }

  const getStatusTag = (status: WorkPlanStatus) => {
    return (
      <Tag color={workPlanApi.getStatusColor(status)}>
        {workPlanApi.getStatusText(status)}
      </Tag>
    )
  }

  const isEditable = !workPlan || workPlan.status === 'draft' || workPlan.status === 'rejected'

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {workPlan && (
        <div className={styles.statusBar}>
          <span>当前状态：</span>
          {getStatusTag(workPlan.status)}
          {workPlan.status === 'rejected' && workPlan.reviewComment && (
            <Alert
              type="error"
              message="驳回原因"
              description={workPlan.reviewComment}
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        disabled={!isEditable}
      >
        <Form.Item
          name="summary"
          label="工作计划概述"
          rules={[{ required: true, message: '请输入工作计划概述' }]}
        >
          <TextArea
            rows={6}
            placeholder="请详细描述工作计划的主要内容、执行步骤、时间安排等..."
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="resourceRequirement"
          label="资源需求说明"
        >
          <TextArea
            rows={3}
            placeholder="请说明执行此计划所需的人力、预算、设备等资源..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>

      {/* 附件区域 */}
      <div className={styles.attachmentSection}>
        <div className={styles.sectionHeader}>
          <h4><PaperClipOutlined /> 工作计划文档</h4>
          {isEditable && (
            <Upload
              customRequest={handleUpload}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              showUploadList={false}
              multiple
              disabled={!workPlan}
            >
              <Button 
                icon={<UploadOutlined />} 
                disabled={!workPlan}
                title={!workPlan ? '请先保存草稿后再上传附件' : ''}
              >
                上传文件
              </Button>
            </Upload>
          )}
        </div>

        {!workPlan && isEditable && (
          <Alert
            type="info"
            message="请先保存草稿后再上传附件文件"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {attachments.length > 0 ? (
          <List
            className={styles.attachmentList}
            dataSource={attachments}
            renderItem={(item) => (
              <List.Item
                actions={isEditable ? [
                  <Popconfirm
                    key="delete"
                    title="确定删除此附件？"
                    onConfirm={() => handleDeleteAttachment(item.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                ] : []}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                  title={
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                      {item.fileName}
                    </a>
                  }
                  description={
                    item.fileSize 
                      ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB`
                      : '未知大小'
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className={styles.emptyAttachment}>
            <FileTextOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
            <p>暂无附件</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {isEditable && (
        <div className={styles.actions}>
          <Space>
            {onCancel && (
              <Button onClick={onCancel}>取消</Button>
            )}
            <Button
              icon={<SaveOutlined />}
              onClick={handleSaveDraft}
              loading={submitting}
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={submitting}
            >
              {requireApproval ? '提交审批' : '提交计划'}
            </Button>
          </Space>
        </div>
      )}
    </div>
  )
}

export default WorkPlanUpload