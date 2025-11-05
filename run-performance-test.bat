@echo off
REM Script để chạy comparison test giữa BEFORE và AFTER Redis (Windows)
REM Usage: npm run test:performance

echo ╔════════════════════════════════════════════════════════════╗
echo ║   📊 PERFORMANCE TEST: BEFORE vs AFTER REDIS              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check MongoDB
echo 🔍 Checking MongoDB...
mongosh --eval "db.runCommand({ ping: 1 })" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is NOT running. Please start MongoDB first!
    exit /b 1
)

REM Check Redis
echo 🔍 Checking Redis...
redis-cli -a redis_password_2024 ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is running
) else (
    echo ❌ Redis is NOT running. Please start Redis first!
    echo    Run: docker-compose up -d redis
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo.

REM Run BEFORE Redis test
echo 🔴 Running: BEFORE Redis Test...
echo.
call npx ts-node src/test-performance-before-redis.ts

echo.
echo ════════════════════════════════════════════════════════════
echo Press any key to continue with AFTER Redis test...
pause >nul

REM Run AFTER Redis test
echo 🔵 Running: AFTER Redis Test...
echo.
call npx ts-node src/test-performance-after-redis.ts

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ ALL TESTS COMPLETED                                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📝 See detailed results above
echo 📖 Read more: docs/redis-implementation/GUIDE_SESSION/PERFORMANCE-TEST-GUIDE.md
