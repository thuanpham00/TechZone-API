import express from "express"
import cookieParse from "cookie-parser"
import cors from "cors"
import databaseServices from "./services/database.services"
import userRoute from "./routes/users.routes"
import { defaultErrorHandler } from "./middlewares/error.middlewares"
import productRoute from "./routes/product.routes"
import mediasRoute from "./routes/medias.routes"
import { initFolder } from "./utils/file"
import collectionsRoute from "./routes/collections.routes"
import adminRouter from "./routes/admin.routes"
import staticRoute from "./routes/static.routes"
import { config } from "dotenv"
import { envConfig } from "./utils/config"
import helmet from "helmet"
import ordersRoute from "./routes/order.routes"
import paymentRoute from "./routes/payment.routes"
import rateLimit from "express-rate-limit"
import emailRoute from "./routes/email.routes"
import { createServer } from "http"
import { initialSocket } from "./socket"
import categoryClientRoute from "./routes/category.routes"
import voucherRoute from "./routes/voucher.routes"
import ticketRoute from "./routes/ticker.routes"
config()

const PORT = envConfig.port

// giới hạn số lượng request với rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes). // mỗi IP 100 request cho 15 phút
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56 // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
})

const app = express()
app.use(express.json()) // biến request từ object thành json
app.use(cookieParse())
app.use(helmet()) // bảo mật cho server

const allowedOrigins = ["http://localhost:3500", "http://localhost:4173", "https://tech-zone-shop.vercel.app"]

app.use(
  cors({
    origin: allowedOrigins, // những domain có thể truy cập vào server
    credentials: true
  })
)
app.use(limiter)

const httpServer = createServer(app) // tạo 1 server đựa trên app của Express

// client
app.use("/users", userRoute)
app.use("/products", productRoute)
app.use("/categories", categoryClientRoute)
app.use("/medias", mediasRoute)
app.use("/collections", collectionsRoute)
app.use("/orders", ordersRoute)
app.use("/static", staticRoute)
app.use("/payment", paymentRoute)
app.use("/email", emailRoute)
app.use("/vouchers", voucherRoute)

app.use("/tickets", ticketRoute)
// admin
app.use("/admin", adminRouter)

databaseServices.connect().then(() => {
  databaseServices.indexRefreshToken(),
    databaseServices.indexUser(),
    databaseServices.indexBrand(),
    databaseServices.indexCategory()
})

initFolder()

app.use(defaultErrorHandler) // middleware toàn cục để xử lý lỗi chung.

initialSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// import { Resend } from "resend"

// const resend = new Resend("re_6sHF3LRw_7zRXgUyQKbf6WngZeVjfpkZ3")

// ;(async function () {
//   const { data, error } = await resend.emails.send({
//     from: "phamminhthuan912@gmail.com",
//     to: ["phamminhthuan91222@gmail.com"],
//     subject: "Hello World",
//     html: "<strong>It works!</strong>"
//   })

//   if (error) {
//     return console.error({ error })
//   }

//   console.log({ data })
// })()
