"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionsController = exports.slugConditionMap = void 0;
const message_1 = require("../constant/message");
const collection_services_1 = __importDefault(require("../services/collection.services"));
exports.slugConditionMap = {
    "laptop-asus-hoc-tap-va-lam-viec": { brand: "ASUS", category: "Laptop" },
    "laptop-acer-hoc-tap-va-lam-viec": { brand: "ACER", category: "Laptop" },
    "laptop-msi-hoc-tap-va-lam-viec": { brand: "MSI", category: "Laptop" },
    "laptop-lenovo-hoc-tap-va-lam-viec": { brand: "LENOVO", category: "Laptop" },
    "laptop-duoi-15-trieu": { price: { $lt: 15000000 }, category: "Laptop" },
    "laptop-tu-15-den-20-trieu": { price: { $gte: 15000000, $lt: 20000000 }, category: "Laptop" },
    "laptop-tren-20-trieu": { price: { $gte: 20000000 }, category: "Laptop" }
};
const getCollectionsController = async (req, res, next) => {
    const { slug } = req.params;
    const { page, limit } = req.query;
    const condition = exports.slugConditionMap[slug];
    const { result, total } = await collection_services_1.default.getCollection(condition, Number(page), Number(limit));
    res.json({
        message: message_1.CollectionMessage.GET_COLLECTION_IS_SUCCESS,
        result,
        total
    });
};
exports.getCollectionsController = getCollectionsController;
