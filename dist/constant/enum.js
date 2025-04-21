"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductStatus = exports.RoleType = exports.MediaType = exports.TokenType = exports.UserVerifyStatus = void 0;
var UserVerifyStatus;
(function (UserVerifyStatus) {
    UserVerifyStatus[UserVerifyStatus["Unverified"] = 0] = "Unverified";
    UserVerifyStatus[UserVerifyStatus["Verified"] = 1] = "Verified";
})(UserVerifyStatus || (exports.UserVerifyStatus = UserVerifyStatus = {}));
var TokenType;
(function (TokenType) {
    TokenType[TokenType["AccessToken"] = 0] = "AccessToken";
    TokenType[TokenType["RefreshToken"] = 1] = "RefreshToken";
    TokenType[TokenType["EmailVerifyToken"] = 2] = "EmailVerifyToken";
    TokenType[TokenType["ForgotPasswordToken"] = 3] = "ForgotPasswordToken";
})(TokenType || (exports.TokenType = TokenType = {}));
var MediaType;
(function (MediaType) {
    MediaType[MediaType["Image"] = 0] = "Image";
    MediaType[MediaType["Video"] = 1] = "Video";
})(MediaType || (exports.MediaType = MediaType = {}));
var RoleType;
(function (RoleType) {
    RoleType["ADMIN"] = "Admin";
    RoleType["USER"] = "User";
})(RoleType || (exports.RoleType = RoleType = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["AVAILABLE"] = "available";
    ProductStatus["OUT_OF_STOCK"] = "out_of_stock";
    ProductStatus["DISCONTINUED"] = "discontinued";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
