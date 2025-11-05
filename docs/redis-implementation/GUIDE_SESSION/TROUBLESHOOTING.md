# 🔧 Troubleshooting - Performance Test Issues

## ❌ Lỗi: MongoDB Authentication Failed

### Error Message:

```
MongoServerError: bad auth : Authentication failed.
code: 8000,
codeName: 'AtlasError'
```

### 🔍 Nguyên nhân:

Khi chạy test trực tiếp với `ts-node`, biến môi trường `NODE_ENV` KHÔNG được set, dẫn đến:

1. File `utils/config.ts` không biết load `.env.development` hay `.env.production`
2. `envConfig.user_name` và `envConfig.password` = `undefined`
3. MongoDB connection string bị sai → Authentication failed

### ✅ Giải pháp:

#### **Cách 1: Chạy qua npm scripts (Khuyên dùng)**

```bash
# ✅ ĐÚNG - Có set NODE_ENV
npm run test:performance:before
npm run test:performance:after

# ❌ SAI - Không có NODE_ENV
npx ts-node src/test-performance-before-redis.ts
```

**Giải thích:** `package.json` đã config:

```json
{
  "scripts": {
    "test:performance:before": "cross-env NODE_ENV=development npx ts-node src/test-performance-before-redis.ts"
  }
}
```

#### **Cách 2: Set NODE_ENV trước khi chạy**

**Windows (CMD):**

```bash
set NODE_ENV=development && npx ts-node src/test-performance-before-redis.ts
```

**Windows (PowerShell):**

```powershell
$env:NODE_ENV="development"; npx ts-node src/test-performance-before-redis.ts
```

**Linux/macOS:**

```bash
NODE_ENV=development npx ts-node src/test-performance-before-redis.ts
```

#### **Cách 3: Dùng cross-env (Cross-platform)**

```bash
npx cross-env NODE_ENV=development ts-node src/test-performance-before-redis.ts
```

---

## 🔍 Debug: Kiểm tra environment

File test đã có log để debug:

```typescript
// test-performance-before-redis.ts
console.log("🔍 Environment:", process.env.NODE_ENV)
console.log("🔍 MongoDB User:", envConfig.user_name ? "✅ Found" : "❌ Missing")
console.log("🔍 MongoDB Password:", envConfig.password ? "✅ Found" : "❌ Missing")
console.log("🔍 Database Name:", envConfig.name_database || "❌ Missing")
```

**Output mong đợi (ĐÚNG):**

```
🔍 Environment: development
🔍 MongoDB User: ✅ Found
🔍 MongoDB Password: ✅ Found
🔍 Database Name: tech-zone
```

**Output khi LỖI:**

```
🔍 Environment: undefined
🔍 MongoDB User: ❌ Missing
🔍 MongoDB Password: ❌ Missing
🔍 Database Name: ❌ Missing
```

---

## 📝 Checklist khi gặp lỗi:

- [ ] **Kiểm tra file .env có tồn tại không?**

  ```bash
  ls .env.development
  ls .env.production
  ```

- [ ] **Kiểm tra NODE_ENV có được set không?**

  ```bash
  # Windows CMD
  echo %NODE_ENV%

  # Windows PowerShell / Linux / macOS
  echo $NODE_ENV
  ```

- [ ] **Kiểm tra nội dung .env.development:**

  ```env
  # MongoDB Atlas
  USERNAME_MONGODB=your_username
  PASSWORD_MONGODB=your_password
  DB_NAME=tech-zone

  # Redis
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=redis_password_2024
  REDIS_DB=0
  ```

- [ ] **Chạy test qua npm scripts:**
  ```bash
  npm run test:performance:before  # ✅ Luôn đúng
  ```

---

## 🎯 Best Practices:

### ✅ ĐÚNG:

```bash
# 1. Dùng npm scripts (khuyên dùng nhất)
npm run test:performance:before

# 2. Dùng cross-env
npx cross-env NODE_ENV=development ts-node src/test-performance-before-redis.ts

# 3. Set NODE_ENV trước
export NODE_ENV=development  # Linux/macOS
set NODE_ENV=development     # Windows CMD
```

### ❌ SAI:

```bash
# KHÔNG chạy trực tiếp (thiếu NODE_ENV)
npx ts-node src/test-performance-before-redis.ts
node src/test-performance-before-redis.ts
```

---

## 🔄 Flow đúng:

```
1. Set NODE_ENV
   ↓
2. Load .env.{NODE_ENV} file
   ↓
3. envConfig có đầy đủ credentials
   ↓
4. MongoDB/Redis connect thành công
   ↓
5. Test chạy OK ✅
```

---

## 💡 Lưu ý quan trọng:

1. **File test performance PHẢI chạy qua npm scripts**
2. **Server index.ts tự động load NODE_ENV từ nodemon/start scripts**
3. **Test files không tự động load NODE_ENV → Phải set thủ công**

---

## 📖 Tham khảo:

- [Package.json scripts](../package.json) - Xem config npm scripts
- [Utils/config.ts](../src/utils/config.ts) - Xem cách load env
- [PERFORMANCE-TEST-README.md](../PERFORMANCE-TEST-README.md) - Hướng dẫn chạy test

---

**✅ Solution Summary:**

Luôn chạy test qua npm scripts:

```bash
npm run test:performance:before
npm run test:performance:after
npm run test:performance
```

Không bao giờ chạy trực tiếp:

```bash
npx ts-node src/test-performance-*.ts  # ❌ Sẽ lỗi!
```
