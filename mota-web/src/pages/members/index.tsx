import { useState, useEffect, useRef } from 'react'
import { Card, Table, Button, Input, Space, Tag, Avatar, Modal, Form, Select, Dropdown, Popconfirm, App, Divider, Empty } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  ApartmentOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import * as userApi from '@/services/api/user'
import * as departmentApi from '@/services/api/department'
import styles from './index.module.css'

interface Member {
  id: number
  name?: string
  username?: string
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  role?: string
  departmentId?: string
  departmentName?: string
  status?: string
}

interface Department {
  id: string
  name: string
}

// 默认角色选项
const roleOptions = [
  { value: 'super_admin', label: '超级管理员', color: 'gold' },
  { value: 'admin', label: '管理员', color: 'red' },
  { value: 'member', label: '普通员工', color: 'default' },
]

const MembersPage = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepts, setLoadingDepts] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [form] = Form.useForm()
  
  // 使用 ref 防止重复请求
  const membersLoadedRef = useRef(false)
  const deptsLoadedRef = useRef(false)
  const loadingMembersRef = useRef(false)
  const loadingDeptsRef = useRef(false)

  useEffect(() => {
    // 加载成员（只加载一次）
    if (!membersLoadedRef.current && !loadingMembersRef.current) {
      loadMembers()
    }
    // 加载部门（只加载一次）
    if (!deptsLoadedRef.current && !loadingDeptsRef.current) {
      loadDepartments()
    }
  }, [])

  const loadMembers = async (forceReload = false) => {
    // 防止重复请求（除非是强制刷新）
    if (!forceReload && (membersLoadedRef.current || loadingMembersRef.current)) {
      return
    }
    
    loadingMembersRef.current = true
    setLoading(true)
    try {
      const res = await userApi.getUsers()
      const membersList = (res as any).list || res || []
      // 转换字段名以匹配前端接口
      const transformedList = membersList.map((user: any) => ({
        ...user,
        name: user.name || user.nickname || user.username || '未知用户',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        role: user.role || 'member'
      }))
      setMembers(transformedList)
      membersLoadedRef.current = true
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
      loadingMembersRef.current = false
    }
  }

  const loadDepartments = async () => {
    // 防止重复请求
    if (deptsLoadedRef.current || loadingDeptsRef.current) {
      return
    }
    
    loadingDeptsRef.current = true
    setLoadingDepts(true)
    try {
      // 从API加载部门，与部门管理页面使用相同的 orgId
      const depts = await departmentApi.getDepartmentsByOrgId('default')
      setDepartments((depts || []).map(d => ({ id: d.id, name: d.name })))
      deptsLoadedRef.current = true
    } catch (error) {
      console.error('加载部门列表失败:', error)
      setDepartments([])
    } finally {
      setLoadingDepts(false)
      loadingDeptsRef.current = false
    }
  }

  const getRoleInfo = (role: string) => {
    return roleOptions.find(r => r.value === role) || { label: role, color: 'default' }
  }

  const filteredMembers = members.filter(m => {
    const name = m.name || m.nickname || m.username || ''
    const phone = m.phone || ''
    const email = m.email || ''
    return name.toLowerCase().includes(searchText.toLowerCase()) ||
           phone.includes(searchText) ||
           email.toLowerCase().includes(searchText.toLowerCase())
  })

  const handleAdd = () => {
    setEditingMember(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    form.setFieldsValue({
      name: member.name || member.nickname,
      phone: member.phone,
      email: member.email,
      departmentId: member.departmentId,
      role: member.role
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (member: Member) => {
    try {
      // 调用真实API删除用户
      await userApi.deleteUser(member.id)
      // 更新本地状态
      setMembers(members.filter(m => m.id !== member.id))
      message.success('成员已移除')
    } catch (error: any) {
      console.error('Delete failed:', error)
      message.error(error?.message || '移除成员失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      // 获取部门名称
      const dept = departments.find(d => d.id === values.departmentId)
      const departmentName = dept?.name || ''
      
      if (editingMember) {
        // 调用真实API更新用户
        await userApi.updateUser(editingMember.id, {
          nickname: values.name,
          phone: values.phone,
          email: values.email,
        })
        // 更新本地状态
        setMembers(members.map(m =>
          m.id === editingMember.id ? {
            ...m,
            name: values.name,
            nickname: values.name,
            phone: values.phone,
            email: values.email,
            departmentId: values.departmentId,
            departmentName: departmentName,
            role: values.role
          } : m
        ))
        message.success('成员信息已更新')
      } else {
        // 调用真实API创建用户
        const newUser = await userApi.createUser({
          nickname: values.name,
          phone: values.phone,
          email: values.email,
          password: values.password, // 密码
        } as any)
        // 添加到本地状态
        const newMember: Member = {
          id: Number(newUser.id),
          name: values.name,
          nickname: values.name,
          phone: values.phone,
          email: values.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          departmentId: values.departmentId,
          departmentName: departmentName,
          role: values.role
        }
        setMembers([...members, newMember])
        message.success('成员已添加')
      }
      
      setIsModalOpen(false)
      form.resetFields()
    } catch (error: any) {
      console.error('Save failed:', error)
      message.error(error?.message || '保存失败')
    }
  }

  const columns = [
    {
      title: '成员',
      key: 'member',
      render: (_: unknown, record: Member) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.phone || record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text: string) => text || '-'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleInfo = getRoleInfo(role)
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
      },
      filters: roleOptions.map(r => ({ text: r.label, value: r.value })),
      onFilter: (value: unknown, record: Member) => record.role === value
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Member) => (
        <Dropdown menu={{
          items: [
            { 
              key: 'edit', 
              label: '编辑', 
              icon: <EditOutlined />,
              onClick: () => handleEdit(record)
            },
            { 
              key: 'delete', 
              label: (
                <Popconfirm
                  title="确定要移除该成员吗？"
                  onConfirm={() => handleDelete(record)}
                  okText="确定"
                  cancelText="取消"
                >
                  <span>移除</span>
                </Popconfirm>
              ), 
              icon: <DeleteOutlined />,
              danger: true
            }
          ]
        }}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>成员管理</h2>
            <span className={styles.count}>共 {members.length} 名成员</span>
          </div>
          <Space>
            <Input
              placeholder="搜索成员..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadMembers(true)}
              disabled={loading}
            >
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加成员
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      {/* 添加/编辑成员弹窗 */}
      <Modal
        title={editingMember ? '编辑成员' : '添加成员'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号（用于登录）"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          
          {!editingMember && (
            <Form.Item
              name="password"
              label="登录密码"
              rules={[
                { required: true, message: '请输入登录密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入登录密码" />
            </Form.Item>
          )}
          
          <Form.Item
            name="email"
            label="邮箱（可选）"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            name="departmentId"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <Select
              placeholder="请选择所属部门"
              loading={loadingDepts}
              notFoundContent={
                <Empty description="暂无部门，请先在部门管理中创建" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<ApartmentOutlined />}
                    onClick={() => navigate('/departments')}
                  >
                    前往部门管理
                  </Button>
                </Empty>
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button
                    type="link"
                    icon={<ApartmentOutlined />}
                    onClick={() => navigate('/departments')}
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    前往部门管理
                  </Button>
                </>
              )}
            >
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  <Space>
                    <ApartmentOutlined />
                    {dept.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="member"
          >
            <Select placeholder="请选择角色" options={roleOptions} />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  )
}

export default MembersPage