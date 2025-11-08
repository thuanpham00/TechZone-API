"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversation_controllers_1 = require("../controllers/conversation.controllers");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const conversationRoute = (0, express_1.Router)();
/**
 * Description: Get list user type
 * Path: /list-user-type
 * Method: GET
 */
conversationRoute.get("/list-user-type", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(conversation_controllers_1.getListUserTypeController));
/**
 * Description: Get list email sent from resend
 * Path: /
 * Method: GET
 */
conversationRoute.get("/receiver/:receiverId", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(conversation_controllers_1.getConversationsController));
exports.default = conversationRoute;
