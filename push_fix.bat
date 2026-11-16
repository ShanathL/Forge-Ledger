@echo off
title Push ForgeLedger Fix to GitHub
echo ===================================================
echo  Pushing ForgeLedger Fixes to GitHub
echo ===================================================
echo.
cd /d "D:\Forge Ledger"

echo Checking Git status...
git status

echo.
echo Staging modified files...
git add .

echo.
echo Committing fixes...
git commit -m "Update layout: move logo to top right, add Dark/Light mode toggle, move company to sidebar bottom, separate Account and Logout buttons"

echo.
echo Pushing to GitHub (origin main)...
git push -u origin main

echo.
echo ===================================================
echo  SUCCESS! Pushed to GitHub.
echo  Railway is now automatically building and deploying
echo  the updated application to https://forgeledger-app-production.up.railway.app
echo ===================================================
echo.
pause
