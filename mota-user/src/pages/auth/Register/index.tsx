import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Steps } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, MobileOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons'
import { register as registerApi } from '@/services/api/auth'
import { ApiError } from '@/services/request'
import styles from './index.module.css'

/**
 * 注册页面
 */
const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})

  // 第一步：基本信息
  const handleBasicInfo = (values: any) => {
    setFormData({ ...formData, ...values })
    setCurrentStep(1)
  }

  // 第二步：验证手机
  const handleVerifyPhone = (values: any) => {
    setFormData({ ...formData, ...values })
    setCurrentStep(2)
  }

  // 第三步：创建团队或加入团队
  const handleTeamSetup = async (values: any) => {
    setLoading(true)
    try {
      const finalData = { ...formData, ...values }
      await registerApi({
        username: finalData.name,
        email: finalData.email,
        password: finalData.password,
        confirmPassword: finalData.confirmPassword,
      })
      message.success('注册成功！')
      navigate('/login')
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message || '注册失败')
      } else {
        message.error('网络错误，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  // 发送验证码
  const handleSendCode = () => {
    message.success('验证码已发送')
  }

  const steps = [
    {
      title: '基本信息',
      content: (
        <Form
          name="basicInfo"
          onFinish={handleBasicInfo}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入您的姓名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱地址"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请设置密码（至少8位）"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              下一步
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: '验证手机',
      content: (
        <Form
          name="verifyPhone"
          onFinish={handleVerifyPhone}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="请输入手机号"
            />
          </Form.Item>

          <Form.Item
            name="code"
            label="验证码"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <div className={styles.codeInput}>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="请输入验证码"
              />
              <Button onClick={handleSendCode}>获取验证码</Button>
            </div>
          </Form.Item>

          <Form.Item>
            <div className={styles.stepButtons}>
              <Button onClick={() => setCurrentStep(0)}>上一步</Button>
              <Button type="primary" htmlType="submit">
                下一步
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: '团队设置',
      content: (
        <Form
          name="teamSetup"
          onFinish={handleTeamSetup}
          size="large"
          layout="vertical"
          initialValues={{ teamAction: 'create' }}
        >
          <Form.Item
            name="teamAction"
            label="团队设置"
          >
            <div className={styles.teamOptions}>
              <div
                className={`${styles.teamOption} ${styles.active}`}
                onClick={() => {}}
              >
                <TeamOutlined className={styles.teamIcon} />
                <div className={styles.teamInfo}>
                  <h4>创建新团队</h4>
                  <p>创建一个新的团队并成为管理员</p>
                </div>
              </div>
              <div
                className={styles.teamOption}
                onClick={() => {}}
              >
                <TeamOutlined className={styles.teamIcon} />
                <div className={styles.teamInfo}>
                  <h4>加入已有团队</h4>
                  <p>通过邀请码加入已有团队</p>
                </div>
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="teamName"
            label="团队名称"
            rules={[{ required: true, message: '请输入团队名称' }]}
          >
            <Input
              prefix={<TeamOutlined />}
              placeholder="请输入团队名称"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意服务条款')),
              },
            ]}
          >
            <Checkbox>
              我已阅读并同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <div className={styles.stepButtons}>
              <Button onClick={() => setCurrentStep(1)}>上一步</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                完成注册
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerHeader}>
        <h2>创建账号</h2>
        <p>开始您的摩塔之旅</p>
      </div>

      <Steps
        current={currentStep}
        items={steps.map(item => ({ title: item.title }))}
        className={styles.steps}
      />

      <div className={styles.stepContent}>
        {steps[currentStep].content}
      </div>

      <div className={styles.registerFooter}>
        <p>已有账号？<Link to="/login">立即登录</Link></p>
      </div>
    </div>
  )
}

export default Register