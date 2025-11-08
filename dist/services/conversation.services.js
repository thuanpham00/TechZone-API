"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_services_1 = __importDefault(require("./database.services"));
const mongodb_1 = require("mongodb");
class ConversationServices {
    async getUserListType(user_id, typeUser) {
        const findRoleID = await database_services_1.default.role
            .findOne({ name: typeUser === "Staff" ? "Admin" : "Customer" })
            .then((res) => res?._id);
        const listUser = await database_services_1.default.users
            .find({ role: findRoleID }, {
            projection: {
                _id: 1,
                name: 1,
                avatar: 1,
                role: 1,
                email: 1,
                numberPhone: 1
            }
        })
            .sort({ created_at: -1 }) // -1 = DESC, 1 = ASC
            .toArray();
        const listUserFilter = listUser.filter((item) => item._id.toString() !== user_id.toString());
        const listMessageFinalUserIdToUserOther = await Promise.all(listUserFilter.map(async (item) => {
            const res = await database_services_1.default.conversation.findOne({
                $or: [
                    { sender_id: new mongodb_1.ObjectId(user_id), receiver_id: new mongodb_1.ObjectId(item._id) },
                    { sender_id: new mongodb_1.ObjectId(item._id), receiver_id: new mongodb_1.ObjectId(user_id) }
                ]
            }, { sort: { created_at: -1 } } // lấy bản ghi cũ nhất
            );
            return res;
        }));
        const listUserWithMessageFinal = listUserFilter.map((item) => {
            const findUser = listMessageFinalUserIdToUserOther.find((userMessage) => userMessage?.sender_id.toString() === item._id.toString() ||
                userMessage?.receiver_id.toString() === item._id.toString());
            return {
                ...item,
                content: findUser?.content || null,
                lastMessageAt: findUser?.created_at || null
            };
        });
        return {
            result: listUserWithMessageFinal || [],
            total: listUserWithMessageFinal.length || 0
        };
    }
    async getConversationByReceiver({ senderId, receiverId, limit, page }) {
        const [conversations, total] = await Promise.all([
            database_services_1.default.conversation
                .find({
                $or: [
                    {
                        sender_id: new mongodb_1.ObjectId(senderId),
                        receiver_id: new mongodb_1.ObjectId(receiverId)
                    },
                    {
                        sender_id: new mongodb_1.ObjectId(receiverId),
                        receiver_id: new mongodb_1.ObjectId(senderId)
                    }
                ]
            })
                .sort({ created_at: -1 })
                .skip(limit * (page - 1))
                .limit(limit)
                .toArray(),
            database_services_1.default.conversation
                .find({
                $or: [
                    {
                        sender_id: new mongodb_1.ObjectId(senderId),
                        receiver_id: new mongodb_1.ObjectId(receiverId)
                    },
                    {
                        sender_id: new mongodb_1.ObjectId(receiverId),
                        receiver_id: new mongodb_1.ObjectId(senderId)
                    }
                ]
            })
                .toArray()
        ]);
        return {
            conversations,
            total: total.length
        };
    }
}
const conversationServices = new ConversationServices();
exports.default = conversationServices;
