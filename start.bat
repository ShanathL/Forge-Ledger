@echo off
title ForgeLedger - Manufacturing Workspace
color 0B

echo =========================================================
echo               FORGELEDGER LAUNCHER
echo      Integrated Manufacturing Workspace for SMEs
echo =========================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not installed or not in your PATH.
  echo Please install Node.js 18+ from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] Installing required dependencies...
  call npm install
  if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo [INFO] Starting ForgeLedger Server on port 4000...
start "" http://localhost:4000

node server/server.js

pause
