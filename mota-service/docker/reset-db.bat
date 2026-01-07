@echo off
chcp 65001 >nul
echo ========================================
echo Mota 微服务数据库重置工具
echo ========================================
echo.
echo 警告: 此操作将删除所有数据并重新初始化数据库!
echo.
echo 微服务数据库架构：
echo   [mota_auth]      认证服务 - 用户、企业、部门、SSO、权限
echo   [mota_project]   项目服务 - 项目、任务、里程碑、文档、工作流
echo   [mota_ai]        AI服务   - 对话、方案生成、智能搜索、新闻
echo   [mota_knowledge] 知识服务 - 文件管理、分类、标签、模板
echo   [mota_notify]    通知服务 - 通知、订阅、邮件队列、推送
echo   [mota_calendar]  日历服务 - 事件、参与者、提醒、订阅
echo.
echo 初始化脚本包含：
echo   - 6个独立数据库和服务账户
echo   - 100+ 数据表
echo   - 完整的索引和约束
echo   - 初始化数据（行业、工作流模板、AI方案模板）
echo.
set /p confirm="确认继续? (y/n): "
if /i not "%confirm%"=="y" (
    echo 操作已取消
    exit /b
)

echo.
echo [1/5] 正在停止容器...
docker-compose down

echo.
echo [2/5] 正在删除数据卷...
docker volume rm docker_mysql_data 2>nul
if %errorlevel% neq 0 (
    echo 注意: 数据卷可能不存在或已被删除
)

echo.
echo [3/5] 正在重新启动容器...
docker-compose up -d

echo.
echo [4/5] 等待MySQL启动（约15秒）...
timeout /t 15 /nobreak >nul

echo.
echo [5/5] 正在清理旧数据库并执行初始化脚本...
echo      清理: 删除旧的 mota 数据库和用户（如果存在）
echo      文件: ./init-db.sql
echo      架构: 微服务多库设计
echo      数据库: 6个
echo.

REM 删除旧的 mota 数据库和用户（如果存在）
docker exec -i mota-mysql mysql -uroot -proot123 -e "DROP DATABASE IF EXISTS mota; DROP USER IF EXISTS 'mota'@'%%'; FLUSH PRIVILEGES;" 2>nul

REM 执行初始化脚本
docker exec -i mota-mysql mysql -uroot -proot123 < ./init-db.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 数据库重置完成!
    echo ========================================
    echo.
    echo   已成功创建 6 个微服务数据库：
    echo.
    echo   mota_auth      - 认证服务数据库
    echo   mota_project   - 项目服务数据库
    echo   mota_ai        - AI服务数据库
    echo   mota_knowledge - 知识服务数据库
    echo   mota_notify    - 通知服务数据库
    echo   mota_calendar  - 日历服务数据库
    echo.
    echo 每个数据库都有独立的服务账户（密码: mota123）
    echo.
    echo 请刷新浏览器页面查看效果。
) else (
    echo.
    echo ========================================
    echo 错误: 数据库初始化失败!
    echo ========================================
    echo.
    echo 请检查：
    echo 1. MySQL容器是否正常运行: docker ps
    echo 2. init-db.sql文件是否存在: dir .\init-db.sql
    echo 3. 数据库连接信息是否正确
    echo 4. 查看MySQL日志: docker logs mota-mysql
    echo.
    echo 如果问题持续，请尝试：
    echo   docker-compose down -v
    echo   docker-compose up -d
    echo   然后重新运行此脚本
)

echo.
pause