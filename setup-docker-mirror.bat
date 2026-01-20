@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo   Docker 镜像加速器配置助手
echo ========================================
echo.

echo 此脚本将帮助您配置 Docker 镜像加速器
echo 以解决国内网络无法访问 Docker Hub 的问题
echo.

echo ========================================
echo   推荐的镜像加速器地址:
echo ========================================
echo.
echo   1. https://docker.1ms.run (推荐)
echo   2. https://docker.xuanyuan.me
echo   3. https://docker.rainbond.cc
echo   4. https://dockerhub.icu
echo.

echo ========================================
echo   配置方法:
echo ========================================
echo.
echo   方法一: Docker Desktop 图形界面配置
echo   ----------------------------------------
echo   1. 打开 Docker Desktop
echo   2. 点击右上角齿轮图标 (Settings)
echo   3. 选择 "Docker Engine"
echo   4. 在 JSON 配置中添加:
echo.
echo   {
echo     "registry-mirrors": [
echo       "https://docker.1ms.run",
echo       "https://docker.xuanyuan.me"
echo     ]
echo   }
echo.
echo   5. 点击 "Apply ^& Restart"
echo.
echo   ----------------------------------------
echo.
echo   方法二: 直接编辑配置文件
echo   ----------------------------------------
echo   配置文件位置:
echo   Windows: %%USERPROFILE%%\.docker\daemon.json
echo   Linux/Mac: /etc/docker/daemon.json
echo.

set /p CHOICE=是否自动创建配置文件? (y/n): 

if /i "%CHOICE%"=="y" (
    echo.
    echo [信息] 创建 Docker 配置文件...
    
    set "DOCKER_CONFIG_DIR=%USERPROFILE%\.docker"
    if not exist "%DOCKER_CONFIG_DIR%" (
        mkdir "%DOCKER_CONFIG_DIR%"
    )
    
    (
        echo {
        echo   "registry-mirrors": [
        echo     "https://docker.1ms.run",
        echo     "https://docker.xuanyuan.me",
        echo     "https://docker.rainbond.cc"
        echo   ]
        echo }
    ) > "%USERPROFILE%\.docker\daemon.json"
    
    echo [成功] 配置文件已创建: %USERPROFILE%\.docker\daemon.json
    echo.
    echo [重要] 请重启 Docker Desktop 使配置生效!
    echo.
    echo 重启步骤:
    echo   1. 右键点击系统托盘中的 Docker 图标
    echo   2. 选择 "Restart"
    echo   或者在 Docker Desktop 中点击 "Restart"
)

echo.
echo ========================================
echo   验证配置
echo ========================================
echo.
echo 配置完成后,可以运行以下命令验证:
echo   docker info ^| findstr "Registry Mirrors"
echo.
echo 或者尝试拉取镜像测试:
echo   docker pull hello-world
echo.

pause