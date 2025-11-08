"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderController = exports.updateStatusOrderForCustomerController = void 0;
const order_services_1 = __importDefault(require("../services/order.services"));
const database_services_1 = __importDefault(require("../services/database.services"));
const mongodb_1 = require("mongodb");
const errors_1 = require("../models/errors");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const updateStatusOrderForCustomerController = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { message } = await order_services_1.default.updateStatusOrder(id, status);
    res.json({
        message: message
    });
};
exports.updateStatusOrderForCustomerController = updateStatusOrderForCustomerController;
const getOrderController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { result, total } = await order_services_1.default.getOrder(user_id);
    res.json({
        message: message_1.OrderMessage.GET_ORDER_IS_SUCCESS,
        result,
        total
    });
};
exports.getOrderController = getOrderController;
