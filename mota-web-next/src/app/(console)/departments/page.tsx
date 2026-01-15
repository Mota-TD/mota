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
  Empty,
  Tag,
  Avatar,
  Tree,
  Tabs,
  Modal,
  Form,
  Select,
  message,
  Dropdown,
  Statistic,
  Table,
  Spin,
  Switch,
  InputNumber,
  Popconfirm,
  Tooltip,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import {
  ApartmentOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  MoreOutlined,
  FolderOutlined,
  SettingOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { departmentService, roleService, type Department, type Role, DATA_SCOPE_OPTIONS } from '@/services';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 将部门列表转换为树形结构
function buildDepartmentTree(departments: Department[]): DataNode[] {
  const map = new Map<string, DataNode>();
  const roots: DataNode[] = [];

  // 首先创建所有节点
  departments.forEach((dept) => {
    map.set(dept.id, {
      title: dept.name,
      key: dept.id,
      icon: <FolderOutlined style={{ color: THEME_COLOR }} />,
      children: [],
    });
  });

  // 然后建立父子关系
  departments.forEach((dept) => {
    const node = map.get(dept.id);
    if (node) {
      if (dept.parentId && map.has(dept.parentId)) {
        const parent = map.get(dept.parentId);
        if (parent && parent.children) {
          (parent.children as DataNode[]).push(node);
        }
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
}

export default function DepartmentsPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [departmentTreeData, setDepartmentTreeData] = useState<DataNode[]>([]);
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<Department | null>(null);

  // 角色管理相关状态
  const [roleSearchText, setRoleSearchText] = useState('');
  const [roleStatusFilter, setRoleStatusFilter] = useState<number | undefined>();
  const [createRoleModalVisible, setCreateRoleModalVisible] = useState(false);
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm] = Form.useForm();
  const [editRoleForm] = Form.useForm();
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [rolePagination, setRolePagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 获取部门列表
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await departmentService.getDepartments();
      const departments = response.list || [];
      setDepartmentList(departments);
      setDepartmentTreeData(buildDepartmentTree(departments));
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      message.error('获取部门列表失败');
      setDepartmentList([]);
      setDepartmentTreeData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取角色列表
  const fetchRoles = useCallback(async (page = 1, pageSize = 10) => {
    setRoleLoading(true);
    try {
      const response = await roleService.getRoles({
        pageNum: page,
        pageSize,
        name: roleSearchText || undefined,
        status: roleStatusFilter,
      });
      setRoleList(response.records || []);
      setRolePagination({
        current: response.current || page,
        pageSize: response.size || pageSize,
        total: response.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      // 如果 API 失败，显示默认角色数据
      setRoleList([
        { id: '1', name: '超级管理员', code: 'super_admin', sort: 1, dataScope: 1, status: 1, isSystem: 1, remark: '系统最高权限' },
        { id: '2', name: '企业管理员', code: 'enterprise_admin', sort: 2, dataScope: 1, status: 1, isSystem: 1, remark: '企业级管理权限' },
        { id: '3', name: '部门经理', code: 'dept_manager', sort: 3, dataScope: 3, status: 1, isSystem: 1, remark: '部门管理权限' },
        { id: '4', name: '项目负责人', code: 'project_manager', sort: 4, dataScope: 4, status: 1, isSystem: 1, remark: '项目管理权限' },
        { id: '5', name: '普通成员', code: 'member', sort: 5, dataScope: 5, status: 1, isSystem: 1, remark: '基础员工权限' },
        { id: '6', name: '实习生/外包', code: 'intern', sort: 6, dataScope: 5, status: 1, isSystem: 1, remark: '受限权限' },
        { id: '7', name: '数据分析师', code: 'data_analyst', sort: 7, dataScope: 4, status: 1, isSystem: 1, remark: '数据分析权限' },
        { id: '8', name: 'AI模型训练师', code: 'ai_trainer', sort: 8, dataScope: 4, status: 1, isSystem: 1, remark: 'AI训练权限' },
        { id: '9', name: '合规专员', code: 'compliance_officer', sort: 9, dataScope: 2, status: 1, isSystem: 1, remark: '合规审核权限' },
      ]);
      setRolePagination({ current: 1, pageSize: 10, total: 9 });
    } finally {
      setRoleLoading(false);
    }
  }, [roleSearchText, roleStatusFilter]);

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, [fetchDepartments, fetchRoles]);

  const handleCreateDepartment = async () => {
    try {
      const values = await form.validateFields();
      await departmentService.createDepartment(values);
      message.success('部门创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchDepartments();
    } catch (error) {
      console.error('Failed to create department:', error);
      message.error('部门创建失败');
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment) return;
    try {
      const values = await editForm.validateFields();
      await departmentService.updateDepartment(editingDepartment.id, values);
      message.success('部门更新成功');
      setEditModalVisible(false);
      setEditingDepartment(null);
      editForm.resetFields();
      fetchDepartments();
    } catch (error) {
      console.error('Failed to update department:', error);
      message.error('部门更新失败');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await departmentService.deleteDepartment(id);
      message.success('部门删除成功');
      fetchDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      message.error('部门删除失败');
    }
  };

  const openEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    editForm.setFieldsValue({
      name: dept.name,
      parentId: dept.parentId,
      description: dept.description,
    });
    setEditModalVisible(true);
  };

  // 角色管理相关函数
  const handleRoleSearch = () => {
    fetchRoles(1, rolePagination.pageSize);
  };

  const handleRoleTableChange = (paginationConfig: any) => {
    fetchRoles(paginationConfig.current, paginationConfig.pageSize);
  };

  const handleCreateRole = async () => {
    try {
      const values = await roleForm.validateFields();
      await roleService.createRole(values);
      message.success('角色创建成功');
      setCreateRoleModalVisible(false);
      roleForm.resetFields();
      fetchRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
      message.error('角色创建失败');
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;
    try {
      const values = await editRoleForm.validateFields();
      await roleService.updateRole(editingRole.id, values);
      message.success('角色更新成功');
      setEditRoleModalVisible(false);
      setEditingRole(null);
      editRoleForm.resetFields();
      fetchRoles(rolePagination.current, rolePagination.pageSize);
    } catch (error) {
      console.error('Failed to update role:', error);
      message.error('角色更新失败');
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await roleService.deleteRole(id);
      message.success('角色删除成功');
      fetchRoles(rolePagination.current, rolePagination.pageSize);
    } catch (error) {
      console.error('Failed to delete role:', error);
      message.error('角色删除失败');
    }
  };

  const handleToggleRoleStatus = async (role: Role) => {
    try {
      if (role.status === 1) {
        await roleService.disableRole(role.id);
        message.success('角色已禁用');
      } else {
        await roleService.enableRole(role.id);
        message.success('角色已启用');
      }
      fetchRoles(rolePagination.current, rolePagination.pageSize);
    } catch (error) {
      console.error('Failed to toggle role status:', error);
      message.error('操作失败');
    }
  };

  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    editRoleForm.setFieldsValue({
      name: role.name,
      code: role.code,
      sort: role.sort,
      dataScope: role.dataScope,
      remark: role.remark,
    });
    setEditRoleModalVisible(true);
  };

  const getRoleStatusTag = (status: number) => {
    if (status === 1) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>启用</Tag>;
    }
    return <Tag color="default" icon={<CloseCircleOutlined />}>禁用</Tag>;
  };

  const getDataScopeText = (dataScope: number) => {
    const option = DATA_SCOPE_OPTIONS.find(opt => opt.value === dataScope);
    return option?.label || '-';
  };

  const roleColumns: ColumnsType<Role> = [
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getRoleStatusTag(status),
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
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
              onClick={() => openEditRoleModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 1 ? '禁用' : '启用'}>
            <Switch
              size="small"
              checked={record.status === 1}
              onChange={() => handleToggleRoleStatus(record)}
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

  const handleSelectDepartment = async (selectedKeys: React.Key[]) => {
    const deptId = selectedKeys[0] as string;
    setSelectedDepartment(deptId);
    
    if (deptId) {
      // 从已加载的列表中查找部门详情
      const detail = departmentList.find(d => d.id === deptId);
      setSelectedDeptDetail(detail || null);
    } else {
      setSelectedDeptDetail(null);
    }
  };

  const columns = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar style={{ backgroundColor: THEME_COLOR }} size="small" icon={<TeamOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '上级部门',
      dataIndex: 'parentName',
      key: 'parentName',
    },
    {
      title: '部门负责人',
      dataIndex: 'managerName',
      key: 'managerName',
      render: (text: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number) => <Tag color="blue">{count} 人</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '正常' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Department) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'members', label: '查看成员', icon: <TeamOutlined /> },
                { key: 'settings', label: '部门设置', icon: <SettingOutlined /> },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: '删除部门',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: '确认删除',
                      content: `确定要删除部门"${record.name}"吗？此操作不可恢复。`,
                      okText: '确定',
                      cancelText: '取消',
                      okButtonProps: { danger: true },
                      onOk: () => handleDeleteDepartment(record.id),
                    });
                  },
                },
              ],
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 计算统计数据
  const totalMembers = departmentList.reduce((sum, d) => sum + (d.memberCount || 0), 0);
  const topLevelDepts = departmentList.filter(d => !d.parentId).length;

  if (loading) {
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
        background: `linear-gradient(135deg, ${THEME_COLOR} 0%, #059669 100%)`,
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
            <ApartmentOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>组织管理</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>管理组织架构、部门和角色</Text>
          </div>
        </div>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}
        >
          新建部门
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="部门总数"
              value={departmentList.length}
              prefix={<ApartmentOutlined style={{ color: THEME_COLOR }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="员工总数"
              value={totalMembers}
              prefix={<TeamOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="一级部门"
              value={topLevelDepts}
              prefix={<FolderOutlined style={{ color: '#8B5CF6' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="部门负责人"
              value={departmentList.filter(d => d.managerId).length}
              prefix={<UserOutlined style={{ color: '#F59E0B' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="tree"
        items={[
          {
            key: 'tree',
            label: (
              <span>
                <ApartmentOutlined /> 组织架构
              </span>
            ),
            children: (
              <Row gutter={24}>
                <Col xs={24} lg={8}>
                  <Card title="部门结构" style={{ borderRadius: 12 }}>
                    <Input
                      placeholder="搜索部门"
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ marginBottom: 16 }}
                      allowClear
                    />
                    {departmentTreeData.length > 0 ? (
                      <Tree
                        showIcon
                        defaultExpandAll
                        treeData={departmentTreeData}
                        onSelect={handleSelectDepartment}
                        selectedKeys={selectedDepartment ? [selectedDepartment] : []}
                      />
                    ) : (
                      <Empty description="暂无部门数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={16}>
                  <Card title="部门详情" style={{ borderRadius: 12 }}>
                    {selectedDeptDetail ? (
                      <div>
                        <div style={{ marginBottom: 24 }}>
                          <Title level={5}>{selectedDeptDetail.name}</Title>
                          <Text type="secondary">{selectedDeptDetail.description || '暂无描述'}</Text>
                        </div>
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Statistic title="部门成员" value={selectedDeptDetail.memberCount || 0} suffix="人" />
                          </Col>
                          <Col span={8}>
                            <Statistic title="子部门" value={departmentList.filter(d => d.parentId === selectedDeptDetail.id).length} suffix="个" />
                          </Col>
                          <Col span={8}>
                            <Statistic title="进行中项目" value={0} suffix="个" />
                          </Col>
                        </Row>
                        <div style={{ marginTop: 24 }}>
                          <Title level={5}>部门成员</Title>
                          <Empty description="暂无成员数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                      </div>
                    ) : (
                      <Empty description="请选择一个部门查看详情" />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'list',
            label: (
              <span>
                <TeamOutlined /> 部门列表
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <Input
                    placeholder="搜索部门"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                  />
                </div>
                <Table
                  columns={columns}
                  dataSource={departmentList}
                  rowKey="id"
                  pagination={{
                    total: departmentList.length,
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 个部门`,
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'roles',
            label: (
              <span>
                <SafetyCertificateOutlined /> 角色管理
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space wrap>
                    <Input
                      placeholder="搜索角色名称"
                      prefix={<SearchOutlined />}
                      value={roleSearchText}
                      onChange={(e) => setRoleSearchText(e.target.value)}
                      onPressEnter={handleRoleSearch}
                      style={{ width: 200 }}
                      allowClear
                    />
                    <Select
                      placeholder="状态"
                      value={roleStatusFilter}
                      onChange={setRoleStatusFilter}
                      style={{ width: 120 }}
                      allowClear
                      options={[
                        { value: 1, label: '启用' },
                        { value: 0, label: '禁用' },
                      ]}
                    />
                    <Button type="primary" onClick={handleRoleSearch}>搜索</Button>
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateRoleModalVisible(true)}
                  >
                    新建角色
                  </Button>
                </div>
                {roleList.length === 0 ? (
                  <Empty description="暂无角色数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Table
                    columns={roleColumns}
                    dataSource={roleList}
                    rowKey="id"
                    loading={roleLoading}
                    pagination={{
                      ...rolePagination,
                      showSizeChanger: true,
                      showTotal: (total) => `共 ${total} 个角色`,
                    }}
                    onChange={handleRoleTableChange}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />

      {/* 创建部门弹窗 */}
      <Modal
        title="新建部门"
        open={createModalVisible}
        onOk={handleCreateDepartment}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <Select
              placeholder="请选择上级部门"
              allowClear
              options={departmentList.map(d => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="managerId" label="部门负责人">
            <Select
              placeholder="请选择部门负责人"
              allowClear
              options={[]}
            />
          </Form.Item>
          <Form.Item name="description" label="部门描述">
            <TextArea rows={3} placeholder="请输入部门描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑部门弹窗 */}
      <Modal
        title="编辑部门"
        open={editModalVisible}
        onOk={handleEditDepartment}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingDepartment(null);
          editForm.resetFields();
        }}
        width={500}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <Select
              placeholder="请选择上级部门"
              allowClear
              options={departmentList
                .filter(d => d.id !== editingDepartment?.id)
                .map(d => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="description" label="部门描述">
            <Input.TextArea rows={3} placeholder="请输入部门描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建角色弹窗 */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: THEME_COLOR }} />
            新建角色
          </Space>
        }
        open={createRoleModalVisible}
        onOk={handleCreateRole}
        onCancel={() => {
          setCreateRoleModalVisible(false);
          roleForm.resetFields();
        }}
        width={500}
      >
        <Form form={roleForm} layout="vertical">
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
        open={editRoleModalVisible}
        onOk={handleEditRole}
        onCancel={() => {
          setEditRoleModalVisible(false);
          setEditingRole(null);
          editRoleForm.resetFields();
        }}
        width={500}
      >
        <Form form={editRoleForm} layout="vertical">
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