#!/bin/bash

# Script để chạy comparison test giữa BEFORE và AFTER Redis
# Usage: npm run test:performance

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   📊 PERFORMANCE TEST: BEFORE vs AFTER REDIS              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check MongoDB
echo "🔍 Checking MongoDB..."
mongosh --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is NOT running. Please start MongoDB first!"
    exit 1
fi

# Check Redis
echo "🔍 Checking Redis..."
redis-cli -a redis_password_2024 ping > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is NOT running. Please start Redis first!"
    echo "   Run: docker-compose up -d redis"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Run BEFORE Redis test
echo "🔴 Running: BEFORE Redis Test..."
echo ""
npx ts-node src/test-performance-before-redis.ts

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Press Enter to continue with AFTER Redis test..."
read

# Run AFTER Redis test
echo "🔵 Running: AFTER Redis Test..."
echo ""
npx ts-node src/test-performance-after-redis.ts

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ ALL TESTS COMPLETED                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 See detailed results above"
echo "📖 Read more: docs/redis-implementation/GUIDE_SESSION/PERFORMANCE-TEST-GUIDE.md"
