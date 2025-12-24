/**
 * 交付物列表组件
 * 用于展示和管理任务交付物
 */

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Upload,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Tooltip,
  Popconfirm,
  Empty
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  PlusOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { deliverableApi } from '@/services/api'
import type { Deliverable } from '@/services/api/deliverable'
import styles from './index.module.css'

const { TextArea } = Input

interface DeliverableListProps {
  taskId: number
  editable?: boolean
  onDeliverableChange?: () => void
}

const DeliverableList: React.FC<DeliverableListProps> = ({
  taskId,
  editable = false,
  onDeliverableChange
}) => {
  const [loading, setLoading] = useState(false)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [uploadVisible, setUploadVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    loadDeliverables()
  }, [taskId])

  const loadDeliverables = async () => {
    setLoading(true)
    try {
      const data = await deliverableApi.getDeliverablesByTaskId(taskId)
      setDeliverables(data || [])
    } catch (error) {
      console.error('Load deliverables error:', error)
      message.error('加载交付物失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    try {
      const values = await form.validateFields()
      
      if (fileList.length === 0) {
        message.warning('请选择要上传的文件')
        return
      }

      setUploading(true)
      const file = fileList[0].originFileObj as File
      
      await deliverableApi.uploadDeliverable(taskId, file, values.name, values.description)
      
      message.success('交付物上传成功')
      setUploadVisible(false)
      form.resetFields()
      setFileList([])
      loadDeliverables()
      onDeliverableChange?.()
    } catch (error) {
      console.error('Upload deliverable error:', error)
      message.error('上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deliverableApi.deleteDeliverable(id)
      message.success('交付物已删除')
      loadDeliverables()
      onDeliverableChange?.()
    } catch (error) {
      console.error('Delete deliverable error:', error)
      message.error('删除失败')
    }
  }

  const handlePreview = (deliverable: Deliverable) => {
    if (deliverableApi.isPreviewable(deliverable.fileType)) {
      setPreviewUrl(deliverable.fileUrl || '')
      setPreviewTitle(deliverable.name)
      setPreviewVisible(true)
    } else {
      // 不支持预览，直接下载
      window.open(deliverable.fileUrl || '', '_blank')
    }
  }

  const getFileIcon = (fileType: string) => {
    const iconName = deliverableApi.getFileTypeIcon(fileType)
    const iconMap: Record<string, React.ReactNode> = {
      'file-pdf': <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
      'file-word': <FileWordOutlined style={{ color: '#1677ff' }} />,
      'file-excel': <FileExcelOutlined style={{ color: '#52c41a' }} />,
      'file-image': <FileImageOutlined style={{ color: '#faad14' }} />,
      'file-zip': <FileZipOutlined style={{ color: '#722ed1' }} />,
      'file': <FileOutlined style={{ color: '#8c8c8c' }} />
    }
    return iconMap[iconName] || iconMap['file']
  }

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    fileList,
    onChange: ({ fileList }) => setFileList(fileList.slice(-1)),
    maxCount: 1
  }

  const columns: ColumnsType<Deliverable> = [
    {
      title: '文件',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string, record) => (
        <Space>
          {getFileIcon(record.fileType || '')}
          <span className={styles.fileName}>{name}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 100,
      render: (fileType: string) => {
        const ext = deliverableApi.getFileExtension(fileType)
        return <Tag>{ext || '未知'}</Tag>
      }
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => deliverableApi.formatFileSize(size)
    },
    {
      title: '上传人',
      dataIndex: 'uploaderName',
      key: 'uploaderName',
      width: 100
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="预览">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              href={record.fileUrl}
              target="_blank"
            />
          </Tooltip>
          {editable && (
            <Popconfirm
              title="确定删除此交付物？"
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  // 计算统计信息
  const totalSize = deliverables.reduce((sum, d) => sum + (d.fileSize || 0), 0)

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <FileOutlined />
            <span>交付物</span>
            <Tag>{deliverables.length} 个</Tag>
          </Space>
        }
        extra={
          <Space>
            <span className={styles.totalSize}>
              总大小: {deliverableApi.formatFileSize(totalSize)}
            </span>
            {editable && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setUploadVisible(true)}
              >
                上传交付物
              </Button>
            )}
          </Space>
        }
      >

        <Table
          columns={columns}
          dataSource={deliverables}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
          locale={{
            emptyText: <Empty description="暂无交付物" />
          }}
        />
      </Card>

      {/* 上传弹窗 */}
      <Modal
        title="上传交付物"
        open={uploadVisible}
        onCancel={() => {
          setUploadVisible(false)
          form.resetFields()
          setFileList([])
        }}
        onOk={handleUpload}
        confirmLoading={uploading}
        okText="上传"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="交付物名称"
            rules={[{ required: true, message: '请输入交付物名称' }]}
          >
            <Input placeholder="请输入交付物名称" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="type"
            label="交付物类型"
            rules={[{ required: true, message: '请选择交付物类型' }]}
          >
            <Select placeholder="请选择类型">
              <Select.Option value="document">文档</Select.Option>
              <Select.Option value="design">设计稿</Select.Option>
              <Select.Option value="code">代码</Select.Option>
              <Select.Option value="data">数据</Select.Option>
              <Select.Option value="report">报告</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              rows={3}
              placeholder="请输入交付物描述"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="选择文件"
            required
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览弹窗 */}
      <Modal
        title={previewTitle}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div className={styles.previewContent}>
          {previewUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
            <img src={previewUrl} alt={previewTitle} style={{ maxWidth: '100%' }} />
          ) : previewUrl.match(/\.pdf$/i) ? (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '500px', border: 'none' }}
              title={previewTitle}
            />
          ) : (
            <div className={styles.noPreview}>
              <FileOutlined style={{ fontSize: 48 }} />
              <p>此文件类型不支持预览</p>
              <Button type="primary" href={previewUrl} target="_blank">
                下载查看
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default DeliverableList