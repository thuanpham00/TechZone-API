import redis from "./redisClient"
import jwt from "jsonwebtoken"

export class AuthRedisService {
  /**
   * Blacklist accessToken khi logout
   */
  async blacklistAccessToken(accessToken: string): Promise<void> {
    try {
      const decoded = jwt.decode(accessToken) as any

      if (!decoded || !decoded.exp) {
        throw new Error("Invalid token format")
      }

      const now = Math.floor(Date.now() / 1000)
      const ttl = decoded.exp - now

      if (ttl > 0) {
        await redis.setex(`blacklist:${accessToken}`, ttl, "1")
        console.log(`✅ Token blacklisted: user_id=${decoded.user_id}, TTL=${ttl}s`)
      } else {
        console.log("⚠️ Token already expired, skip blacklist")
      }
    } catch (error) {
      console.error("❌ Blacklist token error:", error)
      throw error
    }
  }

  /**
   * Check token có bị blacklist không
   */
  async isTokenBlacklisted(accessToken: string): Promise<boolean> {
    try {
      const exists = await redis.exists(`blacklist:${accessToken}`)
      return exists === 1
    } catch (error) {
      console.error("❌ Check blacklist error:", error)
      return false
    }
  }

  /**
   * Get remaining TTL of blacklisted token
   */
  async getBlacklistTTL(accessToken: string): Promise<number> {
    try {
      return await redis.ttl(`blacklist:${accessToken}`)
    } catch (error) {
      console.error("❌ Get blacklist TTL error:", error)
      return -1
    }
  }

  /**
   * Store refreshToken vào Redis cache
   */
  async storeRefreshToken(userId: string, token: string, ttlSeconds: number): Promise<void> {
    try {
      await redis.setex(`refresh:${userId}`, ttlSeconds, token)
      console.log(`✅ RefreshToken stored: userId=${userId}, TTL=${ttlSeconds}s`)
    } catch (error) {
      console.error("❌ Store refresh token error:", error)
      throw error
    }
  }

  /**
   * Get refreshToken từ Redis cache
   */
  async getRefreshToken(userId: string): Promise<string | null> {
    try {
      return await redis.get(`refresh:${userId}`)
    } catch (error) {
      console.error("❌ Get refresh token error:", error)
      return null
    }
  }

  /**
   * Delete refreshToken khi logout
   */
  async deleteRefreshToken(userId: string): Promise<void> {
    try {
      await redis.del(`refresh:${userId}`)
      console.log(`✅ RefreshToken deleted: userId=${userId}`)
    } catch (error) {
      console.error("❌ Delete refresh token error:", error)
      throw error
    }
  }

  /**
   * Check login attempts (rate limiting)
   */
  async checkLoginAttempts(
    ip: string,
    email?: string // Thêm email
  ): Promise<{ allowed: boolean; remaining: number }> {
    // Check cả 2: IP và Email
    const ipKey = `login:attempts:ip:${ip}`
    const emailKey = email ? `login:attempts:email:${email}` : null

    const ipAttempts = await redis.incr(ipKey)
    const emailAttempts = emailKey ? await redis.incr(emailKey) : 0

    // Set TTL
    if (ipAttempts === 1) await redis.expire(ipKey, 900)
    if (emailAttempts === 1) await redis.expire(emailKey as string, 900)

    /**
     * Block nếu 1 trong 2 vượt quá
     * Attacker đổi IP → Vẫn bị block theo email!
       Attacker đổi email → Vẫn bị block theo IP!
     */

    const ipAllowed = ipAttempts <= 5
    const emailAllowed = emailAttempts <= 5

    return {
      allowed: ipAllowed && emailAllowed,
      remaining: Math.min(5 - ipAttempts, 5 - emailAttempts)
    }
  }

  /**
   * Reset login attempts sau khi login thành công
   */
  async resetLoginAttempts(ip: string, email?: string): Promise<void> {
    try {
      const ipKey = `login:attempts:ip:${ip}`
      const emailKey = email ? `login:attempts:email:${email}` : null

      // Xóa cả 2 keys (IP và Email)
      await redis.del(ipKey)
      if (emailKey) {
        await redis.del(emailKey)
      }

      console.log(`✅ Login attempts reset: ip=${ip}${email ? `, email=${email}` : ""}`)
    } catch (error) {
      console.error("❌ Reset login attempts error:", error)
    }
  }
}

export const authRedisService = new AuthRedisService()
