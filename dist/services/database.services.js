"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
const config_1 = require("../utils/config");
(0, dotenv_1.config)();
const URI = `mongodb+srv://${config_1.envConfig.user_name}:${config_1.envConfig.password}@cluster0.1nx8m.mongodb.net/${config_1.envConfig.name_database}?retryWrites=true&w=majority`;
class DatabaseServices {
    client;
    db;
    constructor() {
        this.client = new mongodb_1.MongoClient(URI);
        this.db = this.client.db(config_1.envConfig.name_database); // truyền tên database vào đây
    }
    async connect() {
        try {
            await this.db.command({ ping: 1 });
            console.log("Kết nối tới MongoDB thành công!");
        }
        catch (error) {
            console.log("Lỗi: ", error);
            throw error;
        }
    }
    async indexRefreshToken() {
        const exists = await this.refreshToken.indexExists(["token_1", "exp_1"]);
        if (!exists) {
            this.refreshToken.createIndex({ token: 1 }),
                this.refreshToken.createIndex({
                    exp: 1
                }, {
                    expireAfterSeconds: 0 // expireAfterSeconds được sử dụng để tạo TTL (Time-To-Live) Index, cho phép tự động xóa các document sau một khoảng thời gian nhất định // xóa các token hết hạn
                });
        }
    }
    async indexUser() {
        const exists = await this.users.indexExists(["email_1_password_1", "email_1"]);
        if (!exists) {
            this.users.createIndex({ email: 1, password: 1 });
            this.users.createIndex({ email: 1 }, { unique: true });
            this.users.createIndex({ name: "text", email: "text", numberPhone: "text" });
        }
    }
    async indexBrand() {
        const exists = await this.brand.indexExists(["name_1"]);
        if (!exists) {
            this.brand.createIndex({ name: 1 });
        }
    }
    async indexCategory() {
        const exists = await this.category.indexExists(["name_1"]);
        if (!exists) {
            this.category.createIndex({ name: 1 });
        }
    }
    // Tạo getter để truy cập vào collection (như 1 thuộc tính)
    get users() {
        return this.db.collection(config_1.envConfig.collection_users);
    }
    get refreshToken() {
        return this.db.collection(config_1.envConfig.collection_refresh_token);
    }
    get product() {
        return this.db.collection(config_1.envConfig.collection_product);
    }
    get brand() {
        return this.db.collection(config_1.envConfig.collection_brand);
    }
    get category() {
        return this.db.collection(config_1.envConfig.collection_category);
    }
    get specification() {
        return this.db.collection(config_1.envConfig.collection_specification);
    }
    get supplier() {
        return this.db.collection(config_1.envConfig.collection_supplier);
    }
    get supply() {
        return this.db.collection(config_1.envConfig.collection_supply);
    }
}
const databaseServices = new DatabaseServices();
exports.default = databaseServices;
