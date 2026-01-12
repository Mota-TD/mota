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
  Dropdown,
  Modal,
  Form,
  DatePicker,
  message,
  Tooltip,
  Typography,
  Checkbox,
  Segmented,
  Badge,
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
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { PageLoading } from '@/components/common';

const { Title, Text } = Typography;

// 任务类型定义
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  project: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  reporter: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate: string | null;
  tags: string[];
  subtaskCount: number;
  completedSubtaskCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// 状态配置
const statusConfig = {
  todo: { color: 'default', text: '待处理', icon: <ClockCircleOutlined /> },
  in_progress: { color: 'processing', text: '进行中', icon: <ClockCircleOutlined /> },
  review: { color: 'warning', text: '待审核', icon: <ExclamationCircleOutlined /> },
  done: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
};

// 优先级配置
const priorityConfig = {
  urgent: { color: 'red', text: '紧急', weight: 4 },
  high: { color: 'orange', text: '高', weight: 3 },
  medium: { color: 'blue', text: '中', weight: 2 },
  low: { color: 'green', text: '低', weight: 1 },
};

// 获取任务列表
const fetchTasks = async (params: any): Promise<{ list: Task[]; total: number }> => {
  const response = await apiClient.get('/api/tasks', { params });
  return response.data;
};

// 更新任务状态
const updateTaskStatus = async ({ id, status }: { id: string; status: string }): Promise<void> => {
  await apiClient.patch(`/api/tasks/${id}/status`, { status });
};

// 删除任务
const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/tasks/${id}`);
};

export default function TasksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 查询参数
  const queryParams = {
    page: pagination.current,
    pageSize: pagination.pageSize,
    keyword: searchText || undefined,
    status: statusFilter,
    priority: priorityFilter,
    projectId: projectFilter,
  };

  // 获取任务列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: () => fetchTasks(queryParams),
  });

  // 更新任务状态
  const updateStatusMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      message.success('状态已更新');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      message.error('更新失败');
    },
  });

  // 删除任务
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      message.success('任务已删除');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  // 处理删除
  const handleDelete = (task: Task) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${task.title}"吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteMutation.mutate(task.id),
    });
  };

  // 处理状态变更
  const handleStatusChange = (task: Task, newStatus: string) => {
    updateStatusMutation.mutate({ id: task.id, status: newStatus });
  };

  // 处理创建任务
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('/api/tasks', {
        ...values,
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
      });
      message.success('任务创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.message || '创建失败');
    }
  };

  // 判断是否逾期
  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // 表格列定义
  const columns: ColumnsType<Task> = [
    {
      title: '',
      key: 'checkbox',
      width: 40,
      render: (_, record) => (
        <Checkbox
          checked={record.status === 'done'}
          onChange={() => handleStatusChange(record, record.status === 'done' ? 'todo' : 'done')}
        />
      ),
    },
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (title, record) => (
        <div>
          <Link
            href={`/tasks/${record.id}`}
            className={`font-medium hover:text-primary ${record.status === 'done' ? 'text-gray-400 line-through' : 'text-foreground'}`}
          >
            {title}
          </Link>
          {record.tags.length > 0 && (
            <div className="mt-1">
              {record.tags.slice(0, 3).map((tag) => (
                <Tag key={tag} className="mr-1 text-xs">
                  {tag}
                </Tag>
              ))}
              {record.tags.length > 3 && (
                <Tag className="text-xs">+{record.tags.length - 3}</Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
          {statusConfig[status].text}
        </Tag>
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
      title: '所属项目',
      dataIndex: 'project',
      key: 'project',
      width: 150,
      render: (project) => (
        <Link href={`/projects/${project.id}`} className="text-gray-600 hover:text-primary">
          {project.name}
        </Link>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
      render: (assignee) =>
        assignee ? (
          <Space>
            <Avatar src={assignee.avatar} size="small">
              {assignee.name?.[0]}
            </Avatar>
            <Text>{assignee.name}</Text>
          </Space>
        ) : (
          <Text type="secondary">未分配</Text>
        ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (dueDate, record) => {
        if (!dueDate) return <Text type="secondary">-</Text>;
        const overdue = isOverdue(dueDate) && record.status !== 'done';
        return (
          <Space>
            <CalendarOutlined className={overdue ? 'text-red-500' : 'text-gray-400'} />
            <Text type={overdue ? 'danger' : undefined}>{dueDate}</Text>
          </Space>
        );
      },
    },
    {
      title: '子任务',
      key: 'subtasks',
      width: 80,
      render: (_, record) =>
        record.subtaskCount > 0 ? (
          <Text type="secondary">
            {record.completedSubtaskCount}/{record.subtaskCount}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: '查看详情',
                onClick: () => router.push(`/tasks/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: '编辑任务',
                onClick: () => router.push(`/tasks/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除任务',
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

  // 看板视图渲染
  const renderKanbanView = () => {
    const statusList = ['todo', 'in_progress', 'review', 'done'] as const;
    const tasksByStatus = statusList.reduce((acc, status) => {
      acc[status] = data?.list.filter((task) => task.status === status) || [];
      return acc;
    }, {} as Record<string, Task[]>);

    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusList.map((status) => (
          <div
            key={status}
            className="min-w-[300px] flex-shrink-0 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <Space>
                <Badge
                  color={statusConfig[status].color === 'default' ? 'gray' : statusConfig[status].color}
                />
                <Text strong>{statusConfig[status].text}</Text>
                <Text type="secondary">({tasksByStatus[status].length})</Text>
              </Space>
              <Button type="text" size="small" icon={<PlusOutlined />} />
            </div>
            <div className="space-y-3">
              {tasksByStatus[status].map((task) => (
                <Card
                  key={task.id}
                  size="small"
                  hoverable
                  className="cursor-pointer"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <div className="mb-2">
                    <Text
                      className={task.status === 'done' ? 'text-gray-400 line-through' : ''}
                    >
                      {task.title}
                    </Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Space size={4}>
                      <Tag color={priorityConfig[task.priority].color} className="mr-0">
                        {priorityConfig[task.priority].text}
                      </Tag>
                      {task.dueDate && isOverdue(task.dueDate) && task.status !== 'done' && (
                        <Tag color="error">逾期</Tag>
                      )}
                    </Space>
                    {task.assignee && (
                      <Tooltip title={task.assignee.name}>
                        <Avatar src={task.assignee.avatar} size="small">
                          {task.assignee.name?.[0]}
                        </Avatar>
                      </Tooltip>
                    )}
                  </div>
                  {task.subtaskCount > 0 && (
                    <div className="mt-2">
                      <Text type="secondary" className="text-xs">
                        子任务: {task.completedSubtaskCount}/{task.subtaskCount}
                      </Text>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tasks-page">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-1">任务管理</Title>
          <Text type="secondary">管理和跟踪所有任务</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          新建任务
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Space wrap>
            <Input
              placeholder="搜索任务"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
                { value: 'todo', label: '待处理' },
                { value: 'in_progress', label: '进行中' },
                { value: 'review', label: '待审核' },
                { value: 'done', label: '已完成' },
              ]}
            />
            <Select
              placeholder="优先级"
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: 100 }}
              allowClear
              options={[
                { value: 'urgent', label: '紧急' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
              ]}
            />
          </Space>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'list' | 'kanban')}
            options={[
              { value: 'list', icon: <UnorderedListOutlined />, label: '列表' },
              { value: 'kanban', icon: <AppstoreOutlined />, label: '看板' },
            ]}
          />
        </div>
      </Card>

      {/* 任务列表 */}
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
              showTotal: (total) => `共 ${total} 个任务`,
            }}
            onChange={(pag) => {
              setPagination({
                current: pag.current || 1,
                pageSize: pag.pageSize || 20,
              });
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      ) : (
        renderKanbanView()
      )}

      {/* 创建任务弹窗 */}
      <Modal
        title="新建任务"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          <Space className="w-full" size="large">
            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
              className="flex-1"
            >
              <Select
                placeholder="请选择优先级"
                options={[
                  { value: 'urgent', label: '紧急' },
                  { value: 'high', label: '高' },
                  { value: 'medium', label: '中' },
                  { value: 'low', label: '低' },
                ]}
              />
            </Form.Item>
            <Form.Item name="dueDate" label="截止日期" className="flex-1">
              <DatePicker className="w-full" />
            </Form.Item>
          </Space>
          <Form.Item name="projectId" label="所属项目">
            <Select placeholder="请选择项目" />
          </Form.Item>
          <Form.Item name="assigneeId" label="负责人">
            <Select placeholder="请选择负责人" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}