// ✅ Load .env.development automatically
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env.development") })

import { authRedisService } from "./redis/authRedis"
import jwt from "jsonwebtoken"
import { envConfig } from "./utils/config"

async function testAuthRedis() {
  console.log("🧪 Testing Auth Redis Service...\n")

  try {
    // Test 1: Blacklist Token
    console.log("Test 1: Blacklist AccessToken")
    const mockToken = jwt.sign(
      { user_id: "507f191e810c19729de860ea", role: "customer" },
      envConfig.secret_key_access_token,
      { expiresIn: "15m" }
    )
    console.log(`Generated token: ${mockToken.substring(0, 50)}...`)

    await authRedisService.blacklistAccessToken(mockToken)
    const isBlacklisted = await authRedisService.isTokenBlacklisted(mockToken)
    console.log(`✅ Token blacklisted: ${isBlacklisted}`)

    const ttl = await authRedisService.getBlacklistTTL(mockToken)
    console.log(`✅ Blacklist TTL: ${ttl} seconds\n`)

    // Test 2: Store & Get RefreshToken
    console.log("Test 2: RefreshToken Storage")
    const userId = "507f191e810c19729de860ea"
    const refreshToken = "test_refresh_token_123"

    await authRedisService.storeRefreshToken(userId, refreshToken, 100 * 24 * 60 * 60)
    const storedToken = await authRedisService.getRefreshToken(userId)
    console.log(`✅ Stored token matches: ${storedToken === refreshToken}\n`)

    // Test 3: Rate Limiting
    console.log("Test 3: Rate Limiting")
    const testIp = "192.168.1.100"

    for (let i = 1; i <= 7; i++) {
      const result = await authRedisService.checkLoginAttempts(testIp)
      console.log(`Attempt ${i}: allowed=${result.allowed}, remaining=${result.remaining}`)
    }
    console.log("")

    // Test 4: Reset attempts
    console.log("Test 4: Reset Login Attempts")
    await authRedisService.resetLoginAttempts(testIp)
    const afterReset = await authRedisService.checkLoginAttempts(testIp)
    console.log(`✅ After reset: allowed=${afterReset.allowed}, remaining=${afterReset.remaining}\n`)

    // Test 5: Delete RefreshToken
    console.log("Test 5: Delete RefreshToken")
    await authRedisService.deleteRefreshToken(userId)
    const deletedToken = await authRedisService.getRefreshToken(userId)
    console.log(`✅ Token deleted: ${deletedToken === null}\n`)

    console.log("🎉 All Auth Redis tests passed!")
  } catch (error) {
    console.error("❌ Test failed:", error)
    process.exit(1)
  }
}

testAuthRedis()
