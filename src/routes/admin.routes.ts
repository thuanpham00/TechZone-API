import { Router } from "express"
import { RoleType } from "~/constant/enum"
import {
  createBrandController,
  createCategoryController,
  createCustomerController,
  createProductController,
  createReceiptController,
  createSupplierController,
  createSupplyController,
  deleteBrandController,
  deleteCategoryController,
  deleteCustomerController,
  deleteSupplierController,
  deleteSupplyController,
  getBrandDetailController,
  getBrandsController,
  getCategoriesController,
  getCategoryDetailController,
  getCustomerDetailController,
  getCustomersController,
  getNameBrandsController,
  getNameCategoriesController,
  getNameProductsController,
  getNameSuppliersController,
  getNameSuppliersLinkedToProductController,
  getNameSuppliersNotLinkedToProductController,
  getOrderDetailController,
  getOrdersController,
  getPricePerUnitBasedOnProductAndSupplierController,
  getProductController,
  getReceiptsController,
  getStatisticalController,
  getSupplierDetailController,
  getSuppliersController,
  getSuppliesController,
  getSupplyDetailController,
  updateBrandDetailController,
  updateCategoryDetailController,
  updateCustomerDetailController,
  updateStatusOrderController,
  updateSupplierDetailController,
  updateSupplyDetailController
} from "~/controllers/admin.controllers"
import {
  checkBrandValidator,
  checkCategoryValidator,
  checkEmailExistValidator,
  checkIdValidator,
  createProductValidator,
  createReceiptValidator,
  createSupplierValidator,
  createSupplyValidator,
  deleteBrandValidator,
  deleteCategoryValidator,
  deleteSupplierValidator,
  getBrandsValidator,
  getProductIdAndSupplierIdValidator,
  getProductIdFromProductNameValidator,
  queryValidator,
  updateCategoryValidator,
  updateSupplierValidator,
  updateSupplyValidator
} from "~/middlewares/admin.middlewares"
import { filterMiddleware, parseFormData } from "~/middlewares/common.middlewares"
import { accessTokenValidator, checkRole, updateMeValidator, verifyUserValidator } from "~/middlewares/user.middlewares"
import { UpdateCategoryBodyReq, UpdateSupplierBodyReq, UpdateSupplyBodyReq } from "~/models/requests/admin.requests"
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
  checkRole([RoleType.ADMIN]),
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

/**
 * Description: Create product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: CreateProductBodyReq }
 */
adminRouter.post(
  "/products",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  parseFormData,
  // createProductValidator,
  wrapRequestHandler(createProductController)
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
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
  queryValidator,
  wrapRequestHandler(getSuppliersController)
)

/**
 * Description: get supplier detail
 * Path: /suppliers/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get(
  "/suppliers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(getSupplierDetailController)
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
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
  getProductIdAndSupplierIdValidator,
  wrapRequestHandler(getPricePerUnitBasedOnProductAndSupplierController)
)

/**
 * Description: update supplier detail
 * Path: /suppliers/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateSupplierBodyReq
 */
adminRouter.patch(
  "/suppliers/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
  queryValidator,
  wrapRequestHandler(getSuppliesController)
)

/**
 * Description: get supply detail
 * Path: /suppliers/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get(
  "/supplies/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(getSupplyDetailController)
)

/**
 * Description: update supply detail
 * Path: /suppliers/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateSupplierBodyReq
 */
adminRouter.patch(
  "/supplies/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
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
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(deleteSupplyController)
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
  checkRole([RoleType.ADMIN]),
  createReceiptValidator,
  wrapRequestHandler(createReceiptController)
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
  checkRole([RoleType.ADMIN]),
  queryValidator,
  wrapRequestHandler(getReceiptsController)
)

/**
 * Description: get orders from customer
 * Path: /orders
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get(
  "/orders",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  queryValidator,
  wrapRequestHandler(getOrdersController)
)

/**
 * Description: get order detail
 * Path: /orders/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get(
  "/orders/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(getOrderDetailController)
)

/**
 * Description: update status order detail
 * Path: /orders/:id
 * Method: PATCH
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.put(
  "/orders/:id",
  accessTokenValidator,
  verifyUserValidator,
  checkRole([RoleType.ADMIN]),
  checkIdValidator,
  wrapRequestHandler(updateStatusOrderController)
)

export default adminRouter
