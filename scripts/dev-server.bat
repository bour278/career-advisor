@echo off
REM CareerPilot Development Server Management Script

if "%1"=="start" goto start
if "%1"=="stop" goto stop  
if "%1"=="restart" goto restart
if "%1"=="status" goto status

echo Usage: dev-server.bat [start^|stop^|restart^|status]
goto end

:start
echo 🚀 Starting development server...
npm run dev
goto end

:stop
echo 🔍 Stopping development server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo 🛑 Killing process %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo ✅ Development server stopped
goto end

:restart
call :stop
timeout /t 2 /nobreak >nul
call :start
goto end

:status
echo 📊 Development Server Status
echo =============================
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Server is RUNNING on port 5000
    echo    URL: http://localhost:5000
) else (
    echo 🔴 Server is NOT running
)
goto end

:end