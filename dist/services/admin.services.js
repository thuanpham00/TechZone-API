"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
const brand_category_schema_1 = require("../models/schema/brand_category.schema");
const message_1 = require("../constant/message");
const medias_services_1 = require("./medias.services");
const product_schema_1 = __importDefault(require("../models/schema/product.schema"));
const specification_schema_1 = __importDefault(require("../models/schema/specification.schema"));
const supply_supplier_schema_1 = require("../models/schema/supply_supplier.schema");
const enum_1 = require("../constant/enum");
const user_services_1 = require("./user.services");
const scripto_1 = require("../utils/scripto");
const users_schema_1 = require("../models/schema/users.schema");
const refreshToken_schema_1 = require("../models/schema/refreshToken.schema");
const ses_1 = require("../utils/ses");
const role_permission_schema_1 = require("../models/schema/role_permission.schema");
const r2_cloudflare_1 = require("../utils/r2_cloudflare");
const voucher_schema_1 = require("../models/schema/voucher.schema");
const common_1 = require("../utils/common");
class AdminServices {
    async getStatisticalSell(month, year) {
        let filterMonthYear = {};
        if (month && year) {
            filterMonthYear = {
                $and: [{ $eq: [{ $month: "$created_at" }, month] }, { $eq: [{ $year: "$created_at" }, year] }]
            };
        }
        else if (year) {
            filterMonthYear = {
                $eq: [{ $year: "$created_at" }, year]
            };
        }
        const [totalRevenue, totalOrder, totalProductSold, totalOrderDelivered, orderStatusRate, revenueFor6Month] = await Promise.all([
            // đếm tổng doanh thu của các đơn "đã giao hàng"
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        $expr: filterMonthYear,
                        status: "Đã giao hàng"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                }
            ])
                .toArray(),
            // đếm tổng số đơn
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        $expr: filterMonthYear
                    }
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            // đếm tổng số sp đã bán được "đã giao hàng"
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        $expr: filterMonthYear,
                        status: "Đã giao hàng"
                    }
                },
                { $unwind: "$products" },
                {
                    $group: {
                        _id: null, // nhóm dữ liệu dựa trên 1 trường nào đó
                        totalQuantity: { $sum: "$products.quantity" }
                    }
                }
            ])
                .toArray(),
            // đếm số đơn "đã giao"
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        $expr: filterMonthYear,
                        status: "Đã giao hàng"
                    }
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            // tỉ lệ trạng thái đơn hàng
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        $expr: filterMonthYear
                    }
                },
                {
                    $group: {
                        _id: "$status",
                        total: { $sum: 1 }
                    }
                }
            ])
                .toArray(),
            // tính doanh thu 6 tháng gần nhất
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        status: "Đã giao hàng"
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$created_at" },
                            month: { $month: "$created_at" }
                        }, // gom nhóm dữ liệu dựa trên year và month
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: {
                        "_id.year": -1,
                        "_id.month": -1
                    }
                },
                {
                    $limit: 6
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1
                    }
                }
            ])
                .toArray()
        ]);
        const revenue = totalRevenue[0]?.totalRevenue || 0;
        const deliveredCount = totalOrderDelivered[0]?.total || 0;
        const avgValue = deliveredCount ? revenue / deliveredCount : 0;
        const rateStatusOrder = orderStatusRate.map((item) => {
            const rate = (item.total * 100) / totalOrder[0].total;
            return {
                name: item._id,
                total: item.total,
                rate: Math.round(rate * 10) / 10 // làm tròn 1 chữ số thập phân
            };
        });
        const revenueFor6MonthData = revenueFor6Month.map((item) => {
            const { month, year } = item._id;
            return {
                label: `${year}-${month.toString().padStart(2, "0")}`,
                revenue: item.totalRevenue
            };
        });
        return {
            totalCustomer: {
                title: "Tổng số doanh thu theo tháng",
                value: revenue,
                color: "#c1121f"
            },
            totalOrder: {
                title: "Tổng số đơn hàng theo tháng",
                value: totalOrder[0]?.total || 0,
                color: "#3a86ff"
            },
            totalProductSold: {
                title: "Tổng số sản phẩm đã bán theo tháng",
                value: totalProductSold[0]?.totalQuantity || 0,
                color: "#f9c74f"
            },
            avgOrderValue: {
                title: "Giá trị trung bình mỗi đơn hàng theo tháng",
                value: Math.round(avgValue),
                color: "#8338ec"
            },
            rateStatusOrder,
            revenueFor6Month: {
                title: "Doanh thu 6 tháng gần nhất",
                value: revenueFor6MonthData
            }
        };
    }
    async getStatisticalProduct() {
        const [countCategory, top10ProductSold, productRunningOutOfStock] = await Promise.all([
            // tính số lượng sản phẩm của mỗi doanh mục
            database_services_1.default.product
                .aggregate([
                {
                    $group: {
                        _id: "$category", // nhóm dữ liệu dựa trên trường category
                        total: { $sum: 1 } // Đếm số lượng sản phẩm mỗi danh mục
                    }
                },
                {
                    $lookup: {
                        from: "category",
                        localField: "_id",
                        foreignField: "_id",
                        as: "categoryInfo"
                    }
                },
                { $unwind: "$categoryInfo" },
                {
                    $project: {
                        total: 1,
                        categoryId: "$_id",
                        categoryName: "$categoryInfo.name"
                    }
                },
                {
                    $sort: { total: -1 } // (Tùy chọn) Sắp xếp giảm dần theo số lượng
                }
            ])
                .toArray(),
            // top 10 sản phẩm bán chạy nhất
            database_services_1.default.product
                .aggregate([
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        sold: 1
                    }
                },
                {
                    $sort: { sold: -1 }
                },
                {
                    $limit: 10
                }
            ])
                .toArray(),
            // danh sách các sp sắp hết hàng stock < 5
            database_services_1.default.product
                .aggregate([
                {
                    $match: {
                        stock: { $lt: 5 }
                    }
                },
                {
                    $lookup: {
                        from: "category",
                        localField: "category",
                        foreignField: "_id",
                        as: "categoryInfo"
                    }
                },
                { $unwind: "$categoryInfo" },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        stock: 1,
                        categoryInfo: "$categoryInfo.name"
                    }
                }
            ])
                .toArray()
        ]);
        return {
            countCategory: {
                title: "Sản phẩm theo danh mục",
                value: countCategory
            },
            top10ProductSold: {
                title: "Top 10 sản phẩm bán chạy",
                value: top10ProductSold
            },
            productRunningOutOfStock: {
                title: "Danh sách các sản phẩm sắp hết hàng",
                value: productRunningOutOfStock
            }
        };
    }
    async getStatisticalUser(month, year) {
        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        let filterMonthYear = {};
        if (month && year) {
            filterMonthYear = {
                $and: [{ $eq: [{ $month: "$created_at" }, month] }, { $eq: [{ $year: "$created_at" }, year] }]
            };
        }
        else if (year) {
            filterMonthYear = {
                $eq: [{ $year: "$created_at" }, year]
            };
        }
        const [totalCustomer, top10CustomerBuyTheMost, rateReturningCustomers] = await Promise.all([
            database_services_1.default.users
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
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        $expr: filterMonthYear,
                        status: "Đã giao hàng"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user_id"
                    }
                },
                { $unwind: "$user_id" },
                {
                    $group: {
                        _id: "$user_id._id",
                        name: { $first: "$user_id.name" }, // hoặc "fullname", "email",...
                        email: { $first: "$user_id.email" }, // hoặc "fullname", "email",...
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: { totalRevenue: -1 }
                },
                {
                    $limit: 10
                }
            ])
                .toArray(),
            database_services_1.default.order
                .aggregate([
                {
                    $match: {
                        created_at: { $gte: threeMonthsAgo },
                        status: "Đã giao hàng",
                        user_id: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: "$user_id",
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalCustomers: { $sum: 1 },
                        returningCustomers: {
                            $sum: {
                                $cond: [{ $gt: ["$orderCount", 1] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalCustomers: 1,
                        returningCustomers: 1,
                        retentionRate: {
                            $cond: [
                                { $eq: ["$totalCustomers", 0] },
                                0,
                                {
                                    $multiply: [{ $divide: ["$returningCustomers", "$totalCustomers"] }, 100]
                                }
                            ]
                        }
                    }
                }
            ])
                .toArray()
        ]);
        return {
            totalCustomer: {
                title: "Khách hàng",
                value: totalCustomer[0]?.total || 0,
                color: "#c1121f"
            },
            totalStaff: {
                title: "Nhân viên",
                value: 0,
                color: "#3a86ff"
            },
            top10CustomerBuyTheMost,
            rateReturningCustomers
        };
    }
    async createCustomer(payload) {
        const roleId = (await database_services_1.default.role.findOne({ key: payload.role }).then((res) => res?._id));
        const emailVerifyToken = await user_services_1.userServices.signEmailVerifyToken({
            user_id: payload.id,
            verify: enum_1.UserVerifyStatus.Unverified,
            role: roleId.toString()
        });
        const [, token] = await Promise.all([
            database_services_1.default.users.insertOne(new users_schema_1.User({
                ...payload,
                _id: new mongodb_1.ObjectId(payload.id),
                password: (0, scripto_1.hashPassword)(payload.password),
                email_verify_token: emailVerifyToken,
                numberPhone: payload.phone,
                date_of_birth: new Date(payload.date_of_birth),
                role: roleId
            })),
            // tạo cặp AccessToken và RefreshToken mới
            user_services_1.userServices.signAccessTokenAndRefreshToken({
                user_id: payload.id,
                verify: enum_1.UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
                role: roleId.toString()
            })
        ]);
        const [accessToken, refreshToken] = token;
        const { exp, iat } = await user_services_1.userServices.decodeRefreshToken(refreshToken);
        const [user] = await Promise.all([
            database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(payload.id) }, { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }),
            // thêm RefreshToken mới vào DB
            database_services_1.default.refreshToken.insertOne(new refreshToken_schema_1.RefreshToken({ token: refreshToken, iat: iat, exp: exp, user_id: new mongodb_1.ObjectId(payload.id) }))
        ]);
        await (0, ses_1.sendVerifyRegisterEmail)(payload.email, emailVerifyToken);
        return {
            user
        };
    }
    async getCustomers(limit, page, email, name, phone, verify, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy) {
        const idRoleCustomer = await database_services_1.default.role.findOne({ key: "CUSTOMER" }).then((res) => res?._id);
        const $match = { role: idRoleCustomer };
        if (email) {
            $match["email"] = { $regex: (0, common_1.escapeRegex)(email), $options: "i" };
        }
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (phone) {
            $match["numberPhone"] = { $regex: phone, $options: "i" };
        }
        if (verify) {
            $match["verify"] = Number(verify);
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate // >= created_at_start
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            // Nếu đã có $match["created_at"], thêm $lte vào
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate; // <= created_at_end
            }
            else {
                $match["created_at"] = {
                    $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.users
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
                    $sort: { created_at: sortBy === "new" ? -1 : 1 }
                },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                }
            ])
                .toArray(),
            database_services_1.default.users
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.users
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
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async deleteCustomer(id) {
        const result = await database_services_1.default.users.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return result;
    }
    async createCategory(name, is_active) {
        const result = await database_services_1.default.category.insertOne(new brand_category_schema_1.Category({ name, is_active }));
        return result;
    }
    async getCategories(limit, page, name, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy) {
        const $match = {};
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate // >= created_at_start
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            // Nếu đã có $match["created_at"], thêm $lte vào
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate; // <= created_at_end
            }
            else {
                $match["created_at"] = {
                    $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.category
                .aggregate([
                {
                    $match
                },
                { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                }
            ])
                .toArray(),
            database_services_1.default.category
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.category
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
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    } // đã sửa (lk category & brand)
    async getNameCategoriesFilter() {
        const result = await database_services_1.default.category.find({}).toArray();
        const listName = result.map((item) => item.name);
        return listName;
    }
    async updateCategory(id, body) {
        const result = await database_services_1.default.category.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: body, $currentDate: { updated_at: true } }, { returnDocument: "after" });
        return result;
    } // ok
    async deleteCategory(id) {
        await database_services_1.default.category.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return {
            message: message_1.AdminMessage.DELETE_CATEGORY
        };
    } // ok
    async addMenuCategory(id_category, name, is_active, items) {
        // Upload banner cho từng item (nếu có)
        const itemsWithBanner = await Promise.all(items.map(async (item) => {
            let bannerUrl;
            if (item.banner) {
                const { url } = await medias_services_1.mediaServices.uploadBannerCategoryLink(item.banner, id_category);
                bannerUrl = url;
                return {
                    id_item: new mongodb_1.ObjectId(),
                    name: item.name,
                    slug: item.slug,
                    type_filter: item.type_filter,
                    banner: bannerUrl
                };
            }
            return {
                id_item: new mongodb_1.ObjectId(),
                name: item.name,
                slug: item.slug,
                type_filter: item.type_filter
            };
        }));
        // Thêm section mới vào category_menu
        await database_services_1.default.category_menu.updateOne({ category_id: new mongodb_1.ObjectId(id_category) }, {
            $push: {
                sections: {
                    id_section: new mongodb_1.ObjectId(),
                    name,
                    is_active,
                    items: itemsWithBanner
                }
            },
            $currentDate: { updated_at: true }
        }, { upsert: true });
    }
    async deleteMenuCategory(id) {
        await database_services_1.default.category_menu.updateOne({ "sections.id_section": new mongodb_1.ObjectId(id) }, {
            $pull: {
                sections: { id_section: new mongodb_1.ObjectId(id) }
            }
        });
    }
    async getMenuByCategoryId(id) {
        const result = await database_services_1.default.category_menu.findOne({ category_id: new mongodb_1.ObjectId(id) });
        return result;
    }
    async updateGroupNameMenu(id, id_section, name, is_active) {
        const result = await database_services_1.default.category_menu.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id), "sections.id_section": new mongodb_1.ObjectId(id_section) }, { $set: { "sections.$.name": name, "sections.$.is_active": is_active }, $currentDate: { updated_at: true } }, { returnDocument: "after" });
        return result;
    }
    async createLinkCategoryMenu(id, id_category, id_section, name, slug, type_filter, banner) {
        let urlImage = "";
        if (banner) {
            const { url } = await medias_services_1.mediaServices.uploadBannerCategoryLink(banner, id_category);
            urlImage = url;
        }
        const payload = {
            id_item: new mongodb_1.ObjectId(),
            name,
            slug,
            type_filter: type_filter
        };
        await database_services_1.default.category_menu.updateOne({
            _id: new mongodb_1.ObjectId(id),
            "sections.id_section": new mongodb_1.ObjectId(id_section)
        }, {
            $push: {
                "sections.$.items": banner ? { ...payload, banner: urlImage } : payload
            }
        });
    }
    async updateLinkCategoryMenu(idLink, id_category, name, slug, type_filter, banner) {
        const itemId = new mongodb_1.ObjectId(idLink);
        const payload = {
            name,
            slug,
            type_filter
        };
        // Nếu có gửi banner mới thì xóa ảnh cũ và upload ảnh mới
        if (banner) {
            // lấy ra ảnh banner hiện tại của item
            const findItem = await database_services_1.default.category_menu
                .aggregate([
                { $match: { "sections.items.id_item": itemId } },
                {
                    $unwind: "$sections"
                },
                { $unwind: "$sections.items" },
                { $match: { "sections.items.id_item": itemId } },
                { $project: { _id: 0, banner: "$sections.items.banner" } }
            ])
                .toArray();
            const oldBannerUrl = findItem[0]?.banner;
            // 2) Xóa file trên R2 nếu có
            if (oldBannerUrl) {
                await (0, r2_cloudflare_1.deleteFromR2ByUrl)(oldBannerUrl);
            }
            // 3) Upload ảnh mới
            const { url } = await medias_services_1.mediaServices.uploadBannerCategoryLink(banner, id_category);
            payload.banner = url;
        }
        const updateFields = {
            "sections.$[].items.$[item].name": payload.name,
            "sections.$[].items.$[item].slug": payload.slug,
            "sections.$[].items.$[item].type_filter": payload.type_filter
        };
        if (payload.banner) {
            updateFields["sections.$[].items.$[item].banner"] = payload.banner;
        }
        await database_services_1.default.category_menu.updateOne({
            "sections.items.id_item": itemId
        }, {
            $set: updateFields,
            $currentDate: { updated_at: true }
        }, {
            arrayFilters: [{ "item.id_item": itemId }]
        });
    }
    async deleteLinkCategoryMenu(idItem) {
        const itemId = new mongodb_1.ObjectId(idItem);
        // 1) Tìm URL banner của item (nếu có)
        const found = await database_services_1.default.category_menu
            .aggregate([
            { $match: { "sections.items.id_item": itemId } },
            { $unwind: "$sections" },
            { $unwind: "$sections.items" },
            { $match: { "sections.items.id_item": itemId } },
            { $project: { _id: 0, banner: "$sections.items.banner" } }
        ])
            .toArray();
        const bannerUrl = found[0]?.banner;
        // 2) Xóa file trên R2 nếu có
        if (bannerUrl) {
            await (0, r2_cloudflare_1.deleteFromR2ByUrl)(bannerUrl);
        }
        // 3) Xóa item khỏi mọi section chứa nó
        await database_services_1.default.category_menu.updateOne({ "sections.items.id_item": itemId }, {
            $pull: {
                "sections.$[].items": { id_item: itemId }
            }
        });
        return { deleted: true };
    }
    async getBrands(id, limit, page, name, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy) {
        const $match = { category_ids: new mongodb_1.ObjectId(id) };
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate // >= created_at_start
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            // Nếu đã có $match["created_at"], thêm $lte vào
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate; // <= created_at_end
            }
            else {
                $match["created_at"] = {
                    $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.brand
                .aggregate([
                {
                    $match
                },
                { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                }
            ])
                .toArray(),
            database_services_1.default.brand
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.brand
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
        ]);
        // tìm các brand có chung category_id (các brand thuộc danh mục này)
        const listId = result.map((item) => item._id);
        const listTotalProduct = await Promise.all(listId.map(async (item) => {
            const countProduct = await database_services_1.default.product
                .aggregate([
                {
                    $match: {
                        brand: item,
                        category: new mongodb_1.ObjectId(id)
                    }
                },
                {
                    $count: "total" // đếm số sản phẩm thuộc 1 thương hiệu -> tạo thành 1 list | chạy theo từng id của brand
                }
            ])
                .toArray();
            return {
                brand: item,
                total: countProduct.length > 0 ? countProduct[0].total : 0
            };
        }));
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0,
            listTotalProduct
        };
    } // đã sửa (lk category & brand)
    async getNameBrandsFilter() {
        const result = await database_services_1.default.brand.find({}).toArray();
        const listName = result.map((item) => item.name);
        return listName;
    }
    async createBrand(name, categoryId) {
        let brand = await database_services_1.default.brand.findOne({ name: name });
        let brandId;
        // Nếu không tìm thấy brand, tiến hành tạo mới
        if (!brand) {
            const insertBrand = await database_services_1.default.brand.insertOne(new brand_category_schema_1.Brand({
                name: name,
                category_ids: [new mongodb_1.ObjectId(categoryId)]
            }));
            brandId = insertBrand.insertedId;
        }
        else {
            // Nếu đã tồn tại brand, tiến hành cập nhật
            brandId = brand._id;
            await database_services_1.default.brand.updateOne({ name: name }, {
                $addToSet: {
                    category_ids: new mongodb_1.ObjectId(categoryId)
                }
            });
        }
        // Cập nhật vào category
        await database_services_1.default.category.updateOne({ _id: new mongodb_1.ObjectId(categoryId) }, {
            $addToSet: { brand_ids: brandId }, // Thêm brandId vào category
            $currentDate: { updated_at: true } // Cập nhật thời gian
        });
        return {
            message: message_1.AdminMessage.CREATE_BRAND_DETAIL
        };
    }
    async updateBrand(id, body) {
        const result = await database_services_1.default.brand.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: body, $currentDate: { updated_at: true } }, { returnDocument: "after" });
        return result;
    }
    async deleteBrand(categoryId, brandId) {
        // 1. Xóa brandId khỏi mảng brand_ids của danh mục (Category)
        await database_services_1.default.category.updateOne({
            _id: new mongodb_1.ObjectId(categoryId),
            brand_ids: {
                $in: [new mongodb_1.ObjectId(brandId)]
            }
        }, {
            $pull: {
                brand_ids: new mongodb_1.ObjectId(brandId)
            }
        });
        // 2. Xóa categoryId khỏi mảng category_ids của thương hiệu (Brand)
        await database_services_1.default.brand.updateOne({
            _id: new mongodb_1.ObjectId(brandId),
            category_ids: {
                $in: [new mongodb_1.ObjectId(categoryId)]
            }
        }, {
            $pull: {
                category_ids: new mongodb_1.ObjectId(categoryId)
            }
        });
        const brand = await database_services_1.default.brand.findOne({ _id: new mongodb_1.ObjectId(brandId) });
        if (brand && brand.category_ids.length === 0) {
            // Nếu không còn liên kết với bất kỳ danh mục nào, xóa thương hiệu
            await database_services_1.default.brand.deleteOne({ _id: new mongodb_1.ObjectId(brandId) });
        }
        return {
            message: message_1.AdminMessage.DELETE_BRAND
        };
    }
    async getProducts(limit, page, name, brand, category, created_at_start, created_at_end, updated_at_start, updated_at_end, price_min, price_max, status, sortBy) {
        const $match = {};
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (brand) {
            const nameUpperCase = brand
                ?.split("")
                .map((item) => item.toUpperCase())
                .join("");
            const findBrand = await database_services_1.default.brand.findOne({ name: nameUpperCase });
            $match["brand"] = findBrand?._id;
        }
        if (category) {
            const findCategory = await database_services_1.default.category.findOne({ name: category });
            $match["category"] = findCategory?._id;
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate;
            }
            else {
                $match["created_at"] = {
                    $lte: endDate
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        if (price_min) {
            const minPrice = Number(price_min.replace(/[.,]/g, ""));
            if (!isNaN(minPrice)) {
                $match["price"] = { $gte: minPrice };
            }
        }
        if (price_max) {
            const maxPrice = Number(price_max.replace(/[.,]/g, ""));
            if (!isNaN(maxPrice)) {
                if ($match["price"]) {
                    $match["price"]["$lte"] = maxPrice;
                }
                else {
                    $match["price"] = { $lte: maxPrice };
                }
            }
        }
        if (status) {
            $match["status"] = status;
        }
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.product
                .aggregate([
                {
                    $match
                },
                { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                },
                {
                    $lookup: {
                        from: "brand",
                        localField: "brand",
                        foreignField: "_id",
                        as: "brand"
                        //  pipeline: [
                        //   {
                        //     $project: {
                        //       _id: 1,
                        //       name: 1
                        //     }
                        //   }
                        // ] // dùng cái này hoặc $addFields bên dưới cũng được
                    }
                }, // tham chiếu đến brand
                {
                    $addFields: {
                        brand: {
                            $map: {
                                input: "$brand",
                                as: "brandItem",
                                in: {
                                    name: "$$brandItem.name"
                                }
                            }
                        }
                    }
                }, // ghi đè lại giá trị brand sẵn có
                {
                    $unwind: {
                        path: "$brand"
                    }
                },
                {
                    $lookup: {
                        from: "category",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                        //  pipeline: [
                        //   {
                        //     $project: {
                        //       _id: 1,
                        //       name: 1
                        //     }
                        //   }
                        // ] // dùng cái này hoặc $addFields bên dưới cũng được
                    }
                }, // tham chiếu đến category
                {
                    $addFields: {
                        category: {
                            $map: {
                                input: "$category",
                                as: "categoryItem",
                                in: {
                                    name: "$$categoryItem.name"
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$category"
                    }
                },
                {
                    $lookup: {
                        from: "specification",
                        localField: "specifications",
                        foreignField: "_id",
                        as: "specifications"
                    }
                },
                {
                    $project: {
                        reviews: 0,
                        viewCount: 0,
                        gifts: 0,
                        sold: 0,
                        averageRating: 0
                    }
                }
            ])
                .toArray(),
            database_services_1.default.product
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.product
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
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async getNameProductsFilter() {
        const result = await database_services_1.default.product.find({}).toArray();
        const listName = result.map((item) => item.name);
        return listName;
    }
    async checkCategoryBrandExist(category, brand) {
        // nhận vào category và brand
        // check xem brand đó có tồn tại không
        let brandId;
        const existsBrand = await database_services_1.default.brand.findOne({ name: brand });
        if (existsBrand) {
            brandId = existsBrand._id; // lấy id thương hiệu
        }
        else {
            const newBrand = await database_services_1.default.brand.insertOne(new brand_category_schema_1.Brand({ name: brand, category_ids: [] })); // sẽ cập nhật category_ids sau
            brandId = newBrand.insertedId; // lấy id thương hiệu mới
        }
        const categoryCheck = await database_services_1.default.category.findOneAndUpdate({ name: category }, // nếu danh mục không tồn tại // thì thêm mới
        {
            $setOnInsert: new brand_category_schema_1.Category({ name: category, is_active: true, brand_ids: [brandId] }) // nếu không tồn tại danh mục thì thêm mới (danh mục liên kết với thương hiệu)
        }, {
            upsert: true,
            returnDocument: "after" // cập nhật liền sau khi update (trên postman)
        });
        const categoryId = categoryCheck._id;
        // nếu danh mục tồn tại (mà chưa có brandIds) cần check lại vì nó bỏ qua setOnInsert
        const categoryWithBrand = await database_services_1.default.category.findOne({
            _id: categoryId,
            brand_ids: { $in: [brandId] }
        });
        if (!categoryWithBrand) {
            await database_services_1.default.category.updateOne({ _id: categoryId }, {
                $addToSet: { brand_ids: brandId } // Thêm brandId vào mảng brand_ids nếu chưa tồn tại
            });
        }
        await database_services_1.default.brand.updateOne({ _id: brandId }, {
            $addToSet: {
                category_ids: categoryId // cập nhật lại category_ids (thương hiệu liên kết với thương hiệu)
            }
        });
        return { categoryId, brandId };
    } // truyền vào giá trị "asus" => nó check coi có tồn tại name này không, nếu có thì thôi, không thì tạo mới => lấy ra ObjectID
    async checkSpecificationExist(category_id, specificationList) {
        const specifications = await Promise.all(specificationList.map(async (item) => {
            try {
                const spec = await database_services_1.default.specification.findOneAndUpdate({
                    name: item.name,
                    value: item.value,
                    category_id: category_id
                }, {
                    $setOnInsert: new specification_schema_1.default({
                        category_id: category_id,
                        name: item.name,
                        value: item.value
                    })
                }, {
                    upsert: true,
                    returnDocument: "after" // cập nhật liền sau khi update (trên postman)
                });
                return spec;
            }
            catch (error) {
                console.log("lỗi", error);
            }
        }));
        const listId = specifications.map((item) => item?._id);
        return listId;
    }
    async createProduct(payload) {
        const { categoryId, brandId } = await this.checkCategoryBrandExist(payload.category, payload.brand);
        const specificationList = await this.checkSpecificationExist(categoryId, payload.specifications);
        const productId = new mongodb_1.ObjectId();
        const { url: urlBanner, type: typeBanner } = await medias_services_1.mediaServices.uploadBanner(payload.banner, payload.category, productId.toString());
        const { upload } = await medias_services_1.mediaServices.uploadImageList(payload.medias, payload.category, productId.toString());
        const result = await database_services_1.default.product.findOneAndUpdate({ name: payload.name, brand: brandId, category: categoryId }, {
            $setOnInsert: new product_schema_1.default({
                ...payload,
                _id: productId,
                name: payload.name,
                brand: brandId,
                category: categoryId,
                price: payload.price,
                discount: payload.discount,
                stock: payload.stock,
                isFeatured: payload.isFeatured,
                description: payload.description,
                banner: {
                    type: typeBanner,
                    url: urlBanner
                },
                medias: upload,
                specifications: specificationList
            })
        }, {
            upsert: true,
            returnDocument: "after"
        } // nếu có sản phẩm này rồi thì không thêm nữa, nếu chưa có thì thêm mới
        );
        return result;
    }
    async createSupplier(payload) {
        await database_services_1.default.supplier.insertOne(new supply_supplier_schema_1.Supplier({
            ...payload,
            name: payload.name,
            contactName: payload.contactName,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            taxCode: payload.taxCode
        }));
        return {
            message: message_1.AdminMessage.CREATE_SUPPLIER_DETAIL
        };
    }
    async getSuppliers(limit, page, name, email, phone, contactName, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy) {
        const $match = {};
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (email) {
            $match["email"] = { $regex: (0, common_1.escapeRegex)(email), $options: "i" };
        }
        if (phone) {
            $match["phone"] = { $regex: phone, $options: "i" };
        }
        if (contactName) {
            $match["contactName"] = { $regex: contactName, $options: "i" };
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate // >= created_at_start
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            // Nếu đã có $match["created_at"], thêm $lte vào
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate; // <= created_at_end
            }
            else {
                $match["created_at"] = {
                    $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.supplier
                .aggregate([
                {
                    $match
                },
                { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                }
            ])
                .toArray(),
            database_services_1.default.supplier
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.supplier
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
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async getNameSuppliersFilter() {
        const result = await database_services_1.default.supplier.find({}).toArray();
        const listName = result.map((item) => item.name);
        return listName;
    }
    // ######
    async getNameSuppliersNotLinkedToProduct(productId) {
        // lấy ra danh sách cung ứng dựa trên tên sản phẩm
        const [listSupplierBasedOnProduct, listSupplier] = await Promise.all([
            database_services_1.default.supply
                .aggregate([
                {
                    $match: {
                        productId: new mongodb_1.ObjectId(productId)
                    }
                },
                {
                    $lookup: {
                        from: "supplier",
                        localField: "supplierId",
                        foreignField: "_id",
                        as: "supplierId"
                    }
                },
                {
                    $addFields: {
                        supplierId: {
                            $map: {
                                input: "$supplierId",
                                as: "supplierItem",
                                in: {
                                    _id: "$$supplierItem._id"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        productId: 0,
                        importPrice: 0,
                        warrantyMonths: 0,
                        leadTimeDays: 0,
                        description: 0,
                        created_at: 0,
                        updated_at: 0
                    }
                }
            ])
                .toArray(),
            database_services_1.default.supplier.find({}).toArray()
        ]);
        const listIdSupplierFilter = listSupplierBasedOnProduct.map((item) => item.supplierId[0]._id);
        const listIdSUpplier = listSupplier.map((item) => item._id);
        const supplierIdsNotInProduct = listIdSUpplier.filter((itemB) => !listIdSupplierFilter.some((itemA) => itemA.equals(itemB)));
        const suppliers = await database_services_1.default.supplier
            .find({ _id: { $in: supplierIdsNotInProduct } })
            .project({ name: 1 })
            .toArray();
        const listNameSupplier = suppliers.map((supplier) => supplier.name);
        return listNameSupplier;
    }
    async getNameSuppliersLinkedToProduct(productId) {
        // lấy ra danh sách cung ứng dựa trên tên sản phẩm
        const [listSupplierBasedOnProduct] = await Promise.all([
            database_services_1.default.supply
                .aggregate([
                {
                    $match: {
                        productId: new mongodb_1.ObjectId(productId)
                    }
                },
                {
                    $lookup: {
                        from: "supplier",
                        localField: "supplierId",
                        foreignField: "_id",
                        as: "supplierId"
                    }
                },
                {
                    $addFields: {
                        supplierId: {
                            $map: {
                                input: "$supplierId",
                                as: "supplierItem",
                                in: {
                                    _id: "$$supplierItem._id"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        productId: 0,
                        importPrice: 0,
                        warrantyMonths: 0,
                        leadTimeDays: 0,
                        description: 0,
                        created_at: 0,
                        updated_at: 0
                    }
                }
            ])
                .toArray()
        ]);
        const listIdSupplierFilter = listSupplierBasedOnProduct.map((item) => item.supplierId[0]._id);
        const suppliers = await database_services_1.default.supplier
            .find({ _id: { $in: listIdSupplierFilter } })
            .project({ name: 1 })
            .toArray();
        const listNameSupplier = suppliers.map((supplier) => supplier.name);
        return listNameSupplier;
    }
    async getPricePerUnitFromProductAndSupplier(productId, supplierId) {
        const result = await database_services_1.default.supply.findOne({ productId: new mongodb_1.ObjectId(productId), supplierId: new mongodb_1.ObjectId(supplierId) }, { projection: { importPrice: 1 } });
        return result;
    }
    async updateSupplier(id, body) {
        await database_services_1.default.supplier.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $set: body,
            $currentDate: { updated_at: true } // cập nhật thời gian
        });
        return {
            message: message_1.AdminMessage.UPDATE_SUPPLIER_DETAIL
        };
    }
    async deleteSupplier(id) {
        await database_services_1.default.supplier.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return {
            message: message_1.AdminMessage.DELETE_SUPPLIER
        };
    } // ok
    async createSupply(payload) {
        const [productId, supplierId] = await Promise.all([
            database_services_1.default.product.findOne({ name: payload.productId }),
            database_services_1.default.supplier.findOne({ name: payload.supplierId })
        ]);
        await database_services_1.default.supply.insertOne(new supply_supplier_schema_1.Supply({
            ...payload,
            productId: new mongodb_1.ObjectId(productId?._id),
            supplierId: new mongodb_1.ObjectId(supplierId?._id),
            importPrice: payload.importPrice,
            warrantyMonths: payload.warrantyMonths,
            leadTimeDays: payload.leadTimeDays
        }));
        return {
            message: message_1.AdminMessage.CREATE_SUPPLY_DETAIL
        };
    }
    async getSellPriceProduct(nameProduct) {
        const result = await database_services_1.default.product.findOne({ name: nameProduct }).then((res) => res?.price);
        return {
            priceProduct: result
        };
    }
    async getSupplies(limit, page, name_product, name_supplier, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy) {
        const $match = {};
        const findIdProduct = await database_services_1.default.product.findOne({ name: name_product });
        const findIdSupplier = await database_services_1.default.supplier.findOne({ name: name_supplier });
        if (name_product) {
            $match["productId"] = findIdProduct?._id;
        }
        if (name_supplier) {
            $match["supplierId"] = findIdSupplier?._id;
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate // >= created_at_start
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            // Nếu đã có $match["created_at"], thêm $lte vào
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate; // <= created_at_end
            }
            else {
                $match["created_at"] = {
                    $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.supply
                .aggregate([
                {
                    $match
                },
                {
                    $lookup: {
                        from: "product",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productId"
                    }
                },
                {
                    $addFields: {
                        productId: {
                            $map: {
                                input: "$productId",
                                as: "productItem",
                                in: {
                                    name: "$$productItem.name"
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "supplier",
                        localField: "supplierId",
                        foreignField: "_id",
                        as: "supplierId"
                    }
                },
                {
                    $addFields: {
                        supplierId: {
                            $map: {
                                input: "$supplierId",
                                as: "supplierItem",
                                in: {
                                    name: "$$supplierItem.name"
                                }
                            }
                        }
                    }
                },
                { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                }
            ])
                .toArray(),
            database_services_1.default.supply
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.supply
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
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async updateSupply(id, body) {
        const [productId, supplierId] = await Promise.all([
            database_services_1.default.product.findOne({ name: body.productId }),
            database_services_1.default.supplier.findOne({ name: body.supplierId })
        ]);
        await database_services_1.default.supply.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $set: {
                ...body,
                productId: new mongodb_1.ObjectId(productId?._id),
                supplierId: new mongodb_1.ObjectId(supplierId?._id)
            },
            $currentDate: { updated_at: true } // cập nhật thời gian
        });
        return {
            message: message_1.AdminMessage.UPDATE_SUPPLY_DETAIL
        };
    }
    async deleteSupply(id) {
        await database_services_1.default.supply.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return {
            message: message_1.SupplyMessage.DELETE_SUPPLY
        };
    } // ok
    async createReceipt(body) {
        const listItem = await Promise.all(body.items.map(async (item) => {
            const [productId, supplierId] = await Promise.all([
                database_services_1.default.product.findOne({ name: item.productId }),
                database_services_1.default.supplier.findOne({ name: item.supplierId })
            ]);
            return {
                ...item,
                productId: new mongodb_1.ObjectId(productId?._id),
                supplierId: new mongodb_1.ObjectId(supplierId?._id)
            };
        }));
        const listItemNameAndQuantity = listItem.map((item) => {
            const itemNameAndQuantity = {
                idProduct: item.productId,
                quantityProduct: item.quantity
            };
            return itemNameAndQuantity;
        });
        await Promise.all([
            database_services_1.default.receipt.insertOne(new supply_supplier_schema_1.Receipt({
                items: listItem,
                importDate: body.importDate,
                totalAmount: body.totalAmount,
                totalItem: body.totalItem,
                note: body.note
            })),
            Promise.all(listItemNameAndQuantity.map(async (item) => {
                await database_services_1.default.product.updateOne({
                    _id: new mongodb_1.ObjectId(item.idProduct)
                }, {
                    $inc: {
                        stock: item.quantityProduct
                    },
                    $set: {
                        status: enum_1.ProductStatus.AVAILABLE // set trạng thái có hàng
                    },
                    $currentDate: {
                        updated_at: true
                    }
                });
            }))
        ]);
        return {
            message: message_1.ReceiptMessage.CREATE_RECEIPT_IS_SUCCESS
        };
    }
    async getReceipts(limit, page, name_product, name_supplier, created_at_start, created_at_end, updated_at_start, updated_at_end, quantity, price_max, price_min, sortBy) {
        const $match = {};
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate;
            }
            else {
                $match["created_at"] = {
                    $lte: endDate
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        if (quantity) {
            $match["$expr"] = {
                $eq: [{ $size: "$items" }, Number(quantity)]
            };
        }
        if (price_min) {
            const minPrice = Number(price_min.replace(/[.,]/g, ""));
            if (!isNaN(minPrice)) {
                $match["totalAmount"] = { $gte: minPrice };
            }
        }
        if (price_max) {
            const maxPrice = Number(price_max.replace(/[.,]/g, ""));
            if (!isNaN(maxPrice)) {
                if ($match["totalAmount"]) {
                    $match["totalAmount"]["$lte"] = maxPrice;
                }
                else {
                    $match["totalAmount"] = { $lte: maxPrice };
                }
            }
        }
        // Tìm ID của product và supplier nếu có
        const findIdProduct = name_product ? await database_services_1.default.product.findOne({ name: name_product }) : null;
        const findIdSupplier = name_supplier ? await database_services_1.default.supplier.findOne({ name: name_supplier }) : null;
        // Thêm điều kiện tìm kiếm dựa trên productId hoặc supplierId
        if (findIdProduct) {
            $match["items.productId"] = new mongodb_1.ObjectId(findIdProduct._id);
        }
        if (findIdSupplier) {
            $match["items.supplierId"] = new mongodb_1.ObjectId(findIdSupplier._id);
        }
        const pipeline = [
            { $match },
            // Lookup để lấy thông tin chi tiết của product
            {
                $lookup: {
                    from: "product",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            // Gắn thông tin product vào từng item
            {
                $addFields: {
                    items: {
                        $map: {
                            input: "$items",
                            as: "item",
                            in: {
                                $mergeObjects: [
                                    "$$item",
                                    {
                                        productId: {
                                            $arrayElemAt: [
                                                "$productDetails",
                                                {
                                                    $indexOfArray: ["$productDetails._id", "$$item.productId"]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Lookup để lấy thông tin chi tiết của supplier
            {
                $lookup: {
                    from: "supplier",
                    localField: "items.supplierId",
                    foreignField: "_id",
                    as: "supplierDetails"
                }
            },
            // Gắn thông tin supplier vào từng item
            {
                $addFields: {
                    items: {
                        $map: {
                            input: "$items",
                            as: "item",
                            in: {
                                $mergeObjects: [
                                    "$$item",
                                    {
                                        supplierId: {
                                            $arrayElemAt: [
                                                "$supplierDetails",
                                                {
                                                    $indexOfArray: ["$supplierDetails._id", "$$item.supplierId"]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Loại bỏ các trường tạm thời
            {
                $project: {
                    productDetails: 0,
                    supplierDetails: 0
                }
            },
            // Phân trang
            { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
            {
                $skip: limit && page ? limit * (page - 1) : 0
            },
            {
                $limit: limit ? limit : 5
            }
        ];
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.receipt.aggregate(pipeline).toArray(),
            database_services_1.default.receipt.aggregate([{ $match }, { $count: "total" }]).toArray(),
            database_services_1.default.receipt
                .aggregate([
                { $match },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                },
                { $count: "total" }
            ])
                .toArray()
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async getOrdersInProcess(type_filter, limit, page, created_at_start, created_at_end, updated_at_start, updated_at_end, sortBy, name, address, phone, status) {
        const $match = {};
        if (type_filter === "completed") {
            $match.status = enum_1.OrderStatus.delivered; // "Đã giao hàng"
        }
        else if (type_filter === "canceled") {
            $match.status = enum_1.OrderStatus.cancelled; // "Đã hủy"
        }
        else if (type_filter === "in_process") {
            $match.status = { $nin: [enum_1.OrderStatus.delivered, enum_1.OrderStatus.cancelled] }; // Trừ đã giao và đã hủy
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate;
            }
            else {
                $match["created_at"] = {
                    $lte: endDate
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        if (name) {
            $match["customer_info.name"] = name;
        }
        if (address) {
            $match["customer_info.address"] = address;
        }
        if (phone) {
            $match["customer_info.phone"] = phone;
        }
        if (status) {
            $match["status"] = status;
        }
        const pipeline = [
            { $match },
            { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
            {
                $skip: limit && page ? limit * (page - 1) : 0
            },
            {
                $limit: limit ? limit : 5
            }
        ];
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.order.aggregate(pipeline).toArray(),
            database_services_1.default.order.aggregate([{ $match }, { $count: "total" }]).toArray(),
            database_services_1.default.order
                .aggregate([
                { $match },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                },
                { $count: "total" }
            ])
                .toArray()
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async updateStatusOrder(id, status) {
        await database_services_1.default.order.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
            $set: {
                status: status
            },
            $push: {
                status_history: {
                    status: status,
                    updated_at: new Date()
                }
            },
            $currentDate: { updated_at: true }
        });
        return {
            message: message_1.AdminMessage.UPDATE_STATUS_ORDER
        };
    }
    async getVouchers(limit, page, name, code, status, sortBy) {
        const $match = {};
        const pipeline = [
            { $match },
            // Phân trang
            { $sort: { created_at: sortBy === "new" ? -1 : 1, _id: 1 } },
            {
                $skip: limit && page ? limit * (page - 1) : 0
            },
            {
                $limit: limit ? limit : 5
            }
        ];
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.vouchers.aggregate(pipeline).toArray(),
            database_services_1.default.vouchers.aggregate([{ $match }, { $count: "total" }]).toArray(),
            database_services_1.default.vouchers
                .aggregate([
                { $match },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                },
                { $count: "total" }
            ])
                .toArray()
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async getVouchersForOrders(id, limit, page) {
        const $match = {
            voucher_id: new mongodb_1.ObjectId(id),
            status: { $ne: enum_1.OrderStatus.cancelled } // loại trừ đơn hàng đã hủy
        };
        const pipeline = [
            {
                $match
            },
            {
                $skip: limit && page ? limit * (page - 1) : 0
            },
            {
                $limit: limit ? limit : 5
            }
        ];
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.order.aggregate(pipeline).toArray(),
            database_services_1.default.order.aggregate([{ $match }, { $count: "total" }]).toArray(),
            database_services_1.default.order
                .aggregate([
                { $match },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                },
                { $count: "total" }
            ])
                .toArray()
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async createVoucher(body) {
        const startDate = new Date(body.start_date);
        const endDate = new Date(body.end_date);
        const result = await database_services_1.default.vouchers.insertOne(new voucher_schema_1.Voucher({
            code: body.code,
            description: body.description,
            type: body.type,
            value: body.value,
            max_discount: body.max_discount,
            min_order_value: body.min_order_value,
            usage_limit: body.usage_limit,
            used_count: 0,
            start_date: startDate,
            end_date: endDate,
            status: body.status || enum_1.VoucherStatus.active
        }));
        const voucher = await database_services_1.default.vouchers.findOne({ _id: result.insertedId });
        return voucher;
    }
    async updateVoucher(id, body) {
        const updateData = { ...body };
        await database_services_1.default.vouchers.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateData });
        return {
            message: message_1.AdminMessage.UPDATE_VOUCHER_SUCCESS
        };
    }
    async deleteVoucher(id) {
        await database_services_1.default.vouchers.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return {
            message: message_1.AdminMessage.DELETE_VOUCHER_SUCCESS
        };
    }
    async getRoles() {
        const [result] = await Promise.all([
            database_services_1.default.role
                .aggregate([
                {
                    $sort: { created_at: -1 }
                }
            ])
                .toArray()
        ]);
        return {
            result
        };
    }
    async createRole(body) {
        await database_services_1.default.role.insertOne(new role_permission_schema_1.Role({
            name: body.name,
            description: body.description,
            key: body.name.toUpperCase().replace(/\s+/g, "_"),
            permissions: []
        }));
        return {
            message: message_1.AdminMessage.CREATE_ROLE_DETAIL
        };
    }
    async updateRole(idRole, body) {
        await database_services_1.default.role.updateOne({ _id: new mongodb_1.ObjectId(idRole) }, { $set: { ...body }, $currentDate: { updated_at: true } });
        return {
            message: message_1.AdminMessage.UPDATE_ROLE_DETAIL
        };
    }
    async deleteRole(idRole) {
        await database_services_1.default.role.deleteOne({ _id: new mongodb_1.ObjectId(idRole) });
        return {
            message: message_1.AdminMessage.UPDATE_ROLE_DETAIL
        };
    }
    async getPermissions() {
        const result = await database_services_1.default.permissions.find({}).toArray();
        return {
            result
        };
    }
    async getPermissionsBasedOnIdRole(listIdRole) {
        const [result] = await Promise.all([
            database_services_1.default.role
                .aggregate([
                {
                    $match: {
                        _id: {
                            $in: listIdRole.map((item) => new mongodb_1.ObjectId(item))
                        }
                    }
                },
                {
                    $lookup: {
                        from: "permissions",
                        localField: "permissions",
                        foreignField: "_id",
                        as: "permissions"
                    }
                },
                {
                    $project: {
                        created_at: 0,
                        updated_at: 0,
                        "permissions.created_at": 0,
                        "permissions.updated_at": 0
                    }
                }
            ])
                .toArray()
        ]);
        return result;
    }
    async updatePermissionsBasedOnIdRole(payload) {
        const results = await Promise.all(payload.map(async (item) => {
            const roleId = new mongodb_1.ObjectId(item._id);
            const addIds = item.add.map((id) => new mongodb_1.ObjectId(id));
            const removeIds = item.remove.map((id) => new mongodb_1.ObjectId(id));
            // Thêm quyền mới
            if (addIds.length > 0) {
                await database_services_1.default.role.updateOne({ _id: roleId }, { $addToSet: { permissions: { $each: addIds } } });
            }
            // Xoá quyền
            if (removeIds.length > 0) {
                await database_services_1.default.role.updateOne({ _id: roleId }, { $pull: { permissions: { $in: removeIds } } });
            }
            // Trả về role sau khi update
            return database_services_1.default.role.findOne({ _id: roleId });
        }));
        return {
            result: results
        };
    }
    async getStaffs(limit, page, email, name, phone, sortBy, created_at_start, created_at_end, updated_at_start, updated_at_end) {
        const allRole = await database_services_1.default.role.find({}).toArray();
        const groupRoleExcludeAdminAndCustomer = allRole
            .filter((role) => role.key !== "ADMIN" && role.key !== "CUSTOMER")
            .map((item) => item._id);
        const $match = { role: { $in: groupRoleExcludeAdminAndCustomer } };
        if (email) {
            $match["email"] = { $regex: (0, common_1.escapeRegex)(email), $options: "i" };
        }
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (phone) {
            $match["numberPhone"] = { $regex: phone, $options: "i" };
        }
        if (created_at_start) {
            const startDate = new Date(created_at_start);
            $match["created_at"] = {
                $gte: startDate // >= created_at_start
            };
        }
        if (created_at_end) {
            const endDate = new Date(created_at_end);
            // Nếu đã có $match["created_at"], thêm $lte vào
            if ($match["created_at"]) {
                $match["created_at"]["$lte"] = endDate; // <= created_at_end
            }
            else {
                $match["created_at"] = {
                    $lte: endDate // Nếu chưa có, chỉ tạo điều kiện này
                };
            }
        }
        if (updated_at_start) {
            const startDate = new Date(updated_at_start);
            $match["updated_at"] = {
                $gte: startDate
            };
        }
        if (updated_at_end) {
            const endDate = new Date(updated_at_end);
            if ($match["updated_at"]) {
                $match["updated_at"]["$lte"] = endDate;
            }
            else {
                $match["updated_at"] = {
                    $lte: endDate
                };
            }
        }
        const [result, total, totalOfPage] = await Promise.all([
            database_services_1.default.users
                .aggregate([
                {
                    $match
                },
                {
                    $lookup: {
                        from: "roles",
                        localField: "role",
                        foreignField: "_id",
                        as: "role"
                    }
                },
                {
                    $addFields: {
                        role: { $arrayElemAt: ["$role.name", 0] } // lấy phần tử đầu tiên của mảng name
                    }
                },
                {
                    $project: {
                        email_verify_token: 0,
                        forgot_password_token: 0,
                        password: 0
                    }
                },
                {
                    $sort: { created_at: sortBy === "new" ? -1 : 1 }
                },
                {
                    $skip: limit && page ? limit * (page - 1) : 0
                },
                {
                    $limit: limit ? limit : 5
                }
            ])
                .toArray(),
            database_services_1.default.users
                .aggregate([
                {
                    $match
                },
                {
                    $count: "total"
                }
            ])
                .toArray(),
            database_services_1.default.users
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
        ]);
        return {
            result,
            limitRes: limit || 5,
            pageRes: page || 1,
            total: total[0]?.total || 0,
            totalOfPage: totalOfPage[0]?.total || 0
        };
    }
    async createStaff(payload) {
        const roleId = (await database_services_1.default.role
            .findOne({ _id: new mongodb_1.ObjectId(payload.role) })
            .then((res) => res?._id));
        const [, token] = await Promise.all([
            database_services_1.default.users.insertOne(new users_schema_1.User({
                ...payload,
                _id: new mongodb_1.ObjectId(payload.id),
                password: (0, scripto_1.hashPassword)(payload.password),
                email_verify_token: "",
                verify: 1,
                numberPhone: payload.phone,
                date_of_birth: new Date(payload.date_of_birth),
                employeeInfo: {
                    department: payload.department,
                    hire_date: new Date(payload.hire_date),
                    salary: payload.salary,
                    contract_type: payload.contract_type,
                    status: payload.status
                },
                role: roleId
            })),
            // tạo cặp AccessToken và RefreshToken mới
            user_services_1.userServices.signAccessTokenAndRefreshToken({
                user_id: payload.id,
                verify: enum_1.UserVerifyStatus.Unverified, // mới tạo tài khoản thì chưa xác thực
                role: roleId.toString()
            })
        ]);
        const [accessToken, refreshToken] = token;
        const { exp, iat } = await user_services_1.userServices.decodeRefreshToken(refreshToken);
        const [user] = await Promise.all([
            database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(payload.id) }, { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }),
            // thêm RefreshToken mới vào DB
            database_services_1.default.refreshToken.insertOne(new refreshToken_schema_1.RefreshToken({ token: refreshToken, iat: iat, exp: exp, user_id: new mongodb_1.ObjectId(payload.id) }))
        ]);
        return {
            user
        };
    }
}
const adminServices = new AdminServices();
exports.default = adminServices;
