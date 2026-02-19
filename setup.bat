@echo off
REM OrganicChain Quick Setup Script for Windows
REM This script sets up the entire project in one command

echo.
echo 🌿 OrganicChain Setup Script
echo ================================
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js %NODE_VERSION%
echo ✅ npm %NPM_VERSION%
echo.

REM Install blockchain dependencies
echo 📦 Installing blockchain dependencies...
cd blockchain
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install blockchain dependencies
    exit /b 1
)
echo ✅ Blockchain dependencies installed
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

REM Setup environment files
echo 🔧 Setting up environment files...
cd ..\blockchain
if not exist .env (
    copy .env.example .env
    echo ✅ Created blockchain\.env (please configure with your keys)
) else (
    echo ℹ️  blockchain\.env already exists
)

cd ..\frontend
if not exist .env.local (
    (
        echo NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
        echo NEXT_PUBLIC_CHAIN_ID=1337
        echo NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
        echo PINATA_API_KEY=
        echo PINATA_SECRET_KEY=
        echo PINATA_JWT=
    ) > .env.local
    echo ✅ Created frontend\.env.local
) else (
    echo ℹ️  frontend\.env.local already exists
)

cd ..

echo.
echo ================================
echo ✅ Setup Complete!
echo ================================
echo.
echo 📝 Next Steps:
echo.
echo 1. Start Hardhat local node:
echo    cd blockchain ^&^& npm run node
echo.
echo 2. In a new terminal, deploy contract:
echo    cd blockchain ^&^& npm run deploy:local
echo.
echo 3. Seed demo data (use the contract address from step 2):
echo    cd blockchain ^&^& set CONTRACT_ADDRESS=^<address^> ^&^& npm run seed
echo.
echo 4. Update frontend\.env.local with the contract address
echo.
echo 5. Start frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo 6. Open http://localhost:3000
echo.
echo 🎉 Happy hacking!
