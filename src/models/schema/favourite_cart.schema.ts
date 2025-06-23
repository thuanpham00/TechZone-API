import { ObjectId } from "mongodb"

export interface ProductInFavourite {
  product_id: ObjectId // Tham chiếu tới bảng products
  added_at: Date // Thời điểm thêm vào yêu thích (tùy chọn)
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
  constructor(favourite: FavouriteType) {
    const date = new Date()
    this._id = favourite._id || new ObjectId()
    this.user_id = favourite.user_id
    this.products = favourite.products
    this.created_at = favourite.created_at || date
    this.updated_at = favourite.updated_at || date
  }
}

export interface CartProduct {
  product_id: ObjectId // Tham chiếu bảng Product
  quantity: number // Số lượng sản phẩm
  added_at: Date // Thời điểm thêm vào giỏ
}

interface CartType {
  _id?: ObjectId
  user_id: ObjectId
  products: CartProduct[]
  created_at: Date
  updated_at: Date
}

export class Cart {
  _id?: ObjectId
  user_id: ObjectId
  products: CartProduct[]
  created_at: Date
  updated_at: Date
  constructor(cart: CartType) {
    const date = new Date()
    this._id = cart._id || new ObjectId()
    this.user_id = cart.user_id
    this.products = cart.products
    this.created_at = cart.created_at || date
    this.updated_at = cart.updated_at || date
  }
}