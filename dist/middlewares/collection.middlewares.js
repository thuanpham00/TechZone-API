"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionValidator = void 0;
const express_validator_1 = require("express-validator");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const collections_controllers_1 = require("../controllers/collections.controllers");
const errors_1 = require("../models/errors");
const common_1 = require("../utils/common");
const validations_1 = require("../utils/validations");
const slugCondition = (0, common_1.getValueObject)(collections_controllers_1.slugConditionMap);
exports.getCollectionValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    slug: {
        custom: {
            options: (value) => {
                if (!slugCondition.includes(value)) {
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
