import express from "express"
import cors from "cors"
import databaseServices from "./services/database.services"
import { config } from "dotenv"
import userRoute from "./routes/users.routes"
import { defaultErrorHandler } from "./middlewares/error.middlewares"
config()

const app = express()
const PORT = process.env.PORT

app.use(express.json()) // biến request từ object thành json
app.use(cors())
app.use("/users", userRoute)

databaseServices.connect()

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
