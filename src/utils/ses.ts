import { config } from "dotenv"
import fs from "fs"
import path from "path"
import { envConfig } from "./config"
import { Resend } from "resend"
config()

export const resend = new Resend(envConfig.api_key_resend)

const verifyEmailTemplate = fs.readFileSync(path.resolve("src/template/verify-email.html"), "utf8")
const orderBuyTemplate = fs.readFileSync(path.resolve("src/template/order-customer.html"), "utf8")

export const sendVerifyRegisterEmail = (
  toAddress: string,
  emailVerifyToken: string,
  template: string = verifyEmailTemplate
) => {
  const html = template
    .replace("{{title}}", "Vui lòng xác minh email của bạn")
    .replace("{{content}}", "Nhấp vào nút bên dưới để xác minh email của bạn")
    .replace("{{titleLink}}", "Verify")
    .replace("{{link}}", `${envConfig.client_url}/verify-email?token=${emailVerifyToken}`)

  return resend.emails.send({
    from: envConfig.resend_email_from,
    to: toAddress,
    subject: "Verify your email",
    html
  })
}

export const sendForgotPasswordToken = (
  toAddress: string,
  forgotPasswordToken: string,
  template: string = verifyEmailTemplate
) => {
  const html = template
    .replace("{{title}}", "Vui lòng đặt lại mật khẩu của bạn")
    .replace("{{content}}", "Nhấp vào nút bên dưới để đặt lại mật khẩu của bạn")
    .replace("{{titleLink}}", "Đặt lại")
    .replace("{{link}}", `${envConfig.client_url}/forgot-password?token=${forgotPasswordToken}`)

  return resend.emails.send({
    from: envConfig.resend_email_from,
    to: toAddress,
    subject: "Reset your password",
    html
  })
}

export const sendNotificationOrderBuyCustomer = (
  toAddress: string,
  order: any,
  template: string = orderBuyTemplate
) => {
  const html = template
    .replace("{{orderId}}", order.id)
    .replace("{{orderDate}}", order.createdAt)
    .replace("{{customerName}}", order.customerName)
    .replace("{{customerPhone}}", order.customerPhone)
    .replace("{{shippingAddress}}", order.shippingAddress)
    .replace("{{totalAmount}}", order.totalAmount)
    .replace("{{orderLink}}", `${envConfig.client_url}/login`)

  return resend.emails.send({
    from: envConfig.resend_email_from,
    to: toAddress,
    subject: `Đặt hàng thành công - TECHZONE xác nhận đơn hàng #${order.id}`,
    html
  })
}
// gửi email lên form -> gửi mail về email đó -> từ email navigate qua web với url "/forgot-password" -> lấy ra token -> chạy vào "/verify-forgot-password" -> để kiểm tra -> cuối cùng reset password với "/reset-password"
