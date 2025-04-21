"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaServices = void 0;
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const dir_1 = require("../constant/dir");
const fs_1 = __importDefault(require("fs"));
const s3_1 = require("../utils/s3");
const enum_1 = require("../constant/enum");
const common_1 = require("../utils/common");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class MediaServices {
    async uploadImageList(files, nameCategory, idProduct) {
        const upload = await Promise.all(files.map(async (file) => {
            const newName = (0, common_1.getNameImage)(file.newFilename);
            const newFullName = `${newName}.jpg`;
            const newPath = path_1.default.resolve(dir_1.UPLOAD_IMAGE_DIR, newFullName);
            sharp_1.default.cache(false);
            await (0, sharp_1.default)(file.filepath).jpeg().toFile(newPath); // lấy đường dẫn ảnh temp và chuyển thành ảnh jpeg và lưu vào đường dẫn mới
            const mime = (await import("mime")).default;
            const s3Result = await (0, s3_1.uploadFileToS3)({
                fileName: "image/" + nameCategory + "/" + idProduct + "/medias/" + newFullName,
                filePath: newPath,
                ContentType: mime.getType(newPath) // chặn người khác download hình ảnh
            });
            fs_1.default.unlinkSync(file.filepath); // xóa ảnh tạm
            fs_1.default.unlinkSync(newPath); // xóa ảnh gốc sau khi chuyển đổi
            return {
                url: s3Result.Location,
                type: enum_1.MediaType.Image
            };
        }));
        // const result = databaseServices.product.updateOne(
        //   { _id: new ObjectId(idProduct) },
        //   {
        //     $push: {
        //       medias: {
        //         $each: upload // thêm nhiều ảnh cùng 1 lúc (còn nếu 1 ảnh thì không dùng $each) ==> medias = upload
        //       }
        //     },
        //     $currentDate: {
        //       updated_at: true
        //     }
        //   }
        // )
        return {
            upload
        };
    }
    async uploadBanner(file, nameCategory, idProduct) {
        const newName = (0, common_1.getNameImage)(file.newFilename);
        const newFullName = `${newName}.jpg`;
        const newPath = path_1.default.resolve(dir_1.UPLOAD_IMAGE_DIR, newFullName);
        sharp_1.default.cache(false);
        await (0, sharp_1.default)(file.filepath).jpeg().toFile(newPath); // lấy đường dẫn ảnh temp và chuyển thành ảnh jpeg và lưu vào đường dẫn mới
        const mime = (await import("mime")).default;
        const s3Result = await (0, s3_1.uploadFileToS3)({
            fileName: "image/" + nameCategory + "/" + idProduct + "/banner/" + newFullName,
            filePath: newPath,
            ContentType: mime.getType(newPath) // chặn người khác download hình ảnh
        });
        fs_1.default.unlinkSync(file.filepath); // xóa ảnh tạm
        fs_1.default.unlinkSync(newPath); // xóa ảnh gốc sau khi chuyển đổi
        return {
            url: s3Result.Location,
            type: enum_1.MediaType.Image
        };
    }
    async uploadImageProfile(file, userId) {
        const newName = (0, common_1.getNameImage)(file.newFilename);
        const newFullName = `${newName}.jpg`;
        const newPath = path_1.default.resolve(dir_1.UPLOAD_IMAGE_DIR, newFullName);
        sharp_1.default.cache(false);
        await (0, sharp_1.default)(file.filepath).jpeg().toFile(newPath); // lấy đường dẫn ảnh temp và chuyển thành ảnh jpeg và lưu vào đường dẫn mới
        const mime = (await import("mime")).default;
        const s3Result = await (0, s3_1.uploadFileToS3)({
            fileName: "avatar/" + userId + "/" + newFullName,
            filePath: newPath,
            ContentType: mime.getType(newPath) // chặn người khác download hình ảnh
        });
        fs_1.default.unlinkSync(file.filepath); // xóa ảnh tạm
        fs_1.default.unlinkSync(newPath); // xóa ảnh gốc sau khi chuyển đổi
        return {
            url: s3Result.Location,
            type: enum_1.MediaType.Image
        };
    }
}
exports.mediaServices = new MediaServices();
