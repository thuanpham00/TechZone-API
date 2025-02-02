import { checkSchema } from "express-validator"
import { ObjectId } from "mongodb"
import { Media } from "~/constant/common"
import { MediaType } from "~/constant/enum"
import { ProductMessage } from "~/constant/message"
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
      }
    },
    ["body"]
  )
)

// 18 thuộc tính
// 7 bắt buộc: name, category, brand, price, description, medias, discount, isFeatured
// 1 bắt buộc: medias (chia ra 2 api)
// 10 ko truyền (tự cập nhật): id, created_at, updated_at, viewCount, averageRating, reviews, sold, stock, specifications, gifts,

// specifications: {
//   optional: true,
//   isArray: true,
//   custom: {
//     // `specifications` phải là mảng các string dạng id
//     options: (value) => {
//       if (value.some((item: any) => !ObjectId.isValid(item))) {
//         throw new Error(ProductMessage.SPECIFICATIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
//       }
//       return true
//     }
//   }
// },

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
