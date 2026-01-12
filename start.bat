@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo ========================================
echo    Mota 平台一键启动脚本
echo ========================================
echo.

:: 设置目录
set "ROOT_DIR=%~dp0"
set "WEB_DIR=%ROOT_DIR%mota-web-next"
set "DEPLOY_DIR=%ROOT_DIR%mota-service\deploy"
set "SERVICE_DIR=%ROOT_DIR%mota-service"

:: 选择启动模式
:MENU
echo 请选择启动模式:
echo.
echo   [前端]
echo   1. 启动前端开发服务器 (使用 Mock 数据，无需后端)
echo   2. 构建前端生产版本
echo.
echo   [后端 - Docker 轻量版] (推荐，国内网络友好)
echo   3. 启动轻量版中间件 (MySQL + Redis + Nacos)
echo.
echo   [后端 - Docker 完整版] (需要良好网络)
echo   4. 启动全部服务 (中间件 + 微服务)
echo   5. 仅启动完整中间件 (MySQL, Redis, Nacos, Kafka, ES, Milvus, MinIO)
echo   6. 仅启动微服务 (需要先启动中间件)
echo.
echo   [管理]
echo   7. 停止所有服务
echo   8. 查看服务状态
echo   9. 查看服务日志
echo.
echo   0. 退出
echo.
set /p MODE=请输入选项 (0-9): 

if "%MODE%"=="0" goto END
if "%MODE%"=="1" goto START_FRONTEND
if "%MODE%"=="2" goto BUILD_FRONTEND
if "%MODE%"=="3" goto START_LITE
if "%MODE%"=="4" goto START_ALL
if "%MODE%"=="5" goto START_MIDDLEWARE
if "%MODE%"=="6" goto START_SERVICES
if "%MODE%"=="7" goto STOP_ALL
if "%MODE%"=="8" goto STATUS
if "%MODE%"=="9" goto LOGS

echo [错误] 无效选项
echo.
goto MENU

:: ========================================
:: 前端相关
:: ========================================

:START_FRONTEND
echo.
echo [检查] Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装
    echo 请安装 Node.js 18+: https://nodejs.org/
    pause
    goto MENU
)
echo [信息] Node.js 检查通过

echo.
echo [步骤 1/2] 检查并安装依赖...
cd /d "%WEB_DIR%"
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        goto MENU
    )
)

echo [步骤 2/2] 启动开发服务器...
echo.
echo ========================================
echo   前端服务启动中...
echo.
echo   访问地址: http://localhost:3000
echo.
echo   提示: 当前使用 Mock 数据
echo   无需启动后端服务即可预览
echo.
echo   按 Ctrl+C 停止服务
echo ========================================
echo.
call npm run dev:open
goto END

:BUILD_FRONTEND
echo.
echo [检查] Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js 未安装
    pause
    goto MENU
)

echo [步骤 1/2] 安装依赖...
cd /d "%WEB_DIR%"
call npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    goto MENU
)

echo [步骤 2/2] 构建生产版本...
call npm run build
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    goto MENU
)
echo.
echo [成功] 构建完成，输出目录: .next
pause
goto MENU

:: ========================================
:: Docker 相关
:: ========================================

:CHECK_DOCKER
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装
    echo 请安装 Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    goto MENU
)
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker Compose 未安装
    pause
    goto MENU
)
echo [信息] Docker 环境检查通过
goto :eof

:CHECK_ENV_FILE
if not exist "%DEPLOY_DIR%\.env" (
    echo [信息] 创建环境变量文件...
    (
        echo DEPLOY_ENV=prod
        echo IMAGE_TAG=latest
        echo TZ=Asia/Shanghai
        echo MYSQL_ROOT_PASSWORD=root123
        echo MYSQL_DATABASE=mota
        echo MYSQL_USER=mota
        echo MYSQL_PASSWORD=mota123
        echo REDIS_PASSWORD=
        echo JWT_SECRET=mota-jwt-secret-key-2024
        echo MINIO_ROOT_USER=mota_admin
        echo MINIO_ROOT_PASSWORD=mota_password
    ) > "%DEPLOY_DIR%\.env"
    echo [信息] 已创建默认 .env 文件
)
goto :eof

:START_LITE
echo.
call :CHECK_DOCKER
call :CHECK_ENV_FILE

echo.
echo [信息] 启动轻量版中间件 (MySQL+Redis+Nacos)...
cd /d "%DEPLOY_DIR%"
docker-compose -f docker-compose.lite.yml up -d
if errorlevel 1 (
    echo [错误] 轻量版中间件启动失败
    pause
    goto MENU
)

echo.
echo ========================================
echo   轻量版中间件启动完成!
echo.
echo   服务列表:
echo   - MySQL:  localhost:3306
echo   - Redis:  localhost:6379
echo   - Nacos:  localhost:8848
echo.
echo   Nacos 控制台: http://localhost:8848/nacos
echo.
echo   [提示] 轻量版适合开发环境
echo   [提示] 前端可直接使用 Mock 数据开发
echo ========================================
pause
goto MENU

:START_ALL
echo.
call :CHECK_DOCKER
call :CHECK_ENV_FILE

echo.
echo [步骤 1/3] 启动完整版中间件...
cd /d "%DEPLOY_DIR%"
docker-compose -f docker-compose.middleware.yml up -d
if errorlevel 1 (
    echo [错误] 中间件启动失败
    pause
    goto MENU
)

echo.
echo [信息] 等待中间件就绪 (60秒)...
timeout /t 60 /nobreak >nul

echo.
echo [步骤 2/3] 编译 Java 项目...
cd /d "%SERVICE_DIR%"
:: 优先使用 Maven Wrapper，如果不存在则使用系统 Maven
if exist "mvnw.cmd" (
    echo [信息] 使用 Maven Wrapper 编译...
    call mvnw.cmd clean package -DskipTests
) else (
    mvn --version >nul 2>&1
    if errorlevel 1 (
        echo [警告] Maven 未安装且 Maven Wrapper 不存在
        echo [提示] 请安装 Maven 3.6+: https://maven.apache.org/
        echo [提示] 或者确保项目中存在 mvnw.cmd 文件
        echo [信息] 尝试直接启动已有镜像...
    ) else (
        echo [信息] 使用系统 Maven 编译...
        call mvn clean package -DskipTests
    )
)
if errorlevel 1 (
    echo [警告] Maven 编译失败，尝试直接启动已有镜像...
)

echo.
echo [步骤 3/3] 启动微服务...
cd /d "%DEPLOY_DIR%"
docker-compose -f docker-compose.services.yml up -d --build
if errorlevel 1 (
    echo [错误] 微服务启动失败
    pause
    goto MENU
)

echo.
echo ========================================
echo   全部服务启动完成!
echo.
echo   访问地址:
echo   - 前端 Web:   http://localhost:3000
echo   - API 网关:   http://localhost:8080
echo   - Nacos:      http://localhost:8848/nacos
echo   - MinIO:      http://localhost:9001
echo.
echo   微服务端口:
echo   - Gateway:    8080
echo   - Auth:       8081
echo   - Project:    8082
echo   - AI:         8083
echo   - Knowledge:  8084
echo   - Notify:     8085
echo   - Calendar:   8086
echo   - User:       8087
echo ========================================
pause
goto MENU

:START_MIDDLEWARE
echo.
call :CHECK_DOCKER
call :CHECK_ENV_FILE

echo.
echo [信息] 启动完整版中间件...
cd /d "%DEPLOY_DIR%"
docker-compose -f docker-compose.middleware.yml up -d
if errorlevel 1 (
    echo [错误] 中间件启动失败
    pause
    goto MENU
)

echo.
echo ========================================
echo   完整版中间件启动完成!
echo.
echo   服务列表:
echo   - MySQL:       localhost:3306
echo   - Redis:       localhost:6379
echo   - Nacos:       localhost:8848
echo   - Kafka:       localhost:9092
echo   - ES:          localhost:9200
echo   - Milvus:      localhost:19530
echo   - MinIO:       localhost:9000
echo.
echo   [提示] 中间件需要约 60 秒完全就绪
echo ========================================
pause
goto MENU

:START_SERVICES
echo.
call :CHECK_DOCKER

echo.
echo [步骤 1/2] 编译 Java 项目...
cd /d "%SERVICE_DIR%"
:: 优先使用 Maven Wrapper，如果不存在则使用系统 Maven
if exist "mvnw.cmd" (
    echo [信息] 使用 Maven Wrapper 编译...
    call mvnw.cmd clean package -DskipTests
    if errorlevel 1 (
        echo [警告] Maven Wrapper 编译失败，尝试直接启动已有镜像...
    )
) else (
    mvn --version >nul 2>&1
    if errorlevel 1 (
        echo [警告] Maven 未安装且 Maven Wrapper 不存在
        echo [提示] 请安装 Maven 3.6+: https://maven.apache.org/
        echo [信息] 尝试直接启动已有镜像...
    ) else (
        echo [信息] 使用系统 Maven 编译...
        call mvn clean package -DskipTests
        if errorlevel 1 (
            echo [警告] Maven 编译失败，尝试直接启动已有镜像...
        )
    )
)

echo.
echo [步骤 2/2] 启动微服务...
cd /d "%DEPLOY_DIR%"
docker-compose -f docker-compose.services.yml up -d --build
if errorlevel 1 (
    echo [错误] 微服务启动失败
    echo.
    echo [提示] 请确保已先启动中间件 (选项 5)
    pause
    goto MENU
)

echo.
echo ========================================
echo   微服务启动完成!
echo.
echo   微服务端口:
echo   - Gateway:    8080
echo   - Auth:       8081
echo   - Project:    8082
echo   - AI:         8083
echo   - Knowledge:  8084
echo   - Notify:     8085
echo   - Calendar:   8086
echo   - User:       8087
echo ========================================
pause
goto MENU

:STOP_ALL
echo.
call :CHECK_DOCKER

echo.
echo [信息] 停止所有服务...
cd /d "%DEPLOY_DIR%"

echo [步骤 1/3] 停止微服务...
docker-compose -f docker-compose.services.yml down 2>nul

echo [步骤 2/3] 停止完整版中间件...
docker-compose -f docker-compose.middleware.yml down 2>nul

echo [步骤 3/3] 停止轻量版中间件...
docker-compose -f docker-compose.lite.yml down 2>nul

echo.
echo [成功] 所有服务已停止
echo.
set /p REMOVE_VOLUMES=是否删除数据卷? (y/n): 
if /i "%REMOVE_VOLUMES%"=="y" (
    echo [信息] 删除数据卷...
    docker-compose -f docker-compose.middleware.yml down -v 2>nul
    docker-compose -f docker-compose.lite.yml down -v 2>nul
    echo [成功] 数据卷已删除
)
pause
goto MENU

:STATUS
echo.
call :CHECK_DOCKER

echo.
echo ========================================
echo   服务状态
echo ========================================
cd /d "%DEPLOY_DIR%"

echo.
echo [轻量版中间件]
docker-compose -f docker-compose.lite.yml ps 2>nul

echo.
echo [完整版中间件]
docker-compose -f docker-compose.middleware.yml ps 2>nul

echo.
echo [微服务]
docker-compose -f docker-compose.services.yml ps 2>nul

echo.
pause
goto MENU

:LOGS
echo.
call :CHECK_DOCKER

echo.
echo 选择要查看的服务日志:
echo   1. MySQL
echo   2. Redis
echo   3. Nacos
echo   4. Kafka
echo   5. Elasticsearch
echo   0. 返回主菜单
echo.
set /p LOG_CHOICE=请输入选项: 

cd /d "%DEPLOY_DIR%"

if "%LOG_CHOICE%"=="0" goto MENU
if "%LOG_CHOICE%"=="1" docker-compose -f docker-compose.middleware.yml logs -f --tail=100 mysql
if "%LOG_CHOICE%"=="2" docker-compose -f docker-compose.middleware.yml logs -f --tail=100 redis
if "%LOG_CHOICE%"=="3" docker-compose -f docker-compose.middleware.yml logs -f --tail=100 nacos
if "%LOG_CHOICE%"=="4" docker-compose -f docker-compose.middleware.yml logs -f --tail=100 kafka
if "%LOG_CHOICE%"=="5" docker-compose -f docker-compose.middleware.yml logs -f --tail=100 elasticsearch

goto LOGS

:END
endlocal