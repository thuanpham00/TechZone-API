"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorHandler = void 0;
const errors_1 = require("../models/errors");
const lodash_1 = require("lodash");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const defaultErrorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.ErrorWithStatus) {
        res.status(err.status).json((0, lodash_1.omit)(err, ["status"]));
        return;
    }
    try {
        const finalError = {};
        Object.getOwnPropertyNames(err).forEach((key) => {
            if (!Object.getOwnPropertyDescriptor(err, key)?.enumerable ||
                !Object.getOwnPropertyDescriptor(err, key)?.writable) {
                return; // trường hợp inActive từ aws (key: "isInactive")
            }
            finalError[key] = err[key];
        });
        if (finalError !== null) {
            res.status(httpStatus_1.default.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorInfo: (0, lodash_1.omit)(finalError, ["stack"])
            });
        }
    }
    catch (error) {
        res.status(httpStatus_1.default.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
            errorInfo: (0, lodash_1.omit)(error, ["stack"])
        });
    }
};
exports.defaultErrorHandler = defaultErrorHandler;
// Object.getOwnPropertyDescriptor: Trả về một descriptor object mô tả các thuộc tính của một thuộc tính cụ thể trên đối tượng.
// Object.getOwnPropertyNames: Trả về một mảng chứa tất cả các tên thuộc tính (cả enumerable và non-enumerable) trên đối tượng được chỉ định.
