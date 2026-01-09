@echo off
title Gamezoe Platform Controller
color 0B

echo.
echo =======================================================
echo   GAMEZOE PLATFORM - ROBUST STARTUP SYSTEM
echo   Target: GCP / Local Production
echo =======================================================
echo.

echo [Step 1] Cleaning up stale processes (Zombie Killer)...
echo -------------------------------------------------------
:: Force kill Node, PHP, Python, Go processes to free up ports
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM php-cgi.exe /T 2>nul
taskkill /F /IM go.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul
echo Process cleanup complete.
echo.

echo [Step 2] Starting UniversalLoc AI (Translation Engine)...
echo -------------------------------------------------------
cd "universalloc-ai---全領域專家級翻譯神器"
:: Use 'start' to run in background or new window
start "UniversalLoc AI" /MIN cmd /c "npm start"
cd ..
echo UniversalLoc AI launched on Port 3000.
echo.

echo [Step 3] Starting Game Services...
echo -------------------------------------------------------
:: Example: Start Tower Game
:: cd "tower_game-master"
:: start "Tower Game" /MIN cmd /c "npm start"
:: cd ..

echo.
echo [Step 4] Starting Health Monitor (Watchdog)...
echo -------------------------------------------------------
:: Starts the monitor in a concise window
start "Gamezoe Health Monitor" node platform_monitor.js

echo.
echo =======================================================
echo   ALL SYSTEMS GO.
echo   Monitor is running in background.
echo =======================================================
pause
