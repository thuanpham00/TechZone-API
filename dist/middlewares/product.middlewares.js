"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductRelatedValidator = exports.getProductDetailValidator = void 0;
const express_validator_1 = require("express-validator");
const mongodb_1 = require("mongodb");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const errors_1 = require("../models/errors");
const database_services_1 = __importDefault(require("../services/database.services"));
const validations_1 = require("../utils/validations");
exports.getProductDetailValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    id: {
        custom: {
            options: async (value) => {
                const findProduct = await database_services_1.default.product.findOne({ _id: new mongodb_1.ObjectId(value) });
                if (!findProduct) {
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
exports.getProductRelatedValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    brand: {
        custom: {
            options: async (value) => {
                const findBrand = await database_services_1.default.brand.findOne({ _id: new mongodb_1.ObjectId(value) });
                if (!findBrand) {
                    throw new errors_1.ErrorWithStatus({
                        status: httpStatus_1.default.NOTFOUND,
                        message: message_1.Path.PathNotFound
                    });
                }
                return true;
            }
        }
    },
    category: {
        custom: {
            options: async (value) => {
                const findCategory = await database_services_1.default.category.findOne({ _id: new mongodb_1.ObjectId(value) });
                if (!findCategory) {
                    throw new errors_1.ErrorWithStatus({
                        status: httpStatus_1.default.NOTFOUND,
                        message: message_1.Path.PathNotFound
                    });
                }
                return true;
            }
        }
    },
    idProduct: {
        custom: {
            options: async (value) => {
                const findProduct = await database_services_1.default.product.findOne({ _id: new mongodb_1.ObjectId(value) });
                if (!findProduct) {
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
