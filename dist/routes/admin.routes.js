"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../constant/enum");
const admin_controllers_1 = require("../controllers/admin.controllers");
const admin_middlewares_1 = require("../middlewares/admin.middlewares");
const common_middlewares_1 = require("../middlewares/common.middlewares");
const user_middlewares_1 = require("../middlewares/user.middlewares");
const handlers_1 = require("../utils/handlers");
const adminRouter = (0, express_1.Router)();
/**
 * Description: get statistical dashboard
 * Path: /statistical
 * Method: GET
 * Headers: {Authorization: AT}
 */
adminRouter.get("/statistical", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getStatisticalController));
/**
 * Description: get list customer
 * Path: /customers
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, email?: string, phone?: string}
 */
adminRouter.get("/customers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getCustomersController));
/**
 * Description: get customer
 * Path: /customers/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get("/customers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getCustomerDetailController));
/**
 * Description: update customer
 * Path: /customers/:id
 * Method: PATCH
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * Body: updateMeReqBody
 */
adminRouter.patch("/customers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, user_middlewares_1.updateMeValidator, (0, common_middlewares_1.filterMiddleware)(["date_of_birth", "name", "numberPhone", "avatar"]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateCustomerDetailController));
/**
 * Description: delete customer
 * Path: /customers/:id
 * Method: DELETE
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/customers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteCustomerController));
/**
 * Description: create category
 * Path: /categories
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: createCategoryBodyReq
 */
adminRouter.post("/categories", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkCategoryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createCategoryController));
/**
 * Description: get list category
 * Path: /categories
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string}
 */
adminRouter.get("/categories", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getCategoriesController));
/**
 * Description: get category
 * Path: /categories/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get("/categories/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getCategoryDetailController));
/**
 * Description: get name category filter
 * Path: /name-categories
 * Method: GET
 */
adminRouter.get("/name-categories", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameCategoriesController));
/**
 * Description: update category detail
 * Path: /categories/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateCategoryBodyReq
 */
adminRouter.patch("/categories/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, admin_middlewares_1.updateCategoryValidator, (0, common_middlewares_1.filterMiddleware)(["name"]), admin_middlewares_1.checkCategoryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateCategoryDetailController));
/**
 * Description: delete category
 * Path: /categories/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/categories/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, admin_middlewares_1.deleteCategoryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteCategoryController));
/**
 * Description: create category
 * Path: /brands
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: UpdateBrandBodyReq
 */
adminRouter.post("/brands", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkBrandValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createBrandController));
/**
 * Description: get list brand
 * Path: /categories/:id
 * Method: get
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, id: string, name?: string}
 */
adminRouter.get("/brands", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.queryValidator, admin_middlewares_1.getBrandsValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getBrandsController));
/**
 * Description: get brand
 * Path: /brands/:id
 * Method: get
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get("/brands/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getBrandDetailController));
/**
 * Description: get name brand filter
 * Path: /name-brands
 * Method: GET
 */
adminRouter.get("/name-brands", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getNameBrandsController));
/**
 * Description: update brand detail
 * Path: /brands/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateBrandsBodyReq
 */
adminRouter.patch("/brands/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, admin_middlewares_1.updateCategoryValidator, (0, common_middlewares_1.filterMiddleware)(["name"]), admin_middlewares_1.checkBrandValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateBrandDetailController));
/**
 * Description: delete brand
 * Path: /brands/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/brands/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, admin_middlewares_1.deleteBrandValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteBrandController));
/**
 * Description: get list product
 * Path: /products
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number}
 */
adminRouter.get("/products", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getProductController));
/**
 * Description: Create product
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <accessToken> }
 * Body: { body: CreateProductBodyReq }
 */
adminRouter.post("/products", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), common_middlewares_1.parseFormData, 
// createProductValidator,
(0, handlers_1.wrapRequestHandler)(admin_controllers_1.createProductController));
// nếu category này đã có các thương hiệu thì không thể thực hiện xóa
// còn nếu category này chưa có thương hiệu nào thì có thể thực hiện xóa
/**
 * Description: create supplier
 * Path: /suppliers
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplierBodyReq
 */
adminRouter.post("/suppliers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.createSupplierValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createSupplierController));
/**
 * Description: get list supplier
 * Path: /suppliers
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, phone?: string, email?: string, contactName?: string}
 */
adminRouter.get("/suppliers", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.queryValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getSuppliersController));
/**
 * Description: get supplier detail
 * Path: /suppliers/:id
 * Method: GET
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.get("/suppliers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.getSupplierDetailController));
/**
 * Description: update supplier detail
 * Path: /suppliers/:id
 * Method: patch
 * Headers: {Authorization: AT}
 * Params: {id: string}
 * body: UpdateSupplierBodyReq
 */
adminRouter.patch("/suppliers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, admin_middlewares_1.updateSupplierValidator, (0, common_middlewares_1.filterMiddleware)(["address", "contactName", "email", "name", "phone", "description"]), (0, handlers_1.wrapRequestHandler)(admin_controllers_1.updateSupplierDetailController));
/**
 * Description: delete supplier
 * Path: /suppliers/:id
 * Method: delete
 * Headers: {Authorization: AT}
 * Params: {id: string}
 */
adminRouter.delete("/suppliers/:id", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.checkIdValidator, admin_middlewares_1.deleteSupplierValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.deleteSupplierController));
/**
 * Description: create supply for product with supplier
 * Path: /supplies
 * Method: POST
 * Headers: {Authorization: AT}
 * Body: CreateSupplyBodyReq
 */
adminRouter.post("/supplies", user_middlewares_1.accessTokenValidator, user_middlewares_1.verifyUserValidator, (0, user_middlewares_1.checkRole)([enum_1.RoleType.ADMIN]), admin_middlewares_1.createSupplyValidator, (0, handlers_1.wrapRequestHandler)(admin_controllers_1.createSupplyController));
/**
 * Description: get list supply
 * Path: /supplies
 * Method: GET
 * Headers: {Authorization: AT}
 * Query: {limit: number, page: number, name?: string, phone?: string, email?: string, contactName?: string}
 */
// adminRouter.get(
//   "/supplies",
//   accessTokenValidator,
//   verifyUserValidator,
//   checkRole([RoleType.ADMIN]),
//   queryValidator,
//   wrapRequestHandler(getSuppliesController)
// )
exports.default = adminRouter;
