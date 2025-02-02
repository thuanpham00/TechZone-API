import { Media } from "~/constant/common"

export type CreateProductBodyReq = {
  name: string
  category: string
  brand: string
  price: number
  description: string
  discount: number
  isFeatured: boolean
}
