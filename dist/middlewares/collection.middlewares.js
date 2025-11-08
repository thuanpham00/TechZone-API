"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserIdValidator = exports.getCollectionValidator = void 0;
const express_validator_1 = require("express-validator");
const mongodb_1 = require("mongodb");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const collections_controllers_1 = require("../controllers/collections.controllers");
const errors_1 = require("../models/errors");
const database_services_1 = __importDefault(require("../services/database.services"));
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
exports.checkUserIdValidator = (0, validations_1.validate)((0, express_validator_1.checkSchema)({
    user_id: {
        custom: {
            options: async (value) => {
                const findUserId = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(value) });
                if (!findUserId) {
                    throw new errors_1.ErrorWithStatus({
                        status: httpStatus_1.default.BAD_REQUESTED,
                        message: message_1.UserMessage.REQUIRED_LOGIN
                    });
                }
                return true;
            }
        }
    }
}, ["body"]));
