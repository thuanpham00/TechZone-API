import { CreateProductBodyReq } from "~/models/requests/product.requests"
import databaseServices from "./database.services"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import { ObjectId, WithId } from "mongodb"
import Product from "~/models/schema/product.schema"
import { ProductMessage } from "~/constant/message"

class ProductServices {
  async checkBrandExist(brand: string) {
    const brandCheck = await databaseServices.brand.findOneAndUpdate(
      { name: brand },
      {
        $setOnInsert: new Brand({ name: brand })
      },
      {
        upsert: true,
        returnDocument: "after" // cập nhật liền sau khi update (trên postman)
      }
    )
    console.log(brandCheck?._id)
    return (brandCheck as WithId<Brand>)._id
  } // truyền vào giá trị "asus" => nó check coi có tồn tại name này không, nếu có thì thôi, không thì tạo mới => lấy ra ObjectID

  async checkCategoryExist(brand: string) {
    const categoryCheck = await databaseServices.category.findOneAndUpdate(
      { name: brand },
      {
        $setOnInsert: new Category({ name: brand })
      },
      {
        upsert: true,
        returnDocument: "after" // cập nhật liền sau khi update (trên postman)
      }
    )
    console.log(categoryCheck?._id)
    return (categoryCheck as WithId<Category>)._id
  }

  async createProduct(payload: CreateProductBodyReq) {
    const [brandId, categoryId] = await Promise.all([
      this.checkBrandExist(payload.brand),
      this.checkCategoryExist(payload.category)
    ])
    const productId = new ObjectId()
    const result = await databaseServices.product.findOneAndUpdate(
      { name: payload.name },
      {
        $setOnInsert: new Product({
          ...payload,
          brand: brandId,
          category: categoryId,
          _id: productId
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
