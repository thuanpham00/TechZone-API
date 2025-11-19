import { Router } from "express"
import { getListTicketBaseOnStatus, getTicketImagesForAdminController, getTicketMessagesForAdminController } from "~/controllers/ticket.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const ticketRoute = Router()

/**
 * Description: Get list ticket
 * Path: /
 * Method: GET
 */
ticketRoute.get(
  "",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getListTicketBaseOnStatus)
)

/**
 * GET /api/tickets/:id/messages
 * Lấy tất cả tin nhắn của một ticket (admin)
 */
ticketRoute.get(
  "/:id/messages",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getTicketMessagesForAdminController)
)

/**
 * GET /api/tickets/:id/messages
 * Lấy tất cả tin nhắn của một ticket (admin)
 */
ticketRoute.get(
  "/:id/images",
  accessTokenValidator,
  verifyUserValidator,
  // checkRole(),
  wrapRequestHandler(getTicketImagesForAdminController)
)

export default ticketRoute
