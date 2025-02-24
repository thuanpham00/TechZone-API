import { Request, Response, NextFunction } from "express"
import adminServices from "~/services/admin.services"
import { ParamsDictionary } from "express-serve-static-core"
import { AdminMessage, UserMessage } from "~/constant/message"
import { updateMeReqBody } from "~/models/requests/user.requests"
import { userServices } from "~/services/user.services"

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
  req: Request<ParamsDictionary, any, any, { limit: string; page: string; email: string; name: string; phone: string }>,
  res: Response
) => {
  const { limit, page, email, name, phone } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getCustomers(
    Number(limit),
    Number(page),
    email,
    name,
    phone
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

export const updateCustomerController = async (
  req: Request<ParamsDictionary, any, updateMeReqBody, { limit: string; page: string }>,
  res: Response
) => {
  const { id } = req.params
  const result = await userServices.updateMe({ user_id: id, body: req.body })
  res.json({
    message: UserMessage.UPDATE_PROFILE_IS_SUCCESS,
    result
  })
}

export const deleteCustomerController = async (
  req: Request<ParamsDictionary, any, updateMeReqBody, { limit: string; page: string }>,
  res: Response
) => {
  const { id } = req.params
  const result = await adminServices.deleteCustomer(id)
  res.json({
    message: AdminMessage.DELETE_CUSTOMER,
    result
  })
}

export const getCategoriesController = async (
  req: Request<ParamsDictionary, any, any, { limit: string; page: string }>,
  res: Response
) => {
  const { limit, page } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getCategories(
    Number(limit),
    Number(page)
  )

  res.json({
    message: AdminMessage.GET_CATEGORIES,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}
