"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
const dotenv_1 = require("dotenv");
// import argv from "minimist"
// const options = argv(process.argv.slice(2))
// console.log(options)
// export const isProduction = options.env === "production" // check mt production
/**
 * Gán NODE_ENV ở câu lệnh script thì ở file config.ts nó lấy ra được env.NODE_ENV thì nó sử dụng file env tương ứng với môi trường hiện tại đã gán
 */
const env = process.env.NODE_ENV;
const envFileName = `.env.${env}`;
console.log(envFileName);
(0, dotenv_1.config)({
    path: envFileName // sử dụng file env với môi trường tương ứng
});
exports.envConfig = {
    port: process.env.PORT,
    client_redirect_callback: process.env.CLIENT_REDIRECT_CALLBACK,
    secret_key_forgot_password_token: process.env.SECRET_KEY_FORGOT_PASSWORD_TOKEN,
    secret_key_access_token: process.env.SECRET_KEY_ACCESS_TOKEN,
    secret_key_refresh_token: process.env.SECRET_KEY_REFRESH_TOKEN,
    secret_key_email_verify_token: process.env.SECRET_KEY_EMAIL_VERIFY_TOKEN,
    expire_in_access_token: process.env.EXPIRE_IN_ACCESS_TOKEN,
    expire_in_refresh_token: process.env.EXPIRE_IN_REFRESH_TOKEN,
    expire_in_email_verify_token: process.env.EXPIRE_IN_EMAIL_VERIFY_TOKEN,
    expire_in_forgot_password_token: process.env.EXPIRE_IN_FORGOT_PASSWORD_TOKEN,
    user_name: process.env.USERNAME_MONGODB,
    password: process.env.PASSWORD_MONGODB,
    name_database: process.env.DB_NAME,
    collection_users: process.env.COLLECTION_USERS,
    collection_refresh_token: process.env.COLLECTION_REFRESH_TOKEN,
    collection_product: process.env.COLLECTION_PRODUCT,
    collection_brand: process.env.COLLECTION_BRAND,
    collection_category: process.env.COLLECTION_CATEGORY,
    collection_category_menu: process.env.COLLECTION_CATEGORY_MENU,
    collection_specification: process.env.COLLECTION_SPECIFICATION,
    collection_supplier: process.env.COLLECTION_SUPPLIER,
    collection_supply: process.env.COLLECTION_SUPPLY,
    collection_receipt: process.env.COLLECTION_RECEIPT,
    collection_favourite: process.env.COLLECTION_FAVOURITE,
    collection_cart: process.env.COLLECTION_CART,
    collection_order: process.env.COLLECTION_ORDER,
    collection_email_log: process.env.COLLECTION_EMAIL,
    collection_conversation: process.env.COLLECTION_CONVERSATION,
    collection_role: process.env.COLLECTION_ROLES,
    collection_permissions: process.env.COLLECTION_PERMISSIONS,
    collection_vouchers: process.env.COLLECTION_VOUCHERS,
    aws_region: process.env.AWS_REGION,
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
    secret_key_hash_password: process.env.SECRET_KEY_HASH_PASSWORD,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    google_redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_url: process.env.CLIENT_URL,
    ses_from_address: process.env.SES_FROM_ADDRESS,
    vnp_TmnCode: process.env.vnp_TmnCode,
    vnp_HashSecret: process.env.vnp_HashSecret,
    vnp_Url: process.env.vnp_Url,
    vnp_ReturnUrl: process.env.vnp_ReturnUrl,
    api_key_resend: process.env.API_KEY_RESEND,
    resend_email_from: process.env.RESEND_EMAIL_FROM,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_LINK_PUBLIC: process.env.R2_LINK_PUBLIC
};
