import { config } from "dotenv"
// import argv from "minimist"
// const options = argv(process.argv.slice(2))
// console.log(options)
// export const isProduction = options.env === "production" // check mt production

/**
 * Gán NODE_ENV ở câu lệnh script thì ở file config.ts nó lấy ra được env.NODE_ENV thì nó sử dụng file env tương ứng với môi trường hiện tại đã gán
 */
const env = process.env.NODE_ENV
const envFileName = `.env.${env}`
console.log(envFileName)

config({
  path: envFileName // sử dụng file env với môi trường tương ứng
})

export const envConfig = {
  port: process.env.PORT as string,
  client_redirect_callback: process.env.CLIENT_REDIRECT_CALLBACK as string,
  secret_key_forgot_password_token: process.env.SECRET_KEY_FORGOT_PASSWORD_TOKEN as string,
  secret_key_access_token: process.env.SECRET_KEY_ACCESS_TOKEN as string,
  secret_key_refresh_token: process.env.SECRET_KEY_REFRESH_TOKEN as string,
  secret_key_email_verify_token: process.env.SECRET_KEY_EMAIL_VERIFY_TOKEN as string,

  expire_in_access_token: process.env.EXPIRE_IN_ACCESS_TOKEN as string,
  expire_in_refresh_token: process.env.EXPIRE_IN_REFRESH_TOKEN as string,
  expire_in_email_verify_token: process.env.EXPIRE_IN_EMAIL_VERIFY_TOKEN as string,
  expire_in_forgot_password_token: process.env.EXPIRE_IN_FORGOT_PASSWORD_TOKEN as string,

  user_name: process.env.USERNAME_MONGODB as string,
  password: process.env.PASSWORD_MONGODB as string,
  name_database: process.env.DB_NAME as string,

  collection_users: process.env.COLLECTION_USERS as string,
  collection_refresh_token: process.env.COLLECTION_REFRESH_TOKEN as string,
  collection_product: process.env.COLLECTION_PRODUCT as string,
  collection_brand: process.env.COLLECTION_BRAND as string,
  collection_category: process.env.COLLECTION_CATEGORY as string,
  collection_specification: process.env.COLLECTION_SPECIFICATION as string,
  collection_supplier: process.env.COLLECTION_SUPPLIER as string,
  collection_supply: process.env.COLLECTION_SUPPLY as string,
  collection_receipt: process.env.COLLECTION_RECEIPT as string,
  collection_favourite: process.env.COLLECTION_FAVOURITE as string,
  collection_cart: process.env.COLLECTION_CART as string,
  collection_order: process.env.COLLECTION_ORDER as string,

  aws_region: process.env.AWS_REGION as string,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY as string,
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID as string,

  secret_key_hash_password: process.env.SECRET_KEY_HASH_PASSWORD as string,

  google_client_id: process.env.GOOGLE_CLIENT_ID as string,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
  google_redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,

  client_url: process.env.CLIENT_URL as string,

  ses_from_address: process.env.SES_FROM_ADDRESS as string,

  vnp_TmnCode: process.env.vnp_TmnCode as string,
  vnp_HashSecret: process.env.vnp_HashSecret as string,
  vnp_Url: process.env.vnp_Url as string,
  vnp_ReturnUrl: process.env.vnp_ReturnUrl as string
}
