import { Request, Response, NextFunction } from "express"
import { ProductMessage } from "~/constant/message"
import { productServices } from "~/services/product.services"

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body)
  const result = await productServices.createProduct(req.body)
  res.json({
    message: ProductMessage.CREATE_PRODUCT_SUCCESS,
    result
  })
}
