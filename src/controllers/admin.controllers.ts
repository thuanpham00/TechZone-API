import { NextFunction, Request, Response } from "express"
import adminServices from "~/services/admin.services"
import { ParamsDictionary } from "express-serve-static-core"
import { AdminMessage, ProductMessage, ReceiptMessage, UserMessage } from "~/constant/message"
import { updateMeReqBody } from "~/models/requests/user.requests"
import { userServices } from "~/services/user.services"
import { CreateCustomerBodyReq, UpdateBrandBodyReq, UpdateCategoryBodyReq } from "~/models/requests/admin.requests"
import formidable from "formidable"
import {
  CreateProductBodyReq,
  CreateReceiptBodyReq,
  CreateSupplierBodyReq,
  CreateSupplyBodyReq
} from "~/models/requests/product.requests"
import { File } from "formidable"

export const getStatistical_Sell_Controller = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { year, month } = req.query
  const { totalCustomer, totalOrder, totalProductSold, avgOrderValue, rateStatusOrder } =
    await adminServices.getStatisticalSell(Number(month), Number(year))

  res.json({
    message: AdminMessage.GET_STATISTICAL,
    result: {
      totalCustomer,
      totalOrder,
      totalProductSold,
      avgOrderValue,
      rateStatusOrder
    }
  })
}

export const getStatistical_Product_Controller = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { countCategory, top10ProductSold } = await adminServices.getStatisticalProduct()

  res.json({
    message: AdminMessage.GET_STATISTICAL,
    result: {
      countCategory,
      top10ProductSold
    }
  })
}

export const createCustomerController = async (
  req: Request<ParamsDictionary, any, CreateCustomerBodyReq>,
  res: Response
) => {
  const result = await adminServices.createCustomer(req.body)

  res.json({
    message: AdminMessage.CREATE_CUSTOMER_DETAIL,
    result: {
      result
    }
  })
}

export const getCustomersController = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      email: string
      name: string
      phone: string
      verify: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string
    }
  >,
  res: Response
) => {
  const {
    limit,
    page,
    email,
    name,
    phone,
    verify,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
  } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getCustomers(
    Number(limit),
    Number(page),
    email,
    name,
    phone,
    verify,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
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
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      name: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string
    }
  >,
  res: Response
) => {
  const { limit, page, name, created_at_start, created_at_end, updated_at_start, updated_at_end } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getCategories(
    Number(limit),
    Number(page),
    name,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
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

export const getNameCategoriesController = async (req: Request, res: Response) => {
  const result = await adminServices.getNameCategoriesFilter()
  res.json({
    message: AdminMessage.GET_CATEGORIES,
    result: {
      result
    }
  })
}

export const getCategoryDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminServices.getCategoryDetail(id)

  res.json({
    message: AdminMessage.GET_BRAND_DETAIL,
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
    message: AdminMessage.CREATE_CATEGORY_DETAIL,
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
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      name: string
      id: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string
    }
  >,
  res: Response
) => {
  const { limit, page, name, id, created_at_start, created_at_end, updated_at_start, updated_at_end } = req.query
  const { result, total, totalOfPage, limitRes, pageRes, listTotalProduct } = await adminServices.getBrands(
    id,
    Number(limit),
    Number(page),
    name,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
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

export const getNameBrandsController = async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const result = await adminServices.getNameBrandsFilter()
  res.json({
    message: AdminMessage.GET_BRANDS,
    result: {
      result
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

export const createBrandController = async (req: Request<ParamsDictionary, any, UpdateBrandBodyReq>, res: Response) => {
  const { name, categoryId } = req.body
  const { message } = await adminServices.createBrand(name, categoryId)

  res.json({
    message: message
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
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      name: string
      brand: string
      category: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string
      price_min: string
      price_max: string
      status: string
    }
  >,
  res: Response
) => {
  const {
    limit,
    page,
    name,
    brand,
    category,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end,
    price_min,
    price_max,
    status
  } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getProducts(
    Number(limit),
    Number(page),
    name,
    brand,
    category,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end,
    price_min,
    price_max,
    status
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

export const getNameProductsController = async (req: Request, res: Response) => {
  const result = await adminServices.getNameProductsFilter()
  res.json({
    message: AdminMessage.GET_PRODUCTS,
    result: {
      result
    }
  })
}

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  const fields = req.body
  const files = req.files as formidable.Files
  const payload: CreateProductBodyReq = {
    name: fields.name[0], // fields dưới dạng mảng, kể cả khi bạn chỉ gửi 1 giá trị duy nhất.
    category: fields.category[0] as string,
    brand: fields.brand[0] as string,
    price: Number(fields.price[0]),
    discount: Number(fields.discount[0]),
    stock: Number(fields.stock[0]),
    isFeatured: fields.isFeatured[0] as string,
    description: fields.description[0] as string,
    banner: files.banner?.[0] as File,
    medias: files.medias ? (Array.isArray(files.medias) ? files.medias : [files.medias]) : [],
    specifications: JSON.parse(fields.specifications[0]) // bạn cần gửi từ FE là JSON.stringify
  }
  const result = await adminServices.createProduct(payload)
  res.json({
    message: ProductMessage.CREATE_PRODUCT_SUCCESS,
    result
  })
}

/**
 * const formData = new FormData()
   formData.append("name", "Laptop MSI")

   # sau khi formidable parse xong (middlewares)
   fields = {
      name: ["Laptop MSI"] // <-- Mảng có 1 phần tử
   } 
   => fields.name[0] === fields["name"][0] mới lấy được kết quả
 */

export const createSupplierController = async (
  req: Request<ParamsDictionary, any, CreateSupplierBodyReq>,
  res: Response
) => {
  const { message } = await adminServices.createSupplier(req.body)

  res.json({
    message: message
  })
}

export const getSuppliersController = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      name: string
      email: string
      phone: string
      contactName: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string
    }
  >,
  res: Response
) => {
  const {
    limit,
    page,
    name,
    email,
    phone,
    contactName,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
  } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getSuppliers(
    Number(limit),
    Number(page),
    name,
    email,
    phone,
    contactName,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
  )

  res.json({
    message: AdminMessage.GET_SUPPLIERS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}

export const getSupplierDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminServices.getSupplierDetail(id)

  res.json({
    message: AdminMessage.GET_SUPPLIER_DETAIL,
    result: {
      result
    }
  })
}

export const getNameSuppliersController = async (req: Request, res: Response) => {
  const result = await adminServices.getNameSuppliersFilter()
  res.json({
    message: AdminMessage.GET_SUPPLIERS,
    result: {
      result
    }
  })
}

export const getNameSuppliersNotLinkedToProductController = async (req: Request, res: Response) => {
  const productId = req.productId
  const result = await adminServices.getNameSuppliersNotLinkedToProduct(productId)
  res.json({
    message: AdminMessage.GET_SUPPLIERS_BASED_ON_NAME_PRODUCT,
    result: {
      result
    }
  })
}

export const getNameSuppliersLinkedToProductController = async (req: Request, res: Response) => {
  const productId = req.productId
  const result = await adminServices.getNameSuppliersLinkedToProduct(productId)
  res.json({
    message: AdminMessage.GET_SUPPLIERS_BASED_ON_NAME_PRODUCT_2,
    result: {
      result
    }
  })
}

export const getPricePerUnitBasedOnProductAndSupplierController = async (req: Request, res: Response) => {
  const { productId, supplierId } = req
  const result = await adminServices.getPricePerUnitFromProductAndSupplier(productId, supplierId)
  res.json({
    message: ReceiptMessage.PRICE_PER_UNIT_IS_SUCCESS,
    result: {
      result
    }
  })
}

export const updateSupplierDetailController = async (req: Request<{ id: string }, any, any>, res: Response) => {
  const { id } = req.params
  const { message } = await adminServices.updateSupplier(id, req.body)
  res.json({
    message
  })
}

export const deleteSupplierController = async (req: Request<{ id: string }, any, any>, res: Response) => {
  const { id } = req.params
  const { message } = await adminServices.deleteSupplier(id)

  res.json({
    message: message
  })
}

export const createSupplyController = async (
  req: Request<ParamsDictionary, any, CreateSupplyBodyReq>,
  res: Response
) => {
  const { message } = await adminServices.createSupply(req.body)
  res.json({
    message: message
  })
}

export const getSuppliesController = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      name_supplier: string
      name_product: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string
    }
  >,
  res: Response
) => {
  const {
    limit,
    page,
    name_product,
    name_supplier,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
  } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getSupplies(
    Number(limit),
    Number(page),
    name_product,
    name_supplier,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end
  )

  res.json({
    message: AdminMessage.GET_SUPPLIERS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}

export const getSupplyDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminServices.getSupplyDetail(id)

  res.json({
    message: AdminMessage.GET_SUPPLY_DETAIL,
    result: {
      result
    }
  })
}

export const updateSupplyDetailController = async (req: Request<{ id: string }, any, any>, res: Response) => {
  const { id } = req.params
  const { message } = await adminServices.updateSupply(id, req.body)
  res.json({
    message
  })
}

export const deleteSupplyController = async (req: Request<{ id: string }, any, any>, res: Response) => {
  const { id } = req.params
  const { message } = await adminServices.deleteSupply(id)

  res.json({
    message: message
  })
}

export const createReceiptController = async (req: Request<any, any, CreateReceiptBodyReq>, res: Response) => {
  const { message } = await adminServices.createReceipt(req.body)

  res.json({
    message: message
  })
}

export const getReceiptsController = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      name_supplier: string
      name_product: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string
      quantity: string
      price_min: string
      price_max: string
    }
  >,
  res: Response
) => {
  const {
    limit,
    page,
    name_product,
    name_supplier,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end,
    quantity,
    price_max,
    price_min
  } = req.query
  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getReceipts(
    Number(limit),
    Number(page),
    name_product,
    name_supplier,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end,
    quantity,
    price_max,
    price_min
  )

  res.json({
    message: AdminMessage.GET_RECEIPTS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}

export const getOrdersController = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
      name: string
      address: string
      phone: string
      status: string
      created_at_start: string
      created_at_end: string
      updated_at_start: string
      updated_at_end: string

      sortBy: string
    }
  >,
  res: Response
) => {
  const {
    limit,
    page,
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end,
    sortBy,
    name,
    address,
    phone,
    status
  } = req.query
  const nameEncode = name && decodeURIComponent(name)
  const addressEncode = address && decodeURIComponent(address)

  const { result, total, totalOfPage, limitRes, pageRes } = await adminServices.getOrders(
    Number(limit),
    Number(page),
    created_at_start,
    created_at_end,
    updated_at_start,
    updated_at_end,
    sortBy,
    nameEncode,
    addressEncode,
    phone,
    status
  )

  res.json({
    message: AdminMessage.GET_RECEIPTS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}

export const getOrderDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await adminServices.getOrderDetail(id)

  res.json({
    message: AdminMessage.GET_ORDER_DETAIL,
    result
  })
}

export const updateStatusOrderController = async (req: Request, res: Response) => {
  const { id } = req.params
  console.log(id)
  const { status } = req.body
  const { message } = await adminServices.updateStatusOrder(id, status)

  res.json({
    message: message
  })
}
