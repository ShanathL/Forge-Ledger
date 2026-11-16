@echo off
title Railway Deploy - ForgeLedger
color 0B

echo =========================================================
echo               FORGELEDGER RAILWAY DEPLOY
echo =========================================================
echo.

cd /d "%~dp0"

where railway >nul 2>nul
if %errorlevel% neq 0 (
  echo [INFO] Railway CLI not detected. Installing via npm...
  call npm install -g @railway/cli
  if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Railway CLI.
    pause
    exit /b 1
  )
)

echo [INFO] Linking to Railway project ForgeLedger...
call railway link -p 3f09e095-f318-4099-8b8e-7aa573bfbdb6 -s 883203a1-61c7-4298-8113-2cdf04f8b253 -e 4f33b81b-dcd7-4de8-ad0c-8bcafe2fa03e

echo.
echo [INFO] Uploading and deploying code to Railway...
call railway up

echo.
echo =========================================================
echo [SUCCESS] Deployment complete!
echo Live App: https://forgeledger-app-production.up.railway.app
echo =========================================================
echo.
pause
