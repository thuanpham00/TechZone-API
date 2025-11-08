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
import { envConfig } from "~/utils/config"
import { authRedisService } from "~/redis/authRedis" // ✅ ADD: Import Redis service
import { cartRedisService } from "~/redis/cartRedis" // ✅ ADD: Import Cart Redis service
import { cartSyncService } from "~/redis/cartSync" // ✅ ADD: Import Cart Sync service
import { guestCartHelper } from "~/utils/guestCart" // ✅ ADD: Import Guest Cart helper

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
  const role = user.role.toString()

  // ✅ GET IP ADDRESS và EMAIL to reset rate limit after successful login
  const ip = req.ip || req.socket.remoteAddress || "unknown"
  const email = user.email

  const findRole = await databaseServices.role.findOne({ _id: new ObjectId(role) })
  const roleName = findRole?.key as string
  const { accessToken, refreshToken, user: userInfo } = await userServices.login({ user_id, verify, roleId: role })

  // ✅ LOGIN THÀNH CÔNG → Reset login attempts (cả IP và Email)
  await authRedisService.resetLoginAttempts(ip, email)

  // ✅ STORE REFRESH TOKEN vào Redis (cache for fast verification)
  await authRedisService.storeRefreshToken(user_id, refreshToken, 100 * 24 * 60 * 60) // 100 days

  // ✅ MERGE GUEST CART (nếu có)
  let clearGuestId = false
  const guestId = req.headers["x-guest-id"] as string
  if (guestId && guestCartHelper.isGuestId(guestId)) {
    try {
      // Merge guest cart vào user cart
      await cartRedisService.mergeCart(guestId, user_id)
      // Schedule sync to MongoDB
      cartSyncService.scheduleSync(user_id)
      clearGuestId = true
      console.log(`✅ Cart merged: guest=${guestId} → user=${user_id}`)
    } catch (error) {
      console.error("❌ Cart merge error:", error)
      // Không throw error - cart merge fail không nên block login
    }
  }

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true, // chặn client javascript không thể truy cập
    // secure: true, // chỉ cho phép cookie gửi qua kết nối HTTPS
    sameSite: "strict",
    maxAge: 100 * 24 * 60 * 60 * 1000, // Đồng bộ thời gian sống cookie (100 ngày)
    path: "/"
  })

  // client gọi api xuống server và server tạo cookie trả về và lưu vào trình duyệt tự động (client phải nằm trong ds cho phép của server)

  const userContainsRole = {
    ...userInfo,
    role: roleName
  }

  res.json({
    message: UserMessage.LOGIN_IS_SUCCESS,
    result: {
      accessToken,
      userInfo: userContainsRole,
      clearGuestId // ✅ Signal frontend to clear localStorage guest ID
    }
  })
}

export const loginGoogleController = async (req: Request, res: Response) => {
  const { code } = req.query
  const { accessToken, refreshToken, newUser, verify, name } = await userServices.loginGoogle(code as string)
  const url = `${envConfig.client_redirect_callback}?access_token=${accessToken}&newUser=${newUser}&verify=${verify}&name=${name}`

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
  const refresh_token = req.cookies.refresh_token // lấy cookie từ server

  // ✅ LẤY ACCESS TOKEN từ header
  const access_token = (req.headers.authorization || "").split(" ")[1]

  // ✅ LOGOUT: Blacklist accessToken + Delete refreshToken
  await Promise.all([
    userServices.logout({ user_id, refresh_token }), // Delete refreshToken from MongoDB
    access_token ? authRedisService.blacklistAccessToken(access_token) : Promise.resolve(), // Blacklist accessToken
    authRedisService.deleteRefreshToken(user_id) // Delete refreshToken from Redis cache
  ])

  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "strict",
    path: "/"
  })
  res.json({
    message: UserMessage.LOGOUT_IS_SUCCESS
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  // lấy exp (thời gian hết hạn của Token cũ) -> tạo token mới (giữ exp của token cũ)
  const { user_id, verify, exp, role } = req.decode_refreshToken as TokenPayload
  const { refresh_token } = req.cookies

  // Note: Middleware đã check Redis cache và MongoDB
  // Nếu đến đây = token hợp lệ (cache HIT hoặc MongoDB verified)

  const { accessToken, refreshToken: refresh_token_new } = await userServices.refreshToken({
    token: refresh_token,
    user_id: user_id,
    verify: verify,
    roleId: role,
    exp: exp
  })

  // ✅ UPDATE Redis cache với refreshToken mới
  // Note: SET command tự động overwrite token cũ, không cần DEL riêng
  await authRedisService.storeRefreshToken(user_id, refresh_token_new, 100 * 24 * 60 * 60)

  res.cookie("refresh_token", refresh_token_new, {
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
  const { accessToken, refreshToken } = await userServices.verifyEmail({ user_id: user_id, roleId: role })

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
  const result = await userServices.resendEmailVerify({ user_id: user_id, roleId: role })
  res.json({
    message: result.message
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.user._id?.toString()
  const verify = req.user.verify
  const role = req.user.role.toString()
  const { email } = req.body
  const result = await userServices.forgotPassword({
    user_id: user_id as string,
    verify: verify,
    roleId: role,
    email: email
  })
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
