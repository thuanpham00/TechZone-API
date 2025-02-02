import { ObjectId } from "mongodb";

type ReviewType = {
  _id?: ObjectId,         // ID của đánh giá
  productId: ObjectId,   // Tham chiếu đến sản phẩm
  userId: ObjectId,      // Tham chiếu đến người dùng đánh giá
  rating: number,        // Điểm đánh giá của người dùng (ví dụ: từ 1 đến 5)
  reviewText: string,    // Nội dung đánh giá của người dùng
  created_at?: Date,      // Ngày đánh giá
  updated_at?: Date       // Ngày cập nhật đánh giá
}

class Review {
  _id?: ObjectId
  productId: ObjectId
  userId: ObjectId
  rating: number
  reviewText: string
  created_at: Date
  updated_at: Date

  constructor(review: ReviewType) {
    const date = new Date()
    this._id = review._id
    this.productId = review.productId
    this.userId = review.userId
    this.rating = review.rating
    this.reviewText = review.reviewText
    this.created_at = review.created_at || date
    this.updated_at = review.updated_at || date
  }
}

export default Review

