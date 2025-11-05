"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVoucherController = exports.createVoucherController = exports.getVouchersOrdersController = exports.getVouchersController = exports.updateStatusOrderController = exports.getOrdersInCanceledController = exports.getOrdersInCompletedController = exports.getOrdersInProcessController = exports.getReceiptsController = exports.createReceiptController = exports.deleteSupplyController = exports.updateSupplyDetailController = exports.getSuppliesController = exports.getPriceProductController = exports.createSupplyController = exports.deleteSupplierController = exports.updateSupplierDetailController = exports.getPricePerUnitBasedOnProductAndSupplierController = exports.getNameSuppliersLinkedToProductController = exports.getNameSuppliersNotLinkedToProductController = exports.getNameSuppliersController = exports.getSuppliersController = exports.createSupplierController = exports.createProductController = exports.getNameProductsController = exports.getProductController = exports.deleteBrandController = exports.updateBrandDetailController = exports.createBrandController = exports.getNameBrandsController = exports.getBrandsController = exports.deleteLinkCategoryMenuController = exports.updateLinkCategoryMenuController = exports.createLinkCategoryMenuController = exports.updateGroupNameMenuController = exports.getMenuByCategoryIdController = exports.deleteMenuCategoryController = exports.addMenuCategoryController = exports.deleteCategoryController = exports.updateCategoryDetailController = exports.createCategoryController = exports.getNameCategoriesController = exports.getCategoriesController = exports.deleteCustomerController = exports.updateCustomerDetailController = exports.getCustomersController = exports.createCustomerController = exports.getStatistical_User_Controller = exports.getStatistical_Product_Controller = exports.getStatistical_Sell_Controller = void 0;
exports.createStaffController = exports.getStaffsController = exports.updatePermissionsBasedOnIdRoleController = exports.getPermissionsBasedOnIdRoleController = exports.getPermissionsController = exports.deleteRoleController = exports.updateRoleController = exports.createRoleController = exports.getRolesController = exports.deleteVoucherController = void 0;
const admin_services_1 = __importDefault(require("../services/admin.services"));
const message_1 = require("../constant/message");
const user_services_1 = require("../services/user.services");
const file_1 = require("../utils/file");
const getStatistical_Sell_Controller = async (req, res) => {
    const { year, month } = req.query;
    const { totalCustomer, totalOrder, totalProductSold, avgOrderValue, rateStatusOrder, revenueFor6Month } = await admin_services_1.default.getStatisticalSell(Number(month), Number(year));
    res.json({
        message: message_1.AdminMessage.GET_STATISTICAL,
        result: {
            totalCustomer,
            totalOrder,
            totalProductSold,
            avgOrderValue,
            rateStatusOrder,
            revenueFor6Month
        }
    });
};
exports.getStatistical_Sell_Controller = getStatistical_Sell_Controller;
const getStatistical_Product_Controller = async (req, res) => {
    const { countCategory, top10ProductSold, productRunningOutOfStock } = await admin_services_1.default.getStatisticalProduct();
    res.json({
        message: message_1.AdminMessage.GET_STATISTICAL,
        result: {
            countCategory,
            top10ProductSold,
            productRunningOutOfStock
        }
    });
};
exports.getStatistical_Product_Controller = getStatistical_Product_Controller;
const getStatistical_User_Controller = async (req, res) => {
    const { year, month } = req.query;
    const { totalCustomer, totalStaff, top10CustomerBuyTheMost, rateReturningCustomers } = await admin_services_1.default.getStatisticalUser(Number(month), Number(year));
    res.json({
        message: message_1.AdminMessage.GET_STATISTICAL,
        result: {
            totalCustomer,
            totalStaff,
            top10CustomerBuyTheMost,
            rateReturningCustomers
        }
    });
};
exports.getStatistical_User_Controller = getStatistical_User_Controller;
const createCustomerController = async (req, res) => {
    const result = await admin_services_1.default.createCustomer(req.body);
    res.json({
        message: message_1.AdminMessage.CREATE_CUSTOMER_DETAIL,
        result: {
            result
        }
    });
};
exports.createCustomerController = createCustomerController;
const getCustomersController = async (req, res) => {
    const { limit, page, email, name, phone, verify, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getCustomers(Number(limit), Number(page), email, name, phone, verify, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy);
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
    const { limit, page, name, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getCategories(Number(limit), Number(page), name, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy);
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
const createCategoryController = async (req, res) => {
    const { name, is_active } = req.body;
    const result = await admin_services_1.default.createCategory(name, is_active);
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
const addMenuCategoryController = async (req, res) => {
    try {
        const { files, fields } = await (0, file_1.handleUploadImage)(req, { required: false });
        const id_category = fields.id_category?.[0];
        const name = fields.name?.[0];
        const is_active = fields.is_active?.[0] === "true";
        const items = [];
        let index = 0;
        let fileIndex = 0;
        while (fields[`items[${index}][name]`]) {
            const item = {
                name: fields[`items[${index}][name]`]?.[0],
                slug: fields[`items[${index}][slug]`]?.[0],
                type_filter: fields[`items[${index}][type_filter]`]?.[0]
            };
            if (files[fileIndex]) {
                item.banner = files[fileIndex];
                fileIndex++;
            }
            items.push(item);
            index++;
        }
        await admin_services_1.default.addMenuCategory(id_category, name, is_active, items);
        res.json({
            message: message_1.AdminMessage.CREATE_GROUP_CATEGORY_MENU
        });
    }
    catch (error) {
        console.error("Error in addMenuCategoryController:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
exports.addMenuCategoryController = addMenuCategoryController;
const deleteMenuCategoryController = async (req, res) => {
    const { id } = req.params;
    await admin_services_1.default.deleteMenuCategory(id);
    res.json({
        message: message_1.AdminMessage.DELETE_GROUP_CATEGORY_MENU
    });
};
exports.deleteMenuCategoryController = deleteMenuCategoryController;
const getMenuByCategoryIdController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.getMenuByCategoryId(id);
    res.json({
        message: message_1.AdminMessage.GET_MENUS,
        result
    });
};
exports.getMenuByCategoryIdController = getMenuByCategoryIdController;
const updateGroupNameMenuController = async (req, res) => {
    const { id } = req.params;
    const { id_section, name, is_active } = req.body;
    await admin_services_1.default.updateGroupNameMenu(id, id_section, name, is_active);
    res.json({
        message: message_1.AdminMessage.UPDATE_NAME_CATEGORY_DETAIL
    });
};
exports.updateGroupNameMenuController = updateGroupNameMenuController;
const createLinkCategoryMenuController = async (req, res) => {
    const { files, fields } = await (0, file_1.handleUploadImage)(req, { required: false });
    const { id } = req.params;
    const id_section = fields.id_section?.[0];
    const id_category = fields.id_category?.[0];
    const name = fields.name?.[0];
    const slug = fields.slug?.[0];
    const type_filter = fields.type_filter?.[0];
    await admin_services_1.default.createLinkCategoryMenu(id, id_category, id_section, name, slug, type_filter, files[0]);
    res.json({
        message: message_1.AdminMessage.CREATE_CATEGORY_LINK
    });
};
exports.createLinkCategoryMenuController = createLinkCategoryMenuController;
const updateLinkCategoryMenuController = async (req, res) => {
    const { files, fields } = await (0, file_1.handleUploadImage)(req, { required: false });
    const { id } = req.params;
    const id_category = fields.id_category?.[0];
    const name = fields.name?.[0];
    const slug = fields.slug?.[0];
    const type_filter = fields.type_filter?.[0];
    await admin_services_1.default.updateLinkCategoryMenu(id, id_category, name, slug, type_filter, files[0]);
    res.json({
        message: message_1.AdminMessage.UPDATE_CATEGORY_LINK
    });
};
exports.updateLinkCategoryMenuController = updateLinkCategoryMenuController;
const deleteLinkCategoryMenuController = async (req, res) => {
    const { id } = req.params;
    await admin_services_1.default.deleteLinkCategoryMenu(id);
    res.json({
        message: message_1.AdminMessage.DELETE_CATEGORY_LINK
    });
};
exports.deleteLinkCategoryMenuController = deleteLinkCategoryMenuController;
const getBrandsController = async (req, res) => {
    const { limit, page, name, id, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes, listTotalProduct } = await admin_services_1.default.getBrands(id, Number(limit), Number(page), name, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy);
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
    const { limit, page, name, brand, category, created_at_start, created_at_end, updated_at_start, updated_at_end, price_min, price_max, status, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getProducts(Number(limit), Number(page), name, brand, category, created_at_start, created_at_end, updated_at_start, updated_at_end, price_min, price_max, status, sortBy);
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
const getNameProductsController = async (req, res) => {
    const result = await admin_services_1.default.getNameProductsFilter();
    res.json({
        message: message_1.AdminMessage.GET_PRODUCTS,
        result: {
            result
        }
    });
};
exports.getNameProductsController = getNameProductsController;
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
    const { limit, page, name, email, phone, contactName, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getSuppliers(Number(limit), Number(page), name, email, phone, contactName, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy);
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
const getNameSuppliersController = async (req, res) => {
    const result = await admin_services_1.default.getNameSuppliersFilter();
    res.json({
        message: message_1.AdminMessage.GET_SUPPLIERS,
        result: {
            result
        }
    });
};
exports.getNameSuppliersController = getNameSuppliersController;
const getNameSuppliersNotLinkedToProductController = async (req, res) => {
    const productId = req.productId;
    const result = await admin_services_1.default.getNameSuppliersNotLinkedToProduct(productId);
    res.json({
        message: message_1.AdminMessage.GET_SUPPLIERS_BASED_ON_NAME_PRODUCT,
        result: {
            result
        }
    });
};
exports.getNameSuppliersNotLinkedToProductController = getNameSuppliersNotLinkedToProductController;
const getNameSuppliersLinkedToProductController = async (req, res) => {
    const productId = req.productId;
    const result = await admin_services_1.default.getNameSuppliersLinkedToProduct(productId);
    res.json({
        message: message_1.AdminMessage.GET_SUPPLIERS_BASED_ON_NAME_PRODUCT_2,
        result: {
            result
        }
    });
};
exports.getNameSuppliersLinkedToProductController = getNameSuppliersLinkedToProductController;
const getPricePerUnitBasedOnProductAndSupplierController = async (req, res) => {
    const { productId, supplierId } = req;
    const result = await admin_services_1.default.getPricePerUnitFromProductAndSupplier(productId, supplierId);
    res.json({
        message: message_1.ReceiptMessage.PRICE_PER_UNIT_IS_SUCCESS,
        result: {
            result
        }
    });
};
exports.getPricePerUnitBasedOnProductAndSupplierController = getPricePerUnitBasedOnProductAndSupplierController;
const updateSupplierDetailController = async (req, res) => {
    const { id } = req.params;
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
const getPriceProductController = async (req, res) => {
    const { name } = req.query;
    const { priceProduct } = await admin_services_1.default.getSellPriceProduct(name);
    res.json({
        message: message_1.AdminMessage.GET_PRICE_SELLING,
        result: priceProduct
    });
};
exports.getPriceProductController = getPriceProductController;
const getSuppliesController = async (req, res) => {
    const { limit, page, name_product, name_supplier, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getSupplies(Number(limit), Number(page), name_product, name_supplier, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy);
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
exports.getSuppliesController = getSuppliesController;
const updateSupplyDetailController = async (req, res) => {
    const { id } = req.params;
    const { message } = await admin_services_1.default.updateSupply(id, req.body);
    res.json({
        message
    });
};
exports.updateSupplyDetailController = updateSupplyDetailController;
const deleteSupplyController = async (req, res) => {
    const { id } = req.params;
    const { message } = await admin_services_1.default.deleteSupply(id);
    res.json({
        message: message
    });
};
exports.deleteSupplyController = deleteSupplyController;
const createReceiptController = async (req, res) => {
    const { message } = await admin_services_1.default.createReceipt(req.body);
    res.json({
        message: message
    });
};
exports.createReceiptController = createReceiptController;
const getReceiptsController = async (req, res) => {
    const { limit, page, name_product, name_supplier, created_at_start, created_at_end, updated_at_start, updated_at_end, quantity, price_max, price_min, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getReceipts(Number(limit), Number(page), name_product, name_supplier, created_at_start, created_at_end, updated_at_start, updated_at_end, quantity, price_max, price_min, sortBy);
    res.json({
        message: message_1.AdminMessage.GET_RECEIPTS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getReceiptsController = getReceiptsController;
const getOrdersInProcessController = async (req, res) => {
    const { limit, page, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy, name, address, phone, status } = req.query;
    const nameEncode = name && decodeURIComponent(name);
    const addressEncode = address && decodeURIComponent(address);
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getOrdersInProcess("in_process", Number(limit), Number(page), created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy, nameEncode, addressEncode, phone, status);
    res.json({
        message: message_1.AdminMessage.GET_ORDERS_IN_PROCESS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getOrdersInProcessController = getOrdersInProcessController;
const getOrdersInCompletedController = async (req, res) => {
    const { limit, page, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy, name, address, phone, status } = req.query;
    const nameEncode = name && decodeURIComponent(name);
    const addressEncode = address && decodeURIComponent(address);
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getOrdersInProcess("completed", Number(limit), Number(page), created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy, nameEncode, addressEncode, phone, status);
    res.json({
        message: message_1.AdminMessage.GET_ORDERS_COMPLETED,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getOrdersInCompletedController = getOrdersInCompletedController;
const getOrdersInCanceledController = async (req, res) => {
    const { limit, page, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy, name, address, phone, status } = req.query;
    const nameEncode = name && decodeURIComponent(name);
    const addressEncode = address && decodeURIComponent(address);
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getOrdersInProcess("canceled", Number(limit), Number(page), created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy, nameEncode, addressEncode, phone, status);
    res.json({
        message: message_1.AdminMessage.GET_ORDERS_COMPLETED,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getOrdersInCanceledController = getOrdersInCanceledController;
const updateStatusOrderController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { message } = await admin_services_1.default.updateStatusOrder(id, status);
    res.json({
        message: message
    });
};
exports.updateStatusOrderController = updateStatusOrderController;
const getVouchersController = async (req, res) => {
    const { limit, page, name, code, status, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getVouchers(Number(limit), Number(page), name, code, status, sortBy);
    res.json({
        message: message_1.AdminMessage.GET_VOUCHERS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getVouchersController = getVouchersController;
const getVouchersOrdersController = async (req, res) => {
    const { id } = req.params; // id voucher
    const { limit, page } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getVouchersForOrders(id, Number(limit), Number(page));
    res.json({
        message: message_1.AdminMessage.GET_VOUCHERS_FOR_ORDERS,
        result: {
            result,
            limit: limitRes,
            page: pageRes,
            total,
            totalOfPage
        }
    });
};
exports.getVouchersOrdersController = getVouchersOrdersController;
const createVoucherController = async (req, res) => {
    const result = await admin_services_1.default.createVoucher(req.body);
    res.json({
        message: message_1.AdminMessage.CREATE_VOUCHER_SUCCESS,
        data: result
    });
};
exports.createVoucherController = createVoucherController;
const updateVoucherController = async (req, res) => {
    const { id } = req.params;
    const result = await admin_services_1.default.updateVoucher(id, req.body);
    res.json({
        message: message_1.AdminMessage.UPDATE_VOUCHER_SUCCESS,
        data: result
    });
};
exports.updateVoucherController = updateVoucherController;
const deleteVoucherController = async (req, res) => {
    const { id } = req.params;
    const { message } = await admin_services_1.default.deleteVoucher(id);
    res.json({
        message
    });
};
exports.deleteVoucherController = deleteVoucherController;
const getRolesController = async (req, res) => {
    const { result } = await admin_services_1.default.getRoles();
    res.json({
        message: message_1.AdminMessage.GET_ROLES,
        result: {
            result
        }
    });
};
exports.getRolesController = getRolesController;
const createRoleController = async (req, res) => {
    const { message } = await admin_services_1.default.createRole(req.body);
    res.json({
        message
    });
};
exports.createRoleController = createRoleController;
const updateRoleController = async (req, res) => {
    const { id } = req.params;
    const { message } = await admin_services_1.default.updateRole(id, req.body);
    res.json({
        message
    });
};
exports.updateRoleController = updateRoleController;
const deleteRoleController = async (req, res) => {
    const { id } = req.params;
    const { message } = await admin_services_1.default.deleteRole(id);
    res.json({
        message
    });
};
exports.deleteRoleController = deleteRoleController;
const getPermissionsController = async (req, res) => {
    const { result } = await admin_services_1.default.getPermissions();
    res.json({
        message: message_1.AdminMessage.GET_PERMISSIONS,
        result: {
            result
        }
    });
};
exports.getPermissionsController = getPermissionsController;
const getPermissionsBasedOnIdRoleController = async (req, res) => {
    const { listIdRole } = req.body;
    const result = await admin_services_1.default.getPermissionsBasedOnIdRole(listIdRole);
    res.json({
        message: message_1.AdminMessage.GET_PERMISSIONS_BASED_ON_ROLE,
        result: {
            result
        }
    });
};
exports.getPermissionsBasedOnIdRoleController = getPermissionsBasedOnIdRoleController;
const updatePermissionsBasedOnIdRoleController = async (req, res) => {
    const { result } = await admin_services_1.default.updatePermissionsBasedOnIdRole(req.body);
    res.json({
        message: message_1.AdminMessage.UPDATE_PERMISSIONS_BASED_ON_ID_ROLE,
        result
    });
};
exports.updatePermissionsBasedOnIdRoleController = updatePermissionsBasedOnIdRoleController;
const getStaffsController = async (req, res) => {
    const { limit, page, email, name, phone, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy } = req.query;
    const { result, total, totalOfPage, limitRes, pageRes } = await admin_services_1.default.getStaffs(Number(limit), Number(page), email, name, phone, sortBy, created_at_start, created_at_end, updated_at_start, updated_at_end);
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
exports.getStaffsController = getStaffsController;
const createStaffController = async (req, res) => {
    const result = await admin_services_1.default.createStaff(req.body);
    res.json({
        message: message_1.AdminMessage.CREATE_CUSTOMER_DETAIL,
        result: {
            result
        }
    });
};
exports.createStaffController = createStaffController;
