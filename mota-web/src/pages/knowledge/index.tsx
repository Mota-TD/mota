/**
 * 知识管理页面
 * 集成知识图谱、文件上传、缩略图、AI分类、版本控制等功能
 */

import { useEffect, useState, useRef } from 'react'
import {
  Typography,
  Spin,
  Tabs,
  Card,
  Button,
  Space,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  Modal,
  message,
  Empty,
  Row,
  Col,
  Statistic,
  Dropdown,
  Menu,
  Popconfirm
} from 'antd'
import {
  NodeIndexOutlined,
  CloudUploadOutlined,
  FolderOutlined,
  TagOutlined,
  RobotOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  MoreOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  MergeCellsOutlined
} from '@ant-design/icons'
import KnowledgeGraphEnhanced from '@/components/KnowledgeGraphEnhanced'
import ChunkUploader from '@/components/ChunkUploader'
import FileThumbnail from '@/components/FileThumbnail'
import AIClassifier from '@/components/AIClassifier'
import FileVersionControl from '@/components/FileVersionControl'
import styles from './index.module.css'
import {
  getFiles,
  getCategories,
  getTags,
  deleteFile,
  batchDeleteFiles,
  batchAIClassification,
  KnowledgeFile,
  FileCategory,
  FileTag,
  formatFileSize
} from '@/services/api/knowledgeManagement'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

type ViewMode = 'grid' | 'list'

const KnowledgePage = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('files')
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [categories, setCategories] = useState<FileCategory[]>([])
  const [tags, setTags] = useState<FileTag[]>([])
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showClassifierModal, setShowClassifierModal] = useState(false)
  const [currentFile, setCurrentFile] = useState<KnowledgeFile | null>(null)
  const [batchClassifying, setBatchClassifying] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [versionFile, setVersionFile] = useState<KnowledgeFile | null>(null)

  // 防止重复请求的 ref
  const loadingDataRef = useRef(false)
  const lastParamsRef = useRef<string>('')

  // 加载数据
  useEffect(() => {
    const paramsKey = `${searchKeyword}-${selectedCategory}-${selectedTags.join(',')}-${pagination.current}-${pagination.pageSize}`
    if (loadingDataRef.current && lastParamsRef.current === paramsKey) {
      return
    }
    lastParamsRef.current = paramsKey
    
    const loadData = async () => {
      if (loadingDataRef.current) {
        return
      }
      loadingDataRef.current = true
      setLoading(true)
      try {
        const [filesData, categoriesData, tagsData] = await Promise.all([
          getFiles({
            keyword: searchKeyword,
            category: selectedCategory,
            tags: selectedTags,
            page: pagination.current,
            pageSize: pagination.pageSize
          }),
          getCategories(),
          getTags()
        ])
        setFiles(filesData.files)
        setPagination(prev => ({ ...prev, total: filesData.total }))
        setCategories(categoriesData)
        setTags(tagsData)
      } catch (error) {
        console.error('加载数据失败:', error)
        message.error('加载数据失败')
        setFiles([])
        setCategories([])
        setTags([])
      } finally {
        setLoading(false)
        loadingDataRef.current = false
      }
    }
    loadData()
  }, [searchKeyword, selectedCategory, selectedTags, pagination.current, pagination.pageSize])

  // 获取文件图标
  const getFileIcon = (mimeType: string, extension: string) => {
    if (mimeType.startsWith('image/')) return <FileImageOutlined style={{ color: '#1890ff' }} />
    if (mimeType === 'application/pdf') return <FilePdfOutlined style={{ color: '#ff4d4f' }} />
    if (mimeType.includes('word') || extension === 'doc' || extension === 'docx') 
      return <FileWordOutlined style={{ color: '#2b579a' }} />
    if (mimeType.includes('excel') || extension === 'xls' || extension === 'xlsx') 
      return <FileExcelOutlined style={{ color: '#217346' }} />
    return <FileOutlined style={{ color: '#8c8c8c' }} />
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 处理删除
  const handleDelete = async (fileId: number) => {
    try {
      await deleteFile(fileId)
      message.success('删除成功')
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) {
      message.warning('请先选择文件')
      return
    }
    try {
      await batchDeleteFiles(selectedFiles)
      message.success(`成功删除 ${selectedFiles.length} 个文件`)
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)))
      setSelectedFiles([])
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  // 批量AI分类
  const handleBatchClassify = async () => {
    if (selectedFiles.length === 0) {
      message.warning('请先选择文件')
      return
    }
    setBatchClassifying(true)
    try {
      const result = await batchAIClassification({ fileIds: selectedFiles, autoApply: true })
      message.success(`成功分类 ${result.successCount} 个文件`)
      // 刷新文件列表
      const filesData = await getFiles({
        keyword: searchKeyword,
        category: selectedCategory,
        tags: selectedTags,
        page: pagination.current,
        pageSize: pagination.pageSize
      })
      setFiles(filesData.files)
    } catch (error) {
      message.error('批量分类失败')
    } finally {
      setBatchClassifying(false)
    }
  }

  // 打开AI分类器
  const openClassifier = (file: KnowledgeFile) => {
    setCurrentFile(file)
    setShowClassifierModal(true)
  }

  // 打开版本控制
  const openVersionControl = (file: KnowledgeFile) => {
    setVersionFile(file)
    setShowVersionModal(true)
  }

  // 表格列定义
  const columns = [
    {
      title: '文件',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: KnowledgeFile) => (
        <Space>
          <FileThumbnail
            fileId={record.id}
            fileName={record.originalName}
            mimeType={record.mimeType}
            size="small"
            showPreview={false}
          />
          <div>
            <Text strong>{record.originalName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatFileSize(record.size)}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => category ? <Tag color="blue">{category}</Tag> : '-'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <Space wrap>
          {tags?.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </Space>
      )
    },
    {
      title: 'AI建议',
      key: 'ai',
      width: 150,
      render: (_: unknown, record: KnowledgeFile) => (
        record.aiSuggestedCategory ? (
          <Tooltip title={`置信度: ${Math.round((record.aiConfidence || 0) * 100)}%`}>
            <Tag color="purple" icon={<RobotOutlined />}>
              {record.aiSuggestedCategory}
            </Tag>
          </Tooltip>
        ) : (
          <Button 
            type="link" 
            size="small" 
            icon={<ThunderboltOutlined />}
            onClick={() => openClassifier(record)}
          >
            获取建议
          </Button>
        )
      )
    },
    {
      title: '上传者',
      dataIndex: 'uploaderName',
      key: 'uploaderName',
      width: 100
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: KnowledgeFile) => (
        <Space>
          <Tooltip title="预览">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="下载">
            <Button type="text" size="small" icon={<DownloadOutlined />} />
          </Tooltip>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="version" icon={<HistoryOutlined />} onClick={() => openVersionControl(record)}>
                  版本历史
                </Menu.Item>
                <Menu.Item key="classify" icon={<RobotOutlined />} onClick={() => openClassifier(record)}>
                  AI分类
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                  <Popconfirm
                    title="确定要删除这个文件吗？"
                    onConfirm={() => handleDelete(record.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    删除
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  // 渲染文件网格
  const renderFileGrid = () => (
    <div className={styles.fileGrid}>
      {files.map(file => (
        <Card
          key={file.id}
          className={`${styles.fileCard} ${selectedFiles.includes(file.id) ? styles.selected : ''}`}
          hoverable
          onClick={() => {
            if (selectedFiles.includes(file.id)) {
              setSelectedFiles(prev => prev.filter(id => id !== file.id))
            } else {
              setSelectedFiles(prev => [...prev, file.id])
            }
          }}
        >
          <div className={styles.fileCardContent}>
            <FileThumbnail
              fileId={file.id}
              fileName={file.originalName}
              mimeType={file.mimeType}
              size="large"
              showFileName
            />
            <div className={styles.fileCardMeta}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatFileSize(file.size)}
              </Text>
              {file.category && <Tag color="blue" style={{ fontSize: 10 }}>{file.category}</Tag>}
            </div>
            {file.aiSuggestedCategory && (
              <Tooltip title={`AI建议: ${file.aiSuggestedCategory}`}>
                <RobotOutlined className={styles.aiIcon} />
              </Tooltip>
            )}
          </div>
        </Card>
      ))}
    </div>
  )

  // 渲染统计卡片
  const renderStats = () => (
    <Row gutter={16} className={styles.statsRow}>
      <Col span={6}>
        <Card>
          <Statistic
            title="总文件数"
            value={pagination.total || files.length}
            prefix={<FileOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="分类数"
            value={categories.length}
            prefix={<FolderOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="标签数"
            value={tags.length}
            prefix={<TagOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="AI已分类"
            value={files.filter(f => f.aiSuggestedCategory).length}
            prefix={<RobotOutlined />}
          />
        </Card>
      </Col>
    </Row>
  )

  // 渲染文件管理标签页
  const renderFilesTab = () => (
    <div className={styles.filesTab}>
      {/* 统计卡片 */}
      {renderStats()}

      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <Space>
          <Search
            placeholder="搜索文件"
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.name}>
                {cat.name} ({cat.fileCount})
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            placeholder="选择标签"
            allowClear
            style={{ width: 200 }}
            value={selectedTags}
            onChange={setSelectedTags}
          >
            {tags.map(tag => (
              <Option key={tag.id} value={tag.name}>
                <Tag color={tag.color}>{tag.name}</Tag>
              </Option>
            ))}
          </Select>
        </Space>
        <Space>
          {selectedFiles.length > 0 && (
            <>
              <Text type="secondary">已选 {selectedFiles.length} 项</Text>
              <Button
                icon={<RobotOutlined />}
                onClick={handleBatchClassify}
                loading={batchClassifying}
              >
                批量AI分类
              </Button>
              <Popconfirm
                title={`确定要删除选中的 ${selectedFiles.length} 个文件吗？`}
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除
                </Button>
              </Popconfirm>
            </>
          )}
          <Button.Group>
            <Tooltip title="网格视图">
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
            </Tooltip>
            <Tooltip title="列表视图">
              <Button
                icon={<UnorderedListOutlined />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              />
            </Tooltip>
          </Button.Group>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={() => setShowUploadModal(true)}
          >
            上传文件
          </Button>
        </Space>
      </div>

      {/* 文件列表 */}
      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : files.length === 0 ? (
        <Empty description="暂无文件">
          <Button type="primary" onClick={() => setShowUploadModal(true)}>
            上传第一个文件
          </Button>
        </Empty>
      ) : viewMode === 'grid' ? (
        renderFileGrid()
      ) : (
        <Table
          columns={columns}
          dataSource={files}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedFiles,
            onChange: (keys) => setSelectedFiles(keys as number[])
          }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个文件`,
            onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
          }}
        />
      )}
    </div>
  )

  if (loading && activeTab === 'graph') {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.headerIcon}>
            <NodeIndexOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>知识管理</Title>
            <Text type="secondary" className={styles.description}>
              管理文档、构建知识图谱、AI智能分类
            </Text>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'files',
            label: (
              <span>
                <FolderOutlined />
                文件管理
              </span>
            ),
            children: renderFilesTab()
          },
          {
            key: 'graph',
            label: (
              <span>
                <NodeIndexOutlined />
                知识图谱
              </span>
            ),
            children: (
              <div className={styles.graphContainer}>
                <KnowledgeGraphEnhanced
                  width={window.innerWidth - 300}
                  height={window.innerHeight - 300}
                  onNodeSelect={(node) => {
                    console.log('Node selected:', node)
                  }}
                />
              </div>
            )
          },
          {
            key: 'versions',
            label: (
              <span>
                <HistoryOutlined />
                版本控制
              </span>
            ),
            children: (
              <div className={styles.versionTab}>
                <Card>
                  <div className={styles.versionIntro}>
                    <Title level={4}>文件版本控制</Title>
                    <Text type="secondary">
                      自动保存文件版本，支持版本对比、回滚和变更记录查看。
                      点击文件列表中的"版本历史"按钮查看具体文件的版本信息。
                    </Text>
                  </div>
                  <Row gutter={16} style={{ marginTop: 24 }}>
                    <Col span={8}>
                      <Card className={styles.featureCard}>
                        <Statistic
                          title="自动版本保存"
                          value="已启用"
                          valueStyle={{ color: '#52c41a' }}
                          prefix={<HistoryOutlined />}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          每次编辑自动保存版本
                        </Text>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card className={styles.featureCard}>
                        <Statistic
                          title="版本保留数量"
                          value={50}
                          suffix="个"
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          每个文件最多保留版本数
                        </Text>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card className={styles.featureCard}>
                        <Statistic
                          title="版本保留天数"
                          value={90}
                          suffix="天"
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          版本自动清理周期
                        </Text>
                      </Card>
                    </Col>
                  </Row>
                  <div style={{ marginTop: 24 }}>
                    <Title level={5}>最近变更记录</Title>
                    <Table
                      dataSource={files.slice(0, 5).map((f, i) => ({
                        key: i,
                        fileName: f.originalName,
                        changeType: ['create', 'update', 'update', 'create', 'update'][i],
                        operator: f.uploaderName,
                        time: f.updatedAt
                      }))}
                      columns={[
                        { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
                        {
                          title: '变更类型',
                          dataIndex: 'changeType',
                          key: 'changeType',
                          render: (type: string) => (
                            <Tag color={type === 'create' ? 'green' : type === 'update' ? 'blue' : 'red'}>
                              {type === 'create' ? '创建' : type === 'update' ? '更新' : '删除'}
                            </Tag>
                          )
                        },
                        { title: '操作人', dataIndex: 'operator', key: 'operator' },
                        {
                          title: '时间',
                          dataIndex: 'time',
                          key: 'time',
                          render: (time: string) => new Date(time).toLocaleString()
                        },
                        {
                          title: '操作',
                          key: 'action',
                          render: (_: unknown, record: { fileName: string }) => (
                            <Button
                              type="link"
                              size="small"
                              onClick={() => {
                                const file = files.find(f => f.originalName === record.fileName)
                                if (file) openVersionControl(file)
                              }}
                            >
                              查看版本
                            </Button>
                          )
                        }
                      ]}
                      pagination={false}
                      size="small"
                    />
                  </div>
                </Card>
              </div>
            )
          },
          {
            key: 'categories',
            label: (
              <span>
                <TagOutlined />
                分类标签
              </span>
            ),
            children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="分类管理" extra={<Button type="primary" icon={<PlusOutlined />}>新建分类</Button>}>
                    {categories.map(cat => (
                      <div key={cat.id} className={styles.categoryItem}>
                        <Space>
                          <FolderOutlined />
                          <Text>{cat.name}</Text>
                        </Space>
                        <Tag>{cat.fileCount} 个文件</Tag>
                      </div>
                    ))}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="标签管理" extra={<Button type="primary" icon={<PlusOutlined />}>新建标签</Button>}>
                    <div className={styles.tagCloud}>
                      {tags.map(tag => (
                        <Tag key={tag.id} color={tag.color} closable>
                          {tag.name} ({tag.fileCount})
                        </Tag>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />

      {/* 上传弹窗 */}
      <Modal
        title="上传文件"
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        footer={null}
        width={700}
      >
        <ChunkUploader
          autoGenerateThumbnail
          autoAIClassify
          onUploadComplete={(file) => {
            message.success(`${file.fileName} 上传成功`)
          }}
          onAllComplete={(files) => {
            message.success(`${files.length} 个文件上传完成`)
            setShowUploadModal(false)
            // 刷新文件列表
            getFiles({
              keyword: searchKeyword,
              category: selectedCategory,
              tags: selectedTags,
              page: pagination.current,
              pageSize: pagination.pageSize
            }).then(data => {
              setFiles(data.files)
              setPagination(prev => ({ ...prev, total: data.total }))
            })
          }}
        />
      </Modal>

      {/* AI分类弹窗 */}
      <Modal
        title="AI智能分类"
        open={showClassifierModal}
        onCancel={() => {
          setShowClassifierModal(false)
          setCurrentFile(null)
        }}
        footer={null}
        width={600}
      >
        {currentFile && (
          <AIClassifier
            fileId={currentFile.id}
            fileName={currentFile.originalName}
            currentCategory={currentFile.category}
            currentTags={currentFile.tags}
            showCard={false}
            onApply={(category, tags) => {
              setFiles(prev => prev.map(f => 
                f.id === currentFile.id 
                  ? { ...f, category, tags, aiSuggestedCategory: category }
                  : f
              ))
              setShowClassifierModal(false)
              setCurrentFile(null)
            }}
            onClose={() => {
              setShowClassifierModal(false)
              setCurrentFile(null)
            }}
          />
        )}
      </Modal>

      {/* 版本控制弹窗 */}
      <Modal
        title={`版本历史 - ${versionFile?.originalName || ''}`}
        open={showVersionModal}
        onCancel={() => {
          setShowVersionModal(false)
          setVersionFile(null)
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        {versionFile && (
          <FileVersionControl
            fileId={versionFile.id}
            fileName={versionFile.originalName}
            showCard={false}
            onRollback={(version) => {
              message.success(`已回滚到版本 ${version.versionNumber}`)
              // 刷新文件列表
              getFiles({
                keyword: searchKeyword,
                category: selectedCategory,
                tags: selectedTags,
                page: pagination.current,
                pageSize: pagination.pageSize
              }).then(data => {
                setFiles(data.files)
              })
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default KnowledgePage