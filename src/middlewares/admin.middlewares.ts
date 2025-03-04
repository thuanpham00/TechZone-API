import { checkSchema, ParamSchema } from "express-validator"
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

export const deleteCategoryValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value) => {
            const findBrand = await databaseServices.brand.findOne({ category_id: new ObjectId(value) })
            // check coi có thương hiệu nào thuộc về danh mục này ko (tham chiếu id - category_id)
            if (findBrand) {
              throw new ErrorWithStatus({
                message: AdminMessage.CATEGORY_CANNOT_BE_DELETED,
                status: httpStatus.BAD_REQUESTED
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

export const deleteBrandValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value) => {
            const findProduct = await databaseServices.product.findOne({ brand: new ObjectId(value) })
            // check coi có thương hiệu nào thuộc về danh mục này ko (tham chiếu id - category_id)
            if (findProduct) {
              throw new ErrorWithStatus({
                message: AdminMessage.BRAND_CANNOT_BE_DELETED,
                status: httpStatus.BAD_REQUESTED
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

const querySchema: ParamSchema = {
  custom: {
    options: (value) => {
      if (Number(value) <= 0) {
        throw new ErrorWithStatus({
          status: httpStatus.NOTFOUND,
          message: Path.PathNotFound
        })
      }
      return true
    }
  }
}

export const queryValidator = validate(
  checkSchema(
    {
      page: querySchema,
      limit: querySchema
    },
    ["query"]
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
