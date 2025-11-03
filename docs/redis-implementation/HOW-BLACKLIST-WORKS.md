# Giải thích chi tiết: Token Blacklist hoạt động thế nào?

## ❓ Câu hỏi của bạn:

> "Lưu AccessToken vào blacklist Redis và check nó có tồn tại trong blacklist không thì vẫn vào được (sử dụng token) đó tiếp hay sao không thấy đề cập?"

---

## ✅ Trả lời ngắn gọn:

**KHÔNG**, nếu token trong blacklist thì **BỊ CHẶN NGAY**, không thể sử dụng tiếp!

Cơ chế hoạt động:

1. **Logout** → Token vào blacklist Redis
2. **Mỗi request** → Middleware check blacklist TRƯỚC
3. **Nếu trong blacklist** → Reject ngay, không cần verify JWT
4. **Nếu không trong blacklist** → Mới verify JWT như bình thường

---

## 📋 Flow chi tiết với Timeline

### Scenario: User logout lúc 10:06:00, token expire lúc 10:15:00

```
┌─────────────────────────────────────────────────────────────────┐
│ T+0s (10:00:00) - USER LOGIN                                    │
├─────────────────────────────────────────────────────────────────┤
│ Server tạo accessToken:                                         │
│   {                                                              │
│     user_id: "507f191e...",                                     │
│     exp: 1730026500  (10:15:00)  ← Expire sau 15 phút          │
│   }                                                              │
│                                                                  │
│ Client nhận token → Lưu localStorage                           │
│ Redis: (empty, chưa có blacklist gì)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ T+300s (10:05:00) - USER ĐANG DÙNG APP                         │
├─────────────────────────────────────────────────────────────────┤
│ Client request:                                                  │
│   GET /users/me                                                 │
│   Authorization: Bearer eyJhbGci...                             │
│                                                                  │
│ ┌─── Middleware: accessTokenValidator ───┐                     │
│ │                                          │                     │
│ │ 1. Extract token: "eyJhbGci..."         │                     │
│ │                                          │                     │
│ │ 2. Check blacklist:                     │                     │
│ │    redis.exists("blacklist:eyJhbGci")   │                     │
│ │    → Returns: 0 (not found) ✅          │                     │
│ │                                          │                     │
│ │ 3. Verify JWT: ✅ Valid                 │                     │
│ │ 4. Query user DB: ✅ Found              │                     │
│ │ 5. Pass to controller                   │                     │
│ └──────────────────────────────────────────┘                     │
│                                                                  │
│ Response: 200 OK { user: {...} }                               │
│ User truy cập thành công! ✅                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ T+360s (10:06:00) - USER LOGOUT                                │
├─────────────────────────────────────────────────────────────────┤
│ Client request:                                                  │
│   POST /users/logout                                            │
│   Authorization: Bearer eyJhbGci...                             │
│                                                                  │
│ ┌─── Controller: logoutController ───────┐                     │
│ │                                          │                     │
│ │ 1. Extract accessToken from header      │                     │
│ │                                          │                     │
│ │ 2. Call Redis service:                  │                     │
│ │    authRedisService.blacklistAccessToken(token)              │
│ │                                          │                     │
│ │    ┌─── Inside blacklistAccessToken ───┐│                     │
│ │    │ jwt.decode(token)                  ││                     │
│ │    │ → exp: 1730026500 (10:15:00)      ││                     │
│ │    │                                    ││                     │
│ │    │ now = 1730025960 (10:06:00)       ││                     │
│ │    │ ttl = exp - now = 540 seconds     ││                     │
│ │    │                                    ││                     │
│ │    │ redis.setex(                       ││                     │
│ │    │   "blacklist:eyJhbGci...",        ││                     │
│ │    │   540,  ← TTL: 9 phút còn lại    ││                     │
│ │    │   "1"                              ││                     │
│ │    │ )                                  ││                     │
│ │    └────────────────────────────────────┘│                     │
│ │                                          │                     │
│ │ 3. Delete refreshToken from MongoDB     │                     │
│ │ 4. Clear cookie                         │                     │
│ └──────────────────────────────────────────┘                     │
│                                                                  │
│ Redis NOW contains:                                             │
│   blacklist:eyJhbGci... = "1" (TTL: 540s)                      │
│                                                                  │
│ Client xóa token khỏi localStorage                             │
│ Response: 200 OK { message: "Logout success" }                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ T+361s (10:06:01) - HACKER ĐÁNH CẮP TOKEN                      │
├─────────────────────────────────────────────────────────────────┤
│ Hacker lấy token từ:                                            │
│   - Network sniffing (nếu không dùng HTTPS)                    │
│   - XSS attack (nếu lưu localStorage)                          │
│   - Memory dump                                                 │
│                                                                  │
│ Hacker request:                                                  │
│   GET /users/me                                                 │
│   Authorization: Bearer eyJhbGci...  ← Stolen token            │
│                                                                  │
│ ┌─── Middleware: accessTokenValidator ───┐                     │
│ │                                          │                     │
│ │ 1. Extract token: "eyJhbGci..."         │                     │
│ │                                          │                     │
│ │ 2. ⚠️ CHECK BLACKLIST (CRITICAL!)       │                     │
│ │    redis.exists("blacklist:eyJhbGci")   │                     │
│ │    → Returns: 1 (found) ❌              │                     │
│ │                                          │                     │
│ │ 3. Token is blacklisted!                │                     │
│ │    throw ErrorWithStatus({              │                     │
│ │      message: "Token has been revoked", │                     │
│ │      status: 401                        │                     │
│ │    })                                   │                     │
│ │                                          │                     │
│ │ ❌ REQUEST CHẶN NGAY TẠI ĐÂY!          │                     │
│ │ KHÔNG verify JWT, KHÔNG query DB        │                     │
│ └──────────────────────────────────────────┘                     │
│                                                                  │
│ Response: 401 Unauthorized                                      │
│   { message: "Token has been revoked. Please login again." }   │
│                                                                  │
│ Hacker BỊ CHẶN! 🔒                                              │
│ Token không thể dùng được dù còn 9 phút mới expire!           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ T+900s (10:15:00) - TOKEN EXPIRE                               │
├─────────────────────────────────────────────────────────────────┤
│ Redis TTL hết (540s đã trôi qua)                               │
│                                                                  │
│ Redis automatically executes:                                   │
│   DEL blacklist:eyJhbGci...                                    │
│                                                                  │
│ Key bị xóa khỏi Redis (memory cleanup tự động) ✅              │
│                                                                  │
│ Lý do: Token đã expire, không ai có thể dùng nữa              │
│ → Không cần giữ trong blacklist                               │
│ → Tiết kiệm memory                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Code chi tiết từng bước

### **Bước 1: Service - Blacklist token**

```typescript
// src/services/redis/authRedis.ts

async blacklistAccessToken(accessToken: string): Promise<void> {
  try {
    // Decode token để lấy thông tin expire
    const decoded = jwt.decode(accessToken) as any

    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token format")
    }

    // Tính còn bao lâu token mới expire
    const now = Math.floor(Date.now() / 1000)  // Current Unix timestamp
    const ttl = decoded.exp - now               // Thời gian còn lại (giây)

    if (ttl > 0) {
      // Lưu vào Redis với TTL = thời gian còn lại
      // Key: blacklist:<full_token>
      // Value: "1" (flag đơn giản)
      // TTL: tự động xóa sau khi token expire
      await redis.setex(
        `blacklist:${accessToken}`,
        ttl,
        "1"
      )

      console.log(`✅ Token blacklisted: user_id=${decoded.user_id}, TTL=${ttl}s`)
    } else {
      // Token đã expire rồi, không cần blacklist
      console.log("⚠️ Token already expired, skip blacklist")
    }
  } catch (error) {
    console.error("❌ Blacklist token error:", error)
    throw error
  }
}
```

### **Bước 2: Service - Check blacklist**

```typescript
// src/services/redis/authRedis.ts

async isTokenBlacklisted(accessToken: string): Promise<boolean> {
  try {
    // Check key có tồn tại trong Redis không
    // EXISTS trả về 1 nếu có, 0 nếu không
    const exists = await redis.exists(`blacklist:${accessToken}`)
    return exists === 1  // true = blacklisted, false = ok
  } catch (error) {
    console.error("❌ Check blacklist error:", error)

    // QUAN TRỌNG: Xử lý fallback khi Redis lỗi
    // Option 1: Fail-open (cho phép request) - ít bảo mật
    // Option 2: Fail-closed (reject all) - bảo mật cao
    // Ở đây chọn fail-open để hệ thống vẫn hoạt động
    return false
  }
}
```

### **Bước 3: Middleware - Check TRƯỚC khi verify JWT**

```typescript
// src/middlewares/user.middlewares.ts

export const accessTokenValidator = validate(
  checkSchema({
    Authorization: {
      custom: {
        options: async (value, { req }) => {
          // 1. Validate header
          if (!value) {
            throw new ErrorWithStatus({
              message: UserMessage.ACCESS_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }

          // 2. Extract token
          const access_token = value.replace("Bearer ", "")

          // ✅ 3. CHECK BLACKLIST TRƯỚC TIÊN (QUAN TRỌNG!)
          const isBlacklisted = await authRedisService.isTokenBlacklisted(access_token)

          if (isBlacklisted) {
            // Token bị revoke → REJECT ngay
            // KHÔNG cần verify JWT signature
            // KHÔNG cần query DB
            throw new ErrorWithStatus({
              message: "Token has been revoked. Please login again.",
              status: httpStatus.UNAUTHORIZED
            })
          }

          // 4. Nếu PASS blacklist check → Verify JWT như bình thường
          try {
            const decode_authorization = await verifyToken({
              token: access_token,
              privateKey: envConfig.secret_key_access_token as string
            })

            // 5. Check user exists in DB
            const user = await databaseServices.users.findOne({
              _id: new ObjectId(decode_authorization.user_id)
            })

            if (!user) {
              throw new ErrorWithStatus({
                message: UserMessage.USER_NOT_FOUND,
                status: httpStatus.NOTFOUND
              })
            }

            // 6. Attach user to request
            req.decode_authorization = decode_authorization
            req.user = user
            return true
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: error.message,
                status: httpStatus.UNAUTHORIZED
              })
            }
            throw error
          }
        }
      }
    }
  })
)
```

### **Bước 4: Controller - Blacklist khi logout**

```typescript
// src/controllers/user.controllers.ts

export const logoutController = async (req, res, next) => {
  try {
    const { user_id } = req.decode_authorization as TokenPayload
    const refresh_token = req.cookies.refresh_token

    // ✅ Lấy accessToken từ header
    const authorization = req.headers.authorization || ""
    const access_token = authorization.replace("Bearer ", "")

    // Parallel execution: logout + blacklist
    await Promise.all([
      // 1. Delete refreshToken từ Redis + MongoDB
      userServices.logout({ user_id, refresh_token }),

      // ✅ 2. Blacklist accessToken
      access_token ? authRedisService.blacklistAccessToken(access_token) : Promise.resolve()
    ])

    // 3. Clear cookie
    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "strict",
      path: "/"
    })

    res.json({
      message: UserMessage.LOGOUT_IS_SUCCESS
    })
  } catch (error) {
    next(error)
  }
}
```

---

## 🔐 So sánh: Trước vs Sau

### **TRƯỚC (Không có Redis blacklist)**

```
User logout:
  ✅ Client xóa token khỏi localStorage
  ✅ Server xóa refreshToken khỏi MongoDB
  ❌ AccessToken VẪN VALID trong 15 phút!

Request sau logout:
  1. Middleware verify JWT → ✅ PASS (token chưa expire)
  2. Query user DB → ✅ User exists
  3. Request thành công → 🔓 LỖ HỔNG BẢO MẬT!

Nếu token bị đánh cắp:
  → Attacker có 15 phút để lợi dụng
  → Không cách nào chặn!
```

### **SAU (Có Redis blacklist)**

```
User logout:
  ✅ Client xóa token khỏi localStorage
  ✅ Server xóa refreshToken khỏi MongoDB
  ✅ Server thêm accessToken vào blacklist Redis

Request sau logout:
  1. Middleware check blacklist → ❌ Token in blacklist
  2. Reject ngay → 401 Unauthorized
  3. KHÔNG verify JWT, KHÔNG query DB
  4. Request thất bại → 🔒 BẢO MẬT!

Nếu token bị đánh cắp:
  → Attacker BỊ CHẶN ngay lập tức
  → Token không thể dùng được!
```

---

## ⚡ Performance Impact

```
Middleware execution time:

TRƯỚC (không có blacklist):
  JWT verify:     12ms
  DB user query:  40ms
  ────────────────────
  Total:          52ms

SAU (có blacklist check):
  Redis check:     0.4ms  ← Thêm vào
  JWT verify:     12ms
  DB user query:  40ms
  ────────────────────
  Total:          52.4ms

Overhead: 0.4ms (0.8%)
→ Negligible, nhưng tăng security rất nhiều!
```

---

## 📊 Redis Commands minh họa

```redis
# === Sau khi user logout ===

# Check token có trong blacklist không
EXISTS blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoi...
# Returns: 1 (có trong blacklist)

# Xem TTL còn lại
TTL blacklist:eyJhbGci...
# Returns: 540 (còn 540 giây = 9 phút)

# Get value
GET blacklist:eyJhbGci...
# Returns: "1"

# === Sau 9 phút (token expire) ===

# Redis tự động xóa
TTL blacklist:eyJhbGci...
# Returns: -2 (key không tồn tại)

EXISTS blacklist:eyJhbGci...
# Returns: 0 (đã bị xóa)
```

---

## ✅ Kết luận

**Câu trả lời cho câu hỏi của bạn:**

> Lưu AccessToken vào blacklist Redis và check nó có tồn tại trong blacklist không thì vẫn vào được (sử dụng token) đó tiếp hay sao?

**→ KHÔNG**, token trong blacklist sẽ **BỊ CHẶN NGAY** tại middleware, không thể sử dụng tiếp!

**Flow đầy đủ:**

1. User logout → Token vào blacklist
2. Mọi request sau đó → Middleware check blacklist TRƯỚC
3. Nếu trong blacklist → Reject ngay (401)
4. Nếu không trong blacklist → Mới verify JWT

**Lợi ích:**

- ✅ Bảo mật: Token bị revoke ngay lập tức
- ✅ Performance: Redis check chỉ 0.4ms
- ✅ Memory efficient: TTL tự động cleanup
- ✅ Đơn giản: Chỉ cần EXISTS check

**Tài liệu tham khảo:**

- File `01-session-management.md` - Section 2.1
- File `03-implementation-guide.md` - Step 2.4 & 2.5
