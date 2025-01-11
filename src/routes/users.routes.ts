import { Router } from "express"
import { registerController } from "~/controllers/user.controllers"
import { registerValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const userRoute = Router()

userRoute.post("/register", wrapRequestHandler(registerController))

export default userRoute
