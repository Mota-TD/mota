import { useState } from 'react'
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
  Tooltip
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
import styles from './index.module.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface HistoryRecord {
  id: string
  title: string
  type: 'solution' | 'ppt' | 'marketing' | 'news'
  status: 'completed' | 'failed' | 'processing'
  creator: string
  createdAt: string
  content?: string
}

/**
 * AI历史记录页面
 */
const AIHistory = () => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  // 模拟历史记录数据
  const mockHistory: HistoryRecord[] = [
    {
      id: 'SOL-1703123456789',
      title: '摩塔科技商务方案',
      type: 'solution',
      status: 'completed',
      creator: '管理员',
      createdAt: '2024-01-15 14:30:25',
      content: '# 摩塔科技商务方案\n\n## 一、项目背景\n\n...'
    },
    {
      id: 'PPT-1703123456790',
      title: '产品介绍PPT',
      type: 'ppt',
      status: 'completed',
      creator: '管理员',
      createdAt: '2024-01-15 10:20:15',
      content: 'PPT内容...'
    },
    {
      id: 'MKT-1703123456791',
      title: '双十一营销方案',
      type: 'marketing',
      status: 'completed',
      creator: '张三',
      createdAt: '2024-01-14 16:45:30',
      content: '# 双十一营销方案\n\n...'
    },
    {
      id: 'SOL-1703123456792',
      title: '技术架构方案',
      type: 'solution',
      status: 'completed',
      creator: '李四',
      createdAt: '2024-01-14 09:15:00',
      content: '# 技术架构方案\n\n...'
    },
    {
      id: 'NEWS-1703123456793',
      title: '行业新闻周报',
      type: 'news',
      status: 'completed',
      creator: '管理员',
      createdAt: '2024-01-13 18:00:00',
      content: '# 行业新闻周报\n\n...'
    },
    {
      id: 'SOL-1703123456794',
      title: '客户提案方案',
      type: 'solution',
      status: 'failed',
      creator: '王五',
      createdAt: '2024-01-13 11:30:45',
      content: ''
    },
    {
      id: 'PPT-1703123456795',
      title: '季度汇报PPT',
      type: 'ppt',
      status: 'completed',
      creator: '管理员',
      createdAt: '2024-01-12 15:20:30',
      content: 'PPT内容...'
    },
    {
      id: 'MKT-1703123456796',
      title: '新品发布营销方案',
      type: 'marketing',
      status: 'processing',
      creator: '赵六',
      createdAt: '2024-01-12 10:00:00',
      content: ''
    },
  ]

  // 类型配置
  const typeConfig = {
    solution: { label: '方案', color: 'blue', icon: <FileTextOutlined /> },
    ppt: { label: 'PPT', color: 'purple', icon: <FilePptOutlined /> },
    marketing: { label: '营销', color: 'orange', icon: <BulbOutlined /> },
    news: { label: '新闻', color: 'green', icon: <GlobalOutlined /> },
  }

  // 状态配置
  const statusConfig = {
    completed: { label: '已完成', color: 'success' },
    failed: { label: '失败', color: 'error' },
    processing: { label: '生成中', color: 'processing' },
  }

  // 操作菜单
  const getActionMenu = (record: HistoryRecord): MenuProps['items'] => [
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
  const handlePreview = (record: HistoryRecord) => {
    setSelectedRecord(record)
    setPreviewVisible(true)
  }

  // 复制
  const handleCopy = (record: HistoryRecord) => {
    if (record.content) {
      navigator.clipboard.writeText(record.content)
      message.success('已复制到剪贴板')
    } else {
      message.warning('内容为空')
    }
  }

  // 下载
  const handleDownload = (record: HistoryRecord) => {
    message.success(`正在下载: ${record.title}`)
  }

  // 删除
  const handleDelete = (record: HistoryRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除「${record.title}」吗？删除后无法恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success('删除成功')
      },
    })
  }

  // 表格列配置
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: HistoryRecord) => (
        <Space>
          <span style={{ color: typeConfig[record.type].color }}>
            {typeConfig[record.type].icon}
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
      render: (type: keyof typeof typeConfig) => (
        <Tag color={typeConfig[type].color}>{typeConfig[type].label}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
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
      render: (_: any, record: HistoryRecord) => (
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

  // 过滤数据
  const filteredData = mockHistory.filter(item => {
    const matchSearch = !searchText || 
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id.toLowerCase().includes(searchText.toLowerCase())
    const matchType = !typeFilter || item.type === typeFilter
    return matchSearch && matchType
  })

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
          </Space>
          <Space>
            <Text type="secondary">共 {filteredData.length} 条记录</Text>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 预览弹窗 */}
      <Modal
        title={
          <Space>
            {selectedRecord && typeConfig[selectedRecord.type].icon}
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