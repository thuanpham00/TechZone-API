import { Request, Response, NextFunction } from "express"
import { envConfig } from "~/utils/config"
import crypto from "crypto"

export const createPaymentController = async (req: Request, res: Response, next: NextFunction) => {
  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any).socket.remoteAddress

  const tmnCode = envConfig.vnp_TmnCode
  const secretKey = envConfig.vnp_HashSecret
  let vnpUrl = envConfig.vnp_Url
  const returnUrl = envConfig.vnp_ReturnUrl

  const date = new Date()
  const createDate = date
    .toISOString()
    .replace(/[-T:\.Z]/g, "")
    .slice(0, 14)
  const orderId = date.getTime().toString()
  // Lấy các tham số từ yêu cầu POST.
  const amount = req.body.amount
  const orderInfo = req.body.orderDescription
  const orderType = req.body.orderType
  const locale = req.body.language || "vn"
  const currCode = "VND"

  let vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0", // phiên bản api mà kết nối
    vnp_Command: "pay", // mã cho giao dịch thanh toán
    vnp_TmnCode: tmnCode, // mã website
    vnp_Locale: locale, // ngôn ngữ giao diện hiển thị
    vnp_CurrCode: currCode, // đơn vị sử dụng tiền tệ thanh toán
    vnp_TxnRef: orderId, // mã id phân biệt đơn hàng
    vnp_OrderInfo: orderInfo, // thông tin mô tả nội dung
    vnp_OrderType: orderType, // mã danh mục hàng hóa
    vnp_Amount: (amount * 100).toString(), // số tiền thanh toán
    vnp_ReturnUrl: returnUrl, // url thông báo ket quả giao dịch trả về
    vnp_IpAddr: ipAddr as string, // địa chỉ ip khách hàng
    vnp_CreateDate: createDate // thời gian tạo đơn hàng
  }
  vnp_Params = sortObject(vnp_Params)
  // Tạo chữ ký HMAC và thêm vào các tham số
  const signData = new URLSearchParams(vnp_Params).toString()
  const hmac = crypto.createHmac("sha512", secretKey)
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex")
  vnp_Params["vnp_SecureHash"] = signed

  // Tạo URL thanh toán và chuyển hướng khách hàng
  vnpUrl += "?" + new URLSearchParams(vnp_Params).toString()

  res.json({ url: vnpUrl }) // Trả về URL thanh toán dưới dạng JSON
}

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {}
  const keys = Object.keys(obj).sort()
  keys.forEach((key) => {
    sorted[key] = obj[key]
  })
  return sorted
}
/**
 * 
Ngân hàng	NCB
Số thẻ	9704198526191432198
Tên chủ thẻ	NGUYEN VAN A
Ngày phát hành	07/15
Mật khẩu OTP	123456
 */
