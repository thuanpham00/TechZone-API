# TechZone API Documentation

## Tổng quan dự án

TechZone API là hệ thống backend cho ứng dụng thương mại điện tử bán sản phẩm công nghệ, được xây dựng với **Node.js**, **Express**, **TypeScript** và **MongoDB**.

## Công nghệ sử dụng

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Formidable, Multer
- **Storage**: AWS S3 (Cloudflare R2)
- **Email Service**: AWS SES, Resend
- **Payment Gateway**: VNPay
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting

## Cấu trúc dự án

```
Server/
├── src/
│   ├── controllers/      # Xử lý logic nghiệp vụ
│   ├── routes/          # Định nghĩa các endpoint
│   ├── services/        # Tương tác với database
│   ├── middlewares/     # Validation, authentication
│   ├── models/          # Schema & types
│   ├── utils/           # Helper functions
│   ├── constant/        # Hằng số, enum
│   └── template/        # Email templates
├── media/               # Media files
└── uploads/             # Upload directory
```

## Danh sách API Endpoints

### 1. 👤 User API (`/users`)

Quản lý người dùng, xác thực và phân quyền.

**Endpoints:**

- `POST /users/register` - Đăng ký tài khoản mới
- `POST /users/login` - Đăng nhập (khách hàng)
- `GET /users/oauth/google` - Đăng nhập bằng Google
- `POST /users/logout` - Đăng xuất
- `POST /users/refresh-token` - Làm mới access token
- `POST /users/verify-email` - Xác thực email
- `POST /users/resend-email-verify` - Gửi lại email xác thực
- `POST /users/forgot-password` - Quên mật khẩu
- `POST /users/verify-forgot-password` - Xác thực token reset password
- `POST /users/reset-password` - Đặt lại mật khẩu
- `POST /users/change-password` - Đổi mật khẩu
- `GET /users/me` - Lấy thông tin cá nhân
- `PUT /users/me` - Cập nhật thông tin cá nhân
- `GET /users/tickets/messages` - Lấy tin nhắn ticket của user

### 2. 📦 Product API (`/products`)

Quản lý sản phẩm cho khách hàng.

**Endpoints:**

- `GET /products` - Tìm kiếm sản phẩm
- `GET /products/all` - Lấy tất cả sản phẩm
- `GET /products/related` - Lấy sản phẩm liên quan
- `GET /products/:id` - Lấy chi tiết sản phẩm

### 3. 🗂️ Category API (`/categories`)

Quản lý danh mục sản phẩm.

**Endpoints:**

- `GET /categories` - Lấy danh sách danh mục đang hoạt động
- `GET /categories/list-menu-category` - Lấy menu danh mục
- `GET /categories/banner` - Lấy banner theo slug

### 4. 🛍️ Collections API (`/collections`)

Quản lý giỏ hàng và sản phẩm yêu thích.

**Endpoints:**

- `GET /collections/filters` - Lấy bộ lọc theo danh mục
- `POST /collections/favourite` - Thêm sản phẩm yêu thích
- `GET /collections/favourite` - Lấy danh sách yêu thích
- `POST /collections/cart` - Thêm sản phẩm vào giỏ hàng
- `PUT /collections/cart` - Cập nhật số lượng trong giỏ hàng
- `DELETE /collections/cart` - Xóa toàn bộ giỏ hàng
- `GET /collections/cart` - Lấy giỏ hàng
- `DELETE /collections/cart/:id` - Xóa 1 sản phẩm khỏi giỏ hàng
- `GET /collections/top-10-product` - Top 10 sản phẩm
- `GET /collections/:slug` - Lấy collection theo slug

### 5. 📋 Order API (`/orders`)

Quản lý đơn hàng của khách hàng.

**Endpoints:**

- `GET /orders` - Lấy đơn hàng của user
- `PUT /orders/:id` - Cập nhật trạng thái đơn hàng (hủy/nhận)
- `POST /orders/:id/reviews` - Đánh giá đơn hàng
- `GET /orders/top-10-reviews` - Top 10 đánh giá mới nhất

### 6. 💳 Payment API (`/payment`)

Xử lý thanh toán.

**Endpoints:**

- `POST /payment` - Tạo thanh toán VNPay
- `POST /payment/vnpay-callback` - Callback từ VNPay
- `POST /payment/create-order-cod` - Tạo đơn hàng COD (tiền mặt)

### 7. 🎟️ Voucher API (`/vouchers`)

Quản lý mã giảm giá.

**Endpoints:**

- `GET /vouchers/available` - Lấy danh sách voucher khả dụng

### 8. 🖼️ Media API (`/medias`)

Quản lý upload hình ảnh.

**Endpoints:**

- `POST /medias/upload-image-product` - Upload nhiều ảnh sản phẩm
- `POST /medias/upload-banner-product` - Upload banner sản phẩm
- `POST /medias/upload-image-user` - Upload avatar người dùng

### 9. 📧 Email API (`/email`)

Quản lý email service (Admin only).

**Endpoints:**

- `GET /email` - Lấy danh sách email đã gửi
- `GET /email/domain` - Lấy danh sách domain

### 10. 🎫 Ticket API (`/tickets`)

Hệ thống hỗ trợ khách hàng.

**Endpoints:**

- `GET /tickets` - Lấy danh sách ticket (Admin)
- `GET /tickets/:id/messages` - Lấy tin nhắn của ticket (Admin)
- `GET /tickets/:id/images` - Lấy hình ảnh của ticket

### 11. 🖼️ Static API (`/static`)

Phục vụ file tĩnh.

**Endpoints:**

- `GET /static/image/:name` - Lấy hình ảnh

---

## 🔧 Admin API (`/admin`)

API dành cho quản trị viên với đầy đủ quyền quản lý hệ thống.

### Authentication & Authorization

- `POST /admin/login` - Đăng nhập admin/staff
- `GET /admin/permission-for-user` - Lấy quyền của user hiện tại

### 📊 Dashboard & Statistics

- `GET /admin/statistical-sell` - Thống kê doanh thu
- `GET /admin/statistical-profit` - Thống kê lợi nhuận
- `GET /admin/statistical-product` - Thống kê sản phẩm
- `GET /admin/statistical-user` - Thống kê người dùng

### 👥 Customer Management

- `POST /admin/customers` - Tạo khách hàng
- `GET /admin/customers` - Danh sách khách hàng
- `PUT /admin/customers/:id` - Cập nhật khách hàng
- `DELETE /admin/customers/:id` - Xóa khách hàng

### 🗂️ Category Management

- `POST /admin/categories` - Tạo danh mục
- `GET /admin/categories` - Danh sách danh mục
- `GET /admin/name-categories` - Lấy tên danh mục (filter)
- `PUT /admin/categories/:id` - Cập nhật danh mục
- `DELETE /admin/categories/:id` - Xóa danh mục

### 📑 Category Menu Management

- `POST /admin/category_menus/group` - Tạo nhóm menu
- `DELETE /admin/category_menus/group/:id` - Xóa nhóm menu
- `GET /admin/category_menus/:id` - Lấy menu theo category ID
- `PUT /admin/category_menus/:id/name-group` - Cập nhật tên nhóm menu
- `POST /admin/category_menus/:id/link` - Tạo link menu
- `PUT /admin/category_links/:id` - Cập nhật link menu
- `DELETE /admin/category_links/:id` - Xóa link menu

### 🏷️ Brand Management

- `POST /admin/brands` - Tạo thương hiệu
- `GET /admin/brands` - Danh sách thương hiệu
- `GET /admin/name-brands` - Lấy tên thương hiệu (filter)
- `PUT /admin/brands/:id` - Cập nhật thương hiệu
- `DELETE /admin/brands/:id` - Xóa thương hiệu

### 📦 Product Management

- `GET /admin/products` - Danh sách sản phẩm
- `POST /admin/products` - Tạo sản phẩm
- `PUT /admin/products/:id` - Cập nhật sản phẩm
- `DELETE /admin/products/:id` - Xóa sản phẩm
- `GET /admin/name-products` - Lấy tên sản phẩm (filter)

### 🏭 Supplier Management

- `POST /admin/suppliers` - Tạo nhà cung cấp
- `GET /admin/suppliers` - Danh sách nhà cung cấp
- `GET /admin/name-suppliers` - Lấy tên nhà cung cấp (filter)
- `GET /admin/not-linked-to-product` - Nhà cung cấp chưa liên kết với sản phẩm
- `GET /admin/linked-to-product` - Nhà cung cấp đã liên kết với sản phẩm
- `GET /admin/get-pricePerUnit` - Lấy đơn giá theo sản phẩm và nhà cung cấp
- `PUT /admin/suppliers/:id` - Cập nhật nhà cung cấp
- `DELETE /admin/suppliers/:id` - Xóa nhà cung cấp

### 🔗 Supply Management (Product-Supplier Relationship)

- `POST /admin/supplies` - Tạo mối quan hệ cung ứng
- `GET /admin/supplies` - Danh sách cung ứng
- `GET /admin/supplies/price-product` - Lấy giá bán sản phẩm
- `PUT /admin/supplies/:id` - Cập nhật cung ứng
- `DELETE /admin/supplies/:id` - Xóa cung ứng

### 📝 Receipt Management (Phiếu nhập kho)

- `GET /admin/receipts` - Danh sách phiếu nhập
- `POST /admin/receipts` - Tạo phiếu nhập
- `PUT /admin/receipts/:id` - Cập nhật phiếu nhập (DRAFT)
- `PUT /admin/receipts/:id/status` - Thay đổi trạng thái (DRAFT → RECEIVED)
- `DELETE /admin/receipts/:id` - Xóa phiếu nhập (DRAFT)

### 📦 Order Management

- `GET /admin/orders-process` - Đơn hàng đang xử lý
- `GET /admin/orders-completed` - Đơn hàng hoàn thành
- `GET /admin/orders-cancelled` - Đơn hàng đã hủy
- `PUT /admin/orders/:id` - Cập nhật trạng thái đơn hàng

### 🎟️ Voucher Management

- `GET /admin/vouchers` - Danh sách voucher
- `GET /admin/vouchers/:id/orders` - Đơn hàng sử dụng voucher
- `POST /admin/vouchers` - Tạo voucher
- `PUT /admin/vouchers/:id` - Cập nhật voucher
- `DELETE /admin/vouchers/:id` - Xóa voucher

### 👔 Role & Permission Management

- `GET /admin/roles` - Danh sách vai trò
- `POST /admin/roles` - Tạo vai trò
- `PUT /admin/roles/:id` - Cập nhật vai trò
- `DELETE /admin/roles/:id` - Xóa vai trò
- `GET /admin/permissions` - Danh sách quyền
- `POST /admin/permissions/by-roles` - Lấy quyền theo vai trò
- `PUT /admin/permissions` - Cập nhật quyền

### 👨‍💼 Staff Management

- `GET /admin/staffs` - Danh sách nhân viên
- `POST /admin/staffs` - Tạo nhân viên
- `PUT /admin/staffs/:id` - Cập nhật nhân viên
- `DELETE /admin/staffs/:id` - Xóa nhân viên

### ⭐ Review Management

- `GET /admin/reviews` - Danh sách đánh giá
- `DELETE /admin/reviews/:id` - Xóa đánh giá

---

## 🔐 Authentication & Authorization

### Phương thức xác thực:

- **Access Token**: Sử dụng trong header `Authorization: Bearer <token>`
- **Refresh Token**: Sử dụng để làm mới access token
- **Cookie**: Lưu trữ refresh token

### Phân quyền:

- **Customer**: Khách hàng thông thường
- **Staff**: Nhân viên
- **Admin**: Quản trị viên

### Middleware Security:

- `accessTokenValidator` - Kiểm tra access token
- `verifyUserValidator` - Xác thực tài khoản đã kích hoạt
- `checkRole()` - Kiểm tra quyền admin/staff
- `Rate Limiting` - Giới hạn 400 requests/15 phút

---

## 🛡️ RBAC (Role-Based Access Control)

Hệ thống sử dụng mô hình **RBAC** để quản lý phân quyền chi tiết cho người dùng.

### Kiến trúc RBAC:

```
User → Role → Permissions → Resources
```

### Các thành phần chính:

#### 1. **Roles (Vai trò)**

Định nghĩa các vai trò trong hệ thống:

- **Customer** - Khách hàng (mặc định khi đăng ký)
- **Staff** - Nhân viên (được admin tạo)
- **Admin** - Quản trị viên (quyền cao nhất)

#### 2. **Permissions (Quyền hạn)**

Hệ thống có **42 permissions** được chia theo modules:

**Customer Management (4 permissions):**

- `CREATE_CUSTOMER` - Tạo khách hàng
- `READ_CUSTOMER` - Xem thông tin khách hàng
- `UPDATE_CUSTOMER` - Cập nhật khách hàng
- `DELETE_CUSTOMER` - Xóa khách hàng

**Category Management (4 permissions):**

- `CREATE_CATEGORY` - Tạo danh mục
- `READ_CATEGORY` - Xem danh mục
- `UPDATE_CATEGORY` - Cập nhật danh mục
- `DELETE_CATEGORY` - Xóa danh mục

**Brand Management (4 permissions):**

- `CREATE_BRAND` - Tạo thương hiệu
- `READ_BRAND` - Xem thương hiệu
- `UPDATE_BRAND` - Cập nhật thương hiệu
- `DELETE_BRAND` - Xóa thương hiệu

**Product Management (4 permissions):**

- `CREATE_PRODUCT` - Tạo sản phẩm
- `READ_PRODUCT` - Xem sản phẩm
- `UPDATE_PRODUCT` - Cập nhật sản phẩm
- `DELETE_PRODUCT` - Xóa sản phẩm

**Supplier Management (4 permissions):**

- `CREATE_SUPPLIER` - Tạo nhà cung cấp
- `READ_SUPPLIER` - Xem nhà cung cấp
- `UPDATE_SUPPLIER` - Cập nhật nhà cung cấp
- `DELETE_SUPPLIER` - Xóa nhà cung cấp

**Supply Management (4 permissions):**

- `CREATE_SUPPLY` - Tạo quan hệ cung ứng
- `READ_SUPPLY` - Xem quan hệ cung ứng
- `UPDATE_SUPPLY` - Cập nhật quan hệ cung ứng
- `DELETE_SUPPLY` - Xóa quan hệ cung ứng

**Receipt Management (4 permissions):**

- `CREATE_RECEIPT` - Tạo phiếu nhập
- `READ_RECEIPT` - Xem phiếu nhập
- `UPDATE_RECEIPT` - Cập nhật phiếu nhập
- `DELETE_RECEIPT` - Xóa phiếu nhập

**Order Management (4 permissions):**

- `CREATE_ORDER` - Tạo đơn hàng
- `READ_ORDER` - Xem đơn hàng
- `UPDATE_ORDER` - Cập nhật đơn hàng
- `DELETE_ORDER` - Xóa đơn hàng

**Voucher Management (4 permissions):**

- `CREATE_VOUCHER` - Tạo voucher
- `READ_VOUCHER` - Xem voucher
- `UPDATE_VOUCHER` - Cập nhật voucher
- `DELETE_VOUCHER` - Xóa voucher

**Staff Management (4 permissions):**

- `CREATE_STAFF` - Tạo nhân viên
- `READ_STAFF` - Xem nhân viên
- `UPDATE_STAFF` - Cập nhật nhân viên
- `DELETE_STAFF` - Xóa nhân viên

**Review Management (2 permissions):**

- `READ_REVIEW` - Xem đánh giá
- `DELETE_REVIEW` - Xóa đánh giá

#### 3. **Role-Permission Mapping**

**Admin** có tất cả 42 permissions (full access)

**Staff** có quyền giới hạn tùy theo cấu hình của admin:

- Admin có thể tạo nhiều roles khác nhau cho staff
- Mỗi role được gán các permissions cụ thể
- Ví dụ:
  - `Warehouse Staff` - Chỉ có quyền quản lý Receipt, Supply
  - `Sales Staff` - Chỉ có quyền quản lý Order, Customer
  - `Content Staff` - Chỉ có quyền quản lý Product, Category, Brand

**Customer** không có permissions trong admin panel (chỉ truy cập user APIs)

### API Endpoints cho RBAC:

```typescript
// Lấy quyền của user hiện tại
GET /admin/permission-for-user

// Quản lý Roles
GET /admin/roles           // Danh sách vai trò
POST /admin/roles          // Tạo vai trò mới
PUT /admin/roles/:id       // Cập nhật vai trò
DELETE /admin/roles/:id    // Xóa vai trò

// Quản lý Permissions
GET /admin/permissions                // Tất cả permissions
POST /admin/permissions/by-roles      // Lấy permissions theo role
PUT /admin/permissions                // Cập nhật permissions cho role
```

### Cách hoạt động:

1. **Authentication**: User đăng nhập → Nhận JWT token chứa `user_id` và `role_id`
2. **Authorization**:

   - Middleware `checkRole()` kiểm tra role của user
   - Lấy danh sách permissions từ database theo `role_id`
   - So sánh permission yêu cầu với permissions của user
   - Cho phép/từ chối truy cập endpoint

3. **Dynamic Permission**: Admin có thể thay đổi permissions của role bất cứ lúc nào
4. **Inheritance**: Admin role kế thừa tất cả permissions

### Ví dụ Flow:

```typescript
// User "John" - Staff với role "Sales Manager"
User Login → JWT Token {user_id: "123", role_id: "sales_manager"}
          ↓
Request: PUT /admin/orders/456
          ↓
Middleware checkRole() → Lấy permissions của "sales_manager"
          ↓
Kiểm tra: "sales_manager" có permission "UPDATE_ORDER"?
          ↓
     Yes → Cho phép truy cập
     No  → 403 Forbidden
```

### Bảo mật:

- ✅ Mỗi admin endpoint đều được bảo vệ bởi `checkRole()` middleware
- ✅ Permissions được cache để tối ưu performance
- ✅ Không cho phép user tự thăng cấp quyền
- ✅ Admin không thể xóa role đang được sử dụng
- ✅ Audit log cho các thay đổi permissions (nếu cần)

---

## 🗄️ Database Schema

### Collections chính:

- **users** - Người dùng (customer, staff, admin)
- **products** - Sản phẩm
- **brands** - Thương hiệu
- **categories** - Danh mục
- **suppliers** - Nhà cung cấp
- **supplies** - Quan hệ sản phẩm-nhà cung cấp
- **receipts** - Phiếu nhập kho
- **orders** - Đơn hàng
- **carts** - Giỏ hàng
- **favourites** - Sản phẩm yêu thích
- **vouchers** - Mã giảm giá
- **reviews** - Đánh giá sản phẩm
- **roles** - Vai trò
- **permissions** - Quyền hạn
- **tickets** - Ticket hỗ trợ
- **messages** - Tin nhắn ticket
- **conversations** - Cuộc hội thoại

---

## 🚀 Cài đặt & Chạy dự án

### 1. Cài đặt dependencies:

```bash
npm install
```

### 2. Cấu hình môi trường:

Tạo file `.env` với các biến môi trường cần thiết:

```env
NODE_ENV=development
PORT=4000
DB_NAME=techzone
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=your_host

JWT_SECRET_ACCESS_TOKEN=your_secret
JWT_SECRET_REFRESH_TOKEN=your_secret
JWT_SECRET_EMAIL_VERIFY_TOKEN=your_secret
JWT_SECRET_FORGOT_PASSWORD_TOKEN=your_secret

# AWS S3 / Cloudflare R2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=auto
AWS_ENDPOINT=your_endpoint

# Email Service
AWS_SES_FROM_ADDRESS=your_email
RESEND_API_KEY=your_key

# VNPay
VNPAY_TMN_CODE=your_code
VNPAY_HASH_SECRET=your_secret
```

### 3. Chạy development:

```bash
npm run dev
```

### 4. Build production:

```bash
npm run build
npm run start:prod
```

### 5. Sử dụng PM2:

```bash
pm2 start ecosystem.config.js
```

---

## 📡 Real-time Features (Socket.IO)

Hệ thống hỗ trợ real-time messaging cho ticket support system:

- Tin nhắn tức thời giữa khách hàng và admin/staff
- Thông báo trạng thái đơn hàng
- Cập nhật realtime cho dashboard

---

## 🔧 Scripts

```json
{
  "dev": "Development mode với nodemon",
  "build": "Build TypeScript sang JavaScript",
  "start": "Chạy production server",
  "lint": "Kiểm tra code với ESLint",
  "prettier": "Format code với Prettier"
}
```

---

## 📦 Main Dependencies

- **express** - Web framework
- **mongodb** - Database driver
- **jsonwebtoken** - JWT authentication
- **socket.io** - Real-time communication
- **sharp** - Image processing
- **formidable** - File upload handling
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **@aws-sdk/client-s3** - S3 storage
- **@aws-sdk/client-ses** - Email service
- **resend** - Email service
- **axios** - HTTP client

---

## 📝 Notes

1. **Rate Limiting**: Tất cả các route đều có giới hạn 400 requests/15 phút/IP
2. **CORS**: Chỉ cho phép truy cập từ domain được cấu hình
3. **Security**: Sử dụng Helmet để bảo mật HTTP headers
4. **File Upload**: Hỗ trợ upload qua Cloudflare R2 (S3-compatible)
5. **Email**: Dual email service (AWS SES & Resend)
6. **Payment**: Tích hợp VNPay gateway

---

## 👨‍💻 Development

- **TypeScript**: Strict type checking
- **ESLint + Prettier**: Code quality và formatting
- **Nodemon**: Hot reload trong development
- **Docker**: Containerization support

---

## 📧 Contact & Support

Đối với các vấn đề kỹ thuật, sử dụng ticket system thông qua `/tickets` endpoint.

---

**Version**: 1.0.0  
**Last Updated**: December 2025
