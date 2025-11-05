/**
 * TEST HIỆU SUẤT TRƯỚC KHI TÍCH HỢP REDIS
 *
 * Mô phỏng flow xử lý TRƯỚC khi có Redis:
 * - Không có token blacklist → Không check revoked tokens
 * - Không có refreshToken cache → Luôn query MongoDB
 * - Không có rate limiting → Không giới hạn login attempts
 */

process.env.NODE_ENV = process.env.NODE_ENV || "development"

import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import databaseServices from "./services/database.services"
import { envConfig } from "./utils/config"
import { RefreshToken } from "./models/schema/refreshToken.schema"

// Debug: Log connection info
console.log("🔍 Environment:", process.env.NODE_ENV)
console.log("🔍 MongoDB User:", envConfig.user_name ? "✅ Found" : "❌ Missing")
console.log("🔍 MongoDB Password:", envConfig.password ? "✅ Found" : "❌ Missing")
console.log("🔍 Database Name:", envConfig.name_database || "❌ Missing")

// Mock data
const TEST_USER_ID = new ObjectId()
const TEST_REFRESH_TOKEN = jwt.sign(
  { user_id: TEST_USER_ID.toString(), verify: 1, role: "customer" },
  "test_secret_key",
  { expiresIn: "100d" }
)

class BeforeRedisPerformanceTest {
  async connect() {
    await databaseServices.connect()
    console.log("✅ Connected to MongoDB")
  }

  async disconnect() {
    // Database service manages connection
    console.log("✅ Test completed")
  }

  /**
   * TEST 1: Login Flow (KHÔNG có rate limiting)
   */
  async testLoginFlow() {
    console.log("\n" + "=".repeat(60))
    console.log("TEST 1: LOGIN FLOW (Before Redis)")
    console.log("=".repeat(60))

    const iterations = 100
    const results: number[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()

      // ❌ TRƯỚC: Không có rate limiting check
      // Chỉ có validate credentials (query MongoDB)
      await databaseServices.users.findOne({
        email: "test@test.com",
        password: "hashed_password"
      })

      const endTime = Date.now()
      results.push(endTime - startTime)
    }

    const avgTime = results.reduce((a, b) => a + b, 0) / iterations
    const minTime = Math.min(...results)
    const maxTime = Math.max(...results)

    console.log(`\n📊 Kết quả sau ${iterations} lần test:`)
    console.log(`   - Trung bình: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Nhanh nhất: ${minTime}ms`)
    console.log(`   - Chậm nhất: ${maxTime}ms`)
    console.log(`\n⚠️  Vấn đề:`)
    console.log(`   - Không có rate limiting → Dễ bị brute force attack`)
    console.log(`   - Mỗi request đều query MongoDB → Tốn tài nguyên`)
  }

  /**
   * TEST 2: Logout Flow (KHÔNG có token blacklist)
   */
  async testLogoutFlow() {
    console.log("\n" + "=".repeat(60))
    console.log("TEST 2: LOGOUT FLOW (Before Redis)")
    console.log("=".repeat(60))

    const iterations = 100
    const results: number[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()

      // ❌ TRƯỚC: Chỉ xóa refreshToken trong MongoDB
      // Không có blacklist accessToken
      await databaseServices.refreshToken.deleteOne({
        token: TEST_REFRESH_TOKEN
      })

      const endTime = Date.now()
      results.push(endTime - startTime)
    }

    const avgTime = results.reduce((a, b) => a + b, 0) / iterations
    const minTime = Math.min(...results)
    const maxTime = Math.max(...results)

    console.log(`\n📊 Kết quả sau ${iterations} lần test:`)
    console.log(`   - Trung bình: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Nhanh nhất: ${minTime}ms`)
    console.log(`   - Chậm nhất: ${maxTime}ms`)
    console.log(`\n⚠️  Vấn đề:`)
    console.log(`   - AccessToken KHÔNG bị thu hồi ngay lập tức`)
    console.log(`   - User đã logout nhưng vẫn dùng AT cũ được (đến khi hết hạn)`)
    console.log(`   - Rủi ro bảo mật cao!`)
  }

  /**
   * TEST 3: Refresh Token Validation (Luôn query MongoDB)
   */
  async testRefreshTokenValidation() {
    console.log("\n" + "=".repeat(60))
    console.log("TEST 3: REFRESH TOKEN VALIDATION (Before Redis)")
    console.log("=".repeat(60))

    const iterations = 100
    const results: number[] = []

    // Insert test token với RefreshToken class (giống production code)
    const decoded = jwt.decode(TEST_REFRESH_TOKEN) as any
    const { iat, exp } = decoded

    await databaseServices.refreshToken.insertOne(
      new RefreshToken({
        token: TEST_REFRESH_TOKEN,
        user_id: TEST_USER_ID,
        iat: iat,
        exp: exp
      })
    )

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()

      // ❌ TRƯỚC: Luôn query MongoDB (KHÔNG có cache)
      await databaseServices.refreshToken.findOne({
        token: TEST_REFRESH_TOKEN
      })

      const endTime = Date.now()
      results.push(endTime - startTime)
    }

    const avgTime = results.reduce((a, b) => a + b, 0) / iterations
    const minTime = Math.min(...results)
    const maxTime = Math.max(...results)

    console.log(`\n📊 Kết quả sau ${iterations} lần test:`)
    console.log(`   - Trung bình: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Nhanh nhất: ${minTime}ms`)
    console.log(`   - Chậm nhất: ${maxTime}ms`)
    console.log(`\n⚠️  Vấn đề:`)
    console.log(`   - Mỗi lần refresh token đều query MongoDB`)
    console.log(`   - Không có cache → Hiệu suất kém`)
    console.log(`   - Tốn tài nguyên database`)

    // Cleanup
    await databaseServices.refreshToken.deleteOne({
      token: TEST_REFRESH_TOKEN
    })
  }

  /**
   * TEST 4: Access Token Validation (Không check blacklist)
   */
  async testAccessTokenValidation() {
    console.log("\n" + "=".repeat(60))
    console.log("TEST 4: ACCESS TOKEN VALIDATION (Before Redis)")
    console.log("=".repeat(60))

    const iterations = 100
    const results: number[] = []

    const testAccessToken = jwt.sign(
      { user_id: TEST_USER_ID.toString(), verify: 1, role: "customer" },
      "test_secret_key",
      { expiresIn: "15m" }
    )

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()

      // ❌ TRƯỚC: Chỉ verify JWT, KHÔNG check blacklist
      try {
        jwt.verify(testAccessToken, "test_secret_key")
      } catch (error) {
        // Token expired or invalid
      }

      const endTime = Date.now()
      results.push(endTime - startTime)
    }

    const avgTime = results.reduce((a, b) => a + b, 0) / iterations
    const minTime = Math.min(...results)
    const maxTime = Math.max(...results)

    console.log(`\n📊 Kết quả sau ${iterations} lần test:`)
    console.log(`   - Trung bình: ${avgTime.toFixed(2)}ms`)
    console.log(`   - Nhanh nhất: ${minTime}ms`)
    console.log(`   - Chậm nhất: ${maxTime}ms`)
    console.log(`\n⚠️  Vấn đề:`)
    console.log(`   - Không check blacklist → Token đã logout vẫn dùng được`)
    console.log(`   - Phải đợi đến khi token hết hạn (15 phút)`)
    console.log(`   - Rủi ro bảo mật cao!`)
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("\n" + "█".repeat(60))
    console.log("🔴 TEST HIỆU SUẤT: TRƯỚC KHI TÍCH HỢP REDIS")
    console.log("█".repeat(60))

    await this.connect()

    await this.testLoginFlow()
    await this.testLogoutFlow()
    await this.testRefreshTokenValidation()
    await this.testAccessTokenValidation()

    console.log("\n" + "█".repeat(60))
    console.log("📋 TỔNG KẾT:")
    console.log("█".repeat(60))
    console.log("\n❌ Những vấn đề cần giải quyết:")
    console.log("   1. Không có rate limiting → Dễ bị brute force")
    console.log("   2. Không có token blacklist → Token sau logout vẫn dùng được")
    console.log("   3. Không có refreshToken cache → Query MongoDB mỗi lần")
    console.log("   4. Hiệu suất phụ thuộc hoàn toàn vào MongoDB")
    console.log("\n💡 Giải pháp: TÍCH HỢP REDIS!")
    console.log("   → Xem kết quả trong file: test-performance-after-redis.ts")
    console.log("\n")

    await this.disconnect()
  }
}

// Run test
const test = new BeforeRedisPerformanceTest()
test.runAllTests().catch(console.error)
