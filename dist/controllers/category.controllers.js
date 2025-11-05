"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBannerBaseOnSlugController = exports.getListCategoryMenuIsActiveController = exports.getCategoryListIsActiveController = void 0;
const message_1 = require("../constant/message");
const category_services_1 = __importDefault(require("../services/category.services"));
const getCategoryListIsActiveController = async (req, res) => {
    const categories = await category_services_1.default.getCategoryListIsActive();
    res.status(200).json({
        message: message_1.CategoryMessage.GET_CATEGORY_LIST_IS_SUCCESS,
        data: categories
    });
};
exports.getCategoryListIsActiveController = getCategoryListIsActiveController;
const getListCategoryMenuIsActiveController = async (req, res) => {
    const categoryMenus = await category_services_1.default.getListCategoryMenuIsActive();
    res.status(200).json({
        message: message_1.CategoryMessage.GET_CATEGORY_MENU_LIST_IS_SUCCESS,
        data: categoryMenus
    });
};
exports.getListCategoryMenuIsActiveController = getListCategoryMenuIsActiveController;
const getBannerBaseOnSlugController = async (req, res) => {
    const result = await category_services_1.default.getBannerBaseOnSlug();
    res.status(200).json({
        message: message_1.CategoryMessage.GET_BANNER_BASE_ON_SLUG_IS_SUCCESS,
        data: result
    });
};
exports.getBannerBaseOnSlugController = getBannerBaseOnSlugController;
