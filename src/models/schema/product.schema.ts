import { ObjectId } from "mongodb"
import { Media } from "~/constant/common"

interface ProductType {
  _id?: ObjectId,
  name: string, // tên sản phẩm
  category: ObjectId, // thể loại
  brand: ObjectId, // thương hiệu
  price: number, // giá sản phẩm
  discount: number, // % giảm giá (nếu có)
  stock: number // số lượng tồn kho
  sold: number, // số lượng đã bán
  viewCount: number,         // Số lượt xem
  description: string, // Mô tả sản phẩm chi tiết
  isFeatured: boolean, // Sản phẩm nổi bật
  specifications: ObjectId[]
  gifts: ObjectId[]
  medias: Media[], // hình ảnh
  reviews: ObjectId[]
  averageRating: number // trung bình đánh giá
  created_at: Date, 
  updated_at: Date
}

class Product {
  
}

export default Product