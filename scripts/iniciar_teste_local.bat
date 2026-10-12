@echo off
title Base de Conhecimento - Teste Local
cd /d "%~dp0\.."
cls
echo ========================================================
echo    Base de Conhecimento - Conciliador Contabil
echo    Iniciando Servidor de Teste Local (Vite)
echo ========================================================
echo.
echo  - Diretorio: %CD%
echo  - Servidor Local: http://localhost:5173
echo.
echo  Abrindo o navegador automaticamente...
echo  (Para encerrar o servidor, feche esta janela ou aperte Ctrl+C)
echo ========================================================
echo.
npm run dev -- --open
pause
