import { Router } from "express"
import {
  getBannerBaseOnSlugController,
  getCategoryListIsActiveController,
  getListCategoryMenuIsActiveController
} from "~/controllers/category.controllers"
import { wrapRequestHandler } from "~/utils/handlers"

const categoryClientRoute = Router()

/**
 * Description: Lấy danh sách category đang hoạt động (hiển thị cho client)
 * Path: /
 * Method: GET
 */
categoryClientRoute.get("/", wrapRequestHandler(getCategoryListIsActiveController))

/**
 * Description: Lấy danh sách menu category đang hoạt động (hiển thị cho client)
 * Path: /list-menu-category
 * Method: GET
 */
categoryClientRoute.get("/list-menu-category", wrapRequestHandler(getListCategoryMenuIsActiveController))

/**
 * Description: Lấy danh sách menu category đang hoạt động (hiển thị cho client)
 * Path: /list-menu-category
 * Method: GET
 */
categoryClientRoute.get("/banner", wrapRequestHandler(getBannerBaseOnSlugController))

export default categoryClientRoute
