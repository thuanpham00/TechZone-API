import { Router } from "express"
import { RoleType } from "~/constant/enum"
import { getConversationsController, getListUserTypeController } from "~/controllers/conversation.controllers"
import { getEmailResendListController } from "~/controllers/email.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const conversationRoute = Router()

/**
 * Description: Get list user type
 * Path: /list-user-type
 * Method: GET
 */
conversationRoute.get(
  "/list-user-type",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getListUserTypeController)
)

/**
 * Description: Get list email sent from resend
 * Path: /
 * Method: GET
 */
conversationRoute.get(
  "/receiver/:receiverId",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getConversationsController)
)

export default conversationRoute
