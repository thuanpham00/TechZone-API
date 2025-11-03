# Quản lý phiên (Session) và Giỏ hàng (Cart) bằng Redis

Tài liệu này mô tả cách thiết kế, triển khai và vận hành hệ thống quản lý phiên đăng nhập và giỏ hàng thương mại điện tử sử dụng Redis làm kho key–value. Thích hợp để tích hợp vào server Node.js và frontend React. Có các ví dụ lệnh Redis để kiểm tra nhanh.

## 1 — Mục tiêu

- Lưu và quản lý phiên người dùng (session) hiệu quả, có TTL.
- Lưu giỏ hàng (cart) cho user đã đăng nhập và guest (anonymous) với khả năng merge khi login.
- Dễ quan sát và debug bằng RedisInsight.

## 2 — Kiến trúc tổng quan

- Client (React) ↔ HTTP API (Node.js - Express) ↔ Redis
- Cookie hoặc header lưu session id (sid) / tempId cho guest.
- Ví dụ luồng:
  - Guest thêm hàng → lưu `cart:anon:<tempId>` trên Redis (có TTL).
  - User login → tạo `session:<sid>` (liên kết userId) và merge `cart:anon:<tempId>` vào `cart:<userId>`.

## 3 — Thiết kế key (naming & data shapes)

1. Session

- Key pattern: `session:<sid>` hoặc `sess:<sid>`
- Value: JSON string hoặc Hash. Ví dụ:
  - JSON: {"userId": 100, "roles": ["user"], "createdAt": 169...}
- TTL: 30 phút - 7 ngày tuỳ nghiệp vụ.

2. Cart cho user

- Key pattern: `cart:<userId>` (HASH hoặc RedisJSON)
- Hash approach (HSET): mỗi field là `item:<productId>` chứa JSON nhỏ `{qty, price, title}`
- RedisJSON approach (tốt nếu cần cập nhật object phức tạp): `cart:<userId>` (JSON)
- TTL: thường không cần TTL (persist), nhưng có thể đặt TTL cho cart inactive.

3. Cart cho guest

- Key pattern: `cart:anon:<tempId>`
- TTL: 7–30 ngày tuỳ ứng dụng.

4. Index / Metrics (tùy chọn)

- Sorted set `active-sessions` score = lastSeen timestamp.
- Counters `counter:cart:add` (INCR) cho analytic nhẹ.

## 4 — Lệnh Redis hữu ích (ví dụ)

- Liệt kê keys theo prefix:
  - KEYS "session:\*"
- Lưu session JSON với TTL:
  - SET session:abc123 '{"userId":100}' EX 1800
- Lưu cart dưới dạng hash:
  - HSET cart:100 1 '{"qty":2,"price":99.9}'
  - HGETALL cart:100
- Đặt TTL cho key:
  - EXPIRE cart:anon:xyz 2592000 # 30 ngày
- Xoá key:
  - DEL session:abc123

## 5 — Quy tắc & lưu ý

- Prefix rõ ràng: session:, cart:, cart:anon:
- Tránh lưu dữ liệu quá lớn trên một key (một cart với hàng ngàn item cần cân nhắc thiết kế phân mảnh).
- Quản lý TTL cho anon cart để tránh rác.
- Bảo mật: không expose Redis ra public; bật AUTH; dùng network rules.

## 6 — Tích hợp với RedisInsight

- Dùng RedisInsight để xem key, chạy CLI, kiểm tra memory, slowlog.
- Filter theo prefix để xem session/cart và inspect giá trị nhanh.

---

Tệp này là bản tóm tắt — các chi tiết kỹ thuật và ví dụ code sẽ nằm trong `nodejs-implementation.md` và `react-integration.md`.
