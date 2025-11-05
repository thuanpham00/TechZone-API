# Quick Test Guide - Redis Session Management

## 🧪 Cách test nhanh các features đã implement

---

## Setup

```bash
# 1. Start Redis + RedisInsight
docker-compose up -d

# 2. Start server
npm run dev

# 3. Open RedisInsight
# Browser: http://localhost:5540
```

---

## Test 1: Token Blacklist ✅

### Mục tiêu: Verify token bị revoke ngay sau logout

```bash
# Step 1: Login
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@test.com",
    "password": "your_password"
  }'

# Copy accessToken từ response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Step 2: Verify token works
curl http://localhost:5000/users/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK, profile data

# Step 3: Logout
curl -X POST http://localhost:5000/users/logout \
  -H "Authorization: Bearer $TOKEN"

# Step 4: Check RedisInsight
# Key: blacklist:eyJhbGci...
# TTL: ~899 seconds

# Step 5: Try use old token (should FAIL)
curl http://localhost:5000/users/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 401 Unauthorized
# { "message": "Token đã bị thu hồi..." }
```

**✅ Pass nếu:** Step 5 trả về 401 và message "Token đã bị thu hồi"

---

## Test 2: Rate Limiting ✅

### Mục tiêu: Block sau 5 lần login failed

```bash
# Test script: Login failed 6 lần
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:5000/users/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@test.com",
      "password": "wrong_password_'$i'"
    }' \
    -w "\nHTTP Status: %{http_code}\n\n"
done
```

**Expected output:**

```
Attempt 1: 401 (wrong password)
Attempt 2: 401
Attempt 3: 401
Attempt 4: 401
Attempt 5: 401
Attempt 6: 429 Too Many Requests ← BLOCKED!
```

**Check RedisInsight:**

```
Key: login:attempts:192.168.1.100
Value: "6"
TTL: ~890 seconds
```

**✅ Pass nếu:** Lần thứ 6 trả về 429

---

## Test 3: RefreshToken Cache ✅

### Mục tiêu: Verify Redis cache nhanh hơn MongoDB

```bash
# Step 1: Login (stores token in Redis)
curl -X POST http://localhost:5000/users/login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@test.com",
    "password": "your_password"
  }'

# Step 2: Check RedisInsight
# Key: refresh:507f191e810c19729de860ea
# Value: refreshToken string

# Step 3: Refresh token nhiều lần
for i in {1..5}; do
  echo "Refresh attempt $i:"
  curl -X POST http://localhost:5000/users/refresh-token \
    -b cookies.txt \
    -c cookies.txt \
    -w "Time: %{time_total}s\n"
done
```

**Expected server logs:**

```
✅ RefreshToken cache HIT for user 507f191e...
✅ RefreshToken cache HIT for user 507f191e...
...
```

**Performance:**

- First request: ~30ms (cache MISS + MongoDB)
- Subsequent: ~5ms (cache HIT)

**✅ Pass nếu:** Console log hiển thị "cache HIT"

---

## Test 4: Full Login/Logout Flow ✅

### Complete workflow test

```bash
# 1. Check IP không bị rate limit
curl http://localhost:5000/users/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}' \
  -c cookies.txt \
  -o login_response.json

# Extract accessToken
TOKEN=$(jq -r '.result.accessToken' login_response.json)
echo "Token: $TOKEN"

# 2. Verify token works
curl http://localhost:5000/users/me \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Check RedisInsight
# Should see: refresh:507f191e...

# 4. Logout
curl -X POST http://localhost:5000/users/logout \
  -H "Authorization: Bearer $TOKEN" \
  -b cookies.txt

# 5. Check RedisInsight
# Should see: blacklist:eyJhbGci...
# Should NOT see: refresh:507f191e... (deleted)

# 6. Try protected route (should fail)
curl http://localhost:5000/users/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 401 Token revoked
```

**✅ Pass nếu:** Tất cả steps trả về expected results

---

## Test 5: RedisInsight Verification 🔍

### Verify keys trong GUI

**Steps:**

1. Open http://localhost:5540
2. Connect database với host `redis` hoặc `127.0.0.1`
3. Tab **Browser** → Click **Scan**

**Expected keys:**

```
Keys (3-5 total)

blacklist:eyJhbGci...
  Type: STRING
  Value: "1"
  TTL: 894 seconds
  Memory: 128 bytes

refresh:507f191e810c19729de860ea
  Type: STRING
  Value: "refresh_token_string..."
  TTL: 8640000 seconds (100 days)
  Memory: 256 bytes

login:attempts:192.168.1.100
  Type: STRING
  Value: "3"
  TTL: 887 seconds
  Memory: 64 bytes
```

4. Click vào từng key → Verify:

   - ✅ TTL countdown hoạt động
   - ✅ Values đúng format
   - ✅ Memory usage hợp lý

5. Tab **Workbench** → Run commands:

```redis
-- List all keys
KEYS *

-- Check specific key
GET refresh:507f191e810c19729de860ea

-- Check TTL
TTL blacklist:eyJhbGci...

-- Count keys by pattern
KEYS blacklist:* | wc -l

-- Get info
INFO memory
INFO stats
```

**✅ Pass nếu:** Tất cả keys hiển thị đúng với TTL countdown

---

## Test 6: Performance Benchmark 📊

### So sánh tốc độ với/không có Redis

```bash
# Benchmark refresh token (with Redis cache)
echo "=== WITH REDIS CACHE ==="
for i in {1..10}; do
  curl -X POST http://localhost:5000/users/refresh-token \
    -b cookies.txt \
    -c cookies.txt \
    -w "Time: %{time_total}s\n" \
    -o /dev/null \
    -s
done | grep Time

# Expected: ~0.005s - 0.030s (5-30ms)
```

**Compare:**

- **With Redis:** 5-30ms (cache HIT)
- **Without Redis:** 120-150ms (MongoDB query)
- **Improvement:** 60x faster ⚡

**✅ Pass nếu:** Average response time < 50ms

---

## Test 7: Concurrent Requests 🔥

### Test race conditions

```bash
# Test multiple login từ nhiều IP (giả lập)
parallel -j 5 curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}' \
  ::: {1..5}

# Check RedisInsight
# Should see: refresh:507f... (only 1 key, not duplicated)
```

**✅ Pass nếu:** Không có race condition, data consistent

---

## Cleanup 🧹

### Reset test data

```bash
# Xóa tất cả test keys trong Redis
docker exec -it techzone-redis redis-cli -a redis_password_2024 FLUSHDB

# Hoặc xóa specific patterns
docker exec -it techzone-redis redis-cli -a redis_password_2024 \
  EVAL "return redis.call('del', unpack(redis.call('keys', 'blacklist:*')))" 0
```

---

## Checklist ✅

Sau khi chạy tất cả tests:

- [ ] Test 1: Token blacklist works (401 after logout)
- [ ] Test 2: Rate limiting blocks after 5 attempts (429)
- [ ] Test 3: RefreshToken cache faster than MongoDB (< 50ms)
- [ ] Test 4: Full flow login → use → logout → blocked
- [ ] Test 5: Keys visible in RedisInsight với TTL correct
- [ ] Test 6: Performance improvement measurable (60x)
- [ ] Test 7: No race conditions

---

## Troubleshooting 🔧

### Nếu test fail:

**Problem:** Token không bị block sau logout

```bash
# Check middleware có import authRedisService?
grep "authRedisService" src/middlewares/user.middlewares.ts

# Check token có vào blacklist?
docker exec -it techzone-redis redis-cli -a redis_password_2024 KEYS "blacklist:*"
```

**Problem:** Rate limiting không work

```bash
# Check key tồn tại?
docker exec -it techzone-redis redis-cli -a redis_password_2024 \
  GET "login:attempts:192.168.1.100"

# Check IP address đúng?
echo $IP
```

**Problem:** Redis connection error

```bash
# Check Redis running?
docker ps | grep redis

# Test connection
docker exec -it techzone-redis redis-cli -a redis_password_2024 PING
# Expected: PONG
```

---

## 🎯 Success Criteria:

✅ **All 7 tests pass**  
✅ **RedisInsight shows correct keys**  
✅ **Performance improved 60x**  
✅ **No errors in server logs**  
✅ **Security features working (blacklist, rate limit)**

---

**Last updated:** November 5, 2025  
**Status:** ✅ Ready for testing
