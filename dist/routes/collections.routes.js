"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collections_controllers_1 = require("../controllers/collections.controllers");
const collection_middlewares_1 = require("../middlewares/collection.middlewares");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const collectionsRoute = (0, express_1.Router)();
/**
 * Description: get bộ lọc theo danh mục
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/filters", (0, handlers_1.wrapRequestHandler)(collections_controllers_1.getFilterBaseOnCategory));
/**
 * Description: Tạo danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.post("/favourite", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.addProductToFavouriteController));
/**
 * Description: Lấy danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/favourite", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.getCollectionsFavouriteController));
/**
 * Description: Tạo danh sách sản phẩm  trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.post("/cart", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.addProductToCartController));
/**
 * Description: Cập nhật số lượng sản phẩm trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.put("/cart", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.updateQuantityProductInCartController));
/**
 * Description: Tạo danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.delete("/cart", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.clearProductInCartController));
/**
 * Description: Lấy danh sách sản phẩm trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/cart", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.getCollectionsCartController));
/**
 * Description:xóa 1 sản phẩm trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.delete("/cart/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.removeProductToCartController));
/**
 * Description: Lấy danh sách sản phẩm dựa vào /:slug
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/:slug", collection_middlewares_1.getCollectionValidator, (0, handlers_1.wrapRequestHandler)(collections_controllers_1.getCollectionsController));
exports.default = collectionsRoute;
