import redis from "./redisClient"

export interface CartItem {
  productId: string
  name: string
  price: number // Giá gốc
  discount: number // % giảm giá
  priceAfterDiscount: number // Giá sau khi giảm
  quantity: number
  image: string
  addedAt: number
}

export class CartRedisService {
  private readonly CART_TTL = 30 * 24 * 60 * 60 // 30 days

  /**
   * Get cart key
   */
  private getKey(userId: string): string {
    return `cart:${userId}`
  }

  /**
   * Add product to cart
   */
  async addProduct(
    userId: string,
    productId: string,
    productData: Omit<CartItem, "productId" | "addedAt">,
    quantity: number = 1
  ): Promise<CartItem> {
    try {
      const key = this.getKey(userId)

      // Get existing item
      const existing = await this.getProduct(userId, productId)

      const cartItem: CartItem = {
        productId,
        name: productData.name,
        price: productData.price,
        discount: productData.discount,
        priceAfterDiscount: productData.priceAfterDiscount,
        image: productData.image,
        quantity: existing ? existing.quantity + quantity : quantity,
        addedAt: existing?.addedAt || Date.now()
      }

      // Store in Redis
      await redis.hset(key, productId, JSON.stringify(cartItem))

      // Refresh TTL
      await redis.expire(key, this.CART_TTL)

      console.log(`✅ Added to cart: user=${userId}, product=${productId}, qty=${cartItem.quantity}`)

      return cartItem
    } catch (error) {
      console.error("❌ Add product to cart error:", error)
      throw error
    }
  }

  /**
   * Get single product from cart
   */
  async getProduct(userId: string, productId: string): Promise<CartItem | null> {
    try {
      const key = this.getKey(userId)
      const data = await redis.hget(key, productId)

      if (!data) return null

      return JSON.parse(data) as CartItem
    } catch (error) {
      console.error("❌ Get product from cart error:", error)
      return null
    }
  }

  /**
   * Get entire cart
   */
  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const key = this.getKey(userId)
      const data = await redis.hgetall(key)

      if (!data || Object.keys(data).length === 0) {
        return []
      }

      // Parse all items
      return Object.entries(data).map(([productId, json]) => {
        return JSON.parse(json) as CartItem
      })
    } catch (error) {
      console.error("❌ Get cart error:", error)
      return []
    }
  }

  /**
   * Update quantity
   */
  async updateQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | null> {
    try {
      const existing = await this.getProduct(userId, productId)

      if (!existing) {
        throw new Error("Product not found in cart")
      }

      // Update quantity
      existing.quantity = quantity

      const key = this.getKey(userId)
      await redis.hset(key, productId, JSON.stringify(existing))
      await redis.expire(key, this.CART_TTL)

      console.log(`✅ Updated cart: user=${userId}, product=${productId}, qty=${quantity}`)

      return existing
    } catch (error) {
      console.error("❌ Update cart quantity error:", error)
      throw error
    }
  }

  /**
   * Remove product from cart
   */
  async removeProduct(userId: string, productId: string): Promise<void> {
    try {
      const key = this.getKey(userId)
      await redis.hdel(key, productId)

      console.log(`✅ Removed from cart: user=${userId}, product=${productId}`)
    } catch (error) {
      console.error("❌ Remove product from cart error:", error)
      throw error
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    try {
      const key = this.getKey(userId)
      await redis.del(key)

      console.log(`✅ Cart cleared: user=${userId}`)
    } catch (error) {
      console.error("❌ Clear cart error:", error)
      throw error
    }
  }

  /**
   * Get cart count (số items)
   */
  async getCartCount(userId: string): Promise<number> {
    try {
      const key = this.getKey(userId)
      return await redis.hlen(key)
    } catch (error) {
      console.error("❌ Get cart count error:", error)
      return 0
    }
  }

  /**
   * Get cart total (tổng tiền)
   */
  async getCartTotal(userId: string): Promise<number> {
    try {
      const items = await this.getCart(userId)
      return items.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
    } catch (error) {
      console.error("❌ Get cart total error:", error)
      return 0
    }
  }

  /**
   * Check if product exists in cart
   */
  async hasProduct(userId: string, productId: string): Promise<boolean> {
    try {
      const key = this.getKey(userId)
      return (await redis.hexists(key, productId)) === 1
    } catch (error) {
      console.error("❌ Check product exists error:", error)
      return false
    }
  }

  /**
   * Merge guest cart vào user cart (after login)
   */
  async mergeCart(guestId: string, userId: string): Promise<void> {
    try {
      const guestKey = this.getKey(guestId)
      const userKey = this.getKey(userId)

      // Get guest cart
      const guestItems = await redis.hgetall(guestKey)

      if (!guestItems || Object.keys(guestItems).length === 0) {
        console.log("⚠️ Guest cart empty, nothing to merge")
        return
      }

      // Merge into user cart
      for (const [productId, json] of Object.entries(guestItems)) {
        const guestItem = JSON.parse(json) as CartItem
        const userItem = await this.getProduct(userId, productId)

        if (userItem) {
          // Product đã có → cộng quantity
          userItem.quantity += guestItem.quantity
          await redis.hset(userKey, productId, JSON.stringify(userItem))
        } else {
          // Product mới → add vào cart
          await redis.hset(userKey, productId, json)
        }
      }

      // Set TTL cho user cart
      await redis.expire(userKey, this.CART_TTL)

      // Delete guest cart
      await redis.del(guestKey)

      console.log(`✅ Cart merged: guest=${guestId} → user=${userId}`)
    } catch (error) {
      console.error("❌ Merge cart error:", error)
      throw error
    }
  }

  /**
   * Get TTL của cart
   */
  async getCartTTL(userId: string): Promise<number> {
    try {
      const key = this.getKey(userId)
      return await redis.ttl(key)
    } catch (error) {
      console.error("❌ Get cart TTL error:", error)
      return -1
    }
  }
}

export const cartRedisService = new CartRedisService()
