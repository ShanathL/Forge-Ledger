@echo off
title Push ForgeLedger to GitHub
color 0A

echo =========================================================
echo              PUSH FORGELEDGER TO GITHUB
echo =========================================================
echo.

cd /d "%~dp0"

where git >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Git is not installed or not in PATH.
  echo Please install Git from https://git-scm.com/
  pause
  exit /b 1
)

set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/shanathvemula/forgeledger.git): "

if "%REPO_URL%"=="" (
  echo [ERROR] No repository URL entered.
  pause
  exit /b 1
)

echo.
echo [1/4] Initializing Git repository...
if not exist ".git\" (
  git init
)

echo [2/4] Staging files...
git add .

echo [3/4] Creating commit...
git commit -m "ForgeLedger - Integrated Manufacturing Workspace"

echo [4/4] Pushing to GitHub...
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo =========================================================
echo [SUCCESS] Code pushed to GitHub!
echo =========================================================
echo.
pause
