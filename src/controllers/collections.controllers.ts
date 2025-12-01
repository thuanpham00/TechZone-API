import { Request, Response, NextFunction } from "express"
import { CollectionMessage, UserMessage } from "~/constant/message"
import collectionServices from "~/services/collection.services"
import { ParamsDictionary } from "express-serve-static-core"
import { GetCollectionQuery } from "~/models/requests/product.requests"
import { TokenPayload } from "~/models/requests/user.requests"
import { CartProduct, ProductInFavourite } from "~/models/schema/favourite_cart.order.schema"
import databaseServices from "~/services/database.services"
import { ObjectId } from "mongodb"
import { ErrorWithStatus } from "~/models/errors"
import httpStatus from "~/constant/httpStatus"
import { slugConditionMap, slugTop10Product } from "~/constant/slug"

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
    const resolutions = new Set<string>()
    const type_screens = new Set<string>()
    const screen_panel = new Set<string>()
    const screen_size = new Set<string>()

    const [specs_resolution, specs_type_screen, specs_screen_panel, specs_screen_size] = await Promise.all([
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Độ phân giải"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Kiểu màn hình"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Tấm nền"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Kích thước"
        })
        .toArray()
    ])

    specs_resolution.forEach((spec) => {
      const value = spec.value.toString()
      if (resolutions.has(value) === false) {
        resolutions.add(value)
      }
    })
    specs_type_screen.forEach((spec) => {
      const value = spec.value.toString()
      if (type_screens.has(value) === false) {
        type_screens.add(value)
      }
    })
    specs_screen_panel.forEach((spec) => {
      const value = spec.value.toString()
      if (screen_panel.has(value) === false) {
        screen_panel.add(value)
      }
    })
    specs_screen_size.forEach((spec) => {
      const value = spec.value.toString()
      if (screen_size.has(value) === false) {
        screen_size.add(value)
      }
    })

    res.json({
      specs_resolution: Array.from(resolutions),
      specs_type_screen: Array.from(type_screens),
      specs_screen_panel: Array.from(screen_panel),
      specs_screen_size: Array.from(screen_size)
    })
    return
  } else if (category === "Bàn phím") {
    const layouts = new Set<string>()
    const leds = new Set<string>()

    const [specs_layouts, specs_leds] = await Promise.all([
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),

          name: "Layout"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Led"
        })
        .toArray()
    ])

    specs_layouts.forEach((spec) => {
      const value = spec.value.toString()
      if (layouts.has(value) === false) {
        layouts.add(value)
      }
    })

    specs_leds.forEach((spec) => {
      const value = spec.value.toString()
      if (leds.has(value) === false) {
        leds.add(value)
      }
    })

    res.json({
      specs_layout: Array.from(layouts),
      specs_led: Array.from(leds)
    })
    return
  } else if (category === "Chuột") {
    const colors = new Set<string>()
    const connections = new Set<string>()
    const [specs_colors, specs_connections] = await Promise.all([
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),

          name: "Màu sắc"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Kết nối"
        })
        .toArray()
    ])

    specs_colors.forEach((spec) => {
      const value = spec.value.toString()
      if (colors.has(value) === false) {
        colors.add(value)
      }
    })

    specs_connections.forEach((spec) => {
      const value = spec.value.toString()
      if (connections.has(value) === false) {
        connections.add(value)
      }
    })

    res.json({
      specs_color: Array.from(colors),
      specs_type_connect: Array.from(connections)
    })
    return
  } else if (category === "Tai nghe") {
    const colors = new Set<string>()
    const connections = new Set<string>()
    const [specs_colors, specs_connections] = await Promise.all([
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),

          name: "Màu sắc"
        })
        .toArray(),
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Kết nối"
        })
        .toArray()
    ])

    specs_colors.forEach((spec) => {
      const value = spec.value.toString()
      if (colors.has(value) === false) {
        colors.add(value)
      }
    })

    specs_connections.forEach((spec) => {
      const value = spec.value.toString()
      if (connections.has(value) === false) {
        connections.add(value)
      }
    })

    res.json({
      specs_color: Array.from(colors),
      specs_type_connect: Array.from(connections)
    })
    return
  } else if (category === "RAM, SSD, HDD") {
    const colors = new Set<string>()
    const [specs_colors] = await Promise.all([
      databaseServices.specification
        .find({
          category_id: new ObjectId(findCategory?._id),
          name: "Màu sắc"
        })
        .toArray()
    ])

    specs_colors.forEach((spec) => {
      const value = spec.value.toString()
      if (colors.has(value) === false) {
        colors.add(value)
      }
    })

    res.json({
      specs_color: Array.from(colors)
    })
    return
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

export const getCollectionsTop10ProductController = async (
  req: Request<ParamsDictionary, any, any, GetCollectionQuery>,
  res: Response,
  next: NextFunction
) => {
  const entries = Object.entries(slugTop10Product)

  const pairs = await Promise.all(
    entries.map(async ([key, value]) => {
      const { result, total } = await collectionServices.getCollection(value, key)
      return [key, { result, total }] as const
    })
  )
  const resultsObj = Object.fromEntries(pairs)

  res.json({
    message: CollectionMessage.GET_COLLECTION_IS_SUCCESS,
    result: resultsObj, // hoặc đổi thành dạng bạn muốn (flatten, map theo slug...)
    total: Object.values(resultsObj).reduce((sum, r) => sum + (r.total || 0), 0)
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
  req: Request<ParamsDictionary, any, CartProduct>,
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
  const { message } = await collectionServices.addProductToCart(user_id, req.body)
  res.json({
    message: message
  })
}

export const updateQuantityProductInCartController = async (
  req: Request<ParamsDictionary, any, CartProduct>,
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
  const { message } = await collectionServices.updateQuantityProductToCart(user_id, req.body)
  res.json({
    message: message
  })
}

export const clearProductInCartController = async (
  req: Request<ParamsDictionary, any, CartProduct>,
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
  const { message } = await collectionServices.clearProductToCart(user_id)
  res.json({
    message: message
  })
}

export const getCollectionsCartController = async (
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
  const { products, total } = await collectionServices.getProductsInCart(user_id)
  res.json({
    message: CollectionMessage.GET_COLLECTION_CART_IS_SUCCESS,
    result: {
      products,
      total
    }
  })
}

export const removeProductToCartController = async (
  req: Request<ParamsDictionary, any, string>,
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
  const { id } = req.params
  const { message } = await collectionServices.removeProductToCart(user_id, id)
  res.json({
    message: message
  })
}
