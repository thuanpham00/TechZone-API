import { config } from "dotenv"
import { TokenType, UserVerifyStatus } from "~/constant/enum"
import { signToken, verifyToken } from "~/utils/jwt"
import databaseServices from "./database.services"
import { RegisterReqBody } from "~/models/requests/user.requests"
import { ObjectId } from "mongodb"
import { User } from "~/models/schema/users.schema"
import { hashPassword } from "~/utils/scripto"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
config()

class UserServices {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        tokenType: TokenType.AccessToken
      },
      privateKey: process.env.SECRET_KEY_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRE_IN_ACCESS_TOKEN // 15 phút
      }
    })
  }

  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          verify,
          tokenType: TokenType.RefreshToken,
          exp: exp // tạo RT mới và vẫn giữ nguyên exp của RT cũ
        },
        privateKey: process.env.SECRET_KEY_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        verify,
        tokenType: TokenType.RefreshToken
      },
      privateKey: process.env.SECRET_KEY_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRE_IN_REFRESH_TOKEN // 100 ngày
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        tokenType: TokenType.EmailVerifyToken
      },
      privateKey: process.env.SECRET_KEY_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRE_IN_EMAIL_VERIFY_TOKEN // 7 ngày
      }
    })
  }

  private signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users.findOne({ email: email })
    return Boolean(result)
  }

  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({ token: refreshToken, privateKey: process.env.SECRET_KEY_REFRESH_TOKEN as string })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified // mới tạo tài khoản thì chưa xác thực
    })
    const body = {
      ...payload,
      _id: user_id,
      password: hashPassword(payload.password),
      date_of_birth: new Date(payload.date_of_birth),
      email_verify_token: emailVerifyToken,
      role: payload.role
    }
    const [, token] = await Promise.all([
      databaseServices.users.insertOne(
        payload.role
          ? new User(body)
          : new User({
              ...payload,
              _id: user_id,
              password: hashPassword(payload.password),
              date_of_birth: new Date(payload.date_of_birth),
              email_verify_token: emailVerifyToken
            })
      ),
      // tạo cặp AccessToken và RefreshToken mới
      this.signAccessTokenAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified
      })
    ])
    const [accessToken, refreshToken] = token
    const { exp, iat } = await this.decodeRefreshToken(refreshToken)

    const [user] = await Promise.all([
      databaseServices.users.findOne(
        { _id: user_id },
        { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
      ),
      databaseServices.refreshToken.insertOne(
        new RefreshToken({ token: refreshToken, iat: iat, exp: exp, user_id: user_id })
      )
    ])

    return {
      accessToken,
      refreshToken,
      user
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({ user_id, verify }) // tạo cặp AccessToken và RefreshToken mới
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    const [user] = await Promise.all([
      databaseServices.users.findOne(
        { _id: new ObjectId(user_id) },
        { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
      ),
      databaseServices.refreshToken.insertOne(
        new RefreshToken({
          token: refreshToken,
          iat,
          exp,
          user_id: new ObjectId(user_id)
        })
      )
    ])

    return {
      accessToken,
      refreshToken,
      user
    }
  }
}

export const userServices = new UserServices()
