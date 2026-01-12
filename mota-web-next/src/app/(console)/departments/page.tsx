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
  List,
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
} from 'antd';
import type { DataNode } from 'antd/es/tree';
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
} from '@ant-design/icons';
import { departmentService, type Department } from '@/services';

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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [departmentTreeData, setDepartmentTreeData] = useState<DataNode[]>([]);
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<Department | null>(null);

  // 获取部门列表
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await departmentService.getDepartments();
      setDepartmentList(data);
      setDepartmentTreeData(buildDepartmentTree(data));
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      message.error('获取部门列表失败');
      setDepartmentList([]);
      setDepartmentTreeData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

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

  const handleSelectDepartment = async (selectedKeys: React.Key[]) => {
    const deptId = selectedKeys[0] as string;
    setSelectedDepartment(deptId);
    
    if (deptId) {
      try {
        const detail = await departmentService.getDepartmentById(deptId);
        setSelectedDeptDetail(detail);
      } catch (error) {
        console.error('Failed to fetch department detail:', error);
        setSelectedDeptDetail(null);
      }
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
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'members', label: '查看成员', icon: <TeamOutlined /> },
                { key: 'settings', label: '部门设置', icon: <SettingOutlined /> },
                { type: 'divider' },
                { key: 'delete', label: '删除部门', icon: <DeleteOutlined />, danger: true },
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
            <Title level={4} style={{ color: '#fff', margin: 0 }}>部门管理</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>管理组织架构和部门信息</Text>
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
    </div>
  );
}