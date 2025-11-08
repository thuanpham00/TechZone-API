"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherStatus = exports.VoucherType = exports.EmployeeInfoStatus = exports.StatusEmailResend = exports.TypeEmailResend = exports.TypeOrder = exports.OrderStatus = exports.ProductStatus = exports.RoleType = exports.MediaType = exports.TokenType = exports.UserVerifyStatus = void 0;
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
    RoleType["ADMIN"] = "ADMIN";
    RoleType["SALES_STAFF"] = "SALES_STAFF";
    RoleType["INVENTORY_STAFF"] = "INVENTORY_STAFF";
    RoleType["CUSTOMER"] = "CUSTOMER"; // khách hàng, người dùng cuối
})(RoleType || (exports.RoleType = RoleType = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["AVAILABLE"] = "available";
    ProductStatus["OUT_OF_STOCK"] = "out_of_stock";
    ProductStatus["DISCONTINUED"] = "discontinued";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["loading"] = "\u0110ang th\u1EF1c hi\u1EC7n";
    OrderStatus["pending"] = "Ch\u1EDD x\u00E1c nh\u1EADn";
    OrderStatus["processing"] = "\u0110ang x\u1EED l\u00FD";
    OrderStatus["shipping"] = "\u0110ang v\u1EADn chuy\u1EC3n";
    OrderStatus["delivered"] = "\u0110\u00E3 giao h\u00E0ng";
    OrderStatus["cancelled"] = "\u0110\u00E3 h\u1EE7y";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var TypeOrder;
(function (TypeOrder) {
    TypeOrder["cod"] = "cod";
    TypeOrder["vnpay"] = "vnpay";
})(TypeOrder || (exports.TypeOrder = TypeOrder = {}));
var TypeEmailResend;
(function (TypeEmailResend) {
    TypeEmailResend["verifyEmail"] = "X\u00E1c th\u1EF1c email";
    TypeEmailResend["resendEmail"] = "G\u1EEDi l\u1EA1i email x\u00E1c th\u1EF1c";
    TypeEmailResend["forgotPassword"] = "Qu\u00EAn m\u1EADt kh\u1EA9u";
    TypeEmailResend["orderConfirmation"] = "X\u00E1c nh\u1EADn \u0111\u01A1n h\u00E0ng";
})(TypeEmailResend || (exports.TypeEmailResend = TypeEmailResend = {}));
var StatusEmailResend;
(function (StatusEmailResend) {
    StatusEmailResend["sent"] = "\u0110\u00E3 g\u1EEDi";
    StatusEmailResend["failed"] = "L\u1ED7i";
})(StatusEmailResend || (exports.StatusEmailResend = StatusEmailResend = {}));
var EmployeeInfoStatus;
(function (EmployeeInfoStatus) {
    EmployeeInfoStatus["Active"] = "Active";
    EmployeeInfoStatus["Inactive"] = "Inactive";
    EmployeeInfoStatus["Suspended"] = "Suspended";
})(EmployeeInfoStatus || (exports.EmployeeInfoStatus = EmployeeInfoStatus = {}));
var VoucherType;
(function (VoucherType) {
    VoucherType["percentage"] = "percentage";
    VoucherType["fixed"] = "fixed"; // Giảm số tiền cố định
})(VoucherType || (exports.VoucherType = VoucherType = {}));
var VoucherStatus;
(function (VoucherStatus) {
    VoucherStatus["active"] = "active";
    VoucherStatus["inactive"] = "inactive";
    VoucherStatus["expired"] = "expired";
})(VoucherStatus || (exports.VoucherStatus = VoucherStatus = {}));
