import { checkSchema } from "express-validator"
import { ObjectId } from "mongodb"
import { Media } from "~/constant/common"
import { MediaType } from "~/constant/enum"
import httpStatus from "~/constant/httpStatus"
import { Path, ProductMessage } from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import databaseServices from "~/services/database.services"
import { convertEnumToArrayNumber } from "~/utils/common"
import { validate } from "~/utils/validations"

const validateNumber = (fieldName: string) => ({
  custom: {
    options: (value: any) => {
      if (typeof value !== "number") {
        throw new Error(ProductMessage[`${fieldName}_MUST_BE_NUMBER` as keyof typeof ProductMessage])
      }
      if (value < 0) {
        throw new Error(ProductMessage[`${fieldName}_IS_INVALID` as keyof typeof ProductMessage])
      }
      return true
    }
  }
})

export const createProductValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: ProductMessage.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: ProductMessage.NAME_MUST_BE_STRING
        }
      },
      category: {
        notEmpty: {
          errorMessage: ProductMessage.CATEGORY_IS_REQUIRED
        },
        isString: {
          errorMessage: ProductMessage.CATEGORY_MUST_BE_STRING
        }
      },
      brand: {
        notEmpty: {
          errorMessage: ProductMessage.BRAND_IS_REQUIRED
        },
        isString: {
          errorMessage: ProductMessage.BRAND_MUST_BE_STRING
        }
      },
      price: {
        notEmpty: {
          errorMessage: ProductMessage.PRICE_IS_REQUIRED
        },
        ...validateNumber("PRICE")
      },
      description: {
        notEmpty: {
          errorMessage: ProductMessage.DESCRIPTION_IS_REQUIRED
        },
        isString: {
          errorMessage: ProductMessage.DESCRIPTION_MUST_BE_STRING
        }
      },
      discount: {
        ...validateNumber("DISCOUNT")
      },
      isFeatured: {
        isIn: {
          options: [[true, false]],
          errorMessage: ProductMessage.IS_FEATURED_MUST_BE_BOOLEAN
        }
      },
      specifications: {
        isArray: true,
        custom: {
          options: (value) => {
            if (
              value.some(
                (item: any) =>
                  typeof item !== "object" ||
                  item === null ||
                  !("name" in item) ||
                  !("value" in item) ||
                  typeof item.name !== "string" ||
                  (typeof item.value !== "string" && typeof item.value !== "number")
              )
            ) {
              throw new Error(ProductMessage.SPECIFICATIONS_IS_INVALID)
            }
            return true
          }
        }
      }
    },
    ["body"]
  )
)

export const getProductDetailValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value) => {
            const findProduct = await databaseServices.product.findOne({ _id: new ObjectId(value) })
            if (!findProduct) {
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

export const getProductRelatedValidator = validate(
  checkSchema(
    {
      brand: {
        custom: {
          options: async (value) => {
            const findBrand = await databaseServices.brand.findOne({ _id: new ObjectId(value) })
            if (!findBrand) {
              throw new ErrorWithStatus({
                status: httpStatus.NOTFOUND,
                message: Path.PathNotFound
              })
            }
            return true
          }
        }
      },
      category: {
        custom: {
          options: async (value) => {
            const findCategory = await databaseServices.category.findOne({ _id: new ObjectId(value) })
            if (!findCategory) {
              throw new ErrorWithStatus({
                status: httpStatus.NOTFOUND,
                message: Path.PathNotFound
              })
            }
            return true
          }
        }
      },
      idProduct: {
        custom: {
          options: async (value) => {
            const findProduct = await databaseServices.product.findOne({ _id: new ObjectId(value) })
            if (!findProduct) {
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
// 18 thuộc tính
// 9 bắt buộc: name, category, brand, price, description, discount, isFeatured, specifications, gifts
// 1 bắt buộc: medias (chia ra 2 api)
// 8 ko truyền (tự cập nhật): id, created_at, updated_at, viewCount, reviews, sold, stock, averageRating

// medias: {
//   notEmpty: {
//     errorMessage: ProductMessage.MEDIAS_IS_REQUIRED
//   },
//   isArray: true,
//   custom: {
//     options: (value) => {
//       if (
//         value.some((item: Media) => {
//           return typeof item.url !== "string" || !MediaValidate.includes(item.type)
//         })
//       ) {
//         throw new Error(ProductMessage.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA)
//       }
//       return true
//     }
//   }
// }
