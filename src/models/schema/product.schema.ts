import { ObjectId } from "mongodb"
import { Media } from "~/constant/common"

interface ProductType {
  _id?: ObjectId
  name: string // tên sản phẩm
  category: ObjectId // thể loại
  brand: ObjectId // thương hiệu
  price: number // giá sản phẩm
  discount?: number // % giảm giá (nếu có)
  stock?: number // số lượng tồn kho
  sold?: number // số lượng đã bán
  viewCount?: number // Số lượt xem
  description: string // Mô tả sản phẩm chi tiết
  isFeatured?: boolean // Sản phẩm nổi bật
  specifications?: ObjectId[]
  gifts?: ObjectId[]
  medias?: Media[] // hình ảnh
  reviews?: ObjectId[]
  averageRating?: number // trung bình đánh giá
  created_at?: Date
  updated_at?: Date
}

class Product {
  _id?: ObjectId
  name: string // tên sản phẩm
  category: ObjectId // thể loại
  brand: ObjectId // thương hiệu
  price: number // giá sản phẩm
  discount: number // % giảm giá (nếu có)
  stock: number // số lượng tồn kho
  sold: number // số lượng đã bán
  viewCount: number // Số lượt xem
  description: string // Mô tả sản phẩm chi tiết
  isFeatured: boolean // Sản phẩm nổi bật
  specifications: ObjectId[]
  gifts: ObjectId[] // quà tặng
  medias: Media[] // hình ảnh
  reviews: ObjectId[] // đánh giá
  averageRating: number // trung bình đánh giá
  created_at: Date
  updated_at: Date
  constructor(product: ProductType) {
    const date = new Date()
    this._id = product._id
    this.name = product.name
    this.category = product.category
    this.brand = product.brand
    this.price = product.price
    this.discount = product.discount || 0
    this.stock = product.stock || 0
    this.sold = product.sold || 0
    this.viewCount = product.viewCount || 0
    this.description = product.description
    this.isFeatured = product.isFeatured || false
    this.specifications = product.specifications || []
    this.gifts = product.gifts || []
    this.medias = product.medias || []
    this.reviews = product.reviews || []
    this.averageRating = product.averageRating || 0
    this.created_at = product.created_at || date
    this.updated_at = product.updated_at || date
  }
}

export default Product
