import { Collection, Db, MongoClient } from "mongodb"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
import { User } from "~/models/schema/users.schema"
import { config } from "dotenv"
import Product from "~/models/schema/product.schema"
import { Brand, Category } from "~/models/schema/brand_category.schema"
import Review from "~/models/schema/review.schema"
import Specification from "~/models/schema/specification.schema"
import Gift from "~/models/schema/gift.schema"
import { Receipt, Supplier, Supply } from "~/models/schema/supply_supplier.schema"
import { envConfig } from "~/utils/config"
import { Favourite } from "~/models/schema/favourite.schema"
config()

const URI = `mongodb+srv://${envConfig.user_name}:${envConfig.password}@cluster0.1nx8m.mongodb.net/${envConfig.name_database}?retryWrites=true&w=majority`

class DatabaseServices {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(URI)
    this.db = this.client.db(envConfig.name_database) // truyền tên database vào đây
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
    return this.db.collection(envConfig.collection_users)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(envConfig.collection_refresh_token)
  }

  get product(): Collection<Product> {
    return this.db.collection(envConfig.collection_product)
  }

  get brand(): Collection<Brand> {
    return this.db.collection(envConfig.collection_brand)
  }

  get category(): Collection<Category> {
    return this.db.collection(envConfig.collection_category)
  }

  get specification(): Collection<Specification> {
    return this.db.collection(envConfig.collection_specification)
  }

  get supplier(): Collection<Supplier> {
    return this.db.collection(envConfig.collection_supplier)
  }

  get supply(): Collection<Supply> {
    return this.db.collection(envConfig.collection_supply)
  }

  get receipt(): Collection<Receipt> {
    return this.db.collection(envConfig.collection_receipt)
  }

   get favourite(): Collection<Favourite> {
    return this.db.collection(envConfig.collection_favourite)
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
