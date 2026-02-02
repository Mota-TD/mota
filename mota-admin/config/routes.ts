/**
 * @name umi 的路由配置
 * @description Mota Admin 管理后台路由配置
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/',
    access: 'canAdmin',
    routes: [
      {
        path: '/',
        redirect: '/dashboard/overview',
      },
      // 运营仪表盘
      {
        path: '/dashboard',
        name: 'dashboard',
        icon: 'dashboard',
        routes: [
          {
            path: '/dashboard/overview',
            name: 'overview',
            component: './Dashboard/Overview',
          },
          {
            path: '/dashboard/analysis',
            name: 'analysis',
            component: './Dashboard/Analysis',
          },
          {
            path: '/dashboard/monitor',
            name: 'monitor',
            component: './Dashboard/Monitor',
          },
        ],
      },
      // 租户管理
      {
        path: '/tenant',
        name: 'tenant',
        icon: 'team',
        access: 'canViewTenant',
        routes: [
          {
            path: '/tenant/list',
            name: 'tenantList',
            component: './Tenant/TenantList',
          },
          {
            path: '/tenant/detail/:id',
            name: 'tenantDetail',
            hideInMenu: true,
            component: './Tenant/TenantDetail',
          },
          {
            path: '/tenant/packages',
            name: 'packageManage',
            component: './Tenant/PackageList',
          },
          {
            path: '/tenant/orders',
            name: 'orderManage',
            component: './Tenant/OrderList',
          },
        ],
      },
      // 用户管理
      {
        path: '/user-manage',
        name: 'userManage',
        icon: 'user',
        access: 'canViewUser',
        routes: [
          {
            path: '/user-manage/list',
            name: 'userList',
            component: './UserManage/UserList',
          },
          {
            path: '/user-manage/detail/:id',
            name: 'userDetail',
            hideInMenu: true,
            component: './UserManage/UserDetail',
          },
          {
            path: '/user-manage/feedback',
            name: 'feedback',
            component: './UserManage/Feedback',
          },
        ],
      },
      // 内容管理
      {
        path: '/content',
        name: 'content',
        icon: 'edit',
        access: 'canViewContent',
        routes: [
          {
            path: '/content/news/list',
            name: 'newsManage',
            component: './Content/NewsList',
          },
          {
            path: '/content/news/edit/:id?',
            name: 'newsEdit',
            hideInMenu: true,
            component: './Content/NewsEdit',
          },
          {
            path: '/content/template/list',
            name: 'templateManage',
            component: './Content/TemplateList',
          },
          {
            path: '/content/audit',
            name: 'contentAudit',
            component: './Content/Audit',
          },
        ],
      },
      // AI管理
      {
        path: '/ai',
        name: 'ai',
        icon: 'robot',
        access: 'canViewAI',
        routes: [
          {
            path: '/ai/models',
            name: 'modelManage',
            component: './AI/ModelList',
          },
          {
            path: '/ai/usage-stats',
            name: 'usageStats',
            component: './AI/UsageStats',
          },
          {
            path: '/ai/cost-control',
            name: 'costControl',
            component: './AI/CostControl',
          },
        ],
      },
      // 系统管理
      {
        path: '/system',
        name: 'system',
        icon: 'setting',
        access: 'canViewSystem',
        routes: [
          {
            path: '/system/config',
            name: 'systemConfig',
            component: './System/Config',
          },
          {
            path: '/system/role',
            name: 'roleManage',
            component: './System/Role',
          },
          {
            path: '/system/operation-log',
            name: 'operationLog',
            component: './System/OperationLog',
          },
          {
            path: '/system/monitor',
            name: 'systemMonitor',
            component: './System/Monitor',
          },
        ],
      },
      // 数据分析
      {
        path: '/analysis',
        name: 'analysis',
        icon: 'barChart',
        access: 'canViewAnalysis',
        routes: [
          {
            path: '/analysis/user',
            name: 'userAnalysis',
            component: './Analysis/UserAnalysis',
          },
          {
            path: '/analysis/behavior',
            name: 'behaviorAnalysis',
            component: './Analysis/Behavior',
          },
          {
            path: '/analysis/report',
            name: 'customReport',
            component: './Analysis/Report',
          },
        ],
      },
      {
        path: '*',
        layout: false,
        component: './404',
      },
    ],
  },
];
