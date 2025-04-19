import { TokenPayload } from "./models/requests/user.requests"
import { User } from "./models/schema/users.schema"

declare global {
  namespace Express {
    export interface Request {
      user: User
      decode_authorization: TokenPayload
      decode_refreshToken: TokenPayload
      decode_emailVerifyToken: TokenPayload
      decode_forgotPasswordToken: TokenPayload
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    files?: Files
  }
}
