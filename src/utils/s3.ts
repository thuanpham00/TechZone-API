import { S3 } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { config } from "dotenv"
import fs from "fs"
import { envConfig } from "./config"
config()

const s3 = new S3({
  region: envConfig.aws_region,
  credentials: {
    secretAccessKey: envConfig.aws_secret_access_key,
    accessKeyId: envConfig.aws_access_key_id
  }
})

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
