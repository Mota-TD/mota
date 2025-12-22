import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import { login as loginApi } from '@/services/api/auth'
import { ApiError } from '@/services/request'
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
    username: 'admin',
    password: 'password',
    remember: true
  }

  // 账号密码登录
  const handleAccountLogin = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true)
    try {
      const res = await loginApi({
        username: values.username,
        password: values.password,
        rememberMe: values.remember,
      })
      
      // 转换用户信息格式
      const user = {
        id: res.userId,
        name: res.nickname || res.username,
        email: res.username, // 后端返回的 username 可能是邮箱
        avatar: res.avatar,
        role: 'admin', // 默认角色，后续可从后端获取
      }
      
      login(user, res.accessToken)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message || '登录失败')
      } else {
        message.error('网络错误，请稍后重试')
      }
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
          name="username"
          rules={[{ required: true, message: '请输入用户名/邮箱/手机号' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入用户名/邮箱/手机号"
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
            <a
              href="#"
              className={styles.forgotLink}
              onClick={(e) => {
                e.preventDefault()
                message.info('请联系管理员重置密码')
              }}
            >
              忘记密码？
            </a>
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