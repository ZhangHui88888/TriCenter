@echo off
chcp 65001 >nul
setlocal

:: ============================================
:: TriCenter 一键部署脚本（Windows 本地执行）
:: 自动打包前后端、上传到服务器、重启服务
:: ============================================

set SERVER=root@47.101.133.8
set REMOTE_DIR=/opt/tricenter
set REMOTE_BACKEND=%REMOTE_DIR%/backend
set REMOTE_FRONTEND=%REMOTE_DIR%/frontend-dist

echo.
echo ========== TriCenter 一键部署 ==========
echo.

:: 1. 前端打包
echo [1/5] 前端打包...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo 前端打包失败！
    pause
    exit /b 1
)
cd ..
echo       前端打包完成

:: 2. 后端打包
echo [2/5] 后端打包...
cd backend
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo 后端打包失败！
    pause
    exit /b 1
)
cd ..
echo       后端打包完成

:: 3. 上传前端
echo [3/5] 上传前端文件...
scp -r frontend/dist/* %SERVER%:%REMOTE_FRONTEND%/
if %errorlevel% neq 0 (
    echo 前端上传失败！请检查 SSH 连接
    pause
    exit /b 1
)
echo       前端上传完成

:: 4. 上传后端 JAR
echo [4/5] 上传后端 JAR...
for %%f in (backend\target\tricenter-backend-*.jar) do (
    if not "%%~nf"=="*" if not "%%f"=="*.original" (
        scp "%%f" %SERVER%:%REMOTE_BACKEND%/tricenter.jar
    )
)
if %errorlevel% neq 0 (
    echo 后端上传失败！请检查 SSH 连接
    pause
    exit /b 1
)
echo       后端上传完成

:: 5. 重启后端服务
echo [5/5] 重启后端服务...
ssh %SERVER% "systemctl restart tricenter && sleep 3 && systemctl is-active tricenter"
if %errorlevel% neq 0 (
    echo 服务重启失败！请手动检查
    pause
    exit /b 1
)

echo.
echo ========== 部署完成 ==========
echo.
echo 前端: https://czcrop.top
echo 后端: https://api.czcrop.top/doc.html
echo.
pause
