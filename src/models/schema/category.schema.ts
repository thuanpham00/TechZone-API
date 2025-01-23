import { ObjectId } from "mongodb"

interface CategoryType {
  _id?: ObjectId
  name: string
  created_at?: Date
  updated_at?: Date
}

class Category {
  _id?: ObjectId
  name: string
  created_at: Date
  updated_at: Date
  constructor(category: CategoryType) {
    const date = new Date()
    this._id = category._id
    this.name = category.name
    this.created_at = category.created_at || date
    this.updated_at = category.updated_at || date
  }
}

export default Category
