import { Router } from "express"
import { RoleType } from "~/constant/enum"
import {
  createBrandController,
  createCategoryController,
  deleteBrandController,
  deleteCategoryController,
  deleteCustomerController,
  getBrandDetailController,
  getBrandsController,
  getCategoriesController,
  getCategoryDetailController,
  getCustomerDetailController,
  getCustomersController,
  getNameBrandsController,
  getNameCategoriesController,
  getProductController,
  getStatisticalController,
  updateBrandDetailController,
  updateCategoryDetailController,
  updateCustomerDetailController
} from "~/controllers/admin.controllers"
import {
  checkBrandValidator,
  checkCategoryValidator,
  checkIdValidator,
  deleteBrandValidator,
  deleteCategoryValidator,
  getBrandsValidator,
  queryValidator,
  updateCategoryValidator
} from "~/middlewares/admin.middlewares"
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
 * Query: {limit: number, page: number, name?: string, email?: string, phone?: string}
 */
adminRouter.get(
  "/customers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  queryValidator,
  wrapRequestHandler(getCustomersController)
)

/**
 * Description: get customer
 * Path: /customers/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
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
 * Description: update customer
 * Path: /customers/:id
 * Method: PATCH
 * Headers: {Authorization: AT}
 * Params: {id: string}
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
 * Description: delete customer
 * Path: /customers/:id
 * Method: DELETE
 * Headers: {Authorization: AT}
 * Params: {id: string}
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
 * Description: create category
 * Path: /categories
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: createCategoryBodyReq
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
 * Description: get list category
 * Path: /categories
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string}
 */
adminRouter.get(
  "/categories",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  queryValidator,
  wrapRequestHandler(getCategoriesController)
)

/**
 * Description: get category
 * Path: /categories/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
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
 * Description: get name category filter
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get(
  "/name-categories",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getNameCategoriesController)
)

/**
 * Description: update category detail
 * Path: /categories/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateCategoryBodyReq
 */
adminRouter.patch(
  "/categories/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  updateCategoryValidator,
  filterMiddleware<UpdateCategoryBodyReq>(["name"]),
  checkCategoryValidator,
  wrapRequestHandler(updateCategoryDetailController)
)

/**
 * Description: delete category
 * Path: /categories/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete(
  "/categories/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  deleteCategoryValidator,
  wrapRequestHandler(deleteCategoryController)
)

/**
 * Description: create category
 * Path: /brands
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: UpdateBrandBodyReq
 */
adminRouter.post(
  "/brands",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkBrandValidator,
  wrapRequestHandler(createBrandController)
)

/**
 * Description: get list brand
 * Path: /categories/:id
 * Method: get
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, id: string, name?: string}
 */
adminRouter.get(
  "/brands",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  queryValidator,
  getBrandsValidator,
  wrapRequestHandler(getBrandsController)
)

/**
 * Description: get brand
 * Path: /brands/:id
 * Method: get
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get(
  "/brands/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(getBrandDetailController)
)

/**
 * Description: get name brand filter
 * Path: /name-brands
 * Method: GET
 */
adminRouter.get(
  "/name-brands",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getNameBrandsController)
)

/**
 * Description: update brand detail
 * Path: /brands/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateBrandsBodyReq
 */
adminRouter.patch(
  "/brands/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  updateCategoryValidator,
  filterMiddleware<UpdateCategoryBodyReq>(["name"]),
  checkBrandValidator,
  wrapRequestHandler(updateBrandDetailController)
)

/**
 * Description: delete brand
 * Path: /brands/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete(
  "/brands/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  deleteBrandValidator,
  wrapRequestHandler(deleteBrandController)
)

/**
 * Description: get list product
 * Path: /products
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number}
 */
adminRouter.get(
  "/products",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  queryValidator,
  wrapRequestHandler(getProductController)
)

// nếu category này đã có các thương hiệu thì không thể thực hiện xóa
// còn nếu category này chưa có thương hiệu nào thì có thể thực hiện xóa

export default adminRouter
