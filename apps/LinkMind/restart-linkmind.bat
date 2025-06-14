@echo off
echo === REINICIANDO O LINKMIND ===
echo.

echo [1/4] Limpando cache do Service Worker...
echo "Isto pode levar alguns segundos..."

echo const CACHE_NAME = 'linkmind-v1.0.0'; > %TEMP%\unregister-sw.js
echo navigator.serviceWorker.getRegistrations().then(function(registrations) { >> %TEMP%\unregister-sw.js
echo   for(let registration of registrations) { >> %TEMP%\unregister-sw.js
echo     registration.unregister(); >> %TEMP%\unregister-sw.js
echo     console.log('ServiceWorker unregistered'); >> %TEMP%\unregister-sw.js
echo   } >> %TEMP%\unregister-sw.js
echo   caches.keys().then(function(cacheNames) { >> %TEMP%\unregister-sw.js
echo     return Promise.all( >> %TEMP%\unregister-sw.js
echo       cacheNames.filter(function(cacheName) { >> %TEMP%\unregister-sw.js
echo         return true; >> %TEMP%\unregister-sw.js
echo       }).map(function(cacheName) { >> %TEMP%\unregister-sw.js
echo         return caches.delete(cacheName); >> %TEMP%\unregister-sw.js
echo       }) >> %TEMP%\unregister-sw.js
echo     ); >> %TEMP%\unregister-sw.js
echo   }); >> %TEMP%\unregister-sw.js
echo }); >> %TEMP%\unregister-sw.js

echo.
echo [2/4] Parando servidores anteriores...
taskkill /f /im node.exe 2>nul
echo.

echo [3/4] Iniciando o BACKEND (porta 3000)...
start cmd /k "cd /d %~dp0 && npm run dev"
echo.

echo [4/4] Iniciando o FRONTEND (porta 3001)...
timeout /t 3 > nul
start cmd /k "cd /d %~dp0client && npm start"
echo.

echo === LINKMIND REINICIADO! ===
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Abrindo o frontend no navegador padrão...
timeout /t 5 > nul
start http://localhost:3001
echo.
echo Para parar os servidores, feche as janelas do CMD
echo.
pause
