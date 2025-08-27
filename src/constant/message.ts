export const UserMessage = {
  REQUIRED_LOGIN: "Vui lòng đăng nhập để tiếp tục!",
  VALIDATION_ERROR: "Lỗi xác thực!",
  EMAIL_IS_VALID: "Email không hợp lệ!",

  REGISTER_IS_SUCCESS: "Đăng ký thành công!",
  LOGIN_IS_SUCCESS: "Đăng nhập thành công!",
  EMAIL_IS_EXISTS: "Email đã tồn tại!",
  EMAIL_IS_REQUIRED: "Email bắt buộc!",
  PASSWORD_IS_STRING: "Mật khẩu phải là chuỗi!",
  PASSWORD_IS_REQUIRED: "Mật khẩu bắt buộc!",
  PASSWORD_IS_LENGTH: "Mật khẩu phải từ 6 đến 50 ký tự!",
  PASSWORD_IS_STRONG: "Mật khẩu yêu cầu ít nhất 6 ký tự, 1 chữ thường, 1 chữ hoa, 1 ký tự đặc biệt và 1 số!",
  PASSWORD_IS_NOT_MATCH: "Mật khẩu không khớp!",

  CONFIRM_PASSWORD_IS_REQUIRED: "Xác nhận mật khẩu bắt buộc!",
  CONFIRM_PASSWORD_IS_STRING: "Xác nhận mật khẩu phải là chuỗi!",
  CONFIRM_PASSWORD_IS_LENGTH: "Xác nhận mật khẩu phải từ 6 đến 50 ký tự!",
  CONFIRM_PASSWORD_IS_STRONG:
    "Xác nhận mật khẩu yêu cầu ít nhất 6 ký tự, 1 chữ thường, 1 chữ hoa, 1 ký tự đặc biệt và 1 số!",

  NAME_IS_REQUIRED: "Tên bắt buộc!",
  NAME_IS_NOT_NUMBER: "Tên không được chứa số!",
  DATE_OF_BIRTH_IS_ISO8601: "Ngày sinh phải theo định dạng ISO 8601!",

  AVATAR_IS_REQUIRED: "Avatar bắt buộc!",
  ROLE_IS_INVALID: "Vai trò không hợp lệ!",

  EMAIL_OR_PASSWORD_IS_INCORRECT: "Email hoặc mật khẩu không chính xác!",

  ACCESS_TOKEN_IS_REQUIRED: "AccessToken bắt buộc!",
  REFRESH_TOKEN_IS_REQUIRED: "RefreshToken bắt buộc!",
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: "EmailVerifyToken bắt buộc!",
  REFRESH_TOKEN_USED_OR_NOT_EXISTS: "RefreshToken đã được sử dụng hoặc không tồn tại!",
  LOGOUT_IS_SUCCESS: "Đăng xuất thành công!",

  USER_NOT_FOUND: "Người dùng không tồn tại!",
  USER_IS_VERIFIED: "Người dùng đã được xác thực!",
  USER_IS_NOT_VERIFIED: "Người dùng chưa xác thực!",
  VERIFY_EMAIL_IS_SUCCESS: "Xác thực email thành công!",
  RESEND_VERIFY_EMAIL_IS_SUCCESS: "Gửi lại email xác thực thành công!",
  CHECK_EMAIL_TO_RESET_PASSWORD: "Kiểm tra email để đặt lại mật khẩu!",
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "ForgotPasswordToken bắt buộc!",
  FORGOT_PASSWORD_TOKEN_IS_INVALID: "ForgotPasswordToken không hợp lệ!",
  FORGOT_PASSWORD_TOKEN_IS_SUCCESS: "Xác thực forgotPassword thành công!",
  RESET_PASSWORD_IS_SUCCESS: "Đặt lại mật khẩu thành công!",
  OLD_PASSWORD_IS_INCORRECT: "Mật khẩu cũ không chính xác!",
  CHANGE_PASSWORD_IS_SUCCESS: "Đổi mật khẩu thành công!",

  NUMBER_PHONE_LENGTH_MIN_10_MAX_11: "Số điện thoại 10-11 kí tự!",
  NUMBER_PHONE_IS_INVALID: "Số điện thoại không hợp lệ!",
  NUMBER_PHONE_IS_REQUIRED: "Số điện thoại bắt buộc!",
  UPDATE_PROFILE_IS_SUCCESS: "Cập nhật profile thành công!",
  EMAIL_NOT_VERIFY: "Email chưa xác thực!",
  REFRESH_TOKEN_IS_SUCCESS: "RefreshToken thành công!",
  PERMISSION_DENIED: "Không có quyền truy cập!"
} as const

export const ProductMessage = {
  PRODUCT_ID_IS_INVALID: "Id sản phẩm không hợp lệ!",

  NAME_IS_REQUIRED: "Tên sản phẩm bắt buộc!",
  NAME_MUST_BE_STRING: "Tên sản phẩm phải là chuỗi!",
  NAME_IS_INVALID: "Tên sản phẩm đã tồn tại!",

  CATEGORY_IS_REQUIRED: "Thể loại bắt buộc!",
  CATEGORY_MUST_BE_STRING: "Thể loại phải là chuỗi!",

  BRAND_IS_REQUIRED: "Thương hiệu bắt buộc!",
  BRAND_MUST_BE_STRING: "Thương hiệu phải là chuỗi!",

  PRICE_IS_REQUIRED: "Giá sản phẩm bắt buộc!",

  DISCOUNT_IS_REQUIRED: "Giảm giá bắt buộc!",

  STOCK_MUST_BE_NUMBER: "Số lượng tồn kho phải là số!",
  STOCK_IS_INVALID: "Số lượng tồn kho không hợp lệ!",

  SOLD_MUST_BE_NUMBER: "Số lượng đã bán phải là số!",
  SOLD_IS_INVALID: "Số lượng đã bán không hợp lệ!",

  DESCRIPTION_IS_REQUIRED: "Mô tả sản phẩm bắt buộc!",
  DESCRIPTION_MUST_BE_STRING: "Mô tả sản phẩm phải là chuỗi!",

  IS_FEATURED_MUST_BE_BOOLEAN: "Sản phẩm nổi bật phải là boolean!",
  SPECIFICATIONS_IS_INVALID: "Các thông số kỹ thuật phải là mảng các object!",

  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA: "Hình ảnh phải là mảng các media!",
  MEDIAS_IS_REQUIRED: "Hình ảnh bắt buộc!",

  GIFTS_MUST_BE_AN_ARRAY_OF_USER_ID: "Quà tặng phải là mảng các id!",

  CREATE_PRODUCT_SUCCESS: "Tạo sản phẩm thành công!",
  GET_PRODUCT_SUCCESS: "Lấy chi tiết sản phẩm thành công!",
  GET_PRODUCT_RELATED_SUCCESS: "Lấy danh sách sản phẩm liên quan thành công!",
  GET_SEARCH_PRODUCT: "Tìm kiếm sản phẩm liên quan thành công!"
} as const

export const MediaMessage = {
  UPLOAD_IMAGE_IS_SUCCESS: "Tải ảnh lên thành công!",
  UPLOAD_IMAGE_IS_FAILED: "Tải ảnh lên thất bại!"
}

export const CollectionMessage = {
  GET_COLLECTION_IS_SUCCESS: "Lấy danh sách sản phẩm thành công!",
  GET_COLLECTION_FAVOURITE_IS_SUCCESS: "Lấy danh sách sản phẩm yêu thích thành công!",
  GET_COLLECTION_CART_IS_SUCCESS: "Lấy danh sách sản phẩm trong giỏ hàng thành công!",
  ADD_PRODUCT_FAVOURITE_IS_SUCCESS: "Thêm sản phẩm vào danh sách yêu thích thành công!",
  DELETE_PRODUCT_FAVOURITE_IS_SUCCESS: "Xóa sản phẩm khỏi danh sách yêu thích thành công!",
  ADD_PRODUCT_CART_IS_SUCCESS: "Thêm sản phẩm vào giỏ hàng thành công!",
  UPDATE_PRODUCT_CART_IS_SUCCESS: "Cập nhật số lượng sản phẩm trong giỏ hàng thành công!",

  DELETE_PRODUCT_CART_IS_SUCCESS: "Xóa sản phẩm trong giỏ hàng thành công!",
  CLEAR_PRODUCT_CART_IS_SUCCESS: "Xóa tất cả sản phẩm trong giỏ hàng thành công!"
}

export const OrderMessage = {
  CREATE_ORDER_IS_SUCCESS: "Tạo đơn hàng thành công!",
  GET_ORDER_IS_SUCCESS: "Lấy danh sách đơn hàng thành công!",
  CANCEL_ORDER_IS_SUCCESS: "Hủy đơn hàng thành công",
  RECEIVE_ORDER_IS_SUCCESS: "Xác nhận giao hàng thành công"
}

export const Path = {
  PathNotFound: "Không tìm thấy trang!"
}

export const AdminMessage = {
  GET_STATISTICAL: "Lấy số liệu thống kê thành công!",
  GET_CUSTOMERS: "Lấy danh sách khách hàng thành công!",
  CREATE_CUSTOMER_DETAIL: "Thêm người dùng thành công!",
  GET_CUSTOMER: "Lấy thông tin khách hàng thành công!",
  GET_CATEGORIES: "Lấy danh sách danh mục thành công!",
  GET_CATEGORY_DETAIL: "Lấy thông tin chi tiết danh mục thành công!",
  GET_SUPPLY_DETAIL: "Lấy thông tin chi tiết cung ứng thành công!",
  GET_SUPPLIER_DETAIL: "Lấy thông tin chi tiết nhà cung cấp thành công!",
  GET_ORDER_DETAIL: "Lấy thông tin chi tiết đơn hàng thành công!",
  UPDATE_CATEGORY_DETAIL: "Cập nhật thông tin chi tiết danh mục thành công!",
  CREATE_CATEGORY_DETAIL: "Thêm danh mục thành công!",
  DELETE_CUSTOMER: "Xóa profile khách hàng thành công!",

  CATEGORY_IS_ALREADY: "Danh mục đã tồn tại!",
  BRAND_IS_ALREADY: "Thương hiệu đã tồn tại!",
  GET_BRANDS: "Lấy danh sách các thương hiệu thành công!",
  GET_BRAND_DETAIL: "Lấy thông tin chi tiết thương hiệu thành công!",

  UPDATE_BRAND_DETAIL: "Cập nhật thông tin chi tiết thương hiệu thành công!",
  CREATE_BRAND_DETAIL: "Thêm thương hiệu thành công!",

  CATEGORY_CANNOT_BE_DELETED: "Danh mục đang sử dụng không thể xóa!",
  BRAND_CANNOT_BE_DELETED: "Thương hiệu đang sử dụng không thể xóa!",
  DELETE_CATEGORY: "Xóa danh mục thành công!",
  DELETE_BRAND: "Xóa thương hiệu thành công!",
  GET_PRODUCTS: "Lấy danh sách các sản phẩm thành công!",

  CREATE_SUPPLIER_DETAIL: "Thêm nhà cung cấp thành công!",
  CREATE_SUPPLY_DETAIL: "Thêm cung ứng thành công!",
  UPDATE_SUPPLIER_DETAIL: "Cập nhật thông tin chi tiết nhà cung cấp thành công!",
  UPDATE_SUPPLY_DETAIL: "Cập nhật thông tin chi tiết cung ứng thành công!",
  GET_SUPPLIERS: "Lấy danh sách nhà cung cấp thành công!",
  GET_SUPPLIERS_BASED_ON_NAME_PRODUCT: "Lấy danh sách nhà cung cấp chưa liên kết sản phẩm thành công!",
  GET_SUPPLIERS_BASED_ON_NAME_PRODUCT_2: "Lấy danh sách nhà cung cấp đã liên kết sản phẩm thành công!",
  SUPPLIER_CANNOT_BE_DELETED: "Nhà cung cấp đang sử dụng không thể xóa!",
  DELETE_SUPPLIER: "Xóa nhà cung cấp thành công!",

  GET_RECEIPTS: "Lấy danh sách đơn nhập hàng thành công!",

  UPDATE_STATUS_ORDER: "Cập nhật trạng thái đơn hàng thành công!",

  GET_PRICE_SELLING: "Lấy giá sản phẩm thành công!",

  GET_ROLES: "Lấy danh sách vai trò thành công!",
  GET_PERMISSIONS: "Lấy danh sách quyền thành công!",
  GET_PERMISSIONS_BASED_ON_ROLE: "Lấy danh sách quyền của vai trò thành công!",

  UPDATE_PERMISSIONS_BASED_ON_ID_ROLE: "Cập nhật quyền của vai trò thành công!",
  ROLE_IS_INVALID: "Vai trò đã tồn tại!",
  CREATE_ROLE_DETAIL: "Thêm vai trò thành công!",
  UPDATE_ROLE_DETAIL: "Cập nhật vai trò thành công!"
}

export const SupplierMessage = {
  NAME_IS_REQUIRED: "Tên nhà cung cấp bắt buộc!",
  NAME_IS_EXISTS: "Tên nhà cung cấp đã tồn tại!",
  CONTACT_NAME_IS_REQUIRED: "Tên đại diện nhà cung cấp bắt buộc",
  EMAIL_IS_REQUIRED: "Email nhà cung cấp bắt buộc",
  ADDRESS_IS_REQUIRED: "Địa chỉ nhà cung cấp bắt buộc",
  TAX_CODE_IS_LENGTH: "TaxCode phải từ 10 đến 13 ký tự!",
  TAX_CODE_IS_INVALID: "Mã số thuế không hợp lệ!",
  TAX_CODE_IS_EXISTS: "Mã số thuế đã tồn tại!"
}

export const SupplyMessage = {
  PRODUCT_ID_IS_REQUIRED: "ID sản phẩm bắt buộc!",
  SUPPLIER_ID_IS_REQUIRED: "ID nhà cung cấp bắt buộc!",
  IMPORT_PRICE_IS_REQUIRED: "Giá nhập bắt buộc!",
  WARRANTY_MONTHS_IS_REQUIRED: "Thời gian bảo hành bắt buộc!",
  LEAD_TIME_DAYS_IS_REQUIRED: "Thời gian cung ứng bắt buộc!",
  PRODUCT_ID_IS_NOT_EXISTS: "ID sản phẩm không tồn tại!",
  SUPPLIER_ID_IS_NOT_EXISTS: "ID nhà cung cấp không tồn tại!",

  IMPORT_PRICE_IS_INVALID: "Giá nhập phải nhỏ hơn giá bán sản phẩm!",
  DELETE_SUPPLY: "Xóa cung ứng thành công!"
}

export const ReceiptMessage = {
  ITEM_IS_INVALID: "Các thông tin sản phẩm phải là mảng các object!",
  ITEM_IS_REQUIRED: "Thông tin sản phẩm là bắt buộc!",

  TOTAL_AMOUNT_IS_REQUIRED: "Tổng giá trị toàn bộ đơn hàng là bắt buộc!",

  TOTAL_ITEM_IS_REQUIRED: "Số lượng sản phẩm trong đơn hàng là bắt buộc!",
  IMPORT_DATE_IS_REQUIRED: "Ngày nhập hàng bắt buộc!",
  CREATE_RECEIPT_IS_SUCCESS: "Tạo đơn nhập hàng thành công!",

  PRODUCT_ID_OR_SUPPLIER_ID_IS_INVALID: "Id sản phẩm hoặc Id nhà cung cấp không hợp lệ!",
  PRICE_PER_UNIT_IS_SUCCESS: "Lấy giá nhập thành công!"
}

export const EmailMessage = {
  GET_LIST_EMAIL_LOG_IS_SUCCESS: "Lấy danh sách email log thành công"
}

export const ConversationMessage = {
  GET_LIST_USER_TYPE_IS_SUCCESS: "Lấy danh sách người dùng thành công",
  GET_CONVERSATION_IS_SUCCESS: "Lấy danh sách hội thoại thành công"
}
