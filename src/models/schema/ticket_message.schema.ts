import { ObjectId } from "mongodb"
import { MediaType, MessageType, TicketStatus } from "~/constant/enum"

export interface ImageAttachment {
  id: string // ID file đính kèm
  url: string // URL file đính kèm
  type: MediaType
}

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

/**
 * Interface cho Ticket (Phiếu hỗ trợ/Phòng chat)
 * Đại diện cho một cuộc hội thoại tư vấn giữa khách hàng và admin/staff
 * HỖ TRỢ MULTI-ADMIN: 1 ticket có thể được nhiều admin xử lý theo thời gian
 */
export interface TicketType {
  _id?: ObjectId // ID ticket (auto-generated)
  customer_id: ObjectId // ID khách hàng tạo ticket
  assigned_to: ObjectId | null // ID admin/staff HIỆN TẠI đang xử lý (null = pending)
  status: TicketStatus // Trạng thái: pending | assigned | closed

  served_by: ServiceSession[] // Mảng các phiên tư vấn (lần 1: Admin A, lần 2: Admin B...)

  last_message: string // Nội dung tin nhắn cuối
  last_message_at: Date // Thời điểm gửi tin cuối
  last_message_sender_type: "customer" | "staff" // Ai gửi tin cuối (khách/admin)

  unread_count_customer: number // Số tin admin gửi mà khách chưa đọc
  unread_count_staff: number // Số tin khách gửi mà admin chưa đọc

  created_at?: Date // Thời điểm khách tạo ticket (gửi tin đầu tiên)
  updated_at?: Date // Thời điểm cập nhật gần nhất (có tin mới)
  assigned_at?: Date // Thời điểm admin HIỆN TẠI claim ticket
  closed_at?: Date // Thời điểm đóng ticket (kết thúc tư vấn)
}

export class Ticket {
  _id?: ObjectId
  customer_id: ObjectId
  assigned_to?: ObjectId | null
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
  attachments?: ImageAttachment[] // Mảng URLs file đính kèm (ảnh sản phẩm, documents)

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
  attachments?: ImageAttachment[]
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
