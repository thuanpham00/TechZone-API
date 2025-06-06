"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
(0, dotenv_1.config)();
const s3 = new client_s3_1.S3({
    region: config_1.envConfig.aws_region,
    credentials: {
        secretAccessKey: config_1.envConfig.aws_secret_access_key,
        accessKeyId: config_1.envConfig.aws_access_key_id
    }
});
const uploadFileToS3 = ({ fileName, filePath, ContentType }) => {
    const parallelUploads3 = new lib_storage_1.Upload({
        client: s3,
        params: {
            Bucket: "tech-zone-dev-ap-southeast-1",
            Key: fileName,
            Body: fs_1.default.readFileSync(filePath),
            ContentType: ContentType
        },
        // optional tags
        tags: [
        /*...*/
        ],
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false
    });
    return parallelUploads3.done();
};
exports.uploadFileToS3 = uploadFileToS3;
