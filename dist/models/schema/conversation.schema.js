"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongodb_1 = require("mongodb");
class Conversation {
    _id;
    sender_id;
    receiver_id;
    content;
    created_at;
    constructor(conversation) {
        const date = new Date();
        this._id = conversation._id || new mongodb_1.ObjectId();
        this.sender_id = conversation.sender_id;
        this.receiver_id = conversation.receiver_id;
        this.content = conversation.content;
        this.created_at = conversation.created_at || date;
    }
}
exports.Conversation = Conversation;
