# Tích hợp frontend (React) — Session & Cart

File này mô tả cách frontend React tương tác với API Node.js để quản lý session và giỏ hàng, bao gồm lưu tempId cho guest, hooks tiện dụng và luồng merge cart khi login.

## 1 — Ý tưởng chính

- Với user đã đăng nhập: server dùng cookie session (`sid`) để xác định user và trả về cart từ `cart:<userId>`.
- Với guest: frontend lưu `tempId` (cookie hoặc localStorage) và dùng `cart:anon:<tempId>` trên server/Redis.
- Khi login: frontend gửi request để merge cart (server thực hiện merge và xóa `cart:anon:<tempId>`).

## 2 — Lưu tempId cho guest

- Tạo UUID khi người dùng chưa có `tempId` và lưu trong cookie với expiry (30 ngày) hoặc localStorage.
- Cookie example (httponly không thể set từ JS nếu bạn muốn security; trường hợp bạn cần tempId cho client, lưu cookie bình thường không httponly):
  - document.cookie = `tempId=${uuid}; max-age=${30*24*60*60}`

## 3 — Hooks & services mẫu

- `src/services/api.ts` — axios/fetch wrapper với credentials set để gửi cookie:

```ts
import axios from "axios"
export default axios.create({ baseURL: "/api", withCredentials: true })
```

- `src/services/cartApi.ts`

```ts
import api from "./api"
export const fetchCart = () => api.get("/cart")
export const addItem = (item) => api.post("/cart/items", item)
export const removeItem = (productId) => api.delete(`/cart/items/${productId}`)
export const mergeCart = (tempId) => api.post("/cart/merge", { tempId })
```

- `src/hooks/useCart.ts`

```ts
import { useState, useEffect } from "react"
import * as cartApi from "../services/cartApi"

export function useCart() {
  const [items, setItems] = useState([])
  useEffect(() => {
    fetch()
  }, [])
  async function fetch() {
    const res = await cartApi.fetchCart()
    setItems(res.data.items || [])
  }
  async function add(item) {
    await cartApi.addItem(item)
    await fetch()
  }
  async function remove(productId) {
    await cartApi.removeItem(productId)
    await fetch()
  }
  return { items, add, remove, refresh: fetch }
}
```

## 4 — Luồng merge khi login

1. Trước login, guest có `tempId` và cart ở `cart:anon:<tempId>`.
2. Khi người dùng submit login, server tạo session (cookie `sid`) và trả về success.
3. Frontend sau khi nhận success gọi `POST /api/cart/merge` (hoặc server tự merge khi login nếu tempId được gửi tự động bằng cookie).
4. Server merge data và xóa `cart:anon:<tempId>`.

## 5 — UI components gợi ý

- `SessionStatus.tsx` — hiển thị trạng thái đăng nhập (call `/api/session`).
- `ProductList.tsx` — gọi `add` từ `useCart()`.
- `Cart.tsx` — hiển thị và cập nhật quantity, xóa item.

## 6 — Chú ý bảo mật & UX

- Nếu tempId lưu trong cookie non-httponly, tránh lưu dữ liệu nhạy cảm.
- Đặt TTL cho `cart:anon` để tránh rác dữ liệu.
- Sync cart sau khi có mạng (offline support) — frontend có thể cache local và sync lên API khi online.

---

Tệp này cung cấp các ví dụ code frontend nhanh — điều chỉnh theo stack (Redux hoặc Zustand) nếu bạn dùng state manager khác.
