import { Router } from "express"
import { createOrderController, getOrderController } from "~/controllers/order.controllers"
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const ordersRoute = Router()

/**
 * Description: Tạo đơn hàng
 * Path: /
 * Method: POST
 */
ordersRoute.post("/", accessTokenValidator, verifyUserValidator, wrapRequestHandler(createOrderController))

/**
 * Description: lấy đơn hàng của 1 user
 * Path: /
 * Method: POST
 */
ordersRoute.get("/", accessTokenValidator, verifyUserValidator, wrapRequestHandler(getOrderController))

export default ordersRoute
