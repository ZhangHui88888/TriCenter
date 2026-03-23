@echo off
chcp 65001 >nul
REM 双击运行时保证在项目根目录（与原逻辑一致，仅补这一行）
cd /d "%~dp0"

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
echo [2/3] 启动后端服务...
echo.

set DB_PASSWORD=root
set JWT_SECRET=tricenter-enterprise-management-system-jwt-secret-key-2026

REM 与原逻辑相同：子窗口内 cd backend 后 spring-boot:run；端口以 application.yml 为准，默认 8081
start "TriCenter Backend" cmd /k "cd backend && set DB_PASSWORD=root&& set JWT_SECRET=tricenter-enterprise-management-system-jwt-secret-key-2026&& mvn spring-boot:run -Dspring-boot.run.profiles=dev"

echo [√] 后端启动中，请等待...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] 启动前端服务...
echo.

start "TriCenter Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================================
echo   启动完成！
echo.
echo   前端地址: http://localhost:3000
echo   后端默认端口 8081，与 vite 代理一致；API 文档见 doc.html
echo   默认账号: admin / admin123
echo ============================================================
echo.
echo 按任意键关闭此窗口（不会关闭前后端服务）...
pause >nul
