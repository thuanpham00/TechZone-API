import { Router } from "express"
import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  loginController,
  loginGoogleController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyPasswordController
} from "~/controllers/user.controllers"
import { filterMiddleware } from "~/middlewares/common.middlewares"
import {
  accessTokenValidator,
  changePasswordValidator,
  checkUserLogin,
  emailVerifyValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyForgotPasswordValidator,
  verifyUserValidator
} from "~/middlewares/user.middlewares"
import { updateMeReqBody } from "~/models/requests/user.requests"
import { wrapRequestHandler } from "~/utils/handlers"

const userRoute = Router()

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { email: string, password: string, confirm_password: string, name: string, role?: string }
 */
userRoute.post("/register", registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string}
 */
userRoute.post("/login", loginValidator, checkUserLogin("customer"), wrapRequestHandler(loginController))

/**
 * Description: Login google user
 * Path: /oauth/google
 * Method: POST
 */
userRoute.get("/oauth/google", wrapRequestHandler(loginGoogleController))

/**
 * Description: Logout user
 * Path: /login
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
userRoute.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Refresh token user
 * Path: /refresh-token
 * Method: POST
 */
userRoute.post("/refresh-token", refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * Description: Verify email user
 * Path: /verify-email
 * Method: POST
 * Body: { email-verify-token: string }
 */
userRoute.post("/verify-email", emailVerifyValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description: Resend email_verify_token user
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 */
userRoute.post("/resend-email-verify", accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

/**
 * Description: Forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
userRoute.post("/forgot-password", forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify forgot password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */
userRoute.post("/verify-forgot-password", verifyForgotPasswordValidator, wrapRequestHandler(verifyPasswordController))

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: { forgot_password_token: string, password: string, confirm_password: string }
 */
userRoute.post("/reset-password", resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: Change password
 * Path: /change-password
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { old_password: string, password: string, confirm_password: string }
 */
userRoute.post(
  "/change-password",
  accessTokenValidator,
  verifyUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

/**
 * Description: get me
 * Path: /me
 * Method: GET
 * Headers: { Authorization: Bearer <access_token> }
 */
userRoute.get("/me", accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: update my profile
 * Path: /me
 * Method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 * Body: updateMeReqBody
 */
userRoute.put(
  "/me",
  accessTokenValidator,
  verifyUserValidator,
  updateMeValidator,
  filterMiddleware<updateMeReqBody>(["date_of_birth", "name", "numberPhone", "avatar"]),
  wrapRequestHandler(updateMeController)
)

export default userRoute

/**
 *  accessTokenValidator,
 *  verifyUserValidator
 * 2 middlewares dành cho kiểm tra đã đăng nhập và xác thực tài khoản chưa?
 */
