import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { EmailMessage } from "~/constant/message"
import conversationServices from "~/services/conversation.services"
import { TokenPayload } from "~/models/requests/user.requests"

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
    message: EmailMessage.GET_LIST_EMAIL_LOG_IS_SUCCESS,
    result: {
      result,
      total
    }
  })
}
