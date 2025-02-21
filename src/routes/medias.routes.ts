import { Router } from "express"
import { RoleType } from "~/constant/enum"
import { uploadImageController, uploadImageUserController } from "~/controllers/media.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const mediasRoute = Router()

/**
 * Description: Upload image cho 1 sản phẩm
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: file }
 */
mediasRoute.post(
  "/upload-image",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(uploadImageController)
)

/**
 * Description: Upload avatar cho 1 user
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: file }
 */
mediasRoute.post(
  "/upload-image-user",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(uploadImageUserController)
)

export default mediasRoute
