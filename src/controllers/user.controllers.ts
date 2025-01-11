import { Request, Response, NextFunction } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { UserMessage } from "~/constant/message"
import { RegisterReqBody } from "~/models/requests/user.requests"

export const registerController = (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  res.json({
    message: UserMessage.REGISTER_IS_SUCCESS
  })
}
