'use client';

import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Progress,
  Dropdown,
  Modal,
  Form,
  DatePicker,
  message,
  Tooltip,
  Typography,
  Row,
  Col,
  Segmented,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { PageLoading, CardSkeleton } from '@/components/common';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 项目类型定义
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  startDate: string;
  endDate: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

// 状态配置
const statusConfig = {
  planning: { color: 'default', text: '规划中' },
  active: { color: 'processing', text: '进行中' },
  paused: { color: 'warning', text: '已暂停' },
  completed: { color: 'success', text: '已完成' },
  archived: { color: 'default', text: '已归档' },
};

// 优先级配置
const priorityConfig = {
  high: { color: 'red', text: '高' },
  medium: { color: 'orange', text: '中' },
  low: { color: 'green', text: '低' },
};

// 获取项目列表
const fetchProjects = async (params: any): Promise<{ list: Project[]; total: number }> => {
  const response = await apiClient.get('/api/projects', { params });
  return response.data;
};

// 删除项目
const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/projects/${id}`);
};

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 查询参数
  const queryParams = {
    page: pagination.current,
    pageSize: pagination.pageSize,
    keyword: searchText || undefined,
    status: statusFilter,
    priority: priorityFilter,
  };

  // 获取项目列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects', queryParams],
    queryFn: () => fetchProjects(queryParams),
  });

  // 删除项目
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      message.success('项目已删除');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  // 处理删除
  const handleDelete = (project: Project) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${project.name}"吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteMutation.mutate(project.id),
    });
  };

  // 处理创建项目
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('/api/projects', {
        ...values,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      });
      message.success('项目创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      if (error.errorFields) return; // 表单验证错误
      message.error(error.message || '创建失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<Project> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <Link href={`/projects/${record.id}`} className="font-medium text-primary hover:underline">
          {name}
        </Link>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: keyof typeof priorityConfig) => (
        <Tag color={priorityConfig[priority].color}>{priorityConfig[priority].text}</Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 120,
      render: (owner) => (
        <Space>
          <Avatar src={owner.avatar} size="small">
            {owner.name?.[0]}
          </Avatar>
          <Text>{owner.name}</Text>
        </Space>
      ),
    },
    {
      title: '团队成员',
      dataIndex: 'members',
      key: 'members',
      width: 150,
      render: (members) => (
        <Avatar.Group maxCount={3} size="small">
          {members.map((member: any) => (
            <Tooltip key={member.id} title={member.name}>
              <Avatar src={member.avatar}>{member.name?.[0]}</Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: '任务',
      key: 'tasks',
      width: 100,
      render: (_, record) => (
        <Text type="secondary">
          {record.completedTaskCount}/{record.taskCount}
        </Text>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date) => (
        <Space>
          <CalendarOutlined className="text-gray-400" />
          <Text>{date}</Text>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: '查看详情',
                onClick: () => router.push(`/projects/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: '编辑项目',
                onClick: () => router.push(`/projects/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除项目',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // 卡片视图渲染
  const renderCardView = () => {
    if (isLoading) {
      return <CardSkeleton count={6} />;
    }

    return (
      <Row gutter={[16, 16]}>
        {data?.list.map((project) => (
          <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              className="h-full"
              actions={[
                <Tooltip key="view" title="查看详情">
                  <EyeOutlined onClick={() => router.push(`/projects/${project.id}`)} />
                </Tooltip>,
                <Tooltip key="edit" title="编辑">
                  <EditOutlined onClick={() => router.push(`/projects/${project.id}/edit`)} />
                </Tooltip>,
                <Dropdown
                  key="more"
                  menu={{
                    items: [
                      {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: '删除',
                        danger: true,
                        onClick: () => handleDelete(project),
                      },
                    ],
                  }}
                >
                  <MoreOutlined />
                </Dropdown>,
              ]}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    size={48}
                    style={{ backgroundColor: '#1890ff' }}
                    icon={<ProjectOutlined />}
                  />
                }
                title={
                  <Link href={`/projects/${project.id}`} className="text-foreground hover:text-primary">
                    {project.name}
                  </Link>
                }
                description={
                  <Text type="secondary" ellipsis={{ tooltip: project.description }}>
                    {project.description || '暂无描述'}
                  </Text>
                }
              />
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Tag color={statusConfig[project.status].color}>
                    {statusConfig[project.status].text}
                  </Tag>
                  <Tag color={priorityConfig[project.priority].color}>
                    {priorityConfig[project.priority].text}优先级
                  </Tag>
                </div>
                <Progress percent={project.progress} size="small" />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <Space>
                    <TeamOutlined />
                    <span>{project.members.length}人</span>
                  </Space>
                  <Space>
                    <CalendarOutlined />
                    <span>{project.endDate}</span>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="projects-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-1">项目管理</Title>
          <Text type="secondary">管理和跟踪所有项目的进度</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          新建项目
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Space wrap>
            <Input
              placeholder="搜索项目名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="项目状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
              options={[
                { value: 'planning', label: '规划中' },
                { value: 'active', label: '进行中' },
                { value: 'paused', label: '已暂停' },
                { value: 'completed', label: '已完成' },
                { value: 'archived', label: '已归档' },
              ]}
            />
            <Select
              placeholder="优先级"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: 100 }}
              allowClear
              options={[
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
              ]}
            />
          </Space>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'list' | 'card')}
            options={[
              { value: 'list', icon: <UnorderedListOutlined /> },
              { value: 'card', icon: <AppstoreOutlined /> },
            ]}
          />
        </div>
      </Card>

      {/* 项目列表 */}
      {viewMode === 'list' ? (
        <Card>
          <Table
            columns={columns}
            dataSource={data?.list}
            rowKey="id"
            loading={isLoading}
            pagination={{
              ...pagination,
              total: data?.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个项目`,
            }}
            onChange={(pag) => {
              setPagination({
                current: pag.current || 1,
                pageSize: pag.pageSize || 10,
              });
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      ) : (
        renderCardView()
      )}

      {/* 创建项目弹窗 */}
      <Modal
        title="新建项目"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select
                  placeholder="请选择优先级"
                  options={[
                    { value: 'high', label: '高' },
                    { value: 'medium', label: '中' },
                    { value: 'low', label: '低' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                initialValue="planning"
              >
                <Select
                  options={[
                    { value: 'planning', label: '规划中' },
                    { value: 'active', label: '进行中' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="dateRange"
            label="项目周期"
            rules={[{ required: true, message: '请选择项目周期' }]}
          >
            <RangePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}