import { Router } from "express"
import {
  addProductToCartController,
  addProductToFavouriteController,
  getCollectionsCartController,
  getCollectionsController,
  getCollectionsFavouriteController,
  removeProductToCartController
} from "~/controllers/collections.controllers"
import { getCollectionValidator } from "~/middlewares/collection.middlewares"
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const collectionsRoute = Router()

/**
 * Description: Tạo danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.post(
  "/favourite",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(addProductToFavouriteController)
)

/**
 * Description: Lấy danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.get(
  "/favourite",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getCollectionsFavouriteController)
)

/**
 * Description: Tạo danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.post(
  "/cart",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(addProductToCartController)
)

/**
 * Description: Lấy danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.get(
  "/cart",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getCollectionsCartController)
)

/**
 * Description: Lấy danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.delete(
  "/cart/:id",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(removeProductToCartController)
)

/**
 * Description: Lấy danh sách sản phẩm dựa vào /:slug
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/:slug", getCollectionValidator, wrapRequestHandler(getCollectionsController))

export default collectionsRoute
