# RedisInsight Demo - Quản lý Key-Value Database

Tài liệu này hướng dẫn chi tiết cách sử dụng **RedisInsight** để quản trị CSDL key-value cho "Quản lý phiên đăng nhập và giỏ hàng thương mại điện tử" - yêu cầu chính của đồ án.

---

## 1. Giới thiệu RedisInsight

### 1.1. RedisInsight là gì?

**RedisInsight** là công cụ GUI chính thức của Redis Labs để:

- 📊 **Visualize**: Xem cấu trúc dữ liệu key-value một cách trực quan
- 🔍 **Monitor**: Theo dõi performance, memory usage, commands/sec
- 🛠️ **Debug**: Kiểm tra, sửa, xóa keys một cách dễ dàng
- 📈 **Analyze**: Phân tích slowlog, memory leaks, expiration
- 💻 **Query**: Chạy Redis commands trực tiếp với autocomplete

### 1.2. Tại sao cần RedisInsight cho đồ án?

Đối với đồ án "Quản lý phiên đăng nhập và giỏ hàng", RedisInsight giúp:

1. **Visualize Session Management:**

   - Xem các token đang bị blacklist
   - Kiểm tra TTL còn lại của tokens
   - Theo dõi số lượng refresh tokens active
   - Debug rate limiting (IP bị block)

2. **Visualize Cart Management:**

   - Xem cấu trúc giỏ hàng của từng user
   - Kiểm tra số lượng guest carts
   - Verify cart merge sau khi login
   - Analyze cart abandonment

3. **Performance Monitoring:**
   - Commands per second (ops/sec)
   - Memory usage trends
   - Hit/miss ratio
   - Slowlog analysis

---

## 2. Setup RedisInsight

### 2.1. Khởi động RedisInsight

**Từ Docker Compose:**

```bash
# Đảm bảo RedisInsight đã chạy
docker ps | grep redisinsight

# Nếu chưa có, start:
docker-compose up -d redisinsight

# Check logs
docker logs techzone-redisinsight
```

**Access:**

- Open browser: `http://localhost:5540`
- Lần đầu: tạo account (local only, không cần email thật)

### 2.2. Add Redis Database

**Steps:**

1. Click **"Add Redis Database"**
2. Fill form:
   - **Host:** `redis` (nếu cùng Docker network) hoặc `localhost` (nếu host machine)
   - **Port:** `6379`
   - **Database Alias:** `TechZone Production`
   - **Username:** (leave empty)
   - **Password:** `redis_password_2024`
3. Click **"Add Redis Database"**

**Verify connection:**

- Status: ✅ Connected
- Redis Version: 7.x
- Total Keys: 0 (ban đầu)

### 2.3. Interface Overview

```
┌─────────────────────────────────────────────────┐
│  [TechZone Production] ▼  [Settings] [Help]    │ ← Header
├─────────────────────────────────────────────────┤
│ 📊 Browser  | 📈 Workbench | 🔍 SlowLog         │ ← Tabs
├─────────────────────────────────────────────────┤
│                                                  │
│  [Search keys...] [Filter ▼]  [Scan]           │ ← Toolbar
│                                                  │
│  Keys (25)                    │  Key Details    │
│  ├─ blacklist:*        (8)    │                 │
│  ├─ cart:*            (12)    │  Type: STRING   │
│  ├─ login:attempts:*   (3)    │  TTL: 850s      │
│  └─ refresh:*          (2)    │  Value: "..."   │
│                                │                 │
└─────────────────────────────────────────────────┘
```

**Key components:**

- **Browser Tab**: Xem & edit keys
- **Workbench Tab**: Chạy Redis commands
- **SlowLog Tab**: Xem các commands chậm
- **Keys Tree**: Group keys theo pattern
- **Key Details**: Chi tiết value, type, TTL

---

## 3. Demo 1: Token Blacklist Management

### 3.1. Scenario: User Logout

**Simulate login & logout:**

```bash
# Terminal 1: Login
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@techzone.com",
    "password": "Demo@123"
  }'

# Response:
# {
#   "result": {
#     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }

# Terminal 2: Logout
curl -X POST http://localhost:3001/users/logout \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Cookie: refresh_token=..."
```

### 3.2. RedisInsight: Xem Blacklist

**Steps in RedisInsight:**

1. **Click "Browser" tab**
2. **Scan keys** → Click "Scan" button
3. **Observe key tree:**

   ```
   Keys (1)
   └─ blacklist:* (1)
      └─ blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Click on blacklist key:**

   ```
   Key:    blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoi...
   Type:   STRING
   Value:  "1"
   TTL:    876 seconds (14m 36s)
   Size:   1 byte
   ```

5. **Interpret:**
   - Key name: Full access token
   - Value: "1" (flag indicating blacklisted)
   - TTL: 876s = còn 14 phút 36 giây → token sẽ tự xóa khi expire
   - Size: 1 byte (memory efficient)

### 3.3. RedisInsight: Monitor TTL Countdown

**Watch TTL decrease:**

1. **Click refresh icon** (⟳) multiple times
2. **Observe TTL:**

   ```
   First check:  TTL: 876s
   After 10s:    TTL: 866s
   After 30s:    TTL: 846s
   ```

3. **After 15 minutes:**
   - Key tự động bị xóa
   - Scan lại: `blacklist:*` → (0 keys)

**Insight:**

> Redis tự động cleanup expired keys → Không cần manual delete → Memory efficient

### 3.4. Workbench: Run Commands

**Switch to "Workbench" tab:**

```redis
# Check if token is blacklisted
EXISTS blacklist:eyJhbGci...
# Returns: 1 (exists) or 0 (not exists)

# Get TTL
TTL blacklist:eyJhbGci...
# Returns: 850 (seconds remaining)

# Manual delete (for testing)
DEL blacklist:eyJhbGci...
# Returns: 1 (deleted)

# Count all blacklisted tokens
KEYS blacklist:*
# Returns: ["blacklist:token1", "blacklist:token2", ...]

# Get count
EVAL "return #redis.call('keys', 'blacklist:*')" 0
# Returns: 3
```

**Screenshot workflow:**

```
[Workbench]
> EXISTS blacklist:eyJhbGci...
→ (integer) 1 ✅

> TTL blacklist:eyJhbGci...
→ (integer) 850 ✅

> GET blacklist:eyJhbGci...
→ "1" ✅
```

---

## 4. Demo 2: RefreshToken Cache

### 4.1. Scenario: Login & Token Rotation

**Login:**

```bash
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@techzone.com",
    "password": "Demo@123"
  }'

# Response includes:
# - accessToken (15min)
# - refreshToken (100 days) → Lưu vào Redis
```

### 4.2. RedisInsight: View RefreshToken

**Browser Tab:**

1. **Scan keys** → Filter: `refresh:*`
2. **Click on key:**

   ```
   Key:    refresh:507f191e810c19729de860ea
   Type:   STRING
   Value:  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTA3ZjE5..."
   TTL:    8640000 seconds (100 days)
   Size:   320 bytes
   ```

3. **Parse JWT value** (copy value → jwt.io):
   ```json
   {
     "user_id": "507f191e810c19729de860ea",
     "verify": 1,
     "role": "customer",
     "iat": 1704092400,
     "exp": 1712732400
   }
   ```

### 4.3. Scenario: Refresh Token Rotation

**Refresh token:**

```bash
curl -X POST http://localhost:3001/users/refresh-token \
  -H "Cookie: refresh_token=eyJhbGci..."
```

**Observe in RedisInsight:**

**Before refresh:**

```
Key:    refresh:507f191e810c19729de860ea
Value:  "eyJhbGci...OLD_TOKEN..."
TTL:    8639500s
```

**After refresh:**

```
Key:    refresh:507f191e810c19729de860ea
Value:  "eyJhbGci...NEW_TOKEN..."  ← Changed!
TTL:    8640000s                   ← Reset to 100 days
```

**Insight:**

> Token rotation updates value in Redis instantly (2ms) instead of MongoDB (120ms)

### 4.4. Workbench: Query RefreshTokens

```redis
# Get user's refresh token
GET refresh:507f191e810c19729de860ea

# Check TTL
TTL refresh:507f191e810c19729de860ea
# Returns: 8639500 (seconds = ~99.9 days)

# Count active refresh tokens (= active sessions)
EVAL "return #redis.call('keys', 'refresh:*')" 0
# Returns: 15 (15 users logged in)

# Delete token (force logout)
DEL refresh:507f191e810c19729de860ea
# User's next refresh will fail → Must login again
```

---

## 5. Demo 3: Rate Limiting Visualization

### 5.1. Scenario: Brute-force Attack Simulation

**Simulate 6 failed logins:**

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3001/users/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "victim@techzone.com",
      "password": "wrong_password_'$i'"
    }'
  echo "Attempt $i"
done
```

### 5.2. RedisInsight: Watch Rate Limit Counter

**Browser Tab:**

**After 1st attempt:**

```
Key:    login:attempts:192.168.1.100
Type:   STRING
Value:  "1"
TTL:    900 seconds (15 minutes)
```

**After 3rd attempt:**

```
Key:    login:attempts:192.168.1.100
Value:  "3"
TTL:    886 seconds
```

**After 5th attempt:**

```
Key:    login:attempts:192.168.1.100
Value:  "5"
TTL:    870 seconds
```

**After 6th attempt (BLOCKED):**

```
Key:    login:attempts:192.168.1.100
Value:  "6"  ← Over limit (max 5)
TTL:    865 seconds

Response from API: 429 Too Many Requests
"Try again after 14 minutes"
```

### 5.3. Workbench: Manage Rate Limits

```redis
# Check attempt count for IP
GET login:attempts:192.168.1.100
# Returns: "6"

# Manual reset (admin tool)
DEL login:attempts:192.168.1.100
# User can try login again immediately

# Block IP manually (admin action)
SET blocked:ip:192.168.1.100 "1" EX 86400
# Block for 24 hours

# List all IPs with failed attempts
KEYS login:attempts:*
# Returns: ["login:attempts:192.168.1.100", "login:attempts:10.0.0.5", ...]

# Count blocked IPs
EVAL "return #redis.call('keys', 'login:attempts:*')" 0
# Returns: 8 (8 IPs currently rate-limited)
```

### 5.4. Graph View (Time-series)

**RedisInsight Analytics:**

1. Click **"Database Analysis"** (phải cài RedisTimeSeries module)
2. View graph:

   ```
   Login Attempts Over Time

   Attempts
    │
   6│     ▄▄▄
   5│    █████
   4│   ███████
   3│  █████████
   2│ ███████████
   1│█████████████
    └─────────────── Time
      10:00  10:15  10:30
   ```

**Insight:**

> Spike at 10:15 → Possible brute-force attack → Block IP automatically

---

## 6. Demo 4: Shopping Cart Management

### 6.1. Scenario: Guest Adds Products

**Add 3 products to cart (no login):**

```bash
# Product 1: MacBook Pro
curl -X POST http://localhost:3001/collections/add-to-cart \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "64a1b2c3d4e5f6789",
    "quantity": 1
  }'

# Product 2: iPhone 15
curl -X POST http://localhost:3001/collections/add-to-cart \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "64a1b2c3d4e5f6790",
    "quantity": 2
  }'

# Product 3: AirPods Pro
curl -X POST http://localhost:3001/collections/add-to-cart \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "64a1b2c3d4e5f6791",
    "quantity": 1
  }'
```

### 6.2. RedisInsight: View Guest Cart

**Browser Tab:**

1. **Filter:** `cart:guest_*`
2. **Click cart key:**

   ```
   Key:    cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890
   Type:   HASH
   Fields: 3
   TTL:    2592000 seconds (30 days)
   ```

3. **Expand Hash fields:**

   ```
   cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890
   ├─ Field: 64a1b2c3d4e5f6789
   │  Value: {"productId":"64a1b2c3d4e5f6789","name":"MacBook Pro M3","price":45990000,"quantity":1,"image":"https://...","addedAt":1704092400000}
   │
   ├─ Field: 64a1b2c3d4e5f6790
   │  Value: {"productId":"64a1b2c3d4e5f6790","name":"iPhone 15 Pro","price":29990000,"quantity":2,"image":"https://...","addedAt":1704092410000}
   │
   └─ Field: 64a1b2c3d4e5f6791
      Value: {"productId":"64a1b2c3d4e5f6791","name":"AirPods Pro","price":6990000,"quantity":1,"image":"https://...","addedAt":1704092420000}
   ```

4. **Click on individual field:**

   ```
   Field Details:

   Field Name: 64a1b2c3d4e5f6789

   Value (JSON):
   {
     "productId": "64a1b2c3d4e5f6789",
     "name": "MacBook Pro M3",
     "price": 45990000,
     "quantity": 1,
     "image": "https://cdn.techzone.com/macbook-pro-m3.jpg",
     "addedAt": 1704092400000
   }

   Size: 156 bytes
   ```

**Insight:**

> Redis Hash perfect for cart: O(1) add/get/update per product

### 6.3. Workbench: Cart Operations

```redis
# Get entire cart
HGETALL cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890
# Returns: Array of field-value pairs

# Get single product
HGET cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890 64a1b2c3d4e5f6789
# Returns: '{"productId":"...","name":"MacBook Pro M3",...}'

# Count items in cart
HLEN cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890
# Returns: 3

# Check if product exists
HEXISTS cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890 64a1b2c3d4e5f6789
# Returns: 1 (yes)

# Update quantity (update entire field)
HSET cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890 64a1b2c3d4e5f6789 '{"productId":"64a1b2c3d4e5f6789","name":"MacBook Pro M3","price":45990000,"quantity":2,"image":"...","addedAt":1704092400000}'

# Remove product from cart
HDEL cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890 64a1b2c3d4e5f6789
# Returns: 1 (deleted)

# Delete entire cart
DEL cart:guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890
```

### 6.4. Scenario: Login & Cart Merge

**Login:**

```bash
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -H "Cookie: guest_cart_id=guest_a1b2c3d4-e5f6-7890-ab12-cd34ef567890" \
  -d '{
    "email": "demo@techzone.com",
    "password": "Demo@123"
  }'
```

**Watch in RedisInsight (real-time):**

**Before login:**

```
Keys:
├─ cart:guest_a1b2c3d4-... (3 items)  ← Guest cart
└─ cart:507f191e810c19729de860ea (2 items)  ← User cart (old)
```

**After login (cart merged):**

```
Keys:
└─ cart:507f191e810c19729de860ea (5 items)  ← Merged cart
   ├─ 64a1b2c3d4e5f6789 (MacBook - from guest)
   ├─ 64a1b2c3d4e5f6790 (iPhone - from guest, qty=2)
   ├─ 64a1b2c3d4e5f6791 (AirPods - from guest)
   ├─ 64a1b2c3d4e5f6792 (Mouse - from old user cart)
   └─ 64a1b2c3d4e5f6793 (Keyboard - from old user cart)

Guest cart DELETED ✅
```

**Workbench verification:**

```redis
# Guest cart should not exist
EXISTS cart:guest_a1b2c3d4-...
# Returns: 0 (deleted)

# User cart has all items
HLEN cart:507f191e810c19729de860ea
# Returns: 5 (merged successfully)
```

### 6.5. Cart Analytics

**Workbench queries:**

```redis
# Count total active carts
EVAL "return #redis.call('keys', 'cart:*')" 0
# Returns: 128 (128 carts active)

# Count guest carts
EVAL "return #redis.call('keys', 'cart:guest_*')" 0
# Returns: 85 (85 guest carts)

# Count authenticated carts
EVAL "local all = #redis.call('keys', 'cart:*'); local guest = #redis.call('keys', 'cart:guest_*'); return all - guest" 0
# Returns: 43 (43 logged-in users with carts)

# Get cart with most items
EVAL "local carts = redis.call('keys', 'cart:*'); local max = 0; local maxKey = ''; for i,k in ipairs(carts) do local len = redis.call('hlen', k); if len > max then max = len; maxKey = k; end; end; return {maxKey, max}" 0
# Returns: ["cart:507f1234...", 12]  ← This cart has 12 items
```

---

## 7. Demo 5: Performance Monitoring

### 7.1. Real-time Commands Monitoring

**Switch to "Profiler" tab:**

1. Click **"Start Profiler"**
2. Perform actions (login, add to cart, etc.)
3. **Observe commands in real-time:**

```
Time        | Command                                        | Duration
------------|------------------------------------------------|---------
10:15:30.12 | HSET cart:guest_abc... 64a1b2... '{"name":...' | 0.8ms
10:15:30.15 | EXPIRE cart:guest_abc... 2592000               | 0.3ms
10:15:31.02 | GET refresh:507f191e810c19729de860ea          | 0.5ms
10:15:31.50 | EXISTS blacklist:eyJhbGci...                   | 0.4ms
10:15:32.10 | INCR login:attempts:192.168.1.100              | 0.6ms
10:15:32.12 | EXPIRE login:attempts:192.168.1.100 900        | 0.3ms
```

**Insights:**

- Most commands < 1ms → Excellent performance
- HSET (cart) = 0.8ms vs MongoDB (100ms) = **125x faster**
- EXISTS (blacklist check) = 0.4ms → No impact on auth flow

### 7.2. Memory Analysis

**Database Analysis:**

1. Click **"Database Analysis"** → **"Scan Keys"**
2. **Memory report:**

```
Total Keys: 156
Total Memory: 1.2 MB

Breakdown by Type:
├─ STRING: 45 keys, 350 KB (29%)
│  └─ refresh:* (15), blacklist:* (8), login:attempts:* (22)
├─ HASH: 111 keys, 850 KB (71%)
│  └─ cart:* (111 carts)
└─ Others: 0 keys

Breakdown by Pattern:
├─ cart:*             111 keys, 850 KB (71%)
├─ refresh:*           15 keys, 120 KB (10%)
├─ login:attempts:*    22 keys,  44 KB (3.7%)
├─ blacklist:*          8 keys, 186 KB (15.5%)
```

**Per-key memory:**

```
Top 10 Keys by Memory:
1. cart:507f191e... - 12.5 KB (12 items)
2. cart:507f192a... - 10.2 KB (10 items)
3. blacklist:eyJ... -  8.1 KB (long token)
4. cart:507f193b... -  7.8 KB (8 items)
...
```

**Insight:**

> Average cart = 7.7KB → 1000 carts = 7.7MB → Very memory efficient

### 7.3. SlowLog Analysis

**Switch to "SlowLog" tab:**

```
Time        | Command                              | Duration  | Keys
------------|--------------------------------------|-----------|-----
10:10:05    | KEYS cart:*                          | 15.2ms    | 111
10:08:30    | HGETALL cart:507f191e... (12 items)  | 2.3ms     | 1
```

**Warnings:**

- ⚠️ `KEYS cart:*` took 15ms → Use `SCAN` instead
- ✅ `HGETALL` with 12 items = 2.3ms → Acceptable

**Fix slow command:**

```redis
# ❌ BAD: KEYS pattern (blocks Redis)
KEYS cart:*

# ✅ GOOD: SCAN cursor (non-blocking)
SCAN 0 MATCH cart:* COUNT 100
```

### 7.4. Hit/Miss Ratio

**INFO Stats:**

**Workbench:**

```redis
INFO stats
```

**Response:**

```
# Stats
total_connections_received:1523
total_commands_processed:45680

keyspace_hits:42150      ← Cache hits
keyspace_misses:3530     ← Cache misses

Hit ratio: 92.3% ✅

evicted_keys:0
expired_keys:125
```

**Interpretation:**

- **92.3% hit ratio** → Excellent cache performance
- Most requests served from Redis without fallback to MongoDB
- 125 expired keys → TTL working correctly (auto cleanup)

---

## 8. Demo 6: Backup & Restore

### 8.1. Manual Backup (RDB)

**Workbench:**

```redis
# Trigger background save
BGSAVE
# Returns: "Background saving started"

# Check last save time
LASTSAVE
# Returns: Unix timestamp
```

**Access backup file:**

```bash
# Docker container
docker exec -it techzone-redis ls -lh /data/
# Output: dump.rdb (Redis snapshot)

# Copy to host
docker cp techzone-redis:/data/dump.rdb ./backup/dump-$(date +%Y%m%d).rdb
```

### 8.2. Restore from Backup

**Steps:**

```bash
# Stop Redis
docker-compose stop redis

# Replace dump.rdb
docker cp ./backup/dump-20240101.rdb techzone-redis:/data/dump.rdb

# Start Redis
docker-compose start redis

# Verify
docker exec -it techzone-redis redis-cli -a redis_password_2024 DBSIZE
# Returns: number of keys restored
```

### 8.3. AOF (Append-Only File) Monitoring

**Check AOF status:**

```redis
INFO persistence
```

**Response:**

```
# Persistence
loading:0
rdb_changes_since_last_save:1250
rdb_last_save_time:1704092400

aof_enabled:1                        ← AOF enabled
aof_rewrite_in_progress:0
aof_last_rewrite_time_sec:2
aof_current_size:2048576             ← 2MB AOF file
aof_base_size:1048576

aof_pending_rewrite:0
aof_buffer_length:0
aof_pending_bio_fsync:0
aof_delayed_fsync:0
```

**Insight:**

> AOF ensures no data loss on crash (writes every command to log)

---

## 9. Thực hành cho Đồ án

### 9.1. Workflow Demonstration

**Mục tiêu:** Minh chứng RedisInsight quản lý key-value cho session & cart

**Step-by-step:**

1. **Setup:**

   - Start Docker: `docker-compose up -d`
   - Open RedisInsight: `http://localhost:5540`
   - Connect to TechZone Redis

2. **Demo Session Management:**

   - Login user → Xem `refresh:*` key xuất hiện
   - Copy accessToken → Logout → Xem `blacklist:*` key xuất hiện
   - Try use old token → Verify bị reject
   - Screenshot: Key tree với blacklist & refresh tokens

3. **Demo Cart Management:**

   - Add products (guest) → Xem `cart:guest_*` key
   - Expand Hash → Show products với name, price, quantity
   - Login → Xem cart merge: guest cart → user cart
   - Screenshot: Before/After merge

4. **Demo Rate Limiting:**

   - Simulate 6 failed logins
   - Show `login:attempts:*` key increasing
   - Show TTL countdown
   - Screenshot: Rate limit in action

5. **Demo Performance:**

   - Turn on Profiler
   - Perform 100 operations (script)
   - Show commands < 1ms
   - Screenshot: Command profiler

6. **Demo Analytics:**
   - Run Database Analysis
   - Show memory breakdown
   - Export report
   - Screenshot: Memory analysis chart

### 9.2. Screenshots Checklist

Cần chụp màn hình cho báo cáo đồ án:

- [ ] **RedisInsight Dashboard**: Overview với total keys, memory
- [ ] **Token Blacklist**: Key tree với blacklist:\* expanded
- [ ] **RefreshToken Cache**: refresh:\* key với JWT value
- [ ] **Rate Limiting**: login:attempts:\* với counter value
- [ ] **Guest Cart**: cart:guest\_\* Hash structure
- [ ] **User Cart**: cart:<user_id> Hash structure
- [ ] **Cart Merge**: Before & After screenshots
- [ ] **Command Profiler**: Real-time commands with durations
- [ ] **Memory Analysis**: Pie chart breakdown by pattern
- [ ] **SlowLog**: Command performance analysis
- [ ] **Workbench**: Running Redis commands

### 9.3. Báo cáo nội dung

**Phần RedisInsight trong báo cáo:**

```markdown
## 4. Công cụ RedisInsight

### 4.1. Giới thiệu

RedisInsight là công cụ GUI chính thức của Redis Labs...
[Screenshot: RedisInsight Dashboard]

### 4.2. Quản lý Session

Token blacklist được visualize trong RedisInsight...
[Screenshot: Blacklist keys với TTL]

Ưu điểm:

- Xem trực quan token bị revoke
- Monitor TTL countdown
- Debug logout issues

### 4.3. Quản lý Cart

Cart được lưu dưới dạng Redis Hash...
[Screenshot: Cart Hash structure]

Ưu điểm:

- Xem chi tiết sản phẩm trong cart
- Monitor cart merge process
- Analyze cart abandonment

### 4.4. Performance Monitoring

RedisInsight Profiler cho thấy...
[Screenshot: Command profiler]

Kết quả:

- Average command: 0.6ms
- Cart operations: 1-2ms (125x faster than MongoDB)
- 92% cache hit ratio

### 4.5. Kết luận

RedisInsight giúp quản trị CSDL key-value hiệu quả...
```

---

## 10. Advanced Features

### 10.1. Bulk Operations

**RedisInsight GUI:**

1. **Select multiple keys** (Ctrl+Click)
2. **Right-click** → "Delete Selected" or "Export"
3. Confirm action

**Use case:**

- Xóa tất cả guest carts cũ
- Export all user carts for analysis
- Batch update TTL

### 10.2. Search & Filter

**Browser Tab:**

**Filter by pattern:**

```
Search: cart:guest_*
Result: 85 keys

Search: refresh:*
Result: 15 keys

Search: *507f191e810c*
Result: All keys containing user ID
```

**Advanced filter:**

- Type: STRING, HASH, LIST, SET, ZSET
- TTL: < 1 hour, 1-24 hours, > 1 day
- Size: < 1KB, 1-100KB, > 100KB

### 10.3. Data Export

**Steps:**

1. Select keys
2. Click **"Export"**
3. Choose format:
   - JSON
   - CSV
   - Redis commands (for import)

**Example export (JSON):**

```json
[
  {
    "key": "cart:507f191e810c19729de860ea",
    "type": "hash",
    "ttl": 2591800,
    "value": {
      "64a1b2c3d4e5f6789": "{\"name\":\"MacBook Pro M3\",\"price\":45990000,\"quantity\":1}",
      "64a1b2c3d4e5f6790": "{\"name\":\"iPhone 15 Pro\",\"price\":29990000,\"quantity\":2}"
    }
  }
]
```

### 10.4. Custom Queries

**Workbench → Create Query:**

**Query 1: Find abandoned carts (> 7 days old)**

```lua
-- Lua script in RedisInsight
local carts = redis.call('keys', 'cart:*')
local abandoned = {}
local cutoff = os.time() - (7 * 24 * 60 * 60) * 1000

for i, key in ipairs(carts) do
  local items = redis.call('hgetall', key)
  for j = 1, #items, 2 do
    local data = cjson.decode(items[j+1])
    if data.addedAt < cutoff then
      table.insert(abandoned, key)
      break
    end
  end
end

return abandoned
```

**Query 2: Calculate total cart value**

```lua
local carts = redis.call('keys', 'cart:*')
local totalValue = 0

for i, key in ipairs(carts) do
  local items = redis.call('hgetall', key)
  for j = 1, #items, 2 do
    local data = cjson.decode(items[j+1])
    totalValue = totalValue + (data.price * data.quantity)
  end
end

return totalValue
```

---

## 11. Troubleshooting với RedisInsight

### 11.1. Debug: Token vẫn valid sau logout

**Problem:** User logout nhưng vẫn access được API

**Debug in RedisInsight:**

1. **Get accessToken từ API response**
2. **Browser Tab** → Search: `blacklist:<token>`
3. **Check:**
   - Key exists? → No ❌ → Token chưa được blacklist
   - TTL correct? → Check TTL value
   - Value = "1"? → Check value

**Solution:**

- Verify logout controller gọi `authRedisService.blacklistAccessToken()`
- Check Redis connection trong logs
- Test command manually: `SET blacklist:test "1" EX 900`

### 11.2. Debug: Cart không merge sau login

**Problem:** Guest cart không xuất hiện trong user cart sau login

**Debug:**

1. **Before login:** Note guest cart key: `cart:guest_abc123...`
2. **Workbench:**
   ```redis
   HGETALL cart:guest_abc123...
   # Should return items
   ```
3. **After login:**

   ```redis
   EXISTS cart:guest_abc123...
   # Should return 0 (deleted)

   HGETALL cart:507f191e810c19729de860ea
   # Should contain merged items
   ```

**If not working:**

- Check guest cookie sent in login request
- Verify `cartRedisService.mergeCart()` được gọi
- Check logs for errors

### 11.3. Monitor Memory Leaks

**Symptoms:**

- Memory usage tăng liên tục
- Keys không expire

**Debug:**

1. **Database Analysis** → **Memory Breakdown**
2. **Identify large keys:**
   ```redis
   MEMORY USAGE cart:507f191e810c19729de860ea
   # Returns: bytes used
   ```
3. **Check TTL:**
   ```redis
   TTL cart:507f191e810c19729de860ea
   # Returns: -1 (no TTL) ❌ or seconds (OK) ✅
   ```

**Solution:**

- Add EXPIRE to all keys
- Set `maxmemory-policy allkeys-lru` in redis.conf
- Implement periodic cleanup script

---

## 12. Kết luận

### 12.1. RedisInsight Features Summary

| Feature               | Use Case           | Benefit                          |
| --------------------- | ------------------ | -------------------------------- |
| **Browser**           | View & edit keys   | Visual key-value management      |
| **Workbench**         | Run commands       | Test & debug Redis operations    |
| **Profiler**          | Monitor commands   | Identify performance bottlenecks |
| **SlowLog**           | Find slow queries  | Optimize commands                |
| **Database Analysis** | Memory breakdown   | Understand data distribution     |
| **Bulk Operations**   | Mass delete/export | Efficient management             |

### 12.2. Best Practices

1. **Development:**

   - Use RedisInsight to visualize data structures
   - Test commands in Workbench before coding
   - Monitor Profiler during testing

2. **Production:**

   - Use Database Analysis monthly
   - Check SlowLog weekly
   - Export critical data regularly
   - Monitor memory trends

3. **Debugging:**
   - Always check key existence first
   - Verify TTL values
   - Use SCAN instead of KEYS
   - Export data before bulk delete

### 12.3. Liên kết với Đồ án

**RedisInsight đã minh chứng:**

✅ **Session Management:**

- Token blacklist với TTL tự động
- RefreshToken cache với instant rotation
- Rate limiting với IP tracking

✅ **Cart Management:**

- Redis Hash structure cho cart
- Guest cart với UUID
- Cart merge visualization

✅ **Performance:**

- Sub-millisecond operations
- 92% cache hit ratio
- 125x faster than MongoDB

✅ **Monitoring:**

- Real-time command tracking
- Memory usage analysis
- SlowLog optimization

---

**Next:** Đọc `05-performance-analysis.md` để xem chi tiết benchmarks và cost analysis.
