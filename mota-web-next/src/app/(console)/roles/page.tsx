'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Table,
  Modal,
  Form,
  Select,
  message,
  Dropdown,
  Statistic,
  Tooltip,
  Spin,
  Empty,
  Switch,
  InputNumber,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  LoadingOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { roleService, type Role, DATA_SCOPE_OPTIONS } from '@/services';

const { Title, Text } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

export default function RolesPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 获取角色列表
  const fetchRoles = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await roleService.getRoles({
        pageNum: page,
        pageSize,
        name: searchText || undefined,
        status: statusFilter,
      });
      setRoleList(response.records || []);
      setPagination({
        current: response.current || page,
        pageSize: response.size || pageSize,
        total: response.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      message.error('获取角色列表失败');
      setRoleList([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSearch = () => {
    fetchRoles(1, pagination.pageSize);
  };

  const handleTableChange = (paginationConfig: any) => {
    fetchRoles(paginationConfig.current, paginationConfig.pageSize);
  };

  const handleCreateRole = async () => {
    try {
      const values = await form.validateFields();
      await roleService.createRole(values);
      message.success('角色创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
      message.error('角色创建失败');
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;
    try {
      const values = await editForm.validateFields();
      await roleService.updateRole(editingRole.id, values);
      message.success('角色更新成功');
      setEditModalVisible(false);
      setEditingRole(null);
      editForm.resetFields();
      fetchRoles(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to update role:', error);
      message.error('角色更新失败');
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await roleService.deleteRole(id);
      message.success('角色删除成功');
      fetchRoles(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete role:', error);
      message.error('角色删除失败');
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      if (role.status === 1) {
        await roleService.disableRole(role.id);
        message.success('角色已禁用');
      } else {
        await roleService.enableRole(role.id);
        message.success('角色已启用');
      }
      fetchRoles(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to toggle role status:', error);
      message.error('操作失败');
    }
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    editForm.setFieldsValue({
      name: role.name,
      code: role.code,
      sort: role.sort,
      dataScope: role.dataScope,
      remark: role.remark,
    });
    setEditModalVisible(true);
  };

  const getStatusTag = (status: number) => {
    if (status === 1) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>启用</Tag>;
    }
    return <Tag color="default" icon={<CloseCircleOutlined />}>禁用</Tag>;
  };

  const getDataScopeText = (dataScope: number) => {
    const option = DATA_SCOPE_OPTIONS.find(opt => opt.value === dataScope);
    return option?.label || '-';
  };

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <SafetyCertificateOutlined style={{ color: THEME_COLOR }} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '数据范围',
      dataIndex: 'dataScope',
      key: 'dataScope',
      render: (dataScope) => getDataScopeText(dataScope),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count) => (
        <Space>
          <TeamOutlined style={{ color: '#64748B' }} />
          {count || 0}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 100,
      render: (isSystem) => (
        isSystem === 1 ? (
          <Tag color="blue" icon={<LockOutlined />}>内置</Tag>
        ) : (
          <Tag icon={<UnlockOutlined />}>自定义</Tag>
        )
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 1 ? '禁用' : '启用'}>
            <Switch
              size="small"
              checked={record.status === 1}
              onChange={() => handleToggleStatus(record)}
              disabled={record.isSystem === 1}
            />
          </Tooltip>
          {record.isSystem !== 1 && (
            <Popconfirm
              title="确定要删除这个角色吗？"
              onConfirm={() => handleDeleteRole(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const enabledCount = roleList.filter(r => r.status === 1).length;
  const systemCount = roleList.filter(r => r.isSystem === 1).length;
  const customCount = roleList.filter(r => r.isSystem !== 1).length;

  if (loading && roleList.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SafetyCertificateOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>角色管理</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>管理系统角色和权限分配</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent' }}
        >
          新建角色
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="角色总数"
              value={pagination.total}
              prefix={<SafetyCertificateOutlined style={{ color: THEME_COLOR }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="启用角色"
              value={enabledCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="系统内置"
              value={systemCount}
              prefix={<LockOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="自定义角色"
              value={customCount}
              prefix={<SettingOutlined style={{ color: '#8B5CF6' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 角色列表 */}
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space wrap>
            <Input
              placeholder="搜索角色名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '禁用' },
              ]}
            />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
          </Space>
        </div>
        {roleList.length === 0 ? (
          <Empty description="暂无角色数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            columns={columns}
            dataSource={roleList}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个角色`,
            }}
            onChange={handleTableChange}
          />
        )}
      </Card>

      {/* 创建角色弹窗 */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: THEME_COLOR }} />
            新建角色
          </Space>
        }
        open={createModalVisible}
        onOk={handleCreateRole}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色编码只能包含字母、数字和下划线，且以字母或下划线开头' },
            ]}
          >
            <Input placeholder="请输入角色编码，如：admin、manager" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dataScope"
                label="数据范围"
                initialValue={5}
              >
                <Select options={DATA_SCOPE_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑角色弹窗 */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: THEME_COLOR }} />
            编辑角色
          </Space>
        }
        open={editModalVisible}
        onOk={handleEditRole}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRole(null);
          editForm.resetFields();
        }}
        width={500}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色编码只能包含字母、数字和下划线，且以字母或下划线开头' },
            ]}
          >
            <Input 
              placeholder="请输入角色编码" 
              disabled={editingRole?.isSystem === 1}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dataScope"
                label="数据范围"
              >
                <Select options={DATA_SCOPE_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}