import { ObjectId } from "mongodb"
interface CategoryType {
  _id?: ObjectId
  name: string
  brand_ids?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export class Category {
  _id?: ObjectId
  name: string
  brand_ids: ObjectId[]
  created_at: Date
  updated_at: Date
  constructor(category: CategoryType) {
    const date = new Date()
    this._id = category._id || new ObjectId()
    this.name = category.name
    this.brand_ids = category.brand_ids || [] // lúc mới tạo không cần thiết phải có thương hiệu
    this.created_at = category.created_at || date
    this.updated_at = category.updated_at || date
  }
}

interface BrandType {
  _id?: ObjectId
  name: string
  category_ids?: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export class Brand {
  _id?: ObjectId
  name: string
  category_ids: ObjectId[]
  created_at: Date
  updated_at: Date
  constructor(brand: BrandType) {
    const date = new Date()
    this._id = brand._id || new ObjectId()
    this.name = brand.name 
    this.category_ids = brand.category_ids || []
    this.created_at = brand.created_at || date
    this.updated_at = brand.updated_at || date
  }
}

// 1 danh mục sẽ có nhiều thương hiệu (Laptop có nhiều thương hiệu: Apple, Acer, Asus...)
// 1 thương hiệu sẽ thuộc về nhiều danh mục (Apple thuộc về nhiều danh mục: Laptop, Màn hình, Bàn phím ...)
// quan hệ nhiều