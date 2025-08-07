import { Router } from "express"
import { RoleType } from "~/constant/enum"
import { getDomainListResendController, getEmailResendListController } from "~/controllers/email.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const emailRouter = Router()

/**
 * Description: Get list email sent from resend
 * Path: /
 * Method: GET
 */
emailRouter.get(
  "/",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getEmailResendListController)
)

/**
 * Description: Get list domain resend
 * Path: /
 * Method: GET
 */
emailRouter.get(
  "/domain",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getDomainListResendController)
)

export default emailRouter
