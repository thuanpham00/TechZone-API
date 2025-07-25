import { OrderMessage } from "~/constant/message"
import { CreateOrderBodyReq } from "~/models/requests/product.requests"
import databaseServices from "./database.services"
import { Order } from "~/models/schema/favourite_cart.order.schema"
import { ObjectId } from "mongodb"
import { OrderStatus } from "~/constant/enum"

class OrderServices {
  async getOrder(user_id: string) {
    const orderUserId = await databaseServices.order.findOne({ user_id: new ObjectId(user_id) })
    if (orderUserId === null) {
      return {
        result: [],
        total: 0
      }
    }
    const result = await databaseServices.order
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

    const { customer_info, totalAmount, status, note } = body
    const listIdProductOrder = body.products.map((item) => item.product_id)
    await Promise.all([
      databaseServices.order.insertOne(
        new Order({
          user_id: new ObjectId(user_id),
          customer_info,
          products: productOrder,
          totalAmount,
          status,
          note
        })
      ),
      databaseServices.cart.updateOne(
        {
          user_id: new ObjectId(user_id)
        },
        {
          $pull: {
            products: {
              product_id: { $in: listIdProductOrder.map((id) => new ObjectId(id)) }
            }
          }
        }
      ), 
      // cập nhật số lượng tồn của sản phẩm và lượt mua
      ...productOrder.map((item) => {
        databaseServices.product.updateOne(
          {
            _id: new ObjectId(item.product_id)
          },
          {
            $inc: { stock: -item.quantity, sold: item.quantity }
          }
        )
      })
    ])

    const cartUser = await databaseServices.cart.findOne({ user_id: new ObjectId(user_id) })
    if (cartUser?.products.length === 0) {
      await databaseServices.cart.deleteOne({ user_id: new ObjectId(user_id) })
    }

    return {
      message: OrderMessage.CREATE_ORDER_IS_SUCCESS
    }
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
}

const orderServices = new OrderServices()
export default orderServices
