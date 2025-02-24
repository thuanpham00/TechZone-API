import { ObjectId } from "mongodb"

interface BrandType {
  _id?: ObjectId
  name: string
  category_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

export class Brand {
  _id?: ObjectId
  name: string
  category_id: ObjectId
  created_at: Date
  updated_at: Date
  constructor(brand: BrandType) {
    const date = new Date()
    this._id = brand._id || new ObjectId()
    this.name = brand.name
    this.category_id = brand.category_id
    this.created_at = brand.created_at || date
    this.updated_at = brand.updated_at || date
  }
}

interface CategoryType {
  _id?: ObjectId
  name: string
  created_at?: Date
  updated_at?: Date
}

export class Category {
  _id?: ObjectId
  name: string
  created_at: Date
  updated_at: Date
  constructor(category: CategoryType) {
    const date = new Date()
    this._id = category._id || new ObjectId()
    this.name = category.name
    this.created_at = category.created_at || date
    this.updated_at = category.updated_at || date
  }
}
