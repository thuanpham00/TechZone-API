import { VoucherStatus } from "~/constant/enum"
import databaseServices from "./database.services"

class VoucherServices {
  /**
   * 
   * Điều kiện này lọc ra các voucher còn hiệu lực về lượt sử dụng, gồm:
Voucher không giới hạn số lần sử dụng, hoặc
Voucher còn lượt trống (chưa dùng hết quota).
   * @returns 
   */
  async getAvailableVouchers(order_value?: number) {
    const now = new Date()

    const query: any = {
      status: VoucherStatus.active,
      start_date: { $lte: now },
      end_date: { $gte: now },
      $or: [{ usage_limit: { $exists: false } }, { $expr: { $lt: ["$used_count", "$usage_limit"] } }]
    }

    // Chỉ thêm điều kiện min_order_value khi order_value được truyền
    if (order_value !== undefined) {
      query.min_order_value = { $lte: order_value }
    }

    return await databaseServices.vouchers.find(query).toArray()
  }
}

const voucherServices = new VoucherServices()
export default voucherServices
