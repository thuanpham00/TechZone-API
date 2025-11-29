import databaseServices from "./database.services"
import { ObjectId } from "mongodb"
import Product from "~/models/schema/product.schema"

class ProductServices {
  async getProductDetail(id: string) {
    const date = new Date()
    const [result] = await Promise.all([
      databaseServices.product
        .aggregate([
          {
            $match: {
              _id: new ObjectId(id)
            }
          },
          {
            $lookup: {
              from: "category",
              localField: "category",
              foreignField: "_id",
              as: "category",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: "brand",
              localField: "brand",
              foreignField: "_id",
              as: "brand",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: "$brand",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: "specification",
              localField: "specifications",
              foreignField: "_id",
              as: "specifications"
            }
          },
          {
            $addFields: {
              specifications: {
                $map: {
                  input: "$specifications",
                  as: "specification",
                  in: {
                    name: "$$specification.name",
                    value: "$$specification.value"
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: "reviews",
              localField: "reviews",
              foreignField: "_id",
              as: "reviews",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    title: 1,
                    rating: 1,
                    comment: 1,
                    created_at: 1,
                    images: 1,
                    userId: 1
                  }
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          avatar: 1
                        }
                      }
                    ]
                  }
                },
                {
                  $unwind: {
                    path: "$userId",
                    preserveNullAndEmptyArrays: true
                  }
                }
              ]
            }
          }
        ])
        .toArray(),
      databaseServices.product.updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: {
            viewCount: 1
          },
          $set: {
            updated_at: date
          }
        }
      )
    ])
    return result
  }

  async getProductRelated(brand: string, category: string, idProduct: string) {
    const $match: any = {}
    if (category) {
      $match["category"] = new ObjectId(category)
    }
    if (brand) {
      $match["brand"] = new ObjectId(brand)
    }

    const result = await databaseServices.product
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
          $skip: 0
        },
        {
          $limit: 5
        }
      ])
      .toArray()

    const listProduct = result.filter((item) => !new ObjectId(item._id).equals(new ObjectId(idProduct)))
    // loại bỏ sản phẩm hiện tại
    const collections = listProduct.map((item) => item._id as ObjectId)
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
    listProduct.forEach((item) => {
      item.viewCount += 1
    })
    return listProduct
  }

  async getSearchProduct(search: string) {
    const result = await databaseServices.product
      .aggregate([
        {
          $match: {
            name: { $regex: search, $options: "i" }
          }
        },
        {
          $facet: {
            // chạy song song 1 lần nhiều pipe // $match là dùng chung giữa 2 pipe này
            data: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  price: 1,
                  discount: 1,
                  banner: 1
                }
              },
              { $limit: 10 } // chỉ lấy 10 gợi ý đầu tiên
            ],
            total: [{ $count: "total" }]
          }
        }
      ])
      .toArray()

    return result[0]
  }

  async getAllProduct() {
    const result = await databaseServices.product
      .aggregate([
        {
          $lookup: {
            from: "category",
            localField: "category",
            foreignField: "_id",
            as: "category",
            pipeline: [
              {
                $project: {
                  name: 1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$category"
          }
        },
        {
          $lookup: {
            from: "specification",
            localField: "specifications",
            foreignField: "_id",
            as: "specifications"
          }
        },
        {
          $addFields: {
            specifications: {
              $map: {
                input: "$specifications",
                as: "specification",
                in: {
                  name: "$$specification.name",
                  value: "$$specification.value"
                }
              }
            }
          }
        },
        {
          $facet: {
            // chạy song song 1 lần nhiều pipe // $match là dùng chung giữa 2 pipe này
            data: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  price: 1,
                  discount: 1,
                  banner: 1,
                  specifications: 1,
                  category: 1
                }
              }
            ],
            total: [{ $count: "total" }]
          }
        }
      ])
      .toArray()

    return result[0]
  }
}

export const productServices = new ProductServices()
