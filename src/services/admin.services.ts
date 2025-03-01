import { ObjectId } from "mongodb"
import databaseServices from "./database.services"
import { UpdateCategoryBodyReq } from "~/models/requests/admin.requests"
import { Category } from "~/models/schema/brand_category.schema"

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

  async getCustomers(limit?: number, page?: number, email?: string, name?: string, phone?: string) {
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

  async getCategories(limit?: number, page?: number, name?: string) {
    const $match: any = {}
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
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

    const listId = result.map((item) => item._id)
    const listTotalBrand = await Promise.all(
      listId.map(async (item) => {
        const countBrand = await databaseServices.brand
          .aggregate([
            {
              $match: {
                category_id: item
              }
            },
            {
              $count: "total" // đếm số thương hiệu thuộc 1 danh mục -> tạo thành 1 list | chạy theo từng id của category
            }
          ])
          .toArray()

        return {
          category_id: item,
          total: countBrand.length > 0 ? countBrand[0].total : 0
        }
      })
    )
    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0,
      listTotalBrand
    }
  }

  async getCategoryDetail(id: string) {
    const result = await databaseServices.category.findOne({ _id: new ObjectId(id) })
    return result
  }

  async updateCategory(id: string, body: UpdateCategoryBodyReq) {
    const result = await databaseServices.category.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: body, $currentDate: { updated_at: true } },
      { returnDocument: "after" }
    )
    return result
  }

  async createCategory(name: string) {
    const result = await databaseServices.category.insertOne(new Category({ name }))
    return result
  }

  async getBrands(id: string) {
    const listBrand = await databaseServices.brand.find({ category_id: new ObjectId(id) }).toArray()

    // tìm các brand có chung category_id (các brand thuộc danh mục này)
    const listId = listBrand.map((item) => item._id)

    const listTotalProduct = await Promise.all(
      listId.map(async (item) => {
        const countProduct = await databaseServices.product
          .aggregate([
            {
              $match: {
                brand: item
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
    return { listBrand, listTotalProduct }
  }
}

const adminServices = new AdminServices()
export default adminServices
