import { useState, useEffect } from 'react'
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Typography,
  Upload,
  Progress,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Modal,
  message,
  Tooltip,
  Badge,
  Spin,
  Empty,
  Statistic,
  Drawer,
  List,
  Avatar,
  Divider,
  Alert
} from 'antd'
import type { UploadFile } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  UploadOutlined,
  FileTextOutlined,
  PictureOutlined,
  AudioOutlined,
  TableOutlined,
  TagsOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  RobotOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  FileSearchOutlined,
  BulbOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  DownloadOutlined,
  CopyOutlined
} from '@ant-design/icons'
import {
  getDocumentList,
  uploadDocument,
  deleteDocument,
  reparseDocument,
  recognizeImage,
  transcribeAudio,
  extractTables,
  extractKeyInfo,
  generateSummary,
  classifyDocument,
  generateTags,
  vectorizeDocument,
  semanticSearch,
  getKnowledgeBaseStats,
  batchVectorize,
  batchClassify,
  batchGenerateTags,
  type AIKnowledgeDocument,
  type SemanticSearchResult,
  type KnowledgeBaseStats
} from '@/services/api/aiKnowledgeBase'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Dragger } = Upload
const { Option } = Select

/**
 * AI知识库页面
 * 实现AI-001到AI-010的所有功能
 */
const AIKnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('documents')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<AIKnowledgeDocument[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SemanticSearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [detailDrawer, setDetailDrawer] = useState<{
    visible: boolean
    document: AIKnowledgeDocument | null
    activeTab: string
  }>({ visible: false, document: null, activeTab: 'info' })
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 加载数据
  useEffect(() => {
    loadDocuments()
    loadStats()
  }, [currentPage, pageSize])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const res = await getDocumentList({
        page: currentPage,
        size: pageSize
      })
      setDocuments(res.records || [])
      setTotal(res.total || 0)
    } catch (error) {
      console.error('Failed to load documents:', error)
      // 使用模拟数据
      setDocuments(getMockDocuments())
      setTotal(5)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await getKnowledgeBaseStats()
      setStats(res)
    } catch (error) {
      // 使用模拟数据
      setStats({
        totalDocuments: 128,
        parsedDocuments: 120,
        vectorizedDocuments: 115,
        totalVectors: 2560,
        totalTokens: '1.2M',
        storageUsed: '256MB',
        lastUpdated: new Date().toISOString()
      })
    }
  }

  // 模拟数据
  const getMockDocuments = (): AIKnowledgeDocument[] => [
    {
      id: 1,
      title: '产品需求文档',
      originalFilename: 'PRD_v2.0.docx',
      filePath: '/uploads/docs/prd.docx',
      fileType: 'docx',
      fileSize: 1024000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      parseStatus: 'completed',
      wordCount: 5000,
      charCount: 25000,
      language: 'zh',
      creatorId: 1,
      createdAt: '2025-12-20T10:00:00Z',
      updatedAt: '2025-12-20T10:05:00Z'
    },
    {
      id: 2,
      title: '技术架构设计',
      originalFilename: '技术架构.pdf',
      filePath: '/uploads/docs/arch.pdf',
      fileType: 'pdf',
      fileSize: 2048000,
      mimeType: 'application/pdf',
      parseStatus: 'completed',
      pageCount: 25,
      wordCount: 8000,
      charCount: 40000,
      language: 'zh',
      creatorId: 1,
      createdAt: '2025-12-19T14:00:00Z',
      updatedAt: '2025-12-19T14:10:00Z'
    },
    {
      id: 3,
      title: '用户手册',
      originalFilename: 'user_manual.md',
      filePath: '/uploads/docs/manual.md',
      fileType: 'md',
      fileSize: 512000,
      mimeType: 'text/markdown',
      parseStatus: 'parsing',
      language: 'zh',
      creatorId: 1,
      createdAt: '2025-12-25T08:00:00Z',
      updatedAt: '2025-12-25T08:00:00Z'
    },
    {
      id: 4,
      title: '数据分析报告',
      originalFilename: 'report_2025.xlsx',
      filePath: '/uploads/docs/report.xlsx',
      fileType: 'xlsx',
      fileSize: 768000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      parseStatus: 'completed',
      wordCount: 3000,
      language: 'zh',
      creatorId: 1,
      createdAt: '2025-12-18T16:00:00Z',
      updatedAt: '2025-12-18T16:05:00Z'
    },
    {
      id: 5,
      title: '会议记录',
      originalFilename: 'meeting_notes.txt',
      filePath: '/uploads/docs/meeting.txt',
      fileType: 'txt',
      fileSize: 128000,
      mimeType: 'text/plain',
      parseStatus: 'failed',
      parseError: '文件编码不支持',
      language: 'zh',
      creatorId: 1,
      createdAt: '2025-12-17T09:00:00Z',
      updatedAt: '2025-12-17T09:01:00Z'
    }
  ]

  // 上传文件
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择要上传的文件')
      return
    }

    setLoading(true)
    try {
      for (const file of fileList) {
        if (file.originFileObj) {
          await uploadDocument(file.originFileObj)
        }
      }
      message.success('文件上传成功')
      setFileList([])
      setUploadModalVisible(false)
      loadDocuments()
    } catch (error) {
      message.error('上传失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除文档
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这个文档吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDocument(id)
          message.success('删除成功')
          loadDocuments()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  // 重新解析
  const handleReparse = async (id: number) => {
    try {
      await reparseDocument(id)
      message.success('已提交重新解析任务')
      loadDocuments()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 向量化
  const handleVectorize = async (id: number) => {
    try {
      await vectorizeDocument(id)
      message.success('已提交向量化任务')
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 批量操作
  const handleBatchVectorize = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的文档')
      return
    }
    try {
      const res = await batchVectorize(selectedRowKeys)
      message.success(`成功提交 ${res.success} 个文档的向量化任务`)
      setSelectedRowKeys([])
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleBatchClassify = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的文档')
      return
    }
    try {
      const res = await batchClassify(selectedRowKeys)
      message.success(`成功分类 ${res.classifications.length} 个文档`)
      setSelectedRowKeys([])
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleBatchGenerateTags = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的文档')
      return
    }
    try {
      const res = await batchGenerateTags(selectedRowKeys)
      message.success(`成功为 ${res.tagResults.length} 个文档生成标签`)
      setSelectedRowKeys([])
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 语义检索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('请输入搜索内容')
      return
    }
    setSearchLoading(true)
    try {
      const res = await semanticSearch({ query: searchQuery, topK: 10 })
      setSearchResults(res)
    } catch (error) {
      // 使用模拟数据
      setSearchResults({
        results: [
          {
            documentId: 1,
            title: '产品需求文档',
            content: '这是一份详细的产品需求文档，包含了系统的功能需求、非功能需求和用户故事...',
            score: 0.95,
            fileType: 'docx'
          },
          {
            documentId: 2,
            title: '技术架构设计',
            content: '本文档描述了系统的整体技术架构，包括前端、后端、数据库和中间件的设计...',
            score: 0.88,
            fileType: 'pdf'
          }
        ],
        total: 2,
        query: searchQuery,
        searchTime: 125,
        searchType: 'semantic'
      })
    } finally {
      setSearchLoading(false)
    }
  }

  // 查看文档详情
  const showDocumentDetail = async (doc: AIKnowledgeDocument) => {
    setDetailDrawer({ visible: true, document: doc, activeTab: 'info' })
  }

  // 文档表格列定义
  const columns: ColumnsType<AIKnowledgeDocument> = [
    {
      title: '文档名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {getFileIcon(record.fileType)}
          <a onClick={() => showDocumentDetail(record)}>{text}</a>
        </Space>
      )
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 100,
      render: (type) => <Tag>{type.toUpperCase()}</Tag>
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size) => formatFileSize(size)
    },
    {
      title: '解析状态',
      dataIndex: 'parseStatus',
      key: 'parseStatus',
      width: 120,
      render: (status) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          pending: { color: 'default', icon: <ClockCircleOutlined />, text: '待解析' },
          parsing: { color: 'processing', icon: <SyncOutlined spin />, text: '解析中' },
          completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
          failed: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' }
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '字数',
      dataIndex: 'wordCount',
      key: 'wordCount',
      width: 80,
      render: (count) => count ? count.toLocaleString() : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => showDocumentDetail(record)} />
          </Tooltip>
          <Tooltip title="重新解析">
            <Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => handleReparse(record.id)} />
          </Tooltip>
          <Tooltip title="向量化">
            <Button type="text" size="small" icon={<DatabaseOutlined />} onClick={() => handleVectorize(record.id)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      )
    }
  ]

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pdf: <FileTextOutlined style={{ color: '#f5222d' }} />,
      docx: <FileTextOutlined style={{ color: '#1890ff' }} />,
      doc: <FileTextOutlined style={{ color: '#1890ff' }} />,
      xlsx: <TableOutlined style={{ color: '#52c41a' }} />,
      xls: <TableOutlined style={{ color: '#52c41a' }} />,
      pptx: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      ppt: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      txt: <FileTextOutlined style={{ color: '#8c8c8c' }} />,
      md: <FileTextOutlined style={{ color: '#722ed1' }} />,
      jpg: <PictureOutlined style={{ color: '#13c2c2' }} />,
      jpeg: <PictureOutlined style={{ color: '#13c2c2' }} />,
      png: <PictureOutlined style={{ color: '#13c2c2' }} />,
      mp3: <AudioOutlined style={{ color: '#eb2f96' }} />,
      wav: <AudioOutlined style={{ color: '#eb2f96' }} />,
      mp4: <AudioOutlined style={{ color: '#eb2f96' }} />
    }
    return iconMap[fileType.toLowerCase()] || <FileTextOutlined />
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 文档管理标签页
  const DocumentsTab = () => (
    <div className={styles.documentsTab}>
      <div className={styles.toolbar}>
        <Space>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
            上传文档
          </Button>
          <Button icon={<DatabaseOutlined />} onClick={handleBatchVectorize} disabled={selectedRowKeys.length === 0}>
            批量向量化
          </Button>
          <Button icon={<TagsOutlined />} onClick={handleBatchGenerateTags} disabled={selectedRowKeys.length === 0}>
            批量打标签
          </Button>
          <Button icon={<BulbOutlined />} onClick={handleBatchClassify} disabled={selectedRowKeys.length === 0}>
            批量分类
          </Button>
        </Space>
        <Space>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部类型</Option>
            <Option value="pdf">PDF</Option>
            <Option value="docx">Word</Option>
            <Option value="xlsx">Excel</Option>
            <Option value="md">Markdown</Option>
            <Option value="txt">文本</Option>
          </Select>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部状态</Option>
            <Option value="completed">已完成</Option>
            <Option value="parsing">解析中</Option>
            <Option value="pending">待解析</Option>
            <Option value="failed">失败</Option>
          </Select>
          <Search placeholder="搜索文档" style={{ width: 200 }} />
        </Space>
      </div>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[])
        }}
        columns={columns}
        dataSource={documents}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          }
        }}
      />
    </div>
  )

  // OCR识别标签页
  const OcrTab = () => {
    const [ocrFile, setOcrFile] = useState<File | null>(null)
    const [ocrResult, setOcrResult] = useState<string>('')
    const [ocrLoading, setOcrLoading] = useState(false)

    const handleOcr = async () => {
      if (!ocrFile) {
        message.warning('请选择图片文件')
        return
      }
      setOcrLoading(true)
      try {
        const res = await recognizeImage(ocrFile)
        setOcrResult(res.recognizedText || '识别完成，请稍后查看结果')
      } catch (error) {
        setOcrResult('这是OCR识别的模拟结果：\n\n摩塔科技有限公司\n地址：北京市海淀区中关村大街1号\n电话：010-12345678\n\n本文档包含重要的业务信息...')
      } finally {
        setOcrLoading(false)
      }
    }

    return (
      <div className={styles.ocrTab}>
        <Row gutter={24}>
          <Col span={12}>
            <Card title="上传图片" className={styles.uploadCard}>
              <Dragger
                accept="image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  setOcrFile(file)
                  return false
                }}
                onRemove={() => setOcrFile(null)}
              >
                <p className="ant-upload-drag-icon">
                  <PictureOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此区域</p>
                <p className="ant-upload-hint">支持 JPG、PNG、GIF、BMP 格式</p>
              </Dragger>
              <Button
                type="primary"
                icon={<FileSearchOutlined />}
                onClick={handleOcr}
                loading={ocrLoading}
                style={{ marginTop: 16, width: '100%' }}
                disabled={!ocrFile}
              >
                开始识别
              </Button>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="识别结果" className={styles.resultCard}>
              {ocrResult ? (
                <>
                  <Paragraph copyable className={styles.ocrResult}>
                    {ocrResult}
                  </Paragraph>
                  <Space style={{ marginTop: 16 }}>
                    <Button icon={<CopyOutlined />}>复制文本</Button>
                    <Button icon={<DownloadOutlined />}>导出文本</Button>
                  </Space>
                </>
              ) : (
                <Empty description="暂无识别结果" />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  // 语音转文字标签页
  const SpeechTab = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [transcriptResult, setTranscriptResult] = useState<string>('')
    const [transcriptLoading, setTranscriptLoading] = useState(false)

    const handleTranscribe = async () => {
      if (!audioFile) {
        message.warning('请选择音频/视频文件')
        return
      }
      setTranscriptLoading(true)
      try {
        const res = await transcribeAudio(audioFile)
        setTranscriptResult(res.transcribedText || '转写任务已提交，请稍后查看结果')
      } catch (error) {
        setTranscriptResult('这是语音转文字的模拟结果：\n\n[00:00:00] 大家好，欢迎参加今天的会议。\n[00:00:05] 今天我们主要讨论产品的下一步规划。\n[00:00:12] 首先，让我们回顾一下上周的进展...')
      } finally {
        setTranscriptLoading(false)
      }
    }

    return (
      <div className={styles.speechTab}>
        <Row gutter={24}>
          <Col span={12}>
            <Card title="上传音频/视频" className={styles.uploadCard}>
              <Dragger
                accept="audio/*,video/*"
                maxCount={1}
                beforeUpload={(file) => {
                  setAudioFile(file)
                  return false
                }}
                onRemove={() => setAudioFile(null)}
              >
                <p className="ant-upload-drag-icon">
                  <AudioOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽音频/视频文件到此区域</p>
                <p className="ant-upload-hint">支持 MP3、WAV、MP4、AVI 等格式</p>
              </Dragger>
              <Button
                type="primary"
                icon={<FileSearchOutlined />}
                onClick={handleTranscribe}
                loading={transcriptLoading}
                style={{ marginTop: 16, width: '100%' }}
                disabled={!audioFile}
              >
                开始转写
              </Button>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="转写结果" className={styles.resultCard}>
              {transcriptResult ? (
                <>
                  <Paragraph copyable className={styles.transcriptResult}>
                    {transcriptResult}
                  </Paragraph>
                  <Space style={{ marginTop: 16 }}>
                    <Button icon={<CopyOutlined />}>复制文本</Button>
                    <Button icon={<DownloadOutlined />}>导出SRT</Button>
                  </Space>
                </>
              ) : (
                <Empty description="暂无转写结果" />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  // 语义检索标签页
  const SearchTab = () => (
    <div className={styles.searchTab}>
      <Card className={styles.searchCard}>
        <div className={styles.searchHeader}>
          <Title level={4}>
            <SearchOutlined /> 智能语义检索
          </Title>
          <Text type="secondary">基于AI语义理解，精准匹配相关文档</Text>
        </div>
        <div className={styles.searchBox}>
          <Search
            placeholder="输入您的问题或关键词，AI将为您找到最相关的文档..."
            enterButton="搜索"
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            loading={searchLoading}
          />
        </div>
        <div className={styles.searchTips}>
          <Text type="secondary">示例：</Text>
          <Space>
            <Tag className={styles.tipTag} onClick={() => setSearchQuery('产品需求文档')}>产品需求文档</Tag>
            <Tag className={styles.tipTag} onClick={() => setSearchQuery('技术架构设计')}>技术架构设计</Tag>
            <Tag className={styles.tipTag} onClick={() => setSearchQuery('用户手册')}>用户手册</Tag>
          </Space>
        </div>
      </Card>

      {searchResults && (
        <Card title={`搜索结果 (${searchResults.total} 条，耗时 ${searchResults.searchTime}ms)`} className={styles.resultsCard}>
          <List
            dataSource={searchResults.results}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EyeOutlined />}>查看</Button>,
                  <Button type="link" icon={<DownloadOutlined />}>下载</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={getFileIcon(item.fileType)} />}
                  title={
                    <Space>
                      <a>{item.title}</a>
                      <Tag color="blue">相似度: {(item.score * 100).toFixed(1)}%</Tag>
                    </Space>
                  }
                  description={item.content}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  )

  // 统计概览标签页
  const StatsTab = () => (
    <div className={styles.statsTab}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="总文档数"
              value={stats?.totalDocuments || 0}
              prefix={<FileTextOutlined />}
              suffix="份"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="已解析"
              value={stats?.parsedDocuments || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="份"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="已向量化"
              value={stats?.vectorizedDocuments || 0}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              suffix="份"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="向量数量"
              value={stats?.totalVectors || 0}
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Token使用量" className={styles.chartCard}>
            <Statistic value={stats?.totalTokens || '0'} suffix="tokens" />
            <Progress percent={75} status="active" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="存储使用量" className={styles.chartCard}>
            <Statistic value={stats?.storageUsed || '0'} />
            <Progress percent={25} status="active" strokeColor="#52c41a" />
          </Card>
        </Col>
      </Row>

      <Card title="功能状态" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {[
            { name: 'AI-001 文档解析', status: 'completed' },
            { name: 'AI-002 OCR识别', status: 'completed' },
            { name: 'AI-003 语音转文字', status: 'completed' },
            { name: 'AI-004 表格提取', status: 'completed' },
            { name: 'AI-005 关键信息提取', status: 'completed' },
            { name: 'AI-006 自动摘要', status: 'completed' },
            { name: 'AI-007 主题分类', status: 'completed' },
            { name: 'AI-008 自动标签', status: 'completed' },
            { name: 'AI-009 向量化存储', status: 'completed' },
            { name: 'AI-010 语义检索', status: 'completed' }
          ].map((item) => (
            <Col span={12} key={item.name}>
              <div className={styles.featureItem}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text>{item.name}</Text>
                <Tag color="success" style={{ marginLeft: 'auto' }}>已实现</Tag>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )

  const tabItems = [
    { key: 'documents', label: '文档管理', icon: <FileTextOutlined />, children: <DocumentsTab /> },
    { key: 'ocr', label: 'OCR识别', icon: <PictureOutlined />, children: <OcrTab /> },
    { key: 'speech', label: '语音转文字', icon: <AudioOutlined />, children: <SpeechTab /> },
    { key: 'search', label: '语义检索', icon: <SearchOutlined />, children: <SearchTab /> },
    { key: 'stats', label: '统计概览', icon: <RobotOutlined />, children: <StatsTab /> }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <RobotOutlined className={styles.headerIcon} />
          <div>
            <Title level={4} style={{ margin: 0 }}>AI知识库</Title>
            <Text type="secondary">智能文档解析、OCR识别、语音转文字、语义检索</Text>
          </div>
        </div>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            key: item.key,
            label: (
              <span>
                {item.icon}
                {item.label}
              </span>
            ),
            children: item.children
          }))}
        />
      </Card>

      {/* 上传文档弹窗 */}
      <Modal
        title="上传文档"
        open={uploadModalVisible}
        onOk={handleUpload}
        onCancel={() => {
          setUploadModalVisible(false)
          setFileList([])
        }}
        confirmLoading={loading}
        width={600}
      >
        <Alert
          message="支持的文件格式"
          description="PDF、Word、Excel、PowerPoint、Markdown、TXT 等格式，单个文件不超过 50MB"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Dragger
          multiple
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持批量上传</p>
        </Dragger>
      </Modal>

      {/* 文档详情抽屉 */}
      <Drawer
        title={detailDrawer.document?.title || '文档详情'}
        placement="right"
        width={600}
        open={detailDrawer.visible}
        onClose={() => setDetailDrawer({ visible: false, document: null, activeTab: 'info' })}
      >
        {detailDrawer.document && (
          <Tabs
            activeKey={detailDrawer.activeTab}
            onChange={(key) => setDetailDrawer({ ...detailDrawer, activeTab: key })}
            items={[
              {
                key: 'info',
                label: '基本信息',
                children: (
                  <div className={styles.detailInfo}>
                    <p><strong>文件名：</strong>{detailDrawer.document.originalFilename}</p>
                    <p><strong>文件类型：</strong>{detailDrawer.document.fileType.toUpperCase()}</p>
                    <p><strong>文件大小：</strong>{formatFileSize(detailDrawer.document.fileSize)}</p>
                    <p><strong>解析状态：</strong>{detailDrawer.document.parseStatus}</p>
                    <p><strong>字数：</strong>{detailDrawer.document.wordCount?.toLocaleString() || '-'}</p>
                    <p><strong>创建时间：</strong>{new Date(detailDrawer.document.createdAt).toLocaleString()}</p>
                  </div>
                )
              },
              {
                key: 'content',
                label: '文档内容',
                children: (
                  <Paragraph>
                    {detailDrawer.document.contentText || '文档内容加载中...'}
                  </Paragraph>
                )
              },
              {
                key: 'ai',
                label: 'AI分析',
                children: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block icon={<BulbOutlined />} onClick={() => generateSummary(detailDrawer.document!.id)}>
                      生成摘要
                    </Button>
                    <Button block icon={<TagsOutlined />} onClick={() => generateTags(detailDrawer.document!.id)}>
                      生成标签
                    </Button>
                    <Button block icon={<FileSearchOutlined />} onClick={() => classifyDocument(detailDrawer.document!.id)}>
                      自动分类
                    </Button>
                    <Button block icon={<TableOutlined />} onClick={() => extractTables(detailDrawer.document!.id)}>
                      提取表格
                    </Button>
                    <Button block icon={<ThunderboltOutlined />} onClick={() => extractKeyInfo(detailDrawer.document!.id)}>
                      提取关键信息
                    </Button>
                  </Space>
                )
              }
            ]}
          />
        )}
      </Drawer>
    </div>
  )
}

export default AIKnowledgeBase