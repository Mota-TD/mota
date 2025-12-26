import { useState, useEffect } from 'react'
import { 
  Card, 
  Tabs, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber,
  message, 
  Popconfirm,
  Avatar,
  Typography,
  Descriptions,
  Spin,
  Empty,
  Tooltip,
  App
} from 'antd'
import { 
  UserOutlined, 
  PlusOutlined, 
  CopyOutlined, 
  DeleteOutlined,
  EditOutlined,
  TeamOutlined,
  LinkOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import {
  getCurrentEnterprise,
  getEnterpriseMembers,
  updateMemberRole,
  removeMember,
  createInvitation,
  getInvitations,
  revokeInvitation,
  Enterprise,
  EnterpriseMember,
  Invitation,
  CreateInvitationRequest
} from '@/services/api/enterprise'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

const EnterpriseManagement = () => {
  const { message: messageApi, modal } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null)
  const [members, setMembers] = useState<EnterpriseMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  
  // 邀请弹窗
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [inviteForm] = Form.useForm()
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [newInvitation, setNewInvitation] = useState<Invitation | null>(null)

  useEffect(() => {
    loadEnterprise()
  }, [])

  const loadEnterprise = async () => {
    setLoading(true)
    try {
      const data = await getCurrentEnterprise()
      setEnterprise(data)
      if (data) {
        loadMembers(data.id)
        loadInvitations(data.id)
      }
    } catch (error) {
      console.error('加载企业信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async (enterpriseId: number) => {
    setLoadingMembers(true)
    try {
      const data = await getEnterpriseMembers(enterpriseId)
      setMembers(data)
    } catch (error) {
      console.error('加载成员列表失败:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const loadInvitations = async (enterpriseId: number) => {
    setLoadingInvitations(true)
    try {
      const data = await getInvitations(enterpriseId)
      setInvitations(data)
    } catch (error) {
      console.error('加载邀请列表失败:', error)
    } finally {
      setLoadingInvitations(false)
    }
  }

  const handleUpdateRole = async (memberId: number, role: string) => {
    if (!enterprise) return
    try {
      await updateMemberRole(enterprise.id, memberId, role)
      messageApi.success('角色更新成功')
      loadMembers(enterprise.id)
    } catch (error) {
      messageApi.error('角色更新失败')
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!enterprise) return
    try {
      await removeMember(enterprise.id, memberId)
      messageApi.success('成员已移除')
      loadMembers(enterprise.id)
    } catch (error) {
      messageApi.error('移除成员失败')
    }
  }

  const handleCreateInvitation = async (values: CreateInvitationRequest) => {
    if (!enterprise) return
    setCreatingInvite(true)
    try {
      const invitation = await createInvitation(enterprise.id, values)
      setNewInvitation(invitation)
      messageApi.success('邀请创建成功')
      loadInvitations(enterprise.id)
    } catch (error) {
      messageApi.error('创建邀请失败')
    } finally {
      setCreatingInvite(false)
    }
  }

  const handleRevokeInvitation = async (invitationId: number) => {
    if (!enterprise) return
    try {
      await revokeInvitation(enterprise.id, invitationId)
      messageApi.success('邀请已撤销')
      loadInvitations(enterprise.id)
    } catch (error) {
      messageApi.error('撤销邀请失败')
    }
  }

  const copyInviteLink = (invitation: Invitation) => {
    const link = `${window.location.origin}/register?inviteCode=${invitation.inviteCode}`
    navigator.clipboard.writeText(link)
    messageApi.success('邀请链接已复制到剪贴板')
  }

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Tag icon={<CrownOutlined />} color="gold">超级管理员</Tag>
      case 'admin':
        return <Tag icon={<SafetyCertificateOutlined />} color="blue">管理员</Tag>
      default:
        return <Tag color="default">成员</Tag>
    }
  }

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="default">已失效</Tag>
      case 1:
        return <Tag color="success">有效</Tag>
      case 2:
        return <Tag color="warning">已用完</Tag>
      default:
        return <Tag color="default">未知</Tag>
    }
  }

  const memberColumns: ColumnsType<EnterpriseMember> = [
    {
      title: '成员',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div>{record.nickname || record.username}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role),
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      render: (text) => text || '-',
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
    },
    {
      title: '邀请人',
      dataIndex: 'invitedByName',
      key: 'invitedByName',
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const isCurrentUserSuperAdmin = enterprise?.currentUserRole === 'super_admin'
        const isCurrentUserAdmin = enterprise?.currentUserRole === 'admin' || isCurrentUserSuperAdmin
        const isSuperAdmin = record.role === 'super_admin'

        if (!isCurrentUserAdmin || isSuperAdmin) {
          return null
        }

        return (
          <Space>
            {isCurrentUserSuperAdmin && (
              <Select
                size="small"
                value={record.role}
                style={{ width: 100 }}
                onChange={(value) => handleUpdateRole(record.id, value)}
                options={[
                  { value: 'admin', label: '管理员' },
                  { value: 'member', label: '成员' },
                ]}
              />
            )}
            <Popconfirm
              title="确定要移除该成员吗？"
              onConfirm={() => handleRemoveMember(record.id)}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                移除
              </Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  const invitationColumns: ColumnsType<Invitation> = [
    {
      title: '邀请码',
      dataIndex: 'inviteCode',
      key: 'inviteCode',
      render: (code) => (
        <Text code copyable>{code}</Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'inviteType',
      key: 'inviteType',
      render: (type) => {
        switch (type) {
          case 'link':
            return <Tag icon={<LinkOutlined />}>链接邀请</Tag>
          case 'email':
            return <Tag icon={<MailOutlined />}>邮件邀请</Tag>
          case 'phone':
            return <Tag icon={<PhoneOutlined />}>手机邀请</Tag>
          default:
            return <Tag>{type}</Tag>
        }
      },
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '使用情况',
      key: 'usage',
      render: (_, record) => (
        <span>
          {record.usedCount} / {record.maxUses === 0 ? '无限' : record.maxUses}
        </span>
      ),
    },
    {
      title: '过期时间',
      dataIndex: 'expiredAt',
      key: 'expiredAt',
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="复制邀请链接">
            <Button 
              type="link" 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => copyInviteLink(record)}
            >
              复制链接
            </Button>
          </Tooltip>
          {record.status === 1 && (
            <Popconfirm
              title="确定要撤销该邀请吗？"
              onConfirm={() => handleRevokeInvitation(record.id)}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                撤销
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    )
  }

  if (!enterprise) {
    return (
      <div className={styles.emptyContainer}>
        <Empty description="您还没有加入任何企业" />
      </div>
    )
  }

  const isAdmin = enterprise.currentUserRole === 'super_admin' || enterprise.currentUserRole === 'admin'

  return (
    <div className={styles.container}>
      <Card className={styles.headerCard}>
        <div className={styles.enterpriseHeader}>
          <Avatar 
            size={64} 
            src={enterprise.logo} 
            icon={<TeamOutlined />}
            className={styles.enterpriseLogo}
          />
          <div className={styles.enterpriseInfo}>
            <Title level={3} style={{ margin: 0 }}>
              {enterprise.name}
              {enterprise.verified === 1 && (
                <Tag color="blue" style={{ marginLeft: 8 }}>已认证</Tag>
              )}
            </Title>
            <Space>
              <Text type="secondary">{enterprise.industryName}</Text>
              <Text type="secondary">·</Text>
              <Text type="secondary">{enterprise.memberCount} 名成员</Text>
              <Text type="secondary">·</Text>
              {getRoleTag(enterprise.currentUserRole || 'member')}
            </Space>
          </div>
        </div>
      </Card>

      <Card className={styles.contentCard}>
        <Tabs defaultActiveKey="members">
          <TabPane 
            tab={<span><TeamOutlined />成员管理</span>} 
            key="members"
          >
            <div className={styles.tableHeader}>
              <Title level={5}>企业成员 ({members.length})</Title>
              {isAdmin && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setNewInvitation(null)
                    inviteForm.resetFields()
                    setInviteModalVisible(true)
                  }}
                >
                  邀请成员
                </Button>
              )}
            </div>
            <Table
              columns={memberColumns}
              dataSource={members}
              rowKey="id"
              loading={loadingMembers}
              pagination={false}
            />
          </TabPane>

          {isAdmin && (
            <TabPane 
              tab={<span><LinkOutlined />邀请管理</span>} 
              key="invitations"
            >
              <div className={styles.tableHeader}>
                <Title level={5}>邀请列表 ({invitations.length})</Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setNewInvitation(null)
                    inviteForm.resetFields()
                    setInviteModalVisible(true)
                  }}
                >
                  创建邀请
                </Button>
              </div>
              <Table
                columns={invitationColumns}
                dataSource={invitations}
                rowKey="id"
                loading={loadingInvitations}
                pagination={false}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>

      {/* 创建邀请弹窗 */}
      <Modal
        title={newInvitation ? "邀请创建成功" : "邀请成员加入企业"}
        open={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false)
          setNewInvitation(null)
        }}
        footer={newInvitation ? [
          <Button key="close" onClick={() => {
            setInviteModalVisible(false)
            setNewInvitation(null)
          }}>
            关闭
          </Button>,
          <Button 
            key="copy" 
            type="primary" 
            icon={<CopyOutlined />}
            onClick={() => copyInviteLink(newInvitation)}
          >
            复制邀请链接
          </Button>
        ] : null}
      >
        {newInvitation ? (
          <div className={styles.inviteSuccess}>
            <div className={styles.inviteCodeBox}>
              <Text type="secondary">邀请码</Text>
              <Title level={3} copyable>{newInvitation.inviteCode}</Title>
            </div>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="邀请链接">
                <Text copyable={{ text: `${window.location.origin}/register?inviteCode=${newInvitation.inviteCode}` }}>
                  {`${window.location.origin}/register?inviteCode=${newInvitation.inviteCode}`}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="角色">{newInvitation.roleName}</Descriptions.Item>
              <Descriptions.Item label="使用次数">
                {newInvitation.maxUses === 0 ? '无限制' : `最多 ${newInvitation.maxUses} 次`}
              </Descriptions.Item>
              <Descriptions.Item label="过期时间">
                {new Date(newInvitation.expiredAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <Form
            form={inviteForm}
            layout="vertical"
            onFinish={handleCreateInvitation}
            initialValues={{
              inviteType: 'link',
              role: 'member',
              maxUses: 10,
              validDays: 7,
            }}
          >
            <Form.Item
              name="inviteType"
              label="邀请方式"
            >
              <Select
                options={[
                  { value: 'link', label: '链接邀请' },
                  { value: 'email', label: '邮件邀请' },
                  { value: 'phone', label: '手机邀请' },
                ]}
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.inviteType !== currentValues.inviteType}
            >
              {({ getFieldValue }) => {
                const inviteType = getFieldValue('inviteType')
                if (inviteType === 'email') {
                  return (
                    <Form.Item
                      name="targetEmail"
                      label="目标邮箱"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <Input placeholder="请输入被邀请人的邮箱" />
                    </Form.Item>
                  )
                }
                if (inviteType === 'phone') {
                  return (
                    <Form.Item
                      name="targetPhone"
                      label="目标手机号"
                      rules={[{ required: true, message: '请输入手机号' }]}
                    >
                      <Input placeholder="请输入被邀请人的手机号" />
                    </Form.Item>
                  )
                }
                return null
              }}
            </Form.Item>

            <Form.Item
              name="role"
              label="邀请角色"
            >
              <Select
                options={[
                  { value: 'member', label: '成员' },
                  { value: 'admin', label: '管理员' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="maxUses"
              label="最大使用次数"
              extra="设置为 0 表示无限制"
            >
              <InputNumber min={0} max={1000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="validDays"
              label="有效天数"
            >
              <InputNumber min={1} max={365} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={creatingInvite} block>
                创建邀请
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default EnterpriseManagement