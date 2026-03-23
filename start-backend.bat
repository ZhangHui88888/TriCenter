@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   TriCenter - 启动后端服务
echo ============================================================
echo.

set DB_PASSWORD=root
set JWT_SECRET=tricenter-enterprise-management-system-jwt-secret-key-2026

echo 正在启动后端服务...
echo 数据库: localhost:3306/tricenter
echo 端口: 见 application.yml，默认 8081
echo.

cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
