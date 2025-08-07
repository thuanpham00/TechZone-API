import databaseServices from "./database.services"

class EmailService {
  async getEmailLog(limit?: number, page?: number) {
    const $match: any = {}
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.emailLog
        .aggregate([
          {
            $match
          },
          { $sort: { created_at: -1 } },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.emailLog
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.emailLog
        .aggregate([
          {
            $match
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          },
          {
            $count: "total"
          }
        ])
        .toArray()
    ])

    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0
    }
  }
}

const emailService = new EmailService()
export default emailService
