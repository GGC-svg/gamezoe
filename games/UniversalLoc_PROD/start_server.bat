@echo off
title UniversalLoc AI - PRODUCTION SERVER
color 0A
echo.
echo ==================================================
echo   UNIVERSALLOC AI - EXPERT LOCALIZATION SYSTEM
echo   Production Environment
echo ==================================================
echo.
echo [1/3] Installing Dependencies (First Run Only)...
if not exist node_modules call npm install
echo.
echo [2/3] Starting Server...
echo.
echo   Server will be available at: http://localhost:3000
echo.
npm start
pause
