import { useState, useEffect, useRef } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Tooltip,
  Avatar,
  InputNumber,
  Switch
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  UserOutlined,
  LockOutlined
} from '@ant-design/icons'
import {
  Role,
  pageRoles,
  createRole,
  updateRole,
  deleteRole,
  enableRole,
  disableRole,
  DATA_SCOPE_OPTIONS,
  RoleCreateRequest,
  RoleUpdateRequest
} from '@/services/api/role'
import styles from './index.module.css'

const { Title, Text } = Typography
const { TextArea } = Input

/**
 * 角色管理页面
 */
const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  
  // 使用 ref 防止重复请求
  const initialLoadDoneRef = useRef(false)
  const loadingRef = useRef(false)

  // 加载角色列表
  const loadRoles = async (page = 1, pageSize = 10, forceReload = false) => {
    // 防止重复请求（除非是强制刷新）
    if (!forceReload && (initialLoadDoneRef.current || loadingRef.current)) {
      return
    }
    
    loadingRef.current = true
    setLoading(true)
    try {
      const result = await pageRoles({
        pageNum: page,
        pageSize: pageSize
      })
      setRoles(result.records || [])
      setPagination({
        current: result.current,
        pageSize: result.size,
        total: result.total
      })
      initialLoadDoneRef.current = true
    } catch (error) {
      console.error('加载角色列表失败:', error)
      message.error('加载角色列表失败')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  // 打开新建/编辑弹窗
  const openModal = (role?: Role) => {
    setEditingRole(role || null)
    if (role) {
      form.setFieldsValue({
        name: role.name,
        code: role.code,
        sort: role.sort,
        dataScope: role.dataScope,
        remark: role.remark
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        sort: 0,
        dataScope: 1
      })
    }
    setModalVisible(true)
  }

  // 保存角色
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingRole) {
        const updateData: RoleUpdateRequest = {
          name: values.name,
          code: values.code,
          sort: values.sort,
          dataScope: values.dataScope,
          remark: values.remark
        }
        await updateRole(editingRole.id, updateData)
        message.success('更新角色成功')
      } else {
        const createData: RoleCreateRequest = {
          name: values.name,
          code: values.code,
          sort: values.sort,
          dataScope: values.dataScope,
          remark: values.remark
        }
        await createRole(createData)
        message.success('创建角色成功')
      }
      setModalVisible(false)
      loadRoles(pagination.current, pagination.pageSize, true)
    } catch (error) {
      console.error('保存角色失败:', error)
      message.error('保存角色失败')
    }
  }

  // 删除角色
  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id)
      message.success('删除角色成功')
      loadRoles(pagination.current, pagination.pageSize, true)
    } catch (error) {
      console.error('删除角色失败:', error)
      message.error('删除角色失败')
    }
  }

  // 切换角色状态
  const handleToggleStatus = async (role: Role) => {
    try {
      if (role.status === 1) {
        await disableRole(role.id)
        message.success('已禁用角色')
      } else {
        await enableRole(role.id)
        message.success('已启用角色')
      }
      loadRoles(pagination.current, pagination.pageSize, true)
    } catch (error) {
      console.error('切换角色状态失败:', error)
      message.error('切换角色状态失败')
    }
  }

  // 表格列配置
  const columns: TableColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#10B981' }}>
            <SafetyCertificateOutlined />
          </Avatar>
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.isSystem === 1 && (
            <Tag color="blue">系统内置</Tag>
          )}
        </Space>
      )
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <Tag color="default">{text}</Tag>
      )
    },
    {
      title: '数据范围',
      dataIndex: 'dataScope',
      key: 'dataScope',
      width: 150,
      render: (scope: number) => {
        const option = DATA_SCOPE_OPTIONS.find(o => o.value === scope)
        return option?.label || '-'
      }
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      align: 'center'
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count: number) => (
        <Space>
          <UserOutlined />
          <span>{count || 0}</span>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number, record: Role) => (
        <Switch
          checked={status === 1}
          onChange={() => handleToggleStatus(record)}
          disabled={record.isSystem === 1}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (text: string) => text || <Text type="secondary">-</Text>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Role) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              disabled={record.isSystem === 1}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除该角色吗？"
            description="删除后不可恢复，请谨慎操作"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.isSystem === 1}
          >
            <Tooltip title={record.isSystem === 1 ? '系统内置角色不可删除' : '删除'}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.isSystem === 1}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 处理表格分页变化
  const handleTableChange = (newPagination: any) => {
    loadRoles(newPagination.current, newPagination.pageSize, true)
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Title level={4} style={{ margin: 0 }}>
              <LockOutlined style={{ marginRight: 8 }} />
              角色管理
            </Title>
            <Text type="secondary">管理系统角色和权限配置</Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadRoles(pagination.current, pagination.pageSize, true)}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新建角色
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个角色`
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 新建/编辑角色弹窗 */}
      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[
              { required: true, message: '请输入角色名称' },
              { max: 50, message: '角色名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              { max: 50, message: '角色编码不能超过50个字符' },
              { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '角色编码必须以字母开头，只能包含字母、数字和下划线' }
            ]}
          >
            <Input placeholder="请输入角色编码，如：admin" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item
            name="dataScope"
            label="数据范围"
            rules={[{ required: true, message: '请选择数据范围' }]}
          >
            <Select
              placeholder="请选择数据范围"
              options={DATA_SCOPE_OPTIONS}
            />
          </Form.Item>
          <Form.Item
            name="sort"
            label="显示顺序"
          >
            <InputNumber min={0} max={999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
            rules={[{ max: 500, message: '备注不能超过500个字符' }]}
          >
            <TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RolesPage