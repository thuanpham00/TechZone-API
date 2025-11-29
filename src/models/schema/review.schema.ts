import { ObjectId } from "mongodb"
import { Media } from "~/constant/common"

export interface ReplyType {
  _id?: ObjectId
  user: ObjectId // người phản hồi (admin hoặc user)
  content: string // nội dung phản hồi
  images?: Media[] // ảnh minh họa
  created_at?: Date
}

export interface ReviewType {
  _id?: ObjectId
  productId: ObjectId // liên kết tới sản phẩm
  userId: ObjectId // người đánh giá
  orderId: ObjectId // liên kết tới đơn hàng
  rating: number // số sao (1-5)
  title?: string // tiêu đề ngắn
  comment?: string // lời đánh giá
  images?: Media[] // ảnh minh họa
  replies?: ReplyType[] // mảng phản hồi
  created_at?: Date
  updated_at?: Date
}

class Review {
  _id?: ObjectId
  productId: ObjectId
  userId: ObjectId
  orderId: ObjectId // liên kết tới đơn hàng
  rating: number
  title: string
  comment: string
  images: Media[]
  replies?: ReplyType[] // mảng phản hồi
  created_at: Date
  updated_at: Date
  constructor(review: ReviewType) {
    const date = new Date()
    this._id = review._id || new ObjectId()
    this.productId = review.productId
    this.userId = review.userId
    this.orderId = review.orderId
    this.rating = review.rating
    this.title = review.title || ""
    this.comment = review.comment || ""
    this.images = review.images || []
    this.replies = review.replies || []
    this.created_at = review.created_at || date
    this.updated_at = review.updated_at || date
  }
}

export default Review
