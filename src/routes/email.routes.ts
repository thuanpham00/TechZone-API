import { Router } from "express"
import { getDomainListResendController, getEmailResendListController } from "~/controllers/email.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const emailRoute = Router()

/**
 * Description: Get list email sent from resend
 * Path: /
 * Method: GET
 */
emailRoute.get(
  "/",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getEmailResendListController)
)

/**
 * Description: Get list domain resend
 * Path: /
 * Method: GET
 */
emailRoute.get(
  "/domain",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getDomainListResendController)
)

export default emailRoute
