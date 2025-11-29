import { Server } from "socket.io"
import { Server as ServerHttp } from "http"
import { verifyAccessToken } from "./utils/common"
import { TokenPayload } from "./models/requests/user.requests"
import { TicketStatus, UserVerifyStatus } from "./constant/enum"
import databaseServices from "./services/database.services"
import { ObjectId, WithId } from "mongodb"
import { Ticket, TicketType } from "./models/schema/ticket_message.schema"
import { User } from "./models/schema/users.schema"
import ticketServices from "./services/ticket.services"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { UPLOAD_IMAGE_DIR } from "./constant/dir"
import { mediaServices } from "./services/medias.services"
import { Media } from "./constant/common"

export const initialSocket = (httpSocket: ServerHttp) => {
  const users: {
    [key: string]: {
      sockets: string[]
      roleKey?: string
    }
  } = {}

  const io = new Server(httpSocket, {
    cors: {
      origin: ["http://localhost:3500", "https://tech-zone-shop.vercel.app/"] // url của frontend
    }
  })

  // middleware socket cấp server
  // chạy mỗi khi client bắt đầu handshake/kết nối tới server (ngay trước khi sự kiện connection xảy ra). - chạy 1 lần cho 1 lần kết nối
  io.use(async (socket, next) => {
    try {
      const { Authorization } = socket.handshake.auth
      if (!Authorization || typeof Authorization !== "string") return next(new Error("Unauthorized"))
      const parts = Authorization.split(" ")

      if (parts.length < 2) return next(new Error("Unauthorized"))
      const access_token = parts[1]

      // kiểm tra token hợp lệ không và tài khoản đã xác thực chưa
      const decode_authorization = await verifyAccessToken(access_token)
      const { verify } = decode_authorization as TokenPayload

      if (verify !== UserVerifyStatus.Verified) return next(new Error("User is not verified"))

      socket.handshake.auth.decode_authorization = decode_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: "Unauthorized",
        name: "UnauthorizedError",
        data: error
      }) // đúng kiểu dữ liệu mặc định của io.use
    }
  })

  // sự kiện mặc định của socket server - tự động chạy khi có connect từ client tới
  io.on("connection", async (socket) => {
    const { user_id } = socket.handshake.auth.decode_authorization as TokenPayload
    let roleKey: string | undefined
    try {
      const userDoc = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
      const findRole = await databaseServices.role.findOne({ _id: userDoc?.role })
      roleKey = findRole?.key
    } catch (error) {
      console.warn("failed to fetch roleKey on connect", error)
    }

    users[user_id] = users[user_id] || { sockets: [], roleKey } // nếu có rồi thì thôi còn chưa có gán cái roleKey vào
    users[user_id].sockets.push(socket.id)
    console.log("connected users:", users)

    socket.use(async (packet, next) => {
      try {
        const { access_token } = socket.handshake.auth
        if (!access_token) return next(new Error("Unauthorized"))
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error("Unauthorized")) // nếu lỗi nó bắt xuống sự kiện error bên dưới
      }
    })

    socket.on("error", (error) => {
      if (error.message === "Unauthorized") {
        socket.disconnect()
      }
    })

    // emit tới các socket của 1 user cụ thể
    const emitToUser = (userId: string, event: string, payload?: any) => {
      const u = users[userId]
      if (!u || !u.sockets?.length) return
      u.sockets.forEach((sId) => io.to(sId).emit(event, payload))
    }

    const getOnlineAdminIds = () => {
      return Object.entries(users)
        .filter(([_, v]) => v.roleKey === "ADMIN" || v.roleKey === "SALES_STAFF")
        .map(([id]) => id)
    }

    // sự kiện gửi và nhận từ customer - admin
    socket.on("send_message", async (data, ...buffers) => {
      // lắng nghe sự kiện gửi tin nhắn từ client
      let tempFiles: Array<{ filepath: string; newFilename: string }> = []

      try {
        const { content, type, sender_type } = data.payload
        const fileMetas: Array<{ fileName: string; fileType: string; fileSize: number }> = data.files || [] // mảng object
        const { user_id: sender_id } = socket.handshake.auth.decode_authorization as TokenPayload

        // xử lý file
        for (let i = 0; i < fileMetas.length; i++) {
          const meta = fileMetas[i]
          const bin = buffers[i]
          if (!bin) continue
          const buf = Buffer.from(bin as ArrayBuffer)
          const safeName = meta.fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
          const uid =
            typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9)
          const tmpName = `${Date.now()}_${uid}_${safeName}`
          const tmpPath = path.join(UPLOAD_IMAGE_DIR, tmpName)
          await fs.promises.mkdir(path.dirname(tmpPath), { recursive: true })
          await fs.promises.writeFile(tmpPath, buf)
          // create minimal File-like object expected by mediaServices
          tempFiles.push({ filepath: tmpPath, newFilename: tmpName })
        }

        const [findUser, findTicket] = await Promise.all([
          databaseServices.users.findOne({ _id: new ObjectId(sender_id) }),
          databaseServices.tickets.findOne({
            customer_id: new ObjectId(sender_id),
            status: { $in: [TicketStatus.PENDING, TicketStatus.ASSIGNED, TicketStatus.CLOSED] }
          })
        ])

        let attachments: Media[] = []
        if (tempFiles.length > 0) {
          const { upload } = await mediaServices.uploadListImageMessage(
            tempFiles as any,
            (findTicket as WithId<Ticket>)._id.toString(),
            sender_id
          )
          attachments = upload
        }
        if (findTicket !== null) {
          // upload attachments for existing ticket via media service
          const [ticketMessage] = await Promise.all([
            ticketServices.insertMessageTicket({
              ticketId: findTicket._id.toString(),
              sender_id: sender_id,
              content: content,
              infoUser: findUser as WithId<User>,
              type: type,
              sender_type: sender_type,
              attachments
            }),
            databaseServices.tickets.updateOne(
              {
                _id: findTicket._id
              },
              {
                $inc: {
                  unread_count_staff: 1
                },
                $set: {
                  last_message: content !== "" ? content : null, // tin nhắn
                  last_message_at: new Date(),
                  last_message_sender_type: sender_type
                },
                $currentDate: { updated_at: true }
              }
            )
          ])
          if (findTicket?.status === TicketStatus.ASSIGNED || findTicket?.status === TicketStatus.PENDING) {
            /**
             *│→ Gửi tin vào ticket này
              │→ Tăng unread_count_staff++
              │→ Emit tới TẤT CẢ admin
               -> Nhưng chỉ admin được assign_to mới reply lại được
             */
            if (findTicket.unread_count_customer > 0) {
              await ticketServices.updateReadClientMessagesService(findTicket._id.toString(), user_id)
            }

            getOnlineAdminIds().forEach((adminIds) => {
              emitToUser(adminIds, "received_message", { payload: ticketMessage })
              emitToUser(adminIds, "reload_ticket_list")
              if (data.files && data.files.length > 0) {
                emitToUser(adminIds, "reload_ticket_images")
              }
            })
          } else if (findTicket?.status === TicketStatus.CLOSED) {
            // ticker đã đóng rồi thì mở lại
            await databaseServices.tickets.updateOne(
              {
                _id: findTicket._id
              },
              {
                $set: {
                  status: TicketStatus.PENDING
                },
                $currentDate: { updated_at: true }
              }
            )

            getOnlineAdminIds().forEach((adminIds) => {
              emitToUser(adminIds, "received_message", { payload: ticketMessage })
              emitToUser(adminIds, "reload_ticket_list")
              if (data.files && data.files.length > 0) {
                emitToUser(adminIds, "reload_ticket_images")
              }
            })
          }
        } else {
          // trường hợp chưa có ticket nào - tạo mới ticket và tin nhắn
          const now = new Date()
          const payloadTicket: TicketType = {
            customer_id: new ObjectId(sender_id),
            assigned_to: null, // chưa có ai nhận dành cho admin
            status: TicketStatus.PENDING, // chưa có ai nhận
            served_by: [], // chưa có ai tiếp nhận
            last_message: content, // tin nhắn
            last_message_at: new Date(),
            last_message_sender_type: "customer",
            unread_count_staff: 1,
            unread_count_customer: 0,
            created_at: now,
            updated_at: now
          }
          const newTicket = await databaseServices.tickets.insertOne(new Ticket(payloadTicket))
          const ticketMessage = await ticketServices.insertMessageTicket({
            ticketId: newTicket.insertedId.toString(),
            sender_id: sender_id,
            content: content,
            infoUser: findUser as WithId<User>,
            type: type,
            sender_type: sender_type,
            attachments
          })
          getOnlineAdminIds().forEach((adminIds) => {
            emitToUser(adminIds, "received_message", { payload: ticketMessage })
            emitToUser(adminIds, "reload_ticket_list")
            if (data.files && data.files.length > 0) {
              emitToUser(adminIds, "reload_ticket_images")
            }
          })
        }
      } catch (error) {
        console.error("send_message error", error)
        socket.emit("error", { message: "Failed to send message" })
      } finally {
        // best-effort cleanup of temp files (in case mediaService didn't remove them)
        try {
          for (const f of tempFiles) {
            if (f && f.filepath && fs.existsSync(f.filepath)) {
              try {
                fs.unlinkSync(f.filepath)
              } catch (e) {}
            }
          }
        } catch {}
      }
    })

    // sự kiện gửi và nhận từ admin - customer
    socket.on("admin:send_message", async (data, ...buffers) => {
      let tempFiles: Array<{ filepath: string; newFilename: string }> = []

      try {
        const { ticket_id, content, type, sender_type } = data.payload
        const fileMetas: Array<{ fileName: string; fileType: string; fileSize: number }> = data.files || [] // mảng object

        const { user_id: sender_id } = socket.handshake.auth.decode_authorization as TokenPayload

        // xử lý file
        for (let i = 0; i < fileMetas.length; i++) {
          const meta = fileMetas[i]
          const bin = buffers[i]
          if (!bin) continue
          const buf = Buffer.from(bin as ArrayBuffer)
          const safeName = meta.fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
          const uid =
            typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9)
          const tmpName = `${Date.now()}_${uid}_${safeName}`
          const tmpPath = path.join(UPLOAD_IMAGE_DIR, tmpName)
          await fs.promises.mkdir(path.dirname(tmpPath), { recursive: true })
          await fs.promises.writeFile(tmpPath, buf)
          // create minimal File-like object expected by mediaServices
          tempFiles.push({ filepath: tmpPath, newFilename: tmpName })
        }

        const [findUser, findTicket] = await Promise.all([
          databaseServices.users.findOne({ _id: new ObjectId(sender_id) }),
          databaseServices.tickets.findOne({
            _id: new ObjectId(ticket_id)
          })
        ])

        if (!findTicket || sender_id !== (findTicket?.assigned_to as ObjectId).toString()) {
          return socket.emit("error", { message: "Ticket not found" })
        }

        let attachments: Media[] = []
        if (tempFiles.length > 0) {
          const { upload } = await mediaServices.uploadListImageMessage(
            tempFiles as any,
            findTicket._id.toString(),
            sender_id
          )
          attachments = upload
        }

        const [ticketMessage, ticketCurrent] = await Promise.all([
          ticketServices.insertMessageTicket({
            ticketId: findTicket._id.toString(),
            sender_id: sender_id,
            content: content,
            infoUser: findUser as WithId<User>,
            type: type,
            sender_type: sender_type,
            attachments
          }),
          databaseServices.tickets.findOne({
            _id: new ObjectId(ticket_id)
          }),
          databaseServices.tickets.updateOne(
            {
              _id: findTicket._id
            },
            {
              $inc: {
                unread_count_customer: 1
              },
              $set: {
                last_message: content !== "" ? content : null, // tin nhắn
                last_message_at: new Date(),
                last_message_sender_type: sender_type
              },
              $currentDate: { updated_at: true }
            }
          )
        ])

        if (!ticketCurrent) {
          return socket.emit("error", { message: "Ticket not found" })
        }

        if (ticketCurrent.unread_count_staff > 0) {
          await ticketServices.updateReadAdminMessagesService(
            ticket_id,
            (ticketCurrent.assigned_to as ObjectId).toString(),
            user_id
          )
        }

        emitToUser(findTicket.customer_id.toString(), "received_message", {
          payload: ticketMessage,
          unreadCountCustomer: ticketCurrent.unread_count_customer + 1
        })

        getOnlineAdminIds().forEach((adminIds) => {
          emitToUser(adminIds, "reload_ticket_list")

          if (data.files && data.files.length > 0) {
            emitToUser(adminIds, "reload_ticket_images")
          }
        })
      } catch (error) {
        console.error("send_message error", error)
        socket.emit("error", { message: "Failed to send message" })
      } finally {
        // best-effort cleanup of temp files (in case mediaService didn't remove them)
        try {
          for (const f of tempFiles) {
            if (f && f.filepath && fs.existsSync(f.filepath)) {
              try {
                fs.unlinkSync(f.filepath)
              } catch (e) {}
            }
          }
        } catch {}
      }
    })

    socket.on("admin:read-message-from-assigned", async (data) => {
      const { ticket_id, assigned_to } = data.payload
      await ticketServices.updateReadAdminMessagesService(ticket_id, assigned_to, user_id)

      getOnlineAdminIds().forEach((adminIds) => {
        emitToUser(adminIds, "reload_ticket_list")
      })
    })

    socket.on("admin:assign_ticket", async (data) => {
      const { ticket_id, assigned_to } = data.payload
      await ticketServices.updateStatusAssignTicket(ticket_id, assigned_to)
      const findCustomerId = await databaseServices.tickets
        .findOne({ _id: new ObjectId(ticket_id) })
        .then((res) => res?.customer_id)

      if (findCustomerId) {
        emitToUser(findCustomerId.toString(), "reload_conversation")
      }
      getOnlineAdminIds().forEach((adminIds) => {
        emitToUser(adminIds, "reload_ticket_list")
      })
    })

    socket.on("admin:close_ticket", async (data) => {
      const { ticket_id, assigned_to } = data.payload
      await ticketServices.updateStatusCloseTicket(ticket_id, assigned_to)
      const findCustomerId = await databaseServices.tickets
        .findOne({ _id: new ObjectId(ticket_id) })
        .then((res) => res?.customer_id)

      if (findCustomerId) {
        emitToUser(findCustomerId.toString(), "reload_conversation")
      }
      getOnlineAdminIds().forEach((adminIds) => {
        emitToUser(adminIds, "reload_ticket_list")
      })
    })

    socket.on("client:read_messages", async (data) => {
      const { user_id } = data.payload
      const findTicket = await databaseServices.tickets
        .findOne({ customer_id: new ObjectId(user_id) })
        .then((ticket) => ticket?._id.toString())
      if (!findTicket) return

      await ticketServices.updateReadClientMessagesService(findTicket, user_id)
    })

    // sự kiện mặc định của socket server - nếu ngắt kết nối (client ngắt, đóng tab) -> nó chạy
    socket.on("disconnect", () => {
      const u = users[user_id]
      if (u) {
        u.sockets = u.sockets.filter((s) => s !== socket.id)
        if (u.sockets.length === 0) delete users[user_id]
      }
      console.log(`socket ${socket.id} disconnected for user ${user_id}`)
    })
  })
}
