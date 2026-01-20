@echo off
echo ==========================================
echo      TRANSPAREO - DEPLOYMENT SCRIPT
echo ==========================================

REM Define explicit Git path found by agent
set GIT_EXE="C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd\git.exe"

echo Checking for Git at %GIT_EXE%...
%GIT_EXE% --version
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not found at the expected location.
    echo Trying standard path...
    set GIT_EXE="git"
    git --version
    IF %ERRORLEVEL% NEQ 0 (
        echo [FATAL] Git not found. Please restart terminal.
        pause
        exit /b
    )
)

echo.
echo 1. Initializing Repository...
%GIT_EXE% init

echo.
echo 2. Adding files...
%GIT_EXE% add .

echo.
echo 3. Committing changes...
%GIT_EXE% commit -m "Configure Vercel deployment with Postgres migration"

echo.
echo [IMPORTANT]
echo If you haven't linked your GitHub repository yet, run:
echo git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo (You might need to use the absolute path to git if it fails)
echo.

echo 4. Pushing to GitHub...
%GIT_EXE% push -u origin main

echo.
echo ==========================================
echo Done! Build should start on Vercel.
echo ==========================================
pause
