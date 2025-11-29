import { Router } from "express"
import {
  addReviewToOrderController,
  getOrderController,
  getOrderTopReviewController,
  updateStatusOrderForCustomerController
} from "~/controllers/order.controllers"
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
 * Description: đánh giá đơn hàng dành cho khách hàng (nhận hàng)
 * Path: /:id
 * Method: Put
 */
ordersRoute.post(
  "/:id/reviews",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(addReviewToOrderController)
)

/**
 * Description: lấy đơn hàng của 1 user
 * Path: /
 * Method: Get
 */
ordersRoute.get("/", accessTokenValidator, verifyUserValidator, wrapRequestHandler(getOrderController))

/**
 * Description: lấy top 10 đánh giá mới nhất và 4 sao trở lên
 * Path: /:id
 * Method: Put
 */
ordersRoute.get("/top-10-reviews", wrapRequestHandler(getOrderTopReviewController))

export default ordersRoute
