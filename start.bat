@echo off
REM TaskForest项目启动脚本 - Windows版本
REM 本脚本会启动前端和后端服务

setlocal EnableDelayedExpansion

REM 设置颜色代码
set "RED=31"
set "GREEN=32"
set "YELLOW=33"
set "BLUE=36"

REM 函数：显示彩色文本
:colorEcho
set "COLOR=%~1"
set "TEXT=%~2"
echo [%COLOR%m%TEXT%[0m
exit /b

REM 显示帮助信息
:showHelp
call :colorEcho %BLUE% "TaskForest项目启动脚本"
echo.
echo 用法: start.bat [选项]
echo.
echo 选项:
echo   /h, /help       显示帮助信息
echo   /f, /frontend   仅启动前端
echo   /b, /backend    仅启动后端
echo   /d, /dev        开发模式（默认）
echo   /p, /prod       生产模式
echo.
echo 示例:
echo   start.bat              # 开发模式启动前后端
echo   start.bat /f           # 仅启动前端
echo   start.bat /b           # 仅启动后端
echo   start.bat /p           # 生产模式启动
exit /b

REM 检查是否安装了必要的软件
:checkPrerequisites
call :colorEcho %BLUE% "正在检查必要组件..."

REM 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    call :colorEcho %RED% "错误: 未找到Node.js"
    echo 请安装Node.js 18及以上版本: https://nodejs.org/
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do set node_version=%%i
    call :colorEcho %GREEN% "- Node.js: 已安装 (!node_version!)"
)

REM 检查pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    call :colorEcho %YELLOW% "警告: 未找到pnpm"
    echo 尝试安装pnpm...
    npm install -g pnpm
    
    REM 再次检查pnpm是否安装成功
    where pnpm >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        call :colorEcho %RED% "错误: pnpm安装失败"
        echo 请手动安装pnpm: npm install -g pnpm
        exit /b 1
    ) else (
        call :colorEcho %GREEN% "- pnpm: 已安装"
    )
) else (
    for /f "tokens=*" %%i in ('pnpm -v') do set pnpm_version=%%i
    call :colorEcho %GREEN% "- pnpm: 已安装 (!pnpm_version!)"
)

call :colorEcho %GREEN% "所有必要组件已就绪"
echo.
exit /b 0

REM 安装依赖
:installDependencies
call :colorEcho %BLUE% "安装项目依赖..."

if "%start_frontend%"=="true" (
    REM 安装根目录依赖
    echo 安装根目录依赖...
    call pnpm install
    
    REM 检查安装结果
    if %ERRORLEVEL% NEQ 0 (
        call :colorEcho %RED% "错误: 根目录依赖安装失败"
        exit /b 1
    )
    
    REM 安装前端依赖
    echo 安装前端依赖...
    cd client && call pnpm install && cd ..
    
    REM 检查安装结果
    if %ERRORLEVEL% NEQ 0 (
        call :colorEcho %RED% "错误: 前端依赖安装失败"
        exit /b 1
    )
)

if "%start_backend%"=="true" (
    REM 安装后端依赖
    echo 安装后端依赖...
    cd server && call pnpm install && cd ..
    
    REM 检查安装结果
    if %ERRORLEVEL% NEQ 0 (
        call :colorEcho %RED% "错误: 后端依赖安装失败"
        exit /b 1
    )
)

call :colorEcho %GREEN% "所有依赖安装完成"
echo.
exit /b 0

REM 启动前端服务
:startFrontendService
call :colorEcho %BLUE% "启动前端服务..."

if "%mode%"=="dev" (
    start "TaskForest前端" cmd /c "cd client && pnpm dev"
    call :colorEcho %GREEN% "前端服务已启动"
) else (
    start "TaskForest前端" cmd /c "cd client && pnpm build && pnpm preview"
    call :colorEcho %GREEN% "前端服务已启动 - 生产模式"
)

echo.
exit /b 0

REM 启动后端服务
:startBackendService
call :colorEcho %BLUE% "启动后端服务..."

if "%mode%"=="dev" (
    start "TaskForest后端" cmd /c "cd server && pnpm dev"
    call :colorEcho %GREEN% "后端服务已启动"
) else (
    start "TaskForest后端" cmd /c "cd server && pnpm start"
    call :colorEcho %GREEN% "后端服务已启动 - 生产模式"
)

echo.
exit /b 0

REM 主程序入口

REM 设置默认值
set "start_frontend=true"
set "start_backend=true"
set "mode=dev"

REM 解析参数
:parseArgs
if "%~1"=="" goto :main
if "%~1"=="/h" goto :help
if "%~1"=="/help" goto :help
if "%~1"=="/f" (
    set "start_frontend=true"
    set "start_backend=false"
    shift
    goto :parseArgs
)
if "%~1"=="/frontend" (
    set "start_frontend=true"
    set "start_backend=false"
    shift
    goto :parseArgs
)
if "%~1"=="/b" (
    set "start_frontend=false"
    set "start_backend=true"
    shift
    goto :parseArgs
)
if "%~1"=="/backend" (
    set "start_frontend=false"
    set "start_backend=true"
    shift
    goto :parseArgs
)
if "%~1"=="/d" (
    set "mode=dev"
    shift
    goto :parseArgs
)
if "%~1"=="/dev" (
    set "mode=dev"
    shift
    goto :parseArgs
)
if "%~1"=="/p" (
    set "mode=prod"
    shift
    goto :parseArgs
)
if "%~1"=="/prod" (
    set "mode=prod"
    shift
    goto :parseArgs
)
echo 未知参数: %~1
goto :help

:help
call :showHelp
exit /b 1

:main
call :colorEcho %BLUE% "TaskForest启动脚本 - %mode% 模式"
echo ==================================================
echo.

REM 检查必要组件
call :checkPrerequisites
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

REM 安装依赖
call :installDependencies
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

REM 启动服务
if "%start_frontend%"=="true" (
    call :startFrontendService
)

if "%start_backend%"=="true" (
    call :startBackendService
)

REM 显示服务地址
if "%start_frontend%"=="true" (
    call :colorEcho %GREEN% "前端服务运行在: http://localhost:5173"
)

if "%start_backend%"=="true" (
    call :colorEcho %GREEN% "后端服务运行在: http://localhost:3000"
)

echo.
call :colorEcho %YELLOW% "按任意键停止所有服务..."
echo ==================================================

pause

REM 停止服务 (Windows会在关闭命令窗口时自动终止进程) 