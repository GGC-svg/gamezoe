@echo off
echo ===================================================
echo   GameZoe Server Startup Script
echo ===================================================

echo [0/5] Cleaning up old node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo       Done.

echo [1/5] Starting Lobby Server (Port 3000)...
start "GameZoe Lobby" node server/index.js

echo [2/5] Starting Fish Server (Port 4002/9000)...
start "Fish Server" node server/fish_mocker.js

echo [3/5] Starting MyFish Server (Port 9001)...
start "MyFish Server" node server/myfish_server.js

echo [4/5] Starting Frontend (Port 5173)...
start "Frontend" cmd /c "npm run vite"

echo ===================================================
echo   All Services Started! 
echo   Please allow a moment for servers to initialize.
echo ===================================================
pause
