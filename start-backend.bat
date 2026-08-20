@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   TriCenter - 启动后端服务
echo ============================================================
echo.

if not defined DB_PASSWORD goto missing_config
if not defined JWT_SECRET goto missing_config
if not defined TRICENTER_API_KEY goto missing_config
if /I "%TRICENTER_DEV_SEED_ADMIN%"=="true" if not defined TRICENTER_DEV_ADMIN_USERNAME goto missing_config
if /I "%TRICENTER_DEV_SEED_ADMIN%"=="true" if not defined TRICENTER_DEV_ADMIN_PASSWORD goto missing_config

echo 正在启动后端服务...
echo 数据库: localhost:3306/tricenter
echo 端口: 见 application.yml，默认 8081
echo.

cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause
exit /b 0

:missing_config
echo [错误] 请先设置 DB_PASSWORD、JWT_SECRET、TRICENTER_API_KEY。
echo        如启用 TRICENTER_DEV_SEED_ADMIN=true，还需设置开发管理员用户名和密码。
pause
exit /b 1
