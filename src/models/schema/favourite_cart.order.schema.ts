import { ObjectId } from "mongodb"
import { OrderStatus, TypeOrder } from "~/constant/enum"

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

interface ProductInOrder {
  product_id: ObjectId // ref tới bảng Product (để tra cứu thêm nếu cần)
  name: string // tên sản phẩm tại thời điểm mua
  price: number // đơn giá lúc mua
  quantity: number // số lượng mua
  image: string
  discount?: number
}

interface OrderType {
  _id?: ObjectId
  user_id: ObjectId // người đặt hàng (đăng nhập)
  customer_info: {
    name: string // người nhận
    phone: string
    address: string
    email: string
  }
  products: ProductInOrder[]
  subTotal: number
  shipping_fee: number
  discount_amount?: number // Số tiền giảm từ 1 voucher
  voucher_id?: ObjectId // ID của 1 voucher duy nhất
  voucher_code?: string // Mã voucher
  totalAmount: number
  status?: OrderStatus
  type_order?: TypeOrder
  status_history?: {
    status: OrderStatus
    updated_at: Date
  }[]
  note?: string
  created_at?: Date
  updated_at?: Date
}

export class Order {
  _id?: ObjectId
  user_id: ObjectId
  customer_info: {
    name: string // người nhận
    phone: string
    address: string
    email: string
  }
  products: ProductInOrder[]
  subTotal: number
  shipping_fee: number
  discount_amount: number // Số tiền giảm từ 1 voucher
  voucher_id?: ObjectId // ID của 1 voucher duy nhất
  voucher_code?: string // Mã voucher
  totalAmount: number
  type_order: TypeOrder
  status: OrderStatus
  status_history: {
    status: OrderStatus
    updated_at: Date
  }[]
  note: string
  created_at: Date
  updated_at: Date
  constructor(order: OrderType) {
    const date = new Date()
    this._id = order._id || new ObjectId()
    this.user_id = order.user_id
    this.customer_info = {
      name: order.customer_info.name,
      phone: order.customer_info.phone,
      address: order.customer_info.address,
      email: order.customer_info.email
    }
    this.products = order.products
    this.shipping_fee = order.shipping_fee
    this.discount_amount = order.discount_amount || 0
    this.voucher_id = order.voucher_id
    this.voucher_code = order.voucher_code
    this.subTotal = order.subTotal
    this.totalAmount = order.totalAmount
    this.status = order.status || OrderStatus.pending
    this.type_order = order.type_order || TypeOrder.vnpay
    this.status_history = order.status_history || []
    this.note = order.note || ""
    this.created_at = order.created_at || date
    this.updated_at = order.updated_at || date
  }
}
