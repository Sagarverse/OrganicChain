#!/bin/bash

# VeriOrganic Setup Verification Script
# Run this to check if all required files are present

echo "🔍 VeriOrganic Project Structure Verification"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
MISSING=0
PRESENT=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PRESENT++))
    else
        echo -e "${RED}✗${NC} $1 ${RED}(MISSING)${NC}"
        ((MISSING++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((PRESENT++))
    else
        echo -e "${RED}✗${NC} $1/ ${RED}(MISSING)${NC}"
        ((MISSING++))
    fi
}

echo "📁 Smart Contract Files:"
echo "------------------------"
check_file "blockchain/contracts/OrganicSupplyChain.sol"
check_file "blockchain/hardhat.config.ts"
check_file "blockchain/package.json"
check_file "blockchain/.env.example"
echo ""

echo "📜 Deployment Scripts:"
echo "------------------------"
check_file "blockchain/scripts/deploy.ts"
check_file "blockchain/scripts/seed-data.ts"
check_file "blockchain/scripts/seed-data-enhanced.ts"
echo ""

echo "🧪 Test Files:"
echo "------------------------"
check_file "blockchain/test/OrganicSupplyChain.comprehensive.test.ts"
echo ""

echo "🌐 Frontend Core Files:"
echo "------------------------"
check_file "frontend/package.json"
check_file "frontend/next.config.js"
check_file "frontend/tailwind.config.js"
check_file "frontend/tsconfig.json"
echo ""

echo "📄 Frontend Pages:"
echo "------------------------"
check_file "frontend/pages/index.tsx"
check_file "frontend/pages/_app.tsx"
check_file "frontend/pages/_document.tsx"
check_dir "frontend/pages/farmer"
check_dir "frontend/pages/consumer"
check_dir "frontend/pages/api"
echo ""

echo "🧩 Frontend Components:"
echo "------------------------"
check_dir "frontend/components/Layout"
check_dir "frontend/components/Dashboard"
check_dir "frontend/components/Blockchain"
check_dir "frontend/components/UI"
check_dir "frontend/components/Advanced"
echo ""

echo "🧪 Cypress Tests:"
echo "------------------------"
check_file "frontend/cypress.config.ts"
check_file "frontend/cypress/e2e/farmer-dashboard.cy.ts"
check_file "frontend/cypress/e2e/consumer-verification.cy.ts"
check_file "frontend/cypress/support/commands.ts"
check_file "frontend/cypress/support/e2e.ts"
echo ""

echo "📱 Mobile App:"
echo "------------------------"
check_dir "mobile-app"
check_file "mobile-app/package.json"
check_file "mobile-app/README.md"
echo ""

echo "🔄 CI/CD:"
echo "------------------------"
check_file ".github/workflows/test.yml"
echo ""

echo "📚 Documentation:"
echo "------------------------"
check_file "README.md"
check_file "PRODUCTION_READY.md"
check_file "INSTALLATION_GUIDE.md"
check_file "DEPLOYMENT_GUIDE.md"
check_file "COMPLETE_LOCAL_SETUP_GUIDE.md"
check_file "DEMO_SCRIPT.md"
check_file "JUDGES_CHEAT_SHEET.md"
check_file "PRESENTATION_SLIDES.md"
echo ""

echo "=============================================="
echo ""
echo -e "${GREEN}✓ Present:${NC} $PRESENT files/folders"
echo -e "${RED}✗ Missing:${NC} $MISSING files/folders"
echo ""

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}🎉 All required files are present!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Read COMPLETE_LOCAL_SETUP_GUIDE.md for full instructions"
    echo "2. Set up environment variables (.env files)"
    echo "3. Install dependencies: cd blockchain && npm install"
    echo "4. Start Hardhat node: npx hardhat node"
    echo "5. Deploy contract: npx hardhat run scripts/deploy.ts --network localhost"
    echo ""
else
    echo -e "${YELLOW}⚠️  Some files are missing!${NC}"
    echo ""
    echo "Please ensure you have all files from the previous prompts."
    echo "Check COMPLETE_LOCAL_SETUP_GUIDE.md for details on what each file does."
    echo ""
fi

# Check Node.js and npm versions
echo "=============================================="
echo "📦 Dependency Versions:"
echo "------------------------"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}  ⚠️  Warning: Node.js 18+ required${NC}"
    fi
else
    echo -e "${RED}✗${NC} Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not installed"
fi

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} Git: $GIT_VERSION"
else
    echo -e "${RED}✗${NC} Git not installed"
fi

echo ""

# Check if dependencies are installed
echo "=============================================="
echo "📦 Dependency Installation Status:"
echo "------------------------"

if [ -d "blockchain/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠️${NC}  Backend dependencies not installed"
    echo "   Run: cd blockchain && npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠️${NC}  Frontend dependencies not installed"
    echo "   Run: cd frontend && npm install"
fi

echo ""

# Check environment files
echo "=============================================="
echo "🔑 Environment Files:"
echo "------------------------"

if [ -f "blockchain/.env" ]; then
    echo -e "${GREEN}✓${NC} blockchain/.env exists"
    
    # Check for required variables (without showing values)
    if grep -q "PINATA" blockchain/.env 2>/dev/null; then
        echo -e "${GREEN}  ✓${NC} Pinata keys configured"
    else
        echo -e "${YELLOW}  ⚠️${NC}  Pinata keys not found"
    fi
else
    echo -e "${YELLOW}⚠️${NC}  blockchain/.env not found"
    echo "   Copy from .env.example and fill in your keys"
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.local exists"
else
    echo -e "${YELLOW}⚠️${NC}  frontend/.env.local not found"
    echo "   Create this file with contract address after deployment"
fi

echo ""
echo "=============================================="
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   COMPLETE_LOCAL_SETUP_GUIDE.md"
echo ""
