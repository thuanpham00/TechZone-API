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
class AdminServices {
    async getStatistical() {
        const [totalCustomer, totalProduct] = await Promise.all([
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
            database_services_1.default.product
                .aggregate([
                {
                    $count: "total"
                }
            ])
                .toArray()
        ]);
        return {
            totalCustomer: totalCustomer[0]?.total || 0,
            totalProduct: totalProduct[0]?.total || 0
        };
    }
    async getCustomers(limit, page, email, name, phone, verify, created_at_start, created_at_end, updated_at_start, updated_at_end) {
        const $match = { role: "User" };
        if (email) {
            $match["email"] = { $regex: email, $options: "i" };
        }
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (phone) {
            $match["numberPhone"] = { $regex: phone, $options: "i" };
        }
        if (verify) {
            console.log(verify);
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
    async getCustomerDetail(id) {
        const result = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(id) }, {
            projection: {
                email_verify_token: 0,
                forgot_password_token: 0,
                password: 0
            }
        });
        return result;
    }
    async deleteCustomer(id) {
        const result = await database_services_1.default.users.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return result;
    }
    async createCategory(name) {
        const result = await database_services_1.default.category.insertOne(new brand_category_schema_1.Category({ name }));
        return result;
    }
    async getCategories(limit, page, name, created_at_start, created_at_end, updated_at_start, updated_at_end) {
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
    async getCategoryDetail(id) {
        const result = await database_services_1.default.category.findOne({ _id: new mongodb_1.ObjectId(id) });
        return result;
    } // ok
    async getNameCategoriesFilter() {
        const result = await database_services_1.default.category.find({}).toArray();
        const listName = result.map((item) => item.name);
        return listName;
    }
    async updateCategory(id, body) {
        console.log("body", body);
        const result = await database_services_1.default.category.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: body, $currentDate: { updated_at: true } }, { returnDocument: "after" });
        return result;
    } // ok
    async deleteCategory(id) {
        await database_services_1.default.category.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return {
            message: message_1.AdminMessage.DELETE_CATEGORY
        };
    } // ok
    async getBrands(id, limit, page, name, created_at_start, created_at_end, updated_at_start, updated_at_end) {
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
    async getBrandDetail(id) {
        const result = await database_services_1.default.brand.findOne({ _id: new mongodb_1.ObjectId(id) });
        return result;
    }
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
    async getProducts(limit, page, name, brand, category, created_at_start, created_at_end, updated_at_start, updated_at_end, price_min, price_max, status) {
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
                    $lookup: {
                        from: "category",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
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
                    $project: {
                        reviews: 0,
                        specifications: 0,
                        viewCount: 0,
                        gifts: 0,
                        description: 0,
                        sold: 0,
                        isFeatured: 0,
                        averageRating: 0,
                        discount: 0
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
            $setOnInsert: new brand_category_schema_1.Category({ name: category, brand_ids: [brandId] }) // nếu không tồn tại danh mục thì thêm mới (danh mục liên kết với thương hiệu)
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
    async getSuppliers(limit, page, name, email, phone, contactName, created_at_start, created_at_end, updated_at_start, updated_at_end) {
        const $match = {};
        if (name) {
            $match["name"] = { $regex: name, $options: "i" };
        }
        if (email) {
            $match["email"] = { $regex: email, $options: "i" };
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
    async getSupplierDetail(id) {
        const result = await database_services_1.default.supplier.findOne({ _id: new mongodb_1.ObjectId(id) });
        return result;
    } // ok
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
        await database_services_1.default.supply.insertOne(new supply_supplier_schema_1.Supply({
            ...payload,
            productId: new mongodb_1.ObjectId(payload.productId),
            supplierId: new mongodb_1.ObjectId(payload.supplierId),
            importPrice: payload.importPrice,
            warrantyMonths: payload.warrantyMonths,
            leadTimeDays: payload.leadTimeDays
        }));
        return {
            message: message_1.AdminMessage.CREATE_SUPPLY_DETAIL
        };
    }
}
const adminServices = new AdminServices();
exports.default = adminServices;
