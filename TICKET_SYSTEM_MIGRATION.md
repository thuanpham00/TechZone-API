# 🎯 TÀI LIỆU TRIỂN KHAI TICKET SYSTEM - DỰA TRÊN SOCKET.IO 1-1 HIỆN TẠI

> **Mục tiêu:** Nâng cấp hệ thống chat 1-1 hiện tại lên Ticket-Based Support System  
> **Nguyên tắc:** Giữ nguyên socket.io logic, chỉ thay đổi schema và business logic

---

## 📋 MỤC LỤC

1. [Phân tích hệ thống hiện tại](#1-phân-tích-hệ-thống-hiện-tại)
2. [So sánh hệ thống cũ vs mới](#2-so-sánh-hệ-thống-cũ-vs-mới)
3. [Migration Plan](#3-migration-plan)
4. [Bước 1: Update Schema](#bước-1-update-schema)
5. [Bước 2: Update Services](#bước-2-update-services)
6. [Bước 3: Update Socket.IO](#bước-3-update-socketio)
7. [Bước 4: Update Database Services](#bước-4-update-database-services)
8. [Bước 5: Testing](#bước-5-testing)

---

## 1. PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### 📁 **File Structure:**

```
Server/src/
├── socket.ts                          # Socket.IO logic
├── models/schema/conversation.schema.ts  # Schema hiện tại
├── services/
│   └── conversation.services.ts       # Business logic
└── controllers/
    └── conversation.controllers.ts    # API endpoints (nếu có)
```

---

### 🔍 **Socket.IO Flow hiện tại:**

```typescript
// 1. Client kết nối
io.use(async (socket, next) => {
  // Verify access token
  // Check user verified
})

// 2. User online tracking
users[user_id] = { socket_id: socket.id }

// 3. Send message (1-1)
socket.on("send_message", async (data) => {
  const { sender_id, receiver_id, content } = data.payload

  // Lưu vào DB
  const conversation = new Conversation({ sender_id, receiver_id, content })
  await databaseServices.conversation.insertOne(conversation)

  // Emit tới receiver (1 người cụ thể)
  const receiver_socket_id = users[receiver_id]?.socket_id
  socket.to(receiver_socket_id).emit("received_message", { payload: conversation })
})
```

---

### ❌ **VẤN ĐỀ:**

```
❌ Mỗi message là 1 document riêng → Không có "phòng chat"
❌ Phải chỉ định receiver_id cố định → Không gửi tới nhiều admin
❌ Không có status (pending/assigned) → Không biết ai đang xử lý
❌ Không track unread count → Không biết tin đã đọc chưa
❌ Không có room concept → Socket chỉ emit tới 1 người
```

---

## 2. SO SÁNH HỆ THỐNG CŨ VS MỚI

### 📊 **Schema Comparison:**

| Field                   | Cũ (1-1 Chat)              | Mới (Ticket System)                              |
| ----------------------- | -------------------------- | ------------------------------------------------ |
| **Primary Key**         | `_id`                      | `_id` (ticket_id)                                |
| **Participants**        | `sender_id`, `receiver_id` | `customer_id`, `assigned_to` (nullable)          |
| **Status**              | ❌ Không có                | ✅ `pending`, `assigned`, `closed`               |
| **Message Storage**     | Inline trong conversation  | Riêng collection `ticket_messages`               |
| **Unread Count**        | ❌ Không có                | ✅ `unread_count_customer`, `unread_count_staff` |
| **Last Message**        | ❌ Không có                | ✅ `last_message`, `last_message_at`             |
| **Sender Info**         | ❌ Không có                | ✅ `sender_name`, `sender_avatar` (cache)        |
| **Attachments**         | ❌ Không có                | ✅ `attachments[]` (ảnh/file sản phẩm)           |
| **Multi-Admin Support** | ❌ Không có                | ✅ `served_by[]` (lịch sử admin xử lý)           |

---

### 🔄 **Socket Events Comparison:**

| Event                | Cũ                          | Mới                                          |
| -------------------- | --------------------------- | -------------------------------------------- |
| **User join**        | `io.on("connection")`       | `socket.on("user:join")` + join room         |
| **Send message**     | `send_message` → 1 receiver | `send_message` → Broadcast hoặc specific     |
| **New ticket**       | ❌ Không có                 | ✅ `new_ticket` → Emit to `staff-room`       |
| **Claim ticket**     | ❌ Không có                 | ✅ `claim_ticket` → Remove from other admins |
| **Message received** | `received_message`          | `new_message` + update ticket                |

---

## 3. MIGRATION PLAN

### 🎯 **Strategy: PARALLEL DEPLOYMENT**

```
Phase 1: Giữ nguyên hệ thống cũ, thêm mới bên cạnh
├── conversations (cũ) - Chat 1-1 giữa admin và customer
└── tickets (mới) - Customer support system

Phase 2: Migrate data (optional)
├── Convert existing conversations → tickets
└── Archive old system

Phase 3: Deprecate old system
└── Remove old code sau khi test kỹ
```

---

### 📅 **Timeline:**

```
Week 1: Schema + Services
├── Tạo ticket.schema.ts
├── Tạo ticket.services.ts
└── Update database.services.ts

Week 2: Socket.IO + API
├── Update socket.ts
├── Tạo ticket.controllers.ts
└── Tạo ticket.routes.ts

Week 3: Testing + Frontend
├── Test race condition
├── Test realtime updates
└── Integration với frontend

Week 4: Deploy + Monitor
├── Deploy lên staging
├── Monitor metrics
└── Fix bugs
```

---

## BƯỚC 1: UPDATE SCHEMA

### 📝 **File: `src/models/schema/ticket_message.schema.ts`**

```typescript
import { ObjectId } from "mongodb"

// ===== TICKET STATUS =====
export enum TicketStatus {
  PENDING = "pending", // ⏳ Chờ admin nhận
  ASSIGNED = "assigned", // ✅ Đã có admin xử lý
  CLOSED = "closed" // 🔒 Đóng ticket
}

// ===== MESSAGE TYPE =====
export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file"
}

// ===== SERVICE SESSION INTERFACE =====
/**
 * Interface cho ServiceSession (Phiên tư vấn)
 * Theo dõi từng lần admin xử lý ticket (support multi-admin)
 */
interface ServiceSession {
  admin_id: ObjectId // ID admin xử lý
  admin_name?: string // Tên admin (cache)
  started_at: Date // Thời điểm bắt đầu xử lý
  ended_at?: Date // Thời điểm kết thúc phiên (admin đóng ticket hoặc chuyển giao)
  is_active: boolean // Phiên đang active? (true = đang xử lý, false = đã kết thúc)
}

// ===== TICKET INTERFACE =====
/**
 * Interface cho Ticket (Phiếu hỗ trợ/Phòng chat)
 * Đại diện cho một cuộc hội thoại tư vấn giữa khách hàng và admin/staff
 * HỖ TRỢ MULTI-ADMIN: 1 ticket có thể được nhiều admin xử lý theo thời gian
 */
interface TicketType {
  _id?: ObjectId // ID ticket (auto-generated)
  customer_id: ObjectId // ID khách hàng tạo ticket
  assigned_to?: ObjectId // ID admin/staff HIỆN TẠI đang xử lý (null = pending)
  status: TicketStatus // Trạng thái: pending | assigned | closed

  // ✅ MULTI-ADMIN SUPPORT - Lịch sử các admin đã xử lý ticket này
  served_by: ServiceSession[] // Mảng các phiên tư vấn (lần 1: Admin A, lần 2: Admin B...)

  // Last message info - Thông tin tin nhắn cuối cùng (để hiển thị preview)
  last_message?: string // Nội dung tin nhắn cuối
  last_message_at?: Date // Thời điểm gửi tin cuối
  last_message_sender_type?: "customer" | "staff" // Ai gửi tin cuối (khách/admin)

  // Unread counters - Đếm số tin chưa đọc
  unread_count_customer: number // Số tin admin gửi mà khách chưa đọc
  unread_count_staff: number // Số tin khách gửi mà admin chưa đọc

  // Timestamps - Các mốc thời gian
  created_at?: Date // Thời điểm khách tạo ticket (gửi tin đầu tiên)
  updated_at?: Date // Thời điểm cập nhật gần nhất (có tin mới)
  assigned_at?: Date // Thời điểm admin HIỆN TẠI claim ticket
  closed_at?: Date // Thời điểm đóng ticket (kết thúc tư vấn)
}

// ===== TICKET CLASS =====
export class Ticket {
  _id?: ObjectId
  customer_id: ObjectId
  assigned_to?: ObjectId
  status: TicketStatus
  served_by: ServiceSession[]
  last_message?: string
  last_message_at?: Date
  last_message_sender_type?: "customer" | "staff"
  unread_count_customer: number
  unread_count_staff: number
  created_at: Date
  updated_at: Date
  assigned_at?: Date
  closed_at?: Date

  constructor(ticket: TicketType) {
    const now = new Date()
    this._id = ticket._id || new ObjectId()
    this.customer_id = ticket.customer_id
    this.assigned_to = ticket.assigned_to
    this.status = ticket.status
    this.served_by = ticket.served_by || []
    this.last_message = ticket.last_message
    this.last_message_at = ticket.last_message_at
    this.last_message_sender_type = ticket.last_message_sender_type
    this.unread_count_customer = ticket.unread_count_customer || 0
    this.unread_count_staff = ticket.unread_count_staff || 0
    this.created_at = ticket.created_at || now
    this.updated_at = ticket.updated_at || now
    this.assigned_at = ticket.assigned_at
    this.closed_at = ticket.closed_at
  }
}

// ===== MESSAGE INTERFACE =====
/**
 * Interface cho TicketMessage (Tin nhắn trong ticket)
 * Mỗi tin nhắn thuộc về một ticket cụ thể
 */
interface TicketMessageType {
  _id?: ObjectId // ID tin nhắn (auto-generated)
  ticket_id: ObjectId // ID ticket chứa tin nhắn này (foreign key)
  sender_id: ObjectId // ID người gửi (customer_id hoặc staff_id)
  sender_type: "customer" | "staff" // Loại người gửi (khách hàng hoặc nhân viên)

  // Sender info - Thông tin người gửi (cache để tránh query thêm)
  sender_name?: string // Tên người gửi (hiển thị trong chat)
  sender_avatar?: string // URL avatar người gửi

  // Content - Nội dung tin nhắn
  content: string // Nội dung text (required)
  type: MessageType // Loại tin: text | image | file

  // Attachments - File đính kèm
  attachments?: string[] // Mảng URLs file đính kèm (ảnh sản phẩm, documents)

  // Read status - Trạng thái đã đọc
  is_read: boolean // Người nhận đã đọc tin chưa? (false = chưa đọc)
  read_at?: Date // Thời điểm đọc tin (null = chưa đọc)

  created_at?: Date // Thời điểm gửi tin nhắn
  // Note: Không có updated_at vì tin nhắn không được sửa (như Messenger)
}

// ===== MESSAGE CLASS =====
export class TicketMessage {
  _id?: ObjectId
  ticket_id: ObjectId
  sender_id: ObjectId
  sender_type: "customer" | "staff"
  sender_name?: string
  sender_avatar?: string
  content: string
  type: MessageType
  attachments?: string[]
  is_read: boolean
  read_at?: Date
  created_at: Date

  constructor(message: TicketMessageType) {
    const now = new Date()
    this._id = message._id || new ObjectId()
    this.ticket_id = message.ticket_id
    this.sender_id = message.sender_id
    this.sender_type = message.sender_type
    this.sender_name = message.sender_name
    this.sender_avatar = message.sender_avatar
    this.content = message.content
    this.type = message.type
    this.attachments = message.attachments || []
    this.is_read = message.is_read || false
    this.read_at = message.read_at
    this.created_at = message.created_at || now
  }
}
```

---

## BƯỚC 2: UPDATE SERVICES

### 📝 **File: `src/services/ticket.services.ts`**

```typescript
import databaseServices from "./database.services"
import { ObjectId } from "mongodb"
import { Ticket, TicketStatus, TicketMessage, MessageType, TicketPriority } from "~/models/schema/ticket.schema"
import { ErrorWithStatus } from "~/models/errors"
import httpStatus from "~/constant/httpStatus"

class TicketServices {
  /**
   * 1️⃣ Customer tạo ticket mới hoặc gửi tin vào ticket pending
   */
  async createOrUpdateTicket({
    customerId,
    message,
    subject
  }: {
    customerId: string
    message: string
    subject?: string
  }) {
    // Check xem customer đã có ticket PENDING chưa?
    const existingTicket = await databaseServices.tickets.findOne({
      customer_id: new ObjectId(customerId),
      status: { $in: [TicketStatus.PENDING, TicketStatus.ASSIGNED] }
    })

    if (existingTicket) {
      // Đã có ticket → Gửi message vào ticket đó
      const newMessage = await this.sendMessage({
        ticketId: existingTicket._id!.toString(),
        senderId: customerId,
        senderType: "customer",
        content: message
      })

      return {
        ticket_id: existingTicket._id!.toString(),
        message_id: newMessage.message_id,
        is_new_ticket: false,
        status: existingTicket.status
      }
    }

    // Tạo ticket MỚI
    const customerInfo = await databaseServices.users.findOne(
      { _id: new ObjectId(customerId) },
      { projection: { name: 1, avatar: 1 } }
    )

    const ticket = new Ticket({
      customer_id: new ObjectId(customerId),
      status: TicketStatus.PENDING,
      assigned_to: undefined,
      subject: subject || "Yêu cầu hỗ trợ",
      last_message: message,
      last_message_at: new Date(),
      last_message_sender_type: "customer",
      unread_count_customer: 0,
      unread_count_staff: 1,
      priority: TicketPriority.MEDIUM
    })

    const result = await databaseServices.tickets.insertOne(ticket)
    const ticketId = result.insertedId

    // Tạo message đầu tiên
    const firstMessage = new TicketMessage({
      ticket_id: ticketId,
      sender_id: new ObjectId(customerId),
      sender_type: "customer",
      sender_name: customerInfo?.name,
      sender_avatar: customerInfo?.avatar,
      content: message,
      type: MessageType.TEXT,
      is_read: false
    })

    const messageResult = await databaseServices.ticketMessages.insertOne(firstMessage)

    return {
      ticket_id: ticketId.toString(),
      message_id: messageResult.insertedId.toString(),
      is_new_ticket: true,
      status: TicketStatus.PENDING
    }
  }

  /**
   * 2️⃣ Lấy danh sách PENDING tickets (Chưa ai nhận)
   * Dành cho: TẤT CẢ admin/staff
   */
  async getPendingTickets() {
    const tickets = await databaseServices.tickets
      .aggregate([
        {
          $match: {
            status: TicketStatus.PENDING
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "customer_id",
            foreignField: "_id",
            as: "customer"
          }
        },
        { $unwind: "$customer" },
        {
          $project: {
            _id: 1,
            customer_id: 1,
            "customer.name": 1,
            "customer.avatar": 1,
            "customer.email": 1,
            status: 1,
            subject: 1,
            last_message: 1,
            last_message_at: 1,
            unread_count_staff: 1,
            priority: 1,
            created_at: 1
          }
        },
        {
          $sort: {
            priority: -1, // Urgent trước
            last_message_at: -1 // Tin mới trước
          }
        }
      ])
      .toArray()

    return {
      tickets,
      total: tickets.length
    }
  }

  /**
   * 3️⃣ Lấy MY TICKETS (Ticket của staff cụ thể)
   */
  async getMyTickets(staffId: string) {
    const tickets = await databaseServices.tickets
      .aggregate([
        {
          $match: {
            assigned_to: new ObjectId(staffId),
            status: { $in: [TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS] }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "customer_id",
            foreignField: "_id",
            as: "customer"
          }
        },
        { $unwind: "$customer" },
        {
          $project: {
            _id: 1,
            customer_id: 1,
            "customer.name": 1,
            "customer.avatar": 1,
            "customer.email": 1,
            status: 1,
            subject: 1,
            last_message: 1,
            last_message_at: 1,
            last_message_sender_type: 1,
            unread_count_staff: 1,
            assigned_at: 1,
            created_at: 1
          }
        },
        { $sort: { last_message_at: -1 } }
      ])
      .toArray()

    return {
      tickets,
      total: tickets.length
    }
  }

  /**
   * 4️⃣ CLAIM ticket (Admin SEEN) - RACE CONDITION SAFE
   */
  async claimTicket({ ticketId, staffId }: { ticketId: string; staffId: string }) {
    // ✅ ATOMIC OPERATION - Chỉ 1 admin claim được
    const result = await databaseServices.tickets.findOneAndUpdate(
      {
        _id: new ObjectId(ticketId),
        status: TicketStatus.PENDING // ← Check status trong filter
      },
      {
        $set: {
          status: TicketStatus.ASSIGNED,
          assigned_to: new ObjectId(staffId),
          assigned_at: new Date(),
          updated_at: new Date(),
          unread_count_staff: 0 // Reset unread (đã seen)
        }
      },
      {
        returnDocument: "after"
      }
    )

    if (!result.value) {
      // Không tìm thấy → Ticket đã bị claim rồi
      const ticket = await databaseServices.tickets.findOne({
        _id: new ObjectId(ticketId)
      })

      if (!ticket) {
        throw new ErrorWithStatus({
          message: "Ticket không tồn tại",
          status: httpStatus.NOT_FOUND
        })
      }

      // Lấy tên admin đã claim
      const assignedStaff = await databaseServices.users.findOne(
        { _id: ticket.assigned_to },
        { projection: { name: 1 } }
      )

      throw new ErrorWithStatus({
        message: `Ticket đã được ${assignedStaff?.name || "admin khác"} nhận rồi!`,
        status: httpStatus.CONFLICT
      })
    }

    // Tạo system message
    const staffInfo = await databaseServices.users.findOne(
      { _id: new ObjectId(staffId) },
      { projection: { name: 1, avatar: 1 } }
    )

    const systemMessage = new TicketMessage({
      ticket_id: new ObjectId(ticketId),
      sender_id: new ObjectId(staffId),
      sender_type: "staff",
      sender_name: staffInfo?.name,
      sender_avatar: staffInfo?.avatar,
      content: `${staffInfo?.name || "Admin"} đã tiếp nhận yêu cầu hỗ trợ của bạn`,
      type: MessageType.SYSTEM,
      is_read: false
    })

    await databaseServices.ticketMessages.insertOne(systemMessage)

    return {
      ticket: result.value,
      staff_name: staffInfo?.name,
      message: "Claim ticket thành công"
    }
  }

  /**
   * 5️⃣ Gửi tin nhắn trong ticket
   */
  async sendMessage({
    ticketId,
    senderId,
    senderType,
    content,
    type = MessageType.TEXT,
    attachments
  }: {
    ticketId: string
    senderId: string
    senderType: "customer" | "staff"
    content: string
    type?: MessageType
    attachments?: string[]
  }) {
    // Lấy thông tin người gửi
    const senderInfo = await databaseServices.users.findOne(
      { _id: new ObjectId(senderId) },
      { projection: { name: 1, avatar: 1 } }
    )

    // Tạo message
    const message = new TicketMessage({
      ticket_id: new ObjectId(ticketId),
      sender_id: new ObjectId(senderId),
      sender_type: senderType,
      sender_name: senderInfo?.name,
      sender_avatar: senderInfo?.avatar,
      content,
      type,
      attachments,
      is_read: false
    })

    const result = await databaseServices.ticketMessages.insertOne(message)

    // Update ticket
    const updateData: any = {
      last_message: content,
      last_message_at: new Date(),
      last_message_sender_type: senderType,
      updated_at: new Date()
    }

    if (senderType === "customer") {
      updateData.$inc = { unread_count_staff: 1 }
    } else {
      updateData.$inc = { unread_count_customer: 1 }
    }

    await databaseServices.tickets.updateOne({ _id: new ObjectId(ticketId) }, updateData)

    return {
      message_id: result.insertedId.toString(),
      created_at: message.created_at
    }
  }

  /**
   * 6️⃣ Lấy messages của ticket (phân trang)
   */
  async getTicketMessages({ ticketId, limit = 50, page = 1 }: { ticketId: string; limit?: number; page?: number }) {
    const [messages, total] = await Promise.all([
      databaseServices.ticketMessages
        .find({ ticket_id: new ObjectId(ticketId) })
        .sort({ created_at: -1 })
        .skip(limit * (page - 1))
        .limit(limit)
        .toArray(),

      databaseServices.ticketMessages.countDocuments({
        ticket_id: new ObjectId(ticketId)
      })
    ])

    return {
      messages: messages.reverse(), // Tin cũ lên đầu
      total,
      page,
      limit
    }
  }

  /**
   * 7️⃣ Mark messages as read
   */
  async markAsRead({
    ticketId,
    userId,
    userType
  }: {
    ticketId: string
    userId: string
    userType: "customer" | "staff"
  }) {
    // Update all unread messages
    await databaseServices.ticketMessages.updateMany(
      {
        ticket_id: new ObjectId(ticketId),
        sender_type: { $ne: userType }, // Không phải tin của mình
        is_read: false
      },
      {
        $set: {
          is_read: true,
          read_at: new Date()
        }
      }
    )

    // Reset unread count
    const updateField = userType === "customer" ? "unread_count_customer" : "unread_count_staff"

    await databaseServices.tickets.updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $set: {
          [updateField]: 0,
          updated_at: new Date()
        }
      }
    )

    return { message: "Marked as read" }
  }

  /**
   * 8️⃣ Resolve ticket
   */
  async resolveTicket(ticketId: string, staffId: string) {
    const ticket = await databaseServices.tickets.findOne({
      _id: new ObjectId(ticketId)
    })

    if (!ticket) {
      throw new ErrorWithStatus({
        message: "Ticket không tồn tại",
        status: httpStatus.NOT_FOUND
      })
    }

    if (ticket.assigned_to?.toString() !== staffId) {
      throw new ErrorWithStatus({
        message: "Bạn không có quyền resolve ticket này",
        status: httpStatus.FORBIDDEN
      })
    }

    await databaseServices.tickets.updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $set: {
          status: TicketStatus.RESOLVED,
          resolved_at: new Date(),
          updated_at: new Date()
        }
      }
    )

    return { message: "Ticket resolved successfully" }
  }
}

const ticketServices = new TicketServices()
export default ticketServices
```

---

## BƯỚC 3: UPDATE SOCKET.IO

### 📝 **File: `src/socket.ts` (Refactor)**

```typescript
import { Server } from "socket.io"
import { Server as ServerHttp } from "http"
import { verifyAccessToken } from "./utils/common"
import { TokenPayload } from "./models/requests/user.requests"
import { UserVerifyStatus } from "./constant/enum"
import { ErrorWithStatus } from "./models/errors"
import { UserMessage } from "./constant/message"
import httpStatus from "./constant/httpStatus"
import databaseServices from "./services/database.services"
import ticketServices from "./services/ticket.services"
import { ObjectId } from "mongodb"

// ===== Conversation cũ (giữ nguyên cho backward compatibility) =====
import { Conversation } from "./models/schema/conversation.schema"

export const initialSocket = (httpSocket: ServerHttp) => {
  // Map lưu userId → socketId
  const users: {
    [key: string]: {
      socket_id: string
      user_type: "customer" | "staff" // ← Thêm user_type
    }
  } = {}

  const io = new Server(httpSocket, {
    cors: {
      origin: "http://localhost:3500"
    }
  })

  // ===== MIDDLEWARE =====
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(" ")[1]

    if (!access_token) {
      return next(new Error("Unauthorized"))
    }

    try {
      const decode_authorization = await verifyAccessToken(access_token)
      const { verify } = decode_authorization as TokenPayload

      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: UserMessage.USER_IS_NOT_VERIFIED,
          status: httpStatus.UNAUTHORIZED
        })
      }

      socket.handshake.auth.decode_authorization = decode_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next(new Error("Unauthorized"))
    }
  })

  // ===== CONNECTION =====
  io.on("connection", (socket) => {
    const { user_id } = socket.handshake.auth.decode_authorization as TokenPayload
    console.log(`✅ User ${user_id} connected (socket: ${socket.id})`)

    // ===== USER JOIN =====
    socket.on("user:join", async (data: { user_type: "customer" | "staff" }) => {
      // Lưu user vào map
      users[user_id] = {
        socket_id: socket.id,
        user_type: data.user_type
      }

      // Staff join vào room chung
      if (data.user_type === "staff") {
        socket.join("staff-room")
        console.log(`👨‍💼 Staff ${user_id} joined staff-room`)
      } else {
        socket.join(`customer-${user_id}`)
        console.log(`👤 Customer ${user_id} joined`)
      }

      console.log("Online users:", Object.keys(users).length)
    })

    // ===== MIDDLEWARE SOCKET LEVEL =====
    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error("Unauthorized"))
      }
    })

    socket.on("error", (error) => {
      if (error.message === "Unauthorized") {
        socket.disconnect()
      }
    })

    // ========================================
    // ✅ TICKET SYSTEM - NEW EVENTS
    // ========================================

    /**
     * 📨 Customer gửi tin nhắn → Tạo ticket hoặc update ticket pending
     */
    socket.on("customer:send-message", async (data: { customerId: string; message: string; subject?: string }) => {
      try {
        const result = await ticketServices.createOrUpdateTicket({
          customerId: data.customerId,
          message: data.message,
          subject: data.subject
        })

        if (result.is_new_ticket) {
          // Ticket mới → Emit tới TẤT CẢ staff
          io.to("staff-room").emit("new-pending-ticket", {
            ticket_id: result.ticket_id,
            customer_id: data.customerId,
            message: data.message,
            status: result.status,
            created_at: new Date()
          })

          console.log(`🔔 New ticket ${result.ticket_id} broadcasted to staff-room`)
        } else {
          // Ticket đã tồn tại → Emit tới staff đang xử lý (nếu có)
          const ticket = await databaseServices.tickets.findOne({
            _id: new ObjectId(result.ticket_id)
          })

          if (ticket?.assigned_to) {
            const staffSocketId = users[ticket.assigned_to.toString()]?.socket_id
            if (staffSocketId) {
              io.to(staffSocketId).emit("new-message", {
                ticket_id: result.ticket_id,
                message_id: result.message_id,
                content: data.message,
                sender_type: "customer",
                created_at: new Date()
              })
            }
          }
        }

        // Trả về cho customer
        socket.emit("message-sent-success", {
          ticket_id: result.ticket_id,
          message_id: result.message_id,
          is_new_ticket: result.is_new_ticket
        })
      } catch (error: any) {
        socket.emit("error", { message: error.message })
      }
    })

    /**
     * 👀 Staff CLAIM ticket (SEEN)
     */
    socket.on("staff:claim-ticket", async (data: { ticketId: string; staffId: string }) => {
      try {
        const result = await ticketServices.claimTicket({
          ticketId: data.ticketId,
          staffId: data.staffId
        })

        // ✅ Emit tới TẤT CẢ staff khác → Xóa ticket khỏi danh sách
        socket.to("staff-room").emit("ticket-claimed", {
          ticket_id: data.ticketId,
          claimed_by: data.staffId,
          claimed_by_name: result.staff_name,
          message: `Ticket đã được ${result.staff_name} nhận`
        })

        // Trả về cho staff đã claim
        socket.emit("claim-success", {
          ticket: result.ticket,
          message: result.message
        })

        console.log(`✅ Ticket ${data.ticketId} claimed by ${data.staffId}`)
      } catch (error: any) {
        socket.emit("claim-failed", {
          ticket_id: data.ticketId,
          message: error.message
        })
      }
    })

    /**
     * 💬 Gửi tin nhắn trong ticket (Staff hoặc Customer)
     */
    socket.on(
      "send-message",
      async (data: {
        ticketId: string
        senderId: string
        senderType: "customer" | "staff"
        content: string
        attachments?: string[]
      }) => {
        try {
          const result = await ticketServices.sendMessage({
            ticketId: data.ticketId,
            senderId: data.senderId,
            senderType: data.senderType,
            content: data.content,
            attachments: data.attachments
          })

          // Lấy ticket để biết emit tới ai
          const ticket = await databaseServices.tickets.findOne({
            _id: new ObjectId(data.ticketId)
          })

          if (!ticket) {
            throw new Error("Ticket not found")
          }

          // Emit tới người nhận
          if (data.senderType === "customer") {
            // Customer gửi → Emit tới staff đang xử lý
            if (ticket.assigned_to) {
              const staffSocketId = users[ticket.assigned_to.toString()]?.socket_id
              if (staffSocketId) {
                io.to(staffSocketId).emit("new-message", {
                  ticket_id: data.ticketId,
                  message_id: result.message_id,
                  content: data.content,
                  sender_type: "customer",
                  created_at: result.created_at
                })
              }
            }
          } else {
            // Staff gửi → Emit tới customer
            const customerSocketId = users[ticket.customer_id.toString()]?.socket_id
            if (customerSocketId) {
              io.to(customerSocketId).emit("new-message", {
                ticket_id: data.ticketId,
                message_id: result.message_id,
                content: data.content,
                sender_type: "staff",
                created_at: result.created_at
              })
            }
          }

          socket.emit("message-sent-success", result)
        } catch (error: any) {
          socket.emit("error", { message: error.message })
        }
      }
    )

    /**
     * ✅ Mark as read
     */
    socket.on("mark-as-read", async (data: { ticketId: string; userId: string; userType: "customer" | "staff" }) => {
      try {
        await ticketServices.markAsRead({
          ticketId: data.ticketId,
          userId: data.userId,
          userType: data.userType
        })

        socket.emit("marked-as-read-success", {
          ticket_id: data.ticketId
        })
      } catch (error: any) {
        socket.emit("error", { message: error.message })
      }
    })

    /**
     * 💬 Typing indicator
     */
    socket.on("typing", (data: { ticketId: string; userId: string; userName: string }) => {
      socket.to(`ticket-${data.ticketId}`).emit("user-typing", {
        user_id: data.userId,
        user_name: data.userName
      })
    })

    socket.on("stop-typing", (data: { ticketId: string; userId: string }) => {
      socket.to(`ticket-${data.ticketId}`).emit("user-stop-typing", {
        user_id: data.userId
      })
    })

    // ========================================
    // ❌ OLD SYSTEM - KEEP FOR BACKWARD COMPATIBILITY
    // ========================================

    /**
     * 🔙 Old 1-1 chat (giữ nguyên)
     */
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
      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit("received_message", {
          payload: conversation
        })
      }
    })

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      delete users[user_id]
      console.log(`❌ User ${user_id} disconnected (socket: ${socket.id})`)
      console.log("Online users:", Object.keys(users).length)
    })
  })

  return io
}
```

---

## BƯỚC 4: UPDATE DATABASE SERVICES

### 📝 **File: `src/services/database.services.ts`**

```typescript
import { Db, Collection, MongoClient, ServerApiVersion } from "mongodb"
import { envConfig } from "~/utils/config"

// Import schemas
import { Conversation } from "~/models/schema/conversation.schema"
import { Ticket, TicketMessage } from "~/models/schema/ticket.schema"
import { User } from "~/models/schema/users.schema"
// ...other imports...

class DatabaseServices {
  private client: MongoClient
  private db: Db

  constructor() {
    const URI = `mongodb+srv://${envConfig.user_name}:${envConfig.password}@cluster0.1nx8m.mongodb.net/${envConfig.name_database}?retryWrites=true&w=majority`

    this.client = new MongoClient(URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })

    this.db = this.client.db(envConfig.name_database)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log("✅ Kết nối tới MongoDB thành công!")

      // Tạo indexes
      await this.createIndexes()
    } catch (error) {
      console.log("❌ Lỗi: ", error)
      throw error
    }
  }

  // ===== COLLECTIONS CŨ (GIỮ NGUYÊN) =====
  get users(): Collection<User> {
    return this.db.collection(envConfig.collection_users as string)
  }

  get conversation(): Collection<Conversation> {
    return this.db.collection("conversations") // Old chat
  }

  // ===== COLLECTIONS MỚI (TICKET SYSTEM) =====
  get tickets(): Collection<Ticket> {
    return this.db.collection("tickets")
  }

  get ticketMessages(): Collection<TicketMessage> {
    return this.db.collection("ticket_messages")
  }

  // ===== INDEXES =====
  async createIndexes() {
    console.log("📊 Creating indexes...")

    // Indexes cho tickets
    await this.tickets.createIndex({ customer_id: 1, status: 1 })
    await this.tickets.createIndex({ assigned_to: 1 })
    await this.tickets.createIndex({ status: 1 })
    await this.tickets.createIndex({ last_message_at: -1 })
    await this.tickets.createIndex({ priority: -1 })

    // Indexes cho ticket_messages
    await this.ticketMessages.createIndex({ ticket_id: 1, created_at: -1 })
    await this.ticketMessages.createIndex({ sender_id: 1 })
    await this.ticketMessages.createIndex({ is_read: 1 })

    console.log("✅ Indexes created!")
  }

  // ...other collections...
}

const databaseServices = new DatabaseServices()
export default databaseServices
```

---

## BƯỚC 5: TESTING

### 🧪 **Test Cases:**

```typescript
// Test 1: Customer gửi tin nhắn mới
describe("Customer send first message", () => {
  it("Should create new ticket with status PENDING", async () => {
    const result = await ticketServices.createOrUpdateTicket({
      customerId: "customer_id_1",
      message: "Sản phẩm tôi đặt khi nào về?"
    })

    expect(result.is_new_ticket).toBe(true)
    expect(result.status).toBe(TicketStatus.PENDING)
  })
})

// Test 2: Race condition - 2 admin claim cùng lúc
describe("Race Condition Test", () => {
  it("Only 1 admin should claim ticket successfully", async () => {
    const ticketId = "ticket_123"

    // Admin A và Admin B claim cùng lúc
    const [resultA, resultB] = await Promise.allSettled([
      ticketServices.claimTicket({ ticketId, staffId: "admin_A" }),
      ticketServices.claimTicket({ ticketId, staffId: "admin_B" })
    ])

    // 1 thành công, 1 thất bại
    const successCount = [resultA, resultB].filter((r) => r.status === "fulfilled").length
    expect(successCount).toBe(1)
  })
})

// Test 3: Socket.IO events
describe("Socket.IO Events", () => {
  it("Should emit new-pending-ticket to all staff", (done) => {
    const clientSocket = io("http://localhost:5000", {
      auth: { Authorization: "Bearer token_staff" }
    })

    clientSocket.on("new-pending-ticket", (data) => {
      expect(data.ticket_id).toBeDefined()
      expect(data.status).toBe("pending")
      done()
    })

    // Customer gửi tin
    customerSocket.emit("customer:send-message", {
      customerId: "customer_1",
      message: "Test message"
    })
  })
})
```

---

## 📊 MONITORING & METRICS

### **Metrics cần theo dõi:**

```typescript
// 1. Response Time (Thời gian phản hồi trung bình)
async getAverageResponseTime(staffId: string) {
  const result = await databaseServices.tickets.aggregate([
    {
      $match: {
        assigned_to: new ObjectId(staffId),
        assigned_at: { $exists: true }
      }
    },
    {
      $project: {
        response_time: {
          $subtract: ["$assigned_at", "$created_at"]
        }
      }
    },
    {
      $group: {
        _id: null,
        avg_response_time_ms: { $avg: "$response_time" }
      }
    }
  ])

  return result[0]?.avg_response_time_ms / 1000 / 60 // Convert to minutes
}

// 2. Ticket Volume
async getTicketStats() {
  const stats = await databaseServices.tickets.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ])

  return stats
}

// 3. Staff Performance
async getStaffPerformance() {
  const stats = await databaseServices.tickets.aggregate([
    {
      $match: { assigned_to: { $exists: true } }
    },
    {
      $group: {
        _id: "$assigned_to",
        total_tickets: { $sum: 1 },
        resolved_tickets: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "staff"
      }
    }
  ])

  return stats
}
```

---

## 🎯 CHECKLIST TRIỂN KHAI

### **Phase 1: Backend Setup**

- [ ] Tạo `ticket.schema.ts`
- [ ] Tạo `ticket.services.ts`
- [ ] Update `database.services.ts`
- [ ] Update `socket.ts`
- [ ] Tạo indexes trong MongoDB
- [ ] Test local với Postman/Insomnia

### **Phase 2: Socket.IO Events**

- [ ] Test event `customer:send-message`
- [ ] Test event `staff:claim-ticket`
- [ ] Test event `send-message`
- [ ] Test race condition (2 admin claim cùng lúc)
- [ ] Test realtime updates

### **Phase 3: Frontend Integration**

- [ ] Component `PendingTickets`
- [ ] Component `MyTickets`
- [ ] Component `ChatWindow`
- [ ] Socket.IO client events
- [ ] Toast notifications

### **Phase 4: Testing**

- [ ] Unit tests (services)
- [ ] Integration tests (socket.io)
- [ ] E2E tests (full flow)
- [ ] Load testing (100 concurrent users)
- [ ] Race condition testing

### **Phase 5: Deploy**

- [ ] Deploy lên staging
- [ ] Monitor logs
- [ ] Monitor metrics
- [ ] Fix bugs
- [ ] Deploy lên production

---

## 🚀 NEXT STEPS

1. **Đọc kỹ tài liệu này** ✅
2. **Tạo file `ticket.schema.ts`** → Copy code từ BƯỚC 1
3. **Tạo file `ticket.services.ts`** → Copy code từ BƯỚC 2
4. **Update `socket.ts`** → Thay thế code theo BƯỚC 3
5. **Update `database.services.ts`** → Thêm collections theo BƯỚC 4
6. **Test local** → Dùng Socket.IO client test
7. **Deploy** → Staging → Production

---

**📝 Lưu ý quan trọng:**

- ✅ Hệ thống CŨ vẫn hoạt động (backward compatibility)
- ✅ Ticket System chạy SONG SONG với chat 1-1 cũ
- ✅ Có thể migrate dần dần, không cần rush
- ✅ Test kỹ race condition trước khi deploy production

**BẮT ĐẦU CODE THÔI!** 🚀✨
