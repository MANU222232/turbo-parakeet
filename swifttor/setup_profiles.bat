@echo off
REM SwiftTow Role-Based System Setup Script (Windows)
REM This script sets up the profiles table and creates test users

echo ==============================================
echo SwiftTow Role-Based System Setup
echo ==============================================
echo.

REM Check if we're in the right directory
if not exist "apps\api\main.py" (
    echo Error: Please run this script from the swifttor directory
    exit /b 1
)

echo Step 1: Running database migration...
cd apps\api
python -m alembic upgrade head
if errorlevel 1 (
    echo Migration failed. Please check your database connection.
    exit /b 1
)
echo [OK] Migration completed successfully
cd ..\..

echo.
echo Step 2: Creating test profiles...
cd apps\api
python seed_profiles.py --test
if errorlevel 1 (
    echo Profile creation failed
    exit /b 1
)
echo [OK] Test profiles created successfully
cd ..\..

echo.
echo ==============================================
echo Setup Complete!
echo ==============================================
echo.
echo Test Accounts Created:
echo   Customer: customer@test.com
echo   Driver:   driver@test.com
echo   Shop:     shop@test.com
echo.
echo Portal URLs:
echo   Customer Portal: http://localhost:3000/customer
echo   Driver Portal:   http://localhost:3000/driver
echo   Admin Portal:    http://localhost:3000/admin
echo.
echo Next Steps:
echo   1. Start the backend: cd apps\api ^&^& python main.py
echo   2. Start the frontend: cd apps\web ^&^& npm run dev
echo   3. Test each portal with the respective accounts
echo.
echo For more information, see:
echo   - ROLE_BASED_ROUTING.md ^(detailed documentation^)
echo   - ROUTES_REFERENCE.md ^(API and routes reference^)
echo   - IMPLEMENTATION_SUMMARY.md ^(what was created^)
echo.
pause
