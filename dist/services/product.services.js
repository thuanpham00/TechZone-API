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
        const date = new Date();
        const [result] = await Promise.all([
            database_services_1.default.product
                .aggregate([
                {
                    $match: {
                        _id: new mongodb_1.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: "category",
                        localField: "category",
                        foreignField: "_id",
                        as: "category",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "brand",
                        localField: "brand",
                        foreignField: "_id",
                        as: "brand",
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$brand",
                        preserveNullAndEmptyArrays: true
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
                .toArray(),
            database_services_1.default.product.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
                $inc: {
                    viewCount: 1
                },
                $set: {
                    updated_at: date
                }
            })
        ]);
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
    async getSearchProduct(search) {
        const result = await database_services_1.default.product
            .aggregate([
            {
                $match: {
                    name: { $regex: search, $options: "i" }
                }
            },
            {
                $facet: {
                    // chạy song song 1 lần nhiều pipe // $match là dùng chung giữa 2 pipe này
                    data: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                price: 1,
                                discount: 1,
                                banner: 1
                            }
                        },
                        { $limit: 10 } // chỉ lấy 10 gợi ý đầu tiên
                    ],
                    total: [{ $count: "total" }]
                }
            }
        ])
            .toArray();
        return result[0];
    }
}
exports.productServices = new ProductServices();
