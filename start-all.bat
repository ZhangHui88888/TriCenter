@echo off
chcp 65001 >nul
echo ============================================================
echo   常州跨境电商三中心 - 企业信息管理系统
echo   一键启动脚本
echo ============================================================
echo.

echo [1/3] 检查环境...
echo.

REM 检查 Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Java，请先安装 JDK 17+
    pause
    exit /b 1
)
echo [√] Java 已安装

REM 检查 Maven
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Maven，请先安装 Maven 3.9+
    pause
    exit /b 1
)
echo [√] Maven 已安装

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo [√] Node.js 已安装

echo.
echo [2/3] 启动后端服务 (端口 8080)...
echo.

REM 设置环境变量
set DB_PASSWORD=root
set JWT_SECRET=tricenter-enterprise-management-system-jwt-secret-key-2026

REM 在新窗口启动后端
start "TriCenter Backend" cmd /k "cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo [√] 后端启动中，请等待...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] 启动前端服务 (端口 3000)...
echo.

REM 在新窗口启动前端
start "TriCenter Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================================
echo   启动完成！
echo.
echo   前端地址: http://localhost:3000
echo   后端地址: http://localhost:8080
echo   API文档:  http://localhost:8080/doc.html
echo.
echo   默认账号: admin / admin123
echo ============================================================
echo.
echo 按任意键关闭此窗口（不会关闭前后端服务）...
pause >nul
