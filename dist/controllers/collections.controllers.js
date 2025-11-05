"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductToCartController = exports.getCollectionsCartController = exports.clearProductInCartController = exports.updateQuantityProductInCartController = exports.addProductToCartController = exports.addProductToFavouriteController = exports.getCollectionsFavouriteController = exports.getCollectionsController = exports.getFilterBaseOnCategory = exports.slugConditionMap = void 0;
const message_1 = require("../constant/message");
const collection_services_1 = __importDefault(require("../services/collection.services"));
const database_services_1 = __importDefault(require("../services/database.services"));
const mongodb_1 = require("mongodb");
const errors_1 = require("../models/errors");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
exports.slugConditionMap = {
    laptop: { category: "Laptop" },
    "laptop-asus-hoc-tap-va-lam-viec": { brand: "ASUS", category: "Laptop" },
    "laptop-acer-hoc-tap-va-lam-viec": { brand: "ACER", category: "Laptop" },
    "laptop-msi-hoc-tap-va-lam-viec": { brand: "MSI", category: "Laptop" },
    "laptop-lenovo-hoc-tap-va-lam-viec": { brand: "LENOVO", category: "Laptop" },
    "laptop-duoi-15-trieu": { price: { $lt: 15000000 }, category: "Laptop" },
    "laptop-tu-15-den-20-trieu": { price: { $gte: 15000000, $lt: 20000000 }, category: "Laptop" },
    "laptop-tren-20-trieu": { price: { $gte: 20000000 }, category: "Laptop" },
    "top-10-laptop-ban-chay": { category: "Laptop" },
    "laptop-gaming": { category: "Laptop Gaming" },
    "top-10-laptop-gaming-ban-chay": { category: "Laptop Gaming" },
    "laptop-gaming-asus": { category: "Laptop Gaming", brand: "ASUS" },
    "laptop-gaming-acer": { category: "Laptop Gaming", brand: "ACER" },
    "laptop-gaming-msi": { category: "Laptop Gaming", brand: "MSI" },
    "laptop-gaming-lenovo": { category: "Laptop Gaming", brand: "LENOVO" },
    "laptop-gaming-duoi-20-trieu": { price: { $lt: 20000000 }, category: "Laptop Gaming" },
    "laptop-gaming-tu-20-den-25-trieu": { price: { $gte: 20000000, $lt: 25000000 }, category: "Laptop Gaming" },
    "laptop-gaming-tren-25-trieu": { price: { $gte: 25000000 }, category: "Laptop Gaming" },
    "pc-gvn": { category: "PC GVN" },
    "pc-gvn-rtx-5090": { category: "PC GVN", brand: "GVN" },
    "pc-gvn-rtx-5080": { category: "PC GVN", brand: "GVN" },
    "pc-gvn-rtx-5070Ti": { category: "PC GVN", brand: "GVN" },
    "pc-gvn-rtx-5060Ti": { category: "PC GVN", brand: "GVN" },
    "pc-gvn-rtx-5060": { category: "PC GVN", brand: "GVN" },
    "pc-gvn-rtx-4060": { category: "PC GVN", brand: "GVN" },
    "pc-gvn-rtx-3060": { category: "PC GVN", brand: "GVN" },
    "top-10-pc-ban-chay": { category: "PC GVN" },
    "man-hinh": { category: "Màn hình" },
    "top-10-man-hinh-ban-chay": { category: "Màn hình" },
    "man-hinh-samsung": { category: "Màn hình", brand: "SAMSUNG" },
    "man-hinh-asus": { category: "Màn hình", brand: "ASUS" },
    "man-hinh-dell": { category: "Màn hình", brand: "DELL" },
    "man-hinh-viewsonic": { category: "Màn hình", brand: "VIEWSONIC" },
    "man-hinh-acer": { category: "Màn hình", brand: "ACER" },
    "man-hinh-duoi-5-trieu": { price: { $lt: 5000000 }, category: "Màn hình" },
    "man-hinh-tu-5-den-10-trieu": { price: { $gte: 5000000, $lt: 10000000 }, category: "Màn hình" },
    "man-hinh-tu-10-den-20-trieu": { price: { $gte: 10000000, $lt: 20000000 }, category: "Màn hình" },
    "man-hinh-tren-20-trieu": { price: { $gte: 20000000 }, category: "Màn hình" },
    "ban-phim": { category: "Bàn phím" },
    "ban-phim-akko": { category: "Bàn phím", brand: "AKKO" },
    "ban-phim-aula": { category: "Bàn phím", brand: "AULA" },
    "ban-phim-dareu": { category: "Bàn phím", brand: "DARE-U" },
    "ban-phim-keychron": { category: "Bàn phím", brand: "KEYCHRON" },
    "ban-phim-corsair": { category: "Bàn phím", brand: "CORSAIR" },
    "ban-phim-asus": { category: "Bàn phím", brand: "ASUS" },
    "ban-phim-logitech": { category: "Bàn phím", brand: "LOGITECH" },
    "ban-phim-razer": { category: "Bàn phím", brand: "RAZER" },
    "ban-phim-duoi-1-trieu": { price: { $lt: 1000000 }, category: "Bàn phím" },
    "ban-phim-tu-1-den-2-trieu": { price: { $gte: 1000000, $lt: 2000000 }, category: "Bàn phím" },
    "ban-phim-tu-2-den-3-trieu": { price: { $gte: 2000000, $lt: 3000000 }, category: "Bàn phím" },
    "ban-phim-tren-3-trieu": { price: { $gte: 3000000 }, category: "Bàn phím" }
};
const getFilterBaseOnCategory = async (req, res) => {
    const category = req.query.category;
    const findCategory = await database_services_1.default.category.findOne({ name: category });
    // Lấy spec liên quan đến category
    if (category === "Laptop" || category === "Laptop Gaming") {
        const [specs_screen_size, specs_ssd, specs_ram, specs_cpu] = await Promise.all([
            database_services_1.default.specification
                .find({
                category_id: new mongodb_1.ObjectId(findCategory?._id),
                name: "Màn hình"
            })
                .toArray(),
            database_services_1.default.specification
                .find({
                category_id: new mongodb_1.ObjectId(findCategory?._id),
                name: "Ổ cứng"
            })
                .toArray(),
            database_services_1.default.specification
                .find({
                category_id: new mongodb_1.ObjectId(findCategory?._id),
                name: "Ram"
            })
                .toArray(),
            database_services_1.default.specification
                .find({
                category_id: new mongodb_1.ObjectId(findCategory?._id),
                name: "Cpu"
            })
                .toArray()
        ]);
        const screenSizes = new Set();
        const storages = new Set();
        const rams = new Set();
        const cpus = new Set();
        specs_screen_size.forEach((spec) => {
            const value = spec.value.toString();
            const inchMatch = value.match(/(\d{2}\.?\d*)\s*inch/i);
            if (inchMatch)
                screenSizes.add(parseFloat(inchMatch[1]));
        });
        specs_ssd.forEach((spec) => {
            const value = spec.value.toString();
            const storageMatch = value.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i);
            if (storageMatch) {
                storages.add(`${storageMatch[1]}${storageMatch[2].toUpperCase()}`);
            }
        });
        specs_ram.forEach((spec) => {
            const value = spec.value.toString();
            const ramMatch = value.match(/(\d+(?:\.\d+)?)\s*GB/i);
            if (ramMatch) {
                rams.add(`${ramMatch[1]}GB`);
            }
        });
        specs_cpu.forEach((spec) => {
            const value = spec.value.toString();
            const cpuMatch = value.match(/(Core™\s*i[579]|Ryzen™(?:\s*AI)?\s*7)/i);
            if (cpuMatch) {
                cpus.add(cpuMatch[1]); // Thêm "Core™ i7" hoặc "Ryzen™ AI 7"
            }
        });
        res.json({
            screen_size_list: Array.from(screenSizes).sort((a, b) => a - b),
            ssd_list: Array.from(storages),
            ram_list: Array.from(rams),
            cpu_list: Array.from(cpus)
        });
        return;
    }
    else if (category === "Màn hình") {
        const [specs_resolution] = await Promise.all([
            database_services_1.default.specification
                .find({
                category_id: new mongodb_1.ObjectId(findCategory?._id),
                name: "Độ phân giải"
            })
                .toArray()
        ]);
    }
};
exports.getFilterBaseOnCategory = getFilterBaseOnCategory;
const getCollectionsController = async (req, res, next) => {
    const { slug } = req.params;
    const query = req.query;
    const condition = exports.slugConditionMap[slug];
    const { result, total } = await collection_services_1.default.getCollection(condition, slug, query);
    res.json({
        message: message_1.CollectionMessage.GET_COLLECTION_IS_SUCCESS,
        result,
        total
    });
};
exports.getCollectionsController = getCollectionsController;
const getCollectionsFavouriteController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { products, total } = await collection_services_1.default.getProductsInFavourite(user_id);
    res.json({
        message: message_1.CollectionMessage.GET_COLLECTION_FAVOURITE_IS_SUCCESS,
        result: {
            products,
            total
        }
    });
};
exports.getCollectionsFavouriteController = getCollectionsFavouriteController;
const addProductToFavouriteController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { message } = await collection_services_1.default.addProductToFavourite(user_id, req.body);
    res.json({
        message: message
    });
};
exports.addProductToFavouriteController = addProductToFavouriteController;
const addProductToCartController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { message } = await collection_services_1.default.addProductToCart(user_id, req.body);
    res.json({
        message: message
    });
};
exports.addProductToCartController = addProductToCartController;
const updateQuantityProductInCartController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { message } = await collection_services_1.default.updateQuantityProductToCart(user_id, req.body);
    res.json({
        message: message
    });
};
exports.updateQuantityProductInCartController = updateQuantityProductInCartController;
const clearProductInCartController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { message } = await collection_services_1.default.clearProductToCart(user_id);
    res.json({
        message: message
    });
};
exports.clearProductInCartController = clearProductInCartController;
const getCollectionsCartController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { products, total } = await collection_services_1.default.getProductsInCart(user_id);
    res.json({
        message: message_1.CollectionMessage.GET_COLLECTION_CART_IS_SUCCESS,
        result: {
            products,
            total
        }
    });
};
exports.getCollectionsCartController = getCollectionsCartController;
const removeProductToCartController = async (req, res, next) => {
    const { user_id } = req.decode_authorization;
    const findUser = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) });
    if (!findUser) {
        throw new errors_1.ErrorWithStatus({
            message: message_1.UserMessage.USER_NOT_FOUND,
            status: httpStatus_1.default.NOTFOUND
        });
    }
    const { id } = req.params;
    const { message } = await collection_services_1.default.removeProductToCart(user_id, id);
    res.json({
        message: message
    });
};
exports.removeProductToCartController = removeProductToCartController;
