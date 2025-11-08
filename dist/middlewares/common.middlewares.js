"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFormData = exports.filterMiddleware = void 0;
const lodash_1 = require("lodash");
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const errors_1 = require("../models/errors");
const database_services_1 = __importDefault(require("../services/database.services"));
const filterMiddleware = (filterKey) => {
    return (req, res, next) => {
        req.body = (0, lodash_1.pick)(req.body, filterKey);
        next();
    };
};
exports.filterMiddleware = filterMiddleware;
const parseFormData = async (req, res, next) => {
    const formidable = (await import("formidable")).default;
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error parsing form data:", err);
            return res.status(400).json({ message: "Lỗi khi xử lý dữ liệu form" });
        }
        // ép kiểu lại nếu cần
        req.body = fields;
        const checkUniqueName = await database_services_1.default.product.findOne({ name: req.body.name[0] });
        if (checkUniqueName) {
            return next(new errors_1.ErrorWithStatus({
                message: message_1.ProductMessage.NAME_IS_INVALID,
                status: httpStatus_1.default.BAD_REQUESTED
            }));
        }
        req.files = files; // nếu bạn dùng multer thì không có req.files, nhưng formidable thì có
        next();
    });
};
exports.parseFormData = parseFormData;
