"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVoucherValidator = exports.createVoucherValidator = exports.deleteRoleValidator = exports.checkRoleExitsValidator = exports.createReceiptValidator = exports.updateSupplyValidator = exports.getProductIdAndSupplierIdValidator = exports.getProductIdFromProductNameValidator = exports.createSupplyValidator = exports.deleteSupplierValidator = exports.updateSupplierValidator = exports.createSupplierValidator = exports.createProductValidator = exports.getBrandsValidator = exports.queryValidator = exports.deleteBrandValidator = exports.deleteCategoryValidator = exports.checkBrandValidator = exports.checkCategoryValidator = exports.updateCategoryValidator = exports.checkIdValidator = exports.checkEmailExistValidator = void 0;
const express_validator_1 = require("express-validator");
const mongodb_1 = require("mongodb");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const errors_1 = require("../models/errors");
const validations_1 = require("../utils/validations");
const user_middlewares_1 = require("./user.middlewares");
const database_services_1 = __importDefault(require("../services/database.services"));
const user_services_1 = require("../services/user.services");
exports.checkEmailExistValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: {
            errorMessage: message_1.UserMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: message_1.UserMessage.EMAIL_IS_VALID
        },
        trim: true,
        custom: {
            options: async (value) => {
                const isEmail = await user_services_1.userServices.checkEmailExist(value);
                if (isEmail) {
                    throw new Error(message_1.UserMessage.EMAIL_IS_EXISTS); // truyền lỗi này vào msg và là lỗi 422 - msg là string
                    // throw new ErrorWithStatus({
                    //   status: httpStatus.UNAUTHORIZED,
                    //   message: UserMessage.EMAIL_IS_EXISTS
                    // }) // truyền lỗi này vào msg và là lỗi 401 - msg là instanceof ErrorWithStatus - msg là Object
                }
                return true;
            }
        }
    }
}, ["body"]));
exports.checkIdValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    id: {
        custom: {
            options: (value) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new errors_1.ErrorWithStatus({
                        status: httpStatus_1.default.NOTFOUND,
                        message: message_1.Path.PathNotFound
                    });
                }
                return true;
            }
        }
    }
}, ["params"]));
exports.updateCategoryValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        ...user_middlewares_1.nameSchema
    }
}, ["body"]));
exports.checkCategoryValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        custom: {
            options: async (value, { req }) => {
                // nếu có params.id (trường hợp update) thì loại trừ chính nó
                const excludeId = req.params?.id;
                const query = { name: value };
                if (excludeId && mongodb_1.ObjectId.isValid(excludeId)) {
                    query._id = { $ne: new mongodb_1.ObjectId(excludeId) };
                }
                const findCategory = await database_services_1.default.category.findOne(query);
                if (findCategory) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.AdminMessage.CATEGORY_IS_ALREADY,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    }
}, ["body"]));
exports.checkBrandValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        custom: {
            options: async (value, { req }) => {
                const findBrand = await database_services_1.default.brand.findOne({
                    name: value,
                    category_ids: {
                        $in: [new mongodb_1.ObjectId(req.body.categoryId)]
                    }
                });
                if (findBrand) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.AdminMessage.BRAND_IS_ALREADY,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    }
}, ["body"]));
exports.deleteCategoryValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    id: {
        custom: {
            options: async (value) => {
                const findBrand = await database_services_1.default.brand.findOne({ category_ids: { $in: [new mongodb_1.ObjectId(value)] } });
                // check coi có thương hiệu nào thuộc về danh mục này ko (tham chiếu id - category_id)
                if (findBrand) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.AdminMessage.CATEGORY_CANNOT_BE_DELETED,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    }
}, ["params"]));
exports.deleteBrandValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    id: {
        custom: {
            options: async (value, { req }) => {
                const findProduct = await database_services_1.default.product.findOne({
                    brand: new mongodb_1.ObjectId(value),
                    category: new mongodb_1.ObjectId(req.query?.categoryId)
                });
                // check coi có sản phẩm nào thuộc về thương hiệu này và thuộc về danh mục đó không (2 điều kiện)
                if (findProduct) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.AdminMessage.BRAND_CANNOT_BE_DELETED,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    }
}, ["params"]));
const querySchema = {
    custom: {
        options: (value) => {
            if (Number(value) <= 0) {
                throw new errors_1.ErrorWithStatus({
                    status: httpStatus_1.default.NOTFOUND,
                    message: message_1.Path.PathNotFound
                });
            }
            return true;
        }
    }
};
exports.queryValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    page: querySchema,
    limit: querySchema
}, ["query"]));
exports.getBrandsValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    id: {
        custom: {
            options: (value) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new errors_1.ErrorWithStatus({
                        status: httpStatus_1.default.NOTFOUND,
                        message: message_1.Path.PathNotFound
                    });
                }
                return true;
            }
        }
    }
}, ["query"]));
exports.createProductValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        notEmpty: {
            errorMessage: message_1.ProductMessage.NAME_IS_REQUIRED
        },
        isString: {
            errorMessage: message_1.ProductMessage.NAME_MUST_BE_STRING
        }
    },
    category: {
        notEmpty: {
            errorMessage: message_1.ProductMessage.CATEGORY_IS_REQUIRED
        },
        isString: {
            errorMessage: message_1.ProductMessage.CATEGORY_MUST_BE_STRING
        }
    },
    brand: {
        notEmpty: {
            errorMessage: message_1.ProductMessage.BRAND_IS_REQUIRED
        },
        isString: {
            errorMessage: message_1.ProductMessage.BRAND_MUST_BE_STRING
        }
    },
    price: {
        notEmpty: {
            errorMessage: message_1.ProductMessage.PRICE_IS_REQUIRED
        }
    },
    description: {
        notEmpty: {
            errorMessage: message_1.ProductMessage.DESCRIPTION_IS_REQUIRED
        },
        isString: {
            errorMessage: message_1.ProductMessage.DESCRIPTION_MUST_BE_STRING
        }
    },
    discount: {
        notEmpty: {
            errorMessage: message_1.ProductMessage.PRICE_IS_REQUIRED
        }
    },
    isFeatured: {
        isIn: {
            options: [[true, false]],
            errorMessage: message_1.ProductMessage.IS_FEATURED_MUST_BE_BOOLEAN
        }
    },
    specifications: {
        isArray: true,
        custom: {
            options: (value) => {
                if (value.some((item) => typeof item !== "object" ||
                    item === null ||
                    !("name" in item) ||
                    !("value" in item) ||
                    typeof item.name !== "string" ||
                    (typeof item.value !== "string" && typeof item.value !== "number"))) {
                    throw new Error(message_1.ProductMessage.SPECIFICATIONS_IS_INVALID);
                }
                return true;
            }
        }
    }
}, ["body"]));
exports.createSupplierValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        notEmpty: {
            errorMessage: message_1.SupplierMessage.NAME_IS_REQUIRED
        },
        custom: {
            options: async (value) => {
                const checkNameExists = await database_services_1.default.supplier.findOne({ name: value });
                if (checkNameExists) {
                    throw new Error(message_1.SupplierMessage.NAME_IS_EXISTS);
                }
                return true;
            }
        }
    },
    contactName: {
        notEmpty: {
            errorMessage: message_1.SupplierMessage.CONTACT_NAME_IS_REQUIRED
        }
    },
    email: {
        notEmpty: {
            errorMessage: message_1.SupplierMessage.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: message_1.UserMessage.EMAIL_IS_VALID
        },
        custom: {
            options: async (value) => {
                const checkEmail = await database_services_1.default.supplier.findOne({ email: value });
                if (checkEmail) {
                    throw new Error(message_1.UserMessage.EMAIL_IS_EXISTS);
                }
                return true;
            }
        }
    },
    phone: {
        ...user_middlewares_1.numberPhoneSchema
    },
    address: {
        notEmpty: {
            errorMessage: message_1.SupplierMessage.ADDRESS_IS_REQUIRED
        }
    },
    taxCode: {
        isLength: {
            options: {
                min: 10,
                max: 13
            },
            errorMessage: message_1.SupplierMessage.TAX_CODE_IS_LENGTH
        },
        custom: {
            options: async (value) => {
                const checkTaxCode = await database_services_1.default.supplier.findOne({
                    taxCode: value
                });
                if (checkTaxCode) {
                    throw new Error(message_1.SupplierMessage.TAX_CODE_IS_EXISTS);
                }
                const regex = /^\d+$/;
                if (!regex.test(value)) {
                    throw new Error(message_1.SupplierMessage.TAX_CODE_IS_INVALID);
                }
                return true;
            }
        }
    },
    description: {
        optional: true
    }
}, ["body"]));
exports.updateSupplierValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        optional: true,
        custom: {
            options: async (value) => {
                const checkName = await database_services_1.default.supplier.findOne({ name: value });
                if (value === checkName?.name) {
                    return true;
                }
                if (checkName) {
                    throw new Error(message_1.SupplierMessage.NAME_IS_EXISTS);
                }
                return true;
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
                const findSupplier = await database_services_1.default.supplier.findOne({
                    _id: new mongodb_1.ObjectId(req.params.id)
                });
                if (findSupplier?.email === value) {
                    return true;
                }
                const checkEmail = await database_services_1.default.supplier.findOne({ email: value });
                if (checkEmail) {
                    throw new Error(message_1.UserMessage.EMAIL_IS_EXISTS);
                }
                return true;
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
}, ["body"]));
exports.deleteSupplierValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    id: {
        custom: {
            options: async (value) => {
                const checkIdSUpplierExists = await database_services_1.default.supply.findOne({
                    supplierId: new mongodb_1.ObjectId(value)
                });
                // kiểm tra xem có cung ứng nào thuộc về nhà cung cấp này không
                if (checkIdSUpplierExists) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.AdminMessage.SUPPLIER_CANNOT_BE_DELETED,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    }
}, ["params"]));
exports.createSupplyValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    productId: {
        notEmpty: {
            errorMessage: message_1.SupplyMessage.PRODUCT_ID_IS_REQUIRED
        }
    },
    supplierId: {
        notEmpty: {
            errorMessage: message_1.SupplyMessage.SUPPLIER_ID_IS_REQUIRED
        }
    },
    importPrice: {
        notEmpty: {
            errorMessage: message_1.SupplyMessage.IMPORT_PRICE_IS_REQUIRED
        },
        custom: {
            options: async (value, { req }) => {
                const findProduct = await database_services_1.default.product.findOne({ name: req.body.productId });
                if (findProduct?.price < value) {
                    throw new Error(message_1.SupplyMessage.IMPORT_PRICE_IS_INVALID);
                }
                return true;
            }
        }
        // các validate khác như value > 0... thì sẽ làm ở client
        // sẽ tạo sản phẩm trước rồi mới thêm cung ứng thì cần check giá cung ung phải thấp hơn giá sản phẩm
    },
    warrantyMonths: {
        notEmpty: {
            errorMessage: message_1.SupplyMessage.WARRANTY_MONTHS_IS_REQUIRED
        }
    },
    leadTimeDays: {
        notEmpty: {
            errorMessage: message_1.SupplyMessage.LEAD_TIME_DAYS_IS_REQUIRED
        }
    },
    description: {
        optional: true
    }
}, ["body"]));
const getProductIdFromProductNameValidator = async (req, res, next) => {
    const productId = await database_services_1.default.product.findOne({ name: req.query.productId });
    if (productId) {
        req.productId = productId?._id.toString();
        return next();
    }
    next(new errors_1.ErrorWithStatus({
        message: message_1.ProductMessage.PRODUCT_ID_IS_INVALID,
        status: httpStatus_1.default.BAD_REQUESTED
    }));
};
exports.getProductIdFromProductNameValidator = getProductIdFromProductNameValidator;
const getProductIdAndSupplierIdValidator = async (req, res, next) => {
    const productId = await database_services_1.default.product.findOne({ name: req.query.name_product });
    const supplierId = await database_services_1.default.supplier.findOne({ name: req.query.name_supplier });
    if (productId && supplierId) {
        req.productId = productId?._id.toString();
        req.supplierId = supplierId?._id.toString();
        return next();
    }
    next(new errors_1.ErrorWithStatus({
        message: message_1.ReceiptMessage.PRODUCT_ID_OR_SUPPLIER_ID_IS_INVALID,
        status: httpStatus_1.default.BAD_REQUESTED
    }));
};
exports.getProductIdAndSupplierIdValidator = getProductIdAndSupplierIdValidator;
exports.updateSupplyValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
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
                const findProduct = await database_services_1.default.product.findOne({ name: req.body.productId });
                if (findProduct?.price < value) {
                    throw new Error(message_1.SupplyMessage.IMPORT_PRICE_IS_INVALID);
                }
                return true;
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
}, ["body"]));
exports.createReceiptValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    items: {
        isArray: true,
        custom: {
            options: (value) => {
                if (value.some((item) => typeof item !== "object" ||
                    item === null ||
                    !("productId" in item) ||
                    !("supplierId" in item) ||
                    !("quantity" in item) ||
                    !("pricePerUnit" in item) ||
                    !("totalPrice" in item) ||
                    typeof item.quantity !== "number" ||
                    typeof item.pricePerUnit !== "number" ||
                    typeof item.totalPrice !== "number")) {
                    throw new Error(message_1.ReceiptMessage.ITEM_IS_INVALID);
                }
                return true;
            }
        },
        notEmpty: {
            errorMessage: message_1.ReceiptMessage.ITEM_IS_REQUIRED
        }
    },
    totalAmount: {
        notEmpty: {
            errorMessage: message_1.ReceiptMessage.TOTAL_AMOUNT_IS_REQUIRED
        }
    },
    totalItem: {
        notEmpty: {
            errorMessage: message_1.ReceiptMessage.TOTAL_ITEM_IS_REQUIRED
        }
    },
    importDate: {
        notEmpty: {
            errorMessage: message_1.ReceiptMessage.IMPORT_DATE_IS_REQUIRED
        }
    },
    note: {
        optional: true
    }
}, ["body"]));
const checkRoleExitsValidator = async (req, res, next) => {
    const { name } = req.body;
    const checkRole = await database_services_1.default.role.findOne({ name: name });
    if (checkRole) {
        return next(new errors_1.ErrorWithStatus({ message: message_1.AdminMessage.ROLE_IS_INVALID, status: httpStatus_1.default.BAD_REQUESTED }));
    }
    next();
};
exports.checkRoleExitsValidator = checkRoleExitsValidator;
const deleteRoleValidator = async (req, res, next) => {
    const { id } = req.params;
    const checkRole = await database_services_1.default.role.findOne({ _id: new mongodb_1.ObjectId(id) });
    if (checkRole && checkRole.permissions.length > 0) {
        return next(new errors_1.ErrorWithStatus({ message: message_1.AdminMessage.CANNOT_DELETE_ROLE, status: httpStatus_1.default.BAD_REQUESTED }));
    }
    const checkUserWithRole = await database_services_1.default.users.findOne({ role: new mongodb_1.ObjectId(id) });
    if (checkUserWithRole) {
        return next(new errors_1.ErrorWithStatus({ message: message_1.AdminMessage.CANNOT_DELETE_ROLE, status: httpStatus_1.default.BAD_REQUESTED }));
    }
    next();
};
exports.deleteRoleValidator = deleteRoleValidator;
exports.createVoucherValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
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
                const voucher = await database_services_1.default.vouchers.findOne({ code: value });
                if (voucher) {
                    throw new errors_1.ErrorWithStatus({
                        message: "Mã voucher đã tồn tại",
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
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
                        throw new Error("Giảm theo % phải từ 1-100");
                    }
                }
                else if (req.body.type === "fixed") {
                    if (value <= 0) {
                        throw new Error("Giá trị giảm phải lớn hơn 0");
                    }
                }
                return true;
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
                    throw new Error("Giảm tối đa phải lớn hơn 0");
                }
                return true;
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
                    throw new Error("Giá trị đơn tối thiểu phải >= 0");
                }
                return true;
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
                    throw new Error("Số lượt sử dụng phải lớn hơn 0");
                }
                return true;
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
                const startDate = new Date(req.body.start_date);
                const endDate = new Date(value);
                if (startDate >= endDate) {
                    throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
                }
                return true;
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
}, ["body"]));
exports.updateVoucherValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
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
                const excludeId = req.params?.id;
                const query = { code: value };
                if (excludeId && mongodb_1.ObjectId.isValid(excludeId)) {
                    query._id = { $ne: new mongodb_1.ObjectId(excludeId) };
                }
                const voucher = await database_services_1.default.vouchers.findOne(query);
                if (voucher) {
                    throw new errors_1.ErrorWithStatus({
                        message: "Mã voucher đã tồn tại",
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
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
                const voucherId = req.params?.id;
                const existingVoucher = await database_services_1.default.vouchers.findOne({ _id: new mongodb_1.ObjectId(voucherId) });
                const type = req.body.type || existingVoucher?.type;
                if (type === "percentage" && (value <= 0 || value > 100)) {
                    throw new Error("Giảm theo % phải từ 1-100");
                }
                else if (type === "fixed" && value <= 0) {
                    throw new Error("Giá trị giảm phải lớn hơn 0");
                }
                return true;
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
                    throw new Error("Giảm tối đa phải lớn hơn 0");
                }
                return true;
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
                    throw new Error("Giá trị đơn tối thiểu phải >= 0");
                }
                return true;
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
                    throw new Error("Số lượt sử dụng phải lớn hơn 0");
                }
                return true;
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
                const voucherId = req.params?.id;
                const existingVoucher = await database_services_1.default.vouchers.findOne({ _id: new mongodb_1.ObjectId(voucherId) });
                const startDate = new Date(req.body.start_date || existingVoucher?.start_date);
                const endDate = new Date(value);
                if (startDate >= endDate) {
                    throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
                }
                return true;
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
}, ["body"]));
