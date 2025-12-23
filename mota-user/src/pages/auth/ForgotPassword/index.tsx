import { useState } from 'react'
import { Form, Input, Button, Steps, message, Result } from 'antd'
import { MailOutlined, SafetyOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'

/**
 * 忘记密码页面 - 完整密码重置流程
 * 步骤1: 输入邮箱
 * 步骤2: 输入验证码
 * 步骤3: 设置新密码
 * 步骤4: 完成
 */
const ForgotPassword = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [emailForm] = Form.useForm()
  const [codeForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const values = await emailForm.validateFields()
      setLoading(true)
      
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEmail(values.email)
      message.success('验证码已发送到您的邮箱')
      setCurrentStep(1)
      
      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      // 表单验证失败
    } finally {
      setLoading(false)
    }
  }

  // 重新发送验证码
  const handleResendCode = async () => {
    if (countdown > 0) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('验证码已重新发送')
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setLoading(false)
  }

  // 验证验证码
  const handleVerifyCode = async () => {
    try {
      await codeForm.validateFields()
      setLoading(true)
      
      // 模拟验证
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('验证成功')
      setCurrentStep(2)
    } catch {
      // 表单验证失败
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const handleResetPassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setLoading(true)
      
      // 模拟重置密码
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Reset password for:', email, 'New password:', values.password)
      message.success('密码重置成功')
      setCurrentStep(3)
    } catch {
      // 表单验证失败
    } finally {
      setLoading(false)
    }
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>
              <MailOutlined />
            </div>
            <h2 className={styles.stepTitle}>输入您的邮箱</h2>
            <p className={styles.stepDesc}>我们将向您的邮箱发送验证码</p>
            <Form form={emailForm} layout="vertical" className={styles.form}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入邮箱地址"
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleSendCode}
                >
                  发送验证码
                </Button>
              </Form.Item>
            </Form>
          </div>
        )
      
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>
              <SafetyOutlined />
            </div>
            <h2 className={styles.stepTitle}>输入验证码</h2>
            <p className={styles.stepDesc}>验证码已发送至 {email}</p>
            <Form form={codeForm} layout="vertical" className={styles.form}>
              <Form.Item
                name="code"
                rules={[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '验证码为6位数字' }
                ]}
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="请输入6位验证码"
                  size="large"
                  maxLength={6}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleVerifyCode}
                >
                  验证
                </Button>
              </Form.Item>
              <div className={styles.resendWrapper}>
                {countdown > 0 ? (
                  <span className={styles.countdown}>{countdown}秒后可重新发送</span>
                ) : (
                  <Button type="link" onClick={handleResendCode} loading={loading}>
                    重新发送验证码
                  </Button>
                )}
              </div>
            </Form>
          </div>
        )
      
      case 2:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>
              <LockOutlined />
            </div>
            <h2 className={styles.stepTitle}>设置新密码</h2>
            <p className={styles.stepDesc}>请设置您的新密码</p>
            <Form form={passwordForm} layout="vertical" className={styles.form}>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 8, message: '密码至少8位' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: '密码需包含大小写字母和数字'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入新密码"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    }
                  })
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请确认新密码"
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleResetPassword}
                >
                  重置密码
                </Button>
              </Form.Item>
            </Form>
          </div>
        )
      
      case 3:
        return (
          <div className={styles.stepContent}>
            <Result
              status="success"
              title="密码重置成功"
              subTitle="您的密码已成功重置，请使用新密码登录"
              extra={[
                <Button
                  type="primary"
                  key="login"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  返回登录
                </Button>
              ]}
            />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/login')}
            className={styles.backBtn}
          >
            返回登录
          </Button>
          <h1 className={styles.title}>重置密码</h1>
        </div>
        
        <Steps
          current={currentStep}
          className={styles.steps}
          items={[
            { title: '输入邮箱' },
            { title: '验证身份' },
            { title: '设置密码' },
            { title: '完成' }
          ]}
        />
        
        {renderStepContent()}
      </div>
    </div>
  )
}

export default ForgotPassword