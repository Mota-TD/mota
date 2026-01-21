# 项目服务与任务服务拆分方案

> 版本：1.0  
> 日期：2026-01-21  
> 文档类型：架构设计方案

---

## 1. 背景与目标

### 1.1 当前问题

当前 `mota-project-service` 承担了过多职责，包含：
- **项目管理**：项目 CRUD、项目成员、项目配置
- **任务管理**：任务 CRUD、子任务、任务评论、任务依赖
- **里程碑管理**：里程碑 CRUD、里程碑任务、里程碑负责人
- **部门任务**：部门管理、部门任务
- **进度追踪**：进度报告、进度追踪
- **工作流**：工作流模板、工作流状态
- 以及其他 AI、知识库、日历、通知等功能

这种"巨石服务"模式导致：
1. **代码耦合度高**：项目和任务逻辑混杂
2. **扩展性差**：无法针对任务管理进行独立扩展
3. **部署效率低**：任务相关改动需要重新部署整个服务
4. **团队协作困难**：多人同时开发容易产生冲突

### 1.2 拆分目标

将 `mota-project-service` 拆分为：
- **mota-project-service**：专注于项目管理、里程碑管理
- **mota-task-service**：专注于任务管理、子任务、任务依赖

---

## 2. 服务边界设计

### 2.1 拆分后的服务架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              mota-gateway (8080)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  mota-project-service│   │  mota-task-service  │   │   其他服务...       │
│       (8082)        │   │       (8087)        │   │                     │
│ ─────────────────── │   │ ─────────────────── │   │                     │
│ • 项目管理          │   │ • 任务管理          │   │                     │
│ • 项目成员          │   │ • 里程碑任务        │   │                     │
│ • 里程碑管理        │   │ • 子任务管理        │   │                     │
│ • 里程碑负责人      │   │ • 任务评论          │   │                     │
│ • 部门管理          │   │ • 任务依赖          │   │                     │
│ • 部门任务          │   │ • 任务模板          │   │                     │
│ • 进度报告          │   │ • 检查清单          │   │                     │
│ • 活动动态          │   │ • 工作计划          │   │                     │
│ • 项目统计          │   │ • 工作流管理        │   │                     │
│                     │   │ • 任务统计          │   │                     │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
          │                           │
          └───────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Feign 调用   │
              │ 项目 ←→ 任务   │
              └───────────────┘
```

### 2.2 职责划分详情

#### mota-project-service（项目服务）

| 模块 | 控制器 | 职责 |
|------|--------|------|
| 项目管理 | ProjectController | 项目 CRUD、收藏、归档、状态管理 |
| 项目成员 | ProjectController | 成员添加、移除、角色管理 |
| 里程碑 | MilestoneController | 里程碑 CRUD、状态管理、排序 |
| 里程碑负责人 | MilestoneController | 负责人分配、移除 |
| 部门管理 | DepartmentController | 部门 CRUD |
| 部门任务 | DepartmentTaskController | 部门任务 CRUD |
| 进度报告 | ProgressReportController | 进度报告生成、查询 |
| 进度追踪 | ProgressTrackingController | 进度追踪、统计 |
| 活动动态 | ActivityController | 活动记录查询 |
| 资源管理 | ResourceManagementController | 资源分配、统计 |
| 报表分析 | ReportAnalyticsController | 项目报表、分析 |

#### mota-task-service（任务服务）- 新建

| 模块 | 控制器 | 职责 |
|------|--------|------|
| 任务管理 | TaskController | 任务 CRUD、状态管理、分配 |
| 里程碑任务 | MilestoneTaskController | 里程碑任务 CRUD、进度更新、附件管理 |
| 子任务 | SubtaskController | 子任务 CRUD、多级子任务 |
| 任务评论 | TaskCommentController | 评论 CRUD |
| 任务依赖 | TaskDependencyController | 依赖关系管理 |
| 任务模板 | TaskTemplateController | 模板 CRUD |
| 检查清单 | ChecklistController | 清单 CRUD |
| 工作计划 | WorkPlanController | 工作计划 CRUD |
| 工作流 | WorkflowController | 工作流模板、状态流转 |
| 工作反馈 | WorkFeedbackController | 反馈 CRUD |

---

## 3. API 路由设计

### 3.1 项目服务 API

```yaml
# mota-project-service API 路由
/api/v1/projects/**           # 项目管理
/api/v1/milestones            # 里程碑基础管理（CRUD、状态、负责人）
/api/v1/milestones/*/assignees/**  # 里程碑负责人
/api/v1/milestones/*/comments/**   # 里程碑评论
/api/v1/departments/**        # 部门管理
/api/v1/department-tasks/**   # 部门任务
/api/v1/progress-reports/**   # 进度报告
/api/v1/progress-tracking/**  # 进度追踪
/api/v1/activities/**         # 活动动态
/api/v1/resources/**          # 资源管理
/api/v1/reports/**            # 报表分析
```

### 3.2 任务服务 API

```yaml
# mota-task-service API 路由
/api/v1/tasks/**              # 任务管理
/api/v1/milestones/*/tasks/** # 里程碑任务管理
/api/v1/milestone-tasks/**    # 里程碑任务独立路由
/api/v1/subtasks/**           # 子任务管理
/api/v1/task-comments/**      # 任务评论
/api/v1/task-dependencies/**  # 任务依赖
/api/v1/task-templates/**     # 任务模板
/api/v1/checklists/**         # 检查清单
/api/v1/work-plans/**         # 工作计划
/api/v1/workflows/**          # 工作流管理
/api/v1/work-feedbacks/**     # 工作反馈
```

### 3.3 网关路由配置

```yaml
spring:
  cloud:
    gateway:
      routes:
        # 里程碑任务路由（优先级高，放在前面）
        - id: milestone-task-service
          uri: lb://mota-task-service
          predicates:
            - Path=/api/v1/milestones/*/tasks/**,/api/v1/milestone-tasks/**
        
        # 项目服务路由
        - id: project-service
          uri: lb://mota-project-service
          predicates:
            - Path=/api/v1/projects/**,/api/v1/milestones/**,/api/v1/departments/**,/api/v1/department-tasks/**,/api/v1/progress-reports/**,/api/v1/progress-tracking/**,/api/v1/activities/**,/api/v1/resources/**,/api/v1/reports/**
        
        # 任务服务路由
        - id: task-service
          uri: lb://mota-task-service
          predicates:
            - Path=/api/v1/tasks/**,/api/v1/subtasks/**,/api/v1/task-comments/**,/api/v1/task-dependencies/**,/api/v1/task-templates/**,/api/v1/checklists/**,/api/v1/work-plans/**,/api/v1/workflows/**,/api/v1/work-feedbacks/**
```

---

## 4. 数据库设计

### 4.1 数据库拆分方案

#### 方案 A：独立数据库（推荐）

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据库拆分方案                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  mota_project 数据库                mota_task 数据库            │
│  ┌─────────────────────┐           ┌─────────────────────┐     │
│  │ • project           │           │ • task              │     │
│  │ • project_member    │           │ • milestone_task    │     │
│  │ • project_role      │           │ • milestone_task_   │     │
│  │ • project_config    │           │   attachment        │     │
│  │ • project_access_log│           │ • milestone_task_   │     │
│  │ • project_favorite  │           │   progress_record   │     │
│  │ • milestone         │           │ • subtask           │     │
│  │ • milestone_assignee│           │ • task_comment      │     │
│  │ • milestone_comment │           │ • task_dependency   │     │
│  │ • department        │           │ • task_template     │     │
│  │ • department_task   │           │ • checklist         │     │
│  │ • activity          │           │ • checklist_item    │     │
│  │ • progress_report   │           │ • work_plan         │     │
│  │ • deliverable       │           │ • work_plan_attachment│   │
│  │                     │           │ • workflow_template │     │
│  │                     │           │ • workflow_status   │     │
│  │                     │           │ • workflow_transition│    │
│  │                     │           │ • work_feedback     │     │
│  └─────────────────────┘           └─────────────────────┘     │
│                                                                 │
│  共享数据（通过视图或 Feign 调用）                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • sys_user (视图 → mota_auth.sys_user)                  │   │
│  │ • user (本地缓存表)                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 方案 B：共享数据库，独立 Schema

如果不想完全分离数据库，可以使用同一数据库的不同 Schema：

```sql
-- mota_project schema
USE mota_project;
-- 项目相关表...

-- mota_task schema  
USE mota_task;
-- 任务相关表...
```

### 4.2 数据关联处理

#### 4.2.1 任务与项目的关联

任务表中保留 `project_id` 字段，但通过 Feign 调用获取项目详情：

```java
// TaskService.java
@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final ProjectServiceClient projectServiceClient;
    
    public TaskDetailVO getTaskDetail(Long taskId) {
        Task task = taskMapper.selectById(taskId);
        
        // 通过 Feign 获取项目信息
        if (task.getProjectId() != null) {
            Result<ProjectDTO> projectResult = projectServiceClient.getProjectById(task.getProjectId());
            if (projectResult.isSuccess()) {
                task.setProjectName(projectResult.getData().getName());
            }
        }
        
        return task;
    }
}
```

#### 4.2.2 里程碑任务的处理

里程碑任务（`milestone_task`）迁移到任务服务中，通过 `milestone_id` 关联里程碑。

任务服务需要通过 Feign 调用项目服务来：
1. 获取里程碑信息
2. 更新里程碑进度
3. 验证里程碑是否存在

```java
// MilestoneTaskService.java
@Service
@RequiredArgsConstructor
public class MilestoneTaskService {
    
    private final ProjectServiceClient projectServiceClient;
    
    public MilestoneTask createTask(MilestoneTask task) {
        // 验证里程碑是否存在
        Result<MilestoneDTO> milestoneResult = projectServiceClient.getMilestoneById(task.getMilestoneId());
        if (!milestoneResult.isSuccess()) {
            throw new BusinessException("里程碑不存在");
        }
        
        // 创建任务
        milestoneTaskMapper.insert(task);
        
        // 更新里程碑任务数
        projectServiceClient.incrementMilestoneTaskCount(task.getMilestoneId());
        
        return task;
    }
    
    public void completeTask(Long taskId) {
        MilestoneTask task = milestoneTaskMapper.selectById(taskId);
        task.setStatus("completed");
        task.setProgress(100);
        task.setCompletedAt(LocalDateTime.now());
        milestoneTaskMapper.updateById(task);
        
        // 更新里程碑进度
        updateMilestoneProgress(task.getMilestoneId());
    }
    
    private void updateMilestoneProgress(Long milestoneId) {
        // 计算里程碑下所有任务的完成进度
        List<MilestoneTask> tasks = milestoneTaskMapper.selectByMilestoneId(milestoneId);
        int completedCount = (int) tasks.stream()
            .filter(t -> "completed".equals(t.getStatus()))
            .count();
        int progress = tasks.isEmpty() ? 0 : (completedCount * 100 / tasks.size());
        
        // 通过 Feign 更新里程碑进度
        projectServiceClient.updateMilestoneProgress(milestoneId, progress);
    }
}
```

### 4.3 数据库初始化脚本

#### mota_task 数据库初始化脚本

```sql
-- 09-init-task-tables.sql
-- =====================================================
-- 任务服务数据库表初始化脚本
-- =====================================================
USE mota_task;

-- 里程碑任务表
CREATE TABLE IF NOT EXISTS milestone_task (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    milestone_id BIGINT NOT NULL COMMENT '里程碑ID',
    parent_task_id BIGINT COMMENT '父任务ID（支持子任务）',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    due_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度',
    sort_order INT DEFAULT 0 COMMENT '排序',
    completed_at DATETIME COMMENT '完成时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_parent_task_id (parent_task_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务表';

-- 里程碑任务附件表
CREATE TABLE IF NOT EXISTS milestone_task_attachment (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT COMMENT '文件大小',
    file_type VARCHAR(50) COMMENT '文件类型',
    attachment_type VARCHAR(50) DEFAULT 'attachment' COMMENT '附件类型：attachment/execution_plan',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务附件表';

-- 里程碑任务进度记录表
CREATE TABLE IF NOT EXISTS milestone_task_progress_record (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    previous_progress INT COMMENT '之前进度',
    current_progress INT NOT NULL COMMENT '当前进度',
    description TEXT COMMENT '进度描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='里程碑任务进度记录表';

-- 任务表
CREATE TABLE IF NOT EXISTS task (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    department_task_id BIGINT COMMENT '部门任务ID',
    project_id BIGINT COMMENT '项目ID',
    milestone_id BIGINT COMMENT '里程碑ID',
    name VARCHAR(200) NOT NULL COMMENT '任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止日期',
    progress INT DEFAULT 0 COMMENT '进度',
    progress_note VARCHAR(500) COMMENT '进度说明',
    sort_order INT DEFAULT 0 COMMENT '排序',
    completed_at DATETIME COMMENT '完成时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_project_id (project_id),
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_assignee_id (assignee_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- 子任务表
CREATE TABLE IF NOT EXISTS subtask (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '父任务ID',
    parent_subtask_id BIGINT COMMENT '父子任务ID（支持多级）',
    name VARCHAR(200) NOT NULL COMMENT '子任务名称',
    description TEXT COMMENT '描述',
    assignee_id BIGINT COMMENT '执行人ID',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
    priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级',
    progress INT DEFAULT 0 COMMENT '进度',
    sort_order INT DEFAULT 0 COMMENT '排序',
    completed_at DATETIME COMMENT '完成时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id),
    INDEX idx_parent_subtask_id (parent_subtask_id),
    INDEX idx_assignee_id (assignee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表';

-- 任务评论表
CREATE TABLE IF NOT EXISTS task_comment (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id BIGINT COMMENT '父评论ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    dept_id BIGINT COMMENT '部门ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    version INT DEFAULT 0 COMMENT '版本号',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论表';

-- 任务依赖表
CREATE TABLE IF NOT EXISTS task_dependency (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    depends_on_task_id BIGINT NOT NULL COMMENT '依赖的任务ID',
    dependency_type VARCHAR(20) DEFAULT 'finish_to_start' COMMENT '依赖类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id),
    INDEX idx_depends_on_task_id (depends_on_task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务依赖表';

-- 任务模板表
CREATE TABLE IF NOT EXISTS task_template (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    name VARCHAR(200) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '描述',
    template_data JSON COMMENT '模板数据',
    category VARCHAR(50) COMMENT '分类',
    is_public TINYINT(1) DEFAULT 0 COMMENT '是否公开',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表';

-- 检查清单表
CREATE TABLE IF NOT EXISTS checklist (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    name VARCHAR(200) NOT NULL COMMENT '清单名称',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单表';

-- 检查清单项表
CREATE TABLE IF NOT EXISTS checklist_item (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    checklist_id BIGINT NOT NULL COMMENT '清单ID',
    content VARCHAR(500) NOT NULL COMMENT '内容',
    is_completed TINYINT(1) DEFAULT 0 COMMENT '是否完成',
    sort_order INT DEFAULT 0 COMMENT '排序',
    completed_at DATETIME COMMENT '完成时间',
    completed_by BIGINT COMMENT '完成人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_checklist_id (checklist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检查清单项表';

-- 工作流模板表
CREATE TABLE IF NOT EXISTS workflow_template (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    name VARCHAR(200) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '描述',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流模板表';

-- 工作流状态表
CREATE TABLE IF NOT EXISTS workflow_status (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    workflow_template_id BIGINT NOT NULL COMMENT '工作流模板ID',
    name VARCHAR(100) NOT NULL COMMENT '状态名称',
    code VARCHAR(50) NOT NULL COMMENT '状态编码',
    color VARCHAR(20) COMMENT '颜色',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_initial TINYINT(1) DEFAULT 0 COMMENT '是否初始状态',
    is_final TINYINT(1) DEFAULT 0 COMMENT '是否终态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_workflow_template_id (workflow_template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流状态表';

-- 工作流状态转换表
CREATE TABLE IF NOT EXISTS workflow_transition (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    workflow_template_id BIGINT NOT NULL COMMENT '工作流模板ID',
    from_status_id BIGINT NOT NULL COMMENT '源状态ID',
    to_status_id BIGINT NOT NULL COMMENT '目标状态ID',
    name VARCHAR(100) COMMENT '转换名称',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_workflow_template_id (workflow_template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流状态转换表';

-- 工作计划表
CREATE TABLE IF NOT EXISTS work_plan (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT COMMENT '关联任务ID',
    title VARCHAR(200) NOT NULL COMMENT '计划标题',
    content TEXT COMMENT '计划内容',
    plan_date DATE COMMENT '计划日期',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id),
    INDEX idx_plan_date (plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作计划表';

-- 工作反馈表
CREATE TABLE IF NOT EXISTS work_feedback (
    id BIGINT PRIMARY KEY COMMENT '主键ID',
    tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
    task_id BIGINT COMMENT '关联任务ID',
    content TEXT NOT NULL COMMENT '反馈内容',
    feedback_type VARCHAR(50) COMMENT '反馈类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    deleted INT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作反馈表';

-- 创建 sys_user 视图
CREATE OR REPLACE VIEW sys_user AS SELECT * FROM mota_auth.sys_user;

SELECT '任务服务数据库表初始化完成!' AS message;
```

---

## 5. 服务间通信设计

### 5.1 Feign 客户端定义

#### ProjectServiceClient（任务服务调用项目服务）

```java
// mota-common-feign/src/main/java/com/mota/common/feign/client/ProjectServiceClient.java
@FeignClient(
    name = "mota-project-service",
    path = "/api/v1",
    fallbackFactory = ProjectServiceFallbackFactory.class
)
public interface ProjectServiceClient {
    
    @GetMapping("/projects/{id}")
    Result<ProjectDTO> getProjectById(@PathVariable("id") Long id);
    
    @GetMapping("/projects/{id}/members")
    Result<List<ProjectMemberDTO>> getProjectMembers(@PathVariable("id") Long projectId);
    
    @GetMapping("/milestones/{id}")
    Result<MilestoneDTO> getMilestoneById(@PathVariable("id") Long id);
    
    @PutMapping("/milestones/{id}/progress")
    Result<Void> updateMilestoneProgress(
        @PathVariable("id") Long id, 
        @RequestParam("progress") Integer progress
    );
}
```

#### TaskServiceClient（项目服务调用任务服务）

```java
// mota-common-feign/src/main/java/com/mota/common/feign/client/TaskServiceClient.java
@FeignClient(
    name = "mota-task-service",
    path = "/api/v1",
    fallbackFactory = TaskServiceFallbackFactory.class
)
public interface TaskServiceClient {
    
    @GetMapping("/tasks/project/{projectId}")
    Result<List<TaskDTO>> getTasksByProjectId(@PathVariable("projectId") Long projectId);
    
    @GetMapping("/tasks/project/{projectId}/statistics")
    Result<TaskStatisticsDTO> getTaskStatisticsByProjectId(@PathVariable("projectId") Long projectId);
    
    @GetMapping("/tasks/milestone/{milestoneId}")
    Result<List<TaskDTO>> getTasksByMilestoneId(@PathVariable("milestoneId") Long milestoneId);
    
    @PostMapping("/tasks")
    Result<TaskDTO> createTask(@RequestBody CreateTaskRequest request);
    
    @DeleteMapping("/tasks/project/{projectId}")
    Result<Void> deleteTasksByProjectId(@PathVariable("projectId") Long projectId);
}
```

### 5.2 降级处理

```java
// ProjectServiceFallbackFactory.java
@Component
public class ProjectServiceFallbackFactory implements FallbackFactory<ProjectServiceClient> {
    
    @Override
    public ProjectServiceClient create(Throwable cause) {
        return new ProjectServiceClient() {
            @Override
            public Result<ProjectDTO> getProjectById(Long id) {
                log.warn("获取项目信息失败，项目ID: {}, 原因: {}", id, cause.getMessage());
                return Result.fail("项目服务暂时不可用");
            }
            
            // 其他方法的降级实现...
        };
    }
}
```

### 5.3 数据同步策略

#### 5.3.1 项目删除时的任务处理

```java
// ProjectService.java
@Transactional
public void deleteProject(Long projectId) {
    // 1. 删除项目
    projectMapper.deleteById(projectId);
    
    // 2. 通过 Feign 删除关联任务
    try {
        taskServiceClient.deleteTasksByProjectId(projectId);
    } catch (Exception e) {
        log.error("删除项目关联任务失败，项目ID: {}", projectId, e);
        // 可以选择：
        // - 抛出异常回滚事务
        // - 发送消息到消息队列，异步重试
    }
    
    // 3. 发送项目删除事件（可选，用于其他服务同步）
    eventPublisher.publish(new ProjectDeletedEvent(projectId));
}
```

#### 5.3.2 任务完成时更新里程碑进度

```java
// TaskService.java
@Transactional
public void completeTask(Long taskId) {
    Task task = taskMapper.selectById(taskId);
    task.setStatus("completed");
    task.setCompletedAt(LocalDateTime.now());
    taskMapper.updateById(task);
    
    // 更新里程碑进度
    if (task.getMilestoneId() != null) {
        updateMilestoneProgress(task.getMilestoneId());
    }
}

private void updateMilestoneProgress(Long milestoneId) {
    // 计算里程碑下所有任务的完成进度
    List<Task> tasks = taskMapper.selectByMilestoneId(milestoneId);
    int completedCount = (int) tasks.stream()
        .filter(t -> "completed".equals(t.getStatus()))
        .count();
    int progress = tasks.isEmpty() ? 0 : (completedCount * 100 / tasks.size());
    
    // 通过 Feign 更新里程碑进度
    try {
        projectServiceClient.updateMilestoneProgress(milestoneId, progress);
    } catch (Exception e) {
        log.error("更新里程碑进度失败，里程碑ID: {}", milestoneId, e);
        // 发送消息到消息队列，异步重试
    }
}
```

---

## 6. 实施计划

### 6.1 阶段一：准备工作

| 任务 | 说明 |
|------|------|
| 创建 mota-task-service 模块 | 新建 Spring Boot 项目 |
| 配置 pom.xml | 添加依赖 |
| 配置 application.yml | 数据库、Nacos、Redis 配置 |
| 创建数据库初始化脚本 | 09-init-task-tables.sql |
| 更新 docker-compose.yml | 添加任务服务配置 |

### 6.2 阶段二：代码迁移

| 任务 | 说明 |
|------|------|
| 迁移 Entity | Task, Subtask, TaskComment, TaskDependency 等 |
| 迁移 Mapper | TaskMapper, SubtaskMapper 等 |
| 迁移 Service | TaskService, SubtaskService 等 |
| 迁移 Controller | TaskController, SubtaskController 等 |
| 更新 Feign 客户端 | 添加 ProjectServiceClient, TaskServiceClient |

### 6.3 阶段三：集成测试

| 任务 | 说明 |
|------|------|
| 单元测试 | 测试各个 Service 方法 |
| 集成测试 | 测试服务间调用 |
| 性能测试 | 测试高并发场景 |
| 回归测试 | 确保原有功能正常 |

### 6.4 阶段四：部署上线

| 任务 | 说明 |
|------|------|
| 更新网关路由 | 添加任务服务路由 |
| 数据迁移 | 将任务数据迁移到新数据库 |
| 灰度发布 | 逐步切换流量 |
| 监控告警 | 配置监控和告警 |

---

## 7. 风险与应对

### 7.1 数据一致性风险

**风险**：跨服务操作可能导致数据不一致

**应对**：
1. 使用分布式事务（Seata）或 Saga 模式
2. 关键操作使用消息队列保证最终一致性
3. 定期数据校验和修复

### 7.2 服务调用失败风险

**风险**：Feign 调用失败导致业务中断

**应对**：
1. 实现完善的降级处理
2. 配置熔断器（Sentinel/Resilience4j）
3. 关键数据本地缓存

### 7.3 性能风险

**风险**：服务间调用增加延迟

**应对**：
1. 合理设计 API，减少调用次数
2. 使用批量接口
3. 本地缓存热点数据
4. 异步处理非关键操作

---

## 8. 总结

通过将项目服务和任务服务拆分，我们可以实现：

1. **职责清晰**：项目服务专注项目管理，任务服务专注任务管理
2. **独立扩展**：可以根据任务量独立扩展任务服务
3. **独立部署**：任务相关改动不影响项目服务
4. **团队协作**：不同团队可以并行开发
5. **故障隔离**：任务服务故障不会影响项目基本功能

---

*文档结束*