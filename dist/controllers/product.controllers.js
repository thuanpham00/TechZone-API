"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchProductController = exports.getProductRelatedController = exports.getProductDetailController = void 0;
const message_1 = require("../constant/message");
const product_services_1 = require("../services/product.services");
const getProductDetailController = async (req, res, next) => {
    const result = await product_services_1.productServices.getProductDetail(req.params.id);
    res.json({
        message: message_1.ProductMessage.GET_PRODUCT_SUCCESS,
        result
    });
};
exports.getProductDetailController = getProductDetailController;
const getProductRelatedController = async (req, res, next) => {
    const { brand, category, idProduct } = req.query;
    const result = await product_services_1.productServices.getProductRelated(brand, category, idProduct);
    res.json({
        message: message_1.ProductMessage.GET_PRODUCT_RELATED_SUCCESS,
        result
    });
};
exports.getProductRelatedController = getProductRelatedController;
const getSearchProductController = async (req, res, next) => {
    const { search } = req.query;
    const result = await product_services_1.productServices.getSearchProduct(search);
    res.json({
        message: message_1.ProductMessage.GET_SEARCH_PRODUCT,
        result
    });
};
exports.getSearchProductController = getSearchProductController;
