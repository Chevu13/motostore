#!/bin/bash
set -e

echo "🏍️  MotoStore.rs - Auto Setup"
echo "================================"

# Colors
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js nije instaliran. Instalirajte sa nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) pronađen${NC}"

# Install deps
echo ""
echo "📦 Instaliram pakete..."
npm install

# Generate Prisma client
echo ""
echo "🔧 Generišem Prisma klijent..."
npx prisma generate

# Push schema to Supabase
echo ""
echo "🗄️  Kreiram tabele u Supabase..."
npx prisma db push --accept-data-loss

# Seed data
echo ""
echo "🌱 Dodajem kategorije i proizvode..."
npm run db:seed

echo ""
echo -e "${GREEN}✅ GOTOVO!${NC}"
echo ""
echo "Pokrenite: npm run dev"
echo "Store:     http://localhost:3000/store"
echo "Admin:     http://localhost:3000/admin"
echo "Login:     admin@motostore.rs / admin123"
echo ""
