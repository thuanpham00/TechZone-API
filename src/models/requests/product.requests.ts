import { File } from "formidable"
import { ProductInFavourite } from "../schema/favourite_cart.order.schema"
import { OrderStatus, TypeOrder } from "~/constant/enum"

export type CreateProductBodyReq = {
  name: string
  category: string
  brand: string
  price: number
  discount: number
  stock: number
  isFeatured: string
  description: string
  banner: File
  medias: File[]
  specifications: specificationType[]
}

export type CreateSupplierBodyReq = {
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  taxCode: string
  description?: string
}

export type CreateSupplyBodyReq = {
  productId: string
  supplierId: string
  importPrice: number
  warrantyMonths: number
  leadTimeDays: number
  description: string
}

export type ReceiptProductBodyReq = {
  productId: string // tên sản phẩm
  supplierId: string // tên nhà cung cấp
  quantity: number // Số lượng nhập
  pricePerUnit: number // Giá nhập mỗi đơn vị, tự động lấy từ Supply
  totalPrice: number // Tổng giá, tự động tính: quantity * pricePerUnit
}

export type CreateReceiptBodyReq = {
  items: ReceiptProductBodyReq[] // danh sách sản phẩm trong 1 đơn hàng
  totalAmount: number // Tổng giá trị toàn bộ đơn hàng
  totalItem: number // số lượng sản phẩm trong đơn hàng
  importDate: Date // Ngày nhập hàng
  note?: string
}

export type CreateOrderBodyReq = {
  type_order: TypeOrder
  customer_info: {
    name: string // người nhận
    phone: string
    address: string
    email: string
  }
  products: {
    product_id: string // ref tới bảng Product (để tra cứu thêm nếu cần)
    name: string // tên sản phẩm tại thời điểm mua
    price: number // đơn giá lúc mua
    quantity: number // số lượng mua
    image: string
    discount?: number
  }[]
  subTotal: number
  shipping_fee: number
  totalAmount: number
  status?: OrderStatus
  note?: string
}

export type GetCollectionReq = {
  limit: string
  page: string
}

export type ConditionQuery = {
  brand?: string
  category?: string
  price?: { $gte?: number; $lt?: number }
}

export type specificationType = {
  name: string
  value: string | number
}

export type CreateFavouriteBodyReq = {
  products: ProductInFavourite
}

export type CreateRoleBodyReq = {
  name: string
  description: string
}

export type UpdatePermissionsRole = {
  _id: string
  add: string[]
  remove: string[]
}

export type GetCollectionQuery = {
  status?: string
  screen_size?: string
}
