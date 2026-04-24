@echo off
chcp 65001 >nul
title 心晴同行启动器

echo ========================================
echo         心晴同行 一键启动
echo ========================================
echo.

:: 关闭已存在的服务
echo [1/4] 关闭已有服务...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

:: 启动后端
echo [2/4] 启动后端服务 (端口 3000)...
start "心晴后端" cmd /k "cd /d %~dp0backend && npm start"

:: 等待后端启动
echo       等待后端启动...
timeout /t 3 >nul

:: 启动前端
echo [3/4] 启动前端服务 (端口 5175)...
start "心晴前端" cmd /k "cd /d %~dp0xinqing-frontend && npm run dev -- --host"

:: 等待前端启动
echo       等待前端启动...
timeout /t 4 >nul

echo.
echo ========================================
echo         启动完成！
echo ========================================
echo.
echo   后端: http://localhost:3000
echo   前端: http://localhost:5175
echo.
echo   按任意键打开浏览器...
pause >nul

start http://localhost:5175
