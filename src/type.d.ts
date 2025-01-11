import { User } from "./models/schema/users.schema"

declare global {
  namespace Express {
    export interface Request {
      user: User
    }
  }
}
