import { Request, Response } from "express"
import voucherServices from "~/services/voucherServices"

export const getAvailableVouchers = async (req: Request, res: Response) => {
  const orderValue = Number(req.query.order_value) || 0
  const vouchers = await voucherServices.getAvailableVouchers(orderValue)

  res.json({
    message: "Get available vouchers successfully",
    data: vouchers
  })
}
