**Redis INFO stats — Explanation & Actions**

File: `Server/docs/GUIDE_MONITORING/stats-dashboard.html`

Mục tiêu

- Giải thích các chỉ số trong snapshot `INFO stats` và gợi ý hành động khi giá trị bất thường.

---

1. Tổng quan chỉ số snapshot

- `total_connections_received`: tổng số kết nối đã accept. Nếu tăng nhanh → connection storm hoặc client không reuse.
- `total_commands_processed`: tổng lệnh Redis đã xử lý. Dùng để ước tính workload theo thời gian.
- `instantaneous_ops_per_sec`: ops/sec hiện tại (throughput). Nếu = 0 → hiện tại không có lệnh chạy.

2. Network

- `total_net_input_bytes` / `total_net_output_bytes`: tổng bytes in/out. So sánh với baseline để phát hiện spikes.
- `instantaneous_input_kbps` / `instantaneous_output_kbps`: tốc độ mạng hiện tại (kbps).

3. Eviction / Expire

- `expired_keys`: số key đã hết TTL. Một lượng lớn expired_keys có thể gợi ý churn cao.
- `evicted_keys`: bị evicted do memory pressure. Nếu >0 → cần điều tra memory hoặc eviction policy.

**Redis INFO stats — Explanation & Actions**

File: `Server/docs/GUIDE_MONITORING/stats-dashboard.html`

Mục tiêu

- Giải thích các chỉ số trong snapshot `INFO stats` và gợi ý hành động khi giá trị bất thường.

---

1. Tổng quan chỉ số snapshot

- `total_connections_received`: tổng số kết nối đã accept. Nếu tăng nhanh → connection storm hoặc client không reuse.
- `total_commands_processed`: tổng lệnh Redis đã xử lý. Dùng để ước tính workload theo thời gian.
- `instantaneous_ops_per_sec`: ops/sec hiện tại (throughput). Nếu = 0 → hiện tại không có lệnh chạy.

2. Network

- `total_net_input_bytes` / `total_net_output_bytes`: tổng bytes in/out. So sánh với baseline để phát hiện spikes.
- `instantaneous_input_kbps` / `instantaneous_output_kbps`: tốc độ mạng hiện tại (kbps).

3. Eviction / Expire

- `expired_keys`: số key đã hết TTL. Một lượng lớn expired_keys có thể gợi ý churn cao.
- `evicted_keys`: bị evicted do memory pressure. Nếu >0 → cần điều tra memory hoặc eviction policy.

4. Keyspace hits / misses

- `keyspace_hits`, `keyspace_misses`: từ đó tính hit ratio = hits / (hits+misses). Hit ratio thấp → cache không hiệu quả.

5. Blocking / rejected connections

- `rejected_connections`: số kết nối bị từ chối (thường do network limit hoặc maxclients). Nếu >0 cần kiểm tra `maxclients`.

6. Replication / Sync

- `sync_full`, `sync_partial_ok`, `sync_partial_err`: liên quan replication. Nếu dùng replication, bất thường ở đây cần điều tra network/replica lag.

7. Other

- `expire_cycle_cpu_milliseconds`: CPU spent in expire cycle (ms). Cao → expire housekeeping consuming CPU.
- `latest_fork_usec`: thời gian fork gần nhất (microseconds) — liên quan RDB/AOF snapshot

---

Quick checks & thresholds (gợi ý)

- `instantaneous_ops_per_sec` = 0: nếu hệ thống đang vận hành, có thể bất thường (kiểm tra traffic). Nếu vì test idle thì OK.
- `evicted_keys > 0`: Warning/Critical — find top keys, increase memory or change strategy.
- `expired_keys` lớn: xem TTL churn; tối ưu bằng giảm TTL churn hoặc batch writes.
- `keyspace hit ratio < 0.7`: Review cache TTLs and access patterns.
- `rejected_connections > 0`: check `maxclients` and network resources.

---

Diagnostics playbook (ngắn)

- Throughput/ops low or 0: check clients (`CLIENT LIST`), network, and application logs.
- High expired keys: check application TTL logic; consider reducing key churn.
- Evictions: check `INFO memory`; check `MEMORY USAGE` for top keys; consider increasing `maxmemory`.
- Low hit ratio: consider increasing TTLs or warming cache.

Useful commands

```
redis-cli INFO stats
redis-cli INFO memory
redis-cli INFO keyspace
redis-cli INFO commandstats
redis-cli SLOWLOG GET 50
redis-cli CLIENT LIST
redis-cli MEMORY USAGE <key>
```

---

Nếu muốn, tôi sẽ:

- thêm các cảnh báo (warnings) trực tiếp vào `stats-dashboard.html`,
- hoặc tạo endpoint `/monitor/redis-stats` để trang HTML có thể fetch snapshot thực tế từ Redis (auto-refresh).

---

**Giải thích các biểu đồ trong `stats-dashboard.html`**

- **Totals (bar)**

  - Biểu đồ hiển thị: `Connections received`, `Commands processed`, `Rejected connections`, `Evicted keys`.
  - Khi nào lo: `Rejected connections` > 0 (kiểm tra `maxclients`/network); `Evicted keys` > 0 (memory pressure).
  - Lệnh điều tra: `redis-cli INFO stats`, `redis-cli CLIENT LIST`, `redis-cli INFO memory`.

- **Network IO (bar)**

  - Biểu đồ hiển thị tổng `total_net_input_bytes`, `total_net_output_bytes` và tốc độ hiện tại (`instantaneous_*_kbps`).
  - Khi nào lo: spikes hoặc throughput cao kéo dài → kiểm tra payload size, top keys trả nhiều dữ liệu.
  - Lệnh điều tra: `redis-cli INFO stats`, `redis-cli INFO commandstats`, `redis-cli MEMORY USAGE <key>`.

- **Instantaneous / Throughput (line)**

  - Hiển thị ops/sec hiện tại và throughput kbps theo thời gian (trong file hiện là dữ liệu demo + điểm snapshot).
  - Khi nào lo: sudden drop (ứng dụng/network issue) hoặc sudden spike (traffic surge gây latency).
  - Lệnh điều tra: `redis-cli INFO stats`, `redis-cli SLOWLOG GET 50`, kiểm tra logs ứng dụng.

- **Keyspace Hit Ratio (doughnut)**

  - Hiển thị số `Hits` vs `Misses` và hit% = hits/(hits+misses).
  - Khi nào lo: hit% thấp (< ~70%) → cache effectiveness issue.
  - Lệnh điều tra: `redis-cli INFO stats`, xem logic TTL và access pattern của app.

- **Raw stats (table)**

  - Bảng liệt kê toàn bộ trường `INFO stats` kèm giá trị dạng đọc được; các hàng có thể được highlight nếu vượt ngưỡng.
  - Khi nào lo: hàng nào bị highlight (WARN/CRITICAL) — dùng lệnh tương ứng để đào sâu.

- **Warnings card**
  - Tập hợp các cảnh báo dựa trên thresholds đơn giản (evicted_keys, expired_keys > X, low hit ratio, rejected connections, v.v.).
  - Mục tiêu: quick triage — xử lý CRITICAL trước.

---

**Ngưỡng cảnh báo gợi ý (có thể điều chỉnh theo workload)**

- `evicted_keys > 0` → WARNING/CRITICAL (tùy rate)
- `expired_keys` lớn / TTL churn cao → WARN
- `keyspace hit ratio < 70%` → WARN
- `rejected_connections > 0` → WARN
- `instantaneous_ops_per_sec` bất thường (0 khi đang vận hành) → WARN

---

**Short playbook: hành động nhanh khi thấy cảnh báo**

- Evictions: kiểm tra `INFO memory`, chạy `MEMORY USAGE` trên top keys, cân nhắc tăng `maxmemory` hoặc thay eviction policy.
- Low hit ratio: kiểm tra TTL, cân nhắc tăng TTL, warm cache, hoặc migrate hot data.
- Rejected connections: kiểm tra `maxclients`, review connection pooling trên ứng dụng.
- High network output / big responses: tìm keys lớn, tránh trả toàn bộ payload (paginate / sample).

---

File locations

- Dashboard HTML: `Server/docs/GUIDE_MONITORING/stats-dashboard.html`
- Explanation doc: `Server/docs/GUIDE_MONITORING/stats-dashboard-explanation.md`

---

If you want, I can:

- add tooltips/labels directly on charts (A),
- apply the same warning logic to `memory-dashboard.html` (B), or
- implement `/monitor/redis-stats` endpoint so both pages fetch live data and auto-refresh (C).
