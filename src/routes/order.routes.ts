import { Router } from "express"
import { getOrderController, updateStatusOrderForCustomerController } from "~/controllers/order.controllers"
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const ordersRoute = Router()

/**
 * Description: cập nhật đơn hàng dành cho khách hàng (hủy hoặc nhận)
 * Path: /:id
 * Method: Put
 */
ordersRoute.put(
  "/:id",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(updateStatusOrderForCustomerController)
)

/**
 * Description: lấy đơn hàng của 1 user
 * Path: /
 * Method: Get
 */
ordersRoute.get("/", accessTokenValidator, verifyUserValidator, wrapRequestHandler(getOrderController))

export default ordersRoute
