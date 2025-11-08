import { config } from "dotenv"
import { ObjectId } from "mongodb"
import databaseServices from "~/services/database.services"

config()

async function addGalleryIds() {
  try {
    await databaseServices.connect()
    console.log("✅ Kết nối thành công!")

    const products = await databaseServices.product.find({}).toArray()

    let updated = 0
    for (const product of products) {
      if (product.medias && Array.isArray(product.medias) && product.medias.length > 0) {
        // ✅ Thêm id: ObjectId vào từng phần tử trong medias[]
        const updatedMedias = product.medias.map((media) => {
          // Nếu đã có id thì giữ nguyên, chưa có thì tạo mới
          if (!media.id) {
            return {
              ...media,
              id: new ObjectId()
            }
          }
          return media
        })

        await databaseServices.product.updateOne({ _id: product._id }, { $set: { medias: updatedMedias } })
        updated++
        console.log(`  ✓ Updated product: ${product.name} (${product.medias.length} medias)`)
      }
    }

    console.log(`✅ Đã cập nhật ${updated}/${products.length} products`)
  } catch (error) {
    console.error("❌ Lỗi:", error)
  }
}

addGalleryIds()
