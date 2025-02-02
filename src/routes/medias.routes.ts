import { Router } from "express"
import { RoleType } from "~/constant/enum"
import { uploadImageController } from "~/controllers/media.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const mediasRoute = Router()

/**
 * Description: Upload medias
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

export default mediasRoute
