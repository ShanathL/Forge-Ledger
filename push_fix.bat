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
git commit -m "Merge sidebar collapse, move logo top-left, move logout top-right, enhance pie chart, add charts across pages, remove redundant settings nav"

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
