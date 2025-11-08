import { Request, Response, NextFunction } from "express"
import { ErrorWithStatus } from "~/models/errors"
import { omit } from "lodash"
import httpStatus from "~/constant/httpStatus"

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(omit(err, ["status"]))
    return
  }
  try {
    const finalError: any = {}

    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.enumerable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return // trường hợp inActive từ aws (key: "isInactive")
      }
      finalError[key] = err[key]
    })
    if (finalError !== null) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
        errorInfo: omit(finalError, ["stack"])
      })
    }
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      errorInfo: omit(error as any, ["stack"])
    })
  }
}

// Object.getOwnPropertyDescriptor: Trả về một descriptor object mô tả các thuộc tính của một thuộc tính cụ thể trên đối tượng.
// Object.getOwnPropertyNames: Trả về một mảng chứa tất cả các tên thuộc tính (cả enumerable và non-enumerable) trên đối tượng được chỉ định.
