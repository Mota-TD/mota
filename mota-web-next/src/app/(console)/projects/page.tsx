'use client';

import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
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
  Drawer,
  Steps,
  Empty,
  Spin,
  Tabs,
  Statistic,
  Skeleton,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
  StarOutlined,
  StarFilled,
  SettingOutlined,
  FolderAddOutlined,
  FlagOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  TableOutlined,
  InboxOutlined,
  UndoOutlined,
  CloseOutlined,
  RobotOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { projectService, type Project as ApiProject, type CreateProjectRequest } from '@/services';

// 动态导入重型组件
const GanttChart = dynamic(() => import('@/components/gantt-chart'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

const Calendar = dynamic(() => import('@/components/calendar'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

const KanbanBoard = dynamic(() => import('@/components/kanban-board'), {
  loading: () => <Skeleton active paragraph={{ rows: 8 }} />,
  ssr: false,
});

// 类型导入
import type { GanttTask } from '@/components/gantt-chart';
import type { KanbanTask, TaskStatus as KanbanTaskStatus } from '@/components/kanban-board';

dayjs.locale('zh-cn');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 项目颜色
const projectColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
];

// 项目类型定义
interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  priority?: 'high' | 'medium' | 'low' | 'urgent';
  progress: number;
  color?: string;
  startDate?: string;
  endDate?: string;
  starred?: number;
  memberCount?: number;
  issueCount?: number;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 里程碑接口
interface MilestoneItem {
  id: string;
  name: string;
  targetDate: string;
  description?: string;
  assigneeIds?: string[];
}

// 状态配置
const statusConfig: Record<string, { color: string; text: string; icon?: React.ReactNode }> = {
  planning: { color: 'orange', text: '规划中', icon: <ClockCircleOutlined /> },
  active: { color: 'green', text: '进行中', icon: <RiseOutlined /> },
  paused: { color: 'gold', text: '已暂停', icon: <ClockCircleOutlined /> },
  completed: { color: 'blue', text: '已完成', icon: <CheckCircleOutlined /> },
  archived: { color: 'default', text: '已归档', icon: <InboxOutlined /> },
};

// 优先级配置
const priorityConfig: Record<string, { color: string; text: string }> = {
  low: { color: 'green', text: '低' },
  medium: { color: 'blue', text: '中' },
  high: { color: 'orange', text: '高' },
  urgent: { color: 'red', text: '紧急' },
};

// 将 API 数据转换为本地数据格式
const transformApiProject = (apiProject: ApiProject): Project => ({
  id: apiProject.id,
  name: apiProject.name,
  key: `AF-${apiProject.id.slice(0, 4).toUpperCase()}`,
  description: apiProject.description,
  status: apiProject.status === 'paused' ? 'paused' :
          apiProject.status === 'archived' ? 'archived' :
          apiProject.status === 'completed' ? 'completed' :
          apiProject.progress < 20 ? 'planning' : 'active',
  priority: apiProject.priority as Project['priority'],
  progress: apiProject.progress,
  color: apiProject.color,
  startDate: apiProject.startDate,
  endDate: apiProject.endDate,
  starred: 0,
  memberCount: apiProject.memberCount,
  issueCount: apiProject.taskCount,
});

// 获取项目列表
const fetchProjects = async (): Promise<{ list: Project[]; total: number }> => {
  try {
    const response = await projectService.getProjects({ pageSize: 100 });
    const projects = response.records.map(transformApiProject);
    return { list: projects, total: response.total };
  } catch (error) {
    console.error('获取项目列表失败:', error);
    // 返回模拟数据
    return {
      list: [
        {
          id: '1',
          name: '企业门户网站重构',
          key: 'AF-0001',
          description: '对现有企业门户网站进行全面重构，提升用户体验和性能',
          status: 'active',
          priority: 'high',
          progress: 65,
          color: '#10B981',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          starred: 1,
          memberCount: 8,
          issueCount: 45,
        },
        {
          id: '2',
          name: '移动端App开发',
          key: 'AF-0002',
          description: '开发企业移动端应用，支持iOS和Android平台',
          status: 'planning',
          priority: 'medium',
          progress: 15,
          color: '#3B82F6',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          starred: 0,
          memberCount: 5,
          issueCount: 23,
        },
        {
          id: '3',
          name: '数据分析平台',
          key: 'AF-0003',
          description: '构建企业级数据分析平台，支持实时数据处理和可视化',
          status: 'active',
          priority: 'urgent',
          progress: 40,
          color: '#8B5CF6',
          startDate: '2024-01-15',
          endDate: '2024-07-15',
          starred: 1,
          memberCount: 6,
          issueCount: 38,
        },
        {
          id: '4',
          name: '客户关系管理系统',
          key: 'AF-0004',
          description: 'CRM系统升级，增加AI智能推荐功能',
          status: 'completed',
          priority: 'medium',
          progress: 100,
          color: '#F59E0B',
          startDate: '2023-10-01',
          endDate: '2024-01-31',
          starred: 0,
          memberCount: 4,
          issueCount: 56,
        },
      ],
      total: 4
    };
  }
};

// 删除项目
const deleteProject = async (id: string): Promise<void> => {
  try {
    await projectService.deleteProject(id);
  } catch (error) {
    console.warn('删除项目 API 失败:', error);
    throw error;
  }
};

// 创建项目
const createProject = async (data: CreateProjectRequest): Promise<void> => {
  try {
    await projectService.createProject(data);
  } catch (error) {
    console.warn('创建项目 API 失败:', error);
    throw error;
  }
};

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // 视图模式
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gantt' | 'calendar' | 'kanban'>('grid');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 创建项目抽屉
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedColor, setSelectedColor] = useState(projectColors[0]);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<any>({});
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '', description: '' });
  const [previewName, setPreviewName] = useState('');
  const [previewDesc, setPreviewDesc] = useState('');
  
  // 项目详情抽屉
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // 当前激活的标签页
  const activeTab = searchParams.get('tab') || 'list';

  // 获取项目列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // 过滤项目
  const filteredProjects = useMemo(() => {
    let filtered = data?.list || [];
    
    if (searchText) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.key.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    return filtered;
  }, [data?.list, searchText, statusFilter]);

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

  // 切换收藏
  const handleToggleStar = (projectId: string, starred: number) => {
    message.success(starred === 1 ? '已取消收藏' : '已收藏');
    refetch();
  };

  // 打开创建项目抽屉
  const openCreateDrawer = () => {
    setDrawerVisible(true);
    setCurrentStep(0);
    setSelectedColor(projectColors[0]);
    setPreviewName('');
    setPreviewDesc('');
    setMilestones([]);
    setFormData({});
    form.resetFields();
  };

  // 关闭创建项目抽屉
  const closeCreateDrawer = () => {
    setDrawerVisible(false);
    setCurrentStep(0);
    form.resetFields();
    setPreviewName('');
    setPreviewDesc('');
    setMilestones([]);
    setFormData({});
  };

  // 创建项目 mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      message.success('项目创建成功');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeCreateDrawer();
    },
    onError: (error: Error) => {
      message.error(error.message || '创建失败');
    },
  });

  // 处理创建项目
  const handleCreateProject = async () => {
    setCreateLoading(true);
    try {
      const dateRange = formData.dateRange;
      
      const projectData: CreateProjectRequest = {
        name: formData.name,
        description: formData.description,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        color: selectedColor,
      };
      
      await createMutation.mutateAsync(projectData);
    } catch (error: any) {
      if (error.errorFields) return;
      message.error('创建项目失败，请稍后重试');
    } finally {
      setCreateLoading(false);
    }
  };

  // 下一步
  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        const values = await form.validateFields();
        setFormData({ ...formData, ...values });
        setPreviewName(values.name || '');
        setPreviewDesc(values.description || '');
        setCurrentStep(1);
      } catch {
        // 验证失败
      }
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 添加里程碑
  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.targetDate) {
      message.warning('请填写里程碑名称和目标日期');
      return;
    }
    
    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        name: newMilestone.name,
        targetDate: newMilestone.targetDate,
        description: newMilestone.description,
      }
    ]);
    setNewMilestone({ name: '', targetDate: '', description: '' });
  };

  // 删除里程碑
  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  // 打开项目详情抽屉
  const openDetailDrawer = (project: Project) => {
    setSelectedProject(project);
    setDetailDrawerVisible(true);
  };

  // 关闭项目详情抽屉
  const closeDetailDrawer = () => {
    setDetailDrawerVisible(false);
    setSelectedProject(null);
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    router.push(`/projects?tab=${key}`);
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取项目菜单项
  const getProjectMenuItems = (project: Project) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: '查看详情',
      onClick: () => openDetailDrawer(project),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑项目',
      onClick: () => router.push(`/projects/${project.id}/edit`),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '项目设置',
      onClick: () => router.push(`/projects/${project.id}/settings`),
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除项目',
      danger: true,
      onClick: () => handleDelete(project),
    },
  ];

  // 甘特图数据转换
  const ganttTasks: GanttTask[] = useMemo(() => {
    return filteredProjects.map(project => ({
      id: project.id,
      name: project.name,
      startDate: project.startDate || null,
      endDate: project.endDate || null,
      progress: project.progress || 0,
      status: project.status === 'active' ? 'in_progress' : project.status === 'completed' ? 'completed' : 'pending',
      priority: project.priority || 'medium',
      assigneeName: project.owner?.name,
      color: project.color
    }));
  }, [filteredProjects]);

  // 看板数据转换
  const kanbanTasks: KanbanTask[] = useMemo(() => {
    return filteredProjects.map(project => {
      let status: KanbanTaskStatus = 'todo';
      if (project.status === 'active') status = 'in_progress';
      else if (project.status === 'completed') status = 'done';
      else if (project.status === 'planning') status = 'todo';
      else if (project.status === 'archived') status = 'done';
      
      return {
        id: Number(project.id) || parseInt(project.id),
        title: project.name,
        description: project.description,
        status,
        priority: (project.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
        projectId: Number(project.id) || parseInt(project.id),
        projectName: project.key,
        dueDate: project.endDate
      };
    });
  }, [filteredProjects]);

  // 处理看板任务移动
  const handleKanbanTaskMove = async (taskId: number, newStatus: KanbanTaskStatus): Promise<boolean> => {
    try {
      message.success('项目状态已更新');
      refetch();
      return true;
    } catch (error) {
      console.error('Failed to update project status:', error);
      return false;
    }
  };

  // 处理看板任务点击
  const handleKanbanTaskClick = (task: KanbanTask) => {
    const project = filteredProjects.find(p => Number(p.id) === task.id || p.id === String(task.id));
    if (project) {
      openDetailDrawer(project);
    }
  };

  // 处理甘特图任务点击
  const handleGanttTaskClick = (task: GanttTask) => {
    const project = filteredProjects.find(p => p.id === task.id);
    if (project) {
      openDetailDrawer(project);
    }
  };

  // 卡片视图渲染
  const renderGridView = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <Empty description="暂无项目" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" onClick={openCreateDrawer} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
            创建第一个项目
          </Button>
        </Empty>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {filteredProjects.map((project) => (
          <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              style={{ borderRadius: 12 }}
              onClick={() => openDetailDrawer(project)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Avatar
                  shape="square"
                  size={48}
                  style={{ backgroundColor: project.color || THEME_COLOR, borderRadius: 10 }}
                >
                  {project.name.charAt(0)}
                </Avatar>
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={project.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(project.id, project.starred || 0);
                    }}
                  />
                  <Dropdown
                    menu={{ items: getProjectMenuItems(project) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </Space>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{project.name}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{project.key}</Text>
              </div>
              <Text
                type="secondary"
                ellipsis={{ tooltip: project.description }}
                style={{ display: 'block', marginBottom: 12, minHeight: 40 }}
              >
                {project.description || '暂无描述'}
              </Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                {getStatusTag(project.status)}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <TeamOutlined /> {project.memberCount || 0} 成员
                </Text>
              </div>
              <Progress
                percent={project.progress || 0}
                size="small"
                strokeColor={THEME_COLOR}
                showInfo={true}
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 列表视图渲染
  const renderListView = () => {
    if (filteredProjects.length === 0 && !isLoading) {
      return (
        <Empty description="暂无项目" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" onClick={openCreateDrawer} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
            创建第一个项目
          </Button>
        </Empty>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            hoverable
            style={{ borderRadius: 12 }}
            onClick={() => openDetailDrawer(project)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                shape="square"
                size={40}
                style={{ backgroundColor: project.color || THEME_COLOR, borderRadius: 8 }}
              >
                {project.name.charAt(0)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{project.name}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>{project.key}</Text>
                </div>
                <Text type="secondary" ellipsis style={{ maxWidth: 400 }}>
                  {project.description || '暂无描述'}
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {getStatusTag(project.status)}
                <Text type="secondary"><TeamOutlined /> {project.memberCount || 0}</Text>
                <Text type="secondary">{project.issueCount || 0} 事项</Text>
                <div style={{ width: 120 }}>
                  <Progress percent={project.progress || 0} size="small" strokeColor={THEME_COLOR} />
                </div>
                <Space>
                  <Button
                    type="text"
                    icon={project.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(project.id, project.starred || 0);
                    }}
                  />
                  <Dropdown
                    menu={{ items: getProjectMenuItems(project) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </Space>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // 甘特图视图
  const renderGanttView = () => (
    <Card style={{ borderRadius: 12, minHeight: 500 }}>
      <GanttChart
        tasks={ganttTasks}
        onTaskClick={handleGanttTaskClick}
        onTaskDoubleClick={handleGanttTaskClick}
        showDependencies={true}
        showProgress={true}
        showToday={true}
      />
    </Card>
  );

  // 日历视图
  const renderCalendarView = () => (
    <Card style={{ borderRadius: 12, minHeight: 600 }}>
      <Calendar
        userId={1}
        defaultView="month"
        height="calc(100vh - 350px)"
        onDateSelect={(date) => {
          console.log('Selected date:', date);
        }}
      />
    </Card>
  );

  // 看板视图
  const renderKanbanView = () => (
    <div style={{ minHeight: 500 }}>
      <KanbanBoard
        tasks={kanbanTasks}
        loading={isLoading}
        onTaskMove={handleKanbanTaskMove}
        onTaskClick={handleKanbanTaskClick}
        validateDependencies={false}
      />
    </div>
  );

  // 项目列表标签页内容
  const renderListTab = () => (
    <div>
      {/* 工具栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索项目"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '进行中' },
              { value: 'completed', label: '已完成' },
              { value: 'planning', label: '规划中' },
              { value: 'archived', label: '已归档' },
            ]}
          />
        </Space>
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as typeof viewMode)}
          options={[
            { value: 'grid', icon: <AppstoreOutlined />, label: '卡片' },
            { value: 'list', icon: <UnorderedListOutlined />, label: '列表' },
            { value: 'gantt', icon: <BarChartOutlined />, label: '甘特图' },
            { value: 'calendar', icon: <CalendarOutlined />, label: '日历' },
            { value: 'kanban', icon: <TableOutlined />, label: '看板' },
          ]}
        />
      </div>

      {/* 视图内容 */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'gantt' && renderGanttView()}
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'kanban' && renderKanbanView()}
        </>
      )}
    </div>
  );

  // 项目分析标签页内容
  const renderAnalyticsTab = () => {
    const projects = data?.list || [];
    const overviewStats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalMembers: projects.reduce((sum, p) => sum + (p.memberCount || 0), 0),
      avgCompletionRate: projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
        : 0,
    };

    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic
                title="项目总数"
                value={overviewStats.totalProjects}
                prefix={<ProjectOutlined style={{ color: THEME_COLOR }} />}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic
                title="活跃项目"
                value={overviewStats.activeProjects}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic
                title="团队成员"
                value={overviewStats.totalMembers}
                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                suffix="人"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 12 }}>
              <Statistic
                title="平均完成率"
                value={overviewStats.avgCompletionRate}
                prefix={<RiseOutlined style={{ color: '#13c2c2' }} />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Card title="项目进度详情" style={{ borderRadius: 12 }}>
          <Table
            columns={[
              {
                title: '项目名称',
                dataIndex: 'name',
                key: 'name',
                render: (text: string, record: Project) => (
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: record.color || THEME_COLOR }}>
                      {text.charAt(0)}
                    </Avatar>
                    <Text strong>{text}</Text>
                  </Space>
                ),
              },
              {
                title: '进度',
                dataIndex: 'progress',
                key: 'progress',
                render: (progress: number) => (
                  <Progress
                    percent={progress || 0}
                    size="small"
                    status={progress === 100 ? 'success' : 'active'}
                    strokeColor={THEME_COLOR}
                  />
                ),
              },
              {
                title: '成员',
                dataIndex: 'memberCount',
                key: 'memberCount',
                render: (count: number) => <Text>{count || 0} 人</Text>,
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => getStatusTag(status),
              },
            ]}
            dataSource={projects}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    );
  };

  // 归档项目标签页内容
  const renderArchivedTab = () => {
    const archivedProjects = (data?.list || []).filter(p => p.status === 'archived');

    if (archivedProjects.length === 0) {
      return (
        <Empty description="暂无归档项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {archivedProjects.map((project) => (
          <Card key={project.id} hoverable style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                shape="square"
                size={40}
                style={{ backgroundColor: project.color || '#8c8c8c', opacity: 0.7, borderRadius: 8 }}
              >
                {project.name.charAt(0)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#8c8c8c' }}>{project.name}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>{project.key}</Text>
                </div>
                <Text type="secondary">{project.description || '暂无描述'}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Tag color="default">已归档</Tag>
                <Text type="secondary"><TeamOutlined /> {project.memberCount || 0} 成员</Text>
                <Tooltip title="恢复项目">
                  <Button type="primary" ghost icon={<UndoOutlined />}>
                    恢复
                  </Button>
                </Tooltip>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: '永久删除',
                        danger: true,
                        onClick: () => handleDelete(project),
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              visibility: 'private',
              ...formData
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 16, color: '#333' }}>基本信息</div>
            
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="项目名称"
                  name="name"
                  rules={[{ required: true, message: '请输入项目名称' }]}
                >
                  <Input
                    size="large"
                    placeholder="请输入项目名称"
                    onChange={(e) => setPreviewName(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="项目标识"
                  tooltip="项目标识由系统自动生成"
                >
                  <Input
                    size="large"
                    value="AF-0001"
                    disabled
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="项目描述"
              name="description"
            >
              <TextArea
                rows={4}
                placeholder="请输入项目描述，帮助团队成员了解项目目标和范围"
                maxLength={500}
                showCount
                onChange={(e) => setPreviewDesc(e.target.value)}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="项目周期"
                  name="dateRange"
                  rules={[{ required: true, message: '请选择项目周期' }]}
                >
                  <RangePicker
                    size="large"
                    style={{ width: '100%' }}
                    placeholder={['开始日期', '结束日期']}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="项目负责人"
                  name="ownerId"
                >
                  <Select
                    size="large"
                    placeholder="请选择项目负责人"
                    options={[
                      { value: '1', label: '张三' },
                      { value: '2', label: '李四' },
                      { value: '3', label: '王五' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="项目颜色">
              <div style={{ display: 'flex', gap: 8 }}>
                {projectColors.map(color => (
                  <div
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: selectedColor === color ? '3px solid #1a1a1a' : '3px solid transparent',
                    }}
                  />
                ))}
              </div>
            </Form.Item>
          </Form>
        );
      
      case 1:
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <FlagOutlined style={{ color: THEME_COLOR }} />
              <span style={{ fontWeight: 600 }}>设置项目里程碑</span>
              <Text type="secondary">（可选）</Text>
            </div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              设置项目的关键节点，帮助跟踪项目进度
            </p>
            
            <div style={{ marginBottom: 16 }}>
              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={8}>
                  <Input
                    placeholder="里程碑名称"
                    value={newMilestone.name}
                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  />
                </Col>
                <Col span={6}>
                  <DatePicker
                    placeholder="目标日期"
                    style={{ width: '100%' }}
                    value={newMilestone.targetDate ? dayjs(newMilestone.targetDate) : null}
                    onChange={(date) => setNewMilestone({ ...newMilestone, targetDate: date?.format('YYYY-MM-DD') || '' })}
                  />
                </Col>
                <Col span={7}>
                  <Input
                    placeholder="描述（可选）"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  />
                </Col>
                <Col span={3}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMilestone} style={{ width: '100%', background: THEME_COLOR, borderColor: THEME_COLOR }}>
                    添加
                  </Button>
                </Col>
              </Row>
            </div>
            
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <Button icon={<RobotOutlined />}>
                AI智能生成里程碑建议
              </Button>
            </div>
            
            {milestones.length === 0 ? (
              <Empty description="暂未设置里程碑" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {milestones.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: '#fafafa',
                      borderRadius: 8,
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <HolderOutlined style={{ color: '#999', cursor: 'grab' }} />
                    <FlagOutlined style={{ color: THEME_COLOR }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {item.targetDate}
                        {item.description && ` · ${item.description}`}
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteMilestone(item.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  // 标签页配置
  const archivedCount = (data?.list || []).filter(p => p.status === 'archived').length;
  const tabItems = [
    { key: 'list', label: '项目列表', children: renderListTab() },
    { key: 'analytics', label: '项目分析', children: renderAnalyticsTab() },
    {
      key: 'archived',
      label: (
        <span>
          归档项目 {archivedCount > 0 && <Tag style={{ marginLeft: 4 }}>{archivedCount}</Tag>}
        </span>
      ),
      children: renderArchivedTab(),
    },
  ];

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
        <Title level={4} style={{ color: '#fff', margin: 0 }}>项目管理</Title>
        <Button
          icon={<PlusOutlined />}
          onClick={openCreateDrawer}
          style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}
        >
          新建项目
        </Button>
      </div>

      {/* 标签页导航 */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />

      {/* 创建项目抽屉 */}
      <Drawer
        title={
          <Space>
            <FolderAddOutlined style={{ color: THEME_COLOR }} />
            新建项目
          </Space>
        }
        placement="right"
        width={1000}
        onClose={closeCreateDrawer}
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px' }}>
            <div>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>上一步</Button>
              )}
            </div>
            <Space>
              <Button onClick={closeCreateDrawer}>取消</Button>
              {currentStep < 1 ? (
                <Button type="primary" onClick={handleNext} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                  下一步
                </Button>
              ) : (
                <Button type="primary" loading={createLoading} onClick={handleCreateProject} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                  完成创建
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <div style={{ padding: 24 }}>
          <Row gutter={24}>
            <Col span={16}>
              <Card style={{ borderRadius: 12 }}>
                <Steps
                  current={currentStep}
                  items={[
                    { title: '基本信息', icon: <ProjectOutlined /> },
                    { title: '设置里程碑', icon: <FlagOutlined /> },
                  ]}
                  style={{ marginBottom: 32 }}
                />
                
                {renderStepContent()}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="项目预览" style={{ borderRadius: 12, marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={64}
                    style={{ backgroundColor: selectedColor }}
                    icon={<ProjectOutlined />}
                  />
                  <h3 style={{ marginTop: 12, marginBottom: 4 }}>
                    {previewName || formData.name || '项目名称'}
                  </h3>
                  <p style={{ color: '#999', fontSize: 12 }}>AF-0001</p>
                  <p style={{ color: '#666', fontSize: 13 }}>
                    {previewDesc || formData.description || '项目描述将显示在这里'}
                  </p>
                  {milestones.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>里程碑</div>
                      <div style={{ fontSize: 14, color: '#1a1a1a' }}>{milestones.length} 个</div>
                    </div>
                  )}
                </div>
              </Card>
              <Card
                title={
                  <span>
                    <RobotOutlined style={{ marginRight: 8, color: '#faad14' }} />
                    创建指南
                  </span>
                }
                style={{ borderRadius: 12 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <RiseOutlined style={{ color: THEME_COLOR, fontSize: 16 }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>步骤引导</div>
                      <div style={{ fontSize: 12, color: '#666' }}>按照步骤完成项目创建，确保信息完整</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <TeamOutlined style={{ color: THEME_COLOR, fontSize: 16 }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>部门协作</div>
                      <div style={{ fontSize: 12, color: '#666' }}>选择参与部门后可以为每个部门分配任务</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <FlagOutlined style={{ color: THEME_COLOR, fontSize: 16 }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>里程碑管理</div>
                      <div style={{ fontSize: 12, color: '#666' }}>设置里程碑帮助跟踪项目关键节点</div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Drawer>

      {/* 项目详情抽屉 */}
      <Drawer
        title={null}
        placement="right"
        width="80%"
        onClose={closeDetailDrawer}
        open={detailDrawerVisible}
        styles={{
          body: { padding: 0, background: '#f5f7fa' },
          header: { display: 'none' },
        }}
        closable={false}
      >
        {selectedProject && (
          <div style={{ padding: 24 }}>
            {/* 项目头部 */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={closeDetailDrawer}
                />
                <Avatar
                  shape="square"
                  size={64}
                  style={{ backgroundColor: selectedProject.color || THEME_COLOR, borderRadius: 12 }}
                >
                  {selectedProject.name.charAt(0)}
                </Avatar>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Title level={4} style={{ margin: 0 }}>{selectedProject.name}</Title>
                    <Text type="secondary">{selectedProject.key}</Text>
                    {getStatusTag(selectedProject.status)}
                  </div>
                  <Text type="secondary">{selectedProject.description || '暂无描述'}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Space>
                      <Text type="secondary"><TeamOutlined /> {selectedProject.memberCount || 0} 成员</Text>
                      {selectedProject.startDate && selectedProject.endDate && (
                        <Text type="secondary">
                          <CalendarOutlined /> {selectedProject.startDate} ~ {selectedProject.endDate}
                        </Text>
                      )}
                    </Space>
                  </div>
                </div>
              </div>
              <Space>
                <Button
                  type="text"
                  icon={selectedProject.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={() => handleToggleStar(selectedProject.id, selectedProject.starred || 0)}
                />
                <Button icon={<EditOutlined />}>编辑</Button>
                <Button icon={<SettingOutlined />}>设置</Button>
                <Button onClick={() => router.push(`/projects/${selectedProject.id}`)}>
                  <EyeOutlined /> 查看完整页面
                </Button>
              </Space>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="任务总数"
                    value={selectedProject.issueCount || 0}
                    prefix={<ProjectOutlined style={{ color: THEME_COLOR }} />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="进行中"
                    value={Math.round((selectedProject.issueCount || 0) * 0.4)}
                    valueStyle={{ color: '#1677ff' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="已完成"
                    value={Math.round((selectedProject.issueCount || 0) * 0.5)}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="完成率"
                    value={selectedProject.progress || 0}
                    suffix="%"
                    valueStyle={{ color: THEME_COLOR }}
                    prefix={<RiseOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* 项目进度 */}
            <Card title="项目进度" style={{ borderRadius: 12 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>整体进度</span>
                  <span>{selectedProject.progress || 0}%</span>
                </div>
                <Progress percent={selectedProject.progress || 0} showInfo={false} strokeColor={THEME_COLOR} />
              </div>
              <Empty description="暂无任务数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}