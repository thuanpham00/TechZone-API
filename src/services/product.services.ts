import { CreateProductBodyReq, specificationType } from "~/models/requests/product.requests"
import databaseServices from "./database.services"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import { ObjectId, WithId } from "mongodb"
import Product from "~/models/schema/product.schema"
import { ProductMessage } from "~/constant/message"
import Specification from "~/models/schema/specification.schema"

class ProductServices {
  private async checkBrandExist(brand: string, category_id: ObjectId) {
    const brandCheck = await databaseServices.brand.findOneAndUpdate(
      { name: brand, category_id: new ObjectId(category_id) },
      {
        $setOnInsert: new Brand({ name: brand, category_id: new ObjectId(category_id) })
      },
      {
        upsert: true,
        returnDocument: "after" // cập nhật liền sau khi update (trên postman)
      }
    )
    return (brandCheck as WithId<Brand>)._id
  } // truyền vào giá trị "asus" => nó check coi có tồn tại name này không, nếu có thì thôi, không thì tạo mới => lấy ra ObjectID

  private async checkCategoryExist(category: string) {
    const categoryCheck = await databaseServices.category.findOneAndUpdate(
      { name: category },
      {
        $setOnInsert: new Category({ name: category })
      },
      {
        upsert: true,
        returnDocument: "after" // cập nhật liền sau khi update (trên postman)
      }
    )
    return (categoryCheck as WithId<Category>)._id
  }

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
    const categoryId = await this.checkCategoryExist(payload.category)
    const brandId = await this.checkBrandExist(payload.brand, categoryId)
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
}

export const productServices = new ProductServices()
