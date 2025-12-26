import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Select, 
  Slider,
  Row,
  Col,
  Steps,
  message,
  Tag,
  Divider,
  Tooltip
} from 'antd'
import {
  FilePptOutlined,
  RocketOutlined,
  HistoryOutlined,
  DownloadOutlined,
  EyeOutlined,
  BulbOutlined,
  PictureOutlined,
  FontSizeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  getPPTTemplates,
  getPPTColorSchemes,
  getPPTQuickTemplates,
  generatePPT,
  downloadPPT,
  type PPTTemplate,
  type PPTColorScheme,
  type GeneratedPPT
} from '@/services/api/ai'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

/**
 * AI PPT生成页面
 */
const AIPPT = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [generatedPPT, setGeneratedPPT] = useState<GeneratedPPT | null>(null)
  const [templates, setTemplates] = useState<PPTTemplate[]>([])
  const [colorSchemes, setColorSchemes] = useState<PPTColorScheme[]>([])
  const [quickTemplates, setQuickTemplates] = useState<Array<{ label: string; value: string }>>([])

  // 加载配置数据
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const [templatesRes, colorSchemesRes, quickTemplatesRes] = await Promise.all([
        getPPTTemplates(),
        getPPTColorSchemes(),
        getPPTQuickTemplates()
      ])

      setTemplates(templatesRes || [])
      setColorSchemes(colorSchemesRes || [])
      setQuickTemplates(quickTemplatesRes || [])
    } catch (error) {
      console.error('Failed to load config:', error)
      message.error('加载配置失败')
      setTemplates([])
      setColorSchemes([])
      setQuickTemplates([])
    }
  }

  // 生成PPT
  const handleGenerate = async (values: any) => {
    setGenerating(true)
    setCurrentStep(1)
    
    try {
      // 模拟进度
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStep(2)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStep(3)
      
      const result = await generatePPT({
        title: values.title,
        content: values.content,
        template: values.template,
        colorScheme: values.colorScheme,
        slideCount: values.slideCount || 10,
        style: values.style
      })
      
      setGeneratedPPT(result)
      message.success('PPT生成成功！')
    } catch (error) {
      console.error('Failed to generate PPT:', error)
      message.error('PPT生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  // 下载PPT
  const handleDownload = async (format: string) => {
    if (!generatedPPT) return
    try {
      await downloadPPT(generatedPPT.id, format)
      message.success(`正在下载 ${format.toUpperCase()} 格式...`)
    } catch (error) {
      message.error('下载失败')
    }
  }

  // 预览PPT
  const handlePreview = () => {
    message.info('正在打开预览...')
  }

  // 使用快捷模板
  const handleQuickTemplate = (value: string) => {
    form.setFieldsValue({ content: value })
  }

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <FilePptOutlined />
          </div>
          <div className={styles.headerInfo}>
            <Title level={4} className={styles.headerTitle}>AI PPT 生成</Title>
            <Text type="secondary">输入主题，AI 自动生成专业演示文稿</Text>
          </div>
        </div>
        <Button 
          icon={<HistoryOutlined />}
          onClick={() => navigate('/ai/history')}
        >
          历史记录
        </Button>
      </div>

      <Row gutter={24}>
        {/* 左侧：输入区域 */}
        <Col xs={24} lg={12}>
          <Card className={styles.inputCard}>
            <div className={styles.cardHeader}>
              <ThunderboltOutlined className={styles.cardIcon} />
              <span className={styles.cardTitle}>PPT 配置</span>
            </div>

            {/* 快捷模板 */}
            <div className={styles.quickTemplates}>
              <Text type="secondary" className={styles.quickLabel}>快捷模板：</Text>
              <div className={styles.templateTags}>
                {quickTemplates.map((t, i) => (
                  <Tag 
                    key={i} 
                    className={styles.templateTag}
                    onClick={() => handleQuickTemplate(t.value)}
                  >
                    {t.label}
                  </Tag>
                ))}
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerate}
              initialValues={{
                template: 'business',
                colorScheme: 'blue',
                slideCount: 10,
                style: 'professional'
              }}
              className={styles.form}
            >
              <Form.Item
                name="title"
                label="PPT标题"
                rules={[{ required: true, message: '请输入PPT标题' }]}
              >
                <Input 
                  placeholder="例如：摩塔科技产品介绍" 
                  size="large"
                  prefix={<FontSizeOutlined className={styles.inputIcon} />}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="内容描述"
                rules={[{ required: true, message: '请输入内容描述' }]}
                extra="详细描述PPT需要包含的内容，AI将据此生成各页面"
              >
                <TextArea 
                  rows={4} 
                  placeholder="请描述PPT需要包含的主要内容，例如：&#10;1. 公司简介和发展历程&#10;2. 核心产品和服务介绍&#10;3. 成功案例展示&#10;4. 团队介绍&#10;5. 未来发展规划"
                  className={styles.textarea}
                />
              </Form.Item>

              <Form.Item
                name="template"
                label="选择模板"
              >
                <div className={styles.templateGrid}>
                  {templates.map(t => (
                    <div 
                      key={t.value}
                      className={`${styles.templateItem} ${form.getFieldValue('template') === t.value ? styles.templateActive : ''}`}
                      onClick={() => form.setFieldsValue({ template: t.value })}
                    >
                      <div className={styles.templatePreview} style={{ background: `linear-gradient(135deg, ${t.color} 0%, ${t.color}99 100%)` }}>
                        <span className={styles.templateEmoji}>{t.icon}</span>
                      </div>
                      <span className={styles.templateName}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </Form.Item>

              <Form.Item
                name="colorScheme"
                label="配色方案"
              >
                <div className={styles.colorGrid}>
                  {colorSchemes.map(c => (
                    <Tooltip key={c.value} title={c.label}>
                      <div 
                        className={`${styles.colorItem} ${form.getFieldValue('colorScheme') === c.value ? styles.colorActive : ''}`}
                        onClick={() => form.setFieldsValue({ colorScheme: c.value })}
                      >
                        <div className={styles.colorPreview}>
                          {c.colors.map((color, i) => (
                            <div key={i} className={styles.colorDot} style={{ background: color }} />
                          ))}
                        </div>
                        <span className={styles.colorName}>{c.label}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </Form.Item>

              <Form.Item
                name="slideCount"
                label={<span>页数设置 <Text type="secondary">({form.getFieldValue('slideCount') || 10} 页)</Text></span>}
              >
                <Slider 
                  min={5} 
                  max={30} 
                  marks={{ 5: '5页', 10: '10页', 20: '20页', 30: '30页' }}
                  className={styles.slider}
                />
              </Form.Item>

              <Form.Item
                name="style"
                label="内容风格"
              >
                <Select size="large">
                  <Select.Option value="professional">专业正式</Select.Option>
                  <Select.Option value="casual">轻松活泼</Select.Option>
                  <Select.Option value="creative">创意新颖</Select.Option>
                  <Select.Option value="data">数据驱动</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item className={styles.formActions}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<RocketOutlined />}
                  loading={generating}
                  size="large"
                  block
                  className={styles.submitBtn}
                >
                  {generating ? '正在生成...' : '生成 PPT'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右侧：预览区域 */}
        <Col xs={24} lg={12}>
          <Card 
            className={styles.previewCard}
            title={
              <div className={styles.previewHeader}>
                <PictureOutlined className={styles.previewIcon} />
                <span>生成预览</span>
                {generatedPPT && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>已生成</Tag>
                )}
              </div>
            }
            extra={
              generatedPPT && (
                <Space>
                  <Tooltip title="预览">
                    <Button icon={<EyeOutlined />} onClick={handlePreview} />
                  </Tooltip>
                  <Tooltip title="编辑">
                    <Button icon={<EditOutlined />} />
                  </Tooltip>
                  <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleDownload('pptx')}>
                    下载
                  </Button>
                </Space>
              )
            }
          >
            {generating ? (
              <div className={styles.generatingState}>
                <div className={styles.loadingAnimation}>
                  <FilePptOutlined className={styles.loadingIcon} />
                </div>
                <Title level={5} className={styles.loadingTitle}>AI 正在生成 PPT...</Title>
                <Steps
                  current={currentStep}
                  direction="vertical"
                  size="small"
                  className={styles.generatingSteps}
                  items={[
                    { title: '分析内容', description: '理解PPT主题和结构', icon: currentStep > 0 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                    { title: '生成大纲', description: '规划页面布局', icon: currentStep > 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                    { title: '设计页面', description: '生成各页面内容', icon: currentStep > 2 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                    { title: '完成', description: 'PPT生成完毕', icon: currentStep > 3 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                  ]}
                />
              </div>
            ) : generatedPPT ? (
              <div className={styles.pptPreview}>
                <div className={styles.pptInfo}>
                  <Title level={5} className={styles.pptTitle}>{generatedPPT.title}</Title>
                  <Space>
                    <Tag color="blue">{generatedPPT.slides} 页</Tag>
                    <Tag color="purple">{templates.find(t => t.value === generatedPPT.template)?.label}</Tag>
                    <Text type="secondary">{generatedPPT.createdAt}</Text>
                  </Space>
                </div>
                <Divider />
                <div className={styles.slideList}>
                  {generatedPPT.pages.map((page) => (
                    <div key={page.id} className={styles.slideItem}>
                      <div className={styles.slideThumb}>
                        <span className={styles.slideNumber}>{page.id}</span>
                      </div>
                      <div className={styles.slideInfo}>
                        <Text strong>{page.title}</Text>
                        <Text type="secondary" className={styles.slideType}>{page.type}</Text>
                      </div>
                    </div>
                  ))}
                </div>
                <Divider />
                <div className={styles.downloadOptions}>
                  <Text type="secondary">下载格式：</Text>
                  <Space>
                    <Button size="small" onClick={() => handleDownload('pptx')}>PPTX</Button>
                    <Button size="small" onClick={() => handleDownload('pdf')}>PDF</Button>
                    <Button size="small" onClick={() => handleDownload('key')}>Keynote</Button>
                  </Space>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FilePptOutlined />
                </div>
                <Title level={5} className={styles.emptyTitle}>等待生成</Title>
                <Paragraph type="secondary" className={styles.emptyDesc}>
                  配置 PPT 参数后点击生成<br />
                  AI 将为您创建专业演示文稿
                </Paragraph>
              </div>
            )}
          </Card>

          {/* 使用提示 */}
          <Card className={styles.tipsCard}>
            <div className={styles.tipsHeader}>
              <BulbOutlined className={styles.tipsIcon} />
              <Text strong>使用提示</Text>
            </div>
            <ul className={styles.tipsList}>
              <li>详细的内容描述能帮助AI生成更精准的PPT</li>
              <li>选择合适的模板和配色，让PPT更专业</li>
              <li>生成后可以预览并下载多种格式</li>
              <li>支持PPTX、PDF、Keynote等格式导出</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AIPPT