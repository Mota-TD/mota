/**
 * 进度报告组件
 * 用于提交和查看进度报告（日报、周报、里程碑报告等）
 */

import { useState, useEffect } from 'react'
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Avatar,
  message,
  Empty,
  Spin,
  Descriptions,
  Collapse
} from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { progressReportApi } from '@/services/api'
import type { ProgressReport, ReportType } from '@/services/api/progressReport'
import styles from './index.module.css'

const { TextArea } = Input
const { Panel } = Collapse

interface ProgressReportProps {
  taskId?: number
  projectId?: number
  onReportChange?: () => void
}

const ProgressReportComponent: React.FC<ProgressReportProps> = ({
  taskId,
  projectId,
  onReportChange
}) => {
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadReports()
  }, [taskId, projectId])

  const loadReports = async () => {
    setLoading(true)
    try {
      let data: ProgressReport[] = []
      if (taskId) {
        // 使用部门任务ID获取报告
        data = await progressReportApi.getReportsByDepartmentTaskId(taskId)
      } else if (projectId) {
        data = await progressReportApi.getReportsByProjectId(projectId)
      }
      setReports(data || [])
    } catch (error) {
      console.error('Load reports error:', error)
      message.error('加载报告失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      await progressReportApi.createProgressReport({
        projectId: projectId || 0,
        departmentTaskId: taskId,
        reportType: values.reportType,
        completedWork: values.completedWork,
        plannedWork: values.plannedWork,
        issuesRisks: values.issues,
        supportNeeded: values.supportNeeded
      })

      message.success('报告已提交')
      setModalVisible(false)
      form.resetFields()
      loadReports()
      onReportChange?.()
    } catch (error) {
      console.error('Submit report error:', error)
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetail = (report: ProgressReport) => {
    setSelectedReport(report)
    setDetailVisible(true)
  }

  const getTypeIcon = (type: ReportType) => {
    const iconMap: Record<ReportType, React.ReactNode> = {
      daily: <CalendarOutlined style={{ color: '#1677ff' }} />,
      weekly: <CalendarOutlined style={{ color: '#52c41a' }} />,
      milestone: <CheckCircleOutlined style={{ color: '#faad14' }} />,
      adhoc: <FileTextOutlined style={{ color: '#722ed1' }} />
    }
    return iconMap[type] || <FileTextOutlined />
  }

  const formatTime = (time: string): string => {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 按类型分组统计
  const typeCounts = reports.reduce((acc, r) => {
    acc[r.reportType] = (acc[r.reportType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>进度报告</span>
            <Tag>{reports.length}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Tag color="blue">日报 {typeCounts.daily || 0}</Tag>
            <Tag color="green">周报 {typeCounts.weekly || 0}</Tag>
            <Tag color="gold">里程碑 {typeCounts.milestone || 0}</Tag>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              提交报告
            </Button>
          </Space>
        }
      >
        {loading ? (
          <div className={styles.loading}>
            <Spin />
          </div>
        ) : reports.length > 0 ? (
          <List
            className={styles.reportList}
            dataSource={reports}
            renderItem={(item) => (
              <List.Item 
                className={styles.reportItem}
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(item)}
                  >
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size={40} 
                      src={item.reporterAvatar}
                      icon={<UserOutlined />}
                    />
                  }
                  title={
                    <Space>
                      {getTypeIcon(item.reportType)}
                      <span className={styles.reportTitle}>
                        {progressReportApi.getReportTypeText(item.reportType)} - {progressReportApi.formatReportPeriod(item.reportPeriodStart, item.reportPeriodEnd)}
                      </span>
                      <Tag color={progressReportApi.getReportTypeColor(item.reportType)}>
                        {progressReportApi.getReportTypeText(item.reportType)}
                      </Tag>
                      <Tag color={progressReportApi.getStatusColor(item.status)}>
                        {progressReportApi.getStatusText(item.status)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space className={styles.reportMeta}>
                      <span><UserOutlined /> {item.reporterName}</span>
                      <span><ClockCircleOutlined /> {formatTime(item.createdAt || '')}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无报告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 提交报告弹窗 */}
      <Modal
        title="提交进度报告"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="提交"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reportType"
            label="报告类型"
            rules={[{ required: true, message: '请选择报告类型' }]}
          >
            <Select placeholder="请选择报告类型">
              <Select.Option value="daily">
                <Space><CalendarOutlined /> 日报</Space>
              </Select.Option>
              <Select.Option value="weekly">
                <Space><CalendarOutlined /> 周报</Space>
              </Select.Option>
              <Select.Option value="milestone">
                <Space><CheckCircleOutlined /> 里程碑报告</Space>
              </Select.Option>
              <Select.Option value="adhoc">
                <Space><FileTextOutlined /> 临时报告</Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="报告标题"
            rules={[{ required: true, message: '请输入报告标题' }]}
          >
            <Input placeholder="请输入报告标题" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="progressPercent"
            label="当前进度"
          >
            <Select placeholder="请选择当前进度">
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(p => (
                <Select.Option key={p} value={p}>{p}%</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="completedWork"
            label="已完成工作"
          >
            <TextArea
              rows={3}
              placeholder="请描述已完成的工作内容..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="plannedWork"
            label="计划工作"
          >
            <TextArea
              rows={3}
              placeholder="请描述下一步计划的工作..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="issues"
            label="问题与风险"
          >
            <TextArea
              rows={2}
              placeholder="请描述遇到的问题或风险..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="详细内容"
          >
            <TextArea
              rows={4}
              placeholder="请输入报告详细内容..."
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 报告详情弹窗 */}
      <Modal
        title="报告详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedReport && (
          <div className={styles.reportDetail}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="报告周期" span={2}>
                {progressReportApi.formatReportPeriod(selectedReport.reportPeriodStart, selectedReport.reportPeriodEnd)}
              </Descriptions.Item>
              <Descriptions.Item label="报告类型">
                <Tag color={progressReportApi.getReportTypeColor(selectedReport.reportType)}>
                  {progressReportApi.getReportTypeText(selectedReport.reportType)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={progressReportApi.getStatusColor(selectedReport.status)}>
                  {progressReportApi.getStatusText(selectedReport.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交人">
                {selectedReport.reporterName}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {formatTime(selectedReport.createdAt || '')}
              </Descriptions.Item>
            </Descriptions>

            <Collapse defaultActiveKey={['completed', 'planned']} className={styles.reportSections}>
              {selectedReport.completedWork && (
                <Panel header="已完成工作" key="completed">
                  <div className={styles.sectionContent}>
                    {selectedReport.completedWork}
                  </div>
                </Panel>
              )}
              {selectedReport.plannedWork && (
                <Panel header="计划工作" key="planned">
                  <div className={styles.sectionContent}>
                    {selectedReport.plannedWork}
                  </div>
                </Panel>
              )}
              {selectedReport.issuesRisks && (
                <Panel header="问题与风险" key="issues">
                  <div className={styles.sectionContent}>
                    {selectedReport.issuesRisks}
                  </div>
                </Panel>
              )}
              {selectedReport.supportNeeded && (
                <Panel header="需要支持" key="support">
                  <div className={styles.sectionContent}>
                    {selectedReport.supportNeeded}
                  </div>
                </Panel>
              )}
            </Collapse>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProgressReportComponent