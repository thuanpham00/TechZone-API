import { ObjectId } from "mongodb"
import databaseServices from "./database.services"
import { updateMeReqBody } from "~/models/requests/user.requests"

class AdminServices {
  async getStatistical() {
    const [totalCustomer, totalProduct] = await Promise.all([
      databaseServices.users
        .aggregate([
          {
            $match: {
              role: "User"
            }
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.product
        .aggregate([
          {
            $count: "total"
          }
        ])
        .toArray()
    ])

    return {
      totalCustomer: totalCustomer[0]?.total || 0,
      totalProduct: totalProduct[0]?.total || 0
    }
  }

  async getCustomers(limit?: number, page?: number, email?: string, name?: string, phone?: string) {
    const $match: any = { role: "User" }
    if (email) {
      $match["email"] = { $regex: email, $options: "i" }
    }
    if (name) {
      $match["name"] = { $regex: name, $options: "i" }
    }
    if (phone) {
      $match["numberPhone"] = { $regex: phone, $options: "i" }
    }
    console.log($match)
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.users
        .aggregate([
          {
            $match
          },
          {
            $project: {
              email_verify_token: 0,
              forgot_password_token: 0,
              password: 0
            }
          },
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.users
        .aggregate([
          {
            $match
          },
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.users
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
    console.log(result)
    return {
      result,
      limitRes: limit || 5,
      pageRes: page || 1,
      total: total[0]?.total || 0,
      totalOfPage: totalOfPage[0]?.total || 0
    }
  }

  async getCustomer(id: string) {
    const result = await databaseServices.users.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          email_verify_token: 0,
          forgot_password_token: 0,
          password: 0
        }
      }
    )
    return result
  }

  async deleteCustomer(id: string) {
    const result = await databaseServices.users.findOneAndDelete({ _id: new ObjectId(id) })
    return result
  }

  async getCategories(limit?: number, page?: number) {
    const [result, total, totalOfPage] = await Promise.all([
      databaseServices.category
        .aggregate([
          {
            $skip: limit && page ? limit * (page - 1) : 0
          },
          {
            $limit: limit ? limit : 5
          }
        ])
        .toArray(),
      databaseServices.category
        .aggregate([
          {
            $count: "total"
          }
        ])
        .toArray(),
      databaseServices.category
        .aggregate([
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

const adminServices = new AdminServices()
export default adminServices
