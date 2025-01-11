import { Router } from "express"
import { loginController, registerController } from "~/controllers/user.controllers"
import { loginValidator, registerValidator } from "~/middlewares/user.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const userRoute = Router()

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, data_of_birth: ISO8601, sex: string, role?: string }
 */
userRoute.post("/register", registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Login user
 * Path: /login
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password, data_of_birth: ISO8601, sex: string }
 */
userRoute.post("/login", loginValidator, wrapRequestHandler(loginController))

export default userRoute
