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

// 控制台页面
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Projects = lazy(() => import('@/pages/projects'))
const ProjectAnalytics = lazy(() => import('@/pages/project-analytics'))
const ProjectKanban = lazy(() => import('@/pages/project-kanban'))
const ProjectGantt = lazy(() => import('@/pages/project-gantt'))
const Issues = lazy(() => import('@/pages/issues'))
const TaskAnalytics = lazy(() => import('@/pages/task-analytics'))
const Kanban = lazy(() => import('@/pages/kanban'))
const TaskGantt = lazy(() => import('@/pages/task-gantt'))
const Requirements = lazy(() => import('@/pages/requirements'))
const Testing = lazy(() => import('@/pages/testing'))
const Iterations = lazy(() => import('@/pages/iterations'))
const Backlog = lazy(() => import('@/pages/backlog'))
const Wiki = lazy(() => import('@/pages/wiki'))
const Members = lazy(() => import('@/pages/members'))
const Settings = lazy(() => import('@/pages/settings'))
const Profile = lazy(() => import('@/pages/profile'))
const Notifications = lazy(() => import('@/pages/notifications'))
const ProjectDetail = lazy(() => import('@/pages/project-detail'))
const IssueDetail = lazy(() => import('@/pages/issue-detail'))
const IterationDetail = lazy(() => import('@/pages/iteration-detail'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// AI模块页面
const AISolution = lazy(() => import('@/pages/ai/solution'))
const AIPPT = lazy(() => import('@/pages/ai/ppt'))
const AITraining = lazy(() => import('@/pages/ai/training'))
const AINews = lazy(() => import('@/pages/ai/news'))
const AIHistory = lazy(() => import('@/pages/ai/history'))

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
      }
    ]
  },
  // 项目协同路由
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
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <Projects />
          </Suspense>
        )
      },
    ]
  },
  // 事项路由
  {
    path: '/issues',
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
            <Issues />
          </Suspense>
        )
      },
      {
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <IssueDetail />
          </Suspense>
        )
      }
    ]
  },
  // 看板路由
  {
    path: '/kanban',
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
            <Kanban />
          </Suspense>
        )
      },
    ]
  },
  // 待办事项路由
  {
    path: '/backlog',
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
            <Backlog />
          </Suspense>
        )
      },
    ]
  },
  // 迭代路由
  {
    path: '/iterations',
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
            <Iterations />
          </Suspense>
        )
      },
      {
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <Iterations />
          </Suspense>
        )
      },
    ]
  },
  // 项目分析路由
  {
    path: '/project-analytics',
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
            <ProjectAnalytics />
          </Suspense>
        )
      },
    ]
  },
  // 项目看板路由
  {
    path: '/project-kanban',
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
            <ProjectKanban />
          </Suspense>
        )
      },
    ]
  },
  // 项目甘特图路由
  {
    path: '/project-gantt',
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
            <ProjectGantt />
          </Suspense>
        )
      },
    ]
  },
  // 任务分析路由
  {
    path: '/task-analytics',
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
            <TaskAnalytics />
          </Suspense>
        )
      },
    ]
  },
  // 任务甘特图路由
  {
    path: '/task-gantt',
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
            <TaskGantt />
          </Suspense>
        )
      },
    ]
  },
  // 需求管理路由
  {
    path: '/requirements',
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
            <Requirements />
          </Suspense>
        )
      },
    ]
  },
  // 测试管理路由
  {
    path: '/testing',
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
            <Testing />
          </Suspense>
        )
      },
    ]
  },
  // Wiki路由
  {
    path: '/wiki',
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
            <Wiki />
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