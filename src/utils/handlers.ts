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
// console.log(test<string>("1")) // "1"
 
/**
 * Việc trả về một hàm có cấu trúc return async (req: Request<P>, res: Response, next: NextFunction) - Đáp ứng chuẩn middleware của Express
 * Hàm trả về này sẽ: Nhận các tham số req, res, và next từ Express.
 * Tương thích với chuỗi middleware của Express, cho phép bạn nối tiếp nhiều middleware và xử lý lỗi.
 * => Tuân theo giao diện middleware của Express.
   => Xử lý logic bất đồng bộ dễ dàng với async/await.
   => Đóng gói logic để tái sử dụng cho nhiều route và middleware khác nhau. 
*/

// (middleware: (req: Request, res: Response, next: NextFunction) => void)