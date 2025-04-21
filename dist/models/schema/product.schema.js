"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("../../constant/enum");
class Product {
    _id;
    name; // tên sản phẩm
    category; // thể loại
    brand; // thương hiệu
    price; // giá sản phẩm
    discount; // % giảm giá (nếu có)
    stock; // số lượng tồn kho
    sold; // số lượng đã bán
    viewCount; // Số lượt xem
    description; // Mô tả sản phẩm chi tiết
    isFeatured; // Sản phẩm nổi bật
    specifications;
    gifts; // quà tặng
    banner;
    medias; // hình ảnh
    reviews; // đánh giá
    averageRating; // trung bình đánh giá
    status; // trạng thái sản phẩm (còn hàng, hết hàng, ngừng bán)
    created_at;
    updated_at;
    constructor(product) {
        const date = new Date();
        this._id = product._id;
        this.name = product.name;
        this.category = product.category;
        this.brand = product.brand;
        this.price = product.price;
        this.description = product.description;
        this.banner = product.banner || { type: 0, url: "" };
        this.medias = product.medias || [];
        this.discount = product.discount || 0;
        this.stock = product.stock || 0;
        this.sold = product.sold || 0;
        this.viewCount = product.viewCount || 0;
        this.isFeatured = product.isFeatured || "false";
        this.specifications = product.specifications || [];
        this.gifts = product.gifts || [];
        this.reviews = product.reviews || [];
        this.averageRating = product.averageRating || 0;
        this.status = product.status || enum_1.ProductStatus.OUT_OF_STOCK; // mặc định là hết hàng
        this.created_at = product.created_at || date;
        this.updated_at = product.updated_at || date;
    }
}
exports.default = Product;
