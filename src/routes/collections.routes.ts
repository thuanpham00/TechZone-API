import { Router } from "express"
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
import { accessTokenValidator, optionalAccessTokenValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
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
 * Description: Thêm sản phẩm vào giỏ hàng (Guest OK, không bắt login)
 * Path: /cart
 * Method: POST
 */
collectionsRoute.post("/cart", optionalAccessTokenValidator, wrapRequestHandler(addProductToCartController))

/**
 * Description: Cập nhật số lượng sản phẩm trong giỏ hàng (Guest OK)
 * Path: /cart
 * Method: PUT
 */
collectionsRoute.put("/cart", optionalAccessTokenValidator, wrapRequestHandler(updateQuantityProductInCartController))

/**
 * Description: Xóa toàn bộ giỏ hàng (Guest OK)
 * Path: /cart
 * Method: DELETE
 */
collectionsRoute.delete("/cart", optionalAccessTokenValidator, wrapRequestHandler(clearProductInCartController))

/**
 * Description: Lấy danh sách sản phẩm trong giỏ hàng (Guest OK + Authenticated)
 * Path: /cart
 * Method: GET
 */
collectionsRoute.get("/cart", optionalAccessTokenValidator, wrapRequestHandler(getCollectionsCartController))

/**
 * Description: Xóa 1 sản phẩm trong giỏ hàng (Guest OK)
 * Path: /cart/:id
 * Method: DELETE
 */
collectionsRoute.delete("/cart/:id", optionalAccessTokenValidator, wrapRequestHandler(removeProductToCartController))

/**
 * Description: Lấy danh sách sản phẩm dựa vào /:slug
 * Path: /
 * Method: GET
 */
collectionsRoute.get("/:slug", getCollectionValidator, wrapRequestHandler(getCollectionsController))

export default collectionsRoute
