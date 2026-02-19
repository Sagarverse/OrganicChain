#!/bin/bash

# OrganicChain Quick Setup Script
# This script sets up the entire project in one command

set -e  # Exit on error

echo "🌿 OrganicChain Setup Script"
echo "================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Install blockchain dependencies
echo "📦 Installing blockchain dependencies..."
cd blockchain
npm install
echo "✅ Blockchain dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Setup environment files
echo "🔧 Setting up environment files..."
cd ../blockchain
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created blockchain/.env (please configure with your keys)"
else
    echo "ℹ️  blockchain/.env already exists"
fi

cd ../frontend
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
PINATA_API_KEY=
PINATA_SECRET_KEY=
PINATA_JWT=
EOF
    echo "✅ Created frontend/.env.local"
else
    echo "ℹ️  frontend/.env.local already exists"
fi

cd ..

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Start Hardhat local node:"
echo "   cd blockchain && npm run node"
echo ""
echo "2. In a new terminal, deploy contract:"
echo "   cd blockchain && npm run deploy:local"
echo ""
echo "3. Seed demo data (use the contract address from step 2):"
echo "   cd blockchain && CONTRACT_ADDRESS=<address> npm run seed"
echo ""
echo "4. Update frontend/.env.local with the contract address"
echo ""
echo "5. Start frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "6. Open http://localhost:3000"
echo ""
echo "🎉 Happy hacking!"
