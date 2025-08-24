import { Router } from "express"
import { getConversationsController, getListUserTypeController } from "~/controllers/conversation.controllers"
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
  checkRole(),
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
