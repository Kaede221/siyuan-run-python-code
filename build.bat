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
REM 修改下面的路径为你的思源笔记工作空间路径（数据目录）
REM 例如: C:\Users\YourName\Documents\SiYuan\data\widgets\run-python-code
REM 或者: D:\SiYuanWorkspace\data\widgets\run-python-code
set SIYUAN_PATH=E:\WorkSpace\Personal\Notes\data\widgets\run-python-code

if exist "%SIYUAN_PATH%" (
    echo Cleaning old files...
    rmdir /s /q "%SIYUAN_PATH%"
)

echo Copying new files...
xcopy /E /I /Y dist "%SIYUAN_PATH%"

echo Build and deploy completed!
pause
