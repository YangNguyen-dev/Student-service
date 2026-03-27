@echo off
title Quan Ly Hoc Tap - Starting...
echo ============================================
echo   QUAN LY HOC TAP - KHOI DONG HE THONG
echo ============================================
echo.

echo [1/2] Dang khoi dong Backend (Spring Boot)...
start "Backend - Spring Boot" cmd /k "cd /d d:\DACN\Student_service && gradlew.bat bootRun"

echo [2/2] Dang khoi dong Frontend (Vite)...
timeout /t 5 /nobreak >nul
start "Frontend - Vite" cmd /k "cd /d d:\DACN\Student_service\frontend && npm run dev"

echo.
echo ============================================
echo   DA KHOI DONG XONG!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo ============================================
echo.
echo Nhan phim bat ky de mo trinh duyet...
pause >nul
start http://localhost:5173
