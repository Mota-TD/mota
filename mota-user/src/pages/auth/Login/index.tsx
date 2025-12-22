import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import { userApi } from '@/services/mock/api'
import styles from './index.module.css'

/**
 * 登录页面 - 简洁版
 */
const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  // 默认登录账号
  const defaultCredentials = {
    email: 'admin@mota.com',
    password: '123456',
    remember: true
  }

  // 账号密码登录
  const handleAccountLogin = async (values: { email: string; password: string; remember: boolean }) => {
    setLoading(true)
    try {
      const res = await userApi.login(values.email, values.password)
      login(res.data.user, res.data.token)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginHeader}>
        <h2>欢迎回来</h2>
        <p>登录您的摩塔账户，开启智能协作之旅</p>
      </div>

      <Form
        name="accountLogin"
        initialValues={defaultCredentials}
        onFinish={handleAccountLogin}
        size="large"
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: '请输入邮箱或手机号' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入邮箱或手机号"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item>
          <div className={styles.loginOptions}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Link to="/forgot-password" className={styles.forgotLink}>
              忘记密码？
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.loginFooter}>
        <p>还没有账号？<Link to="/register">立即注册</Link></p>
      </div>
    </div>
  )
}

export default Login