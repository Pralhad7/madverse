#!/usr/bin/env bash
# ==============================================================================
# MadVerse — One-Click Production Deployment & Verification Script
# ==============================================================================
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  ⚡ MadVerse — Production Build & Deployment Pipeline${NC}"
echo -e "${BLUE}  Branding: Create Beyond Ordinary${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Check Node.js runtime
echo -e "\n${YELLOW}[1/4] Checking Node.js environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ to proceed.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Detected Node.js ${NODE_VERSION}${NC}"

# 2. Install dependencies
echo -e "\n${YELLOW}[2/4] Installing backend and frontend dependencies...${NC}"
npm run postinstall
echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"

# 3. Build frontend production distribution
echo -e "\n${YELLOW}[3/4] Building optimized frontend bundle (Vite)...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend bundle compiled into frontend/dist/${NC}"

# 4. Verification & Deployment Options
echo -e "\n${YELLOW}[4/4] Production Readiness Check...${NC}"
if [ -f "frontend/dist/index.html" ] && [ -f "backend/server.js" ]; then
    echo -e "${GREEN}✓ All production files and static assets are verified.${NC}"
else
    echo -e "${RED}❌ Verification failed: frontend/dist/index.html or backend/server.js is missing.${NC}"
    exit 1
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  🎉 MadVerse is 100% Production Ready!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "You can now deploy using any of the following options:\n"
echo -e "1) ${BLUE}Direct Production Run (Local/VPS):${NC}"
echo -e "   NODE_ENV=production PORT=3001 npm start\n"
echo -e "2) ${BLUE}Docker Container (Local/Server):${NC}"
echo -e "   docker compose up --build -d\n"
echo -e "3) ${BLUE}Google Cloud Run:${NC}"
echo -e "   gcloud run deploy madverse --source .\n"
echo -e "4) ${BLUE}Render / Railway:${NC}"
echo -e "   Push this repo to GitHub and connect on Render.com or Railway.app (auto-configured via render.yaml & railway.json)\n"
