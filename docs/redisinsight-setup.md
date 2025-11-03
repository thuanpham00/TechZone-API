# Hướng dẫn RedisInsight — Cài đặt & Sử dụng

RedisInsight là công cụ GUI mạnh mẽ do Redis Labs phát triển, giúp quản trị, giám sát, debug và tối ưu hóa Redis database. Công cụ này đặc biệt hữu ích khi làm việc với session và cart trong hệ thống thương mại điện tử.

---

## 1. Giới thiệu RedisInsight

### 1.1. RedisInsight là gì?

- **Desktop application** và **web-based tool** để quản lý Redis
- Hỗ trợ tất cả deployment: standalone, cluster, sentinel, Redis Enterprise
- Miễn phí, cross-platform (Windows, macOS, Linux, Docker)
- Tích hợp nhiều công cụ: browser, CLI, profiler, memory analysis

### 1.2. Tại sao dùng RedisInsight?

- **Visual browser**: xem keys theo tree/list, filter theo pattern
- **CLI tích hợp**: chạy lệnh Redis trực tiếp không cần terminal riêng
- **Memory analysis**: phân tích memory usage, tìm top keys chiếm dung lượng
- **Slowlog viewer**: phát hiện queries chậm
- **Profiler**: monitor realtime commands
- **Support modules**: RedisJSON, RediSearch, RedisGraph, RedisTimeSeries
- **Bulk operations**: import/export, delete keys hàng loạt

---

## 2. Cài đặt RedisInsight

### 2.1. Docker (Khuyến nghị cho dev)

**Chạy nhanh với Docker:**

```bash
docker run -d --name redisinsight \
  -p 8001:8001 \
  -v redisinsight:/db \
  redislabs/redisinsight:latest
```

**Truy cập:**

- Mở browser: `http://localhost:8001`

**Trong docker-compose (tích hợp với Redis):**

```yaml
version: "3.8"
services:
  redis:
    image: redis:7-alpine
    container_name: tz_redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  redisinsight:
    image: redislabs/redisinsight:latest
    container_name: tz_redisinsight
    ports:
      - "8001:8001"
    volumes:
      - redisinsight-data:/db
    restart: unless-stopped
    depends_on:
      - redis

volumes:
  redis-data:
  redisinsight-data:
```

### 2.2. Windows

1. Tải installer từ [Redis.io](https://redis.io/docs/ui/insight/) hoặc [RedisInsight Releases](https://github.com/RedisInsight/RedisInsight/releases)
2. Chạy file `.exe` và làm theo hướng dẫn
3. Khởi động RedisInsight từ Start Menu
4. Mặc định mở tại: `http://localhost:8001`

### 2.3. macOS

**Homebrew:**

```bash
brew install --cask redisinsight
```

**Hoặc tải DMG:**

1. Download từ trang chính thức
2. Kéo vào Applications
3. Mở ứng dụng

### 2.4. Linux

**AppImage:**

```bash
wget https://download.redisinsight.redis.com/latest/RedisInsight-v2-linux-x86_64.AppImage
chmod +x RedisInsight-v2-linux-x86_64.AppImage
./RedisInsight-v2-linux-x86_64.AppImage
```

**Snap:**

```bash
sudo snap install redisinsight
```

---

## 3. Kết nối tới Redis Database

### 3.1. Thêm Redis Database lần đầu

**Bước 1: Mở RedisInsight**

- Desktop app hoặc browser `http://localhost:8001`

**Bước 2: Click "Add Redis Database"**

**Bước 3: Nhập thông tin kết nối**

**Local Redis (development):**

```
Host: 127.0.0.1 (hoặc localhost)
Port: 6379
Database Alias: Local Redis Dev
Username: (bỏ trống nếu không có)
Password: (bỏ trống nếu không có)
```

**Docker Redis (trong docker-compose):**

```
Host: redis (tên service trong docker-compose)
Port: 6379
Database Alias: TechZone Redis
```

**Remote Redis (production/staging):**

```
Host: your-redis-server.com
Port: 6379
Username: default (hoặc user cụ thể)
Password: your-secure-password
Use TLS: ✓ (nếu SSL/TLS enabled)
```

**Bước 4: Test Connection**

- Click "Test Connection" để kiểm tra
- Nếu thành công → click "Add Redis Database"

### 3.2. Multiple Databases

RedisInsight hỗ trợ quản lý nhiều Redis instances:

- Dev, Staging, Production
- Different projects
- Cluster nodes

Chỉ cần add từng database với alias riêng.

---

## 4. Các tính năng quan trọng

### 4.1. Browser — Duyệt và quản lý keys

**Filter keys theo pattern:**

```
session:*          # Tất cả session keys
cart:*             # Tất cả cart keys
cart:anon:*        # Cart của guest users
products:list:*    # Cache product listing
```

**Operations:**

- **View**: click vào key để xem value, type, TTL
- **Edit**: sửa value trực tiếp
- **Delete**: xóa key đơn lẻ hoặc hàng loạt
- **Set TTL**: thêm/sửa expiration time
- **Copy**: copy key name hoặc value

**Data types support:**

- String, Hash, List, Set, Sorted Set
- JSON (nếu có RedisJSON module)
- Stream, HyperLogLog

### 4.2. CLI — Command Line Interface

**Mở CLI tab:**

- Click "CLI" ở bottom panel
- Gõ lệnh Redis như terminal

**Ví dụ commands hữu ích:**

```redis
# Xem tất cả keys
KEYS *

# Đếm số keys
DBSIZE

# Xem thông tin server
INFO

# Xem memory usage
INFO memory

# Session commands
GET session:abc123
SET session:xyz456 '{"userId":100}' EX 1800
TTL session:abc123

# Cart commands (Hash)
HGETALL cart:100
HSET cart:100 item:1 '{"qty":2,"price":99.9}'
HDEL cart:100 item:1
DEL cart:100

# Cache commands
GET products:list:1
SETEX products:list:1 300 '[{"id":1,"name":"Product"}]'

# Debug commands
SLOWLOG GET 10
CLIENT LIST
```

### 4.3. Memory Analysis

**Chức năng:**

- Phân tích memory usage theo key pattern
- Tìm top keys chiếm memory nhiều nhất
- Xem distribution theo data type

**Cách dùng:**

1. Click "Analysis Tools" → "Memory"
2. Chọn database
3. Click "Analyze"
4. Xem report: top keys, memory by type, recommendations

**Use cases:**

- Tìm keys lớn cần tối ưu
- Phát hiện memory leaks (keys không expire)
- Quyết định eviction policy

### 4.4. Slowlog — Phát hiện queries chậm

**Xem slowlog:**

1. Click "Analysis Tools" → "Slowlog"
2. Xem danh sách commands chậm
3. Analyze: command, duration, timestamp

**Hoặc dùng CLI:**

```redis
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET
```

**Tối ưu:**

- Tránh KEYS \* trên production (dùng SCAN)
- Tránh HGETALL với hash lớn
- Optimize queries dựa trên slowlog

### 4.5. Profiler — Realtime monitoring

**Bật profiler:**

1. Click "Profiler" tab
2. Click "Start"
3. Thực hiện operations trên app
4. Xem realtime commands đang chạy

**Thông tin hiển thị:**

- Command name
- Arguments
- Execution time
- Client info

**Use cases:**

- Debug: xem commands nào đang được gọi
- Performance: identify bottlenecks
- Security audit: phát hiện commands lạ

### 4.6. Pub/Sub Monitor (tùy chọn)

Nếu dùng Redis Pub/Sub:

1. Click "Pub/Sub" tab
2. Subscribe channels
3. Monitor messages realtime
4. Publish test messages

### 4.7. RedisJSON Viewer (nếu có module)

**Install RedisJSON module:**

```bash
# Docker
docker run -p 6379:6379 redis/redis-stack-server:latest
```

**Trong RedisInsight:**

- JSON keys hiển thị với syntax highlighting
- Edit JSON với tree view
- JSONPath queries

---

## 5. Workflows cho Session & Cart

### 5.1. Debug Session

**Scenario: User không thể login hoặc session bị mất**

**Steps:**

1. Mở Browser, filter: `session:*`
2. Tìm session key theo userId hoặc sessionId
3. Click vào key → xem value (JSON)
4. Check:
   - TTL còn bao nhiêu? (nếu -1: không expire, nếu -2: đã xóa)
   - userId có đúng không?
   - Timestamp createdAt/lastSeen
5. CLI test:
   ```redis
   GET session:abc123
   TTL session:abc123
   EXPIRE session:abc123 3600  # extend TTL
   ```

### 5.2. Debug Cart

**Scenario: Cart items không hiển thị hoặc sai số lượng**

**Steps:**

1. Filter: `cart:*` hoặc `cart:anon:*`
2. Tìm cart theo userId/tempId
3. Xem hash fields:
   ```redis
   HGETALL cart:100
   # Kết quả: item:1 -> {"qty":2,"price":99.9}
   ```
4. Check từng item:
   - productId có đúng?
   - qty, price có hợp lệ?
5. Manual fix (nếu cần):
   ```redis
   HSET cart:100 item:1 '{"qty":5,"price":150}'
   HDEL cart:100 item:999  # xóa item lỗi
   ```

### 5.3. Test Merge Cart (anon → user)

**Steps:**

1. Tạo cart anon:
   ```redis
   HSET cart:anon:temp123 item:1 '{"qty":2}'
   HSET cart:anon:temp123 item:2 '{"qty":1}'
   ```
2. Tạo cart user:
   ```redis
   HSET cart:100 item:1 '{"qty":3}'
   ```
3. Merge (manual test):
   ```redis
   HGETALL cart:anon:temp123
   # Copy values, update cart:100
   HSET cart:100 item:2 '{"qty":1}'
   # item:1 qty: 3 + 2 = 5
   HSET cart:100 item:1 '{"qty":5}'
   DEL cart:anon:temp123
   ```
4. Verify:
   ```redis
   HGETALL cart:100
   EXISTS cart:anon:temp123  # should return 0
   ```

### 5.4. Clear expired/test data

**Xóa tất cả session (dev only):**

```redis
# Cẩn thận! Chỉ dùng trên dev
SCAN 0 MATCH session:* COUNT 100
# Với mỗi key, chạy DEL hoặc dùng RedisInsight bulk delete
```

**Trong RedisInsight:**

1. Filter: `session:*`
2. Select all
3. Click "Delete" → confirm

---

## 6. Best Practices & Tips

### 6.1. Development

✅ **Do:**

- Dùng RedisInsight để explore và understand data structure
- Set TTL cho test keys để tránh rác
- Sử dụng CLI để test commands trước khi code
- Export key samples để document

❌ **Don't:**

- Đừng chạy KEYS \* trên production (dùng SCAN)
- Đừng delete keys production qua RedisInsight trừ khi chắc chắn
- Đừng lưu credentials trong Redis without encryption

### 6.2. Production Monitoring

**Metrics cần theo dõi:**

- Memory usage (%)
- Evicted keys
- Hit/Miss ratio
- Connected clients
- Commands per second
- Network I/O

**Setup alerts:**

- Memory > 80%
- Evicted keys > threshold
- Slowlog có queries lạ

### 6.3. Security

**Kết nối an toàn:**

- Luôn dùng password cho Redis
- Enable TLS/SSL cho remote connections
- Không expose RedisInsight ra public
- Restrict IP access (firewall)

**RedisInsight permissions:**

- Read-only mode nếu chỉ cần monitor
- Different credentials cho dev/prod

---

## 7. Troubleshooting

### 7.1. Không kết nối được Redis

**Check:**

- Redis có đang chạy? `redis-cli ping` hoặc `docker ps`
- Port có đúng không? Default: 6379
- Firewall có block không?
- Password có đúng không?

**Docker networking:**

```bash
# Kiểm tra network
docker network inspect <network_name>

# Test connection từ container khác
docker exec -it tz_redisinsight redis-cli -h redis -p 6379 ping
```

### 7.2. Keys không hiển thị

**Nguyên nhân:**

- Filter pattern không đúng
- Keys đã expire (TTL hết)
- Connected to wrong database (DB 0, 1, 2...)

**Fix:**

```redis
# Xem tất cả keys
KEYS *

# Hoặc dùng SCAN (safe)
SCAN 0 COUNT 100

# Check DB
SELECT 0
DBSIZE
```

### 7.3. Memory cao bất thường

**Steps:**

1. Run Memory Analysis trong RedisInsight
2. Identify top keys
3. Check TTLs:
   ```redis
   TTL <key>
   # -1: no expiry (set TTL!)
   # -2: key not exists
   ```
4. Set eviction policy phù hợp:
   ```redis
   CONFIG GET maxmemory-policy
   CONFIG SET maxmemory-policy volatile-lru
   ```

---

## 8. Advanced Features

### 8.1. Bulk Operations

**Import data:**

1. Prepare file (CSV, JSON, Redis dump)
2. Tools → Import
3. Select file → Map fields → Import

**Export data:**

1. Filter keys cần export
2. Click "Export"
3. Choose format (JSON, CSV)

### 8.2. Command Templates

Lưu các commands thường dùng:

- Create template
- Add name, description, commands
- Run với params khác nhau

### 8.3. Workbench (Script Editor)

Viết và chạy Lua scripts, complex pipelines:

```lua
-- Example: increment all counters
local keys = redis.call('KEYS', 'counter:*')
for i, key in ipairs(keys) do
  redis.call('INCR', key)
end
return #keys
```

---

## 9. Resources

**Documentation:**

- [RedisInsight Official Docs](https://redis.io/docs/ui/insight/)
- [Redis Commands Reference](https://redis.io/commands/)

**Community:**

- [Redis Discord](https://discord.gg/redis)
- [Redis University](https://university.redis.com/)

**Video Tutorials:**

- [RedisInsight Quickstart](https://www.youtube.com/watch?v=preview)
- [Memory Analysis Deep Dive](https://www.youtube.com/watch?v=example)

---

## 10. Checklist — RedisInsight Setup

- [ ] Cài đặt RedisInsight (Docker/Desktop)
- [ ] Kết nối tới Redis dev/staging/prod
- [ ] Explore Browser, filter session:_, cart:_
- [ ] Thử CLI commands (GET, SET, HGETALL)
- [ ] Run Memory Analysis
- [ ] Check Slowlog
- [ ] Setup monitoring/alerts (optional)
- [ ] Document key patterns và TTLs
- [ ] Train team members sử dụng RedisInsight

---

**Tệp này cung cấp hướng dẫn đầy đủ về RedisInsight.** Kết hợp với các file khác trong `docs/` để triển khai hoàn chỉnh hệ thống session & cart với Redis.
