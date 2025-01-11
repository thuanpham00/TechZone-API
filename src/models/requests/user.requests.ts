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

export type LoginReqBody = {
  email: string
  password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string,
  tokenType: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}