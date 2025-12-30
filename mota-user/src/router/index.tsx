import { lazy, Suspense } from 'react'
import { RouteObject } from 'react-router-dom'
import { Spin } from 'antd'

// 布局组件
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))
const ConsoleLayout = lazy(() => import('@/layouts/ConsoleLayout'))

// 首页
const Home = lazy(() => import('@/pages/home'))

// 认证页面
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))

// 控制台页面
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Projects = lazy(() => import('@/pages/projects'))
const CreateProject = lazy(() => import('@/pages/projects/create'))
const Members = lazy(() => import('@/pages/members'))
const Settings = lazy(() => import('@/pages/settings'))
const Profile = lazy(() => import('@/pages/profile'))
const Notifications = lazy(() => import('@/pages/notifications'))
const ProjectDetail = lazy(() => import('@/pages/project-detail'))
const ProjectDetailV2 = lazy(() => import('@/pages/project-detail-v2'))
const DepartmentTaskDetail = lazy(() => import('@/pages/department-task-detail'))
const TaskDetail = lazy(() => import('@/pages/task-detail'))
const MilestoneTaskDetail = lazy(() => import('@/pages/milestone-task-detail'))
const MyTasks = lazy(() => import('@/pages/my-tasks'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Help = lazy(() => import('@/pages/help'))

// 新增页面
const CalendarPage = lazy(() => import('@/pages/calendar'))
const KnowledgePage = lazy(() => import('@/pages/knowledge'))
const KnowledgeStatisticsPage = lazy(() => import('@/pages/knowledge-statistics'))
const DocumentsPage = lazy(() => import('@/pages/documents'))
const ProgressTrackingPage = lazy(() => import('@/pages/progress-tracking'))
const ResourceManagementPage = lazy(() => import('@/pages/resource-management'))
const ReportAnalyticsPage = lazy(() => import('@/pages/report-analytics'))
const FavoritesPage = lazy(() => import('@/pages/favorites'))
const TemplatesPage = lazy(() => import('@/pages/templates'))

// AI模块页面
const AISolution = lazy(() => import('@/pages/ai/solution'))
const AIProposal = lazy(() => import('@/pages/ai/proposal'))
const AIPPT = lazy(() => import('@/pages/ai/ppt'))
const AITraining = lazy(() => import('@/pages/ai/training'))
const AINews = lazy(() => import('@/pages/ai/news'))
const AIHistory = lazy(() => import('@/pages/ai/history'))
const AIKnowledgeBase = lazy(() => import('@/pages/ai/knowledge-base'))
const AISearch = lazy(() => import('@/pages/ai/search'))
const AIAssistant = lazy(() => import('@/pages/ai/assistant'))
const AIModelManagement = lazy(() => import('@/pages/ai/model-management'))

// 系统管理页面
const SystemManagement = lazy(() => import('@/pages/system'))

// 组织架构页面
const Departments = lazy(() => import('@/pages/departments'))

// 企业管理页面
const EnterpriseManagement = lazy(() => import('@/pages/enterprise'))

// 加载中组件
const Loading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <Spin size="large" />
  </div>
)

// 路由配置
export const routes: RouteObject[] = [
  // 首页 - 独立路由
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <Home />
      </Suspense>
    )
  },
  // 认证相关路由
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        )
      }
    ]
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<Loading />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Register />
          </Suspense>
        )
      }
    ]
  },
  // 忘记密码路由
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<Loading />}>
        <ForgotPassword />
      </Suspense>
    )
  },
  // 控制台路由
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        )
      },
    ]
  },
  // AI模块路由
  {
    path: '/ai',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        path: 'solution',
        element: (
          <Suspense fallback={<Loading />}>
            <AISolution />
          </Suspense>
        )
      },
      {
        path: 'proposal',
        element: (
          <Suspense fallback={<Loading />}>
            <AIProposal />
          </Suspense>
        )
      },
      {
        path: 'ppt',
        element: (
          <Suspense fallback={<Loading />}>
            <AIPPT />
          </Suspense>
        )
      },
      {
        path: 'training',
        element: (
          <Suspense fallback={<Loading />}>
            <AITraining />
          </Suspense>
        )
      },
      {
        path: 'news',
        element: (
          <Suspense fallback={<Loading />}>
            <AINews />
          </Suspense>
        )
      },
      {
        path: 'history',
        element: (
          <Suspense fallback={<Loading />}>
            <AIHistory />
          </Suspense>
        )
      },
      {
        path: 'knowledge-base',
        element: (
          <Suspense fallback={<Loading />}>
            <AIKnowledgeBase />
          </Suspense>
        )
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<Loading />}>
            <AISearch />
          </Suspense>
        )
      },
      {
        path: 'assistant',
        element: (
          <Suspense fallback={<Loading />}>
            <AIAssistant />
          </Suspense>
        )
      },
      {
        path: 'model-management',
        element: (
          <Suspense fallback={<Loading />}>
            <AIModelManagement />
          </Suspense>
        )
      }
    ]
  },
  // 项目管理路由
  {
    path: '/projects',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Projects />
          </Suspense>
        )
      },
      {
        path: 'create',
        element: (
          <Suspense fallback={<Loading />}>
            <CreateProject />
          </Suspense>
        )
      },
      {
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <ProjectDetailV2 />
          </Suspense>
        )
      },
      {
        path: ':id/legacy',
        element: (
          <Suspense fallback={<Loading />}>
            <ProjectDetail />
          </Suspense>
        )
      },
    ]
  },
  // 部门任务详情路由
  {
    path: '/department-tasks',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <DepartmentTaskDetail />
          </Suspense>
        )
      },
    ]
  },
  // 执行任务路由
  {
    path: '/tasks',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <MyTasks />
          </Suspense>
        )
      },
      {
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <TaskDetail />
          </Suspense>
        )
      },
    ]
  },
  // 里程碑任务详情路由
  {
    path: '/milestones/tasks',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <MilestoneTaskDetail />
          </Suspense>
        )
      },
    ]
  },
  // 我的任务路由（别名）
  {
    path: '/my-tasks',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <MyTasks />
          </Suspense>
        )
      },
    ]
  },
  // 成员管理路由
  {
    path: '/members',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Members />
          </Suspense>
        )
      },
    ]
  },
  // 部门管理路由
  {
    path: '/departments',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Departments />
          </Suspense>
        )
      },
    ]
  },
  // 企业管理路由
  {
    path: '/enterprise',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <EnterpriseManagement />
          </Suspense>
        )
      },
    ]
  },
  // 设置路由
  {
    path: '/settings',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Settings />
          </Suspense>
        )
      },
    ]
  },
  // 个人资料路由
  {
    path: '/profile',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Profile />
          </Suspense>
        )
      },
    ]
  },
  // 通知路由
  {
    path: '/notifications',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Notifications />
          </Suspense>
        )
      },
    ]
  },
  // 帮助中心路由
  {
    path: '/help',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Help />
          </Suspense>
        )
      },
    ]
  },
  // 日程管理路由
  {
    path: '/calendar',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <CalendarPage />
          </Suspense>
        )
      },
    ]
  },
  // 知识图谱路由
  {
    path: '/knowledge',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <KnowledgePage />
          </Suspense>
        )
      },
    ]
  },
  // 知识统计路由
  {
    path: '/knowledge-statistics',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <KnowledgeStatisticsPage />
          </Suspense>
        )
      },
    ]
  },
  // 文档管理路由
  {
    path: '/documents',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <DocumentsPage />
          </Suspense>
        )
      },
    ]
  },
  // 进度跟踪路由
  {
    path: '/progress-tracking',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <ProgressTrackingPage />
          </Suspense>
        )
      },
    ]
  },
  // 资源管理路由
  {
    path: '/resource-management',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <ResourceManagementPage />
          </Suspense>
        )
      },
    ]
  },
  // 报表分析路由
  {
    path: '/report-analytics',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <ReportAnalyticsPage />
          </Suspense>
        )
      },
    ]
  },
  // 收藏夹路由
  {
    path: '/favorites',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <FavoritesPage />
          </Suspense>
        )
      },
    ]
  },
  // 系统管理路由
  {
    path: '/system',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <SystemManagement />
          </Suspense>
        )
      },
    ]
  },
  // 模板库路由
  {
    path: '/templates',
    element: (
      <Suspense fallback={<Loading />}>
        <ConsoleLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <TemplatesPage />
          </Suspense>
        )
      },
    ]
  },
  // 404 路由
  {
    path: '*',
    element: (
      <Suspense fallback={<Loading />}>
        <NotFound />
      </Suspense>
    )
  }
]

export default routes