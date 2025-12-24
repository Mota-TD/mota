import { useState } from 'react'
import { Card, Form, Input, Button, Avatar, Upload, Tabs, Switch, Select, Divider, App } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UploadOutlined,
  LockOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import styles from './index.module.css'

const { Option } = Select

const ProfilePage = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=admin')

  // 模拟用户数据
  const initialValues = {
    name: '管理员',
    email: 'admin@mota.com',
    phone: '13800138000',
    department: '技术部',
    position: '高级工程师',
    bio: '热爱技术，专注于前端开发',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    emailNotify: true,
    browserNotify: true,
    issueNotify: true,
    mentionNotify: true,
    weeklyReport: false,
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await form.validateFields()
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success('个人信息已保存')
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields()
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB')
        return false
      }
      // 模拟上传
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string)
        message.success('头像上传成功')
      }
      reader.readAsDataURL(file)
      return false
    },
  }

  const items = [
    {
      key: 'basic',
      label: (
        <span>
          <UserOutlined />
          基本信息
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <div className={styles.avatarSection}>
            <Avatar size={100} src={avatarUrl} icon={<UserOutlined />} />
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>更换头像</Button>
            </Upload>
          </div>

          <Divider />

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="department"
            label="部门"
          >
            <Input placeholder="请输入部门" />
          </Form.Item>

          <Form.Item
            name="position"
            label="职位"
          >
            <Input placeholder="请输入职位" />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
          >
            <Input.TextArea rows={3} placeholder="介绍一下自己..." />
          </Form.Item>
        </div>
      )
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          安全设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <h3>修改密码</h3>
          <Form form={passwordForm} layout="vertical" style={{ maxWidth: 400 }}>
            <Form.Item
              name="currentPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[{ required: true, message: '请确认新密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={handlePasswordChange}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </div>
      )
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          通知设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <h3>通知方式</h3>
          
          <Form.Item
            name="emailNotify"
            label="邮件通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="browserNotify"
            label="浏览器通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <h3>通知类型</h3>

          <Form.Item
            name="issueNotify"
            label="事项更新通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="mentionNotify"
            label="@提及通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="weeklyReport"
            label="每周工作报告"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>
      )
    },
    {
      key: 'preferences',
      label: (
        <span>
          <SettingOutlined />
          偏好设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <Form.Item
            name="language"
            label="语言"
          >
            <Select style={{ width: 200 }}>
              <Option value="zh-CN">简体中文</Option>
              <Option value="zh-TW">繁體中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="timezone"
            label="时区"
          >
            <Select style={{ width: 200 }}>
              <Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Option>
              <Option value="Asia/Tokyo">日本标准时间 (UTC+9)</Option>
              <Option value="America/New_York">美国东部时间 (UTC-5)</Option>
              <Option value="Europe/London">格林威治时间 (UTC+0)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="主题"
          >
            <Select defaultValue="light" style={{ width: 200 }}>
              <Option value="light">浅色模式</Option>
              <Option value="dark">深色模式</Option>
              <Option value="auto">跟随系统</Option>
            </Select>
          </Form.Item>
        </div>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h2>个人设置</h2>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={loading}
          >
            保存设置
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
        >
          <Tabs items={items} />
        </Form>
      </Card>
    </div>
  )
}

export default ProfilePage