# Mota 数据库脚本说明

## 文件结构

```
sql/
├── init-db-single.sql       # 单库设计的初始化脚本（备选方案，约249KB）
└── README.md                # 本文件

docker/
├── init-db.sql              # 微服务多库设计的初始化脚本（推荐使用）
├── reset-db.bat             # 数据库重置脚本
├── docker-compose.yml       # Docker 编排文件
├── start.bat                # 启动脚本
└── stop.bat                 # 停止脚本
```

## 数据库架构说明

### 推荐方案：微服务多库设计 (docker/init-db.sql)

项目采用微服务架构，每个服务使用独立的数据库：

| 数据库 | 服务账户 | 微服务 | 主要功能 |
|--------|----------|--------|----------|
| `mota_auth` | mota_auth | mota-auth-service | 用户、企业、部门、SSO、权限、审计 |
| `mota_project` | mota_project | mota-project-service | 项目、任务、里程碑、文档、工作流 |
| `mota_ai` | mota_ai | mota-ai-service | AI对话、方案生成、智能搜索、新闻 |
| `mota_knowledge` | mota_knowledge | mota-knowledge-service | 文件管理、分类、标签、模板 |
| `mota_notify` | mota_notify | mota-notify-service | 通知、订阅、邮件队列、推送 |
| `mota_calendar` | mota_calendar | mota-calendar-service | 日历事件、参与者、提醒、订阅 |

所有服务账户密码统一为：`mota123`

### 备选方案：单库设计 (sql/init-db-single.sql)

所有表放在单个 `mota_project` 数据库中，适用于：
- 开发环境快速测试
- 不需要微服务隔离的场景
- 数据迁移和备份

## init-db-single.sql 模块说明

单库初始化脚本包含以下模块（按版本号组织）：

| 版本 | 模块名称 | 主要表 | 行数范围 |
|------|----------|--------|----------|
| V1.0 | 基础表结构 | sys_user, project, project_member, notification, activity, ai_history, ai_news, calendar_config, calendar_subscription, document_favorite, sprint, issue, wiki_document, project_attachment | 1-367 |
| V2.0 | 项目协同模块 | department, department_task, work_plan, work_plan_attachment, task, deliverable, milestone, task_comment, comment_attachment, work_feedback, progress_report, department_task_attachment, project_department | 368-702 |
| V3.0 | 任务依赖和子任务 | task_dependency, subtask, checklist, checklist_item, calendar_event, calendar_event_attendee, task_time_log, task_template | 703-935 |
| V4.0 | 文档协作 | document, document_folder, document_version, document_collaborator, document_comment, document_activity, document_template_category, knowledge_node, knowledge_edge | 936-1194 |
| V5.0 | 工作流和视图配置 | workflow_template, workflow_status, workflow_transition, user_view_config | 1195-1390 |
| V8.0 | 知识使用统计 | knowledge_reuse_log, knowledge_reuse_stats, knowledge_gap, knowledge_stats_overview, document_ranking, document_stats_daily, document_access_log | 1391-1665 |
| V9.0 | AI知识库 | ai_knowledge_document, ai_document_vector, ai_document_summary, ai_key_info_extraction, ai_table_extraction, ai_ocr_record, ai_speech_to_text, ai_tag, ai_topic_category, ai_semantic_search_log | 1666-2075 |
| V10.0 | 智能新闻推送 | news_article, news_category, news_data_source, news_user_preference, news_reading_record, news_favorite, news_favorite_folder, news_push_config, news_push_record, enterprise_industry, business_domain, policy_monitor, news_match_record | 2076-2429 |
| V11.0 | AI方案生成 | proposal_content, proposal_section, proposal_message, proposal_reference, knowledge_retrieval, chart_suggestion, export_template, proposal_export | 2430-2697 |
| V12.0 | 智能搜索 | search_log, search_keyword_stats | 2698-2937 |
| V13.0 | AI助手 | ai_chat_session, ai_chat_message, ai_task_command, ai_data_analysis, ai_assistant_config | 2938-3237 |
| V14.0 | 多模型支持 | ai_model_config, ai_model_call_log, ai_model_performance | 3238-3415 |
| V15.0 | 系统管理增强 | sys_operation_log, sys_config, sys_data_backup, sys_announcement | 3416-4033 |
| V16.0 | 通知中心增强 | notification_preferences, notification_dnd_settings, notification_subscription | 4034-4206 |
| V17.0 | 企业注册模块 | enterprise, enterprise_admin, enterprise_audit_log | 4207-4373 |
| V21.0 | 里程碑负责人和任务同步 | milestone_assignee, milestone_task, milestone_task_attachment, milestone_task_progress_record, milestone_comment | 4394+ |

## 使用方法

### 方法一：使用 Docker 脚本初始化（推荐）

使用 Docker 脚本一键初始化微服务多库架构：

```bash
cd docker
./reset-db.bat
```

### 方法二：手动执行微服务多库脚本

```bash
docker exec -i mota-mysql mysql -uroot -proot123 < docker/init-db.sql
```

### 方法三：手动执行单库脚本（备选）

```bash
docker exec -i mota-mysql mysql -uroot -proot123 mota_project < sql/init-db-single.sql
```

## 注意事项

1. **编码**: 所有 SQL 文件使用 UTF-8 编码
2. **引擎**: 所有表使用 InnoDB 引擎
3. **字符集**: 使用 utf8mb4 字符集，支持 emoji 和特殊字符
4. **软删除**: 大部分表使用 `deleted` 字段实现软删除
5. **乐观锁**: 使用 `version` 字段实现乐观锁
6. **时间戳**: 使用 `created_at` 和 `updated_at` 记录创建和更新时间

## 微服务配置对照

各微服务的数据库配置位置：

| 微服务 | 配置文件 | 数据库 |
|--------|----------|--------|
| mota-auth-service | `src/main/resources/application.yml` | mota_auth |
| mota-project-service | `src/main/resources/application.yml` | mota_project |
| mota-ai-service | `src/main/resources/application.yml` | mota_ai |
| mota-knowledge-service | `src/main/resources/application.yml` | mota_knowledge |
| mota-notify-service | `src/main/resources/application.yml` | mota_notify |
| mota-calendar-service | `src/main/resources/application.yml` | mota_calendar |

## 实体类映射

SQL 表与 Java 实体类的对应关系：

- `entity/` - 主目录（约 55 个实体）
- `entity/ai/` - AI 知识库相关（10 个实体）
- `entity/assistant/` - AI 助手相关（9 个实体）
- `entity/knowledge/` - 知识管理相关（4 个实体）
- `entity/news/` - 新闻相关（13 个实体）
- `entity/proposal/` - 方案生成相关（13 个实体）
- `entity/search/` - 搜索相关（11 个实体）