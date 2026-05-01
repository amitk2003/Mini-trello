@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM ----------------------------------------------------------------------------
@if "%DEBUG%" == "" @echo off
@REM Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.

@REM Find the project base dir
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@REM Maven path configuration
set MAVEN_OPTS=%MAVEN_OPTS% -Xms256m

@REM ─── Check if mvn is in PATH ────────────────────────────────────────────────
where mvn >nul 2>&1
if %ERRORLEVEL% == 0 (
    mvn %*
    goto :end
)

@REM ─── Try MAVEN_HOME ─────────────────────────────────────────────────────────
if defined MAVEN_HOME (
    "%MAVEN_HOME%\bin\mvn" %*
    goto :end
)

@REM ─── Try M2_HOME ────────────────────────────────────────────────────────────
if defined M2_HOME (
    "%M2_HOME%\bin\mvn" %*
    goto :end
)

echo.
echo ERROR: Maven is not installed or not in your PATH.
echo.
echo Please install Maven from: https://maven.apache.org/download.cgi
echo Then add the Maven bin directory to your PATH environment variable.
echo.
echo Alternatively, install Maven and set MAVEN_HOME or M2_HOME.
echo.
pause
exit /B 1

:end
if "%OS%"=="Windows_NT" endlocal
