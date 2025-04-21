"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productServices = void 0;
const database_services_1 = __importDefault(require("./database.services"));
const mongodb_1 = require("mongodb");
class ProductServices {
    async getProductDetail(id) {
        const result = await database_services_1.default.product
            .aggregate([
            {
                $match: {
                    _id: new mongodb_1.ObjectId(id)
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
                $addFields: {
                    specifications: {
                        $map: {
                            input: "$specifications",
                            as: "specification",
                            in: {
                                name: "$$specification.name",
                                value: "$$specification.value"
                            }
                        }
                    }
                }
            }
        ])
            .toArray();
        return result;
    }
    async getProductRelated(brand, category, idProduct) {
        const $match = {};
        if (category) {
            $match["category"] = new mongodb_1.ObjectId(category);
        }
        if (brand) {
            $match["brand"] = new mongodb_1.ObjectId(brand);
        }
        const result = await database_services_1.default.product
            .aggregate([
            {
                $match // match với các sản phẩm có chung danh mục, chung thương hiệu
            },
            {
                $lookup: {
                    from: "category",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $addFields: {
                    category: {
                        $map: {
                            input: "$category",
                            as: "cate",
                            in: "$$cate.name"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "brand",
                    localField: "brand",
                    foreignField: "_id",
                    as: "brand"
                }
            },
            {
                $addFields: {
                    brand: {
                        $map: {
                            input: "$brand",
                            as: "bra",
                            in: "$$bra.name"
                        }
                    }
                }
            },
            {
                $project: {
                    updated_at: 0,
                    created_at: 0,
                    stock: 0,
                    description: 0,
                    gifts: 0
                }
            },
            {
                $skip: 0
            },
            {
                $limit: 5
            }
        ])
            .toArray();
        const listProduct = result.filter((item) => !new mongodb_1.ObjectId(item._id).equals(new mongodb_1.ObjectId(idProduct)));
        // loại bỏ sản phẩm hiện tại
        const collections = listProduct.map((item) => item._id);
        const date = new Date();
        // cập nhật DB
        await database_services_1.default.product.updateMany({
            _id: {
                $in: collections
            }
        }, {
            $inc: {
                viewCount: 1
            },
            $set: {
                updated_at: date
            }
        });
        // cập nhật kết quả trả về
        listProduct.forEach((item) => {
            item.viewCount += 1;
        });
        return listProduct;
    }
}
exports.productServices = new ProductServices();
