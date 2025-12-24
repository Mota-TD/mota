/**
 * 工作计划审批组件
 * 用于项目经理审批部门工作计划
 */

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  message,
  Descriptions,
  List,
  Empty,
  Badge,
  Tooltip
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { workPlanApi } from '@/services/api'
import type { WorkPlan, WorkPlanAttachment, WorkPlanStatus } from '@/services/api/workPlan'
import styles from './index.module.css'

const { TextArea } = Input

interface WorkPlanApprovalProps {
  projectId: number
  onApprovalComplete?: () => void
}

const WorkPlanApproval: React.FC<WorkPlanApprovalProps> = ({
  projectId,
  onApprovalComplete
}) => {
  const [loading, setLoading] = useState(false)
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<WorkPlan | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [approveVisible, setApproveVisible] = useState(false)
  const [rejectVisible, setRejectVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadWorkPlans()
  }, [projectId])

  const loadWorkPlans = async () => {
    setLoading(true)
    try {
      const data = await workPlanApi.getWorkPlansByProject(projectId)
      setWorkPlans(data)
    } catch (error) {
      console.error('Load work plans error:', error)
      message.error('加载工作计划列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (plan: WorkPlan) => {
    setSelectedPlan(plan)
    setDetailVisible(true)
  }

  const handleApprove = (plan: WorkPlan) => {
    setSelectedPlan(plan)
    form.resetFields()
    setApproveVisible(true)
  }

  const handleReject = (plan: WorkPlan) => {
    setSelectedPlan(plan)
    form.resetFields()
    setRejectVisible(true)
  }

  const confirmApprove = async () => {
    if (!selectedPlan) return

    try {
      const values = await form.validateFields()
      setSubmitting(true)
      
      await workPlanApi.approveWorkPlan(selectedPlan.id, {
        approved: true,
        comment: values.comment
      })
      
      message.success('工作计划已批准')
      setApproveVisible(false)
      loadWorkPlans()
      onApprovalComplete?.()
    } catch (error) {
      console.error('Approve error:', error)
      message.error('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmReject = async () => {
    if (!selectedPlan) return

    try {
      const values = await form.validateFields()
      setSubmitting(true)
      
      await workPlanApi.approveWorkPlan(selectedPlan.id, {
        approved: false,
        comment: values.comment
      })
      
      message.success('工作计划已驳回')
      setRejectVisible(false)
      loadWorkPlans()
      onApprovalComplete?.()
    } catch (error) {
      console.error('Reject error:', error)
      message.error('操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: WorkPlanStatus) => {
    const statusConfig: Record<WorkPlanStatus, { status: 'default' | 'processing' | 'success' | 'error' | 'warning'; text: string }> = {
      draft: { status: 'default', text: '草稿' },
      submitted: { status: 'processing', text: '待审批' },
      approved: { status: 'success', text: '已批准' },
      rejected: { status: 'error', text: '已驳回' }
    }
    const config = statusConfig[status] || { status: 'default', text: status }
    return <Badge status={config.status} text={config.text} />
  }

  const columns: ColumnsType<WorkPlan> = [
    {
      title: '部门任务',
      dataIndex: 'departmentTaskName',
      key: 'departmentTaskName',
      width: 200,
      ellipsis: true
    },
    {
      title: '提交人',
      dataIndex: 'submitterName',
      key: 'submitterName',
      width: 120,
      render: (name: string) => (
        <Space>
          <UserOutlined />
          {name || '-'}
        </Space>
      )
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 160,
      render: (time: string) => (
        time ? (
          <Space>
            <ClockCircleOutlined />
            {new Date(time).toLocaleString('zh-CN')}
          </Space>
        ) : '-'
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: WorkPlanStatus) => getStatusBadge(status)
    },
    {
      title: '附件数',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 80,
      align: 'center',
      render: (attachments: WorkPlanAttachment[]) => (
        <Tag>{attachments?.length || 0}</Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'submitted' && (
            <>
              <Tooltip title="批准">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="驳回">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  const pendingCount = workPlans.filter(p => p.status === 'submitted').length

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <span>工作计划审批</span>
            {pendingCount > 0 && (
              <Badge count={pendingCount} style={{ backgroundColor: '#1677ff' }} />
            )}
          </Space>
        }
        extra={
          <Button onClick={loadWorkPlans} loading={loading}>
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={workPlans}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: <Empty description="暂无工作计划" />
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="工作计划详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          selectedPlan?.status === 'submitted' && (
            <Button
              key="approve"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                setDetailVisible(false)
                handleApprove(selectedPlan!)
              }}
            >
              批准
            </Button>
          ),
          selectedPlan?.status === 'submitted' && (
            <Button
              key="reject"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setDetailVisible(false)
                handleReject(selectedPlan!)
              }}
            >
              驳回
            </Button>
          )
        ].filter(Boolean)}
        width={700}
      >
        {selectedPlan && (
          <div className={styles.detailContent}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="部门任务" span={2}>
                {selectedPlan.departmentTaskName}
              </Descriptions.Item>
              <Descriptions.Item label="提交人">
                {selectedPlan.submitterName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {selectedPlan.submittedAt 
                  ? new Date(selectedPlan.submittedAt).toLocaleString('zh-CN')
                  : '-'
                }
              </Descriptions.Item>
              <Descriptions.Item label="状态" span={2}>
                {getStatusBadge(selectedPlan.status)}
              </Descriptions.Item>
              <Descriptions.Item label="计划概述" span={2}>
                <div className={styles.summaryText}>
                  {selectedPlan.summary || '暂无概述'}
                </div>
              </Descriptions.Item>
              {selectedPlan.resourceRequirement && (
                <Descriptions.Item label="资源需求" span={2}>
                  {selectedPlan.resourceRequirement}
                </Descriptions.Item>
              )}
              {selectedPlan.reviewComment && (
                <Descriptions.Item label="审批意见" span={2}>
                  <Tag color={selectedPlan.status === 'approved' ? 'green' : 'red'}>
                    {selectedPlan.reviewComment}
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 附件列表 */}
            <div className={styles.attachmentSection}>
              <h4><FileTextOutlined /> 附件文档</h4>
              {selectedPlan.attachments && selectedPlan.attachments.length > 0 ? (
                <List
                  size="small"
                  dataSource={selectedPlan.attachments}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="download"
                          type="link"
                          icon={<DownloadOutlined />}
                          href={item.fileUrl}
                          target="_blank"
                        >
                          下载
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileTextOutlined style={{ fontSize: 20 }} />}
                        title={item.fileName}
                        description={
                          item.fileSize 
                            ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB`
                            : ''
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无附件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 批准弹窗 */}
      <Modal
        title="批准工作计划"
        open={approveVisible}
        onCancel={() => setApproveVisible(false)}
        onOk={confirmApprove}
        confirmLoading={submitting}
        okText="确认批准"
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="comment"
            label="审批意见（可选）"
          >
            <TextArea
              rows={3}
              placeholder="请输入审批意见..."
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 驳回弹窗 */}
      <Modal
        title="驳回工作计划"
        open={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        onOk={confirmReject}
        confirmLoading={submitting}
        okText="确认驳回"
        okButtonProps={{ danger: true, icon: <CloseOutlined /> }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="comment"
            label="驳回原因"
            rules={[{ required: true, message: '请输入驳回原因' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入驳回原因，以便提交人修改..."
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WorkPlanApproval