"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brand = exports.CategoryMenu = exports.Category = void 0;
const mongodb_1 = require("mongodb");
class Category {
    _id;
    name;
    is_active;
    brand_ids;
    created_at;
    updated_at;
    constructor(category) {
        const date = new Date();
        this._id = category._id || new mongodb_1.ObjectId();
        this.name = category.name;
        this.is_active = category.is_active;
        this.brand_ids = category.brand_ids || []; // lúc mới tạo không cần thiết phải có thương hiệu
        this.created_at = category.created_at || date;
        this.updated_at = category.updated_at || date;
    }
}
exports.Category = Category;
class CategoryMenu {
    _id;
    category_id;
    sections;
    created_at;
    updated_at;
    constructor(payload) {
        const date = new Date();
        this._id = payload._id || new mongodb_1.ObjectId();
        this.category_id = payload.category_id;
        this.sections = payload.sections || [];
        this.created_at = payload.created_at || date;
        this.updated_at = payload.updated_at || date;
    }
}
exports.CategoryMenu = CategoryMenu;
class Brand {
    _id;
    name;
    category_ids;
    created_at;
    updated_at;
    constructor(brand) {
        const date = new Date();
        this._id = brand._id || new mongodb_1.ObjectId();
        this.name = brand.name;
        this.category_ids = brand.category_ids || [];
        this.created_at = brand.created_at || date;
        this.updated_at = brand.updated_at || date;
    }
}
exports.Brand = Brand;
// 1 danh mục sẽ có nhiều thương hiệu (Laptop có nhiều thương hiệu: Apple, Acer, Asus...)
// 1 thương hiệu sẽ thuộc về nhiều danh mục (Apple thuộc về nhiều danh mục: Laptop, Màn hình, Bàn phím ...)
// quan hệ nhiều
