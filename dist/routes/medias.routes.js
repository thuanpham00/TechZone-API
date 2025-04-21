"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../constant/enum");
const media_controllers_1 = require("../controllers/media.controllers");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const mediasRoute = (0, express_1.Router)();
/**
 * Description: Upload list image product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: file[]; nameCategory: string; idProduct: string }
 */
mediasRoute.post("/upload-image-product", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), (0, handlers_1.wrapRequestHandler)(media_controllers_1.uploadImageListProductController));
/**
 * Description: Upload banner product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: file; nameCategory: string; idProduct: string }
 */
mediasRoute.post("/upload-banner-product", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), (0, handlers_1.wrapRequestHandler)(media_controllers_1.uploadBannerProductController));
/**
 * Description: Upload avatar cho 1 user
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: file }
 */
mediasRoute.post("/upload-image-user", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), (0, handlers_1.wrapRequestHandler)(media_controllers_1.uploadImageUserController));
exports.default = mediasRoute;
