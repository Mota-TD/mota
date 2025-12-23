import { useState, useEffect } from 'react'
import { Card, Table, Button, Input, Space, Tag, Avatar, Modal, Form, Select, message, Dropdown, Popconfirm } from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  MoreOutlined,
  UserOutlined,
  MailOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons'
import * as userApi from '@/services/api/user'
import styles from './index.module.css'

interface Member {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

const roleOptions = [
  { value: 'admin', label: '管理员', color: 'red' },
  { value: 'pm', label: '项目经理', color: 'orange' },
  { value: 'developer', label: '开发者', color: 'blue' },
  { value: 'designer', label: '设计师', color: 'green' },
  { value: 'member', label: '成员', color: 'default' },
]

const MembersPage = () => {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const res = await userApi.getUsers()
      const membersList = (res as any).list || res || []
      setMembers(membersList)
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleInfo = (role: string) => {
    return roleOptions.find(r => r.value === role) || { label: role, color: 'default' }
  }

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.email.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleAdd = () => {
    setEditingMember(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    form.setFieldsValue(member)
    setIsModalOpen(true)
  }

  const handleDelete = (member: Member) => {
    setMembers(members.filter(m => m.id !== member.id))
    message.success('成员已移除')
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingMember) {
        // 编辑成员
        setMembers(members.map(m => 
          m.id === editingMember.id ? { ...m, ...values } : m
        ))
        message.success('成员信息已更新')
      } else {
        // 添加成员
        const newMember: Member = {
          id: members.length + 1,
          name: values.name,
          email: values.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          role: values.role
        }
        setMembers([...members, newMember])
        message.success('成员已添加')
      }
      
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
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
            <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
          </div>
        </Space>
      )
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

      <Modal
        title={editingMember ? '编辑成员' : '添加成员'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
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
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色" options={roleOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MembersPage