@echo off
echo Starting GameZoe Development Environment...
echo.

REM Kill existing node processes
echo [1/4] Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Starting Backend Servers...
start "Main Server (3001)" cmd /k "cd /d %~dp0 && node server/index.js"
timeout /t 1 /nobreak >nul

start "Fish Mocker (4002)" cmd /k "cd /d %~dp0 && node server/fish_mocker.js"
timeout /t 1 /nobreak >nul

start "MyFish Server (9001)" cmd /k "cd /d %~dp0 && node server/myfish_server.js"
timeout /t 1 /nobreak >nul

echo.
echo [3/4] Starting Vite Frontend (3000)...
start "Vite Dev Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo [4/4] All servers started!
echo.
echo Servers Running:
echo   - Main Server:    http://localhost:3001
echo   - Vite Frontend:  http://localhost:3000
echo   - Fish Mocker:    Port 4002
echo   - MyFish Server:  Port 9001
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
