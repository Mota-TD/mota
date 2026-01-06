import { useState, useEffect, useRef } from 'react'
import { Card, Form, Input, Button, Select, Switch, Divider, Tabs, Popconfirm, ColorPicker, App, Spin } from 'antd'
import {
  SaveOutlined,
  DeleteOutlined,
  SettingOutlined,
  BellOutlined,
  SafetyOutlined,
  TeamOutlined,
  BgColorsOutlined,
  ApartmentOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import type { Color } from 'antd/es/color-picker'
import ThemeSwitch from '@/components/ThemeSwitch'
import WorkflowEditor from '@/components/WorkflowEditor'
import * as projectApi from '@/services/api/project'
import * as notificationApi from '@/services/api/notification'
import styles from './index.module.css'

const { TextArea } = Input
const { Option } = Select

// 项目设置接口
interface ProjectSettings {
  id?: number
  name: string
  key: string
  description?: string
  visibility: string
  enableIssues: boolean
  enableWiki: boolean
  enableIterations: boolean
  color?: string
}

// 通知设置接口
interface NotificationSettings {
  notifyOnIssueCreate: boolean
  notifyOnIssueUpdate: boolean
  notifyOnComment: boolean
  notifyOnMention: boolean
}

const SettingsPage = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [projectColor, setProjectColor] = useState<string>('#2b7de9')
  const [projectId, setProjectId] = useState<number | null>(null)

  // 加载项目设置
  const loadSettings = async (forceReload = false) => {
    if (!forceReload && (settingsLoadedRef.current || loadingSettingsRef.current)) {
      return
    }
    loadingSettingsRef.current = true
    setPageLoading(true)
    try {
      // 获取当前项目ID（从URL或默认项目）
      const urlParams = new URLSearchParams(window.location.search)
      const pid = urlParams.get('projectId')
      
      if (pid) {
        setProjectId(Number(pid))
        // 调用真实API获取项目详情
        const projectData = await projectApi.getProject(Number(pid))
        
        // 获取通知偏好设置
        let notificationPrefs = {
          notifyOnIssueCreate: true,
          notifyOnIssueUpdate: true,
          notifyOnComment: true,
          notifyOnMention: true,
        }
        
        try {
          // 使用当前用户ID获取通知偏好
          const userId = 1 // TODO: 从用户状态获取
          const prefs = await notificationApi.getNotificationPreferences(userId)
          notificationPrefs = {
            notifyOnIssueCreate: prefs.autoPinUrgent ?? true,
            notifyOnIssueUpdate: prefs.enableAggregation ?? true,
            notifyOnComment: prefs.enableAIClassification ?? true,
            notifyOnMention: prefs.autoPinMentions ?? true,
          }
        } catch (e) {
          console.warn('Failed to load notification preferences, using defaults')
        }
        
        form.setFieldsValue({
          name: projectData.name,
          key: projectData.key || projectData.name?.substring(0, 3).toUpperCase(),
          description: projectData.description,
          visibility: projectData.visibility || 'private',
          enableIssues: true,
          enableWiki: true,
          enableIterations: true,
          ...notificationPrefs
        })
        
        if (projectData.color) {
          setProjectColor(projectData.color)
        }
      } else {
        // 没有项目ID时使用默认值
        form.setFieldsValue({
          name: '前端项目',
          key: 'FE',
          description: 'Web 前端应用开发，包括用户界面、交互逻辑等',
          visibility: 'private',
          enableIssues: true,
          enableWiki: true,
          enableIterations: true,
          notifyOnIssueCreate: true,
          notifyOnIssueUpdate: true,
          notifyOnComment: true,
          notifyOnMention: true,
        })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      message.error('加载设置失败，使用默认值')
      // 使用默认值
      form.setFieldsValue({
        name: '前端项目',
        key: 'FE',
        description: 'Web 前端应用开发，包括用户界面、交互逻辑等',
        visibility: 'private',
        enableIssues: true,
        enableWiki: true,
        enableIterations: true,
        notifyOnIssueCreate: true,
        notifyOnIssueUpdate: true,
        notifyOnComment: true,
        notifyOnMention: true,
      })
    } finally {
      setPageLoading(false)
      loadingSettingsRef.current = false
      settingsLoadedRef.current = true
    }
  }

  // 防止重复请求的 ref
  const settingsLoadedRef = useRef(false)
  const loadingSettingsRef = useRef(false)

  useEffect(() => {
    if (settingsLoadedRef.current || loadingSettingsRef.current) {
      return
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      // 保存项目设置
      const projectSettings: Partial<ProjectSettings> = {
        name: values.name,
        key: values.key,
        description: values.description,
        visibility: values.visibility,
        color: projectColor,
      }
      
      if (projectId) {
        // 调用真实API更新项目
        await projectApi.updateProject(projectId, projectSettings as any)
      } else {
        // 创建新项目
        const newProject = await projectApi.createProject(projectSettings as any)
        setProjectId(Number(newProject.id))
      }
      
      // 保存通知设置
      try {
        const userId = 1 // TODO: 从用户状态获取
        await notificationApi.updateNotificationPreferences(userId, {
          autoPinUrgent: values.notifyOnIssueCreate,
          enableAggregation: values.notifyOnIssueUpdate,
          enableAIClassification: values.notifyOnComment,
          autoPinMentions: values.notifyOnMention,
        })
      } catch (e) {
        console.warn('Failed to save notification preferences')
      }
      
      message.success('设置已保存')
    } catch (error: any) {
      console.error('Save failed:', error)
      message.error(error?.message || '保存设置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!projectId) {
      message.warning('没有可删除的项目')
      return
    }
    
    try {
      setLoading(true)
      await projectApi.deleteProject(projectId)
      message.success('项目已删除')
      // 跳转到项目列表
      window.location.href = '/projects'
    } catch (error: any) {
      console.error('Delete failed:', error)
      message.error(error?.message || '删除项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!projectId) {
      message.warning('没有可归档的项目')
      return
    }
    
    try {
      setLoading(true)
      await projectApi.archiveProject(projectId)
      message.success('项目已归档')
    } catch (error: any) {
      console.error('Archive failed:', error)
      message.error(error?.message || '归档项目失败')
    } finally {
      setLoading(false)
    }
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
              <Popconfirm
                title="确定要归档项目吗？"
                description="归档后项目将变为只读状态"
                onConfirm={handleArchive}
                okText="确定归档"
                cancelText="取消"
              >
                <Button danger loading={loading}>归档项目</Button>
              </Popconfirm>
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
                <Button danger type="primary" loading={loading}>删除项目</Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      )
    }
  ]

  if (pageLoading) {
    return (
      <div className={styles.container}>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#666' }}>加载设置中...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h2>项目设置</h2>
          <div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadSettings(true)}
              style={{ marginRight: 8 }}
              disabled={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存设置
            </Button>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
        >
          <Tabs items={items} />
        </Form>
      </Card>
    </div>
  )
}

export default SettingsPage