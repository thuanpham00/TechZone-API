import { Router } from "express"
import {
  uploadBannerProductController,
  uploadImageListProductController,
  uploadImageUserController
} from "~/controllers/media.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const mediasRoute = Router()

/**
 * Description: Upload list image product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: file[]; nameCategory: string; idProduct: string }
 */
mediasRoute.post(
  "/upload-image-product",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(uploadImageListProductController)
)

/**
 * Description: Upload banner product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: file; nameCategory: string; idProduct: string }
 */
mediasRoute.post(
  "/upload-banner-product",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(uploadBannerProductController)
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
  wrapRequestHandler(uploadImageUserController)
)

export default mediasRoute
