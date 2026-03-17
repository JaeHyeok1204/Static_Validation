@echo off
setlocal enabledelayedexpansion

echo [INFO] Checking Git status...
cd /d "%~dp0"

echo 1. Adding changes...
git add .
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Error during git add.
    pause
    exit /b %ERRORLEVEL%
)

echo 2. Committing changes...
:: Generate a simple timestamp without complex parsing
set commit_msg=Auto sync: %date% %time%

git commit -m "%commit_msg%"
if %ERRORLEVEL% neq 0 (
    echo [WARN] Nothing to commit or commit failed.
)

echo 3. Pushing to GitHub...
git push origin main
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Push failed. Please check your internet connection or GitHub status.
    pause
    exit /b %ERRORLEVEL%
)

echo [SUCCESS] Sync Complete! Successfully uploaded to GitHub.
pause
