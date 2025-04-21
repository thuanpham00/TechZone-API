"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const errors_1 = require("../models/errors");
const validate = (validation) => {
    return async (req, res, next) => {
        await validation.run(req);
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next(); // nếu không có lỗi thì chuyển tới middleware tiếp theo
        }
        const errorsObject = errors.mapped();
        const entityError = new errors_1.EntityError({ errors: {} });
        for (const key in errorsObject) {
            const { msg } = errorsObject[key];
            // nếu khác lỗi 422 thì trả về error handler
            if (msg instanceof errors_1.ErrorWithStatus && msg.status !== httpStatus_1.default.UNPROCESSABLE_ENTITY) {
                return next(msg); // chuyển tới error handler
            }
            entityError.errors[key] = errorsObject[key];
        }
        next(entityError);
    };
};
exports.validate = validate;
