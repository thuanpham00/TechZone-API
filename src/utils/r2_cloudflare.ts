import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { envConfig } from "./config"
import { config } from "dotenv"
import fs from "fs"
config()

const r2 = new S3Client({
  region: "auto", // R2 không cần region cụ thể
  endpoint: `https://${envConfig.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: envConfig.R2_ACCESS_KEY_ID,
    secretAccessKey: envConfig.R2_SECRET_ACCESS_KEY
  }
})

// Hàm upload ảnh
// Hàm upload ảnh lên R2
export async function uploadToR2({
  fileName,
  filePath,
  ContentType
}: {
  fileName: string
  filePath: string
  ContentType: string
}) {
  const fileBuffer = fs.readFileSync(filePath)

  const command = new PutObjectCommand({
    Bucket: envConfig.R2_BUCKET_NAME,
    Key: fileName, // đường dẫn trong bucket
    Body: fileBuffer,
    ContentType: ContentType
  })

  await r2.send(command)

  return {
    Location: `https://${envConfig.R2_LINK_PUBLIC}/${fileName}`
  }
}
