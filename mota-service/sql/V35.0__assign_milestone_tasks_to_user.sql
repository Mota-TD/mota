-- 将所有 assignee_id 为 NULL 的里程碑任务分配给手机号为 17685112557 的用户
-- 该用户的 ID 是 1004450185041551362

-- 首先查询用户 ID（验证）
-- SELECT id, username, nickname, phone FROM sys_user WHERE phone = '17685112557';

-- 更新所有 assignee_id 为 NULL 的里程碑任务
UPDATE milestone_task 
SET assignee_id = (SELECT id FROM sys_user WHERE phone = '17685112557' LIMIT 1)
WHERE assignee_id IS NULL AND deleted = 0;

-- 验证更新结果
-- SELECT id, name, assignee_id FROM milestone_task WHERE deleted = 0;