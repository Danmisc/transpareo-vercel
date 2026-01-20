@echo off
echo ==========================================
echo      TRANSPAREO - DEPLOYMENT SCRIPT (FIX)
echo ==========================================

REM Define explicit Git path found by agent
set GIT_EXE="C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd\git.exe"

echo Checking for Git...
%GIT_EXE% --version
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git not found. Please restart terminal.
    pause
    exit /b
)

echo.
echo 1. Adding latest changes...
%GIT_EXE% add .

echo.
echo 2. Committing...
%GIT_EXE% commit -m "Deploy to transpareo-vercel"

echo.
echo 3. FIXING REPOSITORY URL...
echo Switching remote to: https://github.com/Danmisc/transpareo-vercel
%GIT_EXE% remote set-url origin https://github.com/Danmisc/transpareo-vercel
IF %ERRORLEVEL% NEQ 0 (
    echo Original remote not found, adding new one...
    %GIT_EXE% remote add origin https://github.com/Danmisc/transpareo-vercel
)

echo.
echo 4. Pushing to correct repository...
%GIT_EXE% push -u origin main

echo.
echo ==========================================
echo Done! Check 'transpareo-vercel' on GitHub.
echo ==========================================
pause
