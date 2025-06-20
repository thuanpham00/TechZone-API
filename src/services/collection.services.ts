import Product from "~/models/schema/product.schema"
import databaseServices from "./database.services"
import { ObjectId } from "mongodb"
import { ConditionQuery } from "~/models/requests/product.requests"
import { Favourite, ProductInFavourite } from "~/models/schema/favourite.schema"
import { CollectionMessage } from "~/constant/message"

class CollectionServices {
  async getCollection(condition: ConditionQuery, slug: string) {
    const $match: any = {}
    let checkBanChay = false
    if (slug.includes("ban-chay")) {
      checkBanChay = true
    }
    if (slug.includes("5090")) {
      $match["name"] = { $regex: "rtx 5090", $options: "i" } // Tìm kiếm sản phẩm có tên chứa "rtx 5090"
    } else if (slug.includes("5080")) {
      $match["name"] = { $regex: "rtx 5080", $options: "i" }
    } else if (slug.includes("5070Ti")) {
      $match["name"] = { $regex: "rtx 5070Ti", $options: "i" }
    } else if (slug.includes("5060Ti")) {
      $match["name"] = { $regex: "rtx 5060Ti", $options: "i" }
    } else if (slug.includes("5060")) {
      $match["name"] = { $regex: "rtx 5060(?!Ti)\\b", $options: "i" }
    } else if (slug.includes("4060")) {
      $match["name"] = { $regex: "rtx 4060", $options: "i" }
    } else if (slug.includes("3060")) {
      $match["name"] = { $regex: "rtx 3060", $options: "i" }
    }

    if (condition.category) {
      const categoryId = await databaseServices.category.findOne({ name: condition.category }).then((res) => res?._id)
      $match["category"] = categoryId
    }
    if (condition.brand) {
      const brandId = await databaseServices.brand.findOne({ name: condition.brand }).then((res) => res?._id)
      $match["brand"] = brandId
    }
    if (condition.price) {
      $match["$expr"] = {
        $and: [] // Dùng $and vì cần đồng thời kiểm tra cả $gte và $lt nếu có.
      }
      if (condition.price.$gte) {
        $match["$expr"]["$and"].push({
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
        $match["$expr"]["$and"].push({
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
      if ($match["$expr"]["$and"].length === 0) {
        delete $match["$expr"]
      }
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
    if (checkBanChay) {
      resultPipeline.push({ $sort: { sold: -1 } })
      resultPipeline.push({ $limit: 10 })
    }

    resultPipeline.push({
      $project: {
        updated_at: 0,
        created_at: 0,
        stock: 0,
        description: 0,
        gifts: 0
      }
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

  async createFavouriteCollection(userId: string, product: ProductInFavourite) {
    const date = new Date()
    const existingFavourite = await databaseServices.favourite.findOne({ user_id: new ObjectId(userId) })
    let message = ""
    if (existingFavourite) {
      // Cập nhật danh sách sản phẩm trong mục yêu thích
      const existsProduct = await databaseServices.favourite.findOne({
        user_id: new ObjectId(userId),
        "products._id": new ObjectId(product._id)
      })

      if (existsProduct) {
        await databaseServices.favourite.updateOne(
          { user_id: new ObjectId(userId) },
          { $pull: { products: { _id: new ObjectId(product._id) } } } // nếu đã tồn tại trong danh sách thì xóa đi (click lần 1 thêm vào và click lần 2 sẽ xóa đi)
        )
        message = CollectionMessage.DELETE_COLLECTION_FAVOURITE_IS_SUCCESS
      } else {
        await databaseServices.favourite.updateOne(
          { user_id: new ObjectId(userId) },
          {
            $addToSet: {
              products: {
                _id: new ObjectId(product._id),
                name: product.name,
                image: product.image,
                price: product.price,
                discount: product.discount
              }
            },
            $set: { updated_at: date }
          }
        )
        message = CollectionMessage.CREATE_COLLECTION_FAVOURITE_IS_SUCCESS
      }
    } else {
      // Tạo mới mục yêu thích
      const newFavourite = {
        user_id: new ObjectId(userId),
        products: [
          {
            _id: new ObjectId(product._id),
            name: product.name,
            image: product.image,
            price: product.price,
            discount: product.discount
          }
        ],
        created_at: date,
        updated_at: date
      }
      await databaseServices.favourite.insertOne(new Favourite(newFavourite))

      message = CollectionMessage.CREATE_COLLECTION_FAVOURITE_IS_SUCCESS
    }

    return {
      message: message
    }
  }

  async getFavouriteCollection(userId: string) {
    const favourite = await databaseServices.favourite
      .findOne({ user_id: new ObjectId(userId) })
      .then((res) => res?.products || [])
    const total = favourite.length
    return {
      products: favourite,
      total: total
    }
  }
}

const collectionServices = new CollectionServices()

export default collectionServices
