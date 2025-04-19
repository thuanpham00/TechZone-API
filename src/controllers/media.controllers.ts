import { Request, Response, NextFunction } from "express"
import httpStatus from "~/constant/httpStatus"
import { MediaMessage } from "~/constant/message"
import { mediaServices } from "~/services/medias.services"
import { handleUploadImage } from "~/utils/file"

export const uploadImageListProductController = async (req: Request, res: Response, next: NextFunction) => {
  const { files, fields } = await handleUploadImage(req) // lưu ảnh vào đường dẫn tạm thời chờ xử lý

  const nameCategory = fields.nameCategory?.[0] as string
  const idProduct = fields.idProduct?.[0] as string

  if (!nameCategory || !idProduct) {
    res.status(httpStatus.NOTFOUND).json({
      message: MediaMessage.UPLOAD_IMAGE_IS_FAILED
    })
  }

  const result = await mediaServices.uploadImageList(files, nameCategory, idProduct)

  res.json({
    message: MediaMessage.UPLOAD_IMAGE_IS_SUCCESS,
    result: result
  })
}

export const uploadBannerProductController = async (req: Request, res: Response, next: NextFunction) => {
  const { files, fields } = await handleUploadImage(req)

  const nameCategory = fields.nameCategory?.[0] as string
  const idProduct = fields.idProduct?.[0] as string

  if (!nameCategory || !idProduct) {
    res.status(httpStatus.NOTFOUND).json({
      message: MediaMessage.UPLOAD_IMAGE_IS_FAILED
    })
  }

  const result = await mediaServices.uploadBanner(files[0], nameCategory, idProduct)

  res.json({
    message: MediaMessage.UPLOAD_IMAGE_IS_SUCCESS,
    result: result
  })
}

export const uploadImageUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { files, fields } = await handleUploadImage(req)

  const idProduct = fields.userId?.[0] as string

  if (!idProduct) {
    res.status(httpStatus.NOTFOUND).json({
      message: MediaMessage.UPLOAD_IMAGE_IS_FAILED
    })
  }

  const result = await mediaServices.uploadImageProfile(files[0], idProduct)

  res.json({
    message: MediaMessage.UPLOAD_IMAGE_IS_SUCCESS,
    result: result
  })
}

// nếu mà tạo sản phẩm đầu tiên sẽ có id sản phẩm sau đó chạy api upload ảnh thì truyền id sản phẩm vào làm folder ảnh của 1 sản phẩm
// image/nameDanhMuc/idProduct/banner/1.jpg
// image/nameDanhMuc/idProduct/medias/2.jpg
// image/nameDanhMuc/idProduct/medias/3.jpg
// image/nameDanhMuc/idProduct/medias/4.jpg
