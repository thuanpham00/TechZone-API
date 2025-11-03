# Triển khai trên Node.js — Ví dụ & Hướng dẫn chi tiết

File này mô tả các bước cụ thể để tích hợp Redis cho session và cart trong Node.js (Express) bằng TypeScript/JavaScript. Bao gồm snippets cấu hình `ioredis`, `express-session` + `connect-redis`, `cartService` và API controllers.

## 1 — Dependencies gợi ý

- redis client: `ioredis` hoặc `redis` (node-redis)
- session store: `express-session`, `connect-redis`
- body parsing, validation: `express`, `joi` (tuỳ chọn)
- testing: `jest`, `supertest`

## 2 — Biến môi trường (env)

- REDIS_HOST (ví dụ: redis)
- REDIS_PORT (6379)
- REDIS_PASSWORD (nếu có)
- SESSION_SECRET
- SESSION_TTL_SECONDS (ví dụ: 1800)

## 3 — Khởi tạo Redis client (ioredis)

```ts
// src/services/redisClient.ts
import Redis from "ioredis"

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined
})

export default redis
```

## 4 — Cấu hình express-session với connect-redis

```ts
// src/app.ts (hoặc index.ts)
import express from "express"
import session from "express-session"
import connectRedis from "connect-redis"
import redisClient from "./services/redisClient"

const RedisStore = connectRedis(session)
const app = express()

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
)
```

Ghi chú: `connect-redis` sẽ lưu session theo key mặc định `sess:<sid>`. Bạn có thể cấu hình `prefix` nếu muốn.

## 5 — Cart service (Hash-based example)

```ts
// src/services/cartService.ts
import redis from "./redisClient"

const CART_PREFIX = "cart:"
const ANON_PREFIX = "cart:anon:"

type CartItem = { productId: string; qty: number; price?: number; title?: string }

export async function getCart(userIdOrTempId: string, isAnon = false) {
  const key = isAnon ? `${ANON_PREFIX}${userIdOrTempId}` : `${CART_PREFIX}${userIdOrTempId}`
  const raw = await redis.hgetall(key)
  // raw is an object of field -> string(JSON)
  const items: CartItem[] = Object.entries(raw).map(([field, value]) => JSON.parse(value))
  return items
}

export async function addItem(userIdOrTempId: string, item: CartItem, isAnon = false) {
  const key = isAnon ? `${ANON_PREFIX}${userIdOrTempId}` : `${CART_PREFIX}${userIdOrTempId}`
  const field = `item:${item.productId}`
  const existing = await redis.hget(key, field)
  if (existing) {
    const ex = JSON.parse(existing)
    ex.qty = (ex.qty || 0) + item.qty
    await redis.hset(key, field, JSON.stringify(ex))
  } else {
    await redis.hset(key, field, JSON.stringify(item))
  }
}

export async function removeItem(userIdOrTempId: string, productId: string, isAnon = false) {
  const key = isAnon ? `${ANON_PREFIX}${userIdOrTempId}` : `${CART_PREFIX}${userIdOrTempId}`
  const field = `item:${productId}`
  await redis.hdel(key, field)
}

export async function mergeCarts(userId: string, anonTempId: string) {
  const anonKey = `${ANON_PREFIX}${anonTempId}`
  const userKey = `${CART_PREFIX}${userId}`
  const anon = await redis.hgetall(anonKey)
  const tx = redis.multi()
  for (const [field, value] of Object.entries(anon)) {
    // merge logic: if user has field, sum qty
    const existing = await redis.hget(userKey, field)
    if (existing) {
      const ex = JSON.parse(existing)
      const an = JSON.parse(value)
      ex.qty = (ex.qty || 0) + (an.qty || 0)
      tx.hset(userKey, field, JSON.stringify(ex))
    } else {
      tx.hset(userKey, field, value)
    }
  }
  tx.del(anonKey)
  await tx.exec()
}
```

Ghi chú: đoạn merge trên dùng một vòng lặp sync vì cần đọc existing trước; với cart lớn, cân nhắc dùng Lua script hoặc read-modify-write bằng transaction phù hợp.

## 6 — Controller ví dụ (Express)

```ts
// src/controllers/cartController.ts
import express from "express"
import * as cartService from "../services/cartService"

const router = express.Router()

// Lấy cart
router.get("/", async (req, res) => {
  const session = req.session as any
  if (session?.userId) {
    const items = await cartService.getCart(String(session.userId))
    return res.json({ items })
  }
  const tempId = req.cookies?.tempId
  const items = tempId ? await cartService.getCart(tempId, true) : []
  res.json({ items })
})

// Thêm item
router.post("/items", async (req, res) => {
  const { productId, qty, price, title } = req.body
  const session = req.session as any
  const item = { productId, qty: Number(qty), price, title }
  if (session?.userId) {
    await cartService.addItem(String(session.userId), item)
    return res.status(201).json({ ok: true })
  }
  let tempId = req.cookies?.tempId
  if (!tempId) {
    tempId = /* tạo uuid */ require("crypto").randomUUID()
    res.cookie("tempId", tempId, { maxAge: 1000 * 60 * 60 * 24 * 30 })
  }
  await cartService.addItem(tempId, item, true)
  res.status(201).json({ ok: true, tempId })
})

export default router
```

## 7 — Logging, error handling và tests

- Thêm try/catch trong service và controller.
- Viết unit test cho `cartService` (mock redis hoặc dùng Redis docker cho integration test).

## 8 — Edge cases & performance

- Cart lớn: tránh hgetall với cart vài ngàn item, dùng pagination hoặc store items as list of small keys.
- Race conditions: nếu nhiều request update cùng item, dùng optimistic concurrency control hoặc Lua script.

---

Tệp này chứa các đoạn code minh hoạ — bạn có thể copy vào `src/services` và `src/controllers` của project hiện tại, điều chỉnh theo style/TypeScript của repository.
