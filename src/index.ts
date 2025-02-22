import express from "express"
import cookieParse from "cookie-parser"
import cors from "cors"
import databaseServices from "./services/database.services"
import { config } from "dotenv"
import userRoute from "./routes/users.routes"
import { defaultErrorHandler } from "./middlewares/error.middlewares"
import productRoute from "./routes/product.routes"
import mediasRoute from "./routes/medias.routes"
import { initFolder } from "./utils/file"
import collectionsRoute from "./routes/collections.routes"
import adminRouter from "./routes/admin.routes"
config()

const app = express()
const PORT = process.env.PORT

app.use(express.json()) // biến request từ object thành json
app.use(cookieParse())
app.use(
  cors({
    origin: ["http://localhost:3500", "https://tech-zone-shop.vercel.app/"], // URL client
    credentials: true, // Cho phép gửi cookie lên client
    methods: ["GET", "POST", "PUT", "DELETE"] // Cho phép tất cả method
  })
)
// client
app.use("/users", userRoute)
app.use("/products", productRoute)
app.use("/medias", mediasRoute)
app.use("/collections", collectionsRoute)

// admin
app.use("/admin", adminRouter)

databaseServices.connect().then(() => {
  databaseServices.indexRefreshToken(),
    databaseServices.indexUser(),
    databaseServices.indexBrand(),
    databaseServices.indexCategory()
})

initFolder()

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
