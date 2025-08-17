import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { ConversationMessage, EmailMessage } from "~/constant/message"
import conversationServices from "~/services/conversation.services"
import { TokenPayload } from "~/models/requests/user.requests"
import { GetConversationParams } from "~/models/requests/conversation.requests"

export const getListUserTypeController = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      type_user: string
    }
  >,
  res: Response
) => {
  const { type_user } = req.query
  const { user_id } = req.decode_authorization as TokenPayload
  const { result, total } = await conversationServices.getUserListType(user_id, type_user)

  res.json({
    message: ConversationMessage.GET_LIST_USER_TYPE_IS_SUCCESS,
    result: {
      result,
      total
    }
  })
}

export const getConversationsController = async (req: Request<GetConversationParams>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { receiverId } = req.params
  const { limit, page } = req.query
  const result = await conversationServices.getConversationByReceiver({
    senderId: user_id,
    receiverId: receiverId,
    limit: Number(limit),
    page: Number(page)
  })
  res.json({
    result: {
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(result.total / Number(limit)),
      conversation: result.conversations
    },
    message: ConversationMessage.GET_CONVERSATION_IS_SUCCESS
  })
}
