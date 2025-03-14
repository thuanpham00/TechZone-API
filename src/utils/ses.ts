import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { config } from "dotenv"
import fs from "fs";
import path from "path";
config()

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
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
  })
}

const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject 
  })

  return sesClient.send(sendEmailCommand)
}

const verifyEmailTemplate = fs.readFileSync(path.resolve("src/template/verify-email.html"), "utf8")

export const sendVerifyRegisterEmail = (
  toAddress: string,
  emailVerifyToken: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    "Verify your email",
    template
      .replace("{{title}}", "Please verify your email")
      .replace("{{content}}", "Click the button below to verify your email")
      .replace("{{titleLink}}", "Verify")
      .replace("{{link}}", `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`)
  )
}

export const sendForgotPasswordToken = (
  toAddress: string,
  forgotPasswordToken: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    "Verify your email",
    template
      .replace("{{title}}", "Please reset your password")
      .replace("{{content}}", "Click the button below to reset your password")
      .replace("{{titleLink}}", "Reset")
      .replace("{{link}}", `${process.env.CLIENT_URL}/forgot-password?token=${forgotPasswordToken}`)
  )
}

// gửi email lên form -> gửi mail về email đó -> từ email navigate qua web với url "/forgot-password" -> lấy ra token -> chạy vào "/verify-forgot-password" -> để kiểm tra -> cuối cùng reset password với "/reset-password"