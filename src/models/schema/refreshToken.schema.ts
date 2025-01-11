import { ObjectId } from "mongodb"

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  iat: number
  exp: number
  created_at?: Date
}

export class RefreshToken {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  iat: Date
  exp: Date
  created_at: Date
  constructor({ _id, token, user_id, iat, exp, created_at }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.user_id = user_id
    this.created_at = created_at || new Date()
    this.iat = new Date(iat * 1000)
    this.exp = new Date(exp * 1000)
  }
}
