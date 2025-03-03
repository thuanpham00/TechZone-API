import { checkSchema } from "express-validator"
import { ObjectId } from "mongodb"
import httpStatus from "~/constant/httpStatus"
import { AdminMessage, Path } from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import { validate } from "~/utils/validations"
import { nameSchema } from "./user.middlewares"
import databaseServices from "~/services/database.services"

export const checkIdValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
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

export const updateCategoryValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema
      }
    },
    ["body"]
  )
)

export const checkCategoryValidator = validate(
  checkSchema(
    {
      name: {
        custom: {
          options: async (value) => {
            const findCategory = await databaseServices.category.findOne({ name: value })
            if (findCategory) {
              throw new ErrorWithStatus({
                message: AdminMessage.CATEGORY_IS_ALREADY,
                status: httpStatus.BAD_REQUESTED
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

export const checkBrandValidator = validate(
  checkSchema(
    {
      name: {
        custom: {
          options: async (value) => {
            const findBrand = await databaseServices.brand.findOne({ name: value })
            if (findBrand) {
              throw new ErrorWithStatus({
                message: AdminMessage.BRAND_IS_ALREADY,
                status: httpStatus.BAD_REQUESTED
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

export const getBrandsValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
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
    ["query"]
  )
)
