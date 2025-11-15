import { Router } from "express"
import {
  getListTicketBaseOnStatus,
  getTicketMessagesForAdminController,
  updateTicketController
} from "~/controllers/ticket.controllers"
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
 * Description: update ticket (pending -> assigned)
 * Path: /
 * Method: GET
 */
ticketRoute.put(
  "/status/:id",
  accessTokenValidator,
  verifyUserValidator,
  // checkRole(),
  wrapRequestHandler(updateTicketController)
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

export default ticketRoute
