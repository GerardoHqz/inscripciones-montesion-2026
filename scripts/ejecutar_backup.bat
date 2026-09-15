@echo off
:: ==============================================================================
:: Script Batch (.bat) para Tarea Programada de Windows
:: Respaldo de Base de Datos - Tabla 'inscripciones' (Monte Sión 2026)
:: ==============================================================================

echo [INFO] Ejecutando respaldo de la tabla 'inscripciones'...

:: Asegurar directorio del script
cd /d "%~dp0"

:: Ejecutar script de PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup_inscripciones.ps1"

if %errorlevel% equ 0 (
    echo.
    echo [EXITO] El respaldo fue generado correctamente en C:\inscripciones-montesion\
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo [ERROR] Ocurrio un fallo durante el respaldo. Revisa el archivo C:\inscripciones-montesion\backup_log.txt
    echo.
    pause
    exit /b 1
)
