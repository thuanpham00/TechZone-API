import { Request, Response, NextFunction } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { TokenPayload } from "~/models/requests/user.requests"
import orderServices from "~/services/order.services"
import databaseServices from "~/services/database.services"
import { ObjectId } from "mongodb"
import { ErrorWithStatus } from "~/models/errors"
import httpStatus from "~/constant/httpStatus"
import { OrderMessage, UserMessage } from "~/constant/message"
import { handleParseDataReviewOrder } from "~/utils/file"

export const updateStatusOrderForCustomerController = async (
  req: Request<ParamsDictionary, any, { status: number }>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  const { status } = req.body
  const { user_id } = req.decode_authorization as TokenPayload
  const findUser = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!findUser) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }
  const { message } = await orderServices.updateStatusOrder(id, status)
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

function parseReviewFromFields(fields: Record<string, any>, files: Record<string, any>) {
  const reviews: any[] = []

  const reviewIndexes = Array.from(
    new Set(
      Object.keys(fields)
        .map((key) => {
          const match = key.match(/^reviews\[(\d+)\]/)
          return match ? match[1] : null
        })
        .filter(Boolean)
    )
  )

  reviewIndexes.forEach((index) => {
    const review: any = {
      product_id: fields[`reviews[${index}][product_id]`][0],
      rating: fields[`reviews[${index}][rating]`][0],
      comment: fields[`reviews[${index}][comment]`][0],
      title: fields[`reviews[${index}][title]`][0],
      images: []
    }
    let imgIdx = 0
    while (files[`reviews[${index}][image][${imgIdx}]`]) {
      review.images.push(files[`reviews[${index}][image][${imgIdx}]`][0])
      imgIdx++
    }
    reviews.push(review)
  })

  return reviews
}

export const addReviewToOrderController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params // id đơn hàng
  const { user_id } = req.decode_authorization as TokenPayload // id người đánh giá
  const { fields, files } = await handleParseDataReviewOrder(req)

  const findUser = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!findUser) {
    throw new ErrorWithStatus({
      message: UserMessage.USER_NOT_FOUND,
      status: httpStatus.NOTFOUND
    })
  }

  const review = parseReviewFromFields(fields, files)

  const { message } = await orderServices.addReviewToOrder(id, user_id, review)

  res.json({
    message
  })
}

export const getOrderTopReviewController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const result = await orderServices.getOrderTopReview()
  res.json({
    message: OrderMessage.GET_TOP_REVIEW_ORDER_NEWEST_IS_SUCCESS,
    result
  })
}
