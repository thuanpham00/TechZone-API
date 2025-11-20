import { ObjectId } from "mongodb"
import { EmployeeInfoStatus, UserVerifyStatus } from "~/constant/enum"

export type UserType = {
  _id?: ObjectId
  name?: string

  email: string
  password: string
  role: ObjectId

  numberPhone?: string
  date_of_birth?: Date
  avatar?: string
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus

  employeeInfo?: {
    department: string // phòng ban
    hire_date: Date // ngày vào làm
    contract_type: string // loại hợp đồng
    salary: number // lương
    status: EmployeeInfoStatus
  }

  created_at?: Date
  updated_at?: Date
}

export class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: ObjectId
  numberPhone: string
  date_of_birth: Date
  avatar: string
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus

  employeeInfo?: {
    department: string // phòng ban
    hire_date: Date // ngày vào làm
    contract_type: string // loại hợp đồng
    salary: number // lương
    status: EmployeeInfoStatus
  }

  created_at: Date
  updated_at: Date
  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id
    this.name = user.name || ""
    this.email = user.email
    this.password = user.password
    this.role = user.role
    this.numberPhone = user.numberPhone || ""
    this.date_of_birth = user.date_of_birth || new Date(1990, 0, 1)
    this.avatar = user.avatar || ""
    this.email_verify_token = user.email_verify_token || ""
    this.forgot_password_token = user.forgot_password_token || ""
    this.verify = user.verify || UserVerifyStatus.Unverified

    this.employeeInfo = user.employeeInfo

    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
  }
}
