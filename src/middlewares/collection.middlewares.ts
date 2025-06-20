import { checkSchema } from "express-validator"
import { ObjectId } from "mongodb"
import httpStatus from "~/constant/httpStatus"
import { Path, UserMessage } from "~/constant/message"
import { slugConditionMap } from "~/controllers/collections.controllers"
import { ErrorWithStatus } from "~/models/errors"
import databaseServices from "~/services/database.services"
import { getValueObject } from "~/utils/common"
import { validate } from "~/utils/validations"

const slugCondition = getValueObject(slugConditionMap)

export const getCollectionValidator = validate(
  checkSchema(
    {
      slug: {
        custom: {
          options: (value) => {
            if (!slugCondition.includes(value)) {
              throw new ErrorWithStatus({
                status: httpStatus.NOTFOUND,
                message: Path.PathNotFound
              })
            }
            return true
          }
        }
      }
    },
    ["params"]
  )
)

export const checkUserIdValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value) => {
            const findUserId = await databaseServices.users.findOne({ _id: new ObjectId(value) })
            if (!findUserId) {
              throw new ErrorWithStatus({
                status: httpStatus.BAD_REQUESTED,
                message: UserMessage.REQUIRED_LOGIN
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
