@echo off
chcp 65001 >nul
echo ========================================
echo   TriCenter 前端启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 检查 node_modules...
if not exist "node_modules" (
    echo 未找到 node_modules，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败，请检查网络或 npm 配置
        pause
        exit /b 1
    )
    echo 依赖安装完成！
) else (
    echo node_modules 已存在，跳过安装
)

echo.
echo [2/2] 启动开发服务器...
echo.
call npm run dev

pause
