-- =====================================================
-- Mota 数据库初始化脚本
-- 创建各微服务所需的数据库
-- =====================================================

-- 创建 Nacos 配置数据库
CREATE DATABASE IF NOT EXISTS `nacos_config` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户服务数据库
CREATE DATABASE IF NOT EXISTS `mota_user` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建租户服务数据库
CREATE DATABASE IF NOT EXISTS `mota_tenant` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建项目服务数据库
CREATE DATABASE IF NOT EXISTS `mota_project` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建任务服务数据库
CREATE DATABASE IF NOT EXISTS `mota_task` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建协作服务数据库
CREATE DATABASE IF NOT EXISTS `mota_collab` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建知识服务数据库
CREATE DATABASE IF NOT EXISTS `mota_knowledge` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建 AI 服务数据库
CREATE DATABASE IF NOT EXISTS `mota_ai` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建通知服务数据库
CREATE DATABASE IF NOT EXISTS `mota_notify` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建日历服务数据库
CREATE DATABASE IF NOT EXISTS `mota_calendar` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建报表服务数据库
CREATE DATABASE IF NOT EXISTS `mota_report` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建搜索服务数据库
CREATE DATABASE IF NOT EXISTS `mota_search` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 授权 mota 用户访问所有数据库
GRANT ALL PRIVILEGES ON `nacos_config`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_user`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_tenant`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_project`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_task`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_collab`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_knowledge`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_ai`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_notify`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_calendar`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_report`.* TO 'mota'@'%';
GRANT ALL PRIVILEGES ON `mota_search`.* TO 'mota'@'%';

FLUSH PRIVILEGES;

-- 输出创建结果
SELECT 'Databases created successfully!' AS message;
SHOW DATABASES LIKE 'mota_%';