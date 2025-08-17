import { Request } from "express"
import httpStatus from "~/constant/httpStatus"
import { UserMessage } from "~/constant/message"
import { ErrorWithStatus } from "~/models/errors"
import { verifyToken } from "./jwt"
import { envConfig } from "./config"
import { JsonWebTokenError } from "jsonwebtoken"

export const convertEnumToArray = (enumObject: { [key: string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === "string") as string[]
}

export const convertEnumToArrayNumber = (enumObject: { [key: string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === "number") as number[]
}

export const getNameImage = (fileName: string) => {
  return fileName.split(".")[0]
}

export const getValueObject = (object: { [key: string]: { [x: string]: any } }) => {
  return Object.keys(object) as string[]
}

export function formatCurrency(current: number) {
  return new Intl.NumberFormat("de-DE").format(current)
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: UserMessage.ACCESS_TOKEN_IS_REQUIRED,
      status: httpStatus.UNAUTHORIZED
    })
  }
  try {
    const decode_authorization = await verifyToken({
      token: access_token,
      privateKey: envConfig.secret_key_access_token
    })
    if (req) {
      req.decode_authorization = decode_authorization
      return true
    }
    return decode_authorization
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new ErrorWithStatus({
        message: "AccessToken expired",
        status: httpStatus.UNAUTHORIZED
      })
    }
  }
}
