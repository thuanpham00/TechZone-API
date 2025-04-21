"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupplyController = exports.deleteSupplierController = exports.updateSupplierDetailController = exports.getSupplierDetailController = exports.getSuppliersController = exports.createSupplierController = exports.createProductController = exports.getProductController = exports.deleteBrandController = exports.updateBrandDetailController = exports.createBrandController = exports.getBrandDetailController = exports.getNameBrandsController = exports.getBrandsController = exports.deleteCategoryController = exports.updateCategoryDetailController = exports.createCategoryController = exports.getCategoryDetailController = exports.getNameCategoriesController = exports.getCategoriesController = exports.deleteCustomerController = exports.updateCustomerDetailController = exports.getCustomerDetailController = exports.getCustomersController = exports.getStatisticalController = void 0;
const admin_services_1 = __importDefault(require("../services/admin.services"));
const message_1 = require("../constant/message");
const user_services_1 = require("../services/user.services");
const getStatisticalController = async (req, res) => {
    const { totalCustomer, totalProduct } = await admin_services_1.default.getStatistical();
    res.json({
        message: message_1.AdminMessage.GET_STATISTICAL,
        result: {
            totalCustomer,
            totalProduct,
            totalEmployee: 0,
            totalSales: 0
        }
    });
};
exports.getStatisticalController = getStatisticalController;
const getCustomersController = async (req, res) => {
    const { limit, page, email, name, phone, verify, created_at_start, created_at_end, updated_at_start, updated_at_end } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getCustomers(Number(limit), Number(page), email, name, phone, verify, created_at_start, created_at_end, updated_at_start, updated_at_end);
    res.json({
        message: message_1.AdminMessage.GET_CUSTOMERS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getCustomersController = getCustomersController;
const getCustomerDetailController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.getCustomerDetail(id);
    res.json({
        message: message_1.AdminMessage.GET_CUSTOMER,
        result: {
            result
        }
    });
};
exports.getCustomerDetailController = getCustomerDetailController;
const updateCustomerDetailController = async (req, res) => {
    const { id } = req.params;
    const result = await user_services_1.userServices.updateMe({ user_id: id, body: req.body });
    res.json({
        message: message_1.UserMessage.UPDATE_PROFILE_IS_SUCCESS,
        result
    });
};
exports.updateCustomerDetailController = updateCustomerDetailController;
const deleteCustomerController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.deleteCustomer(id);
    res.json({
        message: message_1.AdminMessage.DELETE_CUSTOMER,
        result
    });
};
exports.deleteCustomerController = deleteCustomerController;
const getCategoriesController = async (req, res) => {
    const { limit, page, name, created_at_start, created_at_end, updated_at_start, updated_at_end } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getCategories(Number(limit), Number(page), name, created_at_start, created_at_end, updated_at_start, updated_at_end);
    res.json({
        message: message_1.AdminMessage.GET_CATEGORIES,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getCategoriesController = getCategoriesController;
const getNameCategoriesController = async (req, res) => {
    const result = await admin_services_1.default.getNameCategoriesFilter();
    res.json({
        message: message_1.AdminMessage.GET_CATEGORIES,
        result: {
            result
        }
    });
};
exports.getNameCategoriesController = getNameCategoriesController;
const getCategoryDetailController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.getCategoryDetail(id);
    res.json({
        message: message_1.AdminMessage.GET_BRAND_DETAIL,
        result: {
            result
        }
    });
};
exports.getCategoryDetailController = getCategoryDetailController;
const createCategoryController = async (req, res) => {
    const { name } = req.body;
    const result = await admin_services_1.default.createCategory(name);
    res.json({
        message: message_1.AdminMessage.CREATE_CATEGORY_DETAIL,
        result: {
            result
        }
    });
};
exports.createCategoryController = createCategoryController;
const updateCategoryDetailController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.updateCategory(id, req.body);
    res.json({
        message: message_1.AdminMessage.UPDATE_CATEGORY_DETAIL,
        result: {
            result
        }
    });
};
exports.updateCategoryDetailController = updateCategoryDetailController;
const deleteCategoryController = async (req, res) => {
    const { id } = req.params;
    const { message } = await admin_services_1.default.deleteCategory(id);
    res.json({
        message: message
    });
};
exports.deleteCategoryController = deleteCategoryController;
const getBrandsController = async (req, res) => {
    const { limit, page, name, id, created_at_start, created_at_end, updated_at_start, updated_at_end } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes, listTotalProduct } = await admin_services_1.default.getBrands(id, Number(limit), Number(page), name, created_at_start, created_at_end, updated_at_start, updated_at_end);
    res.json({
        message: message_1.AdminMessage.GET_BRANDS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage,
            listTotalProduct
        }
    });
};
exports.getBrandsController = getBrandsController;
const getNameBrandsController = async (req, res) => {
    const result = await admin_services_1.default.getNameBrandsFilter();
    res.json({
        message: message_1.AdminMessage.GET_BRANDS,
        result: {
            result
        }
    });
};
exports.getNameBrandsController = getNameBrandsController;
const getBrandDetailController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.getBrandDetail(id);
    res.json({
        message: message_1.AdminMessage.GET_CATEGORY_DETAIL,
        result: {
            result
        }
    });
};
exports.getBrandDetailController = getBrandDetailController;
const createBrandController = async (req, res) => {
    const { name, categoryId } = req.body;
    const { message } = await admin_services_1.default.createBrand(name, categoryId);
    res.json({
        message: message
    });
};
exports.createBrandController = createBrandController;
const updateBrandDetailController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.updateBrand(id, req.body);
    res.json({
        message: message_1.AdminMessage.UPDATE_BRAND_DETAIL,
        result: {
            result
        }
    });
};
exports.updateBrandDetailController = updateBrandDetailController;
const deleteBrandController = async (req, res) => {
    const { id } = req.params;
    const { categoryId } = req.query;
    const { message } = await admin_services_1.default.deleteBrand(categoryId, id);
    res.json({
        message: message
    });
};
exports.deleteBrandController = deleteBrandController;
const getProductController = async (req, res) => {
    const { limit, page, name, brand, category, created_at_start, created_at_end, updated_at_start, updated_at_end, price_min, price_max, status } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getProducts(Number(limit), Number(page), name, brand, category, created_at_start, created_at_end, updated_at_start, updated_at_end, price_min, price_max, status);
    res.json({
        message: message_1.AdminMessage.GET_PRODUCTS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getProductController = getProductController;
const createProductController = async (req, res, next) => {
    const fields = req.body;
    const files = req.files;
    const payload = {
        name: fields.name[0], // fields dưới dạng mảng, kể cả khi bạn chỉ gửi 1 giá trị duy nhất.
        category: fields.category[0],
        brand: fields.brand[0],
        price: Number(fields.price[0]),
        discount: Number(fields.discount[0]),
        stock: Number(fields.stock[0]),
        isFeatured: fields.isFeatured[0],
        description: fields.description[0],
        banner: files.banner?.[0],
        medias: files.medias ? (Array.isArray(files.medias) ? files.medias : [files.medias]) : [],
        specifications: JSON.parse(fields.specifications[0]) // bạn cần gửi từ FE là JSON.stringify
    };
    const result = await admin_services_1.default.createProduct(payload);
    res.json({
        message: message_1.ProductMessage.CREATE_PRODUCT_SUCCESS,
        result
    });
};
exports.createProductController = createProductController;
/**
 * const formData = new FormData()
   formData.append("name", "Laptop MSI")

   # sau khi formidable parse xong (middlewares)
   fields = {
      name: ["Laptop MSI"] // <-- Mảng có 1 phần tử
   }
   => fields.name[0] === fields["name"][0] mới lấy được kết quả
 */
const createSupplierController = async (req, res) => {
    const { message } = await admin_services_1.default.createSupplier(req.body);
    res.json({
        message: message
    });
};
exports.createSupplierController = createSupplierController;
const getSuppliersController = async (req, res) => {
    const { limit, page, name, email, phone, contactName, created_at_start, created_at_end, updated_at_start, updated_at_end } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getSuppliers(Number(limit), Number(page), name, email, phone, contactName, created_at_start, created_at_end, updated_at_start, updated_at_end);
    res.json({
        message: message_1.AdminMessage.GET_SUPPLIERS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getSuppliersController = getSuppliersController;
const getSupplierDetailController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.getSupplierDetail(id);
    res.json({
        message: message_1.AdminMessage.GET_BRAND_DETAIL,
        result: {
            result
        }
    });
};
exports.getSupplierDetailController = getSupplierDetailController;
const updateSupplierDetailController = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    console.log(req.body);
    const { message } = await admin_services_1.default.updateSupplier(id, req.body);
    res.json({
        message
    });
};
exports.updateSupplierDetailController = updateSupplierDetailController;
const deleteSupplierController = async (req, res) => {
    const { id } = req.params;
    const { message } = await admin_services_1.default.deleteSupplier(id);
    res.json({
        message: message
    });
};
exports.deleteSupplierController = deleteSupplierController;
const createSupplyController = async (req, res) => {
    const { message } = await admin_services_1.default.createSupply(req.body);
    res.json({
        message: message
    });
};
exports.createSupplyController = createSupplyController;
