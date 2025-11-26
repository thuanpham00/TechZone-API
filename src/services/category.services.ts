import databaseServices from "./database.services"

class CategoryClientServices {
  async getCategoryListIsActive() {
    const categories = await databaseServices.category
      .find(
        { is_active: true },
        {
          projection: {
            _id: 1,
            name: 1,
            is_active: 1
          }
        }
      )
      .toArray()
    return categories
  }

  async getListCategoryMenuIsActive() {
    // lấy danh sách category đang hoạt động
    const listCategoryList = await databaseServices.category.find({ is_active: true }).toArray()
    const categoryIds = listCategoryList.map((category) => category._id)

    const categoryMenus = await databaseServices.category_menu
      .aggregate([
        {
          $match: {
            category_id: { $in: categoryIds }
          }
        },
        {
          $project: {
            category_id: 1,
            sections: {
              $filter: {
                input: "$sections",
                as: "section",
                cond: { $eq: ["$$section.is_active", true] }
              }
            },
            created_at: 1,
            updated_at: 1
          }
        },
        {
          $match: {
            "sections.0": { $exists: true } // chỉ giữ document có ít nhất 1 section is_active = true
          }
        }
      ])
      .toArray()

    return categoryMenus
  }

  async getBannerBaseOnSlug() {
    const listSlugBanner = await databaseServices.category_menu
      .aggregate([
        {
          $unwind: "$sections"
        },
        {
          $unwind: "$sections.items"
        },
        {
          $project: {
            _id: 0,
            slug: "$sections.items.slug",
            banner: "$sections.items.banner",
            type_filter: "$sections.items.type_filter",
            name: "$sections.items.name"
          }
        }
      ])
      .toArray()
    return listSlugBanner
  }
}
const categoryServices = new CategoryClientServices()

export default categoryServices
