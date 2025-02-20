import { Router } from "express"
import { RoleType } from "~/constant/enum"
import {
  getCategoriesController,
  getCustomerController,
  getCustomersController,
  getStatisticalController,
  updateCustomerController
} from "~/controllers/admin.controllers"
import { filterMiddleware } from "~/middlewares/common.middlewares"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
import { updateMeReqBody } from "~/models/requests/user.requests"
import { wrapRequestHandler } from "~/utils/handlers"

const adminRouter = Router()

/**
 * Description: get statistical dashboard
 * Path: /statisticals
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
 * Params: {limit: number, skip: number}
 */
adminRouter.get(
  "/customers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getCustomersController)
)

/**
 * Description: get customer id
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
  wrapRequestHandler(getCustomerController)
)

/**
 * Description: update profile customer id
 * Path: /customers/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: updateMeReqBody
 */
adminRouter.patch(
  "/customers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  filterMiddleware<updateMeReqBody>(["date_of_birth", "name", "numberPhone"]),
  wrapRequestHandler(updateCustomerController)
)

/**
 * Description: get list category
 * Path: /categories
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {limit: number, skip: number}
 */
adminRouter.get(
  "/categories",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getCategoriesController)
)

export default adminRouter
