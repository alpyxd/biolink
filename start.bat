@echo off
title Guns Biolink Sunucusu
echo ======================================================
echo    GUNS.LOL TARZI BIOLINK VE ADMIN PANELI
echo ======================================================
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    node server.js
) else (
    if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
        call "%APPDATA%\Antigravity\bin\agy-node.cmd" server.js
    ) else (
        echo [HATA] Node.js veya agy-node bulunamadi!
        pause
    )
)
