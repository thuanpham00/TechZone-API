import { CreateProductBodyReq, specificationType } from "~/models/requests/product.requests"
import databaseServices from "./database.services"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import { ObjectId, WithId } from "mongodb"
import Product from "~/models/schema/product.schema"
import { ProductMessage } from "~/constant/message"
import Specification from "~/models/schema/specification.schema"

class ProductServices {
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
    const result = await databaseServices.product.findOneAndUpdate(
      { name: payload.name, brand: brandId, category: categoryId },
      {
        $setOnInsert: new Product({
          ...payload,
          brand: brandId,
          category: categoryId,
          _id: productId,
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

  async getProductDetail(id: string) {
    const result = await databaseServices.product
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
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
        }
      ])
      .toArray()
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
}

export const productServices = new ProductServices()
