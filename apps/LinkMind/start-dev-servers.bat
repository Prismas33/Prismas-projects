@echo off
echo Starting LinkMind Development Server...
echo.

echo [1/2] Starting Backend Server...
start "Backend" cmd /k "nodemon server.js"

echo [2/2] Starting Frontend Server...
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "cd client && npm start"

echo.
echo Development servers started!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul
