import { ObjectId } from "mongodb"

type SpecificationType = {
  _id?: ObjectId,             // ID của thông số
  name: string,              // Tên của thông số (ví dụ: "Màn hình", "RAM", "Bộ xử lý")
  value: string | number,    // Giá trị của thông số (ví dụ: "1080p", "6GB", "3.2GHz")
  category_id: ObjectId[],   // Mảng ObjectId tham chiếu tới các danh mục mà thông số này có thể thuộc về
  created_at?: Date,          // Thời gian tạo thông số
  updated_at?: Date           // Thời gian cập nhật thông số
}

class Specification {
  _id?: ObjectId
  name: string
  value: string | number
  category_id: ObjectId[]
  created_at: Date
  updated_at: Date
  constructor(specification: SpecificationType) {
    const date = new Date()
    this._id = specification._id
    this.name = specification.name
    this.value = specification.value
    this.category_id = specification.category_id
    this.created_at = specification.created_at || date
    this.updated_at = specification.updated_at || date
  }
}

export default Specification