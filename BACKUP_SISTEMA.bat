@echo off
setlocal
set "DATA=%date:/=-%"
set "HORA=%time::=-%"
set "HORA=%HORA:,=-%"
set "DESTINO=Y:\Producao\CTIA\BACKUPS\Backup_%DATA%_%HORA%"

echo Criando Backup Total do Sistema CTIA...
echo Destino: %DESTINO%

mkdir "%DESTINO%"
xcopy "C:\Users\laboratorio.calcado\organizador" "%DESTINO%\sistema_codigo" /E /I /H /Y /EXCLUDE:exclude_list.txt
xcopy "Y:\Producao\CTIA\sistema" "%DESTINO%\dados_rede" /E /I /H /Y

echo.
echo ✅ Backup concluído com sucesso em %DESTINO%
pause
