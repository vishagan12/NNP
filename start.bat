@echo off
cd /d "%~dp0"
echo ========================================================
echo   DOOM // Tactical Swarm Command Center
echo ========================================================
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Starting Vite Tactical Dev Server for DOOM...
call npm run dev
pause
