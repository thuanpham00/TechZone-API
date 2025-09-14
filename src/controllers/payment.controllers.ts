import { Request, Response, NextFunction } from "express"
import { envConfig } from "~/utils/config"
import crypto from "crypto"
import databaseServices from "~/services/database.services"
import { ObjectId } from "mongodb"
import { CreateOrderBodyReq } from "~/models/requests/product.requests"
import { OrderStatus, StatusEmailResend, TypeEmailResend } from "~/constant/enum"
import orderServices from "~/services/order.services"
import { EmailLog } from "~/models/schema/email.schema"
import { sendNotificationOrderBuyCustomer } from "~/utils/ses"
import { formatCurrency } from "~/utils/common"
import dayjs from "dayjs"
import { TokenPayload } from "~/models/requests/user.requests"

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

  // lấy order body từ FE
  const { customer_info, totalAmount, note, shipping_fee, subTotal, products } = req.body as CreateOrderBodyReq
  const { user_id } = req.decode_authorization as TokenPayload
  const orderResult = await orderServices.createOrder(user_id, {
    customer_info,
    totalAmount,
    note,
    shipping_fee,
    subTotal,
    products
  })

  const insertedId = orderResult // id order

  const vnp_Params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: insertedId.toString(),
    vnp_OrderInfo: `Thanh toán đơn hàng #${insertedId}`,
    vnp_OrderType: "billpayment",
    vnp_Amount: (totalAmount * 100).toString(),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr as string,
    vnp_CreateDate: createDate
  }

  const signData = new URLSearchParams(sortObject(vnp_Params)).toString()
  const hmac = crypto.createHmac("sha512", secretKey)
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex")
  vnp_Params["vnp_SecureHash"] = signed

  vnpUrl += "?" + new URLSearchParams(vnp_Params).toString()

  res.json({ url: vnpUrl })
}

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {}
  const keys = Object.keys(obj).sort()
  keys.forEach((key) => {
    sorted[key] = obj[key]
  })
  return sorted
}

export const callBackVnpayController = async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.body
  const findOrder = await databaseServices.order.findOne({ _id: new ObjectId(orderId) })
  if (findOrder) {
    const productOrder = findOrder.products.map((item) => ({
      ...item,
      product_id: new ObjectId(item.product_id)
    }))

    // cập nhật giỏ hàng
    await Promise.all([
      databaseServices.cart.updateOne(
        {
          user_id: findOrder.user_id
        },
        {
          $pull: {
            products: {
              product_id: { $in: productOrder.map((id) => new ObjectId(id.product_id)) }
            }
          }
        }
      ), // cập nhật số lượng tồn của sản phẩm và lượt mua
      ...productOrder.map((item) => {
        databaseServices.product.updateOne(
          {
            _id: new ObjectId(item.product_id)
          },
          {
            $inc: { stock: -item.quantity, sold: item.quantity }
          }
        )
      })
    ])

    const cartUser = await databaseServices.cart.findOne({ user_id: new ObjectId(findOrder.user_id) })
    if (cartUser?.products.length === 0) {
      await databaseServices.cart.deleteOne({ user_id: new ObjectId(findOrder.user_id) })
    }

    const today = new Date()
    const formattedDate = dayjs(today).format("HH:mm DD/MM/YYYY")
    const bodyEmailSend = {
      id: findOrder._id,
      customerName: findOrder.customer_info.name,
      customerPhone: findOrder.customer_info.phone,
      shippingAddress: findOrder.customer_info.address,
      totalAmount: formatCurrency(findOrder.totalAmount),
      createdAt: formattedDate
    }

    const [sendMail] = await Promise.all([
      sendNotificationOrderBuyCustomer(findOrder.customer_info.email, bodyEmailSend),
      databaseServices.order.updateOne(
        { _id: new ObjectId(findOrder._id) },
        {
          $set: {
            status: OrderStatus.pending
          },
          $currentDate: { updated_at: true }
        }
      )
    ])
    const resendId = sendMail.data?.id
    await databaseServices.emailLog.insertOne(
      new EmailLog({
        to: findOrder.customer_info.email,
        subject: `Đặt hàng thành công - TECHZONE xác nhận đơn hàng #${findOrder._id}`,
        type: TypeEmailResend.orderConfirmation,
        status: StatusEmailResend.sent,
        resend_id: resendId as string
      })
    )

    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công"
    })
    return
  }

  res.json({
    message: "Không tìm thấy đơn hàng"
  })
  return
}
/**
 * 
Ngân hàng	NCB
Số thẻ	9704198526191432198
Tên chủ thẻ	NGUYEN VAN A
Ngày phát hành	07/15
Mật khẩu OTP	123456
 */
