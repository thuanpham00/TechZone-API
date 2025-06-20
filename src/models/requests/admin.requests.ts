export type UpdateCategoryBodyReq = {
  name: string
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
  dateOfBirth: string
  password: string
  confirmPassword: string
  avatar?: string
}
