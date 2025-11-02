import path from "path"
import sharp from "sharp"
import { Media } from "~/constant/common"
import { UPLOAD_IMAGE_DIR } from "~/constant/dir"
import fs from "fs"
import { MediaType } from "~/constant/enum"
import { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3"
import { getNameImage } from "~/utils/common"
import { config } from "dotenv"
import { File } from "formidable"
import { uploadToR2 } from "~/utils/r2_cloudflare"
config()

class MediaServices {
  async uploadImageList(files: File[], nameCategory: string, idProduct: string) {
    const upload: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameImage(file.newFilename)
        const newFullName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath) // lấy đường dẫn ảnh temp và chuyển thành ảnh jpeg và lưu vào đường dẫn mới
        const mime = (await import("mime")).default
        const r2Result = await uploadToR2({
          fileName: "image/" + nameCategory + "/" + idProduct + "/medias/" + newFullName,
          filePath: newPath,
          ContentType: mime.getType(newPath) as string // chặn người khác download hình ảnh
        })
        fs.unlinkSync(file.filepath) // xóa ảnh tạm
        fs.unlinkSync(newPath) // xóa ảnh gốc sau khi chuyển đổi

        return {
          url: (r2Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )
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
    }
  }

  async uploadBanner(file: File, nameCategory: string, idProduct: string) {
    const newName = getNameImage(file.newFilename)
    const newFullName = `${newName}.jpg`
    const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
    sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath) // lấy đường dẫn ảnh temp và chuyển thành ảnh jpeg và lưu vào đường dẫn mới
    const mime = (await import("mime")).default
    const r2Result = await uploadToR2({
      fileName: "image/" + nameCategory + "/" + idProduct + "/banner/" + newFullName,
      filePath: newPath,
      ContentType: mime.getType(newPath) as string // chặn người khác download hình ảnh
    })
    fs.unlinkSync(file.filepath) // xóa ảnh tạm
    fs.unlinkSync(newPath) // xóa ảnh gốc sau khi chuyển đổi

    return {
      url: (r2Result as CompleteMultipartUploadCommandOutput).Location as string,
      type: MediaType.Image
    }
  }

  async uploadImageProfile(file: File, userId: string) {
    const newName = getNameImage(file.newFilename)
    const newFullName = `${newName}.jpg`
    const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
    sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath) // lấy đường dẫn ảnh temp và chuyển thành ảnh jpeg và lưu vào đường dẫn mới
    const mime = (await import("mime")).default
    const s3Result = await uploadToR2({
      fileName: "avatar/" + userId + "/" + newFullName,
      filePath: newPath,
      ContentType: mime.getType(newPath) as string // chặn người khác download hình ảnh
    })
    fs.unlinkSync(file.filepath) // xóa ảnh tạm
    fs.unlinkSync(newPath) // xóa ảnh gốc sau khi chuyển đổi

    return {
      url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
      type: MediaType.Image
    }
  }

  async uploadBannerCategoryLink(file: File, idCategory: string) {
    const newName = getNameImage(file.newFilename)
    const newFullName = `${newName}.jpg`
    const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
    sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath) // lấy đường dẫn ảnh temp và chuyển thành ảnh jpeg và lưu vào đường dẫn mới
    const mime = (await import("mime")).default
    const r2Result = await uploadToR2({
      fileName: "Category-Menu/" + idCategory + "/" + newFullName,
      filePath: newPath,
      ContentType: mime.getType(newPath) as string // chặn người khác download hình ảnh
    })
    fs.unlinkSync(file.filepath) // xóa ảnh tạm
    fs.unlinkSync(newPath) // xóa ảnh gốc sau khi chuyển đổi

    return {
      url: (r2Result as CompleteMultipartUploadCommandOutput).Location as string,
      type: MediaType.Image
    }
  }
}

export const mediaServices = new MediaServices()
