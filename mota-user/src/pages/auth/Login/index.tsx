import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, App, Alert } from 'antd'
import { MobileOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import { login as loginApi } from '@/services/api/auth'
import { ApiError } from '@/services/request'
import styles from './index.module.css'

/**
 * 登录页面 - 手机号+密码登录
 */
const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // 手机号校验规则
  const phoneValidator = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入手机号'))
    }
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error('请输入正确的11位手机号'))
    }
    return Promise.resolve()
  }

  // 密码校验规则：6~18位
  const passwordValidator = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入密码'))
    }
    if (value.length < 6 || value.length > 18) {
      return Promise.reject(new Error('密码长度为6~18位'))
    }
    return Promise.resolve()
  }

  // 手机号+密码登录
  const handleAccountLogin = async (values: { phone: string; password: string; remember: boolean }) => {
    setLoading(true)
    setLoginError(null)
    try {
      const res = await loginApi({
        username: values.phone, // 使用手机号作为用户名
        password: values.password,
        rememberMe: values.remember,
      })
      
      // 转换用户信息格式
      const user = {
        id: res.userId,
        name: res.nickname || res.username,
        email: res.username,
        avatar: res.avatar,
        role: 'admin', // 默认角色，后续可从后端获取
      }
      
      login(user, res.accessToken)
      message.success('登录成功')
      // Use replace to prevent going back to login page
      navigate('/dashboard', { replace: true })
    } catch (error) {
      let errorMsg = '登录失败，请重试'
      if (error instanceof ApiError) {
        errorMsg = error.message || '用户名或密码错误'
      } else if (error instanceof Error) {
        errorMsg = '网络错误，请检查网络连接后重试'
      }
      setLoginError(errorMsg)
      message.error(errorMsg)
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

      {loginError && (
        <Alert
          message={loginError}
          type="error"
          showIcon
          closable
          onClose={() => setLoginError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        name="accountLogin"
        initialValues={{ remember: true }}
        onFinish={handleAccountLogin}
        size="large"
      >
        <Form.Item
          name="phone"
          rules={[{ validator: phoneValidator }]}
        >
          <Input
            prefix={<MobileOutlined />}
            placeholder="请输入手机号"
            maxLength={11}
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ validator: passwordValidator }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码（6~18位）"
            autoComplete="current-password"
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