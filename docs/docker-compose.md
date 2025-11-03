# Docker Compose ví dụ — Redis + RedisInsight + Server + Client (dev)

File này cung cấp cấu hình `docker-compose.yml` mẫu để chạy nhanh Redis, RedisInsight và server (và client nếu muốn) trong môi trường dev.

```yaml
version: "3.8"
services:
  redis:
    image: redis:7
    container_name: tz_redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: ["redis-server", "--save", "60", "1"]

  redisinsight:
    image: redislabs/redisinsight:latest
    container_name: tz_redisinsight
    ports:
      - "8001:8001"
    restart: unless-stopped

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: tz_server
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SESSION_SECRET=change_me
    ports:
      - "3001:3001"
    depends_on:
      - redis

  # Optional: client
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: tz_client
    ports:
      - "3000:3000"
    depends_on:
      - server

volumes:
  redis-data:
```

Ghi chú:

- Sau khi chạy `docker-compose up`, mở `http://localhost:8001` để truy cập RedisInsight và thêm connection tới Redis host `redis:6379`.
- Cho môi trường production, không expose Redis trực tiếp; dùng network/VPC, bật AUTH và cấu hình firewall.

---

Tệp này là cấu hình dev — điều chỉnh Dockerfile của server/client theo project của bạn.
