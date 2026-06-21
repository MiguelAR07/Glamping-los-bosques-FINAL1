@echo off
title Sistema Glamping - Lanzador Local
set FRONTEND_PATH=%~dp0FrontEnd
set BACKEND_PATH=%~dp0BackEnd

:: --- 1. VERIFICAR NODE.JS ---
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [SISTEMA] Node.js no detectado. Instalando...
    winget install -e --id OpenJS.NodeJS.LTS
    echo [SISTEMA] Por favor, reinicia este script tras la instalacion.
    pause & exit
) 

echo [SISTEMA] Entorno verificado correctamente.

:: --- 2. INICIAR SERVIDORES ---

:: Iniciar Backend
cd /d "%BACKEND_PATH%"
echo [BACKEND] Iniciando API de Node en el puerto 3000...
start "Node Backend" cmd /k "npm run dev" [cite: 5]

:: Iniciar Frontend
cd /d "%FRONTEND_PATH%"
echo [FRONTEND] Iniciando Vite en el puerto 5173...
start "Vite Frontend" cmd /k "npm run dev" [cite: 5]

:: --- 3. ESPERAR Y LANZAR NAVEGADOR ---
echo [SISTEMA] Esperando a que los servicios estabilicen...
timeout /t 5 >nul

echo [EXITO] Abriendo el sistema en tu navegador local...
:: Por defecto Vite suele usar el puerto 5173
start http://localhost:5173

exit