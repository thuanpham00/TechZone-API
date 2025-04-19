import { Request } from "express"
import formidable, { File } from "formidable"
import fs from "fs"
import { UPLOAD_IMAGE_TEMP_DIR } from "~/constant/dir"

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_IMAGE_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_IMAGE_TEMP_DIR, { recursive: true }) // cho phép thư mục lồng
  }
}

export const handleUploadImage = async (req: Request) => {
  // do formidable v3 sử dụng ESModule mà dự án dùng commonJS nên cần chuyển formidable v3 sang commonJS để biên dịch chính xác
  const formidable = (await import("formidable")).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR, // đường dẫn trỏ tới thư mục lưu
    maxFiles: 4, // up tối đa 4 file
    keepExtensions: true, // hiển thị đuôi file mở rộng
    maxFileSize: 500 * 1024, // 500KB
    maxTotalFileSize: 500 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === "image" && Boolean(mimetype?.includes("image/"))

      // filter chỉ upload được hình ảnh
      if (!valid) {
        form.emit("error" as any, new Error("File type is not valid") as any)
      }

      return valid
    }
  })

  return new Promise<{ files: File[]; fields: formidable.Fields }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // check nếu file rỗng
      if (!Boolean(files.image)) {
        return reject(new Error("File is empty"))
      }
      // console.log(files)
      resolve({ files: files.image as File[], fields: fields })
    })
  })
}
