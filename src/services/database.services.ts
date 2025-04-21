import { Collection, Db, MongoClient } from "mongodb"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
import { User } from "~/models/schema/users.schema"
import { config } from "dotenv"
import Product from "~/models/schema/product.schema"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import Review from "~/models/schema/review.schema"
import Specification from "~/models/schema/specification.schema"
import Gift from "~/models/schema/gift.schema"
import { Supplier, Supply } from "~/models/schema/supply_supplier.schema"
config()

const URI = `mongodb+srv://thuanpham99:thuan123@cluster0.1nx8m.mongodb.net/`

class DatabaseServices {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(URI)
    this.db = this.client.db(process.env.DB_NAME) // truyền tên database vào đây
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log("Kết nối tới MongoDB thành công!")
    } catch (error) {
      console.log("Lỗi: ", error)
      throw error
    }
  }

  async indexRefreshToken() {
    const exists = await this.refreshToken.indexExists(["token_1", "exp_1"])
    if (!exists) {
      this.refreshToken.createIndex({ token: 1 }),
        this.refreshToken.createIndex(
          {
            exp: 1
          },
          {
            expireAfterSeconds: 0 // expireAfterSeconds được sử dụng để tạo TTL (Time-To-Live) Index, cho phép tự động xóa các document sau một khoảng thời gian nhất định // xóa các token hết hạn
          }
        )
    }
  }

  async indexUser() {
    const exists = await this.users.indexExists(["email_1_password_1", "email_1"])
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ name: "text", email: "text", numberPhone: "text" })
    }
  }

  async indexBrand() {
    const exists = await this.brand.indexExists(["name_1"])
    if (!exists) {
      this.brand.createIndex({ name: 1 })
    }
  }

  async indexCategory() {
    const exists = await this.category.indexExists(["name_1"])
    if (!exists) {
      this.category.createIndex({ name: 1 })
    }
  }

  // Tạo getter để truy cập vào collection (như 1 thuộc tính)
  get users(): Collection<User> {
    return this.db.collection(process.env.COLLECTION_USERS as string)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.COLLECTION_REFRESH_TOKEN as string)
  }

  get product(): Collection<Product> {
    return this.db.collection(process.env.COLLECTION_PRODUCT as string)
  }

  get brand(): Collection<Brand> {
    return this.db.collection(process.env.COLLECTION_BRAND as string)
  }

  get category(): Collection<Category> {
    return this.db.collection(process.env.COLLECTION_CATEGORY as string)
  }

  get specification(): Collection<Specification> {
    return this.db.collection(process.env.COLLECTION_SPECIFICATION as string)
  }

  get supplier(): Collection<Supplier> {
    return this.db.collection(process.env.COLLECTION_SUPPLIER as string)
  }

  get supply(): Collection<Supply> {
    return this.db.collection(process.env.COLLECTION_SUPPLY as string)
  }

  // get gift(): Collection<Gift> {
  //   return this.db.collection(process.env.COLLECTION_GIFT as string)
  // }

  // get review(): Collection<Review> {
  //   return this.db.collection(process.env.COLLECTION_REVIEW as string)
  // }
}

const databaseServices = new DatabaseServices()
export default databaseServices
