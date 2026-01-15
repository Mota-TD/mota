-- 初始化数据 (H2 兼容版本)

-- 初始化超级管理员角色
MERGE INTO sys_role (id, tenant_id, name, code, sort, data_scope, status, is_system, remark) KEY(id) VALUES
(1, 0, '超级管理员', 'super_admin', 1, 1, 1, 1, '系统内置超级管理员角色'),
(2, 0, '管理员', 'admin', 2, 1, 1, 1, '系统内置管理员角色'),
(3, 0, '普通用户', 'user', 3, 5, 1, 1, '系统内置普通用户角色');

-- 初始化部门
MERGE INTO sys_dept (id, tenant_id, name, code, parent_id, ancestors, level, sort, status) KEY(id) VALUES
(1, 0, '摩塔科技', 'mota', 0, '0', 1, 1, 1),
(2, 0, '研发部', 'dev', 1, '0,1', 2, 1, 1),
(3, 0, '产品部', 'product', 1, '0,1', 2, 2, 1);

-- 初始化系统菜单
MERGE INTO sys_permission (id, tenant_id, name, code, parent_id, type, path, component, perms, icon, sort, visible, status) KEY(id) VALUES
-- 系统管理
(100, 0, '系统管理', 'system', 0, 1, '/system', NULL, NULL, 'setting', 1, 1, 1),
(101, 0, '用户管理', 'system:user', 100, 2, '/system/user', 'system/user/index', 'system:user:list', 'user', 1, 1, 1),
(102, 0, '角色管理', 'system:role', 100, 2, '/system/role', 'system/role/index', 'system:role:list', 'peoples', 2, 1, 1),
(103, 0, '菜单管理', 'system:menu', 100, 2, '/system/menu', 'system/menu/index', 'system:menu:list', 'tree-table', 3, 1, 1),
(104, 0, '部门管理', 'system:dept', 100, 2, '/system/dept', 'system/dept/index', 'system:dept:list', 'tree', 4, 1, 1),
(105, 0, '岗位管理', 'system:post', 100, 2, '/system/post', 'system/post/index', 'system:post:list', 'post', 5, 1, 1),
-- 用户管理按钮
(1011, 0, '用户查询', NULL, 101, 3, NULL, NULL, 'system:user:query', NULL, 1, 1, 1),
(1012, 0, '用户新增', NULL, 101, 3, NULL, NULL, 'system:user:create', NULL, 2, 1, 1),
(1013, 0, '用户修改', NULL, 101, 3, NULL, NULL, 'system:user:update', NULL, 3, 1, 1),
(1014, 0, '用户删除', NULL, 101, 3, NULL, NULL, 'system:user:delete', NULL, 4, 1, 1),
(1015, 0, '重置密码', NULL, 101, 3, NULL, NULL, 'system:user:resetPwd', NULL, 5, 1, 1),
(1016, 0, '分配角色', NULL, 101, 3, NULL, NULL, 'system:user:assignRole', NULL, 6, 1, 1);

-- 初始化管理员用户 (密码: admin123, BCrypt加密)
-- $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi 是 admin123 的 BCrypt 哈希
MERGE INTO sys_user (id, tenant_id, username, email, phone, password_hash, nickname, real_name, status, dept_id, user_type) KEY(id) VALUES
(1, 0, 'admin', 'admin@mota.com', '13800138000', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', '系统管理员', 1, 1, 3),
(2, 0, 'test', 'test@mota.com', '13800138001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '测试用户', '测试', 1, 2, 1);

-- 为管理员分配超级管理员角色
MERGE INTO sys_user_role (user_id, role_id) KEY(user_id, role_id) VALUES
(1, 1),
(2, 3);

-- 为超级管理员分配所有权限
MERGE INTO sys_role_permission (role_id, permission_id) KEY(role_id, permission_id) VALUES
(1, 100), (1, 101), (1, 102), (1, 103), (1, 104), (1, 105),
(1, 1011), (1, 1012), (1, 1013), (1, 1014), (1, 1015), (1, 1016);

-- 为普通用户分配基本权限
MERGE INTO sys_role_permission (role_id, permission_id) KEY(role_id, permission_id) VALUES
(3, 100), (3, 101), (3, 1011);