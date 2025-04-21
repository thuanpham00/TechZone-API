"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFormData = exports.filterMiddleware = void 0;
const lodash_1 = require("lodash");
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
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error("Error parsing form data:", err);
            return res.status(400).json({ message: "Lỗi khi xử lý dữ liệu form" });
        }
        // ép kiểu lại nếu cần
        req.body = fields;
        req.files = files; // nếu bạn dùng multer thì không có req.files, nhưng formidable thì có
        next();
    });
};
exports.parseFormData = parseFormData;
