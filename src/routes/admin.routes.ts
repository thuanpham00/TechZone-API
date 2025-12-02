import { Router } from "express"
import {
  addMenuCategoryController,
  createBrandController,
  createCategoryController,
  createCustomerController,
  createLinkCategoryMenuController,
  createProductController,
  createReceiptController,
  createRoleController,
  createStaffController,
  createSupplierController,
  createSupplyController,
  createVoucherController,
  deleteBrandController,
  deleteCategoryController,
  deleteCustomerController,
  deleteLinkCategoryMenuController,
  deleteMenuCategoryController,
  deleteProductController,
  deleteReceiptController,
  deleteReviewOrderController,
  deleteRoleController,
  deleteSupplierController,
  deleteSupplyController,
  deleteVoucherController,
  getBrandsController,
  getCategoriesController,
  getCustomersController,
  getMenuByCategoryIdController,
  getNameBrandsController,
  getNameCategoriesController,
  getNameProductsController,
  getNameSuppliersController,
  getNameSuppliersLinkedToProductController,
  getNameSuppliersNotLinkedToProductController,
  getOrdersInCanceledController,
  getOrdersInCompletedController,
  getOrdersInProcessController,
  getPermissionForUserController,
  getPermissionsBasedOnIdRoleController,
  getPermissionsController,
  getPricePerUnitBasedOnProductAndSupplierController,
  getPriceProductController,
  getProductController,
  getReceiptsController,
  getReviewsOrdersController,
  getRolesController,
  getStaffsController,
  getStatistical_Product_Controller,
  getStatistical_Sell_Controller,
  getStatistical_User_Controller,
  getSuppliersController,
  getSuppliesController,
  getVouchersController,
  getVouchersOrdersController,
  updateBrandDetailController,
  updateCategoryDetailController,
  updateCustomerDetailController,
  updateGroupNameMenuController,
  updateLinkCategoryMenuController,
  updatePermissionsBasedOnIdRoleController,
  updateProductController,
  updateReceiptController,
  updateRoleController,
  updateStatusOrderController,
  updateSupplierDetailController,
  updateSupplyDetailController,
  updateVoucherController
} from "~/controllers/admin.controllers"
import { loginController } from "~/controllers/user.controllers"
import {
  checkBrandValidator,
  checkCategoryValidator,
  checkEmailExistValidator,
  checkIdValidator,
  checkRoleExitsValidator,
  createProductValidator,
  createReceiptValidator,
  createSupplierValidator,
  createSupplyValidator,
  createVoucherValidator,
  deleteBrandValidator,
  deleteCategoryValidator,
  deleteCheckStockProductValidator,
  deleteRoleValidator,
  deleteSupplierValidator,
  getBrandsValidator,
  getProductIdAndSupplierIdValidator,
  getProductIdFromProductNameValidator,
  queryValidator,
  updateCategoryValidator,
  updateProductValidator,
  updateSupplierValidator,
  updateSupplyValidator,
  updateVoucherValidator
} from "~/middlewares/admin.middlewares"
import { filterMiddleware, parseFormData } from "~/middlewares/common.middlewares"
import {
  accessTokenValidator,
  checkRole,
  checkUserLogin,
  loginValidator,
  updateMeValidator,
  updateStaffValidator,
  verifyUserValidator
} from "~/middlewares/user.middlewares"
import { UpdateCategoryBodyReq, UpdateSupplierBodyReq, UpdateSupplyBodyReq } from "~/models/requests/admin.requests"
import { updateMeReqBody } from "~/models/requests/user.requests"
import { wrapRequestHandler } from "~/utils/handlers"

const adminRouter = Router()

/**
 * Description: Get permissions for user
 * Path: /permission-for-user
 * Method: GET
 */
adminRouter.get(
  "/permission-for-user",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getPermissionForUserController)
)

/**
 * Description: Login user for admin
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string}
 */
adminRouter.post("/login", loginValidator, checkUserLogin("other"), wrapRequestHandler(loginController))

/**
 * Description: get statistical sell dashboard
 * Path: /statistical-sell
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/statistical-sell",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getStatistical_Sell_Controller)
)

/**
 * Description: get statistical product dashboard
 * Path: /statistical-product
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/statistical-product",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getStatistical_Product_Controller)
)

/**
 * Description: get statistical user dashboard
 * Path: /statistical-user
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/statistical-user",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getStatistical_User_Controller)
)

/**
 * Description: create customer
 * Path: /customers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: createCustomerBodyReq
 */
adminRouter.post(
  "/customers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkEmailExistValidator,
  wrapRequestHandler(createCustomerController)
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
  checkRole(),
  queryValidator,
  wrapRequestHandler(getCustomersController)
)

/**
 * Description: update customer
 * Path: /customers/:id
 * Method: PUT
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * Body: updateMeReqBody
 */
adminRouter.put(
  "/customers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
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
  checkRole(),
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
  checkRole(),
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
  checkRole(),
  queryValidator,
  wrapRequestHandler(getCategoriesController)
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
  wrapRequestHandler(getNameCategoriesController)
)

/**
 * Description: update category detail
 * Path: /categories/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateCategoryBodyReq
 */
adminRouter.put(
  "/categories/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  updateCategoryValidator,
  filterMiddleware<UpdateCategoryBodyReq>(["name", "is_active", "desc"]),
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
  checkRole(),
  checkIdValidator,
  deleteCategoryValidator,
  wrapRequestHandler(deleteCategoryController)
)

/**
 * Description: add menu category
 * Path: /name-categories
 * Method: POST
 */
adminRouter.post(
  "/category_menus/group",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(addMenuCategoryController)
)

/**
 * Description: add menu category
 * Path: /name-categories
 * Method: POST
 */
adminRouter.delete(
  "/category_menus/group/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(deleteMenuCategoryController)
)

/**
 * Description: get menu category by id category
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get(
  "/category_menus/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getMenuByCategoryIdController)
)

/**
 * Description: update name group category menu
 * Path: /category_menus/:id/name-group
 * Method: PUT
 */
adminRouter.put(
  "/category_menus/:id/name-group",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(updateGroupNameMenuController)
)

/**
 * Description: create link category menu
 * Path: /category_menus/:id/link
 * Method: POST
 */
adminRouter.post(
  "/category_menus/:id/link",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(createLinkCategoryMenuController)
)

/**
 * Description: delete link category menu
 * Path: /category_links/:id
 * Method: DELETE
 */
adminRouter.put(
  "/category_links/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(updateLinkCategoryMenuController)
)

/**
 * Description: delete link category menu
 * Path: /category_links/:id
 * Method: DELETE
 */
adminRouter.delete(
  "/category_links/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(deleteLinkCategoryMenuController)
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
  checkRole(),
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
  checkRole(),
  queryValidator,
  getBrandsValidator,
  wrapRequestHandler(getBrandsController)
)

/**
 * Description: get name brand filter
 * Path: /name-brands
 * Method: GET
 */
adminRouter.get("/name-brands", accessTokenValidator, verifyUserValidator, wrapRequestHandler(getNameBrandsController))

/**
 * Description: update brand detail
 * Path: /brands/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateBrandsBodyReq
 */
adminRouter.put(
  "/brands/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
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
  checkRole(),
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
  checkRole(),
  queryValidator,
  wrapRequestHandler(getProductController)
)

/**
 * Description: Create product
 * Path: /products
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: CreateProductBodyReq }
 */
adminRouter.post(
  "/products",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  parseFormData,
  createProductValidator,
  wrapRequestHandler(createProductController)
)

/**
 * Description: update product by id
 * Path: /products/:id
 * Method: PUT
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: CreateProductBodyReq }
 */
adminRouter.put(
  "/products/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  parseFormData,
  updateProductValidator,
  wrapRequestHandler(updateProductController)
)

/**
 * Description: delete product by id
 * Path: /products/:id
 * Method: DELETE
 * Header: { Authorization: Bearer <accessToken> }
 */
adminRouter.delete(
  "/products/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  deleteCheckStockProductValidator,
  wrapRequestHandler(deleteProductController)
)

/**
 * Description: get name product filter
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get(
  "/name-products",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNameProductsController)
)

// nếu category này đã có các thương hiệu thì không thể thực hiện xóa
// còn nếu category này chưa có thương hiệu nào thì có thể thực hiện xóa

/**
 * Description: create supplier
 * Path: /suppliers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplierBodyReq
 */
adminRouter.post(
  "/suppliers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  createSupplierValidator,
  wrapRequestHandler(createSupplierController)
)

/**
 * Description: get list supplier
 * Path: /suppliers
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, phone?: string, email?: string, contactName?: string}
 */
adminRouter.get(
  "/suppliers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getSuppliersController)
)

/**
 * Description: get name supplier filter
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get(
  "/name-suppliers",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNameSuppliersController)
)

/**
 * Description: get name supplier based on name product (dùng trong tạo 1 liên kết cung ứng)
 * Ví dụ đã có 1 product A <=> supplier B rồi thì sẽ không có thêm 1 product A <=> 1 supplier B => được quyền cập nhật lại (mối quan hệ n-n)
 * Path: /name-suppliers-based-on-product
 * Method: GET
 */
adminRouter.get(
  "/not-linked-to-product",
  accessTokenValidator,
  verifyUserValidator,
  getProductIdFromProductNameValidator,
  wrapRequestHandler(getNameSuppliersNotLinkedToProductController)
)

/**
 * Description: lấy ra danh sách nhà cung cấp đã liên kết với sản phẩm này
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get(
  "/linked-to-product",
  accessTokenValidator,
  verifyUserValidator,
  getProductIdFromProductNameValidator,
  wrapRequestHandler(getNameSuppliersLinkedToProductController)
)

/**
 * Description: lấy ra danh sách nhà cung cấp đã liên kết với sản phẩm này
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get(
  "/get-pricePerUnit",
  accessTokenValidator,
  verifyUserValidator,
  getProductIdAndSupplierIdValidator,
  wrapRequestHandler(getPricePerUnitBasedOnProductAndSupplierController)
)

/**
 * Description: update supplier detail
 * Path: /suppliers/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateSupplierBodyReq
 */
adminRouter.put(
  "/suppliers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  updateSupplierValidator,
  filterMiddleware<UpdateSupplierBodyReq>(["address", "contactName", "email", "name", "phone", "description"]),
  wrapRequestHandler(updateSupplierDetailController)
)

/**
 * Description: delete supplier
 * Path: /suppliers/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete(
  "/suppliers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  deleteSupplierValidator,
  wrapRequestHandler(deleteSupplierController)
)

// 1 product sẽ có nhiều supplier và 1 supplier sẽ cung cấp nhiều product (n-n)
/**
 * Description: create supply for product with supplier
 * Path: /supplies
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.post(
  "/supplies",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  createSupplyValidator,
  wrapRequestHandler(createSupplyController)
)

/**
 * Description: get list supply
 * Path: /supplies
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, phone?: string, email?: string, contactName?: string}
 */
adminRouter.get(
  "/supplies",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getSuppliesController)
)

/**
 * Description: get selling price (lấy giá bán hiện tại của sản phẩm - phục vụ cho tạo cung ứng)
 * Path: /supplies
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {name: string}
 */
adminRouter.get(
  "/supplies/price-product",
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getPriceProductController)
)

/**
 * Description: update supply detail
 * Path: /suppliers/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateSupplierBodyReq
 */
adminRouter.put(
  "/supplies/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  updateSupplyValidator,
  filterMiddleware<UpdateSupplyBodyReq>([
    "productId",
    "supplierId",
    "importPrice",
    "warrantyMonths",
    "leadTimeDays",
    "description"
  ]),
  wrapRequestHandler(updateSupplyDetailController)
)

/**
 * Description: delete supply
 * Path: /suppliers/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete(
  "/supplies/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  wrapRequestHandler(deleteSupplyController)
)

/**
 * Description: get receipt for products
 * Path: /receipts
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get(
  "/receipts",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getReceiptsController)
)

/**
 * Description: create receipt for products
 * Path: /receipts
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.post(
  "/receipts",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  createReceiptValidator,
  wrapRequestHandler(createReceiptController)
)

/**
 * Description: update receipt (only when status = DRAFT)
 * Path: /receipts/:id
 * Method: PUT
 */
adminRouter.put(
  "/receipts/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  wrapRequestHandler(updateReceiptController)
)

// /**
//  * Description: change receipt status (DRAFT -> RECEIVED). Stock will be increased once.
//  * Path: /receipts/:id/status
//  * Method: PUT
//  */
// adminRouter.put(
//   "/receipts/:id/status",
//   accessTokenValidator,
//   verifyUserValidator,
//   checkRole(),
//   checkIdValidator,
//   wrapRequestHandler(updateReceiptStatusController)
// )

/**
 * Description: delete receipt (only when status = DRAFT)
 * Path: /receipts/:id
 * Method: DELETE
 */
adminRouter.delete(
  "/receipts/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  wrapRequestHandler(deleteReceiptController)
)

/**
 * Description: get orders in process from customer
 * Path: /orders-process
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get(
  "/orders-process",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getOrdersInProcessController)
)

/**
 * Description: get orders completed from customer
 * Path: /orders-completed
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get(
  "/orders-completed",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getOrdersInCompletedController)
)

/**
 * Description: get orders canceled from customer
 * Path: /orders-canceled
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get(
  "/orders-cancelled",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getOrdersInCanceledController)
)

/**
 * Description: update status order detail
 * Path: /orders/:id
 * Method: PUT
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.put(
  "/orders/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  wrapRequestHandler(updateStatusOrderController)
)

/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get(
  "/vouchers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getVouchersController)
)

/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get(
  "/vouchers/:id/orders",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  queryValidator,
  wrapRequestHandler(getVouchersOrdersController)
)

/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.post(
  "/vouchers",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  createVoucherValidator,
  wrapRequestHandler(createVoucherController)
)

/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.put(
  "/vouchers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  updateVoucherValidator,
  wrapRequestHandler(updateVoucherController)
)

/**
 * Description: delete voucher
 * Path: /vouchers/:id
 * Method: DELETE
 * Headers: {Authorization: AT}
 */
adminRouter.delete(
  "/vouchers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  wrapRequestHandler(deleteVoucherController)
)

/**
 * Description: get roles
 * Path: /roles
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/roles",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getRolesController)
)

/**
 * Description: create role
 * Path: /roles
 * Method: POST
 * Headers: {Authorization: AT}
 */
adminRouter.post(
  "/roles",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkRoleExitsValidator,
  wrapRequestHandler(createRoleController)
)

/**
 * Description: update role
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.put(
  "/roles/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  wrapRequestHandler(updateRoleController)
)

/**
 * Description: update role
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.delete(
  "/roles/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkIdValidator,
  deleteRoleValidator,
  wrapRequestHandler(deleteRoleController)
)

/**
 * Description: get permissions
 * Path: /permissions
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/permissions",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getPermissionsController)
)

/**
 * Description: get permissions base on role id
 * Path: /permissions/:idRole
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.post(
  "/permissions/by-roles",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getPermissionsBasedOnIdRoleController)
)

/**
 * Description: update permissions base on role id
 * Path: /permissions/:idRole
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.put(
  "/permissions",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(updatePermissionsBasedOnIdRoleController)
)
// 42 per

/**
 * Description: get staff
 * Path: /staffs
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/staffs",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getStaffsController)
)

/**
 * Description: create staff
 * Path: /staffs
 * Method: POST
 * Headers: {Authorization: AT}
 */
adminRouter.post(
  "/staffs",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  checkEmailExistValidator,
  wrapRequestHandler(createStaffController)
)

/**
 * Description: update staff
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.put(
  "/staffs/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  updateMeValidator,
  updateStaffValidator,
  wrapRequestHandler(updateCustomerDetailController)
)

/**
 * Description: update staff
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.delete(
  "/staffs/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  deleteRoleValidator,
  wrapRequestHandler(deleteCustomerController)
)

/**
 * Description: get reviews orders
 * Path: /reviews
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get(
  "/reviews",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(getReviewsOrdersController)
)

/**
 * Description: xóa review order
 * Path: /reviews/:id
 * Method: DELETE
 * Headers: {Authorization: AT}
 */
adminRouter.delete(
  "/reviews/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole(),
  wrapRequestHandler(deleteReviewOrderController)
)

export default adminRouter

// 40 permissions
