import { Request, Response, NextFunction } from "express"
import path from "path"

export const serveImageController = async (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve("media/img/Laptop/Acer/acer_swift_14_ai", name), (err) => {
    if (err) {
      res.status((err as any).status).send("Not found")
    }
  })
}

// còn nhiều hạn chế nếu tên đường dẫn dài sẽ không truyền vào được | phải cố định