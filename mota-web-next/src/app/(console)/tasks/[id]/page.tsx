'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Tabs,
  Progress,
  Descriptions,
  Timeline,
  List,
  Input,
  Checkbox,
  Dropdown,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Tooltip,
  Breadcrumb,
  Divider,
  Empty,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  TagOutlined,
  PaperClipOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  BranchesOutlined,
  PlusOutlined,
  SendOutlined,
  UploadOutlined,
  LinkOutlined,
  HistoryOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 任务类型定义
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  projectName: string;
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  reporter: {
    id: string;
    name: string;
    avatar?: string;
  };
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  progress: number;
  tags: string[];
  watchers: Array<{ id: string; name: string; avatar?: string }>;
  parentId: string | null;
  parentTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Subtask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  assignee: { id: string; name: string; avatar?: string } | null;
  dueDate: string | null;
}

interface ChecklistItem {
  id: string;
  content: string;
  completed: boolean;
  sortOrder: number;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  mentions: string[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: { id: string; name: string };
  uploadedAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: { id: string; name: string; avatar?: string };
  createdAt: string;
}

interface Dependency {
  id: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  taskId: string;
  taskTitle: string;
  taskStatus: string;
}

// 状态配置
const statusConfig = {
  todo: { label: '待处理', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  review: { label: '待审核', color: 'warning' },
  done: { label: '已完成', color: 'success' },
};

// 优先级配置
const priorityConfig = {
  low: { label: '低', color: 'default' },
  medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'orange' },
  urgent: { label: '紧急', color: 'red' },
};

// 依赖类型配置
const dependencyTypeConfig = {
  finish_to_start: { label: '完成-开始', abbr: 'FS' },
  start_to_start: { label: '开始-开始', abbr: 'SS' },
  finish_to_finish: { label: '完成-完成', abbr: 'FF' },
  start_to_finish: { label: '开始-完成', abbr: 'SF' },
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  // 获取任务详情
  const { data: task, isLoading } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<Task | null> => {
      try {
        const { taskService } = await import('@/services');
        const detail = await taskService.getTaskDetail(taskId);
        if (!detail) return null;
        // 转换为页面需要的格式
        const taskData: Task = {
          id: detail.id,
          title: detail.title,
          description: detail.description || '',
          status: (detail.status as Task['status']) || 'todo',
          priority: (detail.priority as Task['priority']) || 'medium',
          projectId: detail.projectId || '',
          projectName: detail.projectName || '',
          assignee: (detail as any).assignee ? {
            id: (detail as any).assignee.id,
            name: (detail as any).assignee.name,
            avatar: (detail as any).assignee.avatar,
          } : null,
          reporter: (detail as any).reporter ? {
            id: (detail as any).reporter.id,
            name: (detail as any).reporter.name,
            avatar: (detail as any).reporter.avatar,
          } : { id: '', name: '未知' },
          startDate: detail.startDate || null,
          dueDate: detail.dueDate || null,
          estimatedHours: detail.estimatedHours || null,
          actualHours: detail.actualHours || null,
          progress: (detail as any).progress || 0,
          tags: detail.tags || [],
          watchers: (detail as any).watchers || [],
          parentId: detail.parentId || null,
          parentTitle: (detail as any).parentTitle || null,
          createdAt: detail.createdAt || '',
          updatedAt: detail.updatedAt || '',
        };
        return taskData;
      } catch {
        return null;
      }
    },
  });

  // 获取子任务
  const { data: subtasks } = useQuery<Subtask[]>({
    queryKey: ['task', taskId, 'subtasks'],
    queryFn: async () => {
      try {
        const { taskService } = await import('@/services');
        const detail = await taskService.getTaskDetail(taskId);
        return (detail?.subtasks || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          status: s.status,
          assignee: s.assignee,
          dueDate: s.dueDate,
        }));
      } catch {
        return [];
      }
    },
  });

  // 获取检查清单
  const { data: checklist } = useQuery<ChecklistItem[]>({
    queryKey: ['task', taskId, 'checklist'],
    queryFn: async () => {
      try {
        const { taskService } = await import('@/services');
        const detail = await taskService.getTaskDetail(taskId);
        return (detail?.checklists?.[0]?.items || []).map((item: any) => ({
          id: item.id,
          content: item.content,
          completed: item.completed,
          sortOrder: item.sortOrder || 0,
        }));
      } catch {
        return [];
      }
    },
  });

  // 获取评论
  const { data: comments } = useQuery<Comment[]>({
    queryKey: ['task', taskId, 'comments'],
    queryFn: async () => {
      try {
        const { taskService } = await import('@/services');
        const detail = await taskService.getTaskDetail(taskId);
        return (detail?.comments || []).map((c: any) => ({
          id: c.id,
          content: c.content,
          author: c.author || { id: '', name: '未知' },
          createdAt: c.createdAt,
          mentions: c.mentions || [],
        }));
      } catch {
        return [];
      }
    },
  });

  // 获取附件
  const { data: attachments } = useQuery<Attachment[]>({
    queryKey: ['task', taskId, 'attachments'],
    queryFn: async () => {
      try {
        const { taskService } = await import('@/services');
        const detail = await taskService.getTaskDetail(taskId);
        return (detail?.attachments || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          size: a.size || 0,
          type: a.type || '',
          url: a.url || '',
          uploadedBy: a.uploadedBy || { id: '', name: '未知' },
          uploadedAt: a.uploadedAt || '',
        }));
      } catch {
        return [];
      }
    },
  });

  // 获取活动日志
  const { data: activities } = useQuery<ActivityLog[]>({
    queryKey: ['task', taskId, 'activities'],
    queryFn: async () => {
      try {
        const { taskService } = await import('@/services');
        const detail = await taskService.getTaskDetail(taskId);
        return (detail?.activities || []).map((a: any) => ({
          id: a.id,
          action: a.action,
          field: a.field,
          oldValue: a.oldValue,
          newValue: a.newValue,
          user: a.user || { id: '', name: '未知' },
          createdAt: a.createdAt,
        }));
      } catch {
        return [];
      }
    },
  });

  // 获取依赖关系
  const { data: dependencies } = useQuery<{ predecessors: Dependency[]; successors: Dependency[] }>({
    queryKey: ['task', taskId, 'dependencies'],
    queryFn: async () => {
      try {
        const { taskService } = await import('@/services');
        const detail = await taskService.getTaskDetail(taskId) as any;
        return {
          predecessors: (detail?.dependencies?.predecessors || []).map((d: any) => ({
            id: d.id,
            type: d.type,
            taskId: d.taskId,
            taskTitle: d.taskTitle,
            taskStatus: d.taskStatus,
          })),
          successors: (detail?.dependencies?.successors || []).map((d: any) => ({
            id: d.id,
            type: d.type,
            taskId: d.taskId,
            taskTitle: d.taskTitle,
            taskStatus: d.taskStatus,
          })),
        };
      } catch {
        return { predecessors: [], successors: [] };
      }
    },
  });

  // 更新任务状态
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { taskService } = await import('@/services');
      return await taskService.updateTask(taskId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      message.success('状态已更新');
    },
  });

  // 添加评论
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { taskService } = await import('@/services');
      return await taskService.addTaskComment(taskId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId, 'comments'] });
      setCommentText('');
      message.success('评论已添加');
    },
  });

  // 切换检查项状态
  const toggleChecklistMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { taskService } = await import('@/services');
      return await taskService.updateChecklistItem(id, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId, 'checklist'] });
    },
  });

  // 添加检查项 - 需要先获取 checklistId
  const addChecklistItemMutation = useMutation({
    mutationFn: async (content: string) => {
      const { taskService } = await import('@/services');
      // 获取任务的第一个 checklist，如果没有则先创建
      const checklists = await taskService.getTaskChecklists(taskId);
      let checklistId = checklists?.[0]?.id;
      if (!checklistId) {
        const newChecklist = await taskService.createChecklist(taskId, '检查清单');
        checklistId = newChecklist.id;
      }
      return await taskService.addChecklistItem(checklistId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId, 'checklist'] });
      setNewChecklistItem('');
    },
  });

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 获取活动描述
  const getActivityDescription = (activity: ActivityLog) => {
    switch (activity.action) {
      case 'status_changed':
        return (
          <>
            将{activity.field}从 <Text delete>{activity.oldValue}</Text> 改为{' '}
            <Text strong>{activity.newValue}</Text>
          </>
        );
      case 'comment_added':
        return '添加了评论';
      case 'attachment_added':
        return (
          <>
            上传了附件 <Text strong>{activity.newValue}</Text>
          </>
        );
      case 'progress_updated':
        return (
          <>
            更新了{activity.field}：{activity.oldValue} → {activity.newValue}
          </>
        );
      default:
        return activity.action;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Empty description="任务不存在" />
      </div>
    );
  }

  const completedChecklist = checklist?.filter((item) => item.completed).length || 0;
  const totalChecklist = checklist?.length || 0;
  const checklistProgress = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const completedSubtasks = subtasks?.filter((s) => s.status === 'done').length || 0;
  const totalSubtasks = subtasks?.length || 0;

  return (
    <div className="task-detail-page">
      {/* 面包屑导航 */}
      <Breadcrumb
        className="mb-4"
        items={[
          { title: <Link href="/projects">项目</Link> },
          { title: <Link href={`/projects/${task.projectId}`}>{task.projectName}</Link> },
          { title: <Link href="/tasks">任务</Link> },
          { title: task.title },
        ]}
      />

      {/* 头部 */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} />
            <Tag color={priorityConfig[task.priority].color}>{priorityConfig[task.priority].label}</Tag>
            <Tag color={statusConfig[task.status].color}>{statusConfig[task.status].label}</Tag>
            {task.parentId && (
              <Link href={`/tasks/${task.parentId}`}>
                <Tag icon={<BranchesOutlined />}>父任务: {task.parentTitle}</Tag>
              </Link>
            )}
          </div>
          <Title level={3} className="mb-2">
            {task.title}
          </Title>
          <Space size="large" className="text-gray-500">
            <span>
              <UserOutlined className="mr-1" />
              创建者: {task.reporter.name}
            </span>
            <span>
              <CalendarOutlined className="mr-1" />
              创建于: {dayjs(task.createdAt).format('YYYY-MM-DD HH:mm')}
            </span>
            <span>
              <HistoryOutlined className="mr-1" />
              更新于: {dayjs(task.updatedAt).format('YYYY-MM-DD HH:mm')}
            </span>
          </Space>
        </div>
        <Space>
          <Tooltip title={isStarred ? '取消收藏' : '收藏'}>
            <Button
              icon={isStarred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={() => setIsStarred(!isStarred)}
            />
          </Tooltip>
          <Tooltip title="分享">
            <Button icon={<ShareAltOutlined />} />
          </Tooltip>
          <Tooltip title="复制链接">
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                message.success('链接已复制');
              }}
            />
          </Tooltip>
          <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
            编辑
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'duplicate', label: '复制任务', icon: <CopyOutlined /> },
                { key: 'move', label: '移动到...', icon: <BranchesOutlined /> },
                { type: 'divider' },
                { key: 'delete', label: '删除任务', icon: <DeleteOutlined />, danger: true },
              ],
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      <div className="flex gap-6">
        {/* 主内容区 */}
        <div className="flex-1">
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'details',
                  label: '详情',
                  children: (
                    <div className="space-y-6">
                      {/* 描述 */}
                      <div>
                        <Title level={5}>描述</Title>
                        <div className="prose max-w-none rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                          <Paragraph>
                            <pre className="whitespace-pre-wrap font-sans">{task.description}</pre>
                          </Paragraph>
                        </div>
                      </div>

                      {/* 子任务 */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <Title level={5} className="mb-0">
                            子任务 ({completedSubtasks}/{totalSubtasks})
                          </Title>
                          <Button type="link" icon={<PlusOutlined />}>
                            添加子任务
                          </Button>
                        </div>
                        <List
                          size="small"
                          dataSource={subtasks}
                          renderItem={(subtask) => (
                            <List.Item
                              actions={[
                                <Tag key="status" color={statusConfig[subtask.status].color}>
                                  {statusConfig[subtask.status].label}
                                </Tag>,
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Checkbox
                                    checked={subtask.status === 'done'}
                                    onChange={() => {}}
                                  />
                                }
                                title={
                                  <Link href={`/tasks/${subtask.id}`}>
                                    <Text delete={subtask.status === 'done'}>{subtask.title}</Text>
                                  </Link>
                                }
                                description={
                                  <Space size="small">
                                    {subtask.assignee && (
                                      <span>
                                        <Avatar size="small" icon={<UserOutlined />} className="mr-1" />
                                        {subtask.assignee.name}
                                      </span>
                                    )}
                                    {subtask.dueDate && (
                                      <span>
                                        <CalendarOutlined className="mr-1" />
                                        {subtask.dueDate}
                                      </span>
                                    )}
                                  </Space>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </div>

                      {/* 检查清单 */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Title level={5} className="mb-0">
                              检查清单
                            </Title>
                            <Progress
                              percent={checklistProgress}
                              size="small"
                              style={{ width: 100 }}
                            />
                          </div>
                        </div>
                        <List
                          size="small"
                          dataSource={checklist}
                          renderItem={(item) => (
                            <List.Item>
                              <Checkbox
                                checked={item.completed}
                                onChange={(e) =>
                                  toggleChecklistMutation.mutate({
                                    id: item.id,
                                    completed: e.target.checked,
                                  })
                                }
                              >
                                <Text delete={item.completed}>{item.content}</Text>
                              </Checkbox>
                            </List.Item>
                          )}
                        />
                        <div className="mt-3 flex gap-2">
                          <Input
                            placeholder="添加检查项..."
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            onPressEnter={() => {
                              if (newChecklistItem.trim()) {
                                addChecklistItemMutation.mutate(newChecklistItem);
                              }
                            }}
                          />
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              if (newChecklistItem.trim()) {
                                addChecklistItemMutation.mutate(newChecklistItem);
                              }
                            }}
                          >
                            添加
                          </Button>
                        </div>
                      </div>

                      {/* 依赖关系 */}
                      <div>
                        <Title level={5}>依赖关系</Title>
                        <div className="space-y-4">
                          <div>
                            <Text type="secondary" className="mb-2 block">
                              前置任务（阻塞当前任务）
                            </Text>
                            {dependencies?.predecessors.length ? (
                              <List
                                size="small"
                                dataSource={dependencies.predecessors}
                                renderItem={(dep) => (
                                  <List.Item>
                                    <Space>
                                      <Tag>{dependencyTypeConfig[dep.type].abbr}</Tag>
                                      <Link href={`/tasks/${dep.taskId}`}>{dep.taskTitle}</Link>
                                      <Tag color={statusConfig[dep.taskStatus as keyof typeof statusConfig]?.color}>
                                        {statusConfig[dep.taskStatus as keyof typeof statusConfig]?.label}
                                      </Tag>
                                    </Space>
                                  </List.Item>
                                )}
                              />
                            ) : (
                              <Empty description="无前置任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                          </div>
                          <div>
                            <Text type="secondary" className="mb-2 block">
                              后续任务（被当前任务阻塞）
                            </Text>
                            {dependencies?.successors.length ? (
                              <List
                                size="small"
                                dataSource={dependencies.successors}
                                renderItem={(dep) => (
                                  <List.Item>
                                    <Space>
                                      <Tag>{dependencyTypeConfig[dep.type].abbr}</Tag>
                                      <Link href={`/tasks/${dep.taskId}`}>{dep.taskTitle}</Link>
                                      <Tag color={statusConfig[dep.taskStatus as keyof typeof statusConfig]?.color}>
                                        {statusConfig[dep.taskStatus as keyof typeof statusConfig]?.label}
                                      </Tag>
                                    </Space>
                                  </List.Item>
                                )}
                              />
                            ) : (
                              <Empty description="无后续任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                          </div>
                          <Button type="dashed" icon={<LinkOutlined />} block>
                            添加依赖关系
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'comments',
                  label: (
                    <span>
                      <MessageOutlined className="mr-1" />
                      评论 ({comments?.length || 0})
                    </span>
                  ),
                  children: (
                    <div>
                      <List
                        className="mb-4"
                        dataSource={comments}
                        renderItem={(comment) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar icon={<UserOutlined />}>{comment.author.name[0]}</Avatar>}
                              title={
                                <Space>
                                  <Text strong>{comment.author.name}</Text>
                                  <Text type="secondary">
                                    {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                                  </Text>
                                </Space>
                              }
                              description={
                                <Paragraph className="mb-0 whitespace-pre-wrap">{comment.content}</Paragraph>
                              }
                            />
                          </List.Item>
                        )}
                      />
                      <div className="flex gap-2">
                        <TextArea
                          placeholder="添加评论... 使用 @ 提及成员"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={() => {
                            if (commentText.trim()) {
                              addCommentMutation.mutate(commentText);
                            }
                          }}
                          loading={addCommentMutation.isPending}
                        >
                          发送
                        </Button>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'attachments',
                  label: (
                    <span>
                      <PaperClipOutlined className="mr-1" />
                      附件 ({attachments?.length || 0})
                    </span>
                  ),
                  children: (
                    <div>
                      <List
                        dataSource={attachments}
                        renderItem={(attachment) => (
                          <List.Item
                            actions={[
                              <Button key="preview" type="link" icon={<EyeOutlined />}>
                                预览
                              </Button>,
                              <Button key="download" type="link">
                                下载
                              </Button>,
                              <Button key="delete" type="link" danger icon={<DeleteOutlined />} />,
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<PaperClipOutlined style={{ fontSize: 24 }} />}
                              title={attachment.name}
                              description={
                                <Space>
                                  <span>{formatFileSize(attachment.size)}</span>
                                  <span>•</span>
                                  <span>{attachment.uploadedBy.name}</span>
                                  <span>•</span>
                                  <span>{dayjs(attachment.uploadedAt).format('YYYY-MM-DD HH:mm')}</span>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                      <Button type="dashed" icon={<UploadOutlined />} block className="mt-4">
                        上传附件
                      </Button>
                    </div>
                  ),
                },
                {
                  key: 'activity',
                  label: (
                    <span>
                      <HistoryOutlined className="mr-1" />
                      活动
                    </span>
                  ),
                  children: (
                    <Timeline
                      items={activities?.map((activity) => ({
                        children: (
                          <div>
                            <Space>
                              <Avatar size="small" icon={<UserOutlined />}>
                                {activity.user.name[0]}
                              </Avatar>
                              <Text strong>{activity.user.name}</Text>
                              {getActivityDescription(activity)}
                            </Space>
                            <div className="mt-1 text-gray-400">
                              {dayjs(activity.createdAt).format('YYYY-MM-DD HH:mm')}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="w-80">
          <Card title="任务信息" className="mb-4">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="状态">
                <Select
                  value={task.status}
                  style={{ width: '100%' }}
                  onChange={(value) => updateStatusMutation.mutate(value)}
                  options={Object.entries(statusConfig).map(([key, config]) => ({
                    value: key,
                    label: <Tag color={config.color}>{config.label}</Tag>,
                  }))}
                />
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={priorityConfig[task.priority].color}>{priorityConfig[task.priority].label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                {task.assignee ? (
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {task.assignee.name}
                  </Space>
                ) : (
                  <Text type="secondary">未分配</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="所属项目">
                <Link href={`/projects/${task.projectId}`}>{task.projectName}</Link>
              </Descriptions.Item>
              <Descriptions.Item label="开始日期">
                {task.startDate || <Text type="secondary">未设置</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="截止日期">
                {task.dueDate ? (
                  <Space>
                    <CalendarOutlined />
                    {task.dueDate}
                    {dayjs(task.dueDate).isBefore(dayjs()) && task.status !== 'done' && (
                      <Tag color="red">已逾期</Tag>
                    )}
                  </Space>
                ) : (
                  <Text type="secondary">未设置</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="预估工时">
                {task.estimatedHours ? `${task.estimatedHours}小时` : <Text type="secondary">未设置</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="实际工时">
                {task.actualHours ? `${task.actualHours}小时` : <Text type="secondary">未记录</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="进度" className="mb-4">
            <div className="text-center">
              <Progress type="circle" percent={task.progress} />
              <div className="mt-2">
                <Text type="secondary">任务完成度</Text>
              </div>
            </div>
          </Card>

          <Card title="标签" className="mb-4">
            <Space wrap>
              {task.tags.map((tag) => (
                <Tag key={tag} closable>
                  {tag}
                </Tag>
              ))}
              <Tag style={{ borderStyle: 'dashed' }} icon={<PlusOutlined />}>
                添加标签
              </Tag>
            </Space>
          </Card>

          <Card title="关注者">
            <Avatar.Group maxCount={5}>
              {task.watchers.map((watcher) => (
                <Tooltip key={watcher.id} title={watcher.name}>
                  <Avatar icon={<UserOutlined />}>{watcher.name[0]}</Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
            <Button type="link" icon={<PlusOutlined />} className="mt-2">
              添加关注者
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}