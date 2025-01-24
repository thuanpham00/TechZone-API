import { Router } from "express"
import { RoleType } from "~/constant/enum"
import { createProductController } from "~/controllers/product.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const productRoute = Router()

/**
 * Description: Create product
 * Path: /
 * Method: POST
 * Body: { body:  }
 */
productRoute.post(
  "/",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(createProductController)
)

export default productRoute
