"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadImage = exports.initFolder = void 0;
const fs_1 = __importDefault(require("fs"));
const dir_1 = require("../constant/dir");
const initFolder = () => {
    if (!fs_1.default.existsSync(dir_1.UPLOAD_IMAGE_TEMP_DIR)) {
        fs_1.default.mkdirSync(dir_1.UPLOAD_IMAGE_TEMP_DIR, { recursive: true }); // cho phép thư mục lồng
    }
};
exports.initFolder = initFolder;
const handleUploadImage = async (req) => {
    // do formidable v3 sử dụng ESModule mà dự án dùng commonJS nên cần chuyển formidable v3 sang commonJS để biên dịch chính xác
    const formidable = (await import("formidable")).default;
    const form = formidable({
        uploadDir: dir_1.UPLOAD_IMAGE_TEMP_DIR, // đường dẫn trỏ tới thư mục lưu
        maxFiles: 4, // up tối đa 4 file
        keepExtensions: true, // hiển thị đuôi file mở rộng
        maxFileSize: 500 * 1024, // 500KB
        maxTotalFileSize: 500 * 1024 * 4,
        filter: function ({ name, originalFilename, mimetype }) {
            const valid = name === "image" && Boolean(mimetype?.includes("image/"));
            // filter chỉ upload được hình ảnh
            if (!valid) {
                form.emit("error", new Error("File type is not valid"));
            }
            return valid;
        }
    });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            // check nếu file rỗng
            if (!Boolean(files.image)) {
                return reject(new Error("File is empty"));
            }
            // console.log(files)
            resolve({ files: files.image, fields: fields });
        });
    });
};
exports.handleUploadImage = handleUploadImage;
