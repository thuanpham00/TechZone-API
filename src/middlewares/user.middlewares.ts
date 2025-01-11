import { checkSchema, ParamSchema } from "express-validator"
import { GenderType, RoleType } from "~/constant/enum"
import { UserMessage } from "~/constant/message"
import databaseServices from "~/services/database.services"
import { userServices } from "~/services/user.services"
import { convertEnumToArray } from "~/utils/common"
import { hashPassword } from "~/utils/scripto"
import { validate } from "~/utils/validations"
import { Request } from "express"

const Gender = convertEnumToArray(GenderType)
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
      date_of_birth: dateOfBirthSchema,
      sex: {
        notEmpty: {
          errorMessage: UserMessage.SEX_IS_REQUIRED
        },
        isIn: {
          options: [Gender],
          errorMessage: UserMessage.SEX_IS_INVALID
        }
      },
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
