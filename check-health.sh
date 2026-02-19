#!/bin/bash

# VeriOrganic Application Health Check Script
# This script checks if all services are running properly

echo "🔍 VeriOrganic Application Health Check"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Hardhat Node
echo -n "1. Hardhat Node (http://127.0.0.1:8545)... "
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
   http://127.0.0.1:8545 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not Running${NC}"
  echo "   → Start with: cd blockchain && npx hardhat node"
  ERRORS=$((ERRORS + 1))
fi

# Check 2: Frontend Server
echo -n "2. Frontend Server (http://localhost:3000)... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not Running${NC}"
  echo "   → Start with: cd frontend && npm run dev"
  ERRORS=$((ERRORS + 1))
fi

# Check 3: Smart Contract Deployment
echo -n "3. Smart Contract Deployment... "
if [ -f "blockchain/deployed.json" ]; then
  CONTRACT_ADDRESS=$(grep -o '"contractAddress": "[^"]*' blockchain/deployed.json | cut -d'"' -f4)
  echo -e "${GREEN}✓ Deployed${NC}"
  echo "   Address: $CONTRACT_ADDRESS"
else
  echo -e "${RED}✗ Not Deployed${NC}"
  echo "   → Deploy with: cd blockchain && npx hardhat run scripts/deploy.ts --network localhost"
  ERRORS=$((ERRORS + 1))
fi

# Check 4: Environment Files
echo -n "4. Environment Configuration... "
if [ -f "frontend/.env.local" ] && [ -f "blockchain/.env" ]; then
  echo -e "${GREEN}✓ Configured${NC}"
  
  # Check if contract address matches
  if [ -f "blockchain/deployed.json" ]; then
    DEPLOYED_ADDRESS=$(grep -o '"contractAddress": "[^"]*' blockchain/deployed.json | cut -d'"' -f4)
    ENV_ADDRESS=$(grep NEXT_PUBLIC_CONTRACT_ADDRESS frontend/.env.local | cut -d'=' -f2)
    
    if [ "$DEPLOYED_ADDRESS" = "$ENV_ADDRESS" ]; then
      echo "   Contract addresses match ✓"
    else
      echo -e "   ${YELLOW}⚠ Contract address mismatch${NC}"
      echo "     Deployed: $DEPLOYED_ADDRESS"
      echo "     Frontend: $ENV_ADDRESS"
    fi
  fi
else
  echo -e "${RED}✗ Missing${NC}"
  if [ ! -f "frontend/.env.local" ]; then
    echo "   → Create frontend/.env.local"
  fi
  if [ ! -f "blockchain/.env" ]; then
    echo "   → Create blockchain/.env"
  fi
  ERRORS=$((ERRORS + 1))
fi

# Check 5: Node Modules
echo -n "5. Dependencies... "
DEPS_OK=true
if [ ! -d "blockchain/node_modules" ]; then
  echo -e "${RED}✗ Blockchain dependencies not installed${NC}"
  echo "   → Run: cd blockchain && npm install"
  DEPS_OK=false
  ERRORS=$((ERRORS + 1))
fi
if [ ! -d "frontend/node_modules" ]; then
  echo -e "${RED}✗ Frontend dependencies not installed${NC}"
  echo "   → Run: cd frontend && npm install"
  DEPS_OK=false
  ERRORS=$((ERRORS + 1))
fi
if [ "$DEPS_OK" = true ]; then
  echo -e "${GREEN}✓ Installed${NC}"
fi

# Check 6: Compiled Contracts
echo -n "6. Compiled Contracts... "
if [ -d "blockchain/artifacts" ] && [ -d "blockchain/typechain-types" ]; then
  echo -e "${GREEN}✓ Compiled${NC}"
else
  echo -e "${RED}✗ Not Compiled${NC}"
  echo "   → Run: cd blockchain && npx hardhat compile"
  ERRORS=$((ERRORS + 1))
fi

# Check 7: Demo Data
echo -n "7. Demo Data (QR Codes)... "
if [ -d "frontend/public/qrcodes" ] && [ "$(ls -A frontend/public/qrcodes 2>/dev/null)" ]; then
  QR_COUNT=$(ls frontend/public/qrcodes/*.png 2>/dev/null | wc -l | tr -d ' ')
  echo -e "${GREEN}✓ Generated${NC}"
  echo "   QR codes: $QR_COUNT"
else
  echo -e "${YELLOW}⚠ Not Generated${NC}"
  echo "   → Run: cd blockchain && CONTRACT_ADDRESS=<address> npx hardhat run scripts/seed-data-enhanced.ts --network localhost"
fi

echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Application is ready.${NC}"
  echo ""
  echo "📱 Access the application:"
  echo "   → Frontend:     http://localhost:3000"
  echo "   → Diagnostics:  http://localhost:3000/diagnostics"
  echo "   → Farmer:       http://localhost:3000/farmer"
  echo ""
  echo "🔧 Test Accounts (import to MetaMask):"
  echo "   → Farmer:  0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  echo "   → See METAMASK_SETUP.md for full list"
  exit 0
else
  echo -e "${RED}✗ $ERRORS check(s) failed. Please fix the issues above.${NC}"
  exit 1
fi
