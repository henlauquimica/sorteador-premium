@echo off
echo ===================================================
echo   INICIANDO SORTEADOR PREMIUM (AMBIENTE LOCAL)
echo ===================================================

echo.
echo [1/2] Iniciando Backend (API)...
start "Sorteador API" cmd /k "cd backend && venv\Scripts\activate && uvicorn main_app:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [2/2] Iniciando Frontend (App)...
start "Sorteador APP" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   TUDO PRONTO!
echo   Acesse o App em: http://localhost:3000
echo ===================================================
echo.
pause
