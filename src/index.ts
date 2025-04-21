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
import path from "path"
import staticRoute from "./routes/static.routes"
config()

const app = express()
const PORT = process.env.PORT

app.use(express.json()) // biến request từ object thành json
app.use(cookieParse())

// app.use(
//   cors({
//     origin: ["http://localhost:3500", "http://localhost:4173", "https://tech-zone-shop.vercel.app"], // URL client
//     credentials: true // Cho phép gửi cookie lên client
//   })
// )

const allowedOrigins = ["http://localhost:3500", "http://localhost:4173", "https://tech-zone-shop.vercel.app"]
// Middleware xử lý CORS chính thức
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
  })
)

// Optional: tự set header nếu muốn chắc chắn
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  }
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization")
  next()
})

// client
app.use("/users", userRoute)
app.use("/products", productRoute)
app.use("/medias", mediasRoute)
app.use("/collections", collectionsRoute)
app.use("/static", staticRoute)

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
