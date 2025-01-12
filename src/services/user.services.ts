import { config } from "dotenv"
import { TokenType, UserVerifyStatus } from "~/constant/enum"
import { signToken, verifyToken } from "~/utils/jwt"
import databaseServices from "./database.services"
import { RegisterReqBody } from "~/models/requests/user.requests"
import { ObjectId } from "mongodb"
import { User } from "~/models/schema/users.schema"
import { hashPassword } from "~/utils/scripto"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
import { UserMessage } from "~/constant/message"
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

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        tokenType: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.SECRET_KEY_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.EXPIRE_IN_FORGOT_PASSWORD_TOKEN // 7 ngày
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
        verify: UserVerifyStatus.Unverified // mới tạo tài khoản thì chưa xác thực
      })
    ])
    const [accessToken, refreshToken] = token
    const { exp, iat } = await this.decodeRefreshToken(refreshToken)

    const [user] = await Promise.all([
      databaseServices.users.findOne(
        { _id: user_id },
        { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
      ),
      // thêm RefreshToken mới vào DB
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
    // tạo cặp AccessToken và RefreshToken mới
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({ user_id, verify })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    const [user] = await Promise.all([
      databaseServices.users.findOne(
        { _id: new ObjectId(user_id) },
        { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
      ),
      // thêm RefreshToken mới vào DB
      databaseServices.refreshToken.insertOne(
        new RefreshToken({
          token: refreshToken,
          iat: iat,
          exp: exp,
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

  async logout({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    await databaseServices.refreshToken.deleteOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    return {
      message: UserMessage.LOGOUT_IS_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      // tạo cặp AccessToken và RefreshToken mới
      this.signAccessTokenAndRefreshToken({
        user_id: user_id,
        verify: UserVerifyStatus.Verified
      }),
      databaseServices.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: "",
            verify: UserVerifyStatus.Verified
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    // tạo cặp AccessToken và RefreshToken mới
    const [accessToken, refreshToken] = token
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    // thêm RefreshToken mới vào DB
    await databaseServices.refreshToken.insertOne(
      new RefreshToken({
        token: refreshToken,
        iat: iat,
        exp: exp,
        user_id: new ObjectId(user_id)
      })
    )

    return {
      accessToken,
      refreshToken
    }
  }

  async resendEmailVerify(user_id: string) {
    const emailVerifyToken = await this.signEmailVerifyToken({ user_id: user_id, verify: UserVerifyStatus.Unverified })
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token: emailVerifyToken
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: UserMessage.RESEND_VERIFY_EMAIL_IS_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgotPasswordToken = await this.signForgotPasswordToken({ user_id: user_id, verify: verify })
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: forgotPasswordToken
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: UserMessage.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ""
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: UserMessage.RESET_PASSWORD_IS_SUCCESS
    }
  }
}

export const userServices = new UserServices()

// chỉ có register, login ra tạo cặp AT và RT mới và lưu RT xuống DB
