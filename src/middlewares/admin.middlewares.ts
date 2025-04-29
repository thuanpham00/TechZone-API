import { checkSchema, ParamSchema } from "express-validator"
import { ObjectId } from "mongodb"
import httpStatus from "~/constant/httpStatus"
import { AdminMessage, Path, ProductMessage, SupplierMessage, SupplyMessage, UserMessage } from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import { validate } from "~/utils/validations"
import { nameSchema, numberPhoneSchema } from "./user.middlewares"
import databaseServices from "~/services/database.services"
import { Request, Response, NextFunction } from "express"

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
          options: async (value, { req }) => {
            const findBrand = await databaseServices.brand.findOne({
              name: value,
              category_ids: {
                $in: [new ObjectId(req.body.categoryId)]
              }
            })
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
            const findBrand = await databaseServices.brand.findOne({ category_ids: { $in: [new ObjectId(value)] } })
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
          options: async (value, { req }) => {
            const findProduct = await databaseServices.product.findOne({
              brand: new ObjectId(value),
              category: new ObjectId(req.query?.categoryId)
            })
            // check coi có sản phẩm nào thuộc về thương hiệu này và thuộc về danh mục đó không (2 điều kiện)
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
        }
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
        notEmpty: {
          errorMessage: ProductMessage.PRICE_IS_REQUIRED
        }
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

export const createSupplierValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: SupplierMessage.NAME_IS_REQUIRED
        },
        custom: {
          options: async (value) => {
            const checkNameExists = await databaseServices.supplier.findOne({ name: value })
            if (checkNameExists) {
              throw new Error(SupplierMessage.NAME_IS_EXISTS)
            }
            return true
          }
        }
      },
      contactName: {
        notEmpty: {
          errorMessage: SupplierMessage.CONTACT_NAME_IS_REQUIRED
        }
      },
      email: {
        notEmpty: {
          errorMessage: SupplierMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: UserMessage.EMAIL_IS_VALID
        },
        custom: {
          options: async (value) => {
            const checkEmail = await databaseServices.supplier.findOne({ email: value })
            if (checkEmail) {
              throw new Error(UserMessage.EMAIL_IS_EXISTS)
            }
            return true
          }
        }
      },
      phone: {
        ...numberPhoneSchema
      },
      address: {
        notEmpty: {
          errorMessage: SupplierMessage.ADDRESS_IS_REQUIRED
        }
      },
      taxCode: {
        isLength: {
          options: {
            min: 10,
            max: 13
          },
          errorMessage: SupplierMessage.TAX_CODE_IS_LENGTH
        },
        custom: {
          options: async (value) => {
            const checkTaxCode = await databaseServices.supplier.findOne({
              taxCode: value
            })
            if (checkTaxCode) {
              throw new Error(SupplierMessage.TAX_CODE_IS_EXISTS)
            }
            const regex = /^\d+$/
            if (!regex.test(value)) {
              throw new Error(SupplierMessage.TAX_CODE_IS_INVALID)
            }
            return true
          }
        }
      },
      description: {
        optional: true
      }
    },
    ["body"]
  )
)

export const updateSupplierValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        custom: {
          options: async (value) => {
            const checkName = await databaseServices.supplier.findOne({ name: value })
            if (value === checkName?.name) {
              return true
            }
            if (checkName) {
              throw new Error(SupplierMessage.NAME_IS_EXISTS)
            }
            return true
          }
        }
      },
      contactName: {
        optional: true
      },
      address: {
        optional: true
      },
      email: {
        custom: {
          options: async (value, { req }) => {
            const findSupplier = await databaseServices.supplier.findOne({
              _id: new ObjectId((req.params as Record<string, any>).id)
            })
            if (findSupplier?.email === value) {
              return true
            }
            const checkEmail = await databaseServices.supplier.findOne({ email: value })
            if (checkEmail) {
              throw new Error(UserMessage.EMAIL_IS_EXISTS)
            }
            return true
          }
        },
        optional: true
      },
      description: {
        optional: true
      },
      phone: {
        optional: true
      }
    },
    ["body"]
  )
)

export const deleteSupplierValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value) => {
            const checkIdSUpplierExists = await databaseServices.supply.findOne({
              supplierId: new ObjectId(value)
            })
            // kiểm tra xem có cung ứng nào thuộc về nhà cung cấp này không
            if (checkIdSUpplierExists) {
              throw new ErrorWithStatus({
                message: AdminMessage.SUPPLIER_CANNOT_BE_DELETED,
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

export const createSupplyValidator = validate(
  checkSchema(
    {
      productId: {
        notEmpty: {
          errorMessage: SupplyMessage.PRODUCT_ID_IS_REQUIRED
        }
      },
      supplierId: {
        notEmpty: {
          errorMessage: SupplyMessage.SUPPLIER_ID_IS_REQUIRED
        }
      },
      importPrice: {
        notEmpty: {
          errorMessage: SupplyMessage.IMPORT_PRICE_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const findProduct = await databaseServices.product.findOne({ name: req.body.productId })
            if ((findProduct?.price as number) < value) {
              throw new Error(SupplyMessage.IMPORT_PRICE_IS_INVALID)
            }
            return true
          }
        }
        // các validate khác như value > 0... thì sẽ làm ở client
        // sẽ tạo sản phẩm trước rồi mới thêm cung ứng thì cần check giá cung ung phải thấp hơn giá sản phẩm
      },
      warrantyMonths: {
        notEmpty: {
          errorMessage: SupplyMessage.WARRANTY_MONTHS_IS_REQUIRED
        }
      },
      leadTimeDays: {
        notEmpty: {
          errorMessage: SupplyMessage.LEAD_TIME_DAYS_IS_REQUIRED
        }
      },
      description: {
        optional: true
      }
    },
    ["body"]
  )
)

export const getProductIdFromProductNameValidator = async (req: Request, res: Response, next: NextFunction) => {
  const productId = await databaseServices.product.findOne({ name: req.query.productId })
  if (productId) {
    req.productId = productId?._id.toString()
    return next()
  }
  next(
    new ErrorWithStatus({
      message: ProductMessage.PRODUCT_ID_IS_INVALID,
      status: httpStatus.BAD_REQUESTED
    })
  )
}

export const updateSupplyValidator = validate(
  checkSchema(
    {
      productId: {
        optional: true
      },
      supplierId: {
        optional: true
      },
      importPrice: {
        optional: true
      },
      warrantyMonths: { optional: true },
      leadTimeDays: {
        optional: true
      },
      description: {
        optional: true
      }
    },
    ["body"]
  )
)
