@echo off
call npm run build
echo Push the build live.
call pscp.exe -r C:\dev\worx\dist\* root@dev.steffbeckers.eu:/var/www/worx.steffbeckers.eu/public/
echo Worx app deployed to worx.steffbeckers.eu!
start "" https://worx.steffbeckers.eu/
pause
