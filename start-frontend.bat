@echo off
chcp 65001 >nul
echo ============================================================
echo   TriCenter - 启动前端服务
echo ============================================================
echo.

echo 正在启动前端服务...
echo 端口: 3000
echo.

cd frontend
npm run dev

pause
