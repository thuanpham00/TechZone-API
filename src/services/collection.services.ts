import Product from "~/models/schema/product.schema"
import databaseServices from "./database.services"
import { ObjectId } from "mongodb"
import { ConditionQuery } from "~/models/requests/product.requests"

class CollectionServices {
  async getCollection(condition: ConditionQuery, page?: number, limit?: number) {
    const $match: any = {}
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
