"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialSocket = void 0;
const socket_io_1 = require("socket.io");
const common_1 = require("./utils/common");
const enum_1 = require("./constant/enum");
const errors_1 = require("./models/errors");
const message_1 = require("./constant/message");
const httpStatus_1 = __importDefault(require("./constant/httpStatus"));
const database_services_1 = __importDefault(require("./services/database.services"));
const conversation_schema_1 = require("./models/schema/conversation.schema");
const mongodb_1 = require("mongodb");
const initialSocket = (httpSocket) => {
    const users = {};
    const io = new socket_io_1.Server(httpSocket, {
        cors: {
            origin: "http://localhost:3500" // url của frontend
        }
    });
    // middleware socket cấp server
    // chạy mỗi khi client bắt đầu handshake/kết nối tới server (ngay trước khi sự kiện connection xảy ra). - chạy 1 lần cho 1 lần kết nối
    io.use(async (socket, next) => {
        const { Authorization } = socket.handshake.auth;
        const access_token = Authorization.split(" ")[1];
        try {
            // kiểm tra token hợp lệ không và tài khoản đã xác thực chưa
            const decode_authorization = await (0, common_1.verifyAccessToken)(access_token);
            const { verify } = decode_authorization;
            if (verify !== enum_1.UserVerifyStatus.Verified) {
                new errors_1.ErrorWithStatus({
                    message: message_1.UserMessage.USER_IS_NOT_VERIFIED,
                    status: httpStatus_1.default.UNAUTHORIZED
                });
            }
            socket.handshake.auth.decode_authorization = decode_authorization;
            socket.handshake.auth.access_token = access_token;
            next();
        }
        catch (error) {
            next({
                message: "Unauthorized",
                name: "UnauthorizedError",
                data: error
            }); // đúng kiểu dữ liệu mặc định của io.use
        }
    });
    // sự kiện mặc định của socket server - tự động chạy khi có connect từ client tới
    io.on("connection", (socket) => {
        console.log(`user ${socket.id} connected`);
        const { user_id } = socket.handshake.auth.decode_authorization;
        users[user_id] = {
            socket_id: socket.id
        };
        console.log(users);
        socket.use(async (packet, next) => {
            const { access_token } = socket.handshake.auth;
            try {
                await (0, common_1.verifyAccessToken)(access_token);
                next();
            }
            catch (error) {
                next(new Error("Unauthorized")); // nếu lỗi nó bắt xuống sự kiện error bên dưới
            }
        });
        socket.on("error", (error) => {
            if (error.message === "Unauthorized") {
                socket.disconnect();
            }
        });
        socket.on("send_message", async (data) => {
            const { sender_id, receiver_id, content } = data.payload;
            const conversation = new conversation_schema_1.Conversation({
                sender_id: new mongodb_1.ObjectId(sender_id),
                receiver_id: new mongodb_1.ObjectId(receiver_id),
                content: content
            });
            const result = await database_services_1.default.conversation.insertOne(conversation);
            conversation._id = result.insertedId;
            const receiver_socket_id = users[receiver_id]?.socket_id;
            socket.to(receiver_socket_id).emit("received_message", { payload: conversation });
        });
        // sự kiện mặc định của socket server - nếu ngắt kết nối (client ngắt, đóng tab) -> nó chạy
        socket.on("disconnect", () => {
            delete users[user_id];
            console.log(`user ${socket.id} disconnected`);
        });
    });
};
exports.initialSocket = initialSocket;
