import { config } from "dotenv"
import { RoleType, TokenType, UserVerifyStatus } from "~/constant/enum"
import { signToken, verifyToken } from "~/utils/jwt"
import databaseServices from "./database.services"
import { RegisterReqBody, updateMeReqBody } from "~/models/requests/user.requests"
import { ObjectId } from "mongodb"
import { User } from "~/models/schema/users.schema"
import { hashPassword } from "~/utils/scripto"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
import { UserMessage } from "~/constant/message"
import axios from "axios"
import { ErrorWithStatus } from "~/models/errors"
import httpStatus from "~/constant/httpStatus"
import { sendForgotPasswordToken, sendVerifyRegisterEmail } from "~/utils/ses"
import { envConfig } from "~/utils/config"
config()

class UserServices {
  private signAccessToken({ user_id, verify, role }: { user_id: string; verify: UserVerifyStatus; role: RoleType }) {
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        tokenType: TokenType.AccessToken
      },
      privateKey: envConfig.secret_key_access_token,
      options: {
        expiresIn: envConfig.expire_in_access_token // 15 phút
      }
    })
  }

  private signRefreshToken({
    user_id,
    verify,
    role,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: RoleType
    exp?: number
  }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          verify,
          role,
          tokenType: TokenType.RefreshToken,
          exp: exp // tạo RT mới và vẫn giữ nguyên exp của RT cũ
        },
        privateKey: envConfig.secret_key_refresh_token
      })
    }
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        tokenType: TokenType.RefreshToken
      },
      privateKey: envConfig.secret_key_refresh_token,
      options: {
        expiresIn: envConfig.expire_in_refresh_token // 100 ngày
      }
    })
  }

  signEmailVerifyToken({ user_id, verify, role }: { user_id: string; verify: UserVerifyStatus; role: RoleType }) {
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        tokenType: TokenType.EmailVerifyToken
      },
      privateKey: envConfig.secret_key_email_verify_token,
      options: {
        expiresIn: envConfig.expire_in_email_verify_token // 7 ngày
      }
    })
  }

  private signForgotPasswordToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: RoleType
  }) {
    return signToken({
      payload: {
        user_id,
        verify,
        role,
        tokenType: TokenType.ForgotPasswordToken
      },
      privateKey: envConfig.secret_key_forgot_password_token,
      options: {
        expiresIn: envConfig.expire_in_forgot_password_token // 7 ngày
      }
    })
  }

  signAccessTokenAndRefreshToken({
    user_id,
    verify,
    role
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: RoleType
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify, role }),
      this.signRefreshToken({ user_id, verify, role })
    ])
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users.findOne({ email: email })
    return Boolean(result)
  }

  decodeRefreshToken(refreshToken: string) {
    return verifyToken({ token: refreshToken, privateKey: envConfig.secret_key_refresh_token })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
      role: payload.role ? payload.role : RoleType.USER
    })
    const body = {
      ...payload,
      _id: user_id,
      password: hashPassword(payload.password),
      email_verify_token: emailVerifyToken,
      numberPhone: payload.phone,
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
              email_verify_token: emailVerifyToken,
              numberPhone: payload.phone
            })
      ),
      // tạo cặp AccessToken và RefreshToken mới
      this.signAccessTokenAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
        role: payload.role ? payload.role : RoleType.USER
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

    await sendVerifyRegisterEmail(payload.email, emailVerifyToken)

    return {
      accessToken,
      refreshToken,
      user
    }
  }

  async login({ user_id, verify, role }: { user_id: string; verify: UserVerifyStatus; role: RoleType }) {
    // tạo cặp AccessToken và RefreshToken mới
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id,
      verify: verify,
      role: role
    })
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

  private async getGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.google_client_id,
      client_secret: envConfig.google_client_secret,
      redirect_uri: envConfig.google_redirect_uri,
      grant_type: "authorization_code"
    }

    const { data } = await axios.post("https://oauth2.googleapis.com/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleInfo({ id_token, access_token }: { id_token: string; access_token: string }) {
    const { data } = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
      params: {
        access_token,
        alt: "json"
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
    }
  }

  async loginGoogle(code: string) {
    const { access_token, id_token } = await this.getGoogleToken(code)
    const userInfo = await this.getGoogleInfo({ id_token, access_token })
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: UserMessage.EMAIL_NOT_VERIFY,
        status: httpStatus.UNAUTHORIZED
      })
    }
    const findEmail = await databaseServices.users.findOne({ email: userInfo.email })
    // đã tồn tại email trong db thì đăng nhập vào
    // còn chưa tồn tại thì tạo mới
    if (findEmail) {
      const user_id = findEmail._id
      const verify_user = findEmail.verify
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id: user_id.toString(),
        verify: verify_user,
        role: RoleType.USER
      })

      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await databaseServices.refreshToken.insertOne(
        new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat: iat, exp: exp })
      )

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        name: userInfo.name,
        newUser: 0,
        verify: userInfo.verified_email
      }
    } else {
      // trong method register có xử lý sign token và lưu vào db
      const random = Math.random().toString(36).substring(2, 15)
      const { accessToken: accessToken_1, refreshToken: refreshToken_1 } = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        password: random,
        confirm_password: random,
        phone: ""
      })
      // vẫn tạo mới email-verify-token - cần thêm bước verify-email
      return {
        accessToken: accessToken_1,
        refreshToken: refreshToken_1,
        name: userInfo.name,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
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

  async refreshToken({
    token,
    user_id,
    verify,
    exp,
    role
  }: {
    token: string
    user_id: string
    verify: UserVerifyStatus
    exp: number
    role: RoleType
  }) {
    const [accessTokenNew, refreshTokenNew] = await Promise.all([
      this.signAccessToken({ user_id: user_id, verify: verify, role: role }),
      this.signRefreshToken({ user_id: user_id, verify: verify, role: role, exp: exp }),
      databaseServices.refreshToken.deleteOne({ token: token })
    ])

    const decodeRefreshToken = await this.decodeRefreshToken(refreshTokenNew)
    await databaseServices.refreshToken.insertOne(
      new RefreshToken({
        token: refreshTokenNew,
        user_id: new ObjectId(user_id),
        exp: decodeRefreshToken.exp, // vẫn giữ exp của RT cũ // time hết hạn
        iat: decodeRefreshToken.iat // vẫn giữ iat của RT cũ // time tạo mới
      })
    )

    return {
      accessToken: accessTokenNew,
      refreshToken: refreshTokenNew
    }
  }

  async verifyEmail({ user_id, role }: { user_id: string; role: RoleType }) {
    const [token] = await Promise.all([
      // tạo cặp AccessToken và RefreshToken mới
      this.signAccessTokenAndRefreshToken({
        user_id: user_id,
        verify: UserVerifyStatus.Verified,
        role: role
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

  async resendEmailVerify({ user_id, role }: { user_id: string; role: RoleType }) {
    const emailVerifyToken = await this.signEmailVerifyToken({
      user_id: user_id,
      verify: UserVerifyStatus.Unverified,
      role: role
    })
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

  async forgotPassword({
    user_id,
    verify,
    role,
    email
  }: {
    user_id: string
    verify: UserVerifyStatus
    role: RoleType
    email: string
  }) {
    const forgotPasswordToken = await this.signForgotPasswordToken({
      user_id: user_id,
      verify: verify,
      role
    })
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
    await sendForgotPasswordToken(email, forgotPasswordToken)
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

  async changePassword({ user_id, password }: { user_id: string; password: string }) {
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: UserMessage.CHANGE_PASSWORD_IS_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateMe({ user_id, body }: { user_id: string; body: updateMeReqBody }) {
    const payload = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : { ...body }
    const user = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: { ...(payload as updateMeReqBody & { date_of_birth?: Date }) },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: "after", // cập nhật postman liền
        projection: {
          forgot_password_token: 0,
          email_verify_token: 0,
          password: 0
        }
      }
    )
    return user
  }
}

export const userServices = new UserServices()
