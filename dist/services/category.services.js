"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_services_1 = __importDefault(require("./database.services"));
class CategoryClientServices {
    async getCategoryListIsActive() {
        const categories = await database_services_1.default.category
            .find({ is_active: true }, {
            projection: {
                _id: 1,
                name: 1,
                is_active: 1
            }
        })
            .toArray();
        return categories;
    }
    async getListCategoryMenuIsActive() {
        // lấy danh sách category đang hoạt động
        const listCategoryList = await database_services_1.default.category.find({ is_active: true }).toArray();
        const categoryIds = listCategoryList.map((category) => category._id);
        const categoryMenus = await database_services_1.default.category_menu
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
            .toArray();
        return categoryMenus;
    }
    async getBannerBaseOnSlug() {
        const listSlugBanner = await database_services_1.default.category_menu
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
                    type_filter: "$sections.items.type_filter"
                }
            }
        ])
            .toArray();
        return listSlugBanner;
    }
}
const categoryServices = new CategoryClientServices();
exports.default = categoryServices;
