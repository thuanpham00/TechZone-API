import { Request, Response, NextFunction } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { ObjectId } from "mongodb"
import { UserMessage } from "~/constant/message"
import { LoginReqBody, RegisterReqBody } from "~/models/requests/user.requests"
import { userServices } from "~/services/user.services"

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { accessToken, refreshToken, user } = await userServices.register(req.body)
  res.json({
    message: UserMessage.REGISTER_IS_SUCCESS,
    result: {
      accessToken,
      refreshToken,
      user
    }
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user } = req as Request
  const user_id = (user._id as ObjectId)?.toString()
  const verify = user.verify
  const { accessToken, refreshToken, user: userInfo } = await userServices.login({ user_id, verify })
  res.json({
    message: UserMessage.LOGIN_IS_SUCCESS,
    result: {
      accessToken,
      refreshToken,
      userInfo
    }
  })
}
