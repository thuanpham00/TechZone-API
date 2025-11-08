import { config } from "dotenv"
import databaseServices from "~/services/database.services"

config()

async function addPriceAfterDiscount() {
  try {
    console.log("🔄 Đang kết nối database...")
    await databaseServices.connect()
    console.log("✅ Kết nối thành công!")

    const products = await databaseServices.product.find({}).toArray()
    console.log(`📦 Tìm thấy ${products.length} products`)

    let updated = 0
    for (const product of products) {
      // ✅ Tính priceAfterDiscount
      const price = product.price || 0
      const discount = product.discount || 0
      const priceAfterDiscount = price - (price * discount) / 100

      // ✅ Cập nhật vào database
      await databaseServices.product.updateOne(
        { _id: product._id },
        {
          $set: {
            priceAfterDiscount: Math.round(priceAfterDiscount) // Làm tròn
          }
        }
      )

      updated++
      console.log(
        `  ✓ ${product.name}: ${price.toLocaleString()}₫ - ${discount}% = ${Math.round(priceAfterDiscount).toLocaleString()}₫`
      )
    }

    console.log(`\n✅ Đã cập nhật ${updated}/${products.length} products`)
  } catch (error) {
    console.error("❌ Lỗi:", error)
  }
}

addPriceAfterDiscount()
