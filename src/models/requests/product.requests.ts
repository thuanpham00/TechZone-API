import { File } from "formidable"

export type CreateProductBodyReq = {
  name: string
  category: string
  brand: string
  price: number
  discount: number
  stock: number
  isFeatured: string
  description: string
  banner: File
  medias: File[]
  specifications: specificationType[]
}

export type CreateSupplierBodyReq = {
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  taxCode: string
  description?: string
}

export type CreateSupplyBodyReq = {
  productId: string
  supplierId: string
  importPrice: number
  warrantyMonths: number
  leadTimeDays: number
  description: string
}

export type GetCollectionReq = {
  limit: string
  page: string
}

export type ConditionQuery = {
  brand?: string
  category?: string
  price?: { $gte?: number; $lt?: number }
}

export type specificationType = {
  name: string
  value: string | number
}
