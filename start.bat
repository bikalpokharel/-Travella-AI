@echo off
echo 🚀 Starting Travella AI...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ to continue.
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ to continue.
    pause
    exit /b 1
)

echo 🔧 Starting backend server...
cd backend
python -m venv venv 2>nul
call venv\Scripts\activate.bat 2>nul
pip install -r requirements.txt >nul 2>&1
start "Backend Server" cmd /k "python run.py"
cd ..

timeout /t 3 /nobreak >nul

echo 🎨 Starting frontend server...
cd frontend
npm install >nul 2>&1
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo ✅ Travella AI is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8002
echo 📚 API Docs: http://localhost:8002/docs
echo.
echo Press any key to exit...
pause >nul
