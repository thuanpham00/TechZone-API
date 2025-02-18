export const UserMessage = {
  VALIDATION_ERROR: "Lỗi xác thực!",
  EMAIL_IS_VALID: "Email không hợp lệ!",

  REGISTER_IS_SUCCESS: "Đăng ký thành công!",
  LOGIN_IS_SUCCESS: "Đăng nhập thành công!",
  EMAIL_IS_EXISTS: "Email đã tồn tại!",
  EMAIL_IS_REQUIRED: "Email không được để trống!",
  PASSWORD_IS_STRING: "Mật khẩu phải là chuỗi!",
  PASSWORD_IS_REQUIRED: "Mật khẩu không được để trống!",
  PASSWORD_IS_LENGTH: "Mật khẩu phải từ 6 đến 50 ký tự!",
  PASSWORD_IS_STRONG: "Mật khẩu yêu cầu ít nhất 6 ký tự, 1 chữ thường, 1 chữ hoa, 1 ký tự đặc biệt và 1 số!",
  PASSWORD_IS_NOT_MATCH: "Mật khẩu không khớp!",

  CONFIRM_PASSWORD_IS_REQUIRED: "Xác nhận mật khẩu không được để trống!",
  CONFIRM_PASSWORD_IS_STRING: "Xác nhận mật khẩu phải là chuỗi!",
  CONFIRM_PASSWORD_IS_LENGTH: "Xác nhận mật khẩu phải từ 6 đến 50 ký tự!",
  CONFIRM_PASSWORD_IS_STRONG:
    "Xác nhận mật khẩu yêu cầu ít nhất 6 ký tự, 1 chữ thường, 1 chữ hoa, 1 ký tự đặc biệt và 1 số!",

  NAME_IS_REQUIRED: "Tên không được để trống!",
  NAME_IS_NOT_NUMBER: "Tên không được chứa số!",
  DATE_OF_BIRTH_IS_ISO8601: "Ngày sinh phải theo định dạng ISO 8601!",

  AVATAR_IS_REQUIRED: "Avatar không được để trống!",
  ROLE_IS_INVALID: "Vai trò không hợp lệ!",

  EMAIL_OR_PASSWORD_IS_INCORRECT: "Email hoặc mật khẩu không chính xác!",

  ACCESS_TOKEN_IS_REQUIRED: "AccessToken không được để trống!",
  REFRESH_TOKEN_IS_REQUIRED: "RefreshToken không được để trống!",
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: "EmailVerifyToken không được để trống!",
  REFRESH_TOKEN_USED_OR_NOT_EXISTS: "RefreshToken đã được sử dụng hoặc không tồn tại!",
  LOGOUT_IS_SUCCESS: "Đăng xuất thành công!",

  USER_NOT_FOUND: "Người dùng không tồn tại!",
  USER_IS_VERIFIED: "Người dùng đã được xác thực!",
  USER_IS_NOT_VERIFIED: "Người dùng chưa xác thực!",
  VERIFY_EMAIL_IS_SUCCESS: "Xác thực email thành công!",
  RESEND_VERIFY_EMAIL_IS_SUCCESS: "Gửi lại email xác thực thành công!",
  CHECK_EMAIL_TO_RESET_PASSWORD: "Kiểm tra email để đặt lại mật khẩu!",
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "ForgotPasswordToken không được để trống!",
  FORGOT_PASSWORD_TOKEN_IS_INVALID: "ForgotPasswordToken không hợp lệ!",
  FORGOT_PASSWORD_TOKEN_IS_SUCCESS: "Xác thực forgotPassword thành công!",
  RESET_PASSWORD_IS_SUCCESS: "Đặt lại mật khẩu thành công!",
  OLD_PASSWORD_IS_INCORRECT: "Mật khẩu cũ không chính xác!",
  CHANGE_PASSWORD_IS_SUCCESS: "Đổi mật khẩu thành công!",

  NUMBER_PHONE_LENGTH_MIN_10_MAX_11: "Số điện thoại tối thiểu 10 kí tự và tối đa 11 kí tự",
  NUMBER_PHONE_IS_INVALID: "Số điện thoại không hợp lệ!",
  UPDATE_PROFILE_IS_SUCCESS: "Cập nhật profile thành công!",
  EMAIL_NOT_VERIFY: "Email chưa xác thực!",
  REFRESH_TOKEN_IS_SUCCESS: "RefreshToken thành công!",
  PERMISSION_DENIED: "Không có quyền truy cập!"
} as const

export const ProductMessage = {
  NAME_IS_REQUIRED: "Tên sản phẩm không được để trống!",
  NAME_MUST_BE_STRING: "Tên sản phẩm phải là chuỗi!",

  CATEGORY_IS_REQUIRED: "Thể loại không được để trống!",
  CATEGORY_MUST_BE_STRING: "Thể loại phải là chuỗi!",

  BRAND_IS_REQUIRED: "Thương hiệu không được để trống!",
  BRAND_MUST_BE_STRING: "Thương hiệu phải là chuỗi!",

  PRICE_IS_REQUIRED: "Giá sản phẩm không được để trống!",
  PRICE_MUST_BE_NUMBER: "Giá sản phẩm phải là số!",
  PRICE_IS_INVALID: "Giá sản phẩm không hợp lệ!",

  DISCOUNT_MUST_BE_NUMBER: "Giảm giá phải là số!",
  DISCOUNT_IS_INVALID: "Giảm giá không hợp lệ!",

  STOCK_MUST_BE_NUMBER: "Số lượng tồn kho phải là số!",
  STOCK_IS_INVALID: "Số lượng tồn kho không hợp lệ!",

  SOLD_MUST_BE_NUMBER: "Số lượng đã bán phải là số!",
  SOLD_IS_INVALID: "Số lượng đã bán không hợp lệ!",

  DESCRIPTION_IS_REQUIRED: "Mô tả sản phẩm không được để trống!",
  DESCRIPTION_MUST_BE_STRING: "Mô tả sản phẩm phải là chuỗi!",

  IS_FEATURED_MUST_BE_BOOLEAN: "Sản phẩm nổi bật phải là boolean!",
  SPECIFICATIONS_IS_INVALID: "Các thông số kỹ thuật phải là mảng các object!",

  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA: "Hình ảnh phải là mảng các media!",
  MEDIAS_IS_REQUIRED: "Hình ảnh không được để trống!",

  GIFTS_MUST_BE_AN_ARRAY_OF_USER_ID: "Quà tặng phải là mảng các id!",

  CREATE_PRODUCT_SUCCESS: "Tạo sản phẩm thành công!"
} as const

export const MediaMessage = {
  UPLOAD_IMAGE_IS_SUCCESS: "Tải ảnh lên thành công!",
  UPLOAD_IMAGE_IS_FAILED: "Tải ảnh lên thất bại!"
}

export const CollectionMessage = {
  GET_COLLECTION_IS_SUCCESS: "Lấy danh sách sản phẩm thành công!"
}

export const Path = {
  PathNotFound: "Không tìm thấy trang!"
}

export const AdminMessage = {
  GET_STATISTICAL: "Lấy số liệu thống kê thành công",
  GET_CUSTOMERS: "Lấy danh sách khách hàng thành công",
  GET_CUSTOMER: "Lấy thông tin khách hàng thành công"
}