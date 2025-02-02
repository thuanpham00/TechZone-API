import { ObjectId } from "mongodb";

type GiftType = {
  _id?: ObjectId,           // ID của quà tặng
  name: string,            // Tên quà tặng (ví dụ: "Túi xách miễn phí", "Sản phẩm thứ 2 giảm giá 50%")
  description: string,     // Mô tả chi tiết về quà tặng
  value: number,           // Giá trị của quà tặng (có thể là giá trị tiền tệ hoặc giá trị giảm giá)
  applicableProducts?: ObjectId[], // Danh sách các sản phẩm có thể nhận quà tặng này (liên kết tới collection Product)
  created_at?: Date,        // Ngày tạo quà tặng
  updated_at?: Date         // Ngày cập nhật quà tặng
}

class Gift {
  _id?: ObjectId
  name: string
  description: string
  value: number
  applicableProducts: ObjectId[]
  created_at: Date
  updated_at: Date
  constructor(gift: GiftType) {
    const date = new Date()
    this._id = gift._id
    this.name = gift.name
    this.description = gift.description
    this.value = gift.value
    this.applicableProducts = gift.applicableProducts || []
    this.created_at = gift.created_at || date
    this.updated_at = gift.updated_at || date
  }
}

export default Gift