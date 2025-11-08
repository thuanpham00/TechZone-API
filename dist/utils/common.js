"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.escapeRegex = exports.getValueObject = exports.getNameImage = exports.convertEnumToArrayNumber = exports.convertEnumToArray = void 0;
exports.formatCurrency = formatCurrency;
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const errors_1 = require("../models/errors");
const jwt_1 = require("./jwt");
const config_1 = require("./config");
const jsonwebtoken_1 = require("jsonwebtoken");
const convertEnumToArray = (enumObject) => {
    return Object.values(enumObject).filter((value) => typeof value === "string");
};
exports.convertEnumToArray = convertEnumToArray;
const convertEnumToArrayNumber = (enumObject) => {
    return Object.values(enumObject).filter((value) => typeof value === "number");
};
exports.convertEnumToArrayNumber = convertEnumToArrayNumber;
const getNameImage = (fileName) => {
    return fileName.split(".")[0];
};
exports.getNameImage = getNameImage;
const getValueObject = (object) => {
    return Object.keys(object);
};
exports.getValueObject = getValueObject;
function formatCurrency(current) {
    return new Intl.NumberFormat("de-DE").format(current);
}
const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
exports.escapeRegex = escapeRegex;
const verifyAccessToken = async (access_token, req) => {
    if (!access_token) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.ACCESS_TOKEN_IS_REQUIRED,
            status: httpStatus_1.default.UNAUTHORIZED
        });
    }
    try {
        const decode_authorization = await (0, jwt_1.verifyToken)({
            token: access_token,
            privateKey: config_1.envConfig.secret_key_access_token
        });
        if (req) {
            req.decode_authorization = decode_authorization;
            return true;
        }
        return decode_authorization;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            throw new errors_1.ErrorWithStatus({
                message: "AccessToken expired",
                status: httpStatus_1.default.UNAUTHORIZED
            });
        }
    }
};
exports.verifyAccessToken = verifyAccessToken;
