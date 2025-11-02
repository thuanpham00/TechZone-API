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
  ADMIN = "ADMIN", // quản trị viên cấp cao, có toàn quyền
  SALES_STAFF = "SALES_STAFF", // nhân viên bán hàng (bao gồm thu ngân)
  INVENTORY_STAFF = "INVENTORY_STAFF", // nhân viên kho
  CUSTOMER = "CUSTOMER" // khách hàng, người dùng cuối
}

export enum ProductStatus {
  AVAILABLE = "available",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued"
}

export enum OrderStatus {
  loading = "Đang thực hiện",
  pending = "Chờ xác nhận",
  processing = "Đang xử lý",
  shipping = "Đang vận chuyển",
  delivered = "Đã giao hàng",
  cancelled = "Đã hủy"
}

export enum TypeOrder {
  cod = "cod",
  vnpay = "vnpay"
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

export enum EmployeeInfoStatus {
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended"
}

export enum VoucherType {
  percentage = "percentage", // Giảm theo %
  fixed = "fixed" // Giảm số tiền cố định
}

export enum VoucherStatus {
  active = "active",
  inactive = "inactive",
  expired = "expired"
}
