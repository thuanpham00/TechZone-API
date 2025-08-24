import { RoleType } from "~/constant/enum"
import databaseServices from "./database.services"
import { ObjectId } from "mongodb"

class ConversationServices {
  async getUserListType(user_id: string, typeUser: string) {
    // const listUser = await databaseServices.users
    //   .find(
    //     { role: typeUser === "staff" ? RoleType.ADMIN : RoleType.USER },
    //     {
    //       projection: {
    //         _id: 1,
    //         name: 1,
    //         avatar: 1,
    //         role: 1,
    //         email: 1,
    //         numberPhone: 1
    //       }
    //     }
    //   )
    //   .sort({ created_at: -1 }) // -1 = DESC, 1 = ASC
    //   .toArray()

    // const listUserFilter = listUser.filter((item) => item._id.toString() !== user_id.toString())

    // const listMessageFinalUserIdToUserOther = await Promise.all(
    //   listUserFilter.map(async (item) => {
    //     const res = await databaseServices.conversation.findOne(
    //       {
    //         $or: [
    //           { sender_id: new ObjectId(user_id), receiver_id: new ObjectId(item._id) },
    //           { sender_id: new ObjectId(item._id), receiver_id: new ObjectId(user_id) }
    //         ]
    //       },
    //       { sort: { created_at: -1 } } // lấy bản ghi cũ nhất
    //     )
    //     return res
    //   })
    // )

    // const listUserWithMessageFinal = listUserFilter.map((item) => {
    //   const findUser = listMessageFinalUserIdToUserOther.find(
    //     (userMessage) =>
    //       userMessage?.sender_id.toString() === item._id.toString() ||
    //       userMessage?.receiver_id.toString() === item._id.toString()
    //   )
    //   return {
    //     ...item,
    //     content: findUser?.content || null,
    //     lastMessageAt: findUser?.created_at || null
    //   }
    // })

    return {
      result: [],
      total: 0
    }

    // return {
    //   result: listUserWithMessageFinal || [],
    //   total: listUserWithMessageFinal.length || 0
    // }
  }

  async getConversationByReceiver({
    senderId,
    receiverId,
    limit,
    page
  }: {
    senderId: string
    receiverId: string
    limit: number
    page: number
  }) {
    const [conversations, total] = await Promise.all([
      databaseServices.conversation
        .find({
          $or: [
            {
              sender_id: new ObjectId(senderId),
              receiver_id: new ObjectId(receiverId)
            },
            {
              sender_id: new ObjectId(receiverId),
              receiver_id: new ObjectId(senderId)
            }
          ]
        })
        .sort({ created_at: -1 })
        .skip(limit * (page - 1))
        .limit(limit)
        .toArray(),

      databaseServices.conversation
        .find({
          $or: [
            {
              sender_id: new ObjectId(senderId),
              receiver_id: new ObjectId(receiverId)
            },
            {
              sender_id: new ObjectId(receiverId),
              receiver_id: new ObjectId(senderId)
            }
          ]
        })
        .toArray()
    ])

    return {
      conversations,
      total: total.length
    }
  }
}

const conversationServices = new ConversationServices()
export default conversationServices
