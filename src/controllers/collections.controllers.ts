import { Request, Response, NextFunction } from "express"
import { CollectionMessage } from "~/constant/message"
import collectionServices from "~/services/collection.services"
import { ParamsDictionary } from "express-serve-static-core"
import { CreateFavouriteBodyReq, GetCollectionReq } from "~/models/requests/product.requests"
import { getValueObject } from "~/utils/common"
import { TokenPayload } from "~/models/requests/user.requests"
import { ProductInFavourite } from "~/models/schema/favourite.schema"

export const slugConditionMap = {
  "laptop-asus-hoc-tap-va-lam-viec": { brand: "ASUS", category: "Laptop" },
  "laptop-acer-hoc-tap-va-lam-viec": { brand: "ACER", category: "Laptop" },
  "laptop-msi-hoc-tap-va-lam-viec": { brand: "MSI", category: "Laptop" },
  "laptop-lenovo-hoc-tap-va-lam-viec": { brand: "LENOVO", category: "Laptop" },
  "laptop-duoi-15-trieu": { price: { $lt: 15000000 }, category: "Laptop" },
  "laptop-tu-15-den-20-trieu": { price: { $gte: 15000000, $lt: 20000000 }, category: "Laptop" },
  "laptop-tren-20-trieu": { price: { $gte: 20000000 }, category: "Laptop" },
  "top-10-laptop-ban-chay": { category: "Laptop" },

  "top-10-laptop-gaming-ban-chay": { category: "Laptop Gaming" },
  "laptop-gaming-asus": { category: "Laptop Gaming", brand: "ASUS" },
  "laptop-gaming-acer": { category: "Laptop Gaming", brand: "ACER" },
  "laptop-gaming-msi": { category: "Laptop Gaming", brand: "MSI" },
  "laptop-gaming-lenovo": { category: "Laptop Gaming", brand: "LENOVO" },
  "laptop-gaming-duoi-20-trieu": { price: { $lt: 20000000 }, category: "Laptop Gaming" },
  "laptop-gaming-tu-20-den-25-trieu": { price: { $gte: 20000000, $lt: 25000000 }, category: "Laptop Gaming" },
  "laptop-gaming-tren-25-trieu": { price: { $gte: 25000000 }, category: "Laptop Gaming" },

  "pc-gvn-rtx-5090": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5080": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5070Ti": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5060Ti": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-5060": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-4060": { category: "PC GVN", brand: "GVN" },
  "pc-gvn-rtx-3060": { category: "PC GVN", brand: "GVN" },
  "top-10-pc-ban-chay": { category: "PC GVN" },

  "top-10-man-hinh-ban-chay": { category: "Màn hình" },
  "man-hinh-samsung": { category: "Màn hình", brand: "SAMSUNG" },
  "man-hinh-asus": { category: "Màn hình", brand: "ASUS" },
  "man-hinh-dell": { category: "Màn hình", brand: "DELL" },
  "man-hinh-duoi-5-trieu": { price: { $lt: 5000000 }, category: "Màn hình" },
  "man-hinh-tu-5-den-10-trieu": { price: { $gte: 5000000, $lt: 10000000 }, category: "Màn hình" },
  "man-hinh-tu-10-den-20-trieu": { price: { $gte: 10000000, $lt: 20000000 }, category: "Màn hình" },
  "man-hinh-tren-20-trieu": { price: { $gte: 20000000 }, category: "Màn hình" }
}

export const getCollectionsController = async (
  req: Request<ParamsDictionary, any, any, GetCollectionReq>,
  res: Response,
  next: NextFunction
) => {
  const { slug } = req.params
  const condition = (slugConditionMap as Record<string, any>)[slug]
  const { result, total } = await collectionServices.getCollection(condition, slug)
  res.json({
    message: CollectionMessage.GET_COLLECTION_IS_SUCCESS,
    result,
    total
  })
}

export const getCollectionsFavouriteController = async (
  req: Request<ParamsDictionary, any, any, GetCollectionReq>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { products, total } = await collectionServices.getFavouriteCollection(user_id)
  res.json({
    message: CollectionMessage.GET_COLLECTION_FAVOURITE_IS_SUCCESS,
    result: {
      products,
      total
    }
  })
}

export const createCollectionsFavouriteController = async (
  req: Request<ParamsDictionary, any, ProductInFavourite>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { message } = await collectionServices.createFavouriteCollection(user_id, req.body)
  res.json({
    message: message
  })
}
