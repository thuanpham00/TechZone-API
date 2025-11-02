import { Request, Response } from "express"
import { CategoryMessage } from "~/constant/message"
import categoryServices from "~/services/category.services"

export const getCategoryListIsActiveController = async (req: Request, res: Response) => {
  const categories = await categoryServices.getCategoryListIsActive()
  res.status(200).json({
    message: CategoryMessage.GET_CATEGORY_LIST_IS_SUCCESS,
    data: categories
  })
}

export const getListCategoryMenuIsActiveController = async (req: Request, res: Response) => {
  const categoryMenus = await categoryServices.getListCategoryMenuIsActive()
  res.status(200).json({
    message: CategoryMessage.GET_CATEGORY_MENU_LIST_IS_SUCCESS,
    data: categoryMenus
  })
}

export const getBannerBaseOnSlugController = async (req: Request, res: Response) => {
  const result = await categoryServices.getBannerBaseOnSlug()
  res.status(200).json({
    message: CategoryMessage.GET_BANNER_BASE_ON_SLUG_IS_SUCCESS,
    data: result
  })
}
