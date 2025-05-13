import { checkSchema } from "express-validator"
import httpStatus from "~/constant/httpStatus"
import { Path } from "~/constant/message"
import { slugConditionMap } from "~/controllers/collections.controllers"
import { ErrorWithStatus } from "~/models/errors"
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


