import { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Input,
  Select,
  DatePicker,
  Modal,
  Dropdown,
  message,
  Avatar,
  Tooltip,
  Spin
} from 'antd'
import type { MenuProps } from 'antd'
import { 
  HistoryOutlined, 
  SearchOutlined, 
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  CopyOutlined,
  MoreOutlined,
  FileTextOutlined,
  FilePptOutlined,
  BulbOutlined,
  GlobalOutlined,
  UserOutlined
} from '@ant-design/icons'
import { getAIHistory, deleteAIHistory, type AIHistoryRecord, type AIRecordType } from '@/services/api/ai'
import styles from './index.module.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

/**
 * AI历史记录页面
 */
const AIHistory = () => {
  const [loading, setLoading] = useState(false)
  const [historyData, setHistoryData] = useState<AIHistoryRecord[]>([])
  const [total, setTotal] = useState(0)
  const [selectedRecord, setSelectedRecord] = useState<AIHistoryRecord | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  // 加载数据
  useEffect(() => {
    loadHistory()
  }, [pagination.current, pagination.pageSize, typeFilter])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const res = await getAIHistory({
        type: typeFilter as AIRecordType | undefined,
        search: searchText || undefined,
        page: pagination.current,
        pageSize: pagination.pageSize
      })
      setHistoryData(res.list || [])
      setTotal(res.total || 0)
    } catch (error) {
      console.error('Failed to load AI history:', error)
      message.error('加载历史记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    loadHistory()
  }

  // 类型配置
  const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    solution: { label: '方案', color: 'blue', icon: <FileTextOutlined /> },
    ppt: { label: 'PPT', color: 'purple', icon: <FilePptOutlined /> },
    marketing: { label: '营销', color: 'orange', icon: <BulbOutlined /> },
    news: { label: '新闻', color: 'green', icon: <GlobalOutlined /> },
  }

  // 状态配置
  const statusConfig: Record<string, { label: string; color: string }> = {
    completed: { label: '已完成', color: 'success' },
    failed: { label: '失败', color: 'error' },
    processing: { label: '生成中', color: 'processing' },
  }

  // 操作菜单
  const getActionMenu = (record: AIHistoryRecord): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: '查看详情',
      onClick: () => handlePreview(record),
    },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: '复制内容',
      onClick: () => handleCopy(record),
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: '下载文档',
      onClick: () => handleDownload(record),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDelete(record),
    },
  ]

  // 预览
  const handlePreview = (record: AIHistoryRecord) => {
    setSelectedRecord(record)
    setPreviewVisible(true)
  }

  // 复制
  const handleCopy = (record: AIHistoryRecord) => {
    if (record.content) {
      navigator.clipboard.writeText(record.content)
      message.success('已复制到剪贴板')
    } else {
      message.warning('内容为空')
    }
  }

  // 下载
  const handleDownload = (record: AIHistoryRecord) => {
    message.success(`正在下载: ${record.title}`)
  }

  // 删除
  const handleDelete = (record: AIHistoryRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除「${record.title}」吗？删除后无法恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAIHistory(record.id)
          message.success('删除成功')
          loadHistory()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  // 表格列配置
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: AIHistoryRecord) => (
        <Space>
          <span style={{ color: typeConfig[record.type]?.color }}>
            {typeConfig[record.type]?.icon}
          </span>
          <a onClick={() => handlePreview(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={typeConfig[type]?.color}>{typeConfig[type]?.label}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.label}</Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
      render: (creator: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{creator}</span>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: AIHistoryRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <HistoryOutlined className={styles.headerIcon} />
          <div>
            <Title level={4} style={{ margin: 0 }}>历史记录</Title>
            <Text type="secondary">查看和管理所有AI生成的内容</Text>
          </div>
        </div>
      </div>

      <Card>
        {/* 筛选栏 */}
        <div className={styles.filterBar}>
          <Space wrap>
            <Input
              placeholder="搜索标题或ID"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="类型"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="solution">方案</Select.Option>
              <Select.Option value="ppt">PPT</Select.Option>
              <Select.Option value="marketing">营销</Select.Option>
              <Select.Option value="news">新闻</Select.Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
          </Space>
          <Space>
            <Text type="secondary">共 {total} 条记录</Text>
          </Space>
        </div>

        {/* 表格 */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={historyData}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            }}
          />
        </Spin>
      </Card>

      {/* 预览弹窗 */}
      <Modal
        title={
          <Space>
            {selectedRecord && typeConfig[selectedRecord.type]?.icon}
            <span>{selectedRecord?.title}</span>
          </Space>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={() => selectedRecord && handleCopy(selectedRecord)}>
            复制
          </Button>,
          <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedRecord && handleDownload(selectedRecord)}>
            下载
          </Button>,
          <Button key="close" type="primary" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedRecord && (
          <div className={styles.previewContent}>
            <div className={styles.previewMeta}>
              <Space split={<span>|</span>}>
                <Text type="secondary">ID: {selectedRecord.id}</Text>
                <Text type="secondary">创建人: {selectedRecord.creator}</Text>
                <Text type="secondary">创建时间: {selectedRecord.createdAt}</Text>
              </Space>
            </div>
            <div className={styles.previewBody}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {selectedRecord.content || '内容为空'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AIHistory