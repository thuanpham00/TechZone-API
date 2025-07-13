import { Router } from "express"
import { createPaymentController } from "~/controllers/payment.controllers"
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const paymentRoute = Router()

/**
 * Description: Thanh toán đơn hàng
 * Path: /
 * Method: POST
 */
paymentRoute.post("/", accessTokenValidator, verifyUserValidator, wrapRequestHandler(createPaymentController))

export default paymentRoute
