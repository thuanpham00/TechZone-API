import Product from "~/models/schema/product.schema"
import databaseServices from "./database.services"
import { ObjectId } from "mongodb"

class CollectionServices {
  async getCollection(condition: { brand?: string; category?: string }, page?: number, limit?: number) {
    const $match: any = {}
    if (condition.category) {
      const categoryId = await databaseServices.category.findOne({ name: condition.category }).then((res) => res?._id)
      $match["category"] = categoryId
    }
    if (condition.brand) {
      const brandId = await databaseServices.brand.findOne({ name: condition.brand }).then((res) => res?._id)
      $match["brand"] = brandId
    }
    const [result, total] = await Promise.all([
      databaseServices.product
        .aggregate<Product>([
          {
            $match // match với các sản phẩm có chung danh mục, chung thương hiệu
          },
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
          },
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
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 10
          }
        ])
        .toArray(),
      databaseServices.product
        .aggregate([
          {
            $match // match với các sản phẩm có chung danh mục, chung thương hiệu
          },
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
          },
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
}

const collectionServices = new CollectionServices()

export default collectionServices
