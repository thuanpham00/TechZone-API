export type CreateProductBodyReq = {
  name: string
  category: string
  brand: string
  price: number
  description: string
  discount: number
  isFeatured: boolean,
  specifications: specificationType[]
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
