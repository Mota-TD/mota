-- 插入行业数据
-- 请在MySQL客户端（如Navicat、MySQL Workbench）中执行此脚本

USE mota;

-- 插入一级行业
INSERT IGNORE INTO industry (code, name, parent_id, level, sort_order, icon, description) VALUES
('IT', '信息技术/互联网', NULL, 1, 1, '💻', '包括软件开发、互联网服务、IT咨询等'),
('FINANCE', '金融/银行/保险', NULL, 1, 2, '🏦', '包括银行、证券、保险、投资等'),
('MANUFACTURING', '制造业', NULL, 1, 3, '🏭', '包括机械制造、电子制造、汽车制造等'),
('RETAIL', '零售/电商', NULL, 1, 4, '🛒', '包括线下零售、电子商务、批发贸易等'),
('HEALTHCARE', '医疗/健康', NULL, 1, 5, '🏥', '包括医院、医药、医疗器械、健康服务等'),
('EDUCATION', '教育/培训', NULL, 1, 6, '📚', '包括学校、培训机构、在线教育等'),
('REALESTATE', '房地产/建筑', NULL, 1, 7, '🏗️', '包括房地产开发、建筑施工、装修设计等'),
('MEDIA', '传媒/广告/文化', NULL, 1, 8, '📺', '包括媒体、广告、影视、游戏等'),
('LOGISTICS', '物流/运输', NULL, 1, 9, '🚚', '包括快递、货运、仓储、供应链等'),
('ENERGY', '能源/环保', NULL, 1, 10, '⚡', '包括电力、石油、新能源、环保等'),
('AGRICULTURE', '农业/食品', NULL, 1, 11, '🌾', '包括农业种植、食品加工、餐饮服务等'),
('CONSULTING', '咨询/法律/会计', NULL, 1, 12, '📋', '包括管理咨询、法律服务、会计审计等'),
('GOVERNMENT', '政府/公共事业', NULL, 1, 13, '🏛️', '包括政府机关、事业单位、非营利组织等'),
('OTHER', '其他行业', NULL, 1, 99, '📦', '其他未分类行业');

-- 验证插入结果
SELECT COUNT(*) AS '行业数量' FROM industry;
SELECT * FROM industry ORDER BY sort_order;