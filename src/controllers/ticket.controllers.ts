import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { TicketStatus } from "~/constant/enum"
import { ConversationMessage } from "~/constant/message"
import ticketServices from "~/services/ticket.services"

export const getListTicketBaseOnStatus = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      status: TicketStatus
    }
  >,
  res: Response
) => {
  const { status } = req.query

  const result = await ticketServices.getListTicketBaseOnStatus(status)
  res.json({
    message: ConversationMessage.GET_LIST_TICKET_IS_SUCCESS,
    data: result
  })
}

export const updateTicketController = async (req: Request, res: Response) => {
  const { id: idTicket } = req.params
  const { status } = req.body
  const { user_id: userIdAdminAssigned } = req.decode_authorization
  await ticketServices.updateStatusAssignTicket(idTicket, status, userIdAdminAssigned)
  res.json({
    message: ConversationMessage.UPDATE_STATUS_TICKET_IS_SUCCESS
  })
}

export const getTicketMessagesForAdminController = async (req: Request, res: Response) => {
  const ticketId = req.params.id
  const { limit, page } = req.query
  const { conversations, total } = await ticketServices.getTicketMessagesAdminService(
    ticketId,
    Number(limit),
    Number(page)
  )

  res.json({
    result: {
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(total / Number(limit)),
      conversation: conversations
    },
    message: ConversationMessage.GET_CONVERSATION_IS_SUCCESS
  })
}

export const getTicketMessagesForClientController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization
  const { limit, page } = req.query
  const { conversations, total, ticket } = await ticketServices.getTicketMessagesClientService(
    user_id,
    Number(limit),
    Number(page)
  )

  res.json({
    result: {
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(total / Number(limit)),
      conversation: conversations,
      ticket
    },
    message: ConversationMessage.GET_CONVERSATION_IS_SUCCESS
  })
}
