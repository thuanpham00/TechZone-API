import { checkSchema } from "express-validator"
import httpStatus from "~/constant/httpStatus"
import { UserMessage } from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import { userServices } from "~/services/user.services"
import { validate } from "~/utils/validations"

export const registerValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: UserMessage.EMAIL_IS_VALID
        },
        custom: {
          options: async (value) => {
            const isEmail = await userServices.checkEmailExist(value)
            if (isEmail) {
              return new ErrorWithStatus({
                status: httpStatus.UNAUTHORIZED,
                message: UserMessage.EMAIL_IS_EXISTS
              })
            }
            return true
          }
        }
      }
    },
    ["body"]
  )
)
