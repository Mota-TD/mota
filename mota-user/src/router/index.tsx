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
const Issues = lazy(() => import('@/pages/issues'))
const CreateIssue = lazy(() => import('@/pages/issues/create'))
const Requirements = lazy(() => import('@/pages/requirements'))
const Testing = lazy(() => import('@/pages/testing'))
const Iterations = lazy(() => import('@/pages/iterations'))
const CreateIteration = lazy(() => import('@/pages/iterations/create'))
const Wiki = lazy(() => import('@/pages/wiki'))
const Members = lazy(() => import('@/pages/members'))
const Settings = lazy(() => import('@/pages/settings'))
const Profile = lazy(() => import('@/pages/profile'))
const Notifications = lazy(() => import('@/pages/notifications'))
const ProjectDetail = lazy(() => import('@/pages/project-detail'))
const IssueDetail = lazy(() => import('@/pages/issue-detail'))
const IterationDetail = lazy(() => import('@/pages/iteration-detail'))
const Backlog = lazy(() => import('@/pages/backlog'))
const Kanban = lazy(() => import('@/pages/kanban'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Help = lazy(() => import('@/pages/help'))

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
  // 项目管理路由 - 包含项目列表、项目分析、项目看板、项目甘特图（通过tab切换）
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
            <ProjectDetail />
          </Suspense>
        )
      },
    ]
  },
  // 任务管理路由 - 包含任务列表、任务分析、任务看板、任务甘特图（通过tab切换）
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
        path: 'create',
        element: (
          <Suspense fallback={<Loading />}>
            <CreateIssue />
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
        path: 'create',
        element: (
          <Suspense fallback={<Loading />}>
            <CreateIteration />
          </Suspense>
        )
      },
      {
        path: ':id',
        element: (
          <Suspense fallback={<Loading />}>
            <IterationDetail />
          </Suspense>
        )
      },
    ]
  },
  // 需求池路由
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
  // 成员管理路由（已移除，设置分组不再显示）
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
  // 设置路由（已移除，设置分组不再显示）
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