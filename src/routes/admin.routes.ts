import { Router } from "express"
import { RoleType } from "~/constant/enum"
import {
  createCategoryController,
  deleteCustomerController,
  getBrandsController,
  getCategoriesController,
  getCategoryDetailController,
  getCustomerDetailController,
  getCustomersController,
  getStatisticalController,
  updateCategoryDetailController,
  updateCustomerDetailController
} from "~/controllers/admin.controllers"
import { checkCategoryValidator, checkIdValidator, getBrandsValidator, updateCategoryValidator } from "~/middlewares/admin.middlewares"
import { filterMiddleware } from "~/middlewares/common.middlewares"
import { accessTokenValidator, checkRole, updateMeValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import { UpdateCategoryBodyReq } from "~/models/requests/admin.requests"
import { updateMeReqBody } from "~/models/requests/user.requests"
import { wrapRequestHandler } from "~/utils/handlers"

const adminRouter = Router()

/**
 * Description: get statistical dashboard
 * Path: /statistical
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/statistical",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getStatisticalController)
)

/**
 * Description: get list customer
 * Path: /customers
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, skip: number, name: string, email: string, phone: string}
 */
adminRouter.get(
  "/customers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getCustomersController)
)

/**
 * Description: get customer detail
 * Path: /customers/:id
 * Method: GET
 * Headers: {Authorization: AT}
 *
 */
adminRouter.get(
  "/customers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(getCustomerDetailController)
)

/**
 * Description: update customer detail
 * Path: /customers/:id
 * Method: PATCH
 * Headers: {Authorization: AT}
 * Body: updateMeReqBody
 */
adminRouter.patch(
  "/customers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  updateMeValidator,
  filterMiddleware<updateMeReqBody>(["date_of_birth", "name", "numberPhone", "avatar"]),
  wrapRequestHandler(updateCustomerDetailController)
)

/**
 * Description: delete profile customer id
 * Path: /customers/:id
 * Method: DELETE
 * Headers: {Authorization: AT}
 */
adminRouter.delete(
  "/customers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(deleteCustomerController)
)

/**
 * Description: get list category
 * Path: /categories
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, skip: number}
 */
adminRouter.get(
  "/categories",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getCategoriesController)
)

/**
 * Description: create category
 * Path: /categories
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: UpdateCategoryBodyReq
 */
adminRouter.post(
  "/categories",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkCategoryValidator,
  wrapRequestHandler(createCategoryController)
)

/**
 * Description: get category detail
 * Path: /categories/:id
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/categories/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(getCategoryDetailController)
)

/**
 * Description: update category detail
 * Path: /categories/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * body: UpdateCategoryBodyReq
 */
adminRouter.patch(
  "/categories/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  updateCategoryValidator,
  checkCategoryValidator,
  filterMiddleware<UpdateCategoryBodyReq>(["name"]),
  wrapRequestHandler(updateCategoryDetailController)
)

/**
 * Description: get brands
 * Path: /categories/:id
 * Method: get
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/brands/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  getBrandsValidator,
  wrapRequestHandler(getBrandsController)
)

// nếu category này đã có các thương hiệu thì không thể thực hiện xóa
// còn nếu category này chưa có thương hiệu nào thì có thể thực hiện xóa

export default adminRouter
