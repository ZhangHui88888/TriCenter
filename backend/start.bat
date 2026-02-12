@echo off
echo Starting TriCenter Backend...
echo.

REM 设置环境变量
set DB_PASSWORD=root
set JWT_SECRET=tricenter-enterprise-management-system-jwt-secret-key-2026

REM 启动应用
mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
