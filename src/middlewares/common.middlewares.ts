import { Request, Response, NextFunction } from "express"
import { pick } from "lodash"
import httpStatus from "~/constant/httpStatus"
import { ProductMessage } from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import databaseServices from "~/services/database.services"

type FilterKey<T> = Array<keyof T>

export const filterMiddleware = <P>(filterKey: FilterKey<P>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKey)
    next()
  }
}

export const parseFormData = async (req: Request, res: Response, next: NextFunction) => {
  const formidable = (await import("formidable")).default
  const form = formidable({ multiples: true })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err)
      return res.status(400).json({ message: "Lỗi khi xử lý dữ liệu form" })
    }

    // ép kiểu lại nếu cần
    req.body = fields
    const checkUniqueName = await databaseServices.product.findOne({ name: req.body.name[0] })
    if (checkUniqueName) {
      return next(
        new ErrorWithStatus({
          message: ProductMessage.NAME_IS_INVALID,
          status: httpStatus.BAD_REQUESTED
        })
      )
    }
    req.files = files as any // nếu bạn dùng multer thì không có req.files, nhưng formidable thì có
    next()
  })
}
