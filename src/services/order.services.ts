import { OrderMessage, UserMessage } from "~/constant/message"
import { CreateOrderBodyReq } from "~/models/requests/product.requests"
import databaseServices from "./database.services"
import { Order } from "~/models/schema/favourite_cart.order.schema"
import Review from "~/models/schema/review.schema"
import { ObjectId } from "mongodb"
import { OrderStatus, TypeOrder } from "~/constant/enum"
import { mediaServices } from "./medias.services"
import { pipeline } from "stream"

class OrderServices {
  async getOrder(user_id: string) {
    const orderUserId = await databaseServices.order.findOne({ user_id: new ObjectId(user_id) })
    if (orderUserId === null) {
      return {
        result: [],
        total: 0
      }
    }
    let result = await databaseServices.order
      .aggregate([
        {
          $match: {
            user_id: new ObjectId(user_id)
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ])
      .toArray()
    const total = result.length
    const orderIdReview = result.filter((order) => order.isReview === true).map((order) => order._id.toString())
    const listReviewOrders = await Promise.all(
      orderIdReview.map(async (id) => {
        const reviews = await databaseServices.reviews
          .find(
            { orderId: new ObjectId(id) },
            {
              projection: { productId: 1, orderId: 1, rating: 1, comment: 1, title: 1, images: 1, created_at: 1 }
            }
          )
          .toArray()
        return await Promise.all(
          reviews.map(async (r) => {
            const product = await databaseServices.product.findOne(
              { _id: r.productId },
              {
                projection: { name: 1, banner: 1 }
              }
            )
            return {
              ...r,
              productId: product
            }
          })
        )
      })
    )
    let list: any = []
    listReviewOrders.map((reviewOrder, index) => {
      list = [...list, ...reviewOrder] // gộp các mảng con thành một mảng lớn
    })
    list.forEach((item: any) => {
      const findOrder = result.findIndex((ord) => ord._id.toString() === item.orderId.toString())
      if (findOrder !== -1) {
        if (!result[findOrder].reviews) {
          result[findOrder].reviews = []
        }
        result[findOrder].reviews.push(item)
      }
    })
    return {
      result,
      total
    }
  }

  async createOrder(user_id: string, body: CreateOrderBodyReq) {
    const productOrder = body.products.map((item) => ({
      ...item,
      product_id: new ObjectId(item.product_id)
    }))

    const {
      customer_info,
      totalAmount,
      note,
      shipping_fee,
      subTotal,
      type_order,
      voucher_id,
      voucher_code,
      discount_amount
    } = body

    // Nếu có voucher, validate và tăng used_count
    if (voucher_id && voucher_code) {
      await databaseServices.vouchers.updateOne(
        { _id: new ObjectId(voucher_id) },
        {
          $inc: { used_count: 1 },
          $currentDate: { updated_at: true }
        }
      )
    }

    const [order] = await Promise.all([
      databaseServices.order.insertOne(
        new Order({
          user_id: new ObjectId(user_id),
          customer_info,
          products: productOrder,
          subTotal,
          shipping_fee,
          totalAmount,
          status: type_order === TypeOrder.cod ? OrderStatus.pending : OrderStatus.loading,
          note,
          type_order,
          voucher_id: voucher_id ? new ObjectId(voucher_id) : undefined,
          voucher_code: voucher_code || undefined,
          discount_amount: discount_amount || 0
        })
      )
    ])

    return order.insertedId
  }

  async updateStatusOrder(id: string, status: number) {
    await databaseServices.order.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: status === 0 ? OrderStatus.cancelled : OrderStatus.delivered
        },
        $push: {
          status_history: {
            status: status === 0 ? OrderStatus.cancelled : OrderStatus.delivered,
            updated_at: new Date()
          }
        },
        $currentDate: { updated_at: true }
      }
    )

    return {
      message: status === 0 ? OrderMessage.CANCEL_ORDER_IS_SUCCESS : OrderMessage.RECEIVE_ORDER_IS_SUCCESS
    }
  }

  async addReviewToOrder(
    orderId: string,
    userId: string,
    reviews: { product_id: string; rating: number; comment: string; title: string; images: any[] }[]
  ) {
    await Promise.all(
      reviews.map(async (r) => {
        const { upload } = await mediaServices.uploadListImageReviewOrder(r.images, orderId)
        const reviewId = new ObjectId()
        await Promise.all([
          databaseServices.reviews.insertOne(
            new Review({
              _id: reviewId,
              productId: new ObjectId(r.product_id),
              userId: new ObjectId(userId),
              orderId: new ObjectId(orderId),
              rating: Number(r.rating),
              title: r.title,
              comment: r.comment,
              images: upload
            })
          ),
          databaseServices.order.updateOne(
            { _id: new ObjectId(orderId) },
            {
              $set: { isReview: true },
              $currentDate: { updated_at: true }
            }
          )
        ])
        const findReviews = await databaseServices.reviews.find({ productId: new ObjectId(r.product_id) }).toArray()
        const totalRating = findReviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = findReviews.length ? totalRating / findReviews.length : 0
        const rounded = Math.round(averageRating * 10) / 10
        databaseServices.product.updateOne(
          { _id: new ObjectId(r.product_id) },
          {
            $addToSet: { reviews: reviewId },
            $set: { averageRating: rounded },
            $currentDate: { updated_at: true }
          }
        )
      })
    )

    return {
      message: UserMessage.ADD_REVIEW_IS_SUCCESS
    }
  }

  async getOrderTopReview() {
    const result = await databaseServices.reviews
      .aggregate([
        {
          $match: {
            rating: { $gte: 4 }
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "productId",
            foreignField: "_id",
            as: "productId",
            pipeline: [{ $project: { _id: 1, name: 1, discount: 1, price: 1, priceAfterDiscount: 1, banner: 1 } }]
          }
        },
        {
          $unwind: {
            path: "$productId"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
            pipeline: [{ $project: { avatar: 1, _id: 1, name: 1 } }]
          }
        },
        {
          $unwind: {
            path: "$userId"
          }
        },
        {
          $sort: {
            created_at: -1 // Sắp xếp theo ngày tạo giảm dần
          }
        },
        {
          $limit: 10
        }
      ])
      .toArray()

    return result
  }
}

const orderServices = new OrderServices()
export default orderServices
