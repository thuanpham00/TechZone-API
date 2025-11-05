"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailLog = void 0;
const mongodb_1 = require("mongodb");
const config_1 = require("../../utils/config");
class EmailLog {
    _id;
    to;
    from;
    subject;
    type;
    status;
    resend_id;
    created_at;
    constructor(emailLog) {
        this._id = emailLog._id || new mongodb_1.ObjectId();
        this.from = emailLog.from || config_1.envConfig.resend_email_from;
        this.to = emailLog.to;
        this.subject = emailLog.subject;
        this.type = emailLog.type;
        this.status = emailLog.status;
        this.resend_id = emailLog.resend_id;
        this.created_at = new Date();
    }
}
exports.EmailLog = EmailLog;
