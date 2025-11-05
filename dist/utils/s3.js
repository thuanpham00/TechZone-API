"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
const config_1 = require("./config");
(0, dotenv_1.config)();
const s3 = new client_s3_1.S3({
    region: config_1.envConfig.aws_region,
    credentials: {
        secretAccessKey: config_1.envConfig.aws_secret_access_key,
        accessKeyId: config_1.envConfig.aws_access_key_id
    }
});
// export const uploadFileToS3 = ({
//   fileName,
//   filePath,
//   ContentType
// }: {
//   fileName: string
//   filePath: string
//   ContentType: string
// }) => {
//   const parallelUploads3 = new Upload({
//     client: s3,
//     params: {
//       Bucket: "tech-zone-dev-ap-southeast-1",
//       Key: fileName,
//       Body: fs.readFileSync(filePath),
//       ContentType: ContentType
//     },
//     // optional tags
//     tags: [
//       /*...*/
//     ],
//     queueSize: 4,
//     partSize: 1024 * 1024 * 5,
//     leavePartsOnError: false
//   })
//   return parallelUploads3.done()
// }
