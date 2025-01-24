import { Request, Response, NextFunction } from "express"

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Create product successfully" })
}
