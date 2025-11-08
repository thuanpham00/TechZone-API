import { Request, Response, NextFunction } from "express"
import { pick } from "lodash"
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
    req.body = fields as any
    req.files = files as any // nếu bạn dùng multer thì không có req.files, nhưng formidable thì có
    next()
  })
}
