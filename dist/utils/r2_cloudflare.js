"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToR2 = uploadToR2;
exports.deleteFromR2 = deleteFromR2;
exports.getKeyFromR2Url = getKeyFromR2Url;
exports.deleteFromR2ByUrl = deleteFromR2ByUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("./config");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
(0, dotenv_1.config)();
const r2 = new client_s3_1.S3Client({
    region: "auto", // R2 không cần region cụ thể
    endpoint: `https://${config_1.envConfig.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config_1.envConfig.R2_ACCESS_KEY_ID,
        secretAccessKey: config_1.envConfig.R2_SECRET_ACCESS_KEY
    }
});
// Hàm upload ảnh
// Hàm upload ảnh lên R2
async function uploadToR2({ fileName, filePath, ContentType }) {
    const fileBuffer = fs_1.default.readFileSync(filePath);
    const command = new client_s3_1.PutObjectCommand({
        Bucket: config_1.envConfig.R2_BUCKET_NAME,
        Key: fileName, // đường dẫn trong bucket
        Body: fileBuffer,
        ContentType: ContentType
    });
    await r2.send(command);
    return {
        Location: `https://${config_1.envConfig.R2_LINK_PUBLIC}/${fileName}`
    };
}
async function deleteFromR2(key) {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: config_1.envConfig.R2_BUCKET_NAME,
        Key: key
    });
    await r2.send(command);
    return { deleted: true };
}
function getKeyFromR2Url(url) {
    const prefix = `https://${config_1.envConfig.R2_LINK_PUBLIC}/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : url;
}
async function deleteFromR2ByUrl(url) {
    const key = getKeyFromR2Url(url);
    return deleteFromR2(key);
}
