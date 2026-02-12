@echo off
chcp 65001 >nul
echo ============================================================
echo   TriCenter - 启动后端服务
echo ============================================================
echo.

REM 设置环境变量
set DB_PASSWORD=root
set JWT_SECRET=tricenter-enterprise-management-system-jwt-secret-key-2026

echo 正在启动后端服务...
echo 数据库: localhost:3306/tricenter
echo 端口: 8080
echo.

cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
