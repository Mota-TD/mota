-- Auth Service 初始化数据 (H2 兼容版本)

-- 初始化行业数据
MERGE INTO industry (id, code, name, parent_id, level, sort_order, status) KEY(id) VALUES
(1, 'IT', '互联网/IT', 0, 1, 1, 1),
(2, 'FINANCE', '金融', 0, 1, 2, 1),
(3, 'EDUCATION', '教育', 0, 1, 3, 1),
(4, 'HEALTHCARE', '医疗健康', 0, 1, 4, 1),
(5, 'MANUFACTURING', '制造业', 0, 1, 5, 1),
(6, 'RETAIL', '零售/电商', 0, 1, 6, 1),
(7, 'MEDIA', '传媒/文化', 0, 1, 7, 1),
(8, 'REALESTATE', '房地产/建筑', 0, 1, 8, 1),
(9, 'LOGISTICS', '物流/运输', 0, 1, 9, 1),
(10, 'OTHER', '其他', 0, 1, 10, 1);

-- 二级行业
MERGE INTO industry (id, code, name, parent_id, level, sort_order, status) KEY(id) VALUES
(101, 'IT_SOFTWARE', '软件开发', 1, 2, 1, 1),
(102, 'IT_INTERNET', '互联网服务', 1, 2, 2, 1),
(103, 'IT_AI', '人工智能', 1, 2, 3, 1),
(104, 'IT_CLOUD', '云计算/大数据', 1, 2, 4, 1),
(201, 'FINANCE_BANK', '银行', 2, 2, 1, 1),
(202, 'FINANCE_INSURANCE', '保险', 2, 2, 2, 1),
(203, 'FINANCE_SECURITIES', '证券/基金', 2, 2, 3, 1);

-- 初始化管理员用户 (密码: admin123, BCrypt加密)
-- $2a$10$MKaMq.mUYEMI3hK3FhuLYOmF9t8RyCGxUREoi4gMGZCXhiaomQtL2 是 admin123 的 BCrypt 哈希
MERGE INTO sys_user (id, username, email, phone, password_hash, nickname, status, org_id, org_name) KEY(id) VALUES
(1, 'admin', 'admin@mota.com', '13800138000', '$2a$10$MKaMq.mUYEMI3hK3FhuLYOmF9t8RyCGxUREoi4gMGZCXhiaomQtL2', '管理员', 1, 'ORG001', '摩塔智能'),
(2, 'test', 'test@mota.com', '13800138001', '$2a$10$MKaMq.mUYEMI3hK3FhuLYOmF9t8RyCGxUREoi4gMGZCXhiaomQtL2', '测试用户', 1, 'ORG001', '摩塔智能');

-- 初始化企业
MERGE INTO enterprise (id, org_id, name, short_name, industry_id, industry_name, admin_user_id, member_count, max_members, status, verified) KEY(id) VALUES
(1, 'ORG001', '摩塔智能科技信息技术有限公司', '摩塔智能', 1, '互联网/IT', 1, 2, 100, 1, 1);

-- 初始化企业成员
MERGE INTO enterprise_member (id, enterprise_id, user_id, role, status) KEY(id) VALUES
(1, 1, 1, 'admin', 1),
(2, 1, 2, 'member', 1);