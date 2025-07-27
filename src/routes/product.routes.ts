import { Router } from "express"
import {
  getProductDetailController,
  getProductRelatedController,
  getSearchProductController
} from "~/controllers/product.controllers"
import { checkIdValidator } from "~/middlewares/admin.middlewares"
import { getProductDetailValidator, getProductRelatedValidator } from "~/middlewares/product.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const productRoute = Router()

/**
 * Trong Express, các route được xử lý theo thứ tự khai báo. Route cụ thể nên đặt trước, các route động như /:id nên đặt sau để tránh conflict.
 */

/**
 * Description: Get search product
 * Path: /search
 * Method: GET
 */
productRoute.get("/", wrapRequestHandler(getSearchProductController))

/**
 * Description: Get product related
 * Path: /related
 * Method: GET
 */
productRoute.get("/related", getProductRelatedValidator, wrapRequestHandler(getProductRelatedController))

/**
 * Description: get product detail
 * Path: /:id
 * Method: GET
 * Params: { id: string }
 */
productRoute.get("/:id", checkIdValidator, getProductDetailValidator, wrapRequestHandler(getProductDetailController))

export default productRoute
