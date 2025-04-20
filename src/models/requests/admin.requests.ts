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
