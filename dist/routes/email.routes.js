"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_controllers_1 = require("../controllers/email.controllers");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const emailRoute = (0, express_1.Router)();
/**
 * Description: Get list email sent from resend
 * Path: /
 * Method: GET
 */
emailRoute.get("/", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(email_controllers_1.getEmailResendListController));
/**
 * Description: Get list domain resend
 * Path: /
 * Method: GET
 */
emailRoute.get("/domain", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(email_controllers_1.getDomainListResendController));
exports.default = emailRoute;
