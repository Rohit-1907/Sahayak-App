@echo off
title Sahayak Cloudflare Tunnel
echo ========================================================
echo   Starting Cloudflare Quick Tunnel for Sahayak Backend
echo   Forwarding to: http://localhost:8000
echo ========================================================
echo.
echo Look for the public URL ending with '.trycloudflare.com' below!
echo Copy that URL and paste it into client and worker config/api.js
echo Press Ctrl+C anytime to stop the tunnel.
set "PATH=%PATH%;C:\Program Files (x86)\cloudflared"
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] cloudflared command not found!
    echo Please make sure cloudflared is installed.
    pause
    exit /b 1
)

cloudflared tunnel --url http://localhost:8000
pause

