"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const common_middlewares_1 = require("../middlewares/common.middlewares");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const userRoute = (0, express_1.Router)();
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { email: string, password: string, confirm_password: string, name: string, role?: string }
 */
userRoute.post("/register", user_middlewares_1.registerValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.registerController));
/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string}
 */
userRoute.post("/login", user_middlewares_1.loginValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.loginController));
/**
 * Description: Login google user
 * Path: /oauth/google
 * Method: POST
 */
userRoute.get("/oauth/google", (0, handlers_1.wrapRequestHandler)(user_controllers_1.loginGoogleController));
/**
 * Description: Logout user
 * Path: /login
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
userRoute.post("/logout", user_middlewares_1.accessTokenValidator, user_middlewares_1.refreshTokenValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.logoutController));
/**
 * Description: Refresh token user
 * Path: /refresh-token
 * Method: POST
 */
userRoute.post("/refresh-token", user_middlewares_1.refreshTokenValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.refreshTokenController));
/**
 * Description: Verify email user
 * Path: /verify-email
 * Method: POST
 * Body: { email-verify-token: string }
 */
userRoute.post("/verify-email", user_middlewares_1.emailVerifyValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.verifyEmailController));
/**
 * Description: Resend email_verify_token user
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 */
userRoute.post("/resend-email-verify", user_middlewares_1.accessTokenValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.resendEmailVerifyController));
/**
 * Description: Forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
userRoute.post("/forgot-password", user_middlewares_1.forgotPasswordValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.forgotPasswordController));
/**
 * Description: Verify forgot password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */
userRoute.post("/verify-forgot-password", user_middlewares_1.verifyForgotPasswordValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.verifyPasswordController));
/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: { forgot_password_token: string, password: string, confirm_password: string }
 */
userRoute.post("/reset-password", user_middlewares_1.resetPasswordValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.resetPasswordController));
/**
 * Description: Change password
 * Path: /change-password
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { old_password: string, password: string, confirm_password: string }
 */
userRoute.post("/change-password", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, user_middlewares_1.changePasswordValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.changePasswordController));
/**
 * Description: get me
 * Path: /me
 * Method: GET
 * Headers: { Authorization: Bearer <access_token> }
 */
userRoute.get("/me", user_middlewares_1.accessTokenValidator, (0, handlers_1.wrapRequestHandler)(user_controllers_1.getMeController));
/**
 * Description: update my profile
 * Path: /me
 * Method: PATCH
 * Header: {Authorization: Bearer <access_token>}
 * Body: updateMeReqBody
 */
userRoute.patch("/me", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, user_middlewares_1.updateMeValidator, (0, common_middlewares_1.filterMiddleware)(["date_of_birth", "name", "numberPhone", "avatar"]), (0, handlers_1.wrapRequestHandler)(user_controllers_1.updateMeController));
exports.default = userRoute;
/**
 *  accessTokenValidator,
 *  verifyUserValidator
 * 2 middlewares dành cho kiểm tra đã đăng nhập và xác thực tài khoản chưa?
 */
