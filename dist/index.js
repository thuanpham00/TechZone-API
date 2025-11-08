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
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const http_1 = require("http");
const socket_1 = require("./socket");
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const voucher_routes_1 = __importDefault(require("./routes/voucher.routes"));
(0, dotenv_1.config)();
const PORT = config_1.envConfig.port;
// giới hạn số lượng request với rate limit
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes). // mỗi IP 100 request cho 15 phút
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56 // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
});
const app = (0, express_1.default)();
app.use(express_1.default.json()); // biến request từ object thành json
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)()); // bảo mật cho server
const allowedOrigins = ["http://localhost:3500", "http://localhost:4173", "https://tech-zone-shop.vercel.app"];
app.use((0, cors_1.default)({
    origin: allowedOrigins, // những domain có thể truy cập vào server
    credentials: true
}));
app.use(limiter);
const httpServer = (0, http_1.createServer)(app); // tạo 1 server đựa trên app của Express
// client
app.use("/users", users_routes_1.default);
app.use("/products", product_routes_1.default);
app.use("/categories", category_routes_1.default);
app.use("/medias", medias_routes_1.default);
app.use("/collections", collections_routes_1.default);
app.use("/orders", order_routes_1.default);
app.use("/static", static_routes_1.default);
app.use("/payment", payment_routes_1.default);
app.use("/email", email_routes_1.default);
app.use("/conversation", conversation_routes_1.default);
app.use("/vouchers", voucher_routes_1.default);
// admin
app.use("/admin", admin_routes_1.default);
database_services_1.default.connect().then(() => {
    database_services_1.default.indexRefreshToken(),
        database_services_1.default.indexUser(),
        database_services_1.default.indexBrand(),
        database_services_1.default.indexCategory();
});
(0, file_1.initFolder)();
app.use(error_middlewares_1.defaultErrorHandler); // middleware toàn cục để xử lý lỗi chung.
(0, socket_1.initialSocket)(httpServer);
httpServer.listen(PORT, () => {
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
