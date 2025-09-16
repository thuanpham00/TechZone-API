import { Router } from "express"
import { ObjectId } from "mongodb"
import {
  addProductToCartController,
  addProductToFavouriteController,
  clearProductInCartController,
  getCollectionsCartController,
  getCollectionsController,
  getCollectionsFavouriteController,
  getFilterBaseOnCategory,
  removeProductToCartController,
  updateQuantityProductInCartController
} from "~/controllers/collections.controllers"
import { getCollectionValidator } from "~/middlewares/collection.middlewares"
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import databaseServices from "~/services/database.services"
import { wrapRequestHandler } from "~/utils/handlers"

const collectionsRoute = Router()

/**
 * Description: get bộ lọc theo danh mục
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/filters", wrapRequestHandler(getFilterBaseOnCategory))

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
 * Description: Tạo danh sách sản phẩm  trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
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
 * Description: Cập nhật số lượng sản phẩm trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.put(
  "/cart",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(updateQuantityProductInCartController)
)

/**
 * Description: Tạo danh sách sản phẩm yêu thích của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
 * Path: /
 * Method: GET
 */
collectionsRoute.delete(
  "/cart",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(clearProductInCartController)
)

/**
 * Description: Lấy danh sách sản phẩm trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
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
 * Description:xóa 1 sản phẩm trong giỏ hàng của 1 user_id (mỗi user_id chỉ có 1 danh sách yêu thích)
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
