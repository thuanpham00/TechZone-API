import { ObjectId } from "mongodb"

export interface ProductInFavourite {
  _id: ObjectId
  name: string
  image: string
  price: number
  discount: number
}

interface FavouriteType {
  _id?: ObjectId
  user_id: ObjectId
  products: ProductInFavourite[]
  created_at?: Date
  updated_at?: Date
}

export class Favourite {
  _id?: ObjectId
  user_id: ObjectId
  products: ProductInFavourite[]
  created_at: Date
  updated_at: Date
  constructor(supplier: FavouriteType) {
    const date = new Date()
    this._id = supplier._id || new ObjectId()
    this.user_id = supplier.user_id
    this.products = supplier.products
    this.created_at = supplier.created_at || date
    this.updated_at = supplier.updated_at || date
  }
}
