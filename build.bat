@echo off
echo Building project...
call pnpm run build

echo Copying files...
copy preview.png dist\
copy widget.json dist\
copy README.md dist\

echo Creating package.zip...
cd dist
powershell Compress-Archive -Path * -DestinationPath package.zip -Force
cd ..

echo Deploying to SiYuan...

set SIYUAN_PATH=E:\WorkSpace\Personal\Notes\data\widgets\siyuan-run-python-code

if exist "%SIYUAN_PATH%" (
    echo Cleaning old files...
    rmdir /s /q "%SIYUAN_PATH%"
)

echo Copying new files...
xcopy /E /I /Y dist "%SIYUAN_PATH%"

echo Build and deploy completed!
pause
