import { GenderType } from "~/constant/enum"

export type RegisterReqBody = {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
  sex: GenderType
}
