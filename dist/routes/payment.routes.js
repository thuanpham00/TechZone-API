"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controllers_1 = require("../controllers/payment.controllers");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const paymentRoute = (0, express_1.Router)();
/**
 * Description: Thanh toán đơn hàng
 * Path: /
 * Method: POST
 */
paymentRoute.post("/", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(payment_controllers_1.createPaymentController));
/**
 * Description: Cập nhật Thanh toán đơn hàng
 * Path: /vnpay-callback
 * Method: POST
 */
paymentRoute.post("/vnpay-callback", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(payment_controllers_1.callBackVnpayController));
/**
 * Description: Cập nhật Thanh toán đơn hàng
 * Path: /vnpay-callback
 * Method: POST
 */
paymentRoute.post("/create-order-cod", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(payment_controllers_1.createOrderCODController));
exports.default = paymentRoute;
