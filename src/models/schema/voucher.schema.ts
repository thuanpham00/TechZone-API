import { ObjectId } from "mongodb"
import { VoucherStatus, VoucherType } from "~/constant/enum"

interface VoucherConstructor {
  _id?: ObjectId
  code: string // Mã voucher (unique, vd: "FREESHIP", "GIAM10")
  description?: string
  type: VoucherType // "percentage" hoặc "fixed"
  value: number // % (nếu percentage) hoặc số tiền (nếu fixed)
  max_discount?: number // Giảm tối đa (chỉ dùng khi type = percentage)
  min_order_value: number // Giá trị đơn hàng tối thiểu
  usage_limit?: number // Số lần sử dụng tối đa (undefined = unlimited)
  used_count?: number // Đã sử dụng bao nhiêu lần
  start_date: Date
  end_date: Date
  status?: VoucherStatus
  created_at?: Date
  updated_at?: Date
}

export class Voucher {
  _id?: ObjectId
  code: string
  description: string
  type: VoucherType
  value: number
  max_discount?: number
  min_order_value: number
  usage_limit?: number
  used_count: number
  start_date: Date
  end_date: Date
  status: VoucherStatus
  created_at: Date
  updated_at: Date

  constructor(voucher: VoucherConstructor) {
    const date = new Date()
    this._id = voucher._id || new ObjectId()
    this.code = voucher.code
    this.description = voucher.description || ""
    this.type = voucher.type
    this.value = voucher.value
    this.max_discount = voucher.max_discount
    this.min_order_value = voucher.min_order_value
    this.usage_limit = voucher.usage_limit
    this.used_count = voucher.used_count || 0
    this.start_date = voucher.start_date
    this.end_date = voucher.end_date
    this.status = voucher.status || VoucherStatus.active
    this.created_at = voucher.created_at || date
    this.updated_at = voucher.updated_at || date
  }
}
