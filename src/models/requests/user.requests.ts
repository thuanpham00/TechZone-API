import { TokenType, UserVerifyStatus } from "~/constant/enum"
import { JwtPayload } from "jsonwebtoken"

export type RegisterReqBody = {
  email: string
  password: string
  confirm_password: string
  name: string
  phone: string
  role: string
}

export type updateMeReqBody = {
  name?: string
  date_of_birth?: string
  numberPhone?: string
  avatar?: string
  employeeInfo?: {
    contract_type?: string
    department?: string
    status?: string
    hire_date?: string
    salary?: number
  }
}

export type LoginReqBody = {
  email: string
  password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  tokenType: TokenType
  verify: UserVerifyStatus
  role: string
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
