import { cartRedisService } from "./cartRedis"
import databaseServices from "~/services/database.services"
import { ObjectId } from "mongodb"
import { guestCartHelper } from "~/utils/guestCart"
import redis from "./redisClient"

export class CartSyncService {
  /**
   * Sync Redis cart to MongoDB
   * CHỈ sync cho authenticated users
   */
  async syncToMongoDB(userId: string): Promise<void> {
    try {
      // ❌ KHÔNG sync nếu là guest
      if (guestCartHelper.isGuestId(userId)) {
        console.log(`⚠️ Skip MongoDB sync for guest: ${userId}`)
        return
      }

      const items = await cartRedisService.getCart(userId)

      if (items.length === 0) {
        // Xóa cart trong MongoDB nếu Redis empty
        await databaseServices.cart.deleteOne({
          user_id: new ObjectId(userId)
        })
        return
      }

      // Convert to MongoDB format
      const products = items.map((item) => ({
        product_id: new ObjectId(item.productId),
        quantity: item.quantity,
        // Store snapshot để backup
        price_snapshot: item.price,
        discount_snapshot: item.discount,
        price_after_discount_snapshot: item.priceAfterDiscount,
        name_snapshot: item.name,
        image_snapshot: item.image,
        added_at: new Date(item.addedAt)
      }))

      // Upsert MongoDB
      await databaseServices.cart.updateOne(
        { user_id: new ObjectId(userId) },
        {
          $set: {
            products,
            updated_at: new Date()
          }
        },
        { upsert: true }
      )
    } catch (error) {
      console.error("❌ Sync to MongoDB error:", error)
    }
  }

  /**
   * Load MongoDB cart to Redis (fallback, restore)
   */
  async loadFromMongoDB(userId: string): Promise<void> {
    try {
      const cart = await databaseServices.cart.findOne({
        user_id: new ObjectId(userId)
      })

      if (!cart || !cart.products || cart.products.length === 0) {
        console.log("⚠️ No cart in MongoDB to restore")
        return
      }

      // Add each product to Redis
      for (const item of cart.products) {
        const productId = item.product_id.toString()

        // ✅ Check if snapshot có discount/priceAfterDiscount
        // Nếu không có (cart cũ), query product để lấy giá mới
        let discount = item.discount_snapshot || 0
        let priceAfterDiscount = item.price_after_discount_snapshot || item.price_snapshot || 0

        // ⚠️ Nếu cart cũ không có discount_snapshot, fetch product
        if (!item.discount_snapshot && !item.price_after_discount_snapshot) {
          try {
            const product = await databaseServices.product.findOne({
              _id: new ObjectId(productId)
            })
            if (product) {
              discount = product.discount || 0
              priceAfterDiscount = discount > 0 ? product.price * (1 - discount / 100) : product.price
            }
          } catch (err) {
            console.error(`❌ Failed to fetch product ${productId}:`, err)
          }
        }

        // Set item vào Redis với quantity từ MongoDB
        const cartItem = {
          productId,
          name: item.name_snapshot || "Unknown",
          price: item.price_snapshot || 0,
          discount: discount,
          priceAfterDiscount: priceAfterDiscount,
          image: item.image_snapshot || "",
          quantity: item.quantity,
          addedAt: item.added_at.getTime()
        }

        const key = `cart:${userId}`
        await redis.hset(key, productId, JSON.stringify(cartItem))
      }

      // Set TTL
      const key = `cart:${userId}`
      await redis.expire(key, 30 * 24 * 60 * 60) // 30 days

      console.log(`✅ Cart loaded from MongoDB: user=${userId}, items=${cart.products.length}`)
    } catch (error) {
      console.error("❌ Load from MongoDB error:", error)
    }
  }

  /**
   * Schedule background sync (call này sau mỗi cart operation)
   */
  scheduleSync(userId: string, delayMs: number = 5000): void {
    // ❌ KHÔNG schedule sync cho guest
    if (guestCartHelper.isGuestId(userId)) {
      return
    }

    // Debounce: nếu có nhiều operations liên tiếp, chỉ sync 1 lần
    clearTimeout((global as any)[`cartSync:${userId}`])
    ;(global as any)[`cartSync:${userId}`] = setTimeout(() => {
      this.syncToMongoDB(userId).catch((err) => {
        console.error("Background sync failed:", err)
      })
    }, delayMs)
  }
}

export const cartSyncService = new CartSyncService()
