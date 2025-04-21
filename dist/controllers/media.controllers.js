"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageUserController = exports.uploadBannerProductController = exports.uploadImageListProductController = void 0;
const httpStatus_1 = __importDefault(require("../constant/httpStatus"));
const message_1 = require("../constant/message");
const medias_services_1 = require("../services/medias.services");
const file_1 = require("../utils/file");
const uploadImageListProductController = async (req, res, next) => {
    const { files, fields } = await (0, file_1.handleUploadImage)(req); // lưu ảnh vào đường dẫn tạm thời chờ xử lý
    const nameCategory = fields.nameCategory?.[0];
    const idProduct = fields.idProduct?.[0];
    if (!nameCategory || !idProduct) {
        res.status(httpStatus_1.default.NOTFOUND).json({
            message: message_1.MediaMessage.UPLOAD_IMAGE_IS_FAILED
        });
    }
    const result = await medias_services_1.mediaServices.uploadImageList(files, nameCategory, idProduct);
    res.json({
        message: message_1.MediaMessage.UPLOAD_IMAGE_IS_SUCCESS,
        result: result
    });
};
exports.uploadImageListProductController = uploadImageListProductController;
const uploadBannerProductController = async (req, res, next) => {
    const { files, fields } = await (0, file_1.handleUploadImage)(req);
    const nameCategory = fields.nameCategory?.[0];
    const idProduct = fields.idProduct?.[0];
    if (!nameCategory || !idProduct) {
        res.status(httpStatus_1.default.NOTFOUND).json({
            message: message_1.MediaMessage.UPLOAD_IMAGE_IS_FAILED
        });
    }
    const result = await medias_services_1.mediaServices.uploadBanner(files[0], nameCategory, idProduct);
    res.json({
        message: message_1.MediaMessage.UPLOAD_IMAGE_IS_SUCCESS,
        result: result
    });
};
exports.uploadBannerProductController = uploadBannerProductController;
const uploadImageUserController = async (req, res, next) => {
    const { files, fields } = await (0, file_1.handleUploadImage)(req);
    const idProduct = fields.userId?.[0];
    if (!idProduct) {
        res.status(httpStatus_1.default.NOTFOUND).json({
            message: message_1.MediaMessage.UPLOAD_IMAGE_IS_FAILED
        });
    }
    const result = await medias_services_1.mediaServices.uploadImageProfile(files[0], idProduct);
    res.json({
        message: message_1.MediaMessage.UPLOAD_IMAGE_IS_SUCCESS,
        result: result
    });
};
exports.uploadImageUserController = uploadImageUserController;
// nếu mà tạo sản phẩm đầu tiên sẽ có id sản phẩm sau đó chạy api upload ảnh thì truyền id sản phẩm vào làm folder ảnh của 1 sản phẩm
// image/nameDanhMuc/idProduct/banner/1.jpg
// image/nameDanhMuc/idProduct/medias/2.jpg
// image/nameDanhMuc/idProduct/medias/3.jpg
// image/nameDanhMuc/idProduct/medias/4.jpg
