"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomainListResendController = exports.getEmailResendListController = void 0;
const ses_1 = require("../utils/ses");
const email_services_1 = __importDefault(require("../services/email.services"));
const message_1 = require("../constant/message");
const getEmailResendListController = async (req, res) => {
    const { limit, page } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await email_services_1.default.getEmailLog(Number(limit), Number(page));
    res.json({
        message: message_1.EmailMessage.GET_LIST_EMAIL_LOG_IS_SUCCESS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getEmailResendListController = getEmailResendListController;
const getDomainListResendController = async (req, res) => {
    try {
        const result = await ses_1.resend.domains.list();
        res.json({ success: true, data: result.data?.data });
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
exports.getDomainListResendController = getDomainListResendController;
