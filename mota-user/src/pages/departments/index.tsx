import { useState, useEffect } from 'react'
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
  Tree,
  Row,
  Col,
  Typography,
  Tooltip,
  Avatar
} from 'antd'
import type { TableColumnsType } from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ApartmentOutlined,
  UserOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import {
  Department,
  getDepartmentsByOrgId,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '@/services/api/department'
import styles from './index.module.css'

const { Title, Text } = Typography
const { TextArea } = Input

/**
 * 部门管理页面
 */
const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [form] = Form.useForm()
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table')

  // 加载部门列表
  const loadDepartments = async () => {
    setLoading(true)
    try {
      // 使用默认组织ID 'default'，与成员管理页面保持一致
      const data = await getDepartmentsByOrgId('default')
      setDepartments(data || [])
    } catch (error) {
      console.error('加载部门列表失败:', error)
      message.error('加载部门列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  // 打开新建/编辑弹窗
  const openModal = (department?: Department) => {
    setEditingDepartment(department || null)
    if (department) {
      form.setFieldsValue({
        name: department.name,
        parentId: department.parentId,
        description: department.description,
        managerId: department.managerId
      })
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  // 保存部门
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, values)
        message.success('更新部门成功')
      } else {
        await createDepartment({
          ...values,
          orgId: 'default' // 默认组织ID，与成员管理页面保持一致
        })
        message.success('创建部门成功')
      }
      setModalVisible(false)
      loadDepartments()
    } catch (error) {
      console.error('保存部门失败:', error)
      message.error('保存部门失败')
    }
  }

  // 删除部门
  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id)
      message.success('删除部门成功')
      loadDepartments()
    } catch (error) {
      console.error('删除部门失败:', error)
      message.error('删除部门失败')
    }
  }

  // 构建树形数据
  const buildTreeData = (depts: Department[], parentId: string | undefined = undefined): DataNode[] => {
    return depts
      .filter(d => d.parentId === parentId)
      .map(d => ({
        key: d.id,
        title: (
          <Space>
            <TeamOutlined />
            <span>{d.name}</span>
            <Tag color="blue">{d.memberCount || 0}人</Tag>
          </Space>
        ),
        children: buildTreeData(depts, d.id)
      }))
  }

  // 表格列配置
  const columns: TableColumnsType<Department> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#10B981' }}>
            <TeamOutlined />
          </Avatar>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      )
    },
    {
      title: '上级部门',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId: string) => {
        if (!parentId) return <Text type="secondary">-</Text>
        const parent = departments.find(d => d.id === parentId)
        return parent?.name || '-'
      }
    },
    {
      title: '部门人数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      render: (count: number) => (
        <Tag color="blue">{count || 0}人</Tag>
      )
    },
    {
      title: '部门负责人',
      dataIndex: 'managerName',
      key: 'managerName',
      render: (name: string) => name ? (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{name}</span>
        </Space>
      ) : <Text type="secondary">未设置</Text>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
      width: 150,
      render: (_: unknown, record: Department) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除该部门吗？"
            description="删除后不可恢复，请谨慎操作"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 获取父部门选项（排除自己和子部门）
  const getParentOptions = () => {
    const excludeIds = new Set<string>()
    if (editingDepartment) {
      excludeIds.add(editingDepartment.id)
      // 递归获取所有子部门ID
      const getChildIds = (parentId: string) => {
        departments.forEach(d => {
          if (d.parentId === parentId) {
            excludeIds.add(d.id)
            getChildIds(d.id)
          }
        })
      }
      getChildIds(editingDepartment.id)
    }
    return departments
      .filter(d => !excludeIds.has(d.id))
      .map(d => ({ label: d.name, value: d.id }))
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Title level={4} style={{ margin: 0 }}>
              <ApartmentOutlined style={{ marginRight: 8 }} />
              部门管理
            </Title>
            <Text type="secondary">管理组织架构和部门信息</Text>
          </div>
          <Space>
            <Button
              icon={viewMode === 'table' ? <ApartmentOutlined /> : <TeamOutlined />}
              onClick={() => setViewMode(viewMode === 'table' ? 'tree' : 'table')}
            >
              {viewMode === 'table' ? '树形视图' : '列表视图'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadDepartments}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              新建部门
            </Button>
          </Space>
        </div>

        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={departments}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个部门`
            }}
            onRow={(record) => ({
              onClick: () => setSelectedDepartment(record),
              style: {
                cursor: 'pointer',
                backgroundColor: selectedDepartment?.id === record.id ? '#f0f9ff' : undefined
              }
            })}
          />
        ) : (
          <Row gutter={24}>
            <Col span={12}>
              <Card title="组织架构" size="small">
                <Tree
                  showLine
                  defaultExpandAll
                  treeData={buildTreeData(departments)}
                  onSelect={(keys) => {
                    if (keys.length > 0) {
                      const dept = departments.find(d => d.id === keys[0])
                      setSelectedDepartment(dept || null)
                    }
                  }}
                />
              </Card>
            </Col>
            <Col span={12}>
              {selectedDepartment ? (
                <Card title="部门详情" size="small">
                  <div className={styles.detailItem}>
                    <Text type="secondary">部门名称：</Text>
                    <Text strong>{selectedDepartment.name}</Text>
                  </div>
                  <div className={styles.detailItem}>
                    <Text type="secondary">部门人数：</Text>
                    <Tag color="blue">{selectedDepartment.memberCount || 0}人</Tag>
                  </div>
                  <div className={styles.detailItem}>
                    <Text type="secondary">部门负责人：</Text>
                    <Text>{selectedDepartment.managerName || '未设置'}</Text>
                  </div>
                  <div className={styles.detailItem}>
                    <Text type="secondary">描述：</Text>
                    <Text>{selectedDepartment.description || '-'}</Text>
                  </div>
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => openModal(selectedDepartment)}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确定删除该部门吗？"
                      onConfirm={() => handleDelete(selectedDepartment.id)}
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </Card>
              ) : (
                <Card size="small">
                  <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                    <ApartmentOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>请选择一个部门查看详情</div>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        )}
      </Card>

      {/* 新建/编辑部门弹窗 */}
      <Modal
        title={editingDepartment ? '编辑部门' : '新建部门'}
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
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item
            name="parentId"
            label="上级部门"
          >
            <Select
              placeholder="请选择上级部门（可选）"
              allowClear
              options={getParentOptions()}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="部门描述"
          >
            <TextArea rows={3} placeholder="请输入部门描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DepartmentsPage