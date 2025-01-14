import { Request, Response, NextFunction } from "express"
import { pick } from "lodash"

type FilterKey<T> = Array<keyof T>

export const filterMiddleware = <P>(filterKey: FilterKey<P>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKey)
    next()
  }
}