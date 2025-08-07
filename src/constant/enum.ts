export enum UserVerifyStatus {
  Unverified,
  Verified
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  EmailVerifyToken,
  ForgotPasswordToken
}

export enum MediaType {
  Image,
  Video
}

export enum RoleType {
  ADMIN = "Admin",
  USER = "User"
}

export enum ProductStatus {
  AVAILABLE = "available",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued"
}

export enum OrderStatus {
  pending = "Chờ xác nhận",
  processing = "Đang xử lý",
  shipping = "Đang vận chuyển",
  delivered = "Đã giao hàng",
  cancelled = "Đã hủy"
}

export enum TypeEmailResend {
  verifyEmail = "Xác thực email",
  resendEmail = "Gửi lại email xác thực",
  forgotPassword = "Quên mật khẩu",
  orderConfirmation = "Xác nhận đơn hàng"
}

export enum StatusEmailResend {
  sent = "Đã gửi",
  failed = "Lỗi"
}
