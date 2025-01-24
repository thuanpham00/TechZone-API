import { checkSchema, ParamSchema } from "express-validator"
import { RoleType, UserVerifyStatus } from "~/constant/enum"
import { UserMessage } from "~/constant/message"
import databaseServices from "~/services/database.services"
import { userServices } from "~/services/user.services"
import { convertEnumToArray } from "~/utils/common"
import { hashPassword } from "~/utils/scripto"
import { validate } from "~/utils/validations"
import { NextFunction, Request, Response } from "express"
import { ErrorWithStatus } from "~/models/errors"
import httpStatus from "~/constant/httpStatus"
import { verifyToken } from "~/utils/jwt"
import { config } from "dotenv"
import { JsonWebTokenError } from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { TokenPayload } from "~/models/requests/user.requests"
import { ParamsDictionary } from "express-serve-static-core"

config()

const Role = convertEnumToArray(RoleType)

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: UserMessage.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: UserMessage.PASSWORD_IS_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: UserMessage.PASSWORD_IS_LENGTH
  },
  isStrongPassword: {
    // độ mạnh password
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1
    },
    errorMessage: UserMessage.PASSWORD_IS_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: UserMessage.CONFIRM_PASSWORD_IS_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: UserMessage.CONFIRM_PASSWORD_IS_LENGTH
  },
  isStrongPassword: {
    // độ mạnh password
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1
    },
    errorMessage: UserMessage.CONFIRM_PASSWORD_IS_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(UserMessage.PASSWORD_IS_NOT_MATCH)
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: UserMessage.NAME_IS_REQUIRED // truyền lỗi này vào msg và là lỗi 422 - msg là string
  },
  trim: true,
  matches: {
    options: /^[^\d]*$/, // Biểu thức chính quy đảm bảo không có chữ số
    errorMessage: UserMessage.NAME_IS_NOT_NUMBER
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true, // yc tuân thủ chuẩn iso 8601
      strictSeparator: true // yc dấu phân cách "-" giữa ngày tháng năm của date (2024-01-01)
    },
    errorMessage: UserMessage.DATE_OF_BIRTH_IS_ISO8601
  } // new Date().toISOString()
}

const forgotPasswordToken: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: UserMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHORIZED
        })
      }
      try {
        const decode_forgotPasswordToken = await verifyToken({
          token: value,
          privateKey: process.env.SECRET_KEY_FORGOT_PASSWORD_TOKEN as string
        })
        const user = await databaseServices.users.findOne({
          _id: new ObjectId(decode_forgotPasswordToken.user_id)
        })
        req.decode_forgotPasswordToken = decode_forgotPasswordToken
        if (!user) {
          throw new ErrorWithStatus({
            message: UserMessage.USER_NOT_FOUND,
            status: httpStatus.NOTFOUND
          })
        }

        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: UserMessage.FORGOT_PASSWORD_TOKEN_IS_INVALID,
            status: httpStatus.UNAUTHORIZED
          })
        }
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: error.message,
            status: httpStatus.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

export const registerValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: UserMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: UserMessage.EMAIL_IS_VALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isEmail = await userServices.checkEmailExist(value)
            if (isEmail) {
              throw new Error(UserMessage.EMAIL_IS_EXISTS) // truyền lỗi này vào msg và là lỗi 422 - msg là string
              // throw new ErrorWithStatus({
              //   status: httpStatus.UNAUTHORIZED,
              //   message: UserMessage.EMAIL_IS_EXISTS
              // }) // truyền lỗi này vào msg và là lỗi 401 - msg là instanceof ErrorWithStatus - msg là Object
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      name: nameSchema,
      role: {
        optional: true, // không bắt buộc
        isIn: {
          options: [Role],
          errorMessage: UserMessage.ROLE_IS_INVALID
        }
      }
    },
    ["body"]
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: UserMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: UserMessage.EMAIL_IS_VALID
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseServices.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (!user) {
              throw new Error(UserMessage.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            ;(req as Request).user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ["body"]
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value, { req }) => {
            // 'Bearer ewbuhfiewqfhgewqui'
            // kiểm tra có AT không
            // verify ngược lại
            const access_token = (value || "").split(" ")[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: UserMessage.ACCESS_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                privateKey: process.env.SECRET_KEY_ACCESS_TOKEN as string
              })
              req.decode_authorization = decode_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: httpStatus.UNAUTHORIZED
                })
              }
            }
            return true
          }
        }
      }
    },
    ["headers"]
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: UserMessage.REFRESH_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const [decode_refreshToken, findToken] = await Promise.all([
                verifyToken({ token: value, privateKey: process.env.SECRET_KEY_REFRESH_TOKEN as string }),
                databaseServices.refreshToken.findOne({ token: value })
              ])
              req.decode_refreshToken = decode_refreshToken
              if (findToken === null) {
                throw new ErrorWithStatus({
                  message: UserMessage.REFRESH_TOKEN_USED_OR_NOT_EXISTS,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              /**
               * Khi lỗi xảy ra trong đoạn try:
              Nếu lỗi là JsonWebTokenError, khối catch sẽ tạo một lỗi mới với thông báo tương ứng (error.message) và status httpStatus.UNAUTHORIZED.
              Nếu lỗi không phải là JsonWebTokenError, nó sẽ rơi xuống throw error trong khối catch, chuyển lỗi này lên các lớp trên để xử lý.
               */
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error // có tác dụng truyền tiếp lỗi lên các lớp trên của ứng dụng nếu lỗi không thuộc loại JsonWebTokenError
            }
            return true
          }
        }
      }
    },
    ["cookies"]
  )
)

export const emailVerifyValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: UserMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decode_emailVerifyToken = await verifyToken({
                token: value,
                privateKey: process.env.SECRET_KEY_EMAIL_VERIFY_TOKEN as string
              })
              req.decode_emailVerifyToken = decode_emailVerifyToken
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: httpStatus.UNAUTHORIZED
                })
              }
            }
            return true
          }
        }
      }
    },
    ["body"]
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: UserMessage.EMAIL_IS_VALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: UserMessage.EMAIL_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            const user = await databaseServices.users.findOne({ email: value })
            if (!user) {
              throw new ErrorWithStatus({
                message: UserMessage.USER_NOT_FOUND,
                status: httpStatus.NOTFOUND
              })
            }
            req.user = user
            return true
          }
        }
      }
    },
    ["body"]
  )
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordToken
    },
    ["body"]
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordToken,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ["body"]
  )
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decode_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: UserMessage.USER_IS_NOT_VERIFIED,
        status: httpStatus.UNAUTHORIZED
      })
    )
  }
  next()
}

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decode_authorization as TokenPayload
            const user = await databaseServices.users.findOne({
              _id: new ObjectId(user_id)
            })
            if (!user) {
              throw new ErrorWithStatus({
                message: UserMessage.USER_NOT_FOUND,
                status: httpStatus.NOTFOUND
              })
            }
            const isMatch = hashPassword(value) === user.password
            if (!isMatch) {
              throw new ErrorWithStatus({
                message: UserMessage.OLD_PASSWORD_IS_INCORRECT,
                status: httpStatus.UNAUTHORIZED
              })
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ["body"]
  )
)

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      avatar: {
        optional: true
      },
      numberPhone: {
        optional: true,
        isLength: {
          options: {
            min: 10,
            max: 11
          },
          errorMessage: UserMessage.NUMBER_PHONE_LENGTH_MIN_10_MAX_11
        },
        custom: {
          options: (value) => {
            const regex = /^\d+$/
            if (!regex.test(value)) {
              throw new Error(UserMessage.NUMBER_PHONE_IS_INVALID)
            }
            return true
          }
        }
      }
    },
    ["body"]
  )
)

// body phần truyền lên
// params là tham số định danh như id
// query là tham số truy vấn ví dụ page, limit, type ...
// cookie là lưu refresh_token
// headers là nơi check Authorization (chứa accessToken)

export const checkRole = (roleCheck: RoleType[] | RoleType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.decode_authorization as TokenPayload
    if (roleCheck.includes(role)) {
      return next()
    }
    next(
      new ErrorWithStatus({
        message: UserMessage.PERMISSION_DENIED,
        status: httpStatus.FORBIDDEN
      })
    )
  }
}
