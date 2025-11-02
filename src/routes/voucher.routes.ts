import { Router } from "express"
import { getAvailableVouchers } from "~/controllers/voucher.controllers"
import { wrapRequestHandler } from "~/utils/handlers"

const voucherRoute = Router()

/**
 * Description: get bộ lọc theo danh mục
 * Path: /available
 * Method: GET
 */
voucherRoute.get("/available", wrapRequestHandler(getAvailableVouchers))

export default voucherRoute
