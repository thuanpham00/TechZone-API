import { Request, Response, NextFunction } from "express"
import { CollectionMessage } from "~/constant/message"
import collectionServices from "~/services/collection.services"
import { ParamsDictionary } from "express-serve-static-core"
import { GetCollectionReq } from "~/models/requests/product.requests"
import { getValueObject } from "~/utils/common"

export const slugConditionMap = {
  "laptop-asus-hoc-tap-va-lam-viec": { brand: "ASUS", category: "Laptop" },
  "laptop-acer-hoc-tap-va-lam-viec": { brand: "ACER", category: "Laptop" },
  "laptop-msi-hoc-tap-va-lam-viec": { brand: "MSI", category: "Laptop" },
  "laptop-lenovo-hoc-tap-va-lam-viec": { brand: "LENOVO", category: "Laptop" },

  "laptop-duoi-15-trieu": { price: { $lt: 15000000 }, category: "Laptop" },
  "laptop-tu-15-den-20-trieu": { price: { $gte: 15000000, $lt: 20000000 }, category: "Laptop" },
  "laptop-tren-20-trieu": { price: { $gte: 20000000 }, category: "Laptop" }
}

export const getCollectionsController = async (
  req: Request<ParamsDictionary, any, any, GetCollectionReq>,
  res: Response,
  next: NextFunction
) => {
  const { slug } = req.params
  const { page, limit } = req.query
  const condition = (slugConditionMap as Record<string, any>)[slug]
  const { result, total } = await collectionServices.getCollection(condition, Number(page), Number(limit))
  res.json({
    message: CollectionMessage.GET_COLLECTION_IS_SUCCESS,
    result,
    total
  })
}
