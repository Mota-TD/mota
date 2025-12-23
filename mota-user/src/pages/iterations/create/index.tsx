import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  message, 
  DatePicker,
  Row,
  Col,
  Divider,
  Tag,
  Alert
} from 'antd'
import { 
  ArrowLeftOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './index.module.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

// 模拟项目数据
const mockProjects = [
  { id: '1', name: '摩塔项目管理系统', key: 'MOTA' },
  { id: '2', name: '电商平台重构', key: 'SHOP' },
  { id: '3', name: '移动端App开发', key: 'APP' },
]

// 迭代周期预设
const sprintDurations = [
  { value: 7, label: '1周' },
  { value: 14, label: '2周' },
  { value: 21, label: '3周' },
  { value: 28, label: '4周' },
]

/**
 * 创建迭代页面
 */
const CreateIteration = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')
  
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(14)

  // 提交表单
  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true)
    try {
      // 模拟创建迭代
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const dateRange = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined
      console.log('Create iteration:', {
        ...values,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      })
      
      message.success('迭代创建成功')
      navigate('/iterations')
    } catch {
      message.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 快速设置日期范围
  const handleQuickDuration = (days: number) => {
    setSelectedDuration(days)
    const startDate = dayjs()
    const endDate = dayjs().add(days, 'day')
    form.setFieldValue('dateRange', [startDate, endDate])
  }

  // 计算迭代天数
  const calculateDays = () => {
    const dateRange = form.getFieldValue('dateRange') as [dayjs.Dayjs, dayjs.Dayjs] | undefined
    if (dateRange && dateRange[0] && dateRange[1]) {
      return dateRange[1].diff(dateRange[0], 'day')
    }
    return 0
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/iterations')}
          className={styles.backBtn}
        >
          返回迭代列表
        </Button>
        <h1 className={styles.title}>创建新迭代</h1>
        <p className={styles.subtitle}>规划迭代周期，组织团队工作</p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card className={styles.formCard}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                projectId: projectId || undefined,
                dateRange: [dayjs(), dayjs().add(14, 'day')]
              }}
            >
              {/* 所属项目 */}
              <Form.Item 
                label="所属项目" 
                name="projectId"
                rules={[{ required: true, message: '请选择所属项目' }]}
              >
                <Select size="large" placeholder="请选择项目">
                  {mockProjects.map(p => (
                    <Select.Option key={p.id} value={p.id}>
                      <Tag color="blue">{p.key}</Tag> {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider />

              {/* 基本信息 */}
              <Form.Item 
                label="迭代名称" 
                name="name"
                rules={[{ required: true, message: '请输入迭代名称' }]}
              >
                <Input 
                  size="large" 
                  placeholder="如：Sprint 1 - 用户认证模块"
                  prefix={<CalendarOutlined style={{ color: '#13c2c2' }} />}
                />
              </Form.Item>

              <Form.Item 
                label="迭代目标" 
                name="goal"
              >
                <TextArea 
                  rows={4} 
                  placeholder="描述本次迭代的主要目标和交付物"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              {/* 迭代周期 */}
              <Form.Item label="快速选择周期">
                <Space wrap>
                  {sprintDurations.map(d => (
                    <Button
                      key={d.value}
                      type={selectedDuration === d.value ? 'primary' : 'default'}
                      onClick={() => handleQuickDuration(d.value)}
                    >
                      {d.label}
                    </Button>
                  ))}
                </Space>
              </Form.Item>

              <Form.Item 
                label="迭代日期" 
                name="dateRange"
                rules={[{ required: true, message: '请选择迭代日期' }]}
              >
                <RangePicker 
                  size="large" 
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                  onChange={() => setSelectedDuration(null)}
                />
              </Form.Item>

              {calculateDays() > 0 && (
                <Alert
                  message={`迭代周期：${calculateDays()} 天`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              )}

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
                    创建迭代
                  </Button>
                  <Button 
                    size="large"
                    onClick={() => {
                      handleSubmit(form.getFieldsValue()).then(() => {
                        form.resetFields()
                        form.setFieldValue('dateRange', [dayjs(), dayjs().add(14, 'day')])
                      })
                    }}
                    loading={loading}
                  >
                    创建并继续
                  </Button>
                  <Button size="large" onClick={() => navigate('/iterations')}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* 迭代说明 */}
          <Card className={styles.tipsCard} title="迭代说明">
            <ul className={styles.tipsList}>
              <li>迭代是敏捷开发中的时间盒</li>
              <li>建议迭代周期为1-4周</li>
              <li>每个迭代应有明确的目标</li>
              <li>迭代结束时进行回顾和总结</li>
            </ul>
          </Card>

          {/* 最佳实践 */}
          <Card className={styles.practiceCard} title="最佳实践" style={{ marginTop: 16 }}>
            <div className={styles.practiceItem}>
              <h4>📋 迭代规划</h4>
              <p>在迭代开始前，与团队一起规划要完成的工作项</p>
            </div>
            <div className={styles.practiceItem}>
              <h4>📊 每日站会</h4>
              <p>每天进行简短的同步会议，了解进度和障碍</p>
            </div>
            <div className={styles.practiceItem}>
              <h4>🔄 迭代回顾</h4>
              <p>迭代结束后进行回顾，持续改进团队协作</p>
            </div>
          </Card>

          {/* 快捷操作 */}
          <Card className={styles.quickCard} title="快捷操作" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={() => navigate('/projects/create')}>
                创建新项目
              </Button>
              <Button block onClick={() => navigate('/issues/create')}>
                创建新事项
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CreateIteration