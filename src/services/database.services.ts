import { Collection, Db, MongoClient } from "mongodb"
import { RefreshToken } from "~/models/schema/refreshToken.schema"
import { User } from "~/models/schema/users.schema"
import { config } from "dotenv"
config()

const URI = `mongodb+srv://${process.env.USERNAME_MONGODB}:${process.env.PASSWORD_MONGODB}@cluster0.1nx8m.mongodb.net/`

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

  // Tạo getter để truy cập vào collection (như 1 thuộc tính)
  get users(): Collection<User> {
    return this.db.collection(process.env.COLLECTION_USERS as string)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.COLLECTION_REFRESH_TOKEN as string)
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
