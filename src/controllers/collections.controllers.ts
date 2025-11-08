import { Request, Response, NextFunction } from "express"
import { CollectionMessage, UserMessage } from "~/constant/message"
import collectionServices from "~/services/collection.services"
import { ParamsDictionary } from "express-serve-static-core"
import { GetCollectionQuery, GetCollectionReq } from "~/models/requests/product.requests"
import { TokenPayload } from "~/models/requests/user.requests"
import { CartProduct, ProductInFavourite } from "~/models/schema/favourite_cart.order.schema"
import databaseServices from "~/services/database.services"
import { ObjectId } from "mongodb"
import { ErrorWithStatus } from "~/models/errors"
import httpStatus from "~/constant/httpStatus"
import { cartRedisService } from "~/redis/cartRedis"
import { cartSyncService } from "~/redis/cartSync"
import { guestCartHelper } from "~/utils/guestCart"

export const slugConditionMap = {
  laptop: { category: "Laptop" },
  "laptop-asus-hoc-tap-va-lam-viec": { brand: "ASUS", category: "Laptop" },
  "laptop-acer-hoc-tap-va-lam-viec": { brand: "ACER", category: "Laptop" },
  "laptop-msi-hoc-tap-va-lam-viec": { brand: "MSI", category: "Laptop" },
  "laptop-lenovo-hoc-tap-va-lam-viec": { brand: "LENOVO", category: "Laptop" },
  "laptop-duoi-15-trieu": { price: { $lt: 15000000 }, category: "Laptop" },
  "laptop-tu-15-den-20-trieu": { price: { $gte: 15000000, $lt: 20000000 }, category: "Laptop" },
  "laptop-tren-20-trieu": { price: { $gte: 20000000 }, category: "Laptop" },
  "top-10-laptop-ban-chay": { category: "Laptop" },

  "laptop-gaming": { category: "Laptop Gaming" },
  "top-10-laptop-gaming-ban-chay": { category: "Laptop Gaming" },
  "laptop-gaming-asus": { category: "Laptop Gaming", brand: "ASUS" },
  "laptop-gaming-acer": { category: "Laptop Gaming", brand: "ACER" },
  "laptop-gaming-msi": { category: "Laptop Gaming", brand: "MSI" },
  "laptop-gaming-lenovo": { category: "Laptop Gaming", brand: "LENOVO" },
  "laptop-gaming-duoi-20-trieu": { price: { $lt: 20000000 }, category: "Laptop Gaming" },
  "laptop-gaming-tu-20-den-25-trieu": { price: { $gte: 20000000, $lt: 25000000 }, category: "Laptop Gaming" },
  "laptop-gaming-tren-25-trieu": { price: { $gte: 25000000 }, category: "Laptop Gaming" },

  "pc-gvn": { category: "PC GVN" },
  "pc-gvn-rtx-5090": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5080": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5070Ti": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5060Ti": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5060": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-4060": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-3060": { category: "PC GVN", brand: "GVN" },
  "top-10-pc-ban-chay": { category: "PC GVN" },

  "man-hinh": { category: "Màn hình" },
  "top-10-man-hinh-ban-chay": { category: "Màn hình" },
  "man-hinh-samsung": { category: "Màn hình", brand: "SAMSUNG" },
  "man-hinh-asus": { category: "Màn hình", brand: "ASUS" },
  "man-hinh-dell": { category: "Màn hình", brand: "DELL" },
  "man-hinh-viewsonic": { category: "Màn hình", brand: "VIEWSONIC" },
  "man-hinh-acer": { category: "Màn hình", brand: "ACER" },
  "man-hinh-lg": { category: "Màn hình", brand: "LG" },
  "man-hinh-duoi-5-trieu": { price: { $lt: 5000000 }, category: "Màn hình" },
  "man-hinh-tu-5-den-10-trieu": { price: { $gte: 5000000, $lt: 10000000 }, category: "Màn hình" },
  "man-hinh-tu-10-den-20-trieu": { price: { $gte: 10000000, $lt: 20000000 }, category: "Màn hình" },
  "man-hinh-tren-20-trieu": { price: { $gte: 20000000 }, category: "Màn hình" },

  "ban-phim": { category: "Bàn phím" },
  "ban-phim-akko": { category: "Bàn phím", brand: "AKKO" },
  "ban-phim-aula": { category: "Bàn phím", brand: "AULA" },
  "ban-phim-dareu": { category: "Bàn phím", brand: "DARE-U" },
  "ban-phim-keychron": { category: "Bàn phím", brand: "KEYCHRON" },
  "ban-phim-corsair": { category: "Bàn phím", brand: "CORSAIR" },
  "ban-phim-asus": { category: "Bàn phím", brand: "ASUS" },
  "ban-phim-logitech": { category: "Bàn phím", brand: "LOGITECH" },
  "ban-phim-razer": { category: "Bàn phím", brand: "RAZER" },
  "ban-phim-duoi-1-trieu": { price: { $lt: 1000000 }, category: "Bàn phím" },
  "ban-phim-tu-1-den-2-trieu": { price: { $gte: 1000000, $lt: 2000000 }, category: "Bàn phím" },
  "ban-phim-tu-2-den-3-trieu": { price: { $gte: 2000000, $lt: 3000000 }, category: "Bàn phím" },
  "ban-phim-tren-3-trieu": { price: { $gte: 3000000 }, category: "Bàn phím" }
}

export const getFilterBaseOnCategory = async (req: Request, res: Response) => {
  const category = req.query.category
  const findCategory = await databaseServices.category.findOne({ name: category })
  // Lấy spec liên quan đến category
  if (category === "Laptop" || category === "Laptop Gaming") {
    const [specs_screen_size, specs_ssd, specs_ram, specs_cpu] = await Promise.all([
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Màn hình"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Ổ cứng"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Ram"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Cpu"
        })
        .toArray()
    ])

    const screenSizes = new Set<number>()
    const storages = new Set<string>()
    const rams = new Set<string>()
    const cpus = new Set<string>()

    specs_screen_size.forEach((spec) => {
      const value = spec.value.toString()

      const inchMatch = value.match(/(\d{2}\.?\d*)\s*inch/i)
      if (inchMatch) screenSizes.add(parseFloat(inchMatch[1]))
    })

    specs_ssd.forEach((spec) => {
      const value = spec.value.toString()
      const storageMatch = value.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i)
      if (storageMatch) {
        storages.add(`${storageMatch[1]}${storageMatch[2].toUpperCase()}`)
      }
    })

    specs_ram.forEach((spec) => {
      const value = spec.value.toString()
      const ramMatch = value.match(/(\d+(?:\.\d+)?)\s*GB/i)
      if (ramMatch) {
        rams.add(`${ramMatch[1]}GB`)
      }
    })

    specs_cpu.forEach((spec) => {
      const value = spec.value.toString()
      const cpuMatch = value.match(/(Core™\s*i[579]|Ryzen™(?:\s*AI)?\s*7)/i)
      if (cpuMatch) {
        cpus.add(cpuMatch[1]) // Thêm "Core™ i7" hoặc "Ryzen™ AI 7"
      }
    })
    res.json({
      screen_size_list: Array.from(screenSizes).sort((a, b) => a - b),
      ssd_list: Array.from(storages),
      ram_list: Array.from(rams),
      cpu_list: Array.from(cpus)
    })
    return
  } else if (category === "Màn hình") {
    const [specs_resolution] = await Promise.all([
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Độ phân giải"
        })
        .toArray()
    ])
  }
}

export const getCollectionsController = async (
  req: Request<ParamsDictionary, any, any, GetCollectionQuery>,
  res: Response,
  next: NextFunction
) => {
  const { slug } = req.params
  const query = req.query
  const condition = (slugConditionMap as Record<string, any>)[slug]
  const { result, total } = await collectionServices.getCollection(condition, slug, query)
  res.json({
    message: CollectionMessage.GET_COLLECTION_IS_SUCCESS,
    result,
    total
  })
}

export const getCollectionsFavouriteController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const findUser = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!findUser) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }
  const { products, total } = await collectionServices.getProductsInFavourite(user_id)
  res.json({
    message: CollectionMessage.GET_COLLECTION_FAVOURITE_IS_SUCCESS,
    result: {
      products,
      total
    }
  })
}

export const addProductToFavouriteController = async (
  req: Request<ParamsDictionary, any, ProductInFavourite>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const findUser = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!findUser) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }
  const { message } = await collectionServices.addProductToFavourite(user_id, req.body)
  res.json({
    message: message
  })
}

export const addProductToCartController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product_id, quantity } = req.body
    // Get userId (authenticated) or guestId (from header X-Guest-ID)
    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      const guestId = guestCartHelper.getGuestId(req)
      if (!guestId) {
        throw new ErrorWithStatus({
          message: "Guest ID is required. Please check X-Guest-ID header",
          status: httpStatus.BAD_REQUESTED
        })
      }
      userId = guestId
    }

    // Get product data from MongoDB
    const product = await databaseServices.product.findOne({
      _id: new ObjectId(product_id)
    })

    if (!product) {
      throw new ErrorWithStatus({
        message: "Product not found",
        status: httpStatus.NOTFOUND
      })
    }

    // ✅ Calculate price after discount
    const discount = product.discount || 0
    const priceAfterDiscount = discount > 0 ? product.price * (1 - discount / 100) : product.price

    // ✅ Add to Redis (fast, 2ms)
    const cartItem = await cartRedisService.addProduct(
      userId,
      product_id,
      {
        name: product.name,
        price: product.price,
        discount: discount,
        priceAfterDiscount: priceAfterDiscount,
        image: product.banner?.url || product.medias?.[0]?.url || "",
        quantity: 0 // Will be set by addProduct
      },
      quantity || 1
    )

    // ✅ Background sync to MongoDB (không block response)
    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Product added to cart",
      result: cartItem
    })
  } catch (error) {
    next(error)
  }
}

export const updateQuantityProductInCartController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product_id, quantity } = req.body

    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      const guestId = guestCartHelper.getGuestId(req)
      if (!guestId) {
        throw new ErrorWithStatus({
          message: "Guest ID is required",
          status: httpStatus.BAD_REQUESTED
        })
      }
      userId = guestId
    }

    if (quantity <= 0) {
      // Remove if quantity = 0
      await cartRedisService.removeProduct(userId, product_id)
    } else {
      // ✅ Check if product exists in Redis
      const existing = await cartRedisService.getProduct(userId, product_id)

      if (!existing) {
        // ⚠️ Product not in Redis, need to add it first (load from MongoDB)
        const product = await databaseServices.product.findOne({
          _id: new ObjectId(product_id)
        })

        if (!product) {
          throw new ErrorWithStatus({
            message: "Product not found",
            status: httpStatus.NOTFOUND
          })
        }

        // Calculate price after discount
        const discount = product.discount || 0
        const priceAfterDiscount = discount > 0 ? product.price * (1 - discount / 100) : product.price

        // Add to Redis first
        await cartRedisService.addProduct(
          userId,
          product_id,
          {
            name: product.name,
            price: product.price,
            discount: discount,
            priceAfterDiscount: priceAfterDiscount,
            image: product.banner?.url || product.medias?.[0]?.url || "",
            quantity: 0
          },
          quantity
        )
      } else {
        // Update existing quantity
        await cartRedisService.updateQuantity(userId, product_id, quantity)
      }
    }

    // Background sync
    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Cart updated successfully"
    })
  } catch (error) {
    next(error)
  }
}

export const clearProductInCartController = async (
  req: Request<ParamsDictionary, any, CartProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      const guestId = guestCartHelper.getGuestId(req)
      if (!guestId) {
        res.json({ message: "No cart to clear" })
        return
      }
      userId = guestId
    }

    await cartRedisService.clearCart(userId)

    // Background sync
    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Cart cleared successfully"
    })
  } catch (error) {
    next(error)
  }
}

export const getCollectionsCartController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      const guestId = guestCartHelper.getGuestId(req)

      if (!guestId) {
        res.json({
          message: "Cart is empty",
          result: { items: [], count: 0, total: 0 }
        })
        return
      }
      userId = guestId
    }

    // ✅ Get from Redis (fast, 1-2ms)
    let items = await cartRedisService.getCart(userId)

    // Fallback: nếu Redis empty và là authenticated user, try load từ MongoDB
    if (items.length === 0 && !guestCartHelper.isGuestId(userId)) {
      await cartSyncService.loadFromMongoDB(userId)
      items = await cartRedisService.getCart(userId)
    }

    // Calculate totals (dùng giá sau discount)
    const total = items.reduce((sum, item) => sum + item.priceAfterDiscount * item.quantity, 0)
    const count = items.length

    res.json({
      message: CollectionMessage.GET_COLLECTION_CART_IS_SUCCESS,
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

export const removeProductToCartController = async (
  req: Request<ParamsDictionary, any, string>,
  res: Response,
  next: NextFunction
) => {
  try {
    let userId: string
    if (req.decode_authorization) {
      userId = (req.decode_authorization as TokenPayload).user_id
    } else {
      const guestId = guestCartHelper.getGuestId(req)
      if (!guestId) {
        throw new ErrorWithStatus({
          message: "Guest ID is required",
          status: httpStatus.BAD_REQUESTED
        })
      }
      userId = guestId
    }

    const { id } = req.params
    await cartRedisService.removeProduct(userId, id)

    // Background sync
    cartSyncService.scheduleSync(userId)

    res.json({
      message: "Product removed from cart"
    })
  } catch (error) {
    next(error)
  }
}
