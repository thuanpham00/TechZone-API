import { ObjectId } from "mongodb"
import { StatusEmailResend, TypeEmailResend } from "~/constant/enum"
import { envConfig } from "~/utils/config"

interface EmailLogType {
  _id?: ObjectId // MongoDB ObjectId
  to: string // Người nhận
  from?: string // Người gửi
  subject: string // Tiêu đề email

  type: TypeEmailResend // Loại email
  status: StatusEmailResend // Trạng thái gửi email
  resend_id: string // ID từ dịch vụ Resend (nếu có)

  created_at?: Date
}

export class EmailLog {
  _id?: ObjectId
  to: string
  from: string
  subject: string

  type: TypeEmailResend
  status: StatusEmailResend
  resend_id: string

  created_at: Date

  constructor(emailLog: EmailLogType) {
    this._id = emailLog._id || new ObjectId()
    this.from = emailLog.from || envConfig.resend_email_from
    this.to = emailLog.to
    this.subject = emailLog.subject
    this.type = emailLog.type
    this.status = emailLog.status
    this.resend_id = emailLog.resend_id
    this.created_at = new Date()
  }
}
