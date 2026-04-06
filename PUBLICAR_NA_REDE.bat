@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   AICRO — Iniciar Ambos os Sistemas na Rede              ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: 1. BUILD DO FRONTEND V2 (se necessário)
echo [1/4] Gerando build do novo sistema (frontend-v2)...
cd /d "%~dp0frontend-v2"
call npm run build
if errorlevel 1 (
    echo.
    echo [ERRO] Falha no build do frontend-v2. Verifique os erros acima.
    pause
    exit /b 1
)
echo [OK] Build concluido!
cd /d "%~dp0"

:: 2. PARA PROCESSOS ANTIGOS DO NODE
echo.
echo [2/4] Encerrando processos node.exe antigos...
taskkill /f /im node.exe > nul 2>&1
timeout /t 2 > nul

:: 3. INICIA SISTEMA ANTIGO (porta 3000)
echo [3/4] Iniciando sistema antigo na porta 3000...
start "CTIA Sistema Antigo :3000" cmd /k "cd /d %~dp0 && node server.js"
timeout /t 3 > nul

:: 4. INICIA NOVO SISTEMA (porta 4000)
echo [4/4] Iniciando novo sistema (v2) na porta 4000...
start "AICRO Novo Sistema :4000" cmd /k "cd /d %~dp0 && node server-v2.js"
timeout /t 3 > nul

:: 5. MOSTRA ENDEREÇOS
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   SISTEMAS RODANDO NA REDE!                              ║
echo ║                                                          ║
echo ║   SISTEMA ANTIGO:  http://%IP%:3000     ║
echo ║   NOVO SISTEMA:    http://%IP%:4000     ║
echo ║                                                          ║
echo ║   Qualquer pessoa na rede pode acessar os dois.         ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
pause
