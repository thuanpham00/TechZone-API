import { RoleType } from "~/constant/enum"
import databaseServices from "./database.services"

class ConversationServices {
  async getUserListType(user_id: string, typeUser: string) {
    const listUser = await databaseServices.users
      .find(
        { role: typeUser === "staff" ? RoleType.ADMIN : RoleType.USER },
        {
          projection: {
            _id: 1,
            name: 1,
            avatar: 1,
            role: 1,
            email: 1,
            numberPhone: 1
          }
        }
      )
      .sort({ created_at: -1 }) // -1 = DESC, 1 = ASC
      .toArray()

    return {
      result: listUser || [],
      total: listUser.length || 0
    }
  }
}

const conversationServices = new ConversationServices()
export default conversationServices
