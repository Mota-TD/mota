# Mota 数据库初始化脚本

本目录包含 Mota 微服务平台的数据库初始化脚本。这些脚本会在 MySQL Docker 容器首次启动时自动执行。

## 脚本执行顺序

脚本按文件名的字母顺序执行：

| 序号 | 文件名 | 用途 | 数据库 |
|------|--------|------|--------|
| 01 | `01-create-databases.sql` | 创建所有数据库和用户 | 所有 |
| 02 | `02-init-industry-data.sql` | 初始化行业数据 | mota_user |
| 03 | `03-init-auth-tables.sql` | 认证服务表结构 | mota_auth |
| 04 | `04-init-ai-tables.sql` | AI服务表结构 | mota_ai |
| 05 | `05-init-project-tables.sql` | 项目服务表结构 | mota_project |
| 06 | `06-init-knowledge-tables.sql` | 知识库服务表结构 | mota_knowledge |
| 07 | `07-init-notify-tables.sql` | 通知服务表结构 | mota_notify |
| 08 | `08-init-calendar-tables.sql` | 日历服务表结构 | mota_calendar |

## 数据库列表

| 数据库名 | 用途 | 服务 |
|----------|------|------|
| `nacos_config` | Nacos 配置中心 | 基础设施 |
| `mota_auth` | 认证服务 | mota-auth-service |
| `mota_user` | 用户服务 | mota-user-service |
| `mota_tenant` | 租户服务 | mota-tenant-service |
| `mota_project` | 项目服务 | mota-project-service |
| `mota_task` | 任务服务 | mota-task-service |
| `mota_collab` | 协作服务 | mota-collab-service |
| `mota_knowledge` | 知识库服务 | mota-knowledge-service |
| `mota_ai` | AI服务 | mota-ai-service |
| `mota_notify` | 通知服务 | mota-notify-service |
| `mota_calendar` | 日历服务 | mota-calendar-service |
| `mota_report` | 报表服务 | mota-report-service |
| `mota_search` | 搜索服务 | mota-search-service |

## 多租户支持

所有业务表都包含 `tenant_id` 列，用于支持多租户数据隔离。MyBatis-Plus 的 TenantLineHandler 会自动在 SQL 查询中添加租户条件。

### 基础字段规范

所有业务表应包含以下基础字段：

```sql
tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户ID',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by BIGINT COMMENT '创建人ID',
updated_by BIGINT COMMENT '更新人ID',
dept_id BIGINT COMMENT '部门ID',
deleted INT DEFAULT 0 COMMENT '删除标记',
version INT DEFAULT 0 COMMENT '版本号',
```

## 使用方式

### Docker Compose 部署

脚本会在 MySQL 容器首次启动时自动执行。确保 `docker-compose.yml` 中正确挂载了初始化脚本目录：

```yaml
mysql:
  image: mysql:8.0
  volumes:
    - ./mysql/init:/docker-entrypoint-initdb.d
```

### 手动执行

如果需要手动执行脚本，可以使用以下命令：

```bash
# 执行单个脚本
docker exec -i mota-mysql mysql -uroot -proot123 < 01-create-databases.sql

# 执行所有脚本
for f in *.sql; do docker exec -i mota-mysql mysql -uroot -proot123 < "$f"; done
```

## 与 docker/init-db.sql 的关系

项目中存在两个数据库初始化位置：

| 位置 | 用途 | 执行方式 |
|------|------|----------|
| `deploy/mysql/init/` | Docker Compose 部署 | 容器首次启动自动执行 |
| `docker/init-db.sql` | 本地开发环境 | 通过 `reset-db.bat` 手动执行 |

**建议**：优先使用 `deploy/mysql/init/` 目录下的脚本，因为这些脚本已经支持多租户。

## 注意事项

1. **脚本只在首次启动时执行**：如果数据库已存在，脚本不会重新执行
2. **修改脚本后需要重建容器**：删除数据卷后重新启动容器
3. **保持脚本幂等性**：使用 `CREATE TABLE IF NOT EXISTS` 和 `INSERT ... ON DUPLICATE KEY UPDATE`
4. **字符集**：所有表使用 `utf8mb4` 字符集和 `utf8mb4_unicode_ci` 排序规则

## 更新日志

- **2026-01-21**: 添加多租户支持，创建 06-08 初始化脚本
- **2025-01-07**: 初始版本