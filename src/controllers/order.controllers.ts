import { Request, Response, NextFunction } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { TokenPayload } from "~/models/requests/user.requests"
import { CreateOrderBodyReq } from "~/models/requests/product.requests"
import orderServices from "~/services/order.services"
import databaseServices from "~/services/database.services"
import { ObjectId } from "mongodb"
import { ErrorWithStatus } from "~/models/errors"
import httpStatus from "~/constant/httpStatus"
import { OrderMessage, UserMessage } from "~/constant/message"

export const createOrderController = async (
  req: Request<ParamsDictionary, any, CreateOrderBodyReq>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const findUser = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!findUser) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }
  const { message } = await orderServices.createOrder(user_id, req.body)
  res.json({
    message: message
  })
}

export const getOrderController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const findUser = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!findUser) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }
  const { result, total } = await orderServices.getOrder(user_id)
  res.json({
    message: OrderMessage.GET_ORDER_IS_SUCCESS,
    result,
    total
  })
}
