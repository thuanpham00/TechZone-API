# Implementation Guide - Step by Step

Tài liệu này hướng dẫn từng bước để integrate Redis vào TechZone project từ setup đến deployment.

---

## Phase 1: Setup & Installation (Week 1)

### Step 1.1: Install Dependencies

```bash
# Terminal trong VS Code
cd d:/VS_CODE/Project/Project-NodeJS/TechZone/Server

# Install Redis client và dependencies
npm install ioredis@5.3.2
npm install cookie-parser@1.4.6
npm install uuid@9.0.1

# TypeScript types
npm install --save-dev @types/cookie-parser@1.4.6
npm install --save-dev @types/uuid@9.0.7
```

### Step 1.2: Setup Docker Redis

**Update `docker-compose.yml`:**

```yaml
version: "3.8"

services:
  # Existing MongoDB service
  mongodb:
    image: mongo:latest
    container_name: techzone-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - mongodb_data:/data/db

  # ✅ ADD Redis service
  redis:
    image: redis:7-alpine
    container_name: techzone-redis
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redis_password_2024
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis_password_2024", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # ✅ ADD RedisInsight (GUI tool)
  redisinsight:
    image: redislabs/redisinsight:latest
    container_name: techzone-redisinsight
    restart: always
    ports:
      - "5540:5540"
    volumes:
      - redisinsight_data:/db
    depends_on:
      - redis

volumes:
  mongodb_data:
  redis_data:
  redisinsight_data:
```

**Start services:**

```bash
docker-compose up -d

# Check services running
docker ps

# Expected output:
# - techzone-mongodb (port 27017)
# - techzone-redis (port 6379)
# - techzone-redisinsight (port 5540)

# Test Redis connection
docker exec -it techzone-redis redis-cli -a redis_password_2024 ping
# Should return: PONG
```

**Access RedisInsight:**

- Open browser: `http://localhost:5540`
- Click "Add Redis Database"
- Fill form:
  - Host: `redis` (Docker network name) or `localhost`
  - Port: `6379`
  - Password: `redis_password_2024`
  - Name: `TechZone Redis`
- Click "Add Database"

### Step 1.3: Update `.env`

```bash
# .env file
# ... existing env vars ...

# ✅ ADD Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_2024
REDIS_DB=0
```

**Update `src/utils/config.ts`:**

```typescript
// src/utils/config.ts
import { config } from "dotenv"
config()

export const envConfig = {
  // ... existing configs ...

  // ✅ ADD Redis config
  redis_host: process.env.REDIS_HOST as string,
  redis_port: parseInt(process.env.REDIS_PORT || "6379"),
  redis_password: process.env.REDIS_PASSWORD as string,
  redis_db: parseInt(process.env.REDIS_DB || "0")
}
```

### Step 1.4: Create Redis Client

**Create `src/services/redis/redisClient.ts`:**

```typescript
// src/services/redis/redisClient.ts
import Redis from "ioredis"
import { envConfig } from "~/utils/config"

/**
 * Redis client singleton
 */
class RedisClient {
  private static instance: Redis | null = null

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: envConfig.redis_host,
        port: envConfig.redis_port,
        password: envConfig.redis_password,
        db: envConfig.redis_db,

        // Connection settings
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000)
          console.log(`⚠️ Redis reconnect attempt ${times}, delay ${delay}ms`)
          return delay
        },

        maxRetriesPerRequest: 3,
        enableReadyCheck: true,

        // Performance settings
        lazyConnect: false,
        keepAlive: 30000,

        // Error handling
        showFriendlyErrorStack: process.env.NODE_ENV === "development"
      })

      // Event listeners
      RedisClient.instance.on("connect", () => {
        console.log("✅ Redis connected")
      })

      RedisClient.instance.on("ready", () => {
        console.log("✅ Redis ready to accept commands")
      })

      RedisClient.instance.on("error", (err) => {
        console.error("❌ Redis error:", err.message)
      })

      RedisClient.instance.on("close", () => {
        console.log("⚠️ Redis connection closed")
      })

      RedisClient.instance.on("reconnecting", (ms) => {
        console.log(`🔄 Redis reconnecting in ${ms}ms...`)
      })

      RedisClient.instance.on("end", () => {
        console.log("❌ Redis connection ended")
      })
    }

    return RedisClient.instance
  }

  /**
   * Close connection (for graceful shutdown)
   */
  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit()
      RedisClient.instance = null
      console.log("✅ Redis disconnected")
    }
  }

  /**
   * Health check
   */
  static async ping(): Promise<boolean> {
    try {
      const response = await RedisClient.getInstance().ping()
      return response === "PONG"
    } catch (error) {
      console.error("❌ Redis ping failed:", error)
      return false
    }
  }
}

// Export singleton instance
export default RedisClient.getInstance()
export { RedisClient }
```

**Test connection in `src/index.ts`:**

```typescript
// src/index.ts
import express from "express"
import databaseServices from "./services/database.services"
import { RedisClient } from "./services/redis/redisClient"
// ... other imports

const app = express()
const PORT = envConfig.port || 3001

// ... middleware setup

// ✅ Test Redis on startup
const startServer = async () => {
  try {
    // Connect MongoDB
    await databaseServices.connect()
    console.log("✅ MongoDB connected")

    // ✅ Test Redis
    const redisOK = await RedisClient.ping()
    if (!redisOK) {
      throw new Error("Redis connection failed")
    }
    console.log("✅ Redis connection verified")

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("❌ Server startup failed:", error)
    process.exit(1)
  }
}

// ✅ Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("⚠️ SIGTERM received, shutting down gracefully...")
  await RedisClient.disconnect()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("⚠️ SIGINT received, shutting down gracefully...")
  await RedisClient.disconnect()
  process.exit(0)
})

startServer()
```

**Run test:**

```bash
npm run dev

# Expected logs:
# ✅ Redis connected
# ✅ Redis ready to accept commands
# ✅ MongoDB connected
# ✅ Redis connection verified
# 🚀 Server running on port 3001
```

---

## Phase 2: Session Management Implementation (Week 2)

### Step 2.1: Create Auth Redis Service

**Create `src/services/redis/authRedis.ts`:**

```typescript
// Copy full code from 01-session-management.md section 2.1
// AuthRedisService class with:
// - blacklistAccessToken()
// - isTokenBlacklisted()
// - getBlacklistCount()
// - clearAllBlacklist()
```

_(See section 2.1 in `01-session-management.md` for complete code)_

### Step 2.2: Create Token Redis Service

**Create `src/services/redis/tokenRedis.ts`:**

```typescript
// Copy full code from 01-session-management.md section 2.2
// TokenRedisService class with:
// - storeRefreshToken()
// - getRefreshToken()
// - validateRefreshToken()
// - deleteRefreshToken()
// - getTokenTTL()
```

_(See section 2.2 in `01-session-management.md` for complete code)_

### Step 2.3: Create Rate Limit Service

**Create `src/services/redis/rateLimitRedis.ts`:**

```typescript
// Copy full code from 01-session-management.md section 2.3
// RateLimitRedisService class with:
// - checkLoginAttempts()
// - resetLoginAttempts()
// - getAttemptCount()
// - checkAPILimit()
// - blockIP()
// - isIPBlocked()
```

_(See section 2.3 in `01-session-management.md` for complete code)_

### Step 2.4: Update Middleware

**Update `src/middlewares/user.middlewares.ts`:**

```typescript
// Add import
import { authRedisService } from "~/services/redis/authRedis"

// Update accessTokenValidator
export const accessTokenValidator = validate(
  checkSchema({
    Authorization: {
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: UserMessage.ACCESS_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }

          const access_token = value.replace("Bearer ", "")

          // ✅ CHECK BLACKLIST FIRST
          const isBlacklisted = await authRedisService.isTokenBlacklisted(access_token)

          if (isBlacklisted) {
            throw new ErrorWithStatus({
              message: "Token has been revoked. Please login again.",
              status: httpStatus.UNAUTHORIZED
            })
          }

          // Verify JWT
          try {
            const decode_authorization = await verifyToken({
              token: access_token,
              privateKey: envConfig.secret_key_access_token as string
            })

            const user = await databaseServices.users.findOne({
              _id: new ObjectId(decode_authorization.user_id)
            })

            if (!user) {
              throw new ErrorWithStatus({
                message: UserMessage.USER_NOT_FOUND,
                status: httpStatus.NOTFOUND
              })
            }

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

### Step 2.5: Update User Controller

**Update `src/controllers/user.controllers.ts`:**

```typescript
// Add imports
import { authRedisService } from "~/services/redis/authRedis"
import { rateLimitRedisService } from "~/services/redis/rateLimitRedis"

// ✅ UPDATE LOGIN
export const loginController = async (req, res, next) => {
  try {
    // Get IP
    const ip = req.ip || req.connection.remoteAddress || "unknown"

    // ✅ CHECK RATE LIMIT
    const rateLimit = await rateLimitRedisService.checkLoginAttempts(ip)

    if (!rateLimit.allowed) {
      throw new ErrorWithStatus({
        message: `Too many login attempts. Try again after ${new Date(rateLimit.resetAt).toLocaleTimeString("vi-VN")}`,
        status: httpStatus.TOO_MANY_REQUESTS
      })
    }

    // Existing login logic
    const { user } = req as Request
    const user_id = (user._id as ObjectId)?.toString()
    const verify = user.verify
    const role = user.role.toString()

    const findRole = await databaseServices.role.findOne({ _id: new ObjectId(role) })
    const roleName = findRole?.key as string

    const {
      accessToken,
      refreshToken,
      user: userInfo
    } = await userServices.login({
      user_id,
      verify,
      roleId: role
    })

    // ✅ RESET RATE LIMIT on success
    await rateLimitRedisService.resetLoginAttempts(ip)

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 100 * 24 * 60 * 60 * 1000
    })

    const userContainsRole = {
      ...userInfo,
      role: roleName
    }

    res.json({
      message: UserMessage.LOGIN_IS_SUCCESS,
      result: {
        accessToken,
        userInfo: userContainsRole,
        rateLimit: {
          remaining: rateLimit.remaining
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// ✅ UPDATE LOGOUT
export const logoutController = async (req, res, next) => {
  try {
    const { user_id } = req.decode_authorization as TokenPayload
    const refresh_token = req.cookies.refresh_token

    // ✅ GET ACCESS TOKEN from header
    const authorization = req.headers.authorization || ""
    const access_token = authorization.replace("Bearer ", "")

    await Promise.all([
      // Logout service
      userServices.logout({ user_id, refresh_token }),

      // ✅ BLACKLIST ACCESS TOKEN
      access_token ? authRedisService.blacklistAccessToken(access_token) : Promise.resolve()
    ])

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

### Step 2.6: Update User Service

**Update `src/services/user.services.ts`:**

```typescript
// Add import
import { tokenRedisService } from "./redis/tokenRedis"

class UserService {
  // ... existing methods ...

  // ✅ UPDATE LOGIN
  async login({ user_id, verify, roleId }: LoginParams) {
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify,
      role: roleId
    })

    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    const ttl = exp - Math.floor(Date.now() / 1000)

    const [user] = await Promise.all([
      // Query user
      databaseServices.users.findOne(
        { _id: new ObjectId(user_id) },
        { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
      ),

      // ✅ STORE RT IN REDIS (primary)
      tokenRedisService.storeRefreshToken(user_id, refreshToken, ttl)
    ])

    // ✅ BACKGROUND SYNC to MongoDB (không block)
    setImmediate(() => {
      databaseServices.refreshToken
        .updateOne(
          { user_id: new ObjectId(user_id) },
          { $set: { token: refreshToken, iat, exp, updated_at: new Date() } },
          { upsert: true }
        )
        .catch((err) => console.error("MongoDB RT sync error:", err))
    })

    return { accessToken, refreshToken, user }
  }

  // ✅ UPDATE REFRESH TOKEN
  async refreshToken({ token, user_id, verify, exp, roleId }: RefreshParams) {
    // ✅ VERIFY FROM REDIS
    const isValid = await tokenRedisService.validateRefreshToken(user_id, token)

    if (!isValid) {
      throw new ErrorWithStatus({
        message: UserMessage.REFRESH_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }

    // Generate new tokens
    const [accessTokenNew, refreshTokenNew] = await Promise.all([
      this.signAccessToken({ user_id, verify, role: roleId }),
      this.signRefreshToken({ user_id, verify, role: roleId, exp })
    ])

    const { iat, exp: newExp } = await this.decodeRefreshToken(refreshTokenNew)
    const ttl = newExp - Math.floor(Date.now() / 1000)

    // ✅ UPDATE REDIS
    await tokenRedisService.storeRefreshToken(user_id, refreshTokenNew, ttl)

    // ✅ BACKGROUND SYNC MongoDB
    setImmediate(() => {
      databaseServices.refreshToken
        .updateOne(
          { user_id: new ObjectId(user_id) },
          { $set: { token: refreshTokenNew, iat, exp: newExp, updated_at: new Date() } },
          { upsert: true }
        )
        .catch((err) => console.error("MongoDB RT sync error:", err))
    })

    return { accessToken: accessTokenNew, refreshToken: refreshTokenNew }
  }

  // ✅ UPDATE LOGOUT
  async logout({ user_id, refresh_token }: LogoutParams) {
    await Promise.all([
      // Delete RT from Redis
      tokenRedisService.deleteRefreshToken(user_id),

      // Delete RT from MongoDB
      databaseServices.refreshToken.deleteOne({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    ])

    return { message: UserMessage.LOGOUT_IS_SUCCESS }
  }
}

export default new UserService()
```

### Step 2.7: Test Session Management

**Test script `tests/auth-redis.test.ts`:**

```typescript
import { authRedisService } from "../src/services/redis/authRedis"
import { tokenRedisService } from "../src/services/redis/tokenRedis"
import { rateLimitRedisService } from "../src/services/redis/rateLimitRedis"

describe("Auth Redis Tests", () => {
  test("Blacklist token", async () => {
    const token = "test_token_123"
    await authRedisService.blacklistAccessToken(token)

    const isBlacklisted = await authRedisService.isTokenBlacklisted(token)
    expect(isBlacklisted).toBe(true)
  })

  test("Store and validate refresh token", async () => {
    const userId = "user_123"
    const token = "refresh_token_xyz"

    await tokenRedisService.storeRefreshToken(userId, token, 3600)

    const isValid = await tokenRedisService.validateRefreshToken(userId, token)
    expect(isValid).toBe(true)
  })

  test("Rate limiting", async () => {
    const ip = "192.168.1.100"

    for (let i = 0; i < 5; i++) {
      const result = await rateLimitRedisService.checkLoginAttempts(ip)
      expect(result.allowed).toBe(true)
    }

    // 6th attempt should fail
    const blocked = await rateLimitRedisService.checkLoginAttempts(ip)
    expect(blocked.allowed).toBe(false)
  })
})
```

**Run tests:**

```bash
npm test tests/auth-redis.test.ts
```

---

## Phase 3: Cart Management Implementation (Week 3)

### Step 3.1: Add cookie-parser Middleware

**Update `src/index.ts`:**

```typescript
import express from "express"
import cookieParser from "cookie-parser"
// ... other imports

const app = express()

// ✅ ADD cookie-parser
app.use(cookieParser())

// ... rest of middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
```

### Step 3.2: Create Guest Cart Helper

**Create `src/utils/guestCart.ts`:**

```typescript
// Copy full code from 02-cart-management.md section 2.5
// GuestCartHelper class with:
// - getGuestId()
// - clearGuestId()
// - isGuestId()
```

_(See section 2.5 in `02-cart-management.md` for complete code)_

### Step 3.3: Create Cart Redis Service

**Create `src/services/redis/cartRedis.ts`:**

```typescript
// Copy full code from 02-cart-management.md section 2.3
// CartRedisService class with:
// - addProduct()
// - getProduct()
// - getCart()
// - updateQuantity()
// - removeProduct()
// - clearCart()
// - getCartCount()
// - getCartTotal()
// - hasProduct()
// - mergeCart()
// - getCartTTL()
```

_(See section 2.3 in `02-cart-management.md` for complete code)_

### Step 3.4: Create Cart Sync Service

**Create `src/services/redis/cartSync.ts`:**

```typescript
// Copy full code from 02-cart-management.md section 2.4
// CartSyncService class with:
// - syncToMongoDB()
// - loadFromMongoDB()
// - scheduleSync()
```

_(See section 2.4 in `02-cart-management.md` for complete code)_

### Step 3.5: Update MongoDB Cart Schema

**Update `src/models/schema/favourite_cart.order.schema.ts`:**

```typescript
// Add snapshot fields to CartProduct
export interface CartProduct {
  product: ObjectId
  quantity: number

  // ✅ ADD snapshots for backup
  price_snapshot?: number
  name_snapshot?: string
  image_snapshot?: string
  added_at?: Date
}

export interface CartType {
  _id?: ObjectId
  user: ObjectId
  products: CartProduct[]
  created_at?: Date
  updated_at?: Date
}

export const CartSchema = new Schema<CartType>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },

      // ✅ Snapshots
      price_snapshot: { type: Number },
      name_snapshot: { type: String },
      image_snapshot: { type: String },
      added_at: { type: Date }
    }
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})
```

### Step 3.6: Update Cart Controllers

**Update `src/controllers/collections.controllers.ts`:**

```typescript
// Add imports
import { cartRedisService } from "~/services/redis/cartRedis"
import { cartSyncService } from "~/services/redis/cartSync"
import { guestCartHelper } from "~/utils/guestCart"

// ✅ UPDATE: Add product to cart
export const addProductToCartController = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body

    // Get userId or guestId
    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      userId = guestCartHelper.getGuestId(req, res)
    }

    // Get product from MongoDB
    const product = await databaseServices.product.findOne({
      _id: new ObjectId(productId)
    })

    if (!product) {
      throw new ErrorWithStatus({
        message: "Product not found",
        status: httpStatus.NOTFOUND
      })
    }

    // ✅ ADD TO REDIS (fast)
    const cartItem = await cartRedisService.addProduct(
      userId,
      productId,
      {
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
        quantity: 0
      },
      quantity
    )

    // ✅ BACKGROUND SYNC to MongoDB
    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Product added to cart",
      result: cartItem
    })
  } catch (error) {
    next(error)
  }
}

// ✅ UPDATE: Get cart
export const getCartController = async (req, res, next) => {
  try {
    // Get userId or guestId
    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      userId = guestCartHelper.getGuestId(req, res)
    }

    // ✅ GET FROM REDIS (fast)
    let items = await cartRedisService.getCart(userId)

    // Fallback: nếu empty và authenticated user, load từ MongoDB
    if (items.length === 0 && !guestCartHelper.isGuestId(userId)) {
      console.log("⚠️ Redis cart empty, loading from MongoDB...")
      await cartSyncService.loadFromMongoDB(userId)
      items = await cartRedisService.getCart(userId)
    }

    // Calculate totals
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const count = items.length

    res.json({
      message: "Get cart success",
      result: {
        items,
        count,
        total
      }
    })
  } catch (error) {
    next(error)
  }
}

// ✅ UPDATE: Update cart item
export const updateCartItemController = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body

    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      userId = guestCartHelper.getGuestId(req, res)
    }

    if (quantity <= 0) {
      await cartRedisService.removeProduct(userId, productId)
    } else {
      await cartRedisService.updateQuantity(userId, productId, quantity)
    }

    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Cart updated"
    })
  } catch (error) {
    next(error)
  }
}

// ✅ UPDATE: Remove from cart
export const removeFromCartController = async (req, res, next) => {
  try {
    const { productId } = req.params

    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      userId = guestCartHelper.getGuestId(req, res)
    }

    await cartRedisService.removeProduct(userId, productId)
    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Product removed from cart"
    })
  } catch (error) {
    next(error)
  }
}

// ✅ UPDATE: Clear cart
export const clearCartController = async (req, res, next) => {
  try {
    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      userId = guestCartHelper.getGuestId(req, res)
    }

    await cartRedisService.clearCart(userId)
    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Cart cleared"
    })
  } catch (error) {
    next(error)
  }
}
```

### Step 3.7: Update Login to Merge Cart

**Update `src/controllers/user.controllers.ts`:**

```typescript
// Add import
import { cartRedisService } from "~/services/redis/cartRedis"
import { cartSyncService } from "~/services/redis/cartSync"
import { guestCartHelper } from "~/utils/guestCart"

export const loginController = async (req, res, next) => {
  try {
    // ... existing rate limit check ...

    const { user } = req as Request
    const user_id = (user._id as ObjectId)?.toString()

    // ... existing login logic ...

    // ✅ CHECK GUEST CART
    const guestId = req.cookies["guest_cart_id"]

    if (guestId && guestCartHelper.isGuestId(guestId)) {
      console.log(`🔀 Merging cart: ${guestId} → ${user_id}`)

      // Merge guest cart to user cart
      await cartRedisService.mergeCart(guestId, user_id)

      // Clear guest cookie
      guestCartHelper.clearGuestId(res)

      // Background sync merged cart
      cartSyncService.scheduleSync(user_id)
    }

    // ... rest of login response ...
  } catch (error) {
    next(error)
  }
}
```

### Step 3.8: Test Cart Management

**Test script `tests/cart-redis.test.ts`:**

```typescript
import { cartRedisService } from "../src/services/redis/cartRedis"

describe("Cart Redis Tests", () => {
  const userId = "test_user_123"
  const productId = "product_abc"

  beforeEach(async () => {
    await cartRedisService.clearCart(userId)
  })

  test("Add product to cart", async () => {
    const item = await cartRedisService.addProduct(
      userId,
      productId,
      { name: "Test Product", price: 100000, image: "img.jpg", quantity: 0 },
      2
    )

    expect(item.quantity).toBe(2)
    expect(item.productId).toBe(productId)
  })

  test("Get cart", async () => {
    await cartRedisService.addProduct(userId, productId, { name: "Test", price: 100000, image: "", quantity: 0 }, 2)

    const items = await cartRedisService.getCart(userId)
    expect(items.length).toBe(1)
    expect(items[0].quantity).toBe(2)
  })

  test("Update quantity", async () => {
    await cartRedisService.addProduct(userId, productId, { name: "Test", price: 100000, image: "", quantity: 0 }, 2)

    await cartRedisService.updateQuantity(userId, productId, 5)

    const item = await cartRedisService.getProduct(userId, productId)
    expect(item?.quantity).toBe(5)
  })

  test("Remove product", async () => {
    await cartRedisService.addProduct(userId, productId, { name: "Test", price: 100000, image: "", quantity: 0 }, 2)

    await cartRedisService.removeProduct(userId, productId)

    const item = await cartRedisService.getProduct(userId, productId)
    expect(item).toBeNull()
  })

  test("Merge carts", async () => {
    const guestId = "guest_xyz"
    const product1 = "prod1"
    const product2 = "prod2"

    // Guest cart: prod1 (qty 2)
    await cartRedisService.addProduct(guestId, product1, { name: "Prod1", price: 100, image: "", quantity: 0 }, 2)

    // User cart: prod2 (qty 1)
    await cartRedisService.addProduct(userId, product2, { name: "Prod2", price: 200, image: "", quantity: 0 }, 1)

    // Merge
    await cartRedisService.mergeCart(guestId, userId)

    // Check user cart
    const items = await cartRedisService.getCart(userId)
    expect(items.length).toBe(2)

    // Guest cart should be deleted
    const guestItems = await cartRedisService.getCart(guestId)
    expect(guestItems.length).toBe(0)
  })
})
```

**Run tests:**

```bash
npm test tests/cart-redis.test.ts
```

---

## Phase 4: Testing & Optimization (Week 4)

### Step 4.1: Integration Tests

**Create `tests/integration/auth-flow.test.ts`:**

```typescript
import request from "supertest"
import app from "../../src/index"

describe("Authentication Flow Integration", () => {
  let accessToken: string
  let refreshToken: string

  test("Login → Logout → Token revoked", async () => {
    // Login
    const loginRes = await request(app).post("/users/login").send({
      email: "test@example.com",
      password: "password123"
    })

    expect(loginRes.status).toBe(200)
    accessToken = loginRes.body.result.accessToken
    refreshToken = loginRes.headers["set-cookie"][0]

    // Use access token (should work)
    const profileRes1 = await request(app).get("/users/me").set("Authorization", `Bearer ${accessToken}`)

    expect(profileRes1.status).toBe(200)

    // Logout
    await request(app).post("/users/logout").set("Authorization", `Bearer ${accessToken}`).set("Cookie", refreshToken)

    // Try use token again (should fail)
    const profileRes2 = await request(app).get("/users/me").set("Authorization", `Bearer ${accessToken}`)

    expect(profileRes2.status).toBe(401)
    expect(profileRes2.body.message).toContain("revoked")
  })

  test("Rate limiting after 5 failed attempts", async () => {
    // Try 5 wrong passwords
    for (let i = 0; i < 5; i++) {
      await request(app).post("/users/login").send({
        email: "test@example.com",
        password: "wrong_password"
      })
    }

    // 6th attempt should be blocked
    const res = await request(app).post("/users/login").send({
      email: "test@example.com",
      password: "wrong_password"
    })

    expect(res.status).toBe(429)
    expect(res.body.message).toContain("Too many")
  })
})
```

### Step 4.2: Load Testing với Artillery

**Install Artillery:**

```bash
npm install --save-dev artillery
```

**Create `tests/load/cart-operations.yml`:**

```yaml
config:
  target: "http://localhost:3001"
  phases:
    # Warm up
    - duration: 30
      arrivalRate: 10
      name: "Warm up"

    # Ramp up
    - duration: 60
      arrivalRate: 50
      name: "Ramp up load"

    # Sustained load
    - duration: 120
      arrivalRate: 100
      name: "Sustained load"

    # Spike
    - duration: 30
      arrivalRate: 200
      name: "Spike test"

  processor: "./load-helpers.js"

scenarios:
  - name: "Cart operations"
    weight: 70
    flow:
      # Add product to cart
      - post:
          url: "/collections/add-to-cart"
          json:
            productId: "{{ $randomString() }}"
            quantity: "{{ $randomNumber(1, 5) }}"
          capture:
            - json: "$.result"
              as: "cartItem"

      # Get cart
      - get:
          url: "/collections/cart"

      # Update quantity
      - put:
          url: "/collections/update-cart"
          json:
            productId: "{{ cartItem.productId }}"
            quantity: "{{ $randomNumber(1, 10) }}"

  - name: "Auth operations"
    weight: 30
    flow:
      # Login
      - post:
          url: "/users/login"
          json:
            email: "test{{ $randomNumber(1, 1000) }}@example.com"
            password: "password123"
          capture:
            - json: "$.result.accessToken"
              as: "accessToken"

      # Refresh token
      - post:
          url: "/users/refresh-token"
          headers:
            Authorization: "Bearer {{ accessToken }}"
```

**Run load test:**

```bash
npx artillery run tests/load/cart-operations.yml --output report.json
npx artillery report report.json
```

### Step 4.3: Monitoring Dashboard

**Create `src/routes/monitoring.routes.ts`:**

```typescript
import { Router } from "express"
import redis from "~/services/redis/redisClient"

const monitoringRouter = Router()

/**
 * GET /monitoring/redis-stats
 * Get Redis statistics
 */
monitoringRouter.get("/redis-stats", async (req, res) => {
  try {
    const [blacklistKeys, refreshTokenKeys, cartKeys, rateLimitKeys, memoryInfo] = await Promise.all([
      redis.keys("blacklist:*"),
      redis.keys("refresh:*"),
      redis.keys("cart:*"),
      redis.keys("login:attempts:*"),
      redis.info("memory")
    ])

    // Parse memory info
    const memoryLines = memoryInfo.split("\r\n")
    const usedMemory = memoryLines.find((l) => l.startsWith("used_memory_human:"))?.split(":")[1] || "N/A"

    const peakMemory = memoryLines.find((l) => l.startsWith("used_memory_peak_human:"))?.split(":")[1] || "N/A"

    res.json({
      timestamp: new Date(),
      blacklistedTokens: blacklistKeys.length,
      activeRefreshTokens: refreshTokenKeys.length,
      activeCarts: cartKeys.length,
      IPsWithFailedAttempts: rateLimitKeys.length,
      memory: {
        used: usedMemory.trim(),
        peak: peakMemory.trim()
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to get Redis stats" })
  }
})

/**
 * GET /monitoring/health
 * Health check endpoint
 */
monitoringRouter.get("/health", async (req, res) => {
  try {
    const [redisPing, mongoStatus] = await Promise.all([
      redis.ping(),
      // Add MongoDB ping if needed
      Promise.resolve("ok")
    ])

    res.json({
      status: "healthy",
      redis: redisPing === "PONG" ? "connected" : "error",
      mongodb: mongoStatus
    })
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: (error as Error).message
    })
  }
})

export default monitoringRouter
```

**Register route in `src/index.ts`:**

```typescript
import monitoringRouter from "./routes/monitoring.routes"

// ... other routes
app.use("/monitoring", monitoringRouter)
```

**Test monitoring:**

```bash
curl http://localhost:3001/monitoring/redis-stats
curl http://localhost:3001/monitoring/health
```

---

## Phase 5: Deployment (Production Ready)

### Step 5.1: Environment Variables

**Production `.env`:**

```bash
# ... existing vars ...

# Redis Production
REDIS_HOST=redis.production.com
REDIS_PORT=6379
REDIS_PASSWORD=strong_production_password_2024
REDIS_DB=0
REDIS_TLS=true  # Enable for production
```

### Step 5.2: Docker Compose Production

**Create `docker-compose.prod.yml`:**

```yaml
version: "3.8"

services:
  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    command: >
      redis-server
      --appendonly yes
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
    volumes:
      - redis_prod_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  redis_prod_data:
    driver: local
```

### Step 5.3: PM2 Ecosystem Config

**Update `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [
    {
      name: "techzone-api",
      script: "./dist/index.js",
      instances: 4, // Use 4 CPU cores
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
        // ... other env vars
      },

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Error handling
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Monitoring
      max_restarts: 10,
      min_uptime: "10s"
    }
  ]
}
```

### Step 5.4: Health Checks & Alerts

**Create `src/utils/healthCheck.ts`:**

```typescript
import { RedisClient } from "~/services/redis/redisClient"
import databaseServices from "~/services/database.services"

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  redis: boolean
  mongodb: boolean
  uptime: number
  timestamp: Date
}

export const performHealthCheck = async (): Promise<HealthCheckResult> => {
  const redis = await RedisClient.ping()

  let mongodb = true
  try {
    await databaseServices.users.findOne({})
  } catch {
    mongodb = false
  }

  const status = redis && mongodb ? "healthy" : redis || mongodb ? "degraded" : "unhealthy"

  return {
    status,
    redis,
    mongodb,
    uptime: process.uptime(),
    timestamp: new Date()
  }
}

// Schedule periodic health checks
setInterval(async () => {
  const health = await performHealthCheck()

  if (health.status === "unhealthy") {
    console.error("🚨 CRITICAL: System unhealthy!", health)
    // TODO: Send alert (email, Slack, PagerDuty, etc.)
  } else if (health.status === "degraded") {
    console.warn("⚠️ WARNING: System degraded", health)
  }
}, 60000) // Check every 1 minute
```

### Step 5.5: Deploy Steps

```bash
# 1. Build TypeScript
npm run build

# 2. Start Redis (production)
docker-compose -f docker-compose.prod.yml up -d redis

# 3. Verify Redis
docker exec -it techzone-redis redis-cli -a $REDIS_PASSWORD ping

# 4. Start application with PM2
pm2 start ecosystem.config.js --env production

# 5. Check logs
pm2 logs techzone-api

# 6. Monitor
pm2 monit

# 7. Setup startup script
pm2 startup
pm2 save
```

---

## Troubleshooting

### Issue 1: Redis Connection Failed

**Symptoms:**

```
❌ Redis error: ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**

```bash
# Check Redis running
docker ps | grep redis

# Check Redis logs
docker logs techzone-redis

# Test connection
docker exec -it techzone-redis redis-cli -a redis_password_2024 ping

# Restart Redis
docker-compose restart redis
```

### Issue 2: Token Still Valid After Blacklist

**Symptoms:**

```
Token should be revoked but still works
```

**Debug:**

```typescript
// In middleware, add logs
console.log("Checking token:", access_token.substring(0, 20))
const isBlacklisted = await authRedisService.isTokenBlacklisted(access_token)
console.log("Is blacklisted:", isBlacklisted)

// Check Redis
redis.exists(`blacklist:${access_token}`) // Should return 1
redis.ttl(`blacklist:${access_token}`) // Should return remaining seconds
```

### Issue 3: Cart Not Merging After Login

**Debug:**

```typescript
// In loginController, add logs
console.log("Guest cookie:", req.cookies["guest_cart_id"])
console.log("Is guest ID:", guestCartHelper.isGuestId(guestId))

// Check Redis keys
redis.keys("cart:guest_*") // Guest carts
redis.keys("cart:507f*") // User carts
```

### Issue 4: High Memory Usage

**Check Redis memory:**

```bash
docker exec -it techzone-redis redis-cli -a redis_password_2024 INFO memory

# Get top memory keys
docker exec -it techzone-redis redis-cli -a redis_password_2024 --bigkeys
```

**Set max memory policy:**

```yaml
# docker-compose.yml
command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
```

---

## Checklist

### Setup Phase

- [x] Install dependencies (ioredis, cookie-parser, uuid)
- [x] Setup Docker Redis + RedisInsight
- [x] Configure environment variables
- [x] Create Redis client singleton
- [x] Test Redis connection

### Session Management

- [x] Create authRedis service (blacklist)
- [x] Create tokenRedis service (refresh token cache)
- [x] Create rateLimitRedis service
- [x] Update middleware (check blacklist)
- [x] Update controllers (login, logout)
- [x] Update user service (Redis integration)
- [x] Test auth flow

### Cart Management

- [x] Add cookie-parser middleware
- [x] Create guestCart helper
- [x] Create cartRedis service
- [x] Create cartSync service
- [x] Update MongoDB schema (snapshots)
- [x] Update cart controllers
- [x] Update login (merge cart)
- [x] Test cart operations

### Testing & Optimization

- [x] Write unit tests
- [x] Write integration tests
- [x] Run load tests (Artillery)
- [x] Setup monitoring dashboard
- [x] Performance benchmarks

### Deployment

- [x] Production environment variables
- [x] Docker compose production config
- [x] PM2 cluster mode
- [x] Health checks & alerts
- [x] Deploy to staging
- [ ] Deploy to production

---

**Next:** Đọc `04-redisinsight-demo.md` để học cách sử dụng RedisInsight tool.
