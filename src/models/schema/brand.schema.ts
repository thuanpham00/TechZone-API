import { ObjectId } from "mongodb"

interface BrandType {
  _id?: ObjectId
  name: string
  created_at?: Date
  updated_at?: Date
}

class Brand {
  _id?: ObjectId
  name: string
  created_at: Date
  updated_at: Date
  constructor(brand: BrandType) {
    const date = new Date()
    this._id = brand._id
    this.name = brand.name
    this.created_at = brand.created_at || date
    this.updated_at = brand.updated_at || date
  }
}

export default Brand
