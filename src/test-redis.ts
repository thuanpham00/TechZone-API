// ✅ Load .env.development automatically
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env.development") })

import redis, { RedisClient } from "./redis/redisClient"

async function testRedis() {
  console.log("🧪 Testing Redis connection...\n")

  try {
    // Test 1: Ping
    console.log("Test 1: Ping Redis")
    const pingResult = await RedisClient.ping()
    console.log(`${pingResult ? "✅" : "❌"} Ping: ${pingResult ? "PONG" : "FAILED"}\n`)

    if (!pingResult) {
      throw new Error("Redis connection failed")
    }

    // Test 2: Set & Get
    console.log("Test 2: SET & GET")
    await redis.set("test:hello", "world", "EX", 300) // ← TTL 5 phút để dễ xem
    const value = await redis.get("test:hello")
    console.log(`✅ SET test:hello = "world"`)
    console.log(`✅ GET test:hello = "${value}"\n`)

    // Test 3: Hash
    console.log("Test 3: HASH operations")
    await redis.hset("test:user:1", "name", "John Doe")
    await redis.hset("test:user:1", "email", "john@example.com")
    const user = await redis.hgetall("test:user:1")
    console.log(`✅ HGETALL test:user:1:`, user)
    console.log("")

    // Test 4: TTL
    console.log("Test 4: TTL check")
    const ttl = await redis.ttl("test:hello")
    console.log(`✅ TTL test:hello: ${ttl} seconds\n`)

    // Test 5: Increment (for rate limiting)
    console.log("Test 5: INCR (Rate Limiting)")
    await redis.set("test:counter", "0")
    const count1 = await redis.incr("test:counter")
    const count2 = await redis.incr("test:counter")
    console.log(`✅ INCR test:counter: ${count1} → ${count2}\n`)

    // Test 6: Expire
    console.log("Test 6: EXPIRE")
    await redis.expire("test:counter", 300) // ← Tăng TTL lên 5 phút để dễ xem
    const counterTtl = await redis.ttl("test:counter")
    console.log(`✅ TTL test:counter: ${counterTtl} seconds\n`)

    // Test 7: DELETE - COMMENT OUT để giữ keys
    // console.log("Test 7: DELETE")
    // const deleted = await redis.del("test:hello", "test:user:1", "test:counter")
    // console.log(`✅ Deleted ${deleted} keys\n`)

    // Test 8: Connection Info
    console.log("Test 8: Redis Info")
    const info = await redis.info("server")
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1]
    console.log(`✅ Redis version: ${version}`)
    console.log(`✅ Host: ${redis.options.host}:${redis.options.port}`)
    console.log(`✅ Database: ${redis.options.db}\n`)

    console.log("🎉 All tests passed!")
  } catch (error) {
    console.error("❌ Test failed:", error)
    process.exit(1)
  } finally {
    await RedisClient.disconnect()
    process.exit(0)
  }
}

testRedis()
