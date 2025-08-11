import { ObjectId, WithId } from "mongodb"
import databaseServices from "./database.services"
import {
  CreateCustomerBodyReq,
  UpdateBrandBodyReq,
  UpdateCategoryBodyReq,
  UpdateSupplierBodyReq,
  UpdateSupplyBodyReq
} from "~/models/requests/admin.requests"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import { AdminMessage, ReceiptMessage, SupplyMessage } from "~/constant/message"
import {
  CreateProductBodyReq,
  CreateReceiptBodyReq,
  CreateSupplierBodyReq,
  CreateSupplyBodyReq,
  specificationType
} from "~/models/requests/product.requests"
import { mediaServices } from "./medias.services"
import Product from "~/models/schema/product.schema"
import Specification from "~/models/schema/specification.schema"
import { Receipt, Supplier, Supply } from "~/models/schema/supply_supplier.schema"
import { OrderStatus, ProductStatus, RoleType, UserVerifyStatus } from "~/constant/enum"
import { userServices } from "./user.services"
import { hashPassword } from "~/utils/scripto"
import { User } from "~/models/schema/users.schema"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
import { sendVerifyRegisterEmail } from "~/utils/ses"

class AdminServices {
  async getStatisticalSell(month: number, year: number) {
    let filterMonthYear : any = {}
    if (month && year) {
      filterMonthYear = {
        $and: [{ $eq: [{ $month: "$created_at" }, month] }, { $eq: [{ $year: "$created_at" }, year] }]
      }
    } else if (year) {
      filterMonthYear = {
        $eq: [{ $year: "$created_at" }, year]
      }
    }
    const [totalRevenue, totalOrder, totalProductSold, totalOrderDelivered, orderStatusRate, revenueFor6Month] =
      await Promise.all([
        // đếm tổng doanh thu của các đơn "đã giao hàng"
        databaseServices.order
          .aggregate([
            {
              $match: {
                $expr: filterMonthYear,
                status: "Đã giao hàng"
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" }
              }
            }
          ])
          .toArray(),

        // đếm tổng số đơn
        databaseServices.order
          .aggregate([
            {
              $match: {
                $expr: filterMonthYear
              }
            },
            {
              $count: "total"
            }
          ])
          .toArray(),

        // đếm tổng số sp đã bán được "đã giao hàng"
        databaseServices.order
          .aggregate([
            {
              $match: {
                $expr: filterMonthYear,
                status: "Đã giao hàng"
              }
            },
            { $unwind: "$products" },
            {
              $group: {
                _id: null, // nhóm dữ liệu dựa trên 1 trường nào đó
                totalQuantity: { $sum: "$products.quantity" }
              }
            }
          ])
          .toArray(),

        // đếm số đơn "đã giao"
        databaseServices.order
          .aggregate([
            {
              $match: {
                $expr: filterMonthYear,
                status: "Đã giao hàng"
              }
            },
            {
              $count: "total"
            }
          ])
          .toArray(),

        // tỉ lệ trạng thái đơn hàng
        databaseServices.order
          .aggregate([
            {
              $match: {
                $expr: filterMonthYear
              }
            },
            {
              $group: {
                _id: "$status",
                total: { $sum: 1 }
              }
            }
          ])
          .toArray(),

        // tính doanh thu 6 tháng gần nhất
        databaseServices.order
          .aggregate([
            {
              $match: {
                status: "Đã giao hàng"
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$created_at" },
                  month: { $month: "$created_at" }
                }, // gom nhóm dữ liệu dựa trên year và month
                totalRevenue: { $sum: "$totalAmount" }
              }
            },
            {
              $sort: {
                "_id.year": -1,
                "_id.month": -1
              }
            },
            {
              $limit: 6
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1
              }
            }
          ])
          .toArray()
      ])

    const revenue = totalRevenue[0]?.totalRevenue || 0
    const deliveredCount = totalOrderDelivered[0]?.total || 0
    const avgValue = deliveredCount ? revenue / deliveredCount : 0

    const rateStatusOrder = orderStatusRate.map((item) => {
      const rate = (item.total * 100) / totalOrder[0].total
      return {
        name: item._id,
        total: item.total,
        rate: Math.round(rate * 10) / 10 // làm tròn 1 chữ số thập phân
      }
    })

    const revenueFor6MonthData = revenueFor6Month.map((item) => {
      const { month, year } = item._id
      return {
        label: `${year}-${month.toString().padStart(2, "0")}`,
        revenue: item.totalRevenue
      }
    })

    return {
      totalCustomer: {
        title: "Tổng số doanh thu theo tháng",
        value: revenue,
        color: "#c1121f"
      },
      totalOrder: {
        title: "Tổng số đơn hàng theo tháng",
        value: totalOrder[0]?.total || 0,
        color: "#3a86ff"
      },
      totalProductSold: {
        title: "Tổng số sản phẩm đã bán theo tháng",
        value: totalProductSold[0]?.totalQuantity || 0,
        color: "#f9c74f"
      },
      avgOrderValue: {
        title: "Giá trị trung bình mỗi đơn hàng theo tháng",
        value: Math.round(avgValue),

        color: "#8338ec"
      },
      rateStatusOrder,
      revenueFor6Month: {
        title: "Doanh thu 6 tháng gần nhất",
        value: revenueFor6MonthData
      }
    }
  }

  async getStatisticalProduct() {
    const [countCategory, top10ProductSold, productRunningOutOfStock] = await Promise.all([
      // tính số lượng sản phẩm của mỗi doanh mục
      databaseServices.product
        .aggregate([
          {
            $group: {
              _id: "$category", // nhóm dữ liệu dựa trên trường category
              total: { $sum: 1 } // Đếm số lượng sản phẩm mỗi danh mục
            }
          },
          {
            $lookup: {
              from: "category",
              localField: "_id",
              foreignField: "_id",
              as: "categoryInfo"
            }
          },
          { $unwind: "$categoryInfo" },
          {
            $project: {
              total: 1,
              categoryId: "$_id",
              categoryName: "$categoryInfo.name"
            }
          },
          {
            $sort: { total: -1 } // (Tùy chọn) Sắp xếp giảm dần theo số lượng
          }
        ])
        .toArray(),

      // top 10 sản phẩm bán chạy nhất
      databaseServices.product
        .aggregate([
          {
            $project: {
              _id: 1,
              name: 1,
              sold: 1
            }
          },
          {
            $sort: { sold: -1 }
          },
          {
            $limit: 10
          }
        ])
        .toArray(),

      // danh sách các sp sắp hết hàng stock < 5
      databaseServices.product
        .aggregate([
          {
            $match: {
              stock: { $lt: 5 }
            }
          },
          {
            $lookup: {
              from: "category",
              localField: "category",
              foreignField: "_id",
              as: "categoryInfo"
            }
          },
          { $unwind: "$categoryInfo" },
          {
            $project: {
              _id: 1,
              name: 1,
              stock: 1,
              categoryInfo: "$categoryInfo.name"
            }
          }
        ])
        .toArray()
    ])

    return {
      countCategory: {
        title: "Sản phẩm theo danh mục",
        value: countCategory
      },
      top10ProductSold: {
        title: "Top 10 sản phẩm bán chạy",
        value: top10ProductSold
      },

      productRunningOutOfStock: {
        title: "Danh sách các sản phẩm sắp hết hàng",
        value: productRunningOutOfStock
      }
    }
  }

  async getStatisticalUser(month: number, year: number) {
    const today = new Date()
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1)

    let filterMonthYear: any = {}
    if (month && year) {
      filterMonthYear = {
        $and: [{ $eq: [{ $month: "$created_at" }, month] }, { $eq: [{ $year: "$created_at" }, year] }]
      }
    } else if (year) {
      filterMonthYear = {
        $eq: [{ $year: "$created_at" }, year]
      }
    }

    const [totalCustomer, top10CustomerBuyTheMost, rateReturningCustomers] = await Promise.all([
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

      databaseServices.order
        .aggregate([
          {
            $match: {
              $expr: filterMonthYear,
              status: "Đã giao hàng"
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user_id"
            }
          },
          { $unwind: "$user_id" },
          {
            $group: {
              _id: "$user_id._id",
              name: { $first: "$user_id.name" }, // hoặc "fullname", "email",...
              email: { $first: "$user_id.email" }, // hoặc "fullname", "email",...
              totalRevenue: { $sum: "$totalAmount" }
            }
          },
          {
            $sort: { totalRevenue: -1 }
          },
          {
            $limit: 10
          }
        ])
        .toArray(),

      databaseServices.order
        .aggregate([
          {
            $match: {
              created_at: { $gte: threeMonthsAgo },
              status: "Đã giao hàng",
              user_id: { $ne: null }
            }
          },
          {
            $group: {
              _id: "$user_id",
              orderCount: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: null,
              totalCustomers: { $sum: 1 },
              returningCustomers: {
                $sum: {
                  $cond: [{ $gt: ["$orderCount", 1] }, 1, 0]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalCustomers: 1,
              returningCustomers: 1,
              retentionRate: {
                $cond: [
                  { $eq: ["$totalCustomers", 0] },
                  0,
                  {
                    $multiply: [{ $divide: ["$returningCustomers", "$totalCustomers"] }, 100]
                  }
                ]
              }
            }
          }
        ])
        .toArray()
    ])

    return {
      totalCustomer: {
        title: "Khách hàng",
        value: totalCustomer[0]?.total || 0,
        color: "#c1121f"
      },
      totalStaff: {
        title: "Nhân viên",
        value: 0,
        color: "#3a86ff"
      },
      top10CustomerBuyTheMost,
      rateReturningCustomers
    }
  }

  async createCustomer(payload: CreateCustomerBodyReq) {
    const emailVerifyToken = await userServices.signEmailVerifyToken({
      user_id: payload.id,
      verify: UserVerifyStatus.Unverified,
      role: RoleType.USER
    })

    const body = {
      ...payload,
      _id: new ObjectId(payload.id),
      password: hashPassword(payload.password),
      email_verify_token: emailVerifyToken,
      role: RoleType.USER
    }

    if (payload.avatar) {
      body.avatar = payload.avatar
    }

    const [, token] = await Promise.all([
      databaseServices.users.insertOne(
        new User({
          ...payload,
          _id: new ObjectId(payload.id),
          password: hashPassword(payload.password),
          email_verify_token: emailVerifyToken,
          numberPhone: payload.phone,
          date_of_birth: new Date(payload.dateOfBirth)
        })
      ),
      // tạo cặp AccessToken và RefreshToken mới
      userServices.signAccessTokenAndRefreshToken({
        user_id: payload.id,
        verify: UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
        role: RoleType.USER
      })
    ])

    const [accessToken, refreshToken] = token
    const { exp, iat } = await userServices.decodeRefreshToken(refreshToken)

    const [user] = await Promise.all([
      databaseServices.users.findOne(
        { _id: new ObjectId(payload.id) },
        { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
      ),
      // thêm RefreshToken mới vào DB
      databaseServices.refreshToken.insertOne(
        new RefreshToken({ token: refreshToken, iat: iat, exp: exp, user_id: new ObjectId(payload.id) })
      )
    ])

    await sendVerifyRegisterEmail(payload.email, emailVerifyToken)

    return {
      user
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
    updated_at_end?: string,

    sortBy?: string
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
            $sort: { created_at: sortBy === "new" ? -1 : 1 }
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
    updated_at_end?: string,
    sortBy?: string
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
          { $sort: { created_at: sortBy === "new" ? -1 : 1 } },
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

  async getNameCategoriesFilter() {
    const result = await databaseServices.category.find({}).toArray()
    const listName = result.map((item) => item.name)
    return listName
  }

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
    updated_at_end?: string,
    sortBy?: string
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
          { $sort: { created_at: sortBy === "new" ? -1 : 1 } },
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

  async getNameBrandsFilter() {
    const result = await databaseServices.brand.find({}).toArray()
    const listName = result.map((item) => item.name)
    return listName
  }

  async createBrand(name: string, categoryId: string) {
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
    updated_at_end?: string,
    price_min?: string,
    price_max?: string,
    status?: string,
    sortBy?: string
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
    if (price_min) {
      const minPrice = Number(price_min.replace(/[.,]/g, ""))
      if (!isNaN(minPrice)) {
        $match["price"] = { $gte: minPrice }
      }
    }
    if (price_max) {
      const maxPrice = Number(price_max.replace(/[.,]/g, ""))
      if (!isNaN(maxPrice)) {
        if ($match["price"]) {
          $match["price"]["$lte"] = maxPrice
        } else {
          $match["price"] = { $lte: maxPrice }
        }
      }
    }
    if (status) {
      $match["status"] = status
    }
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.product
        .aggregate([
          {
            $match
          },
          { $sort: { created_at: sortBy === "new" ? -1 : 1 } },
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

  async getNameProductsFilter() {
    const result = await databaseServices.product.find({}).toArray()
    const listName = result.map((item) => item.name)
    return listName
  }

  private async checkCategoryBrandExist(category: string, brand: string) {
    // nhận vào category và brand
    // check xem brand đó có tồn tại không
    let brandId: ObjectId
    const existsBrand = await databaseServices.brand.findOne({ name: brand })
    if (existsBrand) {
      brandId = existsBrand._id // lấy id thương hiệu
    } else {
      const newBrand = await databaseServices.brand.insertOne(new Brand({ name: brand, category_ids: [] })) // sẽ cập nhật category_ids sau
      brandId = newBrand.insertedId // lấy id thương hiệu mới
    }

    const categoryCheck = await databaseServices.category.findOneAndUpdate(
      { name: category }, // nếu danh mục không tồn tại // thì thêm mới
      {
        $setOnInsert: new Category({ name: category, brand_ids: [brandId] }) // nếu không tồn tại danh mục thì thêm mới (danh mục liên kết với thương hiệu)
      },
      {
        upsert: true,
        returnDocument: "after" // cập nhật liền sau khi update (trên postman)
      }
    )

    const categoryId = (categoryCheck as WithId<Category>)._id
    // nếu danh mục tồn tại (mà chưa có brandIds) cần check lại vì nó bỏ qua setOnInsert
    const categoryWithBrand = await databaseServices.category.findOne({
      _id: categoryId,
      brand_ids: { $in: [brandId] }
    })

    if (!categoryWithBrand) {
      await databaseServices.category.updateOne(
        { _id: categoryId },
        {
          $addToSet: { brand_ids: brandId } // Thêm brandId vào mảng brand_ids nếu chưa tồn tại
        }
      )
    }

    await databaseServices.brand.updateOne(
      { _id: brandId },
      {
        $addToSet: {
          category_ids: categoryId // cập nhật lại category_ids (thương hiệu liên kết với thương hiệu)
        }
      }
    )

    return { categoryId, brandId }
  } // truyền vào giá trị "asus" => nó check coi có tồn tại name này không, nếu có thì thôi, không thì tạo mới => lấy ra ObjectID

  private async checkSpecificationExist(category_id: ObjectId, specificationList: specificationType[]) {
    const specifications = await Promise.all(
      specificationList.map(async (item) => {
        try {
          const spec = await databaseServices.specification.findOneAndUpdate(
            {
              name: item.name,
              value: item.value,
              category_id: category_id
            },
            {
              $setOnInsert: new Specification({
                category_id: category_id,
                name: item.name,
                value: item.value
              })
            },
            {
              upsert: true,
              returnDocument: "after" // cập nhật liền sau khi update (trên postman)
            }
          )
          return spec
        } catch (error) {
          console.log("lỗi", error)
        }
      })
    )
    const listId = specifications.map((item) => item?._id)
    return listId
  }

  async createProduct(payload: CreateProductBodyReq) {
    const { categoryId, brandId } = await this.checkCategoryBrandExist(payload.category, payload.brand)
    const specificationList = await this.checkSpecificationExist(categoryId, payload.specifications)
    const productId = new ObjectId()
    const { url: urlBanner, type: typeBanner } = await mediaServices.uploadBanner(
      payload.banner,
      payload.category,
      productId.toString()
    )

    const { upload } = await mediaServices.uploadImageList(payload.medias, payload.category, productId.toString())
    const result = await databaseServices.product.findOneAndUpdate(
      { name: payload.name, brand: brandId, category: categoryId },
      {
        $setOnInsert: new Product({
          ...payload,
          _id: productId,
          name: payload.name,
          brand: brandId,
          category: categoryId,
          price: payload.price,
          discount: payload.discount,
          stock: payload.stock,
          isFeatured: payload.isFeatured,
          description: payload.description,
          banner: {
            type: typeBanner,
            url: urlBanner
          },
          medias: upload,
          specifications: specificationList as ObjectId[]
        })
      },
      {
        upsert: true,
        returnDocument: "after"
      } // nếu có sản phẩm này rồi thì không thêm nữa, nếu chưa có thì thêm mới
    )

    return result
  }

  async createSupplier(payload: CreateSupplierBodyReq) {
    await databaseServices.supplier.insertOne(
      new Supplier({
        ...payload,
        name: payload.name,
        contactName: payload.contactName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        taxCode: payload.taxCode
      })
    )
    return {
      message: AdminMessage.CREATE_SUPPLIER_DETAIL
    }
  }

  async getSuppliers(
    limit?: number,
    page?: number,
    name?: string,
    email?: string,
    phone?: string,
    contactName?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string,
    sortBy?: string
  ) {
    const $match: any = {}
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
    }
    if (email) {
      $match["email"] = { $regex: email, $options: "i" }
    }
    if (phone) {
      $match["phone"] = { $regex: phone, $options: "i" }
    }
    if (contactName) {
      $match["contactName"] = { $regex: contactName, $options: "i" }
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
      databaseServices.supplier
        .aggregate([
          {
            $match
          },
          { $sort: { created_at: sortBy === "new" ? -1 : 1 } },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.supplier
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.supplier
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

  async getSupplierDetail(id: string) {
    const result = await databaseServices.supplier.findOne({ _id: new ObjectId(id) })
    return result
  } // ok

  async getNameSuppliersFilter() {
    const result = await databaseServices.supplier.find({}).toArray()
    const listName = result.map((item) => item.name)
    return listName
  }

  // ######
  async getNameSuppliersNotLinkedToProduct(productId: string) {
    // lấy ra danh sách cung ứng dựa trên tên sản phẩm
    const [listSupplierBasedOnProduct, listSupplier] = await Promise.all([
      databaseServices.supply
        .aggregate([
          {
            $match: {
              productId: new ObjectId(productId)
            }
          },
          {
            $lookup: {
              from: "supplier",
              localField: "supplierId",
              foreignField: "_id",
              as: "supplierId"
            }
          },
          {
            $addFields: {
              supplierId: {
                $map: {
                  input: "$supplierId",
                  as: "supplierItem",
                  in: {
                    _id: "$$supplierItem._id"
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              productId: 0,
              importPrice: 0,
              warrantyMonths: 0,
              leadTimeDays: 0,
              description: 0,
              created_at: 0,
              updated_at: 0
            }
          }
        ])
        .toArray(),

      databaseServices.supplier.find({}).toArray()
    ])
    const listIdSupplierFilter = listSupplierBasedOnProduct.map((item) => item.supplierId[0]._id)
    const listIdSUpplier = listSupplier.map((item) => item._id)
    const supplierIdsNotInProduct = listIdSUpplier.filter(
      (itemB) => !listIdSupplierFilter.some((itemA) => itemA.equals(itemB))
    )

    const suppliers = await databaseServices.supplier
      .find({ _id: { $in: supplierIdsNotInProduct } })
      .project({ name: 1 })
      .toArray()

    const listNameSupplier = suppliers.map((supplier) => supplier.name)

    return listNameSupplier
  }

  async getNameSuppliersLinkedToProduct(productId: string) {
    // lấy ra danh sách cung ứng dựa trên tên sản phẩm
    const [listSupplierBasedOnProduct] = await Promise.all([
      databaseServices.supply
        .aggregate([
          {
            $match: {
              productId: new ObjectId(productId)
            }
          },
          {
            $lookup: {
              from: "supplier",
              localField: "supplierId",
              foreignField: "_id",
              as: "supplierId"
            }
          },
          {
            $addFields: {
              supplierId: {
                $map: {
                  input: "$supplierId",
                  as: "supplierItem",
                  in: {
                    _id: "$$supplierItem._id"
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              productId: 0,
              importPrice: 0,
              warrantyMonths: 0,
              leadTimeDays: 0,
              description: 0,
              created_at: 0,
              updated_at: 0
            }
          }
        ])
        .toArray()
    ])

    const listIdSupplierFilter = listSupplierBasedOnProduct.map((item) => item.supplierId[0]._id)

    const suppliers = await databaseServices.supplier
      .find({ _id: { $in: listIdSupplierFilter } })
      .project({ name: 1 })
      .toArray()

    const listNameSupplier = suppliers.map((supplier) => supplier.name)

    return listNameSupplier
  }

  async getPricePerUnitFromProductAndSupplier(productId: string, supplierId: string) {
    const result = await databaseServices.supply.findOne(
      { productId: new ObjectId(productId), supplierId: new ObjectId(supplierId) },
      { projection: { importPrice: 1 } }
    )
    return result
  }

  async updateSupplier(id: string, body: UpdateSupplierBodyReq) {
    await databaseServices.supplier.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: body,
        $currentDate: { updated_at: true } // cập nhật thời gian
      }
    )

    return {
      message: AdminMessage.UPDATE_SUPPLIER_DETAIL
    }
  }

  async deleteSupplier(id: string) {
    await databaseServices.supplier.deleteOne({ _id: new ObjectId(id) })
    return {
      message: AdminMessage.DELETE_SUPPLIER
    }
  } // ok

  async createSupply(payload: CreateSupplyBodyReq) {
    const [productId, supplierId] = await Promise.all([
      databaseServices.product.findOne({ name: payload.productId }),
      databaseServices.supplier.findOne({ name: payload.supplierId })
    ])
    await databaseServices.supply.insertOne(
      new Supply({
        ...payload,
        productId: new ObjectId(productId?._id),
        supplierId: new ObjectId(supplierId?._id),
        importPrice: payload.importPrice,
        warrantyMonths: payload.warrantyMonths,
        leadTimeDays: payload.leadTimeDays
      })
    )
    return {
      message: AdminMessage.CREATE_SUPPLY_DETAIL
    }
  }

  async getSellPriceProduct(nameProduct: string) {
    const result = await databaseServices.product.findOne({ name: nameProduct }).then((res) => res?.price)

    return {
      priceProduct: result
    }
  }

  async getSupplies(
    limit?: number,
    page?: number,
    name_product?: string,
    name_supplier?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string,
    sortBy?: string
  ) {
    const $match: any = {}
    const findIdProduct = await databaseServices.product.findOne({ name: name_product })
    const findIdSupplier = await databaseServices.supplier.findOne({ name: name_supplier })
    if (name_product) {
      $match["productId"] = findIdProduct?._id
    }
    if (name_supplier) {
      $match["supplierId"] = findIdSupplier?._id
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
      databaseServices.supply
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: "product",
              localField: "productId",
              foreignField: "_id",
              as: "productId"
            }
          },
          {
            $addFields: {
              productId: {
                $map: {
                  input: "$productId",
                  as: "productItem",
                  in: {
                    name: "$$productItem.name"
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: "supplier",
              localField: "supplierId",
              foreignField: "_id",
              as: "supplierId"
            }
          },
          {
            $addFields: {
              supplierId: {
                $map: {
                  input: "$supplierId",
                  as: "supplierItem",
                  in: {
                    name: "$$supplierItem.name"
                  }
                }
              }
            }
          },
          { $sort: { created_at: sortBy === "new" ? -1 : 1 } },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.supply
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.supply
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

  async getSupplyDetail(id: string) {
    const result = await databaseServices.supply
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "productId",
            foreignField: "_id",
            as: "productId"
          }
        },
        {
          $addFields: {
            productId: {
              $map: {
                input: "$productId",
                as: "productItem",
                in: {
                  name: "$$productItem.name"
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "supplier",
            localField: "supplierId",
            foreignField: "_id",
            as: "supplierId"
          }
        },
        {
          $addFields: {
            supplierId: {
              $map: {
                input: "$supplierId",
                as: "supplierItem",
                in: {
                  name: "$$supplierItem.name"
                }
              }
            }
          }
        }
      ])
      .toArray()
    return result
  } // ok

  async updateSupply(id: string, body: UpdateSupplyBodyReq) {
    const [productId, supplierId] = await Promise.all([
      databaseServices.product.findOne({ name: body.productId }),
      databaseServices.supplier.findOne({ name: body.supplierId })
    ])
    await databaseServices.supply.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          productId: new ObjectId(productId?._id),
          supplierId: new ObjectId(supplierId?._id)
        },
        $currentDate: { updated_at: true } // cập nhật thời gian
      }
    )

    return {
      message: AdminMessage.UPDATE_SUPPLY_DETAIL
    }
  }

  async deleteSupply(id: string) {
    await databaseServices.supply.deleteOne({ _id: new ObjectId(id) })
    return {
      message: SupplyMessage.DELETE_SUPPLY
    }
  } // ok

  async createReceipt(body: CreateReceiptBodyReq) {
    const listItem = await Promise.all(
      body.items.map(async (item) => {
        const [productId, supplierId] = await Promise.all([
          databaseServices.product.findOne({ name: item.productId }),
          databaseServices.supplier.findOne({ name: item.supplierId })
        ])
        return {
          ...item,
          productId: new ObjectId(productId?._id),
          supplierId: new ObjectId(supplierId?._id)
        }
      })
    )
    const listItemNameAndQuantity = listItem.map((item) => {
      const itemNameAndQuantity = {
        idProduct: item.productId,
        quantityProduct: item.quantity
      }
      return itemNameAndQuantity
    })

    await Promise.all([
      databaseServices.receipt.insertOne(
        new Receipt({
          items: listItem,
          importDate: body.importDate,
          totalAmount: body.totalAmount,
          totalItem: body.totalItem,
          note: body.note
        })
      ),
      Promise.all(
        listItemNameAndQuantity.map(async (item) => {
          await databaseServices.product.updateOne(
            {
              _id: new ObjectId(item.idProduct)
            },
            {
              $inc: {
                stock: item.quantityProduct
              },
              $set: {
                status: ProductStatus.AVAILABLE // set trạng thái có hàng
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
        })
      )
    ])

    return {
      message: ReceiptMessage.CREATE_RECEIPT_IS_SUCCESS
    }
  }

  async getReceipts(
    limit?: number,
    page?: number,
    name_product?: string,
    name_supplier?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string,
    quantity?: string,
    price_max?: string,
    price_min?: string,
    sortBy?: string
  ) {
    const $match: any = {}

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
    if (quantity) {
      $match["$expr"] = {
        $eq: [{ $size: "$items" }, Number(quantity)]
      }
    }

    if (price_min) {
      const minPrice = Number(price_min.replace(/[.,]/g, ""))
      if (!isNaN(minPrice)) {
        $match["totalAmount"] = { $gte: minPrice }
      }
    }
    if (price_max) {
      const maxPrice = Number(price_max.replace(/[.,]/g, ""))
      if (!isNaN(maxPrice)) {
        if ($match["totalAmount"]) {
          $match["totalAmount"]["$lte"] = maxPrice
        } else {
          $match["totalAmount"] = { $lte: maxPrice }
        }
      }
    }

    // Tìm ID của product và supplier nếu có
    const findIdProduct = name_product ? await databaseServices.product.findOne({ name: name_product }) : null
    const findIdSupplier = name_supplier ? await databaseServices.supplier.findOne({ name: name_supplier }) : null

    // Thêm điều kiện tìm kiếm dựa trên productId hoặc supplierId
    if (findIdProduct) {
      $match["items.productId"] = new ObjectId(findIdProduct._id)
    }
    if (findIdSupplier) {
      $match["items.supplierId"] = new ObjectId(findIdSupplier._id)
    }

    const pipeline: any[] = [
      { $match },
      // Lookup để lấy thông tin chi tiết của product
      {
        $lookup: {
          from: "product",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      // Gắn thông tin product vào từng item
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    productId: {
                      $arrayElemAt: [
                        "$productDetails",
                        {
                          $indexOfArray: ["$productDetails._id", "$$item.productId"]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      // Lookup để lấy thông tin chi tiết của supplier
      {
        $lookup: {
          from: "supplier",
          localField: "items.supplierId",
          foreignField: "_id",
          as: "supplierDetails"
        }
      },
      // Gắn thông tin supplier vào từng item
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    supplierId: {
                      $arrayElemAt: [
                        "$supplierDetails",
                        {
                          $indexOfArray: ["$supplierDetails._id", "$$item.supplierId"]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      // Loại bỏ các trường tạm thời
      {
        $project: {
          productDetails: 0,
          supplierDetails: 0
        }
      },
      // Phân trang
      { $sort: { created_at: sortBy === "new" ? -1 : 1 } },
      {
        $skip: limit && page ? limit * (page - 1) : 0
      },
      {
        $limit: limit ? limit : 5
      }
    ]

    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.receipt.aggregate(pipeline).toArray(),
      databaseServices.receipt.aggregate([{ $match }, { $count: "total" }]).toArray(),
      databaseServices.receipt
        .aggregate([
          { $match },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          { $count: "total" }
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

  async getOrders(
    limit?: number,
    page?: number,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string,
    sortBy?: string,
    name?: string,
    address?: string,
    phone?: string,
    status?: string
  ) {
    const $match: any = {}

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

    if (name) {
      $match["customer_info.name"] = name
    }

    if (address) {
      $match["customer_info.address"] = address
    }

    if (phone) {
      $match["customer_info.phone"] = phone
    }

    if (status) {
      $match["status"] = status
    }

    const pipeline: any[] = [
      { $match },
      { $sort: { created_at: sortBy === "new" ? -1 : 1 } },
      {
        $skip: limit && page ? limit * (page - 1) : 0
      },
      {
        $limit: limit ? limit : 5
      }
    ]

    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.order.aggregate(pipeline).toArray(),
      databaseServices.order.aggregate([{ $match }, { $count: "total" }]).toArray(),
      databaseServices.order
        .aggregate([
          { $match },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          { $count: "total" }
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

  async getOrderDetail(id: string) {
    const result = await databaseServices.order.findOne({ _id: new ObjectId(id) })
    return result
  } // ok

  async updateStatusOrder(id: string, status: OrderStatus) {
    await databaseServices.order.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: status
        },
        $push: {
          status_history: {
            status: status,
            updated_at: new Date()
          }
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: AdminMessage.UPDATE_STATUS_ORDER
    }
  } // ok
}

const adminServices = new AdminServices()
export default adminServices
