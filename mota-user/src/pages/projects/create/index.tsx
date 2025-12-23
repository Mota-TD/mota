import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  message, 
  DatePicker,
  Upload,
  Avatar,
  Divider,
  Row,
  Col
} from 'antd'
import { 
  ArrowLeftOutlined, 
  PlusOutlined,
  ProjectOutlined
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import dayjs from 'dayjs'
import styles from './index.module.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

// 项目模板
const projectTemplates = [
  { value: 'scrum', label: 'Scrum 敏捷开发', desc: '适合迭代式开发的软件项目' },
  { value: 'kanban', label: '看板项目', desc: '适合持续交付的运维项目' },
  { value: 'waterfall', label: '瀑布流项目', desc: '适合需求明确的传统项目' },
  { value: 'blank', label: '空白项目', desc: '从零开始自定义项目' },
]

// 项目颜色
const projectColors = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16', 
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

/**
 * 创建项目页面
 */
const CreateProject = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(projectColors[0])
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 提交表单
  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true)
    try {
      // 模拟创建项目
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Create project:', {
        ...values,
        color: selectedColor,
        dateRange: values.dateRange ? [
          (values.dateRange as [dayjs.Dayjs, dayjs.Dayjs])[0].format('YYYY-MM-DD'),
          (values.dateRange as [dayjs.Dayjs, dayjs.Dayjs])[1].format('YYYY-MM-DD')
        ] : null
      })
      
      message.success('项目创建成功')
      navigate('/projects')
    } catch {
      message.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 生成项目标识
  const generateKey = (name: string) => {
    if (!name) return ''
    // 取首字母大写
    const pinyin = name.split('').map(char => {
      const code = char.charCodeAt(0)
      if (code >= 0x4e00 && code <= 0x9fa5) {
        return char
      }
      return char.toUpperCase()
    }).join('').slice(0, 4)
    return pinyin.toUpperCase()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
          className={styles.backBtn}
        >
          返回项目列表
        </Button>
        <h1 className={styles.title}>创建新项目</h1>
        <p className={styles.subtitle}>填写项目信息，开始您的项目管理之旅</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card className={styles.formCard}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                template: 'scrum',
                visibility: 'private'
              }}
            >
              {/* 项目模板 */}
              <Form.Item 
                label="项目模板" 
                name="template"
                rules={[{ required: true, message: '请选择项目模板' }]}
              >
                <Select size="large">
                  {projectTemplates.map(t => (
                    <Select.Option key={t.value} value={t.value}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{t.desc}</div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider />

              {/* 基本信息 */}
              <div className={styles.sectionTitle}>基本信息</div>
              
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item 
                    label="项目名称" 
                    name="name"
                    rules={[{ required: true, message: '请输入项目名称' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="请输入项目名称"
                      onChange={(e) => {
                        const key = generateKey(e.target.value)
                        form.setFieldValue('key', key)
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item 
                    label="项目标识" 
                    name="key"
                    rules={[
                      { required: true, message: '请输入项目标识' },
                      { pattern: /^[A-Z0-9]+$/, message: '只能包含大写字母和数字' }
                    ]}
                  >
                    <Input size="large" placeholder="如: PROJ" maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                label="项目描述" 
                name="description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入项目描述，帮助团队成员了解项目目标和范围"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="项目周期" name="dateRange">
                    <RangePicker 
                      size="large" 
                      style={{ width: '100%' }}
                      placeholder={['开始日期', '结束日期']}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label="可见性" 
                    name="visibility"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="private">私有 - 仅项目成员可见</Select.Option>
                      <Select.Option value="internal">内部 - 团队成员可见</Select.Option>
                      <Select.Option value="public">公开 - 所有人可见</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* 项目颜色 */}
              <Form.Item label="项目颜色">
                <div className={styles.colorPicker}>
                  {projectColors.map(color => (
                    <div
                      key={color}
                      className={`${styles.colorItem} ${selectedColor === color ? styles.colorItemActive : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </Form.Item>

              {/* 项目封面 */}
              <Form.Item label="项目封面">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  {fileList.length === 0 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传封面</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Divider />

              {/* 提交按钮 */}
              <Form.Item>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    loading={loading}
                  >
                    创建项目
                  </Button>
                  <Button size="large" onClick={() => navigate('/projects')}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* 预览卡片 */}
          <Card className={styles.previewCard} title="项目预览">
            <div className={styles.previewContent}>
              <Avatar 
                size={64} 
                style={{ backgroundColor: selectedColor }}
                icon={<ProjectOutlined />}
              />
              <h3 className={styles.previewName}>
                {form.getFieldValue('name') || '项目名称'}
              </h3>
              <p className={styles.previewKey}>
                {form.getFieldValue('key') || 'KEY'}
              </p>
              <p className={styles.previewDesc}>
                {form.getFieldValue('description') || '项目描述将显示在这里'}
              </p>
            </div>
          </Card>

          {/* 提示信息 */}
          <Card className={styles.tipsCard} title="创建提示">
            <ul className={styles.tipsList}>
              <li>项目标识创建后不可修改，请谨慎填写</li>
              <li>选择合适的项目模板可以快速开始</li>
              <li>项目颜色用于在列表中快速识别</li>
              <li>创建后可以在设置中修改其他信息</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CreateProject