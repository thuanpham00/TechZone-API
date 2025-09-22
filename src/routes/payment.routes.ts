import { Router } from "express"
import { callBackVnpayController, createOrderCODController, createPaymentController } from "~/controllers/payment.controllers"
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const paymentRoute = Router()

/**
 * Description: Thanh toán đơn hàng
 * Path: /
 * Method: POST
 */
paymentRoute.post("/", accessTokenValidator, verifyUserValidator, wrapRequestHandler(createPaymentController))

/**
 * Description: Cập nhật Thanh toán đơn hàng
 * Path: /vnpay-callback
 * Method: POST
 */
paymentRoute.post(
  "/vnpay-callback",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(callBackVnpayController)
)

/**
 * Description: Cập nhật Thanh toán đơn hàng
 * Path: /vnpay-callback
 * Method: POST
 */
paymentRoute.post(
  "/create-order-cod",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(createOrderCODController)
)

export default paymentRoute
