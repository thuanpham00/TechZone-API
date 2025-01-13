import { Request, Response, NextFunction } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constant/enum"
import httpStatus from "~/constant/httpStatus"
import { UserMessage } from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import {
  EmailVerifyTokenReqBody,
  ForgotPasswordTokenReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload
} from "~/models/requests/user.requests"
import databaseServices from "~/services/database.services"
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

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { refresh_token } = req.body
  const result = await userServices.logout({ user_id, refresh_token })
  res.json({
    message: result.message
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, EmailVerifyTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_emailVerifyToken as TokenPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_IS_VERIFIED,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const { accessToken, refreshToken } = await userServices.verifyEmail(user_id)
  res.json({
    message: UserMessage.VERIFY_EMAIL_IS_SUCCESS,
    result: {
      accessToken,
      refreshToken
    }
  })
}

export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_IS_VERIFIED,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const result = await userServices.resendEmailVerify(user_id)
  res.json({
    message: result.message
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.user._id?.toString()
  const verify = req.user.verify
  const result = await userServices.forgotPassword({ user_id: user_id as string, verify: verify })
  res.json({
    message: result.message
  })
}

export const verifyPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  res.json({
    message: UserMessage.FORGOT_PASSWORD_TOKEN_IS_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_forgotPasswordToken as TokenPayload
  const { password } = req.body
  const result = await userServices.resetPassword({ user_id: user_id, password: password })
  res.json({
    message: result.message
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { password } = req.body
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await userServices.changePassword({ user_id: user_id, password: password })
  res.json({
    message: result.message
  })
}

export const getMeController = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await userServices.getMe(user_id)
  res.json({
    result
  })
}
