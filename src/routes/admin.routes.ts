import { Router } from "express"
import { RoleType } from "~/constant/enum"
import { getCustomerController, getCustomersController, getStatisticalController } from "~/controllers/admin.controllers"
import { accessTokenValidator, checkRole, verifyUserValidator } from "~/middlewares/user.middlewares"
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
 */
adminRouter.get(
  "/customers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  wrapRequestHandler(getCustomerController)
)

export default adminRouter
