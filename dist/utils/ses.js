"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationOrderBuyCustomer = exports.sendForgotPasswordToken = exports.sendVerifyRegisterEmail = exports.resend = void 0;
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const resend_1 = require("resend");
(0, dotenv_1.config)();
exports.resend = new resend_1.Resend(config_1.envConfig.api_key_resend);
const verifyEmailTemplate = fs_1.default.readFileSync(path_1.default.resolve("src/template/verify-email.html"), "utf8");
const orderBuyTemplate = fs_1.default.readFileSync(path_1.default.resolve("src/template/order-customer.html"), "utf8");
const sendVerifyRegisterEmail = (toAddress, emailVerifyToken, template = verifyEmailTemplate) => {
    const html = template
        .replace("{{title}}", "Vui lòng xác minh email của bạn")
        .replace("{{content}}", "Nhấp vào nút bên dưới để xác minh email của bạn")
        .replace("{{titleLink}}", "Verify")
        .replace("{{link}}", `${config_1.envConfig.client_url}/verify-email?token=${emailVerifyToken}`);
    return exports.resend.emails.send({
        from: config_1.envConfig.resend_email_from,
        to: toAddress,
        subject: "Verify your email",
        html
    });
};
exports.sendVerifyRegisterEmail = sendVerifyRegisterEmail;
const sendForgotPasswordToken = (toAddress, forgotPasswordToken, template = verifyEmailTemplate) => {
    const html = template
        .replace("{{title}}", "Vui lòng đặt lại mật khẩu của bạn")
        .replace("{{content}}", "Nhấp vào nút bên dưới để đặt lại mật khẩu của bạn")
        .replace("{{titleLink}}", "Đặt lại")
        .replace("{{link}}", `${config_1.envConfig.client_url}/forgot-password?token=${forgotPasswordToken}`);
    return exports.resend.emails.send({
        from: config_1.envConfig.resend_email_from,
        to: toAddress,
        subject: "Reset your password",
        html
    });
};
exports.sendForgotPasswordToken = sendForgotPasswordToken;
const sendNotificationOrderBuyCustomer = (toAddress, order, template = orderBuyTemplate) => {
    const html = template
        .replace("{{orderId}}", order.id)
        .replace("{{orderDate}}", order.createdAt)
        .replace("{{customerName}}", order.customerName)
        .replace("{{customerPhone}}", order.customerPhone)
        .replace("{{shippingAddress}}", order.shippingAddress)
        .replace("{{totalAmount}}", order.totalAmount)
        .replace("{{orderLink}}", `${config_1.envConfig.client_url}/login`);
    return exports.resend.emails.send({
        from: config_1.envConfig.resend_email_from,
        to: toAddress,
        subject: `Đặt hàng thành công - TECHZONE xác nhận đơn hàng #${order.id}`,
        html
    });
};
exports.sendNotificationOrderBuyCustomer = sendNotificationOrderBuyCustomer;
// gửi email lên form -> gửi mail về email đó -> từ email navigate qua web với url "/forgot-password" -> lấy ra token -> chạy vào "/verify-forgot-password" -> để kiểm tra -> cuối cùng reset password với "/reset-password"
