@echo off
chcp 65001 >nul
echo ========================================
echo Mota 数据库重置工具
echo ========================================
echo.
echo 警告: 此操作将删除所有数据并重新初始化数据库!
echo.
echo 数据库初始化脚本包含以下模块：
echo   [V1.0]  基础表结构（用户、项目、通知、活动等）
echo   [V2.0]  项目协同模块（部门任务、工作计划、里程碑等）
echo   [V3.0]  任务依赖和子任务（依赖关系、检查清单、日程等）
echo   [V4.0]  文档协作（文档管理、版本控制、知识图谱等）
echo   [V5.0]  工作流和视图配置（自定义工作流、状态管理等）
echo   [V8.0]  知识使用统计（复用统计、知识缺口分析等）
echo   [V9.0]  AI知识库（文档向量化、语义搜索、OCR等）
echo   [V10.0] 智能新闻推送（新闻分类、用户偏好、推送记录等）
echo   [V11.0] AI方案生成（方案内容、图表建议、导出模板等）
echo   [V12.0] 智能搜索（搜索日志、关键词统计等）
echo   [V13.0] AI助手（聊天会话、数据分析、任务命令等）
echo   [V14.0] 多模型支持（模型配置、调用日志、性能监控等）
echo   [V15.0] 系统管理增强（操作日志、系统配置、数据备份等）
echo   [V16.0] 通知中心增强（通知偏好、免打扰、订阅管理等）
echo   [V17.0] 企业注册模块（企业信息、管理员、审核等）
echo   [V21.0] 里程碑负责人和任务同步
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
echo [5/5] 正在执行数据库初始化脚本...
echo      文件: ../sql/init-db.sql
echo      大小: 约 249KB
echo      表数: 约 178 个
echo.

docker exec -i mota-mysql mysql -uroot -proot123 mota < ../sql/init-db.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 数据库重置完成!
    echo ========================================
    echo.
    echo 已成功创建 178 个数据表，涵盖：
    echo - 核心项目管理（项目、任务、成员、部门）
    echo - 文档协作（文档、版本、评论、协作者）
    echo - 工作流管理（工作流模板、状态、流转规则）
    echo - AI功能（知识库、助手、新闻推送、方案生成）
    echo - 系统管理（用户、通知、日志、配置）
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
    echo 2. init-db.sql文件是否存在: dir ..\sql\init-db.sql
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