import { Router } from "express"
import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyEmailController,
  verifyPasswordController
} from "~/controllers/user.controllers"
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordValidator,
  verifyUserValidator
} from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const userRoute = Router()

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, data_of_birth: ISO8601, sex: string, role?: string }
 */
userRoute.post("/register", registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string}
 */
userRoute.post("/login", loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Logout user
 * Path: /login
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
userRoute.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

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
userRoute.get(
  "/me",
  accessTokenValidator,
  wrapRequestHandler(getMeController)
)

export default userRoute
