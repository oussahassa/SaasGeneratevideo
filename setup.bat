@echo off
REM NexAI Project Setup Script for Windows
REM This script automates the setup process for the NexAI project

echo.
echo ========================================
echo NexAI Project Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js is installed: 
node -v

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd server
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd ..\client
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed

REM Go back to root
cd ..

REM Create .env.example if it doesn't exist
if not exist "server\.env.example" (
    echo.
    echo Creating .env.example file...
    (
        echo # Database
        echo DATABASE_URL=postgresql://user:password@host:port/database
        echo.
        echo # APIs
        echo GEMINI_API_KEY=your_gemini_key_here
        echo CLIPDROP_API_KEY=your_clipdrop_key_here
        echo CLERK_SECRET_KEY=your_clerk_secret_key_here
        echo.
        echo # Cloudinary
        echo CLOUDINARY_CLOUD_NAME=your_cloud_name_here
        echo CLOUDINARY_API_KEY=your_api_key_here
        echo CLOUDINARY_API_SECRET=your_api_secret_here
        echo.
        echo # Email Optional
        echo EMAIL_USER=your_email@gmail.com
        echo EMAIL_PASS=your_app_password
        echo.
        echo # Server
        echo PORT=3000
        echo NODE_ENV=development
    ) > server\.env.example

    echo [OK] Created .env.example file
    echo [WARNING] Please create server\.env and fill in the environment variables
)

REM Summary
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Copy server\.env.example to server\.env
echo 2. Fill in your environment variables
echo 3. Run database migrations using:
echo    server\migrations\001_init_database.sql
echo.
echo To start development:
echo.
echo Terminal 1 (Backend):
echo   cd server
echo   npm run server
echo.
echo Terminal 2 (Frontend):
echo   cd client
echo   npm run dev
echo.
echo Documentation:
echo - IMPLEMENTATION_GUIDE.md - Feature documentation
echo - SETUP_CHECKLIST.md - Setup instructions
echo - PROJECT_FILES.md - File summary
echo.
echo Happy coding! 
echo.
pause
