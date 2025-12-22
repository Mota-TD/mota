@echo off
chcp 65001 >nul
echo ========================================
echo   摩塔 Mota 后端服务停止脚本
echo ========================================
echo.

echo 正在停止所有容器...
docker-compose down

echo.
echo 所有服务已停止！
echo.
pause