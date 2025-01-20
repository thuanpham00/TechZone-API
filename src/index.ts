import express from "express"
import cookieParse from "cookie-parser"
import cors from "cors"
import databaseServices from "./services/database.services"
import { config } from "dotenv"
import userRoute from "./routes/users.routes"
import { defaultErrorHandler } from "./middlewares/error.middlewares"
config()

const app = express()
const PORT = process.env.PORT

app.use(express.json()) // biến request từ object thành json
app.use(cookieParse())
app.use(
  cors({
    origin: "http://localhost:3500", // URL client
    credentials: true // Cho phép gửi cookie lên client
  })
)
app.use("/users", userRoute)

databaseServices.connect().then(() => {
  databaseServices.indexRefreshToken()
})

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
