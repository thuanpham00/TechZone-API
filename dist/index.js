"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const database_services_1 = __importDefault(require("./services/database.services"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const error_middlewares_1 = require("./middlewares/error.middlewares");
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const medias_routes_1 = __importDefault(require("./routes/medias.routes"));
const file_1 = require("./utils/file");
const collections_routes_1 = __importDefault(require("./routes/collections.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const static_routes_1 = __importDefault(require("./routes/static.routes"));
const dotenv_1 = require("dotenv");
const config_1 = require("./utils/config");
const helmet_1 = __importDefault(require("helmet"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = config_1.envConfig.port;
app.use(express_1.default.json()); // biến request từ object thành json
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)()); // bảo mật cho server
const allowedOrigins = ["http://localhost:3500", "http://localhost:4173", "https://tech-zone-shop.vercel.app"];
app.use((0, cors_1.default)({
    origin: allowedOrigins, // những domain có thể truy cập vào server
    credentials: true
}));
// client
app.use("/users", users_routes_1.default);
app.use("/products", product_routes_1.default);
app.use("/medias", medias_routes_1.default);
app.use("/collections", collections_routes_1.default);
app.use("/static", static_routes_1.default);
// admin
app.use("/admin", admin_routes_1.default);
database_services_1.default.connect().then(() => {
    database_services_1.default.indexRefreshToken(),
        database_services_1.default.indexUser(),
        database_services_1.default.indexBrand(),
        database_services_1.default.indexCategory();
});
(0, file_1.initFolder)();
app.use(error_middlewares_1.defaultErrorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// import { Resend } from "resend"
// const resend = new Resend("re_6sHF3LRw_7zRXgUyQKbf6WngZeVjfpkZ3")
// ;(async function () {
//   const { data, error } = await resend.emails.send({
//     from: "phamminhthuan912@gmail.com",
//     to: ["phamminhthuan91222@gmail.com"],
//     subject: "Hello World",
//     html: "<strong>It works!</strong>"
//   })
//   if (error) {
//     return console.error({ error })
//   }
//   console.log({ data })
// })()
