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
