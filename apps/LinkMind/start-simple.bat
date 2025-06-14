@echo off
echo Matando processos Node.js...
taskkill /f /im node.exe 2>nul
timeout /t 2 > nul

echo Iniciando backend...
start cmd /k "cd /d %~dp0 && nodemon server.js"
timeout /t 3 > nul

echo Iniciando frontend...
start cmd /k "cd /d %~dp0client && npm start"
timeout /t 5 > nul

echo Abrindo navegador...
start http://localhost:3001

echo Projeto iniciado!
pause
