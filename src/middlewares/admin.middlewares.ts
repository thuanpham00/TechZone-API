import { checkSchema, ParamSchema } from "express-validator"
import { ObjectId } from "mongodb"
import httpStatus from "~/constant/httpStatus"
import {
  AdminMessage,
  Path,
  ProductMessage,
  ReceiptMessage,
  SupplierMessage,
  SupplyMessage,
  UserMessage
} from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import { validate } from "~/utils/validations"
import { nameSchema, numberPhoneSchema } from "./user.middlewares"
import databaseServices from "~/services/database.services"
import { Request, Response, NextFunction } from "express"
import { userServices } from "~/services/user.services"

export const checkEmailExistValidator = validate(
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
      }
    },
    ["body"]
  )
)

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
          options: async (value, { req }) => {
            // nếu có params.id (trường hợp update) thì loại trừ chính nó
            const excludeId = (req.params as Record<string, any>)?.id
            const query: any = { name: value }
            if (excludeId && ObjectId.isValid(excludeId)) {
              query._id = { $ne: new ObjectId(excludeId) }
            }
            const findCategory = await databaseServices.category.findOne(query)
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

export const getProductIdAndSupplierIdValidator = async (req: Request, res: Response, next: NextFunction) => {
  const productId = await databaseServices.product.findOne({ name: req.query.name_product })

  const supplierId = await databaseServices.supplier.findOne({ name: req.query.name_supplier })

  if (productId && supplierId) {
    req.productId = productId?._id.toString()
    req.supplierId = supplierId?._id.toString()
    return next()
  }
  next(
    new ErrorWithStatus({
      message: ReceiptMessage.PRODUCT_ID_OR_SUPPLIER_ID_IS_INVALID,
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
        optional: true,
        custom: {
          options: async (value, { req }) => {
            const findProduct = await databaseServices.product.findOne({ name: req.body.productId })
            if ((findProduct?.price as number) < value) {
              throw new Error(SupplyMessage.IMPORT_PRICE_IS_INVALID)
            }
            return true
          }
        }
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

export const createReceiptValidator = validate(
  checkSchema(
    {
      items: {
        isArray: true,
        custom: {
          options: (value) => {
            if (
              value.some(
                (item: any) =>
                  typeof item !== "object" ||
                  item === null ||
                  !("productId" in item) ||
                  !("supplierId" in item) ||
                  !("quantity" in item) ||
                  !("pricePerUnit" in item) ||
                  !("totalPrice" in item) ||
                  typeof item.quantity !== "number" ||
                  typeof item.pricePerUnit !== "number" ||
                  typeof item.totalPrice !== "number"
              )
            ) {
              throw new Error(ReceiptMessage.ITEM_IS_INVALID)
            }
            return true
          }
        },
        notEmpty: {
          errorMessage: ReceiptMessage.ITEM_IS_REQUIRED
        }
      },
      totalAmount: {
        notEmpty: {
          errorMessage: ReceiptMessage.TOTAL_AMOUNT_IS_REQUIRED
        }
      },
      totalItem: {
        notEmpty: {
          errorMessage: ReceiptMessage.TOTAL_ITEM_IS_REQUIRED
        }
      },
      importDate: {
        notEmpty: {
          errorMessage: ReceiptMessage.IMPORT_DATE_IS_REQUIRED
        }
      },
      note: {
        optional: true
      }
    },
    ["body"]
  )
)

export const checkRoleExitsValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body
  const checkRole = await databaseServices.role.findOne({ name: name })
  if (checkRole) {
    return next(new ErrorWithStatus({ message: AdminMessage.ROLE_IS_INVALID, status: httpStatus.BAD_REQUESTED }))
  }
  next()
}

export const deleteRoleValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const checkRole = await databaseServices.role.findOne({ _id: new ObjectId(id) })
  if (checkRole && checkRole.permissions.length > 0) {
    return next(new ErrorWithStatus({ message: AdminMessage.CANNOT_DELETE_ROLE, status: httpStatus.BAD_REQUESTED }))
  }
  const checkUserWithRole = await databaseServices.users.findOne({ role: new ObjectId(id) })
  if (checkUserWithRole) {
    return next(new ErrorWithStatus({ message: AdminMessage.CANNOT_DELETE_ROLE, status: httpStatus.BAD_REQUESTED }))
  }
  next()
}

export const createVoucherValidator = validate(
  checkSchema(
    {
      code: {
        notEmpty: {
          errorMessage: "Mã voucher không được để trống"
        },
        isString: {
          errorMessage: "Mã voucher phải là chuỗi"
        },
        trim: true,
        isLength: {
          options: { min: 3, max: 20 },
          errorMessage: "Mã voucher từ 3-20 ký tự"
        },
        custom: {
          options: async (value) => {
            const voucher = await databaseServices.vouchers.findOne({ code: value })
            if (voucher) {
              throw new ErrorWithStatus({
                message: "Mã voucher đã tồn tại",
                status: httpStatus.BAD_REQUESTED
              })
            }
            return true
          }
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: "Mô tả phải là chuỗi"
        }
      },
      type: {
        notEmpty: {
          errorMessage: "Loại voucher không được để trống"
        },
        isIn: {
          options: [["percentage", "fixed"]],
          errorMessage: "Loại voucher phải là 'percentage' hoặc 'fixed'"
        }
      },
      value: {
        notEmpty: {
          errorMessage: "Giá trị không được để trống"
        },
        isNumeric: {
          errorMessage: "Giá trị phải là số"
        },
        custom: {
          options: (value, { req }) => {
            if (req.body.type === "percentage") {
              if (value <= 0 || value > 100) {
                throw new Error("Giảm theo % phải từ 1-100")
              }
            } else if (req.body.type === "fixed") {
              if (value <= 0) {
                throw new Error("Giá trị giảm phải lớn hơn 0")
              }
            }
            return true
          }
        }
      },
      max_discount: {
        optional: true,
        isNumeric: {
          errorMessage: "Giảm tối đa phải là số"
        },
        custom: {
          options: (value, { req }) => {
            if (req.body.type === "percentage" && value && value <= 0) {
              throw new Error("Giảm tối đa phải lớn hơn 0")
            }
            return true
          }
        }
      },
      min_order_value: {
        notEmpty: {
          errorMessage: "Giá trị đơn tối thiểu không được để trống"
        },
        isNumeric: {
          errorMessage: "Giá trị đơn tối thiểu phải là số"
        },
        custom: {
          options: (value) => {
            if (value < 0) {
              throw new Error("Giá trị đơn tối thiểu phải >= 0")
            }
            return true
          }
        }
      },
      usage_limit: {
        optional: true,
        isNumeric: {
          errorMessage: "Số lượt sử dụng phải là số"
        },
        custom: {
          options: (value) => {
            if (value !== undefined && value !== null && value <= 0) {
              throw new Error("Số lượt sử dụng phải lớn hơn 0")
            }
            return true
          }
        }
      },
      start_date: {
        notEmpty: {
          errorMessage: "Ngày bắt đầu không được để trống"
        },
        isISO8601: {
          errorMessage: "Ngày bắt đầu không hợp lệ (định dạng ISO8601)"
        }
      },
      end_date: {
        notEmpty: {
          errorMessage: "Ngày kết thúc không được để trống"
        },
        isISO8601: {
          errorMessage: "Ngày kết thúc không hợp lệ (định dạng ISO8601)"
        },
        custom: {
          options: (value, { req }) => {
            const startDate = new Date(req.body.start_date)
            const endDate = new Date(value)
            if (startDate >= endDate) {
              throw new Error("Ngày kết thúc phải sau ngày bắt đầu")
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [["active", "inactive", "expired"]],
          errorMessage: "Trạng thái phải là 'active', 'inactive' hoặc 'expired'"
        }
      }
    },
    ["body"]
  )
)

export const updateVoucherValidator = validate(
  checkSchema(
    {
      code: {
        optional: true,
        isString: {
          errorMessage: "Mã voucher phải là chuỗi"
        },
        trim: true,
        isLength: {
          options: { min: 3, max: 20 },
          errorMessage: "Mã voucher từ 3-20 ký tự"
        },
        custom: {
          options: async (value, { req }) => {
            const excludeId = (req.params as Record<string, any>)?.id
            const query: any = { code: value }
            if (excludeId && ObjectId.isValid(excludeId)) {
              query._id = { $ne: new ObjectId(excludeId) }
            }
            const voucher = await databaseServices.vouchers.findOne(query)
            if (voucher) {
              throw new ErrorWithStatus({
                message: "Mã voucher đã tồn tại",
                status: httpStatus.BAD_REQUESTED
              })
            }
            return true
          }
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: "Mô tả phải là chuỗi"
        }
      },
      type: {
        optional: true,
        isIn: {
          options: [["percentage", "fixed"]],
          errorMessage: "Loại voucher phải là 'percentage' hoặc 'fixed'"
        }
      },
      value: {
        optional: true,
        isNumeric: {
          errorMessage: "Giá trị phải là số"
        },
        custom: {
          options: async (value, { req }) => {
            const voucherId = (req.params as Record<string, any>)?.id
            const existingVoucher = await databaseServices.vouchers.findOne({ _id: new ObjectId(voucherId) })
            const type = req.body.type || existingVoucher?.type

            if (type === "percentage" && (value <= 0 || value > 100)) {
              throw new Error("Giảm theo % phải từ 1-100")
            } else if (type === "fixed" && value <= 0) {
              throw new Error("Giá trị giảm phải lớn hơn 0")
            }
            return true
          }
        }
      },
      max_discount: {
        optional: true,
        isNumeric: {
          errorMessage: "Giảm tối đa phải là số"
        },
        custom: {
          options: (value) => {
            if (value && value <= 0) {
              throw new Error("Giảm tối đa phải lớn hơn 0")
            }
            return true
          }
        }
      },
      min_order_value: {
        optional: true,
        isNumeric: {
          errorMessage: "Giá trị đơn tối thiểu phải là số"
        },
        custom: {
          options: (value) => {
            if (value < 0) {
              throw new Error("Giá trị đơn tối thiểu phải >= 0")
            }
            return true
          }
        }
      },
      usage_limit: {
        optional: true,
        isNumeric: {
          errorMessage: "Số lượt sử dụng phải là số"
        },
        custom: {
          options: (value) => {
            if (value !== undefined && value !== null && value <= 0) {
              throw new Error("Số lượt sử dụng phải lớn hơn 0")
            }
            return true
          }
        }
      },
      start_date: {
        optional: true,
        isISO8601: {
          errorMessage: "Ngày bắt đầu không hợp lệ"
        }
      },
      end_date: {
        optional: true,
        isISO8601: {
          errorMessage: "Ngày kết thúc không hợp lệ"
        },
        custom: {
          options: async (value, { req }) => {
            const voucherId = (req.params as Record<string, any>)?.id
            const existingVoucher = await databaseServices.vouchers.findOne({ _id: new ObjectId(voucherId) })
            const startDate = new Date(req.body.start_date || existingVoucher?.start_date)
            const endDate = new Date(value)

            if (startDate >= endDate) {
              throw new Error("Ngày kết thúc phải sau ngày bắt đầu")
            }
            return true
          }
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [["active", "inactive", "expired"]],
          errorMessage: "Trạng thái phải là 'active', 'inactive' hoặc 'expired'"
        }
      }
    },
    ["body"]
  )
)
