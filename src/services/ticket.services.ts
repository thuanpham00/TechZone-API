import { UserType } from "~/models/schema/users.schema"
import databaseServices from "./database.services"
import { TicketMessage } from "~/models/schema/ticket_message.schema"
import { ObjectId, WithId } from "mongodb"
import { MessageType, TicketStatus } from "~/constant/enum"
import { ErrorWithStatus } from "~/models/errors"
import { Media } from "~/constant/common"

class TicketServices {
  async insertMessageTicket({
    ticketId,
    sender_id,
    infoUser,
    content,
    type,
    sender_type,
    attachments
  }: {
    ticketId: string
    sender_id: string
    infoUser: UserType
    content: string
    type: MessageType
    sender_type: string
    attachments?: Media[]
  }) {
    const payload: any = {
      ticket_id: new ObjectId(ticketId),
      sender_id: new ObjectId(sender_id),
      sender_type: sender_type as "customer" | "staff",
      sender_name: infoUser?.name,
      sender_avatar: infoUser?.avatar,
      content: content !== "" ? content : null,
      type: type,
      is_read: false,
      created_at: new Date()
    }
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map((item) => ({
        id: new ObjectId(),
        url: item.url,
        type: item.type
      }))
    }
    const result = await databaseServices.ticketMessages.insertOne(new TicketMessage(payload))

    const findMessage = await databaseServices.ticketMessages.findOne({ _id: result.insertedId })
    return findMessage
  }

  async getListTicketBaseOnStatus(status: TicketStatus) {
    const listTicket = await databaseServices.tickets
      .aggregate([
        {
          $match: {
            status
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "customer_id",
            foreignField: "_id",
            as: "users",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  avatar: 1,
                  numberPhone: 1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$users"
          }
        }
      ])
      .toArray()

    return listTicket
  }

  async updateStatusAssignTicket(idTicket: string, assigned_to: string) {
    const findUserAdmin = await databaseServices.users.findOne({ _id: new ObjectId(assigned_to) })
    const date = new Date()
    await Promise.all([
      databaseServices.tickets.updateOne(
        { _id: new ObjectId(idTicket) },
        {
          $set: {
            status: TicketStatus.ASSIGNED,
            unread_count_staff: 0,
            assigned_to: new ObjectId(assigned_to),
            assigned_at: date
          },
          $push: {
            served_by: {
              admin_id: new ObjectId(assigned_to),
              admin_name: findUserAdmin?.name,
              started_at: date,
              is_active: true // đang xử lý
            }
          }
        }
      ),
      databaseServices.ticketMessages.updateMany(
        {
          ticket_id: new ObjectId(idTicket)
        },
        {
          $set: {
            is_read: true,
            read_at: date
          }
        }
      )
    ])
  }

  async getTicketMessagesAdminService(ticketId: string, limit: number, page: number) {
    // lấy tất cả tin nhắn (TicketMessage) thuộc Ticket có ID = ticketId
    const [conversations, total] = await Promise.all([
      databaseServices.ticketMessages
        .find({ ticket_id: new ObjectId(ticketId) })
        .sort({ created_at: -1 })
        .skip(limit * (page - 1))
        .limit(limit)
        .toArray(),
      databaseServices.ticketMessages.find({ ticket_id: new ObjectId(ticketId) }).toArray()
    ])

    return {
      conversations,
      total: total.length
    }
  }

  async getTicketMessagesClientService(userId: string, limit: number, page: number) {
    // do mỗi user chỉ có 1 ticket -> tìm ticket thuộc về user đó sau đó kéo id ticket ra để tìm tin nhắn
    const findTicketForUser = await databaseServices.tickets
      .findOne({ customer_id: new ObjectId(userId) })
      .then((ticket) => ticket?._id)
    const [conversations, total, ticket] = await Promise.all([
      databaseServices.ticketMessages
        .find({ ticket_id: new ObjectId(findTicketForUser) })
        .sort({ created_at: -1 })
        .skip(limit * (page - 1))
        .limit(limit)
        .toArray(),
      databaseServices.ticketMessages.find({ ticket_id: new ObjectId(findTicketForUser) }).toArray(),
      databaseServices.tickets
        .aggregate([
          {
            $match: { _id: new ObjectId(findTicketForUser) }
          },
          {
            $lookup: {
              from: "users",
              localField: "assigned_to",
              foreignField: "_id",
              as: "assigned_to",
              pipeline: [
                {
                  $project: {
                    name: 1
                  }
                }
              ]
            }
          },
          {
            $unwind: {
              path: "$assigned_to"
            }
          },
          {
            $project: {
              assigned_to: 1
            }
          }
        ])
        .toArray()
    ])

    return {
      conversations,
      total: total.length,
      ticket: ticket[0] || null
    }
  }

  async updateReadMessagesService(ticketId: string, assignedTo: string, userIdAdmin: string) {
    if (userIdAdmin !== assignedTo) {
      throw new ErrorWithStatus({
        message: "You are not assigned to this ticket",
        status: 403
      })
    }
    Promise.all([
      databaseServices.tickets.updateOne(
        {
          _id: new ObjectId(ticketId),
          assigned_to: new ObjectId(assignedTo)
        },
        {
          $set: {
            unread_count_staff: 0
          },
          $currentDate: { updated_at: true }
        }
      ),
      databaseServices.ticketMessages.updateMany(
        {
          ticket_id: new ObjectId(ticketId)
        },
        {
          $set: {
            is_read: true,
            read_at: new Date()
          },
          $currentDate: { updated_at: true }
        }
      )
    ])
  }
}

const ticketServices = new TicketServices()

export default ticketServices
