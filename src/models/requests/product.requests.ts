export type CreateProductBodyReq = {
  name: string
  category: string
  brand: string
  price: number
  description: string
  discount: number
  isFeatured: boolean
}

export type GetCollectionReq = {
  limit: string
  page: string
}
