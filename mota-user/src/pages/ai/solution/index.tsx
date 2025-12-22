import { useState, useEffect } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Form, 
  Space, 
  Typography, 
  Divider, 
  Tag, 
  Spin,
  message,
  Row,
  Col,
  Steps,
  Result,
  Avatar,
  Tooltip
} from 'antd'
import { 
  RobotOutlined, 
  SendOutlined, 
  FileTextOutlined,
  DownloadOutlined,
  CopyOutlined,
  ReloadOutlined,
  HistoryOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './index.module.css'

const { TextArea } = Input
const { Title, Paragraph, Text } = Typography
const { Option } = Select

interface GeneratedSolution {
  id: string
  title: string
  content: string
  type: string
  createdAt: string
}

/**
 * AI方案生成页面
 */
const AISolution = () => {
  const [form] = Form.useForm()
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [generatedSolution, setGeneratedSolution] = useState<GeneratedSolution | null>(null)

  // 从dashboard传入的查询
  useEffect(() => {
    const state = location.state as { query?: string }
    if (state?.query) {
      form.setFieldsValue({ requirements: state.query })
    }
  }, [location.state, form])

  // 方案类型选项
  const solutionTypes = [
    { value: 'business', label: '商务方案', desc: '适用于商务合作、客户提案', icon: '💼' },
    { value: 'technical', label: '技术方案', desc: '适用于技术架构、实施方案', icon: '⚙️' },
    { value: 'marketing', label: '营销方案', desc: '适用于市场推广、品牌策划', icon: '📈' },
    { value: 'consulting', label: '咨询报告', desc: '适用于行业分析、战略规划', icon: '📊' },
    { value: 'product', label: '产品介绍', desc: '适用于产品说明、功能介绍', icon: '🎯' },
    { value: 'training', label: '培训方案', desc: '适用于培训计划、课程设计', icon: '📚' },
  ]

  // 快捷模板
  const quickTemplates = [
    { label: '电商平台方案', value: '帮我制定一个电商平台的技术架构方案' },
    { label: '企业数字化转型', value: '帮我制定企业数字化转型的整体规划方案' },
    { label: '产品上市推广', value: '帮我制定新产品上市的市场推广方案' },
    { label: '团队培训计划', value: '帮我制定技术团队的年度培训计划' },
  ]

  // 模拟AI生成方案
  const handleGenerate = async (values: any) => {
    setLoading(true)
    setCurrentStep(1)
    
    // 模拟AI生成过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCurrentStep(2)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setCurrentStep(3)
    
    // 生成模拟方案
    const mockSolution: GeneratedSolution = {
      id: `SOL-${Date.now()}`,
      title: `${values.companyName || '企业'}${solutionTypes.find(t => t.value === values.solutionType)?.label || '方案'}`,
      content: generateMockContent(values),
      type: values.solutionType,
      createdAt: new Date().toLocaleString(),
    }
    
    setGeneratedSolution(mockSolution)
    setLoading(false)
    message.success('方案生成成功！')
  }

  // 生成模拟内容
  const generateMockContent = (values: any) => {
    const companyName = values.companyName || '贵公司'
    const businessDesc = values.businessDesc || '业务介绍'
    const requirements = values.requirements || '具体需求'
    
    return `# ${companyName}${solutionTypes.find(t => t.value === values.solutionType)?.label || '方案'}

## 一、项目背景

根据${companyName}的业务介绍：${businessDesc}

我们深入分析了贵公司的业务特点和市场定位，结合行业最佳实践，为您量身定制了本方案。

## 二、需求分析

### 2.1 核心需求
${requirements}

### 2.2 需求拆解
1. **业务目标**：提升业务效率，优化用户体验
2. **技术目标**：构建稳定、可扩展的技术架构
3. **运营目标**：实现数据驱动的精细化运营

## 三、解决方案

### 3.1 整体架构
基于${companyName}的业务特点，我们建议采用以下架构：

- **前端层**：现代化的用户界面，支持多端适配
- **服务层**：微服务架构，确保系统的可扩展性
- **数据层**：分布式数据存储，保障数据安全

### 3.2 核心功能
1. **智能分析模块**：基于AI技术的数据分析能力
2. **自动化流程**：减少人工操作，提升效率
3. **可视化报表**：直观展示业务数据

### 3.3 实施计划
| 阶段 | 时间 | 主要工作 |
|------|------|----------|
| 第一阶段 | 1-2周 | 需求确认、方案设计 |
| 第二阶段 | 3-6周 | 核心功能开发 |
| 第三阶段 | 7-8周 | 测试优化、上线部署 |

## 四、预期效果

1. **效率提升**：预计提升工作效率 40%+
2. **成本降低**：预计降低运营成本 30%+
3. **体验优化**：用户满意度提升至 95%+

## 五、投资回报

基于以上方案，预计投资回报周期为 6-12 个月，长期收益显著。

---

*本方案由摩塔AI智能生成，仅供参考。如需进一步定制，请联系我们的专业顾问。*
`
  }

  // 复制内容
  const handleCopy = () => {
    if (generatedSolution) {
      navigator.clipboard.writeText(generatedSolution.content)
      message.success('已复制到剪贴板')
    }
  }

  // 重新生成
  const handleRegenerate = () => {
    form.submit()
  }

  // 重置表单
  const handleReset = () => {
    form.resetFields()
    setGeneratedSolution(null)
    setCurrentStep(0)
  }

  // 使用快捷模板
  const handleQuickTemplate = (value: string) => {
    form.setFieldsValue({ requirements: value })
  }

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <RobotOutlined />
          </div>
          <div className={styles.headerInfo}>
            <Title level={4} className={styles.headerTitle}>AI 方案生成</Title>
            <Text type="secondary">输入业务信息，AI 一键生成专业方案文档</Text>
          </div>
        </div>
        <Space>
          <Button 
            icon={<HistoryOutlined />}
            onClick={() => navigate('/ai/history')}
          >
            历史记录
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        {/* 左侧输入区域 */}
        <Col xs={24} lg={10}>
          <Card className={styles.inputCard}>
            <div className={styles.cardHeader}>
              <ThunderboltOutlined className={styles.cardIcon} />
              <span className={styles.cardTitle}>方案配置</span>
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
              initialValues={{ solutionType: 'business' }}
              className={styles.form}
            >
              <Form.Item
                name="solutionType"
                label="方案类型"
                rules={[{ required: true, message: '请选择方案类型' }]}
              >
                <Select placeholder="选择方案类型" size="large">
                  {solutionTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div className={styles.typeOption}>
                        <span className={styles.typeIcon}>{type.icon}</span>
                        <div className={styles.typeInfo}>
                          <div className={styles.typeLabel}>{type.label}</div>
                          <div className={styles.typeDesc}>{type.desc}</div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="companyName"
                label="公司/项目名称"
                rules={[{ required: true, message: '请输入公司或项目名称' }]}
              >
                <Input placeholder="例如：摩塔科技" size="large" />
              </Form.Item>

              <Form.Item
                name="businessDesc"
                label="业务介绍"
                rules={[{ required: true, message: '请输入业务介绍' }]}
                extra="详细描述您的业务内容、产品服务、目标客户等"
              >
                <TextArea 
                  placeholder="请详细描述您的业务内容，包括：&#10;1. 主营业务和产品服务&#10;2. 目标客户群体&#10;3. 核心竞争优势&#10;4. 业务发展目标"
                  rows={5}
                  showCount
                  maxLength={2000}
                  className={styles.textarea}
                />
              </Form.Item>

              <Form.Item
                name="requirements"
                label="具体需求"
                rules={[{ required: true, message: '请输入具体需求' }]}
                extra="描述您希望方案解决的问题或达成的目标"
              >
                <TextArea 
                  placeholder="请描述您的具体需求，例如：&#10;1. 需要解决什么问题&#10;2. 期望达成什么目标&#10;3. 有哪些特殊要求"
                  rows={4}
                  showCount
                  maxLength={1000}
                  className={styles.textarea}
                />
              </Form.Item>

              <Form.Item
                name="additionalInfo"
                label="补充信息（可选）"
              >
                <TextArea 
                  placeholder="其他需要AI参考的信息，如行业背景、竞品情况等"
                  rows={3}
                  showCount
                  maxLength={500}
                  className={styles.textarea}
                />
              </Form.Item>

              <Form.Item className={styles.formActions}>
                <Button onClick={handleReset} size="large">重置</Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SendOutlined />}
                  loading={loading}
                  size="large"
                  className={styles.submitBtn}
                >
                  生成方案
                </Button>
              </Form.Item>
            </Form>

            {/* 生成进度 */}
            {loading && (
              <div className={styles.progressSection}>
                <Divider />
                <Steps
                  current={currentStep}
                  size="small"
                  items={[
                    { title: '分析需求', icon: currentStep > 0 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                    { title: '检索知识库', icon: currentStep > 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                    { title: '生成方案', icon: currentStep > 2 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                    { title: '完成', icon: currentStep > 3 ? <CheckCircleOutlined /> : <ClockCircleOutlined /> },
                  ]}
                />
              </div>
            )}
          </Card>

          {/* 提示卡片 */}
          <Card className={styles.tipsCard}>
            <div className={styles.tipsHeader}>
              <BulbOutlined className={styles.tipsIcon} />
              <Text strong>生成技巧</Text>
            </div>
            <ul className={styles.tipsList}>
              <li>业务介绍越详细，生成的方案越精准</li>
              <li>明确具体需求，有助于AI理解您的目标</li>
              <li>可以多次生成，选择最满意的版本</li>
              <li>生成后可以手动编辑调整内容</li>
            </ul>
          </Card>
        </Col>

        {/* 右侧输出区域 */}
        <Col xs={24} lg={14}>
          <Card 
            className={styles.outputCard}
            title={
              <div className={styles.outputHeader}>
                <FileTextOutlined className={styles.outputIcon} />
                <span>生成结果</span>
                {generatedSolution && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>已生成</Tag>
                )}
              </div>
            }
            extra={
              generatedSolution && (
                <Space>
                  <Tooltip title="复制内容">
                    <Button icon={<CopyOutlined />} onClick={handleCopy} />
                  </Tooltip>
                  <Tooltip title="编辑内容">
                    <Button icon={<EditOutlined />} />
                  </Tooltip>
                  <Button icon={<ReloadOutlined />} onClick={handleRegenerate}>重新生成</Button>
                  <Button type="primary" icon={<DownloadOutlined />}>导出文档</Button>
                </Space>
              )
            }
          >
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingAnimation}>
                  <RobotOutlined className={styles.loadingIcon} />
                </div>
                <Title level={5} className={styles.loadingTitle}>AI 正在为您生成方案...</Title>
                <Paragraph type="secondary">请稍候，这可能需要几秒钟</Paragraph>
              </div>
            ) : generatedSolution ? (
              <div className={styles.solutionContent}>
                <div className={styles.solutionMeta}>
                  <Space split={<Divider type="vertical" />}>
                    <Text type="secondary">ID: {generatedSolution.id}</Text>
                    <Text type="secondary">生成时间: {generatedSolution.createdAt}</Text>
                    <Tag color="blue">{solutionTypes.find(t => t.value === generatedSolution.type)?.label}</Tag>
                  </Space>
                </div>
                <Divider />
                <div className={styles.markdownContent}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {generatedSolution.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <RobotOutlined />
                </div>
                <Title level={5} className={styles.emptyTitle}>等待生成</Title>
                <Paragraph type="secondary" className={styles.emptyDesc}>
                  填写左侧表单，点击「生成方案」按钮<br />
                  AI 将为您生成专业方案文档
                </Paragraph>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AISolution