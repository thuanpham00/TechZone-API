"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controllers_1 = require("../controllers/admin.controllers");
const user_controllers_1 = require("../controllers/user.controllers");
const admin_middlewares_1 = require("../middlewares/admin.middlewares");
const common_middlewares_1 = require("../middlewares/common.middlewares");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const adminRouter = (0, express_1.Router)();
/**
 * Description: Login user for admin
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string}
 */
adminRouter.post("/login", user_middlewares_1.loginValidator, (0, user_middlewares_1.checkUserLogin)("other"), (0, handlers_1.wrapRequestHandler)(user_controllers_1.loginController));
/**
 * Description: get statistical sell dashboard
 * Path: /statistical-sell
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get("/statistical-sell", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getStatistical_Sell_Controller));
/**
 * Description: get statistical product dashboard
 * Path: /statistical-product
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get("/statistical-product", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getStatistical_Product_Controller));
/**
 * Description: get statistical user dashboard
 * Path: /statistical-user
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get("/statistical-user", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getStatistical_User_Controller));
/**
 * Description: create customer
 * Path: /customers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: createCustomerBodyReq
 */
adminRouter.post("/customers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkEmailExistValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createCustomerController));
/**
 * Description: get list customer
 * Path: /customers
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, email?: string, phone?: string}
 */
adminRouter.get("/customers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getCustomersController));
/**
 * Description: update customer
 * Path: /customers/:id
 * Method: PUT
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * Body: updateMeReqBody
 */
adminRouter.put("/customers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, user_middlewares_1.updateMeValidator, (0, common_middlewares_1.filterMiddleware)(["date_of_birth", "name", "numberPhone", "avatar"]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateCustomerDetailController));
/**
 * Description: delete customer
 * Path: /customers/:id
 * Method: DELETE
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/customers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteCustomerController));
/**
 * Description: create category
 * Path: /categories
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: createCategoryBodyReq
 */
adminRouter.post("/categories", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkCategoryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createCategoryController));
/**
 * Description: get list category
 * Path: /categories
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string}
 */
adminRouter.get("/categories", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getCategoriesController));
/**
 * Description: get name category filter
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get("/name-categories", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameCategoriesController));
/**
 * Description: update category detail
 * Path: /categories/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateCategoryBodyReq
 */
adminRouter.put("/categories/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.updateCategoryValidator, (0, common_middlewares_1.filterMiddleware)(["name", "is_active"]), admin_middlewares_1.checkCategoryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateCategoryDetailController));
/**
 * Description: delete category
 * Path: /categories/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/categories/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.deleteCategoryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteCategoryController));
/**
 * Description: add menu category
 * Path: /name-categories
 * Method: POST
 */
adminRouter.post("/category_menus/group", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.addMenuCategoryController));
/**
 * Description: add menu category
 * Path: /name-categories
 * Method: POST
 */
adminRouter.delete("/category_menus/group/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteMenuCategoryController));
/**
 * Description: get menu category by id category
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get("/category_menus/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getMenuByCategoryIdController));
/**
 * Description: update name group category menu
 * Path: /category_menus/:id/name-group
 * Method: PUT
 */
adminRouter.put("/category_menus/:id/name-group", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateGroupNameMenuController));
/**
 * Description: create link category menu
 * Path: /category_menus/:id/link
 * Method: POST
 */
adminRouter.post("/category_menus/:id/link", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createLinkCategoryMenuController));
/**
 * Description: delete link category menu
 * Path: /category_links/:id
 * Method: DELETE
 */
adminRouter.put("/category_links/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateLinkCategoryMenuController));
/**
 * Description: delete link category menu
 * Path: /category_links/:id
 * Method: DELETE
 */
adminRouter.delete("/category_links/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteLinkCategoryMenuController));
/**
 * Description: create category
 * Path: /brands
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: UpdateBrandBodyReq
 */
adminRouter.post("/brands", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkBrandValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createBrandController));
/**
 * Description: get list brand
 * Path: /categories/:id
 * Method: get
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, id: string, name?: string}
 */
adminRouter.get("/brands", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, admin_middlewares_1.getBrandsValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getBrandsController));
/**
 * Description: get name brand filter
 * Path: /name-brands
 * Method: GET
 */
adminRouter.get("/name-brands", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameBrandsController));
/**
 * Description: update brand detail
 * Path: /brands/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateBrandsBodyReq
 */
adminRouter.put("/brands/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.updateCategoryValidator, (0, common_middlewares_1.filterMiddleware)(["name"]), admin_middlewares_1.checkBrandValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateBrandDetailController));
/**
 * Description: delete brand
 * Path: /brands/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/brands/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.deleteBrandValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteBrandController));
/**
 * Description: get list product
 * Path: /products
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number}
 */
adminRouter.get("/products", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getProductController));
/**
 * Description: Create product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: CreateProductBodyReq }
 */
adminRouter.post("/products", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), common_middlewares_1.parseFormData, 
// createProductValidator,
(0, handlers_1.wrapRequestHandler)(admin_controllers_1.createProductController));
/**
 * Description: get name product filter
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get("/name-products", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameProductsController));
// nếu category này đã có các thương hiệu thì không thể thực hiện xóa
// còn nếu category này chưa có thương hiệu nào thì có thể thực hiện xóa
/**
 * Description: create supplier
 * Path: /suppliers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplierBodyReq
 */
adminRouter.post("/suppliers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.createSupplierValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createSupplierController));
/**
 * Description: get list supplier
 * Path: /suppliers
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, phone?: string, email?: string, contactName?: string}
 */
adminRouter.get("/suppliers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getSuppliersController));
/**
 * Description: get name supplier filter
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get("/name-suppliers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameSuppliersController));
/**
 * Description: get name supplier based on name product (dùng trong tạo 1 liên kết cung ứng)
 * Ví dụ đã có 1 product A <=> supplier B rồi thì sẽ không có thêm 1 product A <=> 1 supplier B => được quyền cập nhật lại (mối quan hệ n-n)
 * Path: /name-suppliers-based-on-product
 * Method: GET
 */
adminRouter.get("/not-linked-to-product", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, admin_middlewares_1.getProductIdFromProductNameValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameSuppliersNotLinkedToProductController));
/**
 * Description: lấy ra danh sách nhà cung cấp đã liên kết với sản phẩm này
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get("/linked-to-product", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, admin_middlewares_1.getProductIdFromProductNameValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameSuppliersLinkedToProductController));
/**
 * Description: lấy ra danh sách nhà cung cấp đã liên kết với sản phẩm này
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get("/get-pricePerUnit", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, admin_middlewares_1.getProductIdAndSupplierIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getPricePerUnitBasedOnProductAndSupplierController));
/**
 * Description: update supplier detail
 * Path: /suppliers/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateSupplierBodyReq
 */
adminRouter.put("/suppliers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.updateSupplierValidator, (0, common_middlewares_1.filterMiddleware)(["address", "contactName", "email", "name", "phone", "description"]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateSupplierDetailController));
/**
 * Description: delete supplier
 * Path: /suppliers/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/suppliers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.deleteSupplierValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteSupplierController));
// 1 product sẽ có nhiều supplier và 1 supplier sẽ cung cấp nhiều product (n-n)
/**
 * Description: create supply for product with supplier
 * Path: /supplies
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.post("/supplies", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.createSupplyValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createSupplyController));
/**
 * Description: get list supply
 * Path: /supplies
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, phone?: string, email?: string, contactName?: string}
 */
adminRouter.get("/supplies", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getSuppliesController));
/**
 * Description: get selling price (lấy giá bán hiện tại của sản phẩm - phục vụ cho tạo cung ứng)
 * Path: /supplies
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {name: string}
 */
adminRouter.get("/supplies/price-product", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getPriceProductController));
/**
 * Description: update supply detail
 * Path: /suppliers/:id
 * Method: put
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateSupplierBodyReq
 */
adminRouter.put("/supplies/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.updateSupplyValidator, (0, common_middlewares_1.filterMiddleware)([
    "productId",
    "supplierId",
    "importPrice",
    "warrantyMonths",
    "leadTimeDays",
    "description"
]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateSupplyDetailController));
/**
 * Description: delete supply
 * Path: /suppliers/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/supplies/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteSupplyController));
/**
 * Description: create receipt for products
 * Path: /receipts
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.post("/receipts", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.createReceiptValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createReceiptController));
/**
 * Description: get receipt for products
 * Path: /receipts
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get("/receipts", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getReceiptsController));
/**
 * Description: get orders in process from customer
 * Path: /orders-process
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get("/orders-process", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getOrdersInProcessController));
/**
 * Description: get orders completed from customer
 * Path: /orders-completed
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get("/orders-completed", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getOrdersInCompletedController));
/**
 * Description: get orders canceled from customer
 * Path: /orders-canceled
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get("/orders-cancelled", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getOrdersInCanceledController));
/**
 * Description: update status order detail
 * Path: /orders/:id
 * Method: PUT
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.put("/orders/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateStatusOrderController));
/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get("/vouchers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getVouchersController));
/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: GET
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.get("/vouchers/:id/orders", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getVouchersOrdersController));
/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.post("/vouchers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.createVoucherValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createVoucherController));
/**
 * Description: get vouchers list
 * Path: /vouchers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.put("/vouchers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.updateVoucherValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateVoucherController));
/**
 * Description: delete voucher
 * Path: /vouchers/:id
 * Method: DELETE
 * Headers: {Authorization: AT}
 */
adminRouter.delete("/vouchers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteVoucherController));
/**
 * Description: get roles
 * Path: /roles
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get("/roles", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getRolesController));
/**
 * Description: create role
 * Path: /roles
 * Method: POST
 * Headers: {Authorization: AT}
 */
adminRouter.post("/roles", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkRoleExitsValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createRoleController));
/**
 * Description: update role
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.put("/roles/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateRoleController));
/**
 * Description: update role
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.delete("/roles/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkIdValidator, admin_middlewares_1.deleteRoleValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteRoleController));
/**
 * Description: get permissions
 * Path: /permissions
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get("/permissions", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getPermissionsController));
/**
 * Description: get permissions base on role id
 * Path: /permissions/:idRole
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.post("/permissions/by-roles", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getPermissionsBasedOnIdRoleController));
/**
 * Description: update permissions base on role id
 * Path: /permissions/:idRole
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.put("/permissions", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updatePermissionsBasedOnIdRoleController));
// 42 per
/**
 * Description: get staff
 * Path: /staffs
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get("/staffs", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getStaffsController));
/**
 * Description: create staff
 * Path: /staffs
 * Method: POST
 * Headers: {Authorization: AT}
 */
adminRouter.post("/staffs", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.checkEmailExistValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createStaffController));
/**
 * Description: update staff
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.put("/staffs/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), user_middlewares_1.updateMeValidator, user_middlewares_1.updateStaffValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateCustomerDetailController));
/**
 * Description: update staff
 * Path: /roles
 * Method: PUT
 * Headers: {Authorization: AT}
 */
adminRouter.delete("/staffs/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)(), admin_middlewares_1.deleteRoleValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteCustomerController));
exports.default = adminRouter;
// 40 permissions
