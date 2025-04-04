import { ObjectId } from "mongodb"
import databaseServices from "./database.services"
import { UpdateBrandBodyReq, UpdateCategoryBodyReq } from "~/models/requests/admin.requests"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import { AdminMessage } from "~/constant/message"

class AdminServices {
  async getStatistical() {
    const [totalCustomer, totalProduct] = await Promise.all([
      databaseServices.users
        .aggregate([
          {
            $match: {
              role: "User"
            }
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.product
        .aggregate([
          {
            $count: "total"
          }
        ])
        .toArray()
    ])

    return {
      totalCustomer: totalCustomer[0]?.total || 0,
      totalProduct: totalProduct[0]?.total || 0
    }
  }

  async getCustomers(
    limit?: number,
    page?: number,
    email?: string,
    name?: string,
    phone?: string,
    verify?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string
  ) {
    const $match: any = { role: "User" }
    if (email) {
      $match["email"] = { $regex: email, $options: "i" }
    }
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
    }
    if (phone) {
      $match["numberPhone"] = { $regex: phone, $options: "i" }
    }
    if (verify) {
      console.log(verify)
      $match["verify"] = Number(verify)
    }
    if (created_at_start) {
      const startDate = new Date(created_at_start)
      $match["created_at"] = {
        $gte: startDate // >= created_at_start
      }
    }
    if (created_at_end) {
      const endDate = new Date(created_at_end)
      // Nếu đã có $match["created_at"], thêm $lte vào
      if ($match["created_at"]) {
        $match["created_at"]["$lte"] = endDate // <= created_at_end
      } else {
        $match["created_at"] = {
          $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
        }
      }
    }
    if (updated_at_start) {
      const startDate = new Date(updated_at_start)
      $match["updated_at"] = {
        $gte: startDate
      }
    }
    if (updated_at_end) {
      const endDate = new Date(updated_at_end)
      if ($match["updated_at"]) {
        $match["updated_at"]["$lte"] = endDate
      } else {
        $match["updated_at"] = {
          $lte: endDate
        }
      }
    }
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.users
        .aggregate([
          {
            $match
          },
          {
            $project: {
              email_verify_token: 0,
              forgot_password_token: 0,
              password: 0
            }
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.users
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.users
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          {
            $count: "total"
          }
        ])
        .toArray()
    ])
    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0
    }
  }

  async getCustomerDetail(id: string) {
    const result = await databaseServices.users.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          email_verify_token: 0,
          forgot_password_token: 0,
          password: 0
        }
      }
    )
    return result
  }

  async deleteCustomer(id: string) {
    const result = await databaseServices.users.deleteOne({ _id: new ObjectId(id) })
    return result
  }

  async createCategory(name: string) {
    const result = await databaseServices.category.insertOne(new Category({ name }))
    return result
  }

  async getCategories(
    limit?: number,
    page?: number,
    name?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string
  ) {
    const $match: any = {}
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
    }
    if (created_at_start) {
      const startDate = new Date(created_at_start)
      $match["created_at"] = {
        $gte: startDate // >= created_at_start
      }
    }
    if (created_at_end) {
      const endDate = new Date(created_at_end)
      // Nếu đã có $match["created_at"], thêm $lte vào
      if ($match["created_at"]) {
        $match["created_at"]["$lte"] = endDate // <= created_at_end
      } else {
        $match["created_at"] = {
          $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
        }
      }
    }
    if (updated_at_start) {
      const startDate = new Date(updated_at_start)
      $match["updated_at"] = {
        $gte: startDate
      }
    }
    if (updated_at_end) {
      const endDate = new Date(updated_at_end)
      if ($match["updated_at"]) {
        $match["updated_at"]["$lte"] = endDate
      } else {
        $match["updated_at"] = {
          $lte: endDate
        }
      }
    }
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.category
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.category
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.category
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          {
            $count: "total"
          }
        ])
        .toArray()
    ])

    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0
    }
  } // đã sửa (lk category & brand)

  async getCategoryDetail(id: string) {
    const result = await databaseServices.category.findOne({ _id: new ObjectId(id) })
    return result
  } // ok

  async updateCategory(id: string, body: UpdateCategoryBodyReq) {
    const result = await databaseServices.category.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: body, $currentDate: { updated_at: true } },
      { returnDocument: "after" }
    )
    return result
  } // ok

  async deleteCategory(id: string) {
    await databaseServices.category.deleteOne({ _id: new ObjectId(id) })
    return {
      message: AdminMessage.DELETE_CATEGORY
    }
  } // ok

  async getBrands(
    id: string,
    limit?: number,
    page?: number,
    name?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string
  ) {
    const $match: any = { category_ids: new ObjectId(id) }
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
    }
    if (created_at_start) {
      const startDate = new Date(created_at_start)
      $match["created_at"] = {
        $gte: startDate // >= created_at_start
      }
    }
    if (created_at_end) {
      const endDate = new Date(created_at_end)
      // Nếu đã có $match["created_at"], thêm $lte vào
      if ($match["created_at"]) {
        $match["created_at"]["$lte"] = endDate // <= created_at_end
      } else {
        $match["created_at"] = {
          $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
        }
      }
    }
    if (updated_at_start) {
      const startDate = new Date(updated_at_start)
      $match["updated_at"] = {
        $gte: startDate
      }
    }
    if (updated_at_end) {
      const endDate = new Date(updated_at_end)
      if ($match["updated_at"]) {
        $match["updated_at"]["$lte"] = endDate
      } else {
        $match["updated_at"] = {
          $lte: endDate
        }
      }
    }
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.brand
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.brand
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.brand
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          {
            $count: "total"
          }
        ])
        .toArray()
    ])

    // tìm các brand có chung category_id (các brand thuộc danh mục này)
    const listId = result.map((item) => item._id)
    const listTotalProduct = await Promise.all(
      listId.map(async (item) => {
        const countProduct = await databaseServices.product
          .aggregate([
            {
              $match: {
                brand: item,
                category: new ObjectId(id)
              }
            },
            {
              $count: "total" // đếm số sản phẩm thuộc 1 thương hiệu -> tạo thành 1 list | chạy theo từng id của brand
            }
          ])
          .toArray()

        return {
          brand: item,
          total: countProduct.length > 0 ? countProduct[0].total : 0
        }
      })
    )
    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0,
      listTotalProduct
    }
  } // đã sửa (lk category & brand)

  async getBrandDetail(id: string) {
    const result = await databaseServices.brand.findOne({ _id: new ObjectId(id) })
    return result
  }

  async createBrand(name: string, categoryId: string) {
    try {
      let brand = await databaseServices.brand.findOne({ name: name })
      let brandId: ObjectId | undefined

      // Nếu không tìm thấy brand, tiến hành tạo mới
      if (!brand) {
        const insertBrand = await databaseServices.brand.insertOne(
          new Brand({
            name: name,
            category_ids: [new ObjectId(categoryId)]
          })
        )
        brandId = insertBrand.insertedId
      } else {
        // Nếu đã tồn tại brand, tiến hành cập nhật
        brandId = brand._id
        await databaseServices.brand.updateOne(
          { name: name },
          {
            $addToSet: {
              category_ids: new ObjectId(categoryId)
            }
          }
        )
      }

      // Cập nhật vào category
      await databaseServices.category.updateOne(
        { _id: new ObjectId(categoryId) },
        {
          $addToSet: { brand_ids: brandId }, // Thêm brandId vào category
          $currentDate: { updated_at: true } // Cập nhật thời gian
        }
      )

      return {
        message: AdminMessage.CREATE_BRAND_DETAIL
      }
    } catch (error) {
      console.error("Error in createBrand:", error)
      return {
        message: "Internal server error",
        errorInfo: error
      }
    }
  }

  async updateBrand(id: string, body: UpdateBrandBodyReq) {
    const result = await databaseServices.brand.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: body, $currentDate: { updated_at: true } },
      { returnDocument: "after" }
    )
    return result
  }

  async deleteBrand(categoryId: string, brandId: string) {
    // 1. Xóa brandId khỏi mảng brand_ids của danh mục (Category)
    await databaseServices.category.updateOne(
      {
        _id: new ObjectId(categoryId),
        brand_ids: {
          $in: [new ObjectId(brandId)]
        }
      },
      {
        $pull: {
          brand_ids: new ObjectId(brandId)
        }
      }
    )

    // 2. Xóa categoryId khỏi mảng category_ids của thương hiệu (Brand)
    await databaseServices.brand.updateOne(
      {
        _id: new ObjectId(brandId),
        category_ids: {
          $in: [new ObjectId(categoryId)]
        }
      },
      {
        $pull: {
          category_ids: new ObjectId(categoryId)
        }
      }
    )

    const brand = await databaseServices.brand.findOne({ _id: new ObjectId(brandId) })
    if (brand && brand.category_ids.length === 0) {
      // Nếu không còn liên kết với bất kỳ danh mục nào, xóa thương hiệu
      await databaseServices.brand.deleteOne({ _id: new ObjectId(brandId) })
    }

    return {
      message: AdminMessage.DELETE_BRAND
    }
  }

  async getProducts(
    limit?: number,
    page?: number,
    name?: string,
    brand?: string,
    category?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string
  ) {
    const $match: any = {}
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
    }
    if (brand) {
      const nameUpperCase = brand
        ?.split("")
        .map((item) => item.toUpperCase())
        .join("")
      const findBrand = await databaseServices.brand.findOne({ name: nameUpperCase })
      $match["brand"] = findBrand?._id
    }
    if (category) {
      const findCategory = await databaseServices.category.findOne({ name: category })
      $match["category"] = findCategory?._id
    }
    if (created_at_start) {
      const startDate = new Date(created_at_start)
      $match["created_at"] = {
        $gte: startDate
      }
    }
    if (created_at_end) {
      const endDate = new Date(created_at_end)
      if ($match["created_at"]) {
        $match["created_at"]["$lte"] = endDate
      } else {
        $match["created_at"] = {
          $lte: endDate
        }
      }
    }
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.product
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          {
            $lookup: {
              from: "brand",
              localField: "brand",
              foreignField: "_id",
              as: "brand"
            }
          }, // tham chiếu đến brand
          {
            $addFields: {
              brand: {
                $map: {
                  input: "$brand",
                  as: "brandItem",
                  in: {
                    name: "$$brandItem.name"
                  }
                }
              }
            }
          }, // ghi đè lại giá trị brand sẵn có
          {
            $lookup: {
              from: "category",
              localField: "category",
              foreignField: "_id",
              as: "category"
            }
          }, // tham chiếu đến category
          {
            $addFields: {
              category: {
                $map: {
                  input: "$category",
                  as: "categoryItem",
                  in: {
                    name: "$$categoryItem.name"
                  }
                }
              }
            }
          },
          {
            $project: {
              reviews: 0,
              specifications: 0,
              viewCount: 0,
              gifts: 0,
              description: 0,
              sold: 0,
              isFeatured: 0,
              averageRating: 0,
              discount: 0
            }
          }
        ])
        .toArray(),
      databaseServices.product
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.product
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          {
            $count: "total"
          }
        ])
        .toArray()
    ])
    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0
    }
  }
}

const adminServices = new AdminServices()
export default adminServices
