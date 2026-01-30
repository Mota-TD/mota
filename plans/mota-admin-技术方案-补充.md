# 摩塔 Mota-Admin 管理后台技术方案 - 补充文档

> 本文档是《mota-admin-技术方案.md》的补充部分

---

## 七、前端架构设计（续）

### 7.2 路由配置（完整版）

```typescript
// config/routes.ts
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
    ],
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    authority: ['admin', 'user'],
    routes: [
      { path: '/', redirect: '/dashboard/overview' },
      // 仪表盘
      {
        path: '/dashboard',
        name: '仪表盘',
        icon: 'dashboard',
        routes: [
          {
            path: '/dashboard/overview',
            name: '数据概览',
            component: './Dashboard/Overview',
          },
          {
            path: '/dashboard/analysis',
            name: '数据分析',
            component: './Dashboard/Analysis',
          },
          {
            path: '/dashboard/monitor',
            name: '实时监控',
            component: './Dashboard/Monitor',
          },
        ],
      },
      // 租户管理
      {
        path: '/tenant',
        name: '租户管理',
        icon: 'team',
        authority: ['admin', 'operator'],
        routes: [
          {
            path: '/tenant/list',
            name: '租户列表',
            component: './Tenant/TenantList',
          },
          {
            path: '/tenant/detail/:id',
            name: '租户详情',
            hideInMenu: true,
            component: './Tenant/TenantDetail',
          },
          {
            path: '/tenant/packages',
            name: '套餐管理',
            component: './Tenant/PackageList',
          },
          {
            path: '/tenant/orders',
            name: '订单管理',
            component: './Tenant/OrderList',
          },
        ],
      },
      // 用户管理
      {
        path: '/user-manage',
        name: '用户管理',
        icon: 'user',
        authority: ['admin', 'operator'],
        routes: [
          {
            path: '/user-manage/list',
            name: '用户列表',
            component: './UserManage/UserList',
          },
          {
            path: '/user-manage/detail/:id',
            name: '用户详情',
            hideInMenu: true,
            component: './UserManage/UserDetail',
          },
          {
            path: '/user-manage/feedback',
            name: '用户反馈',
            component: './UserManage/Feedback',
          },
        ],
      },
      // 内容管理
      {
        path: '/content',
        name: '内容管理',
        icon: 'edit',
        authority: ['admin', 'operator'],
        routes: [
          {
            path: '/content/news/list',
            name: '新闻管理',
            component: './Content/NewsList',
          },
          {
            path: '/content/news/edit/:id?',
            name: '新闻编辑',
            hideInMenu: true,
            component: './Content/NewsEdit',
          },
          {
            path: '/content/template/list',
            name: '模板管理',
            component: './Content/TemplateList',
          },
          {
            path: '/content/audit',
            name: '内容审核',
            component: './Content/Audit',
          },
        ],
      },
      // AI管理
      {
        path: '/ai',
        name: 'AI管理',
        icon: 'robot',
        authority: ['admin'],
        routes: [
          {
            path: '/ai/models',
            name: '模型管理',
            component: './AI/ModelList',
          },
          {
            path: '/ai/usage-stats',
            name: '使用统计',
            component: './AI/UsageStats',
          },
          {
            path: '/ai/cost-control',
            name: '成本控制',
            component: './AI/CostControl',
          },
        ],
      },
      // 系统管理
      {
        path: '/system',
        name: '系统管理',
        icon: 'setting',
        authority: ['admin'],
        routes: [
          {
            path: '/system/config',
            name: '系统配置',
            component: './System/Config',
          },
          {
            path: '/system/role',
            name: '角色管理',
            component: './System/Role',
          },
          {
            path: '/system/operation-log',
            name: '操作日志',
            component: './System/OperationLog',
          },
          {
            path: '/system/monitor',
            name: '系统监控',
            component: './System/Monitor',
          },
        ],
      },
      // 数据分析
      {
        path: '/analysis',
        name: '数据分析',
        icon: 'bar-chart',
        authority: ['admin', 'analyst'],
        routes: [
          {
            path: '/analysis/user',
            name: '用户分析',
            component: './Analysis/UserAnalysis',
          },
          {
            path: '/analysis/behavior',
            name: '行为分析',
            component: './Analysis/Behavior',
          },
          {
            path: '/analysis/report',
            name: '自定义报表',
            component: './Analysis/Report',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
];
```

### 7.3 核心组件实现

#### 7.3.1 租户列表页面

```typescript
// src/pages/Tenant/TenantList/index.tsx
import { useState } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Space, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getTenantList, updateTenantStatus } from '@/services/tenant';
import type { Tenant } from '@/types/tenant';

const TenantList: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: ProColumns<Tenant>[] = [
    {
      title: '租户ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '租户名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '租户编码',
      dataIndex: 'code',
      width: 120,
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      width: 100,
      search: false,
    },
    {
      title: '联系邮箱',
      dataIndex: 'contactEmail',
      width: 180,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        suspended: { text: '暂停', status: 'Warning' },
        expired: { text: '过期', status: 'Error' },
      },
    },
    {
      title: '套餐',
      dataIndex: 'packageName',
      width: 120,
      search: false,
    },
    {
      title: '用户数',
      dataIndex: 'currentUsers',
      width: 80,
      search: false,
      render: (_, record) => `${record.currentUsers}/${record.maxUsers}`,
    },
    {
      title: '到期时间',
      dataIndex: 'packageExpireAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleView(record.id)}>查看</a>
          <a onClick={() => handleEdit(record.id)}>编辑</a>
          {record.status === 'active' ? (
            <a onClick={() => handleSuspend(record.id)}>暂停</a>
          ) : (
            <a onClick={() => handleActivate(record.id)}>启用</a>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (id: number) => {
    // 跳转到详情页
    window.location.href = `/tenant/detail/${id}`;
  };

  const handleEdit = (id: number) => {
    // 打开编辑模态框
    console.log('编辑租户:', id);
  };

  const handleSuspend = (id: number) => {
    Modal.confirm({
      title: '确认暂停',
      content: '确定要暂停该租户吗？暂停后租户将无法使用系统。',
      onOk: async () => {
        await updateTenantStatus(id, 'suspended');
        message.success('暂停成功');
        actionRef.current?.reload();
      },
    });
  };

  const handleActivate = (id: number) => {
    Modal.confirm({
      title: '确认启用',
      content: '确定要启用该租户吗？',
      onOk: async () => {
        await updateTenantStatus(id, 'active');
        message.success('启用成功');
        actionRef.current?.reload();
      },
    });
  };

  const actionRef = useRef<ActionType>();

  return (
    <ProTable<Tenant>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const response = await getTenantList(params);
        return {
          data: response.data.list,
          total: response.data.total,
          success: true,
        };
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        pageSize: 20,
      }}
      scroll={{ x: 1500 }}
      rowSelection={{
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }}
      toolBarRender={() => [
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            // 打开创建模态框
          }}
        >
          新建租户
        </Button>,
        <Button
          key="export"
          onClick={() => {
            // 导出数据
          }}
        >
          导出
        </Button>,
      ]}
    />
  );
};

export default TenantList;
```

---

## 八、开发规范

### 8.1 代码规范

#### 8.1.1 前端代码规范

```typescript
// 1. 组件命名：使用 PascalCase
export const TenantList: React.FC = () => {};

// 2. 文件命名：组件使用 PascalCase，工具类使用 camelCase
// TenantList.tsx
// tenantService.ts

// 3. 接口定义：使用 I 前缀或 Type 后缀
interface ITenant {
  id: number;
  name: string;
}

type TenantListParams = {
  page: number;
  pageSize: number;
};

// 4. 枚举：使用 PascalCase，值使用大写下划线
enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

// 5. 常量：使用大写下划线
const API_BASE_URL = 'https://api.mota.com';
const MAX_RETRY_TIMES = 3;

// 6. 函数命名：使用 camelCase，动词开头
const getTenantList = async () => {};
const handleSubmit = () => {};
const validateForm = () => {};

// 7. Hook命名：use 前缀
const useTenantList = () => {};
const useAuth = () => {};

// 8. 文件组织
src/pages/Tenant/
├── TenantList/
│   ├── index.tsx          # 主组件
│   ├── components/        # 私有组件
│   │   ├── CreateModal.tsx
│   │   └── FilterForm.tsx
│   ├── hooks/             # 自定义Hook
│   │   └── useTenantList.ts
│   ├── types.ts           # 类型定义
│   └── index.less         # 样式文件
```

#### 8.1.2 后端代码规范

```java
// 1. 类命名：PascalCase
public class TenantService {}

// 2. 方法命名：camelCase
public List<Tenant> getTenantList() {}

// 3. 常量：大写下划线
public static final String STATUS_ACTIVE = "active";

// 4. 包命名：小写，使用点分隔
package com.mota.admin.tenant.service;

// 5. 注释规范
/**
 * 租户服务
 * 
 * @author Mota Team
 * @since 2026-01-30
 */
@Service
public class TenantService {
    
    /**
     * 获取租户列表
     * 
     * @param query 查询参数
     * @return 租户列表
     */
    public PageResult<TenantVO> list(TenantQueryDTO query) {
        // 实现代码
    }
}

// 6. 异常处理
try {
    // 业务代码
} catch (BusinessException e) {
    log.error("业务异常: {}", e.getMessage());
    throw e;
} catch (Exception e) {
    log.error("系统异常", e);
    throw new BusinessException("系统异常");
}

// 7. 日志规范
log.info("创建租户成功, tenantId: {}", tenantId);
log.warn("租户即将过期, tenantId: {}", tenantId);
log.error("创建租户失败", e);
```

### 8.2 Git规范

#### 8.2.1 分支管理

```
主分支
├── main          # 生产环境，只能通过 PR 合并
├── develop       # 开发环境，日常开发分支
├── release/v1.0  # 预发布分支
└── hotfix/v1.0.1 # 紧急修复分支

功能分支
├── feature/tenant-management  # 功能开发
├── feature/ai-management
└── feature/data-analysis

修复分支
├── bugfix/login-issue         # Bug修复
└── bugfix/api-error
```

#### 8.2.2 Commit规范

```bash
# 格式: <type>(<scope>): <subject>

# type 类型
feat:     新功能
fix:      Bug修复
docs:     文档更新
style:    代码格式（不影响代码运行）
refactor: 重构（既不是新增功能，也不是修改bug）
perf:     性能优化
test:     测试相关
chore:    构建过程或辅助工具的变动

# 示例
feat(tenant): 添加租户列表页面
fix(api): 修复租户详情接口返回数据错误
docs(readme): 更新部署文档
refactor(service): 重构租户服务代码结构
perf(query): 优化租户列表查询性能
```

### 8.3 API接口规范

#### 8.3.1 请求规范

```typescript
// GET 请求 - 查询参数使用 query
GET /api/v1/tenants?page=1&pageSize=20&status=active

// POST 请求 - 数据使用 body
POST /api/v1/tenants
Content-Type: application/json

{
  "name": "测试租户",
  "code": "test001",
  "contactName": "张三"
}

// PUT 请求 - 更新资源
PUT /api/v1/tenants/123
Content-Type: application/json

{
  "name": "更新后的名称"
}

// DELETE 请求 - 删除资源
DELETE /api/v1/tenants/123
```

#### 8.3.2 响应规范

```typescript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "name": "测试租户"
  },
  "timestamp": 1706601600000
}

// 分页响应
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": 1706601600000
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "error": {
    "field": "email",
    "message": "邮箱格式不正确"
  },
  "timestamp": 1706601600000
}

// 错误码定义
200: 成功
400: 请求参数错误
401: 未认证
403: 无权限
404: 资源不存在
500: 服务器错误
```

---

## 九、测试方案

### 9.1 测试策略

```
测试金字塔
├── E2E测试 (5%)
│   └── 关键业务流程
├── 集成测试 (15%)
│   └── API接口测试
└── 单元测试 (80%)
    ├── 前端组件测试
    └── 后端服务测试
```

### 9.2 单元测试

#### 9.2.1 前端测试

```typescript
// src/pages/Tenant/TenantList/__tests__/index.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TenantList from '../index';
import * as tenantService from '@/services/tenant';

jest.mock('@/services/tenant');

describe('TenantList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders tenant list', async () => {
    const mockData = {
      code: 200,
      data: {
        list: [
          { id: 1, name: '租户1', status: 'active' },
          { id: 2, name: '租户2', status: 'active' },
        ],
        total: 2,
      },
    };

    (tenantService.getTenantList as jest.Mock).mockResolvedValue(mockData);

    render(<TenantList />);

    await waitFor(() => {
      expect(screen.getByText('租户1')).toBeInTheDocument();
      expect(screen.getByText('租户2')).toBeInTheDocument();
    });
  });

  test('handles suspend action', async () => {
    // 测试暂停功能
  });
});
```

#### 9.2.2 后端测试

```java
// TenantServiceTest.java
@SpringBootTest
class TenantServiceTest {
    
    @Autowired
    private TenantService tenantService;
    
    @MockBean
    private TenantMapper tenantMapper;
    
    @Test
    void testCreateTenant() {
        // Given
        TenantCreateDTO dto = new TenantCreateDTO();
        dto.setName("测试租户");
        dto.setCode("test001");
        
        Tenant tenant = new Tenant();
        tenant.setId(1L);
        
        when(tenantMapper.insert(any())).thenReturn(1);
        
        // When
        Long tenantId = tenantService.create(dto);
        
        // Then
        assertNotNull(tenantId);
        verify(tenantMapper, times(1)).insert(any());
    }
    
    @Test
    void testUpdateStatus() {
        // 测试更新状态
    }
}
```

### 9.3 接口测试

```typescript
// tests/api/tenant.test.ts
import request from 'supertest';
import app from '../app';

describe('Tenant API', () => {
  let authToken: string;
  let tenantId: number;

  beforeAll(async () => {
    // 登录获取 token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });
    authToken = response.body.data.token;
  });

  test('GET /api/v1/tenants - should return tenant list', async () => {
    const response = await request(app)
      .get('/api/v1/tenants')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ page: 1, pageSize: 20 });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(Array.isArray(response.body.data.list)).toBe(true);
  });

  test('POST /api/v1/tenants - should create tenant', async () => {
    const response = await request(app)
      .post('/api/v1/tenants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '测试租户',
        code: 'test001',
        contactName: '张三',
        packageId: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    tenantId = response.body.data;
  });
});
```

---

## 十、运维监控

### 10.1 监控指标

```yaml
# 系统监控指标
系统指标:
  - CPU使用率
  - 内存使用率
  - 磁盘使用率
  - 网络IO
  - 系统负载

应用指标:
  - QPS（每秒请求数）
  - 响应时间
  - 错误率
  - 并发连接数
  - 线程池使用情况

业务指标:
  - 活跃用户数
  - 租户数量
  - API调用量
  - AI使用量
  - 存储使用量
```

### 10.2 告警规则

```yaml
# prometheus/alert-rules.yml
groups:
  - name: system
    rules:
      - alert: HighCPUUsage
        expr: (100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU使用率过高"
          description: "{{ $labels.instance }} CPU使用率超过80%"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "{{ $labels.instance }} 内存使用率超过85%"

  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API错误率过高"
          description: "错误率超过5%"

      - alert: SlowResponse
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API响应时间过长"
          description: "P95响应时间超过2秒"
```

### 10.3 日志管理

```yaml
# ELK配置
Elasticsearch:
  - 索引策略: 按天分片
  - 保留时间: 30天
  - 备份策略: 每周全量备份

Logstash:
  - 日志格式: JSON
  - 过滤规则:
    - 敏感信息脱敏
    - 日志分类标签
    - 错误堆栈提取

Kibana:
  - 仪表板:
    - 实时日志流
    - 错误日志统计
    - API调用分析
    - 用户行为分析
```

---

## 十一、FAQ

### Q1: 为什么选择Ant Design Pro而不是自己搭建？

**A**: Ant Design Pro提供了开箱即用的中后台解决方案，包含完整的权限管理、菜单配置、ProComponents高级组件等，可以大幅缩短开发时间。对于管理后台这类标准化需求，使用成熟方案比自己搭建更高效。

### Q2: BFF层是否必要？

**A**: BFF层虽然增加了架构复杂度，但带来的好处更多：
- 接口聚合，减少前端请求次数
- 数据裁剪，只返回管理端需要的数据
- 统一权限校验和缓存策略
- 技术栈隔离，后端服务可以自由选择技术

### Q3: 如何保证数据安全？

**A**: 多层防护：
- 传输层：HTTPS加密
- 认证层：JWT双Token机制
- 权限层：RBAC精细化权限控制
- 数据层：敏感数据加密存储
- 审计层：完整的操作日志记录

### Q4: 如何处理高并发？

**A**: 多级优化：
- 数据库：读写分离、索引优化
- 缓存：Redis多级缓存
- 应用：异步处理、接口限流
- 架构：微服务水平扩展
- 前端：CDN加速、懒加载

### Q5: 如何快速定位问题？

**A**: 完善的监控体系：
- 实时监控：Grafana仪表盘
- 日志分析：ELK日志系统
- 链路追踪：SkyWalking分布式追踪
- 告警通知：多渠道告警（邮件、钉钉、短信）

---

## 十二、附录

### A. 开发环境配置

```bash
# 1. 安装Node.js (v18+)
nvm install 18
nvm use 18

# 2. 安装依赖
cd mota-admin
npm install

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build

# 5. 代码检查
npm run lint

# 6. 单元测试
npm run test
```

### B. 常用命令

```bash
# 前端相关
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
npm run lint         # 代码检查
npm run test         # 运行测试

# 后端相关
mvn clean install    # 编译打包
mvn spring-boot:run  # 启动服务
mvn test             # 运行测试

# Docker相关
docker-compose up -d                  # 启动所有服务
docker-compose down                   # 停止所有服务
docker-compose logs -f service-name   # 查看日志
docker-compose restart service-name   # 重启服务
```

### C. 参考资料

- [Ant Design Pro官方文档](https://pro.ant.design/)
- [React官方文档](https://react.dev/)
- [NestJS官方文档](https://nestjs.com/)
- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Docker官方文档](https://docs.docker.com/)

---

**文档版本**: v1.0  
**创建日期**: 2026-01-30  
**维护团队**: Mota技术团队  
**联系方式**: tech@mota.com