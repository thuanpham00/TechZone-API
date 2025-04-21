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
