"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controllers_1 = require("../controllers/product.controllers");
const admin_middlewares_1 = require("../middlewares/admin.middlewares");
const product_middlewares_1 = require("../middlewares/product.middlewares");
const handlers_1 = require("../utils/handlers");
const productRoute = (0, express_1.Router)();
/**
 * Trong Express, các route được xử lý theo thứ tự khai báo. Route cụ thể nên đặt trước, các route động như /:id nên đặt sau để tránh conflict.
 */
/**
 * Description: Get search product
 * Path: /search
 * Method: GET
 */
productRoute.get("/", (0, handlers_1.wrapRequestHandler)(product_controllers_1.getSearchProductController));
/**
 * Description: Get product related
 * Path: /related
 * Method: GET
 */
productRoute.get("/related", product_middlewares_1.getProductRelatedValidator, (0, handlers_1.wrapRequestHandler)(product_controllers_1.getProductRelatedController));
/**
 * Description: get product detail
 * Path: /:id
 * Method: GET
 * Params: { id: string }
 */
productRoute.get("/:id", admin_middlewares_1.checkIdValidator, product_middlewares_1.getProductDetailValidator, (0, handlers_1.wrapRequestHandler)(product_controllers_1.getProductDetailController));
exports.default = productRoute;
