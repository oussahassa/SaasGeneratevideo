#!/bin/bash

# NexAI Project Setup Script
# This script automates the setup process for the NexAI project

echo "🚀 Starting NexAI Project Setup..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"

# Install backend dependencies
echo -e "\n${BLUE}📦 Installing backend dependencies...${NC}"
cd server
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "\n${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../client
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Go back to root
cd ..

# Create .env template if it doesn't exist
if [ ! -f server/.env ]; then
    echo -e "\n${BLUE}📝 Creating .env template...${NC}"
    cat > server/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# APIs
GEMINI_API_KEY=your_gemini_key_here
CLIPDROP_API_KEY=your_clipdrop_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ Created .env.example file${NC}"
    echo -e "${BLUE}⚠️  Please create server/.env and fill in the environment variables${NC}"
fi

# Summary
echo -e "\n${GREEN}=================================="
echo "✓ Setup Complete!"
echo "==================================${NC}\n"

echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Copy server/.env.example to server/.env"
echo "2. Fill in your environment variables in server/.env"
echo "3. Run database migrations using the SQL file:"
echo "   server/migrations/001_init_database.sql"
echo ""
echo -e "${BLUE}🚀 To start development:${NC}"
echo "Terminal 1 (Backend):"
echo "  cd server && npm run server"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd client && npm run dev"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- IMPLEMENTATION_GUIDE.md - Feature documentation"
echo "- SETUP_CHECKLIST.md - Setup instructions"
echo "- PROJECT_FILES.md - File summary"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
