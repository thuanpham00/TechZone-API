import Product from "~/models/schema/product.schema"
import databaseServices from "./database.services"
import { ObjectId } from "mongodb"
import { ConditionQuery, GetCollectionQuery } from "~/models/requests/product.requests"
import { Cart, CartProduct, Favourite, ProductInFavourite } from "~/models/schema/favourite_cart.order.schema"
import { CollectionMessage } from "~/constant/message"

class CollectionServices {
  // query lọc sản phẩm theo collection
  private async filterCollectionProducts(condition: ConditionQuery, slug: string, match: any) {
    if (slug.includes("5090")) {
      match["name"] = { $regex: "rtx 5090", $options: "i" } // Tìm kiếm sản phẩm có tên chứa "rtx 5090"
    } else if (slug.includes("5080")) {
      match["name"] = { $regex: "rtx 5080", $options: "i" }
    } else if (slug.includes("5070Ti")) {
      match["name"] = { $regex: "rtx 5070Ti", $options: "i" }
    } else if (slug.includes("5060Ti")) {
      match["name"] = { $regex: "rtx 5060Ti", $options: "i" }
    } else if (slug.includes("5060")) {
      match["name"] = { $regex: "rtx 5060(?!Ti)\\b", $options: "i" }
    } else if (slug.includes("4060")) {
      match["name"] = { $regex: "rtx 4060", $options: "i" }
    } else if (slug.includes("3060")) {
      match["name"] = { $regex: "rtx 3060", $options: "i" }
    }

    if (condition.price) {
      match["$expr"] = {
        $and: [] // Dùng $and vì cần đồng thời kiểm tra cả $gte và $lt nếu có.
      }
      if (condition.price.$gte) {
        match["$expr"]["$and"].push({
          $gte: [
            {
              $subtract: [
                "$price",
                {
                  $cond: {
                    if: { $lt: ["$discount", 1] }, // Nếu discount < 1 → Là %
                    then: { $multiply: ["$price", "$discount"] },
                    else: { $multiply: ["$price", { $divide: ["$discount", 100] }] } // Nếu discount là số nguyên (52%)
                  }
                }
              ]
            },
            condition.price.$gte
          ]
        })
      }
      if (condition.price.$lt) {
        match["$expr"]["$and"].push({
          $lt: [
            {
              $subtract: [
                "$price",
                {
                  $cond: {
                    if: { $lt: ["$discount", 1] }, // Nếu discount < 1 → Là %
                    then: { $multiply: ["$price", "$discount"] },
                    else: { $multiply: ["$price", { $divide: ["$discount", 100] }] } // Nếu discount là số nguyên (52%)
                  }
                }
              ]
            },
            condition.price.$lt
          ]
        })
      }
      if (match["$expr"]["$and"].length === 0) {
        delete match["$expr"]
      }
    }
  }

  private async addSpecificationFilters(query: GetCollectionQuery, specConditions: any[]) {
    if (query.screen_size) {
      // trả về các thông số kĩ thuật includes cái query.screen_size
      const res = await databaseServices.specification
        .find({ value: { $regex: `${query.screen_size}inch`, $options: "i" }, name: "Màn hình" })
        .toArray()
        .then((res) => res.map((item) => item._id))

      if (res.length) {
        specConditions.push({
          specifications: { $in: res }
        })
      }
    }

    if (query.cpu) {
      const res = await databaseServices.specification
        .find({ value: { $regex: `${query.cpu}`, $options: "i" }, name: "Cpu" })
        .toArray()
        .then((res) => res.map((item) => item._id))

      if (res.length) {
        specConditions.push({
          specifications: { $in: res }
        })
      }
    }

    if (query.ram) {
      const res = await databaseServices.specification
        .find({ value: { $regex: `${query.ram}`, $options: "i" }, name: "Ram" })
        .toArray()
        .then((res) => res.map((item) => item._id))

      if (res.length) {
        specConditions.push({
          specifications: { $in: res }
        })
      }
    }

    if (query.ssd) {
      const res = await databaseServices.specification
        .find({ value: { $regex: `${query.ssd}`, $options: "i" }, name: "Ổ cứng" })
        .toArray()
        .then((res) => res.map((item) => item._id))

      if (res.length) {
        specConditions.push({
          specifications: { $in: res }
        })
      }
    }
  }

  private addSortFieldsToPipeline(query: GetCollectionQuery, resultPipeline: any[]) {
    if (
      query.sort &&
      (query.sort === "name_asc" ||
        query.sort === "name_desc" ||
        query.sort === "price_asc" ||
        query.sort === "price_desc")
    ) {
      resultPipeline.push({
        $addFields: {
          sortableName: {
            $trim: {
              input: {
                // Sử dụng $cond để check category và xóa prefix tương ứng
                $switch: {
                  branches: [
                    {
                      case: { $eq: [{ $arrayElemAt: ["$category", 0] }, "Laptop gaming"] },
                      then: {
                        $replaceAll: {
                          input: "$name",
                          find: "Laptop Gaming",
                          replacement: ""
                        }
                      }
                    },
                    {
                      case: { $eq: [{ $arrayElemAt: ["$category", 0] }, "Laptop"] },
                      then: {
                        $replaceAll: {
                          input: "$name",
                          find: "Laptop",
                          replacement: ""
                        }
                      }
                    },
                    {
                      case: { $eq: [{ $arrayElemAt: ["$category", 0] }, "Màn hình"] },
                      then: {
                        $replaceAll: {
                          input: "$name",
                          find: "Màn hình",
                          replacement: ""
                        }
                      }
                    },
                    {
                      case: { $eq: [{ $arrayElemAt: ["$category", 0] }, "PC GVN"] },
                      then: {
                        $replaceAll: {
                          input: "$name",
                          find: "PC GVN",
                          replacement: ""
                        }
                      }
                    },
                    {
                      case: { $eq: [{ $arrayElemAt: ["$category", 0] }, "Bàn phím"] },
                      then: {
                        $replaceAll: {
                          input: "$name",
                          find: "Bàn phím",
                          replacement: ""
                        }
                      }
                    }
                  ],
                  default: "$name" // Nếu không match category nào thì giữ nguyên tên
                }
              }
            }
          },
          finalPrice: {
            $subtract: [
              "$price",
              {
                $cond: {
                  if: { $lt: ["$discount", 1] },
                  then: { $multiply: ["$price", "$discount"] },
                  else: { $multiply: ["$price", { $divide: ["$discount", 100] }] }
                }
              }
            ]
          }
        }
      })
    }
  }

  async getCollection(condition: ConditionQuery, slug: string, query: GetCollectionQuery) {
    const $match: any = {}
    const checkBanChay = slug.includes("ban-chay") // Check trước

    if (condition.category) {
      const categoryId = await databaseServices.category.findOne({ name: condition.category }).then((res) => res?._id)
      $match["category"] = categoryId
    }
    if (condition.brand) {
      const brandId = await databaseServices.brand.findOne({ name: condition.brand }).then((res) => res?._id)
      $match["brand"] = brandId
    }

    if (checkBanChay) {
      // Lấy top 10 bán chạy TRƯỚC (không filter gì cả)
      const top10BestSellers = await databaseServices.product
        .aggregate([
          { $match },
          { $sort: { sold: -1 } },
          { $limit: 10 },
          { $project: { _id: 1 } } // Chỉ lấy _id
        ])
        .toArray()

      const top10Ids = top10BestSellers.map((item) => item._id)
      Object.keys($match).forEach((key) => delete $match[key])
      $match["_id"] = { $in: top10Ids }
    } else {
      // Trường hợp bình thường: áp dụng tất cả filters
      await this.filterCollectionProducts(condition, slug, $match)
    }

    if (query.status) {
      if (query.status === "all") {
        // không lọc
        $match["status"] = {
          $in: ["available", "out_of_stock", "discontinued"] // lấy hết
        }
      } else {
        $match["status"] = query.status
      }
    }

    const specConditions: any[] = []
    await this.addSpecificationFilters(query, specConditions)
    if (specConditions.length > 0) {
      $match["$and"] = ($match["$and"] || []).concat(specConditions)
    }

    const basePipeline: any[] = [
      { $match },
      {
        $lookup: {
          from: "category",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $addFields: {
          category: {
            $map: {
              input: "$category",
              as: "cate",
              in: "$$cate.name"
            }
          }
        }
      },
      {
        $lookup: {
          from: "brand",
          localField: "brand",
          foreignField: "_id",
          as: "brand"
        }
      },
      {
        $addFields: {
          brand: {
            $map: {
              input: "$brand",
              as: "bra",
              in: "$$bra.name"
            }
          }
        }
      }
    ]

    const resultPipeline = [...basePipeline]

    if (query.sort) {
      this.addSortFieldsToPipeline(query, resultPipeline)
      const sortStage: any = {}

      switch (query.sort) {
        case "name_asc":
          sortStage.sortableName = 1
          break
        case "name_desc":
          sortStage.sortableName = -1
          break
        case "price_asc":
          sortStage.finalPrice = 1
          break
        case "price_desc":
          sortStage.finalPrice = -1
          break
      }

      resultPipeline.push({ $sort: sortStage })
    } else if (checkBanChay) {
      // ✅ CHỈ khi không có query.sort VÀ là bán chạy → Sort theo sold
      resultPipeline.push({ $sort: { sold: -1 } })
    }

    // Xóa các field không cần thiết
    const projectFields: any = {
      updated_at: 0,
      created_at: 0,
      stock: 0,
      description: 0,
      gifts: 0
    }

    if (query.sort) {
      projectFields.sortableName = 0
      projectFields.finalPrice = 0
    }

    resultPipeline.push({
      $project: projectFields
    })

    const [result, total] = await Promise.all([
      databaseServices.product.aggregate<Product>(resultPipeline).toArray(),
      databaseServices.product
        .aggregate([
          ...basePipeline,
          {
            $project: {
              updated_at: 0,
              created_at: 0,
              stock: 0,
              description: 0,
              gifts: 0
            }
          },
          {
            $count: "total"
          }
        ])
        .toArray()
    ])

    const collections = result.map((item) => item._id as ObjectId)
    const date = new Date()
    // cập nhật DB
    await databaseServices.product.updateMany(
      {
        _id: {
          $in: collections
        }
      },
      {
        $inc: {
          viewCount: 1
        },
        $set: {
          updated_at: date
        }
      }
    )
    // cập nhật kết quả trả về
    result.forEach((item) => {
      item.viewCount += 1
    })
    return {
      result: result,
      total: total[0]?.total || 0
    }
  }

  async addProductToFavourite(userId: string, product: ProductInFavourite) {
    const date = new Date()
    const existingFavourite = await databaseServices.favourite.findOne({ user_id: new ObjectId(userId) })
    let message = ""
    if (existingFavourite) {
      // Cập nhật danh sách sản phẩm trong mục yêu thích
      const existsProduct = await databaseServices.favourite.findOne({
        user_id: new ObjectId(userId),
        "products.product_id": new ObjectId(product.product_id)
      })

      if (existsProduct) {
        await databaseServices.favourite.updateOne(
          { user_id: new ObjectId(userId) },
          { $pull: { products: { product_id: new ObjectId(product.product_id) } } } // nếu đã tồn tại trong danh sách thì xóa đi (click lần 1 thêm vào và click lần 2 sẽ xóa đi)
        )
        message = CollectionMessage.DELETE_PRODUCT_FAVOURITE_IS_SUCCESS
      } else {
        await databaseServices.favourite.updateOne(
          { user_id: new ObjectId(userId) },
          {
            $addToSet: {
              products: {
                product_id: new ObjectId(product.product_id),
                added_at: date
              }
            },
            $set: { updated_at: date }
          }
        )
        message = CollectionMessage.ADD_PRODUCT_FAVOURITE_IS_SUCCESS
      }
    } else {
      // Tạo mới mục yêu thích
      const newFavourite = {
        user_id: new ObjectId(userId),
        products: [
          {
            product_id: new ObjectId(product.product_id),
            added_at: date
          }
        ],
        created_at: date,
        updated_at: date
      }
      await databaseServices.favourite.insertOne(new Favourite(newFavourite))

      message = CollectionMessage.ADD_PRODUCT_FAVOURITE_IS_SUCCESS
    }

    return {
      message: message
    }
  }

  async getProductsInFavourite(userId: string) {
    const favouriteUserId = await databaseServices.favourite.findOne({ user_id: new ObjectId(userId) })
    if (favouriteUserId === null) {
      return {
        products: [],
        total: 0
      }
    }

    const favourite = await databaseServices.favourite
      .aggregate([
        {
          $match: { user_id: new ObjectId(userId) }
        },
        {
          $lookup: {
            from: "product",
            localField: "products.product_id",
            foreignField: "_id",
            as: "products"
          }
        },
        {
          $project: {
            updated_at: 0,
            created_at: 0,
            user_id: 0,
            _id: 0
          }
        }
      ])
      .toArray()
    const total = favourite[0].products.length
    return {
      products: favourite,
      total: total
    }
  }

  async addProductToCart(userId: string, product: CartProduct) {
    const date = new Date()
    const existingCartOfUserID = await databaseServices.cart.findOne({ user_id: new ObjectId(userId) })
    let message = ""
    // nếu tồn tại giỏ hàng của userId
    if (existingCartOfUserID) {
      const existsProduct = await databaseServices.cart.findOne({
        user_id: new ObjectId(userId),
        "products.product_id": new ObjectId(product.product_id)
      })

      // nếu tồn tại sản phẩm trong giỏ hàng thì cập nhật số lượng
      if (existsProduct) {
        await databaseServices.cart.updateOne(
          { user_id: new ObjectId(userId), "products.product_id": new ObjectId(product.product_id) },
          {
            $inc: { "products.$.quantity": product.quantity },
            $set: { updated_at: date }
          }
        )
        message = CollectionMessage.UPDATE_PRODUCT_CART_IS_SUCCESS
      } else {
        // nếu sản phẩm chưa tồn tại trong giỏ hàng thì thêm sản phẩm vào giỏ hàng
        await databaseServices.cart.updateOne(
          { user_id: new ObjectId(userId) },
          {
            $addToSet: {
              products: {
                product_id: new ObjectId(product.product_id),
                quantity: product.quantity,
                added_at: date
              }
            },
            $set: { updated_at: date }
          }
        )
        message = CollectionMessage.ADD_PRODUCT_CART_IS_SUCCESS
      }
    } else {
      const newCart = {
        user_id: new ObjectId(userId),
        products: [
          {
            product_id: new ObjectId(product.product_id),
            quantity: product.quantity,
            added_at: date
          }
        ],
        created_at: date,
        updated_at: date
      }
      await databaseServices.cart.insertOne(new Cart(newCart))

      message = CollectionMessage.ADD_PRODUCT_CART_IS_SUCCESS
    }

    return {
      message: message
    }
  }

  async updateQuantityProductToCart(userId: string, product: CartProduct) {
    const date = new Date()
    await databaseServices.cart.updateOne(
      { user_id: new ObjectId(userId), "products.product_id": new ObjectId(product.product_id) },
      {
        $set: { updated_at: date, "products.$.quantity": product.quantity }
      }
    )

    return {
      message: CollectionMessage.UPDATE_PRODUCT_CART_IS_SUCCESS
    }
  }

  async getProductsInCart(user_id: string) {
    const cartUserId = await databaseServices.cart.findOne({ user_id: new ObjectId(user_id) })
    if (cartUserId === null) {
      return {
        products: [],
        total: 0
      }
    }
    const cart = await databaseServices.cart
      .aggregate([
        { $match: { user_id: new ObjectId(user_id) } },
        { $unwind: "$products" },
        {
          $lookup: {
            from: "product",
            localField: "products.product_id",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        {
          $addFields: {
            "productInfo.added_at": "$products.added_at",
            "productInfo.quantity": "$products.quantity"
          }
        },
        {
          $group: {
            _id: "$_id",
            products: { $push: "$productInfo" }
          }
        },
        {
          $project: {
            products: 1,
            _id: 0
          }
        }
      ])
      .toArray()

    const total = cart[0].products.length
    return {
      products: cart,
      total: total
    }
  }

  async removeProductToCart(userId: string, productId: string) {
    await databaseServices.cart.updateOne(
      {
        user_id: new ObjectId(userId)
      },
      {
        $pull: {
          products: {
            product_id: new ObjectId(productId)
          }
        }
      }
    )
    const cart = await databaseServices.cart.findOne({ user_id: new ObjectId(userId) })
    if (!cart?.products || cart?.products.length === 0) {
      await databaseServices.cart.deleteOne({ user_id: new ObjectId(userId) })
      return {
        message: CollectionMessage.CLEAR_PRODUCT_CART_IS_SUCCESS
      }
    }
    return {
      message: CollectionMessage.DELETE_PRODUCT_CART_IS_SUCCESS
    }
  }

  async clearProductToCart(userId: string) {
    await databaseServices.cart.deleteOne({
      user_id: new ObjectId(userId)
    })
    return {
      message: CollectionMessage.CLEAR_PRODUCT_CART_IS_SUCCESS
    }
  }
}

const collectionServices = new CollectionServices()

export default collectionServices
