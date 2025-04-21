import { ObjectId, WithId } from "mongodb"
import databaseServices from "./database.services"
import { UpdateBrandBodyReq, UpdateCategoryBodyReq, UpdateSupplierBodyReq } from "~/models/requests/admin.requests"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import { AdminMessage } from "~/constant/message"
import {
  CreateProductBodyReq,
  CreateSupplierBodyReq,
  CreateSupplyBodyReq,
  specificationType
} from "~/models/requests/product.requests"
import { mediaServices } from "./medias.services"
import Product from "~/models/schema/product.schema"
import Specification from "~/models/schema/specification.schema"
import { Supplier, Supply } from "~/models/schema/supply_supplier.schema"

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

  async getNameCategoriesFilter() {
    const result = await databaseServices.category.find({}).toArray()
    const listName = result.map((item) => item.name)
    return listName
  }

  async updateCategory(id: string, body: UpdateCategoryBodyReq) {
    console.log("body", body)
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
    status?: string
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
    updated_at_end?: string
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
    await databaseServices.supply.insertOne(
      new Supply({
        ...payload,
        productId: new ObjectId(payload.productId),
        supplierId: new ObjectId(payload.supplierId),
        importPrice: payload.importPrice,
        warrantyMonths: payload.warrantyMonths,
        leadTimeDays: payload.leadTimeDays
      })
    )
    return {
      message: AdminMessage.CREATE_SUPPLY_DETAIL
    }
  }
}

const adminServices = new AdminServices()
export default adminServices
