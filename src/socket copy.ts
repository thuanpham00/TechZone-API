import { Server } from "socket.io"
import { Server as ServerHttp } from "http"
import { verifyAccessToken } from "./utils/common"
import { TokenPayload } from "./models/requests/user.requests"
import { UserVerifyStatus } from "./constant/enum"
import { ErrorWithStatus } from "./models/errors"
import { UserMessage } from "./constant/message"
import httpStatus from "./constant/httpStatus"
import databaseServices from "./services/database.services"
import { Conversation } from "./models/schema/conversation.schema"
import { ObjectId } from "mongodb"

export const initialSocket = (httpSocket: ServerHttp) => {
  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  const io = new Server(httpSocket, {
    cors: {
      origin: "http://localhost:3500" // url của frontend
    }
  })

  // middleware socket cấp server
  // chạy mỗi khi client bắt đầu handshake/kết nối tới server (ngay trước khi sự kiện connection xảy ra). - chạy 1 lần cho 1 lần kết nối
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization.split(" ")[1]
    try {
      // kiểm tra token hợp lệ không và tài khoản đã xác thực chưa
      const decode_authorization = await verifyAccessToken(access_token)
      const { verify } = decode_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        new ErrorWithStatus({
          message: UserMessage.USER_IS_NOT_VERIFIED,
          status: httpStatus.UNAUTHORIZED
        })
      }
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
  io.on("connection", (socket) => {
    console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decode_authorization as TokenPayload
    users[user_id] = {
      socket_id: socket.id
    }

    console.log(users)

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
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

    socket.on("send_message", async (data) => {
      const { sender_id, receiver_id, content } = data.payload
      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content: content
      })
      const result = await databaseServices.conversation.insertOne(conversation)
      conversation._id = result.insertedId

      const receiver_socket_id = users[receiver_id]?.socket_id
      socket.to(receiver_socket_id).emit("received_message", { payload: conversation })
    })

    // sự kiện mặc định của socket server - nếu ngắt kết nối (client ngắt, đóng tab) -> nó chạy
    socket.on("disconnect", () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
    })
  })
}