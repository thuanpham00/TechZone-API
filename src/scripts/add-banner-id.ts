import { config } from "dotenv"
import { ObjectId } from "mongodb"
import databaseServices from "~/services/database.services"
config()

async function addBannerIds() {
  try {
    await databaseServices.connect()

    const products = await databaseServices.product.find({}).toArray()

    for (const product of products) {
      if (product.banner) {
        // ✅ Thêm id: ObjectId vào banner
        const updatedBanner = {
          ...product.banner,
          id: new ObjectId() // Tạo ObjectId mới
        }

        await databaseServices.product.updateOne({ _id: product._id }, { $set: { banner: updatedBanner } })
      }
    }

    console.log(`✅ Đã cập nhật ${products.length} products`)
  } catch (error) {
    console.error("❌ Lỗi:", error)
  }
}

addBannerIds()
