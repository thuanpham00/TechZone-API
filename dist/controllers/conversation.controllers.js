"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationsController = exports.getListUserTypeController = void 0;
const message_1 = require("../constant/message");
const conversation_services_1 = __importDefault(require("../services/conversation.services"));
const getListUserTypeController = async (req, res) => {
    const { type_user } = req.query;
    const { user_id } = req.decode_authorization;
    const { result, total } = await conversation_services_1.default.getUserListType(user_id, type_user);
    res.json({
        message: message_1.ConversationMessage.GET_LIST_USER_TYPE_IS_SUCCESS,
        result: {
            result,
            total
        }
    });
};
exports.getListUserTypeController = getListUserTypeController;
const getConversationsController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const { receiverId } = req.params;
    const { limit, page } = req.query;
    const result = await conversation_services_1.default.getConversationByReceiver({
        senderId: user_id,
        receiverId: receiverId,
        limit: Number(limit),
        page: Number(page)
    });
    res.json({
        result: {
            limit: Number(limit),
            page: Number(page),
            total_page: Math.ceil(result.total / Number(limit)),
            conversation: result.conversations
        },
        message: message_1.ConversationMessage.GET_CONVERSATION_IS_SUCCESS
    });
};
exports.getConversationsController = getConversationsController;
