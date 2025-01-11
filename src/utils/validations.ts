import { Request, Response, NextFunction } from "express"
import { ValidationChain, validationResult } from "express-validator"
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema"
import httpStatus from "~/constant/httpStatus"
import { EntityError, ErrorWithStatus } from "~/models/errors"

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next() // nếu không có lỗi thì chuyển tới middleware tiếp theo
    }
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      // nếu khác lỗi 422 thì trả về error handler
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg) // chuyển tới error handler
      }

      entityError.errors[key] = errorsObject[key]
    }
    next(entityError)
  }
}
