import { Request, Response, NextFunction } from "express"
import adminServices from "~/services/admin.services"
import { ParamsDictionary } from "express-serve-static-core"
import { AdminMessage, UserMessage } from "~/constant/message"
import { updateMeReqBody } from "~/models/requests/user.requests"
import { userServices } from "~/services/user.services"
import { UpdateCategoryBodyReq } from "~/models/requests/admin.requests"

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

export const getCustomerDetailController = async (
  req: Request<ParamsDictionary, any, any, { limit: string; page: string }>,
  res: Response
) => {
  const { id } = req.params
  const result = await adminServices.getCustomerDetail(id)

  res.json({
    message: AdminMessage.GET_CUSTOMER,
    result: {
      result
    }
  })
}

export const updateCustomerDetailController = async (
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
  req: Request<ParamsDictionary, any, any, { limit: string; page: string; name: string }>,
  res: Response
) => {
  const { limit, page, name } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getCategories(
    Number(limit),
    Number(page),
    name
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

export const getCategoryDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminServices.getCategoryDetail(id)

  res.json({
    message: AdminMessage.GET_CATEGORY_DETAIL,
    result: {
      result
    }
  })
}

export const createCategoryController = async (
  req: Request<ParamsDictionary, any, UpdateCategoryBodyReq>,
  res: Response
) => {
  const { name } = req.body
  const result = await adminServices.createCategory(name)

  res.json({
    message: AdminMessage.UPDATE_CATEGORY_DETAIL,
    result: {
      result
    }
  })
}

export const updateCategoryDetailController = async (req: Request<{ id: string }, any, any>, res: Response) => {
  const { id } = req.params
  const result = await adminServices.updateCategory(id, req.body)
  res.json({
    message: AdminMessage.UPDATE_CATEGORY_DETAIL,
    result: {
      result
    }
  })
}

export const deleteCategoryController = async (req: Request<{ id: string }, any, any>, res: Response) => {
  const { id } = req.params
  const { message } = await adminServices.deleteCategory(id)

  res.json({
    message: message
  })
}

export const getBrandsController = async (
  req: Request<ParamsDictionary, any, any, { limit: string; page: string; name: string; id: string }>,
  res: Response
) => {
  const { limit, page, name, id } = req.query
  const { result, total, totalOfPage, limitRes, pageRes, listTotalProduct } = await adminServices.getBrands(
    id,
    Number(limit),
    Number(page),
    name
  )

  res.json({
    message: AdminMessage.GET_BRANDS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage,
      listTotalProduct
    }
  })
}

export const getBrandDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminServices.getBrandDetail(id)

  res.json({
    message: AdminMessage.GET_CATEGORY_DETAIL,
    result: {
      result
    }
  })
}

export const updateBrandDetailController = async (req: Request<{ id: string }, any, any>, res: Response) => {
  const { id } = req.params
  const result = await adminServices.updateBrand(id, req.body)

  res.json({
    message: AdminMessage.UPDATE_BRAND_DETAIL,
    result: {
      result
    }
  })
}

export const deleteBrandController = async (
  req: Request<{ id: string }, any, any, { categoryId: string }>,
  res: Response
) => {
  const { id } = req.params
  const { categoryId } = req.query
  const { message } = await adminServices.deleteBrand(categoryId as string, id)

  res.json({
    message: message
  })
}

export const getProductController = async (
  req: Request<ParamsDictionary, any, any, { limit: string; page: string; name: string }>,
  res: Response
) => {
  const { limit, page, name } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getProducts(
    Number(limit),
    Number(page),
    name
  )

  res.json({
    message: AdminMessage.GET_PRODUCTS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}
