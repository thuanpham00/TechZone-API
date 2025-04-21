"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendForgotPasswordToken = exports.sendVerifyRegisterEmail = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)();
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
    }
});
const createSendEmailCommand = ({ fromAddress, toAddresses, ccAddresses = [], body, subject, replyToAddresses = [] }) => {
    return new client_ses_1.SendEmailCommand({
        Destination: {
            /* required */
            CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
            ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: body
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject
            }
        },
        Source: fromAddress,
        ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
    });
};
const sendVerifyEmail = (toAddress, subject, body) => {
    const sendEmailCommand = createSendEmailCommand({
        fromAddress: process.env.SES_FROM_ADDRESS,
        toAddresses: toAddress,
        body,
        subject
    });
    return sesClient.send(sendEmailCommand);
};
const verifyEmailTemplate = fs_1.default.readFileSync(path_1.default.resolve("src/template/verify-email.html"), "utf8");
const sendVerifyRegisterEmail = (toAddress, emailVerifyToken, template = verifyEmailTemplate) => {
    return sendVerifyEmail(toAddress, "Verify your email", template
        .replace("{{title}}", "Please verify your email")
        .replace("{{content}}", "Click the button below to verify your email")
        .replace("{{titleLink}}", "Verify")
        .replace("{{link}}", `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`));
};
exports.sendVerifyRegisterEmail = sendVerifyRegisterEmail;
const sendForgotPasswordToken = (toAddress, forgotPasswordToken, template = verifyEmailTemplate) => {
    return sendVerifyEmail(toAddress, "Verify your email", template
        .replace("{{title}}", "Please reset your password")
        .replace("{{content}}", "Click the button below to reset your password")
        .replace("{{titleLink}}", "Reset")
        .replace("{{link}}", `${process.env.CLIENT_URL}/forgot-password?token=${forgotPasswordToken}`));
};
exports.sendForgotPasswordToken = sendForgotPasswordToken;
// gửi email lên form -> gửi mail về email đó -> từ email navigate qua web với url "/forgot-password" -> lấy ra token -> chạy vào "/verify-forgot-password" -> để kiểm tra -> cuối cùng reset password với "/reset-password"
