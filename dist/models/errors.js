"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityError = exports.ErrorWithStatus = void 0;
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
/**
 * type EntityError = {
 *    "email": {
 *      msg: "Email không hợp lệ"
 *      value: "abc"
 *    }
 * }
 */
class ErrorWithStatus {
    status;
    message;
    constructor({ status, message }) {
        this.status = status;
        this.message = message;
    }
}
exports.ErrorWithStatus = ErrorWithStatus;
class EntityError extends ErrorWithStatus {
    errors;
    constructor({ message = message_1.UserMessage.VALIDATION_ERROR, errors }) {
        super({ status: httpStatus_1.default.UNPROCESSABLE_ENTITY, message });
        this.errors = errors;
    }
}
exports.EntityError = EntityError;
