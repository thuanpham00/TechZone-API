import { EmployeeInfoStatus } from "~/constant/enum"

export type UpdateCategoryBodyReq = {
  name: string,
  is_active: Boolean
  desc: string
}

export type UpdateBrandBodyReq = {
  name: string
  categoryId: string
}

export type UpdateSupplierBodyReq = {
  name?: string
  contactName?: string
  email?: string
  phone?: string
  description?: string
  address?: string
}

export type UpdateSupplyBodyReq = {
  productId?: string
  supplierId?: string
  importPrice?: number
  warrantyMonths?: number
  leadTimeDays?: number
  description?: string
}

export type CreateCustomerBodyReq = {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  password: string
  confirmPassword: string
  role: string
  avatar?: string
}

export type CreateStaffBodyReq = {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth: string
  password: string
  confirmPassword: string
  role: string  

  department: string
  contract_type: string
  hire_date: string
  salary: number
  status: EmployeeInfoStatus
  avatar?: string
}
