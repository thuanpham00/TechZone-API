import { ObjectId, WithId } from "mongodb"
import databaseServices from "./database.services"
import {
  CreateCustomerBodyReq,
  CreateStaffBodyReq,
  UpdateBrandBodyReq,
  UpdateCategoryBodyReq,
  UpdateSupplierBodyReq,
  UpdateSupplyBodyReq
} from "~/models/requests/admin.requests"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import { AdminMessage, ProductMessage, ReceiptMessage, SupplyMessage } from "~/constant/message"
import {
  CreateProductBodyReq,
  CreateReceiptBodyReq,
  CreateRoleBodyReq,
  CreateSupplierBodyReq,
  CreateSupplyBodyReq,
  specificationType,
  UpdatePermissionsRole
} from "~/models/requests/product.requests"
import { mediaServices } from "./medias.services"
import Product from "~/models/schema/product.schema"
import Specification from "~/models/schema/specification.schema"
import { Receipt, Supplier, Supply } from "~/models/schema/supply_supplier.schema"
import { OrderStatus, ProductStatus, UserVerifyStatus, VoucherStatus, VoucherType } from "~/constant/enum"
import { userServices } from "./user.services"
import { hashPassword } from "~/utils/scripto"
import { User } from "~/models/schema/users.schema"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
import { sendVerifyRegisterEmail } from "~/utils/ses"
import { Role } from "~/models/schema/role_permission.schema"
import { File } from "formidable"
import { deleteFromR2ByUrl } from "~/utils/r2_cloudflare"
import { Voucher } from "~/models/schema/voucher.schema"
import { escapeRegex } from "~/utils/common"

class AdminServices {
  async getStatisticalSell(month: number, year: number) {
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

    const findIdCustomerRole = await databaseServices.role.findOne({ key: "CUSTOMER" }).then((res) => res?._id)
    const staffRoles = await databaseServices.role.find({ key: { $nin: ["CUSTOMER", "ADMIN"] } }).toArray()
    const findIdStaffRole = staffRoles.map((r) => r._id)

    const [totalCustomer, totalStaff, top10CustomerBuyTheMost, rateReturningCustomers] = await Promise.all([
      databaseServices.users
        .aggregate([
          {
            $match: {
              role: findIdCustomerRole
            }
          },
          {
            $count: "total"
          }
        ])
        .toArray(),

      databaseServices.users
        .aggregate([
          {
            $match: {
              role: { $in: findIdStaffRole }
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
        value: totalStaff[0]?.total || 0,
        color: "#3a86ff"
      },
      top10CustomerBuyTheMost,
      rateReturningCustomers
    }
  }

  async createCustomer(payload: CreateCustomerBodyReq) {
    const roleId = (await databaseServices.role.findOne({ key: payload.role }).then((res) => res?._id)) as ObjectId

    const emailVerifyToken = await userServices.signEmailVerifyToken({
      user_id: payload.id,
      verify: UserVerifyStatus.Unverified,
      role: roleId.toString()
    })

    const [, token] = await Promise.all([
      databaseServices.users.insertOne(
        new User({
          ...payload,
          _id: new ObjectId(payload.id),
          password: hashPassword(payload.password),
          email_verify_token: emailVerifyToken,
          numberPhone: payload.phone,
          date_of_birth: new Date(payload.date_of_birth),
          role: roleId
        })
      ),
      // tạo cặp AccessToken và RefreshToken mới
      userServices.signAccessTokenAndRefreshToken({
        user_id: payload.id,
        verify: UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
        role: roleId.toString()
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
    const idRoleCustomer = await databaseServices.role.findOne({ key: "CUSTOMER" }).then((res) => res?._id)

    const $match: any = { role: idRoleCustomer }
    if (email) {
      $match["email"] = { $regex: escapeRegex(email), $options: "i" }
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

  async deleteCustomer(id: string) {
    const result = await databaseServices.users.deleteOne({ _id: new ObjectId(id) })
    return result
  }

  async createCategory(name: string, is_active: Boolean, desc: string) {
    const result = await databaseServices.category.insertOne(new Category({ name, is_active, desc }))
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
          { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
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

  async addMenuCategory(id_category: string, name: string, is_active: boolean, items: any[]) {
    // Upload banner cho từng item (nếu có)
    const itemsWithBanner = await Promise.all(
      items.map(async (item) => {
        let bannerUrl: string
        if (item.banner) {
          const { url } = await mediaServices.uploadBannerCategoryLink(item.banner, id_category)
          bannerUrl = url

          return {
            id_item: new ObjectId(),
            name: item.name,
            slug: item.slug,
            type_filter: item.type_filter,
            banner: bannerUrl
          }
        }
        return {
          id_item: new ObjectId(),
          name: item.name,
          slug: item.slug,
          type_filter: item.type_filter
        }
      })
    )

    // Thêm section mới vào category_menu
    await databaseServices.category_menu.updateOne(
      { category_id: new ObjectId(id_category) },
      {
        $push: {
          sections: {
            id_section: new ObjectId(),
            name,
            is_active,
            items: itemsWithBanner
          }
        },
        $currentDate: { updated_at: true }
      },
      { upsert: true }
    )
  }

  async deleteMenuCategory(id: string) {
    await databaseServices.category_menu.updateOne(
      { "sections.id_section": new ObjectId(id) },
      {
        $pull: {
          sections: { id_section: new ObjectId(id) }
        }
      }
    )
  }

  async getMenuByCategoryId(id: string) {
    const result = await databaseServices.category_menu.findOne({ category_id: new ObjectId(id) })
    return result
  }

  async updateGroupNameMenu(id: string, id_section: string, name: string, is_active: boolean) {
    const result = await databaseServices.category_menu.findOneAndUpdate(
      { _id: new ObjectId(id), "sections.id_section": new ObjectId(id_section) },
      { $set: { "sections.$.name": name, "sections.$.is_active": is_active }, $currentDate: { updated_at: true } },
      { returnDocument: "after" }
    )
    return result
  }

  async createLinkCategoryMenu(
    id: string,
    id_category: string,
    id_section: string,
    name: string,
    slug: string,
    type_filter: string,
    banner?: File
  ) {
    let urlImage = ""
    if (banner) {
      const { url } = await mediaServices.uploadBannerCategoryLink(banner, id_category)
      urlImage = url
    }
    const payload = {
      id_item: new ObjectId(),
      name,
      slug,
      type_filter: type_filter
    }
    await databaseServices.category_menu.updateOne(
      {
        _id: new ObjectId(id),
        "sections.id_section": new ObjectId(id_section)
      },
      {
        $push: {
          "sections.$.items": banner ? { ...payload, banner: urlImage } : payload
        }
      }
    )
  }

  async updateLinkCategoryMenu(
    idLink: string,
    id_category: string,
    name: string,
    slug: string,
    type_filter: string,
    banner?: File,
    urlBannerDelete?: string
  ) {
    const itemId = new ObjectId(idLink)
    const payload: any = {
      name,
      slug,
      type_filter
    }

    // Nếu có gửi banner mới thì xóa ảnh cũ và upload ảnh mới
    if (banner) {
      // lấy ra ảnh banner hiện tại của item
      const findItem = await databaseServices.category_menu
        .aggregate([
          { $match: { "sections.items.id_item": itemId } },
          {
            $unwind: "$sections"
          },
          { $unwind: "$sections.items" },
          { $match: { "sections.items.id_item": itemId } },
          { $project: { _id: 0, banner: "$sections.items.banner" } }
        ])
        .toArray()

      const oldBannerUrl = findItem[0]?.banner as string | undefined

      // 2) Xóa file trên R2 nếu có
      if (oldBannerUrl) {
        await deleteFromR2ByUrl(oldBannerUrl)
      }

      // 3) Upload ảnh mới
      const { url } = await mediaServices.uploadBannerCategoryLink(banner, id_category)
      payload.banner = url
    }

    const updateFields: any = {
      "sections.$[].items.$[item].name": payload.name,
      "sections.$[].items.$[item].slug": payload.slug,
      "sections.$[].items.$[item].type_filter": payload.type_filter
    }

    if (payload.banner) {
      updateFields["sections.$[].items.$[item].banner"] = payload.banner
    }

    // xóa ảnh cũ trên R2 nếu có
    if (urlBannerDelete) {
      // verify banner thuộc item này
      const found = await databaseServices.category_menu
        .aggregate([
          { $match: { "sections.items.id_item": itemId } },
          { $unwind: "$sections" },
          { $unwind: "$sections.items" },
          { $match: { "sections.items.id_item": itemId } },
          { $project: { _id: 0, banner: "$sections.items.banner" } }
        ])
        .toArray()

      const currentBanner = found[0]?.banner as string | undefined

      if (!currentBanner) {
        throw new Error("Item has no banner to delete")
      }
      if (currentBanner !== urlBannerDelete) {
        throw new Error("Banner URL mismatch")
      }

      await deleteFromR2ByUrl(urlBannerDelete)
      updateFields["sections.$[].items.$[item].banner"] = ""
    }

    await databaseServices.category_menu.updateOne(
      {
        "sections.items.id_item": itemId
      },
      {
        $set: updateFields,
        $currentDate: { updated_at: true }
      },
      {
        arrayFilters: [{ "item.id_item": itemId }]
      }
    )
  }

  async deleteLinkCategoryMenu(idItem: string) {
    const itemId = new ObjectId(idItem)

    // 1) Tìm URL banner của item (nếu có)
    const found = await databaseServices.category_menu
      .aggregate([
        { $match: { "sections.items.id_item": itemId } },
        { $unwind: "$sections" },
        { $unwind: "$sections.items" },
        { $match: { "sections.items.id_item": itemId } },
        { $project: { _id: 0, banner: "$sections.items.banner" } }
      ])
      .toArray()

    const bannerUrl = found[0]?.banner as string | undefined

    // 2) Xóa file trên R2 nếu có
    if (bannerUrl) {
      await deleteFromR2ByUrl(bannerUrl)
    }

    // 3) Xóa item khỏi mọi section chứa nó
    await databaseServices.category_menu.updateOne(
      { "sections.items.id_item": itemId },
      {
        $pull: {
          "sections.$[].items": { id_item: itemId }
        }
      }
    )

    return { deleted: true }
  }

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
          { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
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
          { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
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
              //  pipeline: [
              //   {
              //     $project: {
              //       _id: 1,
              //       name: 1
              //     }
              //   }
              // ] // dùng cái này hoặc $addFields bên dưới cũng được
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
            $unwind: {
              path: "$brand"
            }
          },
          {
            $lookup: {
              from: "category",
              localField: "category",
              foreignField: "_id",
              as: "category"
              //  pipeline: [
              //   {
              //     $project: {
              //       _id: 1,
              //       name: 1
              //     }
              //   }
              // ] // dùng cái này hoặc $addFields bên dưới cũng được
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
            $project: {
              reviews: 0,
              gifts: 0,
              averageRating: 0
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
        $setOnInsert: new Category({ name: category, is_active: true, brand_ids: [brandId] }) // nếu không tồn tại danh mục thì thêm mới (danh mục liên kết với thương hiệu)
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
          priceAfterDiscount: payload.priceAfterDiscount,
          isFeatured: payload.isFeatured === "undefined" ? "false" : payload.isFeatured,
          description: payload.description,
          banner: {
            id: new ObjectId(),
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

  async updateProduct(id: string, payload: CreateProductBodyReq) {
    const { categoryId, brandId } = await this.checkCategoryBrandExist(payload.category, payload.brand)
    const specificationList = await this.checkSpecificationExist(categoryId, payload.specifications)

    const updateData: any = {
      name: payload.name,
      brand: brandId,
      category: categoryId,
      price: payload.price,
      discount: payload.discount,
      priceAfterDiscount: payload.priceAfterDiscount,
      isFeatured: payload.isFeatured,
      description: payload.description,
      specifications: specificationList as ObjectId[]
    }
    const currentProduct = await databaseServices.product.findOne({ _id: new ObjectId(id) })

    if (!currentProduct) {
      throw new Error("Product not found")
    }

    const updateOptions: any = {
      $set: updateData,
      $currentDate: { updated_at: true }
    }

    if (
      (payload.id_url_gallery_update && payload.id_url_gallery_update.length > 0) ||
      (payload.medias && payload.medias.length > 0)
    ) {
      if (payload.id_url_gallery_update && payload.id_url_gallery_update.length > 0) {
        // những ảnh đã thay đổi cần xóa và thêm lại ảnh mới

        const mediasToDelete = currentProduct.medias.filter((media) =>
          payload.id_url_gallery_update!.includes(media.id.toString())
        )

        await Promise.all(mediasToDelete.map((item) => deleteFromR2ByUrl(item.url)))

        // nối object - 1 lần query update
        updateOptions.$pull = {
          medias: {
            id: {
              $in: payload.id_url_gallery_update.map((id) => new ObjectId(id))
            }
          }
        }
      }

      if (payload.medias && payload.medias.length > 0) {
        const { upload } = await mediaServices.uploadImageList(payload.medias, payload.category, id.toString())
        updateOptions.$push = {
          medias: {
            $each: upload
          }
        }
      }
    }

    if (payload.banner) {
      // xóa ảnh cũ
      if (currentProduct && currentProduct.banner.url) {
        await deleteFromR2ByUrl(currentProduct.banner.url)
      }

      // upload ảnh mới
      const { url: urlBanner, type: typeBanner } = await mediaServices.uploadBanner(
        payload.banner,
        payload.category,
        id.toString()
      )
      updateData.banner = {
        id: currentProduct?.banner.id || new ObjectId(),
        url: urlBanner,
        type: typeBanner
      }
    }

    await databaseServices.product.updateOne({ _id: new ObjectId(id) }, updateOptions)
  }

  async deleteProduct(id: string) {
    const product = await databaseServices.product.findOne({ _id: new ObjectId(id) })
    if (product) {
      // xóa banner
      if (product.banner && product.banner.url) {
        await deleteFromR2ByUrl(product.banner.url)
      }
      // xóa gallery
      if (product.medias && product.medias.length > 0) {
        await Promise.all(product.medias.map((item) => deleteFromR2ByUrl(item.url)))
      }
    }
    await databaseServices.product.deleteOne({ _id: new ObjectId(id) })

    return {
      message: ProductMessage.DELETE_PRODUCT_SUCCESS
    }
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
      $match["email"] = { $regex: escapeRegex(email), $options: "i" }
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
          { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
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
          { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
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
      { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
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

  async getOrdersInProcess(
    type_filter: string,
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
    if (type_filter === "completed") {
      $match.status = OrderStatus.delivered // "Đã giao hàng"
    } else if (type_filter === "canceled") {
      $match.status = OrderStatus.cancelled // "Đã hủy"
    } else if (type_filter === "in_process") {
      $match.status = { $nin: [OrderStatus.delivered, OrderStatus.cancelled] } // Trừ đã giao và đã hủy
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
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_id",
          pipeline: [{ $project: { avatar: 1, _id: 1 } }]
        }
      },
      {
        $unwind: {
          path: "$user_id",
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
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

    if (type_filter === "completed") {
      // nếu các đơn hoàn thành (đã nhận hàng) - thì mới xử lý review trả về
      const orderIdReview = result.filter((ord) => ord.isReview === true).map((ord) => ord._id.toString())
      const listReviewOrders = await Promise.all(
        orderIdReview.map(async (id) => {
          const reviews = await databaseServices.reviews
            .find(
              { orderId: new ObjectId(id) },
              {
                projection: {
                  orderId: 1,
                  productId: 1,
                  rating: 1,
                  comment: 1,
                  title: 1,
                  images: 1,
                  created_at: 1
                }
              }
            )
            .toArray()
          return await Promise.all(
            reviews.map(async (r) => {
              const product = await databaseServices.product.findOne(
                { _id: r.productId },
                {
                  projection: { name: 1, banner: 1 }
                }
              )
              return {
                ...r,
                productId: product
              }
            })
          )
        })
      )
      let list: any = []
      listReviewOrders.map((reviewOrder, index) => {
        list = [...list, ...reviewOrder] // gộp các mảng con thành một mảng lớn
      })
      list.forEach((item: any) => {
        const findOrder = result.findIndex((ord) => ord._id.toString() === item.orderId.toString())
        if (findOrder !== -1) {
          if (!result[findOrder].reviews) {
            result[findOrder].reviews = []
          }
          result[findOrder].reviews.push(item)
        }
      })
    }
    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0
    }
  }

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
  }

  async getVouchers(limit?: number, page?: number, name?: string, code?: string, status?: string, sortBy?: string) {
    const $match: any = {}

    const pipeline: any[] = [
      { $match },
      // Phân trang
      { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
      {
        $skip: limit && page ? limit * (page - 1) : 0
      },
      {
        $limit: limit ? limit : 5
      }
    ]

    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.vouchers.aggregate(pipeline).toArray(),
      databaseServices.vouchers.aggregate([{ $match }, { $count: "total" }]).toArray(),
      databaseServices.vouchers
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

  async getVouchersForOrders(id: string, limit?: number, page?: number) {
    const $match: any = {
      voucher_id: new ObjectId(id),
      status: { $ne: OrderStatus.cancelled } // loại trừ đơn hàng đã hủy
    }

    const pipeline: any[] = [
      {
        $match
      },
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

  async createVoucher(body: {
    code: string
    description?: string
    type: VoucherType
    value: number
    max_discount?: number
    min_order_value: number
    usage_limit?: number
    start_date: string
    end_date: string
    status?: VoucherStatus
  }) {
    const startDate = new Date(body.start_date)
    const endDate = new Date(body.end_date)

    const result = await databaseServices.vouchers.insertOne(
      new Voucher({
        code: body.code,
        description: body.description,
        type: body.type,
        value: body.value,
        max_discount: body.max_discount,
        min_order_value: body.min_order_value,
        usage_limit: body.usage_limit,
        used_count: 0,
        start_date: startDate,
        end_date: endDate,
        status: body.status || VoucherStatus.active
      })
    )

    const voucher = await databaseServices.vouchers.findOne({ _id: result.insertedId })
    return voucher
  }

  async updateVoucher(
    id: string,
    body: {
      code: string
      description?: string
      type: VoucherType
      value: number
      max_discount?: number
      min_order_value: number
      usage_limit?: number
      start_date: string
      end_date: string
      status?: VoucherStatus
    }
  ) {
    const updateData: any = { ...body }

    await databaseServices.vouchers.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    return {
      message: AdminMessage.UPDATE_VOUCHER_SUCCESS
    }
  }

  async deleteVoucher(id: string) {
    await databaseServices.vouchers.deleteOne({ _id: new ObjectId(id) })
    return {
      message: AdminMessage.DELETE_VOUCHER_SUCCESS
    }
  }

  async getRoles() {
    const [result] = await Promise.all([
      databaseServices.role
        .aggregate([
          {
            $sort: { created_at: -1 }
          }
        ])
        .toArray()
    ])

    return {
      result
    }
  }

  async createRole(body: CreateRoleBodyReq) {
    await databaseServices.role.insertOne(
      new Role({
        name: body.name,
        description: body.description,
        key: body.name.toUpperCase().replace(/\s+/g, "_"),
        permissions: []
      })
    )
    return {
      message: AdminMessage.CREATE_ROLE_DETAIL
    }
  }

  async updateRole(idRole: string, body: CreateRoleBodyReq) {
    await databaseServices.role.updateOne(
      { _id: new ObjectId(idRole) },
      { $set: { ...body }, $currentDate: { updated_at: true } }
    )
    return {
      message: AdminMessage.UPDATE_ROLE_DETAIL
    }
  }

  async deleteRole(idRole: string) {
    await databaseServices.role.deleteOne({ _id: new ObjectId(idRole) })
    return {
      message: AdminMessage.UPDATE_ROLE_DETAIL
    }
  }

  async getPermissions() {
    const result = await databaseServices.permissions.find({}).toArray()
    return {
      result
    }
  }

  async getPermissionsBasedOnIdRole(listIdRole: string[]) {
    const [result] = await Promise.all([
      databaseServices.role
        .aggregate([
          {
            $match: {
              _id: {
                $in: listIdRole.map((item) => new ObjectId(item))
              }
            }
          },
          {
            $lookup: {
              from: "permissions",
              localField: "permissions",
              foreignField: "_id",
              as: "permissions"
            }
          },
          {
            $project: {
              created_at: 0,
              updated_at: 0,
              "permissions.created_at": 0,
              "permissions.updated_at": 0
            }
          }
        ])
        .toArray()
    ])

    return result
  }

  async updatePermissionsBasedOnIdRole(payload: UpdatePermissionsRole[]) {
    const results = await Promise.all(
      payload.map(async (item) => {
        const roleId = new ObjectId(item._id)
        const addIds = item.add.map((id) => new ObjectId(id))
        const removeIds = item.remove.map((id) => new ObjectId(id))

        // Thêm quyền mới
        if (addIds.length > 0) {
          await databaseServices.role.updateOne({ _id: roleId }, { $addToSet: { permissions: { $each: addIds } } })
        }

        // Xoá quyền
        if (removeIds.length > 0) {
          await databaseServices.role.updateOne({ _id: roleId }, { $pull: { permissions: { $in: removeIds } as any } })
        }

        // Trả về role sau khi update
        return databaseServices.role.findOne({ _id: roleId })
      })
    )

    return {
      result: results
    }
  }

  async getStaffs(
    limit?: number,
    page?: number,
    email?: string,
    name?: string,
    phone?: string,
    sortBy?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string
  ) {
    const allRole = await databaseServices.role.find({}).toArray()

    const groupRoleExcludeAdminAndCustomer = allRole
      .filter((role) => role.key !== "ADMIN" && role.key !== "CUSTOMER")
      .map((item) => item._id)
    const $match: any = { role: { $in: groupRoleExcludeAdminAndCustomer } }

    if (email) {
      $match["email"] = { $regex: escapeRegex(email), $options: "i" }
    }
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
    }
    if (phone) {
      $match["numberPhone"] = { $regex: phone, $options: "i" }
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
            $lookup: {
              from: "roles",
              localField: "role",
              foreignField: "_id",
              as: "role"
            }
          },
          {
            $addFields: {
              role: { $arrayElemAt: ["$role.name", 0] } // lấy phần tử đầu tiên của mảng name
            }
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

  async createStaff(payload: CreateStaffBodyReq) {
    const roleId = (await databaseServices.role
      .findOne({ _id: new ObjectId(payload.role) })
      .then((res) => res?._id)) as ObjectId

    const [, token] = await Promise.all([
      databaseServices.users.insertOne(
        new User({
          ...payload,
          _id: new ObjectId(payload.id),
          password: hashPassword(payload.password),
          email_verify_token: "",
          verify: 1,
          numberPhone: payload.phone,
          date_of_birth: new Date(payload.date_of_birth),
          employeeInfo: {
            department: payload.department,
            hire_date: new Date(payload.hire_date),
            salary: payload.salary,
            contract_type: payload.contract_type,
            status: payload.status
          },
          role: roleId
        })
      ),
      // tạo cặp AccessToken và RefreshToken mới
      userServices.signAccessTokenAndRefreshToken({
        user_id: payload.id,
        verify: UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
        role: roleId.toString()
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

    return {
      user
    }
  }

  async getListReviewsOrders(
    limit?: number,
    page?: number,
    sortBy?: string,
    created_at_start?: string,
    created_at_end?: string,
    updated_at_start?: string,
    updated_at_end?: string,
    name?: string,
    rating?: string
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

    if (rating) {
      $match["rating"] = Number(rating)
    }

    if (name) {
      const listProductIncludeName = await databaseServices.product
        .find({ name: { $regex: name, $options: "i" } })
        .toArray()
      const listIdProduct = listProductIncludeName.map((item) => item._id)
      $match["productId"] = { $in: listIdProduct }
    }

    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.reviews
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userId",
              pipeline: [{ $project: { avatar: 1, _id: 1, name: 1 } }]
            }
          },
          {
            $unwind: {
              path: "$userId",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: "product",
              localField: "productId",
              foreignField: "_id",
              as: "productId",
              pipeline: [{ $project: { name: 1, _id: 1, banner: 1 } }]
            }
          },
          {
            $unwind: {
              path: "$productId",
              preserveNullAndEmptyArrays: true
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
      databaseServices.reviews
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.reviews
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

  async deleteReviewOrder(id: string) {
    const findReview = await databaseServices.reviews.findOne({ _id: new ObjectId(id) })
    // xóa đánh giá hiện tại
    await databaseServices.reviews.deleteOne({ _id: new ObjectId(id) })

    // tính lại average rating cho sản phẩm
    const findReviews = await databaseServices.reviews
      .find({ productId: new ObjectId(findReview?.productId) })
      .toArray()
    const totalRating = findReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = findReviews.length ? totalRating / findReviews.length : 0
    const rounded = Math.round(averageRating * 10) / 10

    await databaseServices.product.updateOne(
      { _id: new ObjectId(findReview?.productId) },
      {
        $pull: { reviews: new ObjectId(id) },
        $set: { averageRating: rounded },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: AdminMessage.DELETE_REVIEW_ORDER_SUCCESS
    }
  }
}

const adminServices = new AdminServices()
export default adminServices
