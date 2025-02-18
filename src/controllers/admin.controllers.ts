import { Request, Response, NextFunction } from "express"
import adminServices from "~/services/admin.services"
import { ParamsDictionary } from "express-serve-static-core"
import { AdminMessage } from "~/constant/message"

export const getStatisticalController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { totalCustomer, totalProduct } = await adminServices.getStatistical()

  res.json({
    message: AdminMessage.GET_STATISTICAL,
    result: {
      totalCustomer,
      totalProduct,
      totalEmployee: 0,
      totalSales: 0
    }
  })
}

export const getCustomersController = async (
  req: Request<ParamsDictionary, any, any, { limit: string; page: string }>,
  res: Response
) => {
  const { limit, page } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getCustomers(
    Number(limit),
    Number(page)
  )

  res.json({
    message: AdminMessage.GET_CUSTOMERS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}

export const getCustomerController = async (
  req: Request<ParamsDictionary, any, any, { limit: string; page: string }>,
  res: Response
) => {
  const { id } = req.params
  const result = await adminServices.getCustomer(id)

  res.json({
    message: AdminMessage.GET_CUSTOMER,
    result: {
      result
    }
  })
}
