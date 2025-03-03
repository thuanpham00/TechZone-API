import { Router } from "express"
import { RoleType } from "~/constant/enum"
import { createProductController } from "~/controllers/product.controllers"
import { createProductValidator } from "~/middlewares/product.middlewares"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const productRoute = Router()

/**
 * Description: Create product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: CreateProductBodyReq }
 */
productRoute.post(
  "/",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  createProductValidator,
  wrapRequestHandler(createProductController)
)

export default productRoute
