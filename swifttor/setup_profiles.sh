#!/bin/bash

# SwiftTow Role-Based System Setup Script
# This script sets up the profiles table and creates test users

echo "=============================================="
echo "SwiftTow Role-Based System Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "apps/api/main.py" ]; then
    echo -e "${RED}Error: Please run this script from the swifttor directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Running database migration...${NC}"
cd apps/api
python -m alembic upgrade head
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration completed successfully${NC}"
else
    echo -e "${RED}✗ Migration failed. Please check your database connection.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Creating test profiles...${NC}"
python seed_profiles.py --test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Test profiles created successfully${NC}"
else
    echo -e "${RED}✗ Profile creation failed${NC}"
    exit 1
fi

cd ../..

echo ""
echo "=============================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "Test Accounts Created:"
echo "  Customer: customer@test.com"
echo "  Driver:   driver@test.com"
echo "  Shop:     shop@test.com"
echo ""
echo "Portal URLs:"
echo "  Customer Portal: http://localhost:3000/customer"
echo "  Driver Portal:   http://localhost:3000/driver"
echo "  Admin Portal:    http://localhost:3000/admin"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Start the backend: cd apps/api && python main.py"
echo "  2. Start the frontend: cd apps/web && npm run dev"
echo "  3. Test each portal with the respective accounts"
echo ""
echo "For more information, see:"
echo "  - ROLE_BASED_ROUTING.md (detailed documentation)"
echo "  - ROUTES_REFERENCE.md (API and routes reference)"
echo "  - IMPLEMENTATION_SUMMARY.md (what was created)"
echo ""
