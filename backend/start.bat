@echo off
echo Starting TriCenter Backend...
echo.

REM 启动应用（开发环境密码已配置在 application-dev.yml 中）
call mvn spring-boot:run "-Dspring-boot.run.profiles=dev"

pause
