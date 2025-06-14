@echo off
echo === INICIANDO O LINKMIND ===
echo.

echo [0/4] Finalizando processos Node.js anteriores...
taskkill /f /im node.exe 2>nul
timeout /t 3 > nul
echo.

echo [1/4] Verificando se as portas estão livres...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo Porta 3000 ainda em uso, aguardando...
    timeout /t 5 > nul
)
echo.

echo [2/4] Iniciando o BACKEND (porta 3000)...
start cmd /k "cd /d %~dp0 && npm run backend"
echo.

echo [3/4] Aguardando backend inicializar e iniciando FRONTEND (porta 3001)...
timeout /t 5 > nul
start cmd /k "cd /d %~dp0client && npm start"
echo.

echo [4/4] Abrindo o frontend no navegador...
timeout /t 8 > nul
start http://localhost:3001
echo.

echo === LINKMIND INICIADO! ===
echo Backend: http://localhost:3000 (API)
echo Frontend: http://localhost:3001 (Interface do usuário)
echo.
echo Para parar os servidores, feche as janelas do CMD ou execute stop-linkmind.bat
echo.
pause
