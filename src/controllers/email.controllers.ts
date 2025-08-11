import { Request, Response } from "express"
import { resend } from "~/utils/ses"
import { ParamsDictionary } from "express-serve-static-core"
import emailService from "~/services/email.services"
import { EmailMessage } from "~/constant/message"

export const getEmailResendListController = async (
  req: Request<
    ParamsDictionary,
    any,
    any,
    {
      limit: string
      page: string
    }
  >,
  res: Response
) => {
  const { limit, page } = req.query

  const { result, total, totalOfPage, limitRes, pageRes } = await emailService.getEmailLog(Number(limit), Number(page))

  res.json({
    message: EmailMessage.GET_LIST_EMAIL_LOG_IS_SUCCESS,
    result: {
      result,
      limit: limitRes,
      page: pageRes,
      total,
      totalOfPage
    }
  })
}

export const getDomainListResendController = async (req: Request, res: Response) => {
  try {
    const result = await resend.domains.list()
    res.json({ success: true, data: result.data?.data })
  } catch (error) {
    res.status(500).json({ error })
  }
}
