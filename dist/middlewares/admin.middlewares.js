"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupplyValidator = exports.deleteSupplierValidator = exports.updateSupplierValidator = exports.createSupplierValidator = exports.createProductValidator = exports.getBrandsValidator = exports.queryValidator = exports.deleteBrandValidator = exports.deleteCategoryValidator = exports.checkBrandValidator = exports.checkCategoryValidator = exports.updateCategoryValidator = exports.checkIdValidator = void 0;
const express_validator_1 = require("express-validator");
const mongodb_1 = require("mongodb");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const errors_1 = require("../models/errors");
const validations_1 = require("../utils/validations");
const user_middlewares_1 = require("./user.middlewares");
const database_services_1 = __importDefault(require("../services/database.services"));
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
            options: async (value) => {
                const findCategory = await database_services_1.default.category.findOne({ name: value });
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
        optional: true
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
        },
        custom: {
            options: async (value) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.SupplyMessage.PRODUCT_ID_IS_NOT_EXISTS,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                const checkProduct = await database_services_1.default.product.findOne({ _id: new mongodb_1.ObjectId(value) });
                if (!checkProduct) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.SupplyMessage.PRODUCT_ID_IS_NOT_EXISTS,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    },
    supplierId: {
        notEmpty: {
            errorMessage: message_1.SupplyMessage.SUPPLIER_ID_IS_REQUIRED
        },
        custom: {
            options: async (value) => {
                if (!mongodb_1.ObjectId.isValid(value)) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.SupplyMessage.SUPPLIER_ID_IS_NOT_EXISTS,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                const checkSupplier = await database_services_1.default.supplier.findOne({ _id: new mongodb_1.ObjectId(value) });
                if (!checkSupplier) {
                    throw new errors_1.ErrorWithStatus({
                        message: message_1.SupplyMessage.SUPPLIER_ID_IS_NOT_EXISTS,
                        status: httpStatus_1.default.BAD_REQUESTED
                    });
                }
                return true;
            }
        }
    },
    importPrice: {
        notEmpty: {
            errorMessage: message_1.SupplyMessage.IMPORT_PRICE_IS_REQUIRED
        }
        // các validate khác như value > 0... thì sẽ làm ở client
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
