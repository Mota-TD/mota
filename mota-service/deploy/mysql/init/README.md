# 数据库表结构说明

## mota_auth 数据库

### 1. sys_user (用户表)
继承自 `BaseEntityDO`，包含所有基础字段。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID (来自BaseEntityDO) |
| username | VARCHAR(50) | 用户名，唯一 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(20) | 手机号 |
| password_hash | VARCHAR(255) | 密码哈希 |
| nickname | VARCHAR(100) | 昵称 |
| avatar | VARCHAR(500) | 头像URL |
| status | TINYINT | 状态：0-禁用，1-启用 |
| org_id | VARCHAR(50) | 组织ID |
| org_name | VARCHAR(200) | 组织名称 |
| last_login_at | TIMESTAMP | 最后登录时间 |
| tenant_id | BIGINT | 租户ID (来自BaseEntityDO) |
| created_by | BIGINT | 创建人ID (来自BaseEntityDO) |
| updated_by | BIGINT | 更新人ID (来自BaseEntityDO) |
| dept_id | BIGINT | 部门ID (来自BaseEntityDO) |
| created_at | TIMESTAMP | 创建时间 (来自BaseEntityDO) |
| updated_at | TIMESTAMP | 更新时间 (来自BaseEntityDO) |
| deleted | TINYINT | 删除标记 (来自BaseEntityDO) |
| version | INT | 乐观锁版本号 (来自BaseEntityDO) |

### 2. enterprise (企业表)
不继承 BaseEntityDO，自定义所有字段。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| tenant_id | BIGINT | 租户ID |
| org_id | VARCHAR(50) | 组织ID，唯一 |
| name | VARCHAR(200) | 企业名称 |
| short_name | VARCHAR(100) | 企业简称 |
| industry_id | BIGINT | 所属行业ID |
| industry_name | VARCHAR(100) | 行业名称（冗余） |
| logo | VARCHAR(500) | 企业Logo |
| description | TEXT | 企业简介 |
| address | VARCHAR(500) | 企业地址 |
| contact_name | VARCHAR(100) | 联系人姓名 |
| contact_phone | VARCHAR(50) | 联系电话 |
| contact_email | VARCHAR(100) | 联系邮箱 |
| website | VARCHAR(200) | 企业网站 |
| scale | VARCHAR(50) | 企业规模 |
| admin_user_id | BIGINT | 超级管理员用户ID |
| member_count | INT | 成员数量 |
| max_members | INT | 最大成员数量 |
| status | TINYINT | 状态：0-禁用，1-正常，2-待审核 |
| verified | TINYINT | 是否已认证：0-未认证，1-已认证 |
| verified_at | TIMESTAMP | 认证时间 |
| expired_at | TIMESTAMP | 服务到期时间 |
| created_by | BIGINT | 创建人ID |
| updated_by | BIGINT | 更新人ID |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted | TINYINT | 删除标记 |
| version | INT | 乐观锁版本号 |

### 3. enterprise_member (企业成员表)
不继承 BaseEntityDO，自定义字段。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| enterprise_id | BIGINT | 企业ID |
| user_id | BIGINT | 用户ID |
| role | VARCHAR(50) | 角色：super_admin/admin/member |
| department_id | BIGINT | 所属部门ID |
| position | VARCHAR(100) | 职位 |
| employee_no | VARCHAR(50) | 工号 |
| status | TINYINT | 状态：0-禁用，1-启用 |
| joined_at | TIMESTAMP | 加入时间 |
| invited_by | BIGINT | 邀请人ID |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted | TINYINT | 删除标记 |

### 4. enterprise_invitation (企业邀请表)
不继承 BaseEntityDO，自定义字段。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| enterprise_id | BIGINT | 企业ID |
| invite_code | VARCHAR(50) | 邀请码，唯一 |
| invite_type | VARCHAR(20) | 邀请类型：link/email/phone |
| target_email | VARCHAR(100) | 目标邮箱 |
| target_phone | VARCHAR(20) | 目标手机号 |
| role | VARCHAR(50) | 邀请角色 |
| department_id | BIGINT | 邀请加入的部门ID |
| max_uses | INT | 最大使用次数，0表示无限制 |
| used_count | INT | 已使用次数 |
| expired_at | TIMESTAMP | 过期时间 |
| status | TINYINT | 状态：0-已失效，1-有效，2-已使用完 |
| invited_by | BIGINT | 邀请人ID |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 5. industry (行业表)
不继承 BaseEntityDO，全局共享数据，不需要租户隔离。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键ID |
| code | VARCHAR(50) | 行业代码，唯一 |
| name | VARCHAR(100) | 行业名称 |
| parent_id | BIGINT | 父行业ID |
| level | INT | 层级：1-一级行业，2-二级行业 |
| sort_order | INT | 排序顺序 |
| icon | VARCHAR(100) | 行业图标 |
| description | VARCHAR(500) | 行业描述 |
| status | TINYINT | 状态：0-禁用，1-启用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## BaseEntityDO 基类字段说明

所有继承 `BaseEntityDO` 的实体都包含以下字段：

- `id`: 主键ID (BIGINT, 雪花算法生成)
- `tenant_id`: 租户ID (BIGINT, 多租户隔离)
- `created_at`: 创建时间 (TIMESTAMP, 自动填充)
- `updated_at`: 更新时间 (TIMESTAMP, 自动填充)
- `created_by`: 创建人ID (BIGINT, 自动填充)
- `updated_by`: 更新人ID (BIGINT, 自动填充)
- `dept_id`: 部门ID (BIGINT, 数据权限过滤)
- `deleted`: 删除标记 (TINYINT, 逻辑删除)
- `version`: 乐观锁版本号 (INT, 并发控制)

## 初始化数据

### 行业数据
系统预置了 44 条行业数据：
- 9 个一级行业（互联网/IT、金融/银行、制造业、教育/培训、医疗/健康、零售/电商、房地产/建筑、政府/公共事业、其他）
- 35 个二级行业（各一级行业下的细分行业）

## 字符集配置
所有表使用 `utf8mb4` 字符集和 `utf8mb4_unicode_ci` 排序规则，支持完整的 Unicode 字符（包括 Emoji）。