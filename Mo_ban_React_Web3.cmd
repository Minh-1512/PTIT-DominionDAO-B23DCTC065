@echo off
cd /d "%~dp0web3-app"
set BROWSER=none
call npm.cmd start
pause
