import { useState } from 'react'
import { Card, Form, Input, Button, Select, Switch, Divider, Tabs, Popconfirm, ColorPicker, App } from 'antd'
import {
  SaveOutlined,
  DeleteOutlined,
  SettingOutlined,
  BellOutlined,
  SafetyOutlined,
  TeamOutlined,
  BgColorsOutlined,
  ApartmentOutlined
} from '@ant-design/icons'
import type { Color } from 'antd/es/color-picker'
import ThemeSwitch from '@/components/ThemeSwitch'
import WorkflowEditor from '@/components/WorkflowEditor'
import styles from './index.module.css'

const { TextArea } = Input
const { Option } = Select

const SettingsPage = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [projectColor, setProjectColor] = useState<string>('#2b7de9')

  // 模拟项目数据
  const initialValues = {
    name: '前端项目',
    key: 'FE',
    description: 'Web 前端应用开发，包括用户界面、交互逻辑等',
    visibility: 'private',
    defaultBranch: 'main',
    enableIssues: true,
    enableWiki: true,
    enableIterations: true,
    notifyOnIssueCreate: true,
    notifyOnIssueUpdate: true,
    notifyOnComment: true,
    notifyOnMention: true,
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await form.validateFields()
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success('设置已保存')
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    message.success('项目已删除')
  }

  const handleColorChange = (color: Color) => {
    setProjectColor(color.toHexString())
  }

  const items = [
    {
      key: 'general',
      label: (
        <span>
          <SettingOutlined />
          基本设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="key"
            label="项目标识"
            rules={[{ required: true, message: '请输入项目标识' }]}
            extra="项目标识用于事项编号前缀，如 FE-1001"
          >
            <Input placeholder="请输入项目标识" style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <TextArea rows={4} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item
            label="项目颜色"
          >
            <ColorPicker value={projectColor} onChange={handleColorChange} />
          </Form.Item>

          <Form.Item
            name="visibility"
            label="可见性"
          >
            <Select style={{ width: 200 }}>
              <Option value="private">私有 - 仅项目成员可见</Option>
              <Option value="internal">内部 - 团队成员可见</Option>
              <Option value="public">公开 - 所有人可见</Option>
            </Select>
          </Form.Item>

          <Divider />

          <h3>功能开关</h3>

          <Form.Item
            name="enableIssues"
            label="启用事项管理"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enableWiki"
            label="启用知识库"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enableIterations"
            label="启用迭代管理"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>
      )
    },
    {
      key: 'appearance',
      label: (
        <span>
          <BgColorsOutlined />
          外观设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <h3>主题设置</h3>
          
          <Form.Item
            label="主题模式"
            extra="选择您喜欢的主题模式，支持亮色、暗色和跟随系统"
          >
            <ThemeSwitch showLabel size="middle" />
          </Form.Item>

          <Divider />

          <h3>显示设置</h3>
          
          <Form.Item
            name="compactMode"
            label="紧凑模式"
            valuePropName="checked"
            extra="启用后界面元素间距更小，显示更多内容"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="showSidebar"
            label="显示侧边栏"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>
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
          <h3>事项通知</h3>
          
          <Form.Item
            name="notifyOnIssueCreate"
            label="创建事项时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="notifyOnIssueUpdate"
            label="更新事项时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="notifyOnComment"
            label="评论时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="notifyOnMention"
            label="被@时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>
      )
    },
    {
      key: 'permissions',
      label: (
        <span>
          <SafetyOutlined />
          权限设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <h3>默认权限</h3>
          
          <Form.Item
            label="新成员默认角色"
          >
            <Select defaultValue="developer" style={{ width: 200 }}>
              <Option value="admin">管理员</Option>
              <Option value="developer">开发者</Option>
              <Option value="designer">设计师</Option>
              <Option value="viewer">只读成员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="谁可以创建事项"
          >
            <Select defaultValue="all" style={{ width: 200 }}>
              <Option value="all">所有成员</Option>
              <Option value="admin">仅管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="谁可以删除事项"
          >
            <Select defaultValue="admin" style={{ width: 200 }}>
              <Option value="all">所有成员</Option>
              <Option value="admin">仅管理员</Option>
              <Option value="owner">仅创建者和管理员</Option>
            </Select>
          </Form.Item>
        </div>
      )
    },
    {
      key: 'workflow',
      label: (
        <span>
          <ApartmentOutlined />
          工作流设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <h3>自定义工作流</h3>
          <p style={{ color: '#666', marginBottom: 16 }}>
            配置任务状态和流转规则，定义任务从创建到完成的流程
          </p>
          <WorkflowEditor />
        </div>
      )
    },
    {
      key: 'members',
      label: (
        <span>
          <TeamOutlined />
          成员管理
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <p>成员管理功能请前往 <a href="/members">成员管理</a> 页面</p>
        </div>
      )
    },
    {
      key: 'danger',
      label: (
        <span style={{ color: '#ff4d4f' }}>
          <DeleteOutlined />
          危险操作
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <div className={styles.dangerZone}>
            <h3>危险区域</h3>
            <p>以下操作不可逆，请谨慎操作</p>
            
            <div className={styles.dangerItem}>
              <div>
                <h4>归档项目</h4>
                <p>归档后项目将变为只读状态，可以随时恢复</p>
              </div>
              <Button danger>归档项目</Button>
            </div>
            
            <Divider />
            
            <div className={styles.dangerItem}>
              <div>
                <h4>删除项目</h4>
                <p>删除后所有数据将被永久清除，无法恢复</p>
              </div>
              <Popconfirm
                title="确定要删除项目吗？"
                description="此操作不可逆，所有数据将被永久删除"
                onConfirm={handleDelete}
                okText="确定删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger type="primary">删除项目</Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h2>项目设置</h2>
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

export default SettingsPage