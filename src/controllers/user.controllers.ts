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
  TokenPayload,
  updateMeReqBody
} from "~/models/requests/user.requests"
import { User } from "~/models/schema/users.schema"
import databaseServices from "~/services/database.services"
import { userServices } from "~/services/user.services"

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { accessToken, refreshToken, user } = await userServices.register(req.body)

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    // secure: true, // chỉ cho phép cookie gửi qua kết nối HTTPS
    sameSite: "strict",
    maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
    path: "/"
  })

  res.json({
    message: UserMessage.REGISTER_IS_SUCCESS,
    result: {
      accessToken,
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
  const role = user.role
  const { accessToken, refreshToken, user: userInfo } = await userServices.login({ user_id, verify, role })

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    // secure: true, // chỉ cho phép cookie gửi qua kết nối HTTPS
    sameSite: "strict",
    maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
    path: "/"
  })

  res.json({
    message: UserMessage.LOGIN_IS_SUCCESS,
    result: {
      accessToken,
      userInfo
    }
  })
}

export const loginGoogleController = async (req: Request, res: Response) => {
  const { code } = req.query
  const { accessToken, refreshToken, newUser, verify, name } = await userServices.loginGoogle(code as string)
  const url = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${accessToken}&newUser=${newUser}&verify=${verify}&name=${name}`

  // RT luu cookie tại backEnd
  // AT luu localStorage tại frontEnd
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true, // chỉ cho phép cookie gửi qua kết nối HTTPS
    sameSite: "strict",
    maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
    path: "/"
  })

  res.redirect(url)
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

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id, verify, exp, role } = req.decode_refreshToken as TokenPayload
  const { refresh_token } = req.body
  const { accessToken, refreshToken } = await userServices.refreshToken({
    token: refresh_token,
    user_id: user_id,
    verify: verify,
    role: role,
    exp: exp
  })

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    // secure: true,
    sameSite: "strict",
    maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
    path: "/"
  })

  res.json({
    message: UserMessage.REFRESH_TOKEN_IS_SUCCESS,
    result: {
      accessToken
    }
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, EmailVerifyTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id, role } = req.decode_emailVerifyToken as TokenPayload
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
  const { accessToken, refreshToken } = await userServices.verifyEmail({ user_id: user_id, role: role })

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    // secure: true , // chỉ cho phép cookie gửi qua kết nối HTTPS
    sameSite: "strict",
    maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
    path: "/"
  })

  res.json({
    message: UserMessage.VERIFY_EMAIL_IS_SUCCESS,
    result: {
      accessToken
    }
  })
}

export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id, role } = req.decode_authorization as TokenPayload
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
  const result = await userServices.resendEmailVerify({ user_id: user_id, role: role })
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
  const role = req.user.role
  const result = await userServices.forgotPassword({ user_id: user_id as string, verify: verify, role: role })
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

export const updateMeController = async (
  req: Request<ParamsDictionary, any, updateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await userServices.updateMe({ user_id: user_id, body: req.body })
  res.json({
    message: UserMessage.UPDATE_PROFILE_IS_SUCCESS,
    result: result
  })
}
