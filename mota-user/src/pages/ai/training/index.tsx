import { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Upload, 
  Progress,
  Row,
  Col,
  Tabs,
  message,
  Tag,
  List,
  Avatar,
  Statistic,
  Modal,
  Alert,
  Tooltip,
  Badge
} from 'antd'
import type { UploadFile } from 'antd'
import { 
  RobotOutlined, 
  UploadOutlined, 
  FileTextOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text } = Typography
const { TextArea } = Input
const { Dragger } = Upload

/**
 * AI模型训练页面
 */
const AITraining = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed'>('idle')
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 模拟训练数据
  const trainingStats = {
    totalDocuments: 156,
    totalTokens: '2.3M',
    lastTraining: '2024-01-15 14:30',
    modelVersion: 'v1.2.0',
    accuracy: 92.5,
  }

  // 训练历史
  const trainingHistory = [
    { id: 1, version: 'v1.2.0', date: '2024-01-15 14:30', documents: 156, status: 'completed', accuracy: 92.5 },
    { id: 2, version: 'v1.1.0', date: '2024-01-10 10:20', documents: 120, status: 'completed', accuracy: 89.2 },
    { id: 3, version: 'v1.0.0', date: '2024-01-05 09:00', documents: 80, status: 'completed', accuracy: 85.0 },
  ]

  // 知识库文档
  const knowledgeDocuments = [
    { id: 1, name: '公司简介.pdf', size: '2.3 MB', uploadTime: '2024-01-15', status: 'indexed' },
    { id: 2, name: '产品手册.docx', size: '5.1 MB', uploadTime: '2024-01-14', status: 'indexed' },
    { id: 3, name: '服务说明.pdf', size: '1.8 MB', uploadTime: '2024-01-13', status: 'indexed' },
    { id: 4, name: '案例集锦.pdf', size: '8.2 MB', uploadTime: '2024-01-12', status: 'indexed' },
    { id: 5, name: '技术白皮书.pdf', size: '3.5 MB', uploadTime: '2024-01-10', status: 'pending' },
  ]

  // 开始训练
  const handleStartTraining = () => {
    Modal.confirm({
      title: '开始训练',
      content: '确定要开始训练AI模型吗？训练过程可能需要几分钟到几小时，取决于数据量。',
      okText: '开始训练',
      cancelText: '取消',
      onOk: () => {
        setTrainingStatus('training')
        setTrainingProgress(0)
        
        // 模拟训练进度
        const interval = setInterval(() => {
          setTrainingProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval)
              setTrainingStatus('completed')
              message.success('模型训练完成！')
              return 100
            }
            return prev + Math.random() * 10
          })
        }, 500)
      }
    })
  }

  // 上传配置
  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange: (info: any) => {
      setFileList(info.fileList)
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    },
    beforeUpload: () => false, // 阻止自动上传
  }

  // 删除文档
  const handleDeleteDocument = (_id: number) => {
    Modal.confirm({
      title: '删除文档',
      content: '确定要删除这个文档吗？删除后需要重新训练模型。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success('文档已删除')
      }
    })
  }

  // 概览标签页
  const OverviewTab = () => (
    <div className={styles.overviewTab}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="知识文档" 
              value={trainingStats.totalDocuments} 
              prefix={<FileTextOutlined />}
              suffix="份"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="训练Token" 
              value={trainingStats.totalTokens} 
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="模型准确率" 
              value={trainingStats.accuracy} 
              prefix={<ThunderboltOutlined />}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="当前版本" 
              value={trainingStats.modelVersion} 
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="模型状态" className={styles.statusCard}>
        {trainingStatus === 'training' ? (
          <div className={styles.trainingProgress}>
            <div className={styles.progressHeader}>
              <Space>
                <SyncOutlined spin style={{ color: '#1890ff' }} />
                <Text strong>正在训练中...</Text>
              </Space>
              <Button size="small" icon={<PauseCircleOutlined />}>暂停</Button>
            </div>
            <Progress 
              percent={Math.round(trainingProgress)} 
              status="active"
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
            />
            <Text type="secondary">预计剩余时间: 约 {Math.round((100 - trainingProgress) / 10)} 分钟</Text>
          </div>
        ) : trainingStatus === 'completed' ? (
          <div className={styles.completedStatus}>
            <CheckCircleOutlined className={styles.completedIcon} />
            <div>
              <Title level={5} style={{ margin: 0 }}>模型已就绪</Title>
              <Text type="secondary">上次训练: {trainingStats.lastTraining}</Text>
            </div>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartTraining}>
              重新训练
            </Button>
          </div>
        ) : (
          <div className={styles.idleStatus}>
            <Alert
              message="模型未训练"
              description="请上传知识文档并开始训练，让AI学习您的业务知识。"
              type="info"
              showIcon
            />
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartTraining} style={{ marginTop: 16 }}>
              开始训练
            </Button>
          </div>
        )}
      </Card>

      <Card title="训练历史" className={styles.historyCard}>
        <List
          dataSource={trainingHistory}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="link" size="small">查看详情</Button>,
                <Button type="link" size="small">回滚</Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<RobotOutlined />} 
                    style={{ background: item.status === 'completed' ? '#52c41a' : '#1890ff' }}
                  />
                }
                title={
                  <Space>
                    <Text strong>{item.version}</Text>
                    <Tag color="green">准确率 {item.accuracy}%</Tag>
                  </Space>
                }
                description={
                  <Space>
                    <ClockCircleOutlined /> {item.date}
                    <span>|</span>
                    <FileTextOutlined /> {item.documents} 份文档
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )

  // 知识库标签页
  const KnowledgeTab = () => (
    <div className={styles.knowledgeTab}>
      <Card title="上传知识文档" className={styles.uploadCard}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持 PDF、Word、TXT、Markdown 等格式，单个文件不超过 50MB
          </p>
        </Dragger>
        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Button type="primary" icon={<UploadOutlined />}>
              确认上传 ({fileList.length} 个文件)
            </Button>
          </div>
        )}
      </Card>

      <Card 
        title="知识库文档" 
        className={styles.documentsCard}
        extra={<Text type="secondary">共 {knowledgeDocuments.length} 份文档</Text>}
      >
        <List
          dataSource={knowledgeDocuments}
          renderItem={item => (
            <List.Item
              actions={[
                <Tooltip title="查看">
                  <Button type="text" size="small" icon={<FileTextOutlined />} />
                </Tooltip>,
                <Tooltip title="删除">
                  <Button 
                    type="text" 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDeleteDocument(item.id)}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<FileTextOutlined />} 
                    style={{ background: item.status === 'indexed' ? '#52c41a' : '#faad14' }}
                  />
                }
                title={item.name}
                description={
                  <Space>
                    <Text type="secondary">{item.size}</Text>
                    <span>|</span>
                    <Text type="secondary">{item.uploadTime}</Text>
                    <span>|</span>
                    <Badge 
                      status={item.status === 'indexed' ? 'success' : 'processing'} 
                      text={item.status === 'indexed' ? '已索引' : '待索引'} 
                    />
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )

  // 设置标签页
  const SettingsTab = () => (
    <div className={styles.settingsTab}>
      <Card title="训练参数设置" className={styles.settingsCard}>
        <Form layout="vertical">
          <Form.Item 
            label={
              <Space>
                <span>模型基座</span>
                <Tooltip title="选择用于微调的基础模型">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Input value="GPT-4 Turbo" disabled />
          </Form.Item>
          <Form.Item 
            label="训练轮次 (Epochs)"
            extra="更多轮次可能提高准确率，但也可能导致过拟合"
          >
            <Input type="number" defaultValue={3} />
          </Form.Item>
          <Form.Item 
            label="学习率 (Learning Rate)"
            extra="较小的学习率训练更稳定，但速度较慢"
          >
            <Input defaultValue="0.0001" />
          </Form.Item>
          <Form.Item 
            label="批次大小 (Batch Size)"
          >
            <Input type="number" defaultValue={32} />
          </Form.Item>
          <Form.Item>
            <Button type="primary">保存设置</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="业务配置" className={styles.businessCard}>
        <Form layout="vertical">
          <Form.Item 
            label="公司名称"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入公司名称" defaultValue="摩塔科技" />
          </Form.Item>
          <Form.Item 
            label="行业领域"
          >
            <Input placeholder="请输入行业领域" defaultValue="企业服务/SaaS" />
          </Form.Item>
          <Form.Item 
            label="业务描述"
            extra="详细的业务描述有助于AI更好地理解您的业务"
          >
            <TextArea 
              rows={4} 
              placeholder="请描述您的核心业务..."
              defaultValue="摩塔科技是一家专注于AI驱动的智能商业平台提供商，为企业提供一站式AI解决方案生成服务。"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary">保存配置</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )

  const tabItems = [
    { key: 'overview', label: '概览', children: <OverviewTab /> },
    { key: 'knowledge', label: '知识库', children: <KnowledgeTab /> },
    { key: 'settings', label: '设置', icon: <SettingOutlined />, children: <SettingsTab /> },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <RobotOutlined className={styles.headerIcon} />
          <div>
            <Title level={4} style={{ margin: 0 }}>AI模型训练</Title>
            <Text type="secondary">训练专属于您企业的AI模型，让AI更懂您的业务</Text>
          </div>
        </div>
        <Space>
          <Button icon={<PlayCircleOutlined />} type="primary" onClick={handleStartTraining}>
            开始训练
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  )
}

export default AITraining