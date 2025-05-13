import { ObjectId } from "mongodb"

// nhà cung cấp
interface SupplierType {
  _id?: ObjectId
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  taxCode: string
  description?: string
  created_at?: Date
  updated_at?: Date
}

export class Supplier {
  _id?: ObjectId
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  taxCode: string
  description: string
  created_at: Date
  updated_at: Date
  constructor(supplier: SupplierType) {
    const date = new Date()
    this._id = supplier._id || new ObjectId()
    this.name = supplier.name
    this.contactName = supplier.contactName
    this.email = supplier.email
    this.phone = supplier.phone
    this.address = supplier.address
    this.taxCode = supplier.taxCode
    this.description = supplier.description || ""
    this.created_at = supplier.created_at || date
    this.updated_at = supplier.updated_at || date
  }
}

// cung ứng
interface SupplyType {
  _id?: ObjectId
  productId: ObjectId // Liên kết tới Product
  supplierId: ObjectId // Liên kết tới Supplier
  importPrice: number // Giá nhập từ nhà cung cấp
  warrantyMonths: number // ✅ Bảo hành bao lâu (3, 6, 12, 24 tháng,...)
  leadTimeDays: number // ✅ Thời gian cung ứng (ngày)
  description?: string
  created_at?: Date
  updated_at?: Date
}

export class Supply {
  _id: ObjectId
  productId: ObjectId
  supplierId: ObjectId
  importPrice: number
  warrantyMonths: number
  leadTimeDays: number
  description?: string
  created_at?: Date
  updated_at?: Date
  constructor(supply: SupplyType) {
    const date = new Date()
    this._id = supply._id || new ObjectId()
    this.productId = supply.productId
    this.supplierId = supply.supplierId
    this.importPrice = supply.importPrice
    this.warrantyMonths = supply.warrantyMonths || 0
    this.leadTimeDays = supply.leadTimeDays || 0
    this.description = supply.description || ""
    this.created_at = supply.created_at || date
    this.updated_at = supply.updated_at || date
  }
}

export interface ReceiptProductType {
  productId: ObjectId // ID sản phẩm
  supplierId: ObjectId // ID nhà cung cấp
  quantity: number // Số lượng nhập
  pricePerUnit: number // Giá nhập mỗi đơn vị, tự động lấy từ Supply
  totalPrice: number // Tổng giá, tự động tính: quantity * pricePerUnit
}

interface ReceiptType {
  _id?: ObjectId
  items: ReceiptProductType[] // danh sách sản phẩm trong 1 đơn hàng
  totalAmount: number // Tổng giá trị toàn bộ đơn hàng
  totalItem: number // tổng sản phẩm trong đơn hàng
  importDate: Date // Ngày nhập hàng
  note?: string
  created_at?: Date
  updated_at?: Date
}

export class Receipt {
  _id: ObjectId
  items: ReceiptProductType[] // danh sách sản phẩm trong 1 đơn hàng
  totalAmount: number // Tổng giá trị toàn bộ đơn hàng
  totalItem: number // số lượng sản phẩm trong đơn hàng
  importDate: Date // Ngày nhập hàng
  note: string
  created_at: Date
  updated_at: Date
  constructor(receipt: ReceiptType) {
    const date = new Date()
    this._id = receipt._id || new ObjectId()
    this.items = receipt.items
    this.totalAmount = receipt.totalAmount
    this.totalItem = receipt.totalItem
    this.importDate = receipt.importDate
    this.note = receipt.note || ""
    this.created_at = receipt.created_at || date
    this.updated_at = receipt.updated_at || date
  }
}

// Cái api này là dùng để sử dụng khi nhập hàng (hàng mới đã giao) -> mình tự cập nhật số lượng sản phẩm khi có hàng mới về - để quản lý đầu vào
// flow tạo 1 đơn hàng (gồm danh sách sản phẩm)
// tạo 1 đơn hàng -> chọn sản phẩm -> chọn nhà cung cấp -> sau đó render ra giá nhập -> tự fill (productId, supplierId, pricePerUnit) -> người dùng nhập quantity và render tự động ra totalPrice

// lần lượt add các sản phẩm
// sau đó tự cập nhật totalAmount và totalItem
// tự render ra ngày nhập hàng
// note, created_at, updated_at ko bắt buộc