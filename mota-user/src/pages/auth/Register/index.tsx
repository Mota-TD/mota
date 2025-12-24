import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, App } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { register as registerApi } from '@/services/api/auth'
import { ApiError } from '@/services/request'
import styles from './index.module.css'

/**
 * 注册页面 - 简化版
 * 仅需用户名、密码、确认密码即可注册
 * 邮箱为可选字段，用于找回密码
 */
const Register = () => {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // 处理注册提交
  const handleRegister = async (values: {
    username: string
    password: string
    confirmPassword: string
    email?: string
    agreement: boolean
  }) => {
    setLoading(true)
    try {
      await registerApi({
        username: values.username,
        email: values.email || '',
        password: values.password,
        confirmPassword: values.confirmPassword,
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

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerHeader}>
        <h2>创建账号</h2>
        <p>开始您的摩塔之旅</p>
      </div>

      <Form
        form={form}
        name="register"
        onFinish={handleRegister}
        size="large"
        layout="vertical"
        className={styles.registerForm}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' },
            { max: 20, message: '用户名最多20个字符' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱（可选）"
          rules={[
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入邮箱地址（用于找回密码）"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请设置密码（至少6位）"
            autoComplete="new-password"
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
            autoComplete="new-password"
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
          <Button type="primary" htmlType="submit" block loading={loading}>
            注册
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.registerFooter}>
        <p>已有账号？<Link to="/login">立即登录</Link></p>
      </div>
    </div>
  )
}

export default Register