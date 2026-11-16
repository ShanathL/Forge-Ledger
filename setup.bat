@echo off
title ForgeLedger Setup
color 0A

echo =========================================================
echo              FORGELEDGER SETUP & INSTALL
echo =========================================================
echo.

cd /d "%~dp0"

echo [1/2] Installing Node.js packages...
call npm install

echo.
echo [2/2] Setup complete! You can now run start.bat to launch ForgeLedger.
echo.
pause
