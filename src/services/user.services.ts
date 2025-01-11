import { config } from "dotenv"
import { TokenType, UserVerifyStatus } from "~/constant/enum"
import { signToken } from "~/utils/jwt"
import databaseServices from "./database.services"
config()

class UserServices {
  signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
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

  signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
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

  signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }), 
      this.signRefreshToken({ user_id, verify })
    ])
  }

  async checkEmailExist(email: string) {
    const result = await databaseServices.users.findOne({ email: email })
    return Boolean(result)
  }
}

export const userServices = new UserServices()
