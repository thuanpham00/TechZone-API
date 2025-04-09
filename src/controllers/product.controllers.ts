import { Request, Response, NextFunction } from "express"
import { ProductMessage } from "~/constant/message"
import { productServices } from "~/services/product.services"

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await productServices.createProduct(req.body)
  res.json({
    message: ProductMessage.CREATE_PRODUCT_SUCCESS,
    result
  })
}

export const getProductDetailController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await productServices.getProductDetail(req.params.id)
  res.json({
    message: ProductMessage.GET_PRODUCT_SUCCESS,
    result
  })
}

export const getProductRelatedController = async (req: Request, res: Response, next: NextFunction) => {
  const { brand, category, idProduct } = req.query
  const result = await productServices.getProductRelated(brand as string, category as string, idProduct as string)
  res.json({
    message: ProductMessage.GET_PRODUCT_RELATED_SUCCESS,
    result
  })
}
