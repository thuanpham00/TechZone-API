import { GenderType, RoleType, TokenType, UserVerifyStatus } from "~/constant/enum"
import { JwtPayload } from "jsonwebtoken"

export type RegisterReqBody = {
  email: string
  password: string
  confirm_password: string
  name: string
  date_of_birth: string
  sex: GenderType
  role?: RoleType
}

export type updateMeReqBody = {
  name?: string
  date_of_birth?: string
  sex?: GenderType
  numberPhone?: string
}

export type LoginReqBody = {
  email: string
  password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  tokenType: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export type LogoutReqBody = {
  refresh_token: string
}

export type EmailVerifyTokenReqBody = {
  email_verify_token: string
}

export type ForgotPasswordTokenReqBody = {
  forgot_password_token: string
}

export interface ResetPasswordReqBody extends ForgotPasswordTokenReqBody {
  password: string
  confirm_password: string
}
