"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveImageController = void 0;
const path_1 = __importDefault(require("path"));
const serveImageController = async (req, res) => {
    const { name } = req.params;
    return res.sendFile(path_1.default.resolve("media/img/Laptop/Acer/acer_swift_14_ai", name), (err) => {
        if (err) {
            res.status(err.status).send("Not found");
        }
    });
};
exports.serveImageController = serveImageController;
// còn nhiều hạn chế nếu tên đường dẫn dài sẽ không truyền vào được | phải cố định
