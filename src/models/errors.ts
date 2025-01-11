import httpStatus from "~/constant/httpStatus"
import { UserMessage } from "~/constant/message"

type EntityErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

/**
 * type EntityError = {
 *    "email": {
 *      msg: "Email không hợp lệ"
 *      value: "abc"
 *    }
 * }
 */

export class ErrorWithStatus {
  status: number
  message: string
  constructor({ status, message }: { status: number; message: string }) {
    this.status = status
    this.message = message
  }
}

export class EntityError extends ErrorWithStatus {
  errors: EntityErrorType
  constructor({ message = UserMessage.VALIDATION_ERROR, errors }: { message?: string; errors: EntityErrorType }) {
    super({ status: httpStatus.UNPROCESSABLE_ENTITY, message })
    this.errors = errors
  }
}
