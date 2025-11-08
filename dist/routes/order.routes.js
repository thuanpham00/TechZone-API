"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controllers_1 = require("../controllers/order.controllers");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const ordersRoute = (0, express_1.Router)();
/**
 * Description: cập nhật đơn hàng dành cho khách hàng (hủy hoặc nhận)
 * Path: /:id
 * Method: Put
 */
ordersRoute.put("/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(order_controllers_1.updateStatusOrderForCustomerController));
/**
 * Description: lấy đơn hàng của 1 user
 * Path: /
 * Method: Get
 */
ordersRoute.get("/", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(order_controllers_1.getOrderController));
exports.default = ordersRoute;
