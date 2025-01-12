import { Request, Response, NextFunction, RequestHandler } from "express"

export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error) // error handler tiếp theo
    }
  }
}

// Mong muốn nhận vào là: Request<{username: string}>
// thực nhận là : Request<{[key: string]: string}>

// const test = <T>(value: T) => value
// console.log(test<Object>({ username: "test" })) // {username: "test"}
// console.log(test<number>(1)) // 1
// console.log(test<string>("1")) // "string"
 