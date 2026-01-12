/**
 * 项目设置抽屉组件
 */

import React, { useState, useEffect } from 'react'
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Tabs,
  Card,
  DatePicker,
  Popconfirm,
  Typography,
  message
} from 'antd'
import {
  SettingOutlined,
  WarningOutlined,
  SaveOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as projectApi from '@/services/api/project'
import type { Project } from '@/services/api/project'
import styles from './index.module.css'

const { TextArea } = Input
const { RangePicker } = DatePicker
const { Text } = Typography

// 项目颜色选项
const PROJECT_COLORS = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16',
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

export interface ProjectSettingsProps {
  visible: boolean
  project: Project | null
  onClose: () => void
  onSave?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  visible,
  project,
  onClose,
  onSave,
  onArchive,
  onDelete
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string>('#2b7de9')

  const isArchived = project?.status === 'archived'

  useEffect(() => {
    if (visible && project) {
      setSelectedColor(project.color || '#2b7de9')
      form.setFieldsValue({
        name: project.name,
        key: project.key,
        description: project.description,
        priority: project.priority || 'medium',
        visibility: project.visibility || 'private',
        dateRange: project.startDate && project.endDate
          ? [dayjs(project.startDate), dayjs(project.endDate)]
          : undefined,
      })
    }
  }, [visible, project, form])

  const handleSave = async () => {
    if (!project) return
    
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      await projectApi.updateProject(project.id, {
        name: values.name,
        description: values.description,
        color: selectedColor,
        priority: values.priority,
        visibility: values.visibility,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      })
      
      message.success('设置已保存')
      onClose()
      onSave?.()
    } catch (error) {
      console.error('Save settings error:', error)
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!project) return
    
    try {
      await projectApi.archiveProject(project.id)
      message.success('项目已归档')
      onClose()
      onArchive?.()
    } catch {
      message.error('归档失败')
    }
  }

  const handleDelete = async () => {
    if (!project) return
    
    try {
      await projectApi.deleteProject(project.id)
      message.success('项目已删除')
      onClose()
      onDelete?.()
    } catch {
      message.error('删除失败')
    }
  }

  return (
    <Drawer
      title="项目设置"
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSave}
            icon={<SaveOutlined />}
          >
            保存设置
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Tabs
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <SettingOutlined /> 基本设置
                </span>
              ),
              children: (
                <div>
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
                    extra="项目标识创建后不可修改"
                  >
                    <Input disabled />
                  </Form.Item>

                  <Form.Item name="description" label="项目描述">
                    <TextArea rows={4} placeholder="请输入项目描述" />
                  </Form.Item>

                  <Form.Item label="项目颜色">
                    <div className={styles.colorPicker}>
                      {PROJECT_COLORS.map(color => (
                        <div
                          key={color}
                          className={`${styles.colorItem} ${selectedColor === color ? styles.colorItemActive : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </Form.Item>

                  <Form.Item name="priority" label="优先级">
                    <Select
                      options={[
                        { value: 'low', label: '低' },
                        { value: 'medium', label: '中' },
                        { value: 'high', label: '高' },
                        { value: 'urgent', label: '紧急' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="visibility" label="可见性">
                    <Select
                      options={[
                        { value: 'private', label: '私有 - 仅项目成员可见' },
                        { value: 'internal', label: '内部 - 团队成员可见' },
                        { value: 'public', label: '公开 - 所有人可见' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name="dateRange" label="项目周期">
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              )
            },
            {
              key: 'danger',
              label: (
                <span style={{ color: '#ff4d4f' }}>
                  <WarningOutlined /> 危险操作
                </span>
              ),
              children: (
                <div className={styles.dangerZone}>
                  <Card size="small" className={styles.dangerCard}>
                    <div className={styles.dangerItem}>
                      <div>
                        <Text strong>归档项目</Text>
                        <br />
                        <Text type="secondary">
                          归档后项目将变为只读状态，可以随时恢复
                        </Text>
                      </div>
                      <Button onClick={handleArchive} disabled={isArchived}>
                        归档项目
                      </Button>
                    </div>
                  </Card>

                  <Card
                    size="small"
                    className={styles.dangerCard}
                    style={{ borderColor: '#ff4d4f' }}
                  >
                    <div className={styles.dangerItem}>
                      <div>
                        <Text strong style={{ color: '#ff4d4f' }}>
                          删除项目
                        </Text>
                        <br />
                        <Text type="secondary">
                          删除后所有数据将被永久清除，无法恢复
                        </Text>
                      </div>
                      <Popconfirm
                        title="确定要删除项目吗？"
                        description="此操作不可逆，所有数据将被永久删除"
                        onConfirm={handleDelete}
                        okText="确定删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button danger type="primary">
                          删除项目
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                </div>
              )
            }
          ]}
        />
      </Form>
    </Drawer>
  )
}

export default ProjectSettings