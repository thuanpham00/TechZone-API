import Redis from 'ioredis'
import { envConfig } from '~/utils/config'

class RedisClient {
  private static instance: Redis | null = null

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: envConfig.redis_host,
        port: envConfig.redis_port,
        password: envConfig.redis_password,
        db: envConfig.redis_db || 0,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          console.log(`⚠️ Redis connection retry attempt ${times}, waiting ${delay}ms`)
          return delay
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false
      })

      // Event listeners
      RedisClient.instance.on('connect', () => {
        console.log('✅ Redis connected successfully')
      })

      RedisClient.instance.on('ready', () => {
        console.log('✅ Redis ready to accept commands')
      })

      RedisClient.instance.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message)
      })

      RedisClient.instance.on('close', () => {
        console.log('⚠️ Redis connection closed')
      })

      RedisClient.instance.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...')
      })
    }

    return RedisClient.instance
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit()
      RedisClient.instance = null
      console.log('✅ Redis disconnected')
    }
  }

  // Health check
  public static async ping(): Promise<boolean> {
    try {
      const instance = RedisClient.getInstance()
      const result = await instance.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('❌ Redis ping failed:', error)
      return false
    }
  }
}

// Export singleton instance
const redis = RedisClient.getInstance()

export default redis
export { RedisClient }
