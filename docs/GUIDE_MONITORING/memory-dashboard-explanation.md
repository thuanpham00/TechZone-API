**Redis Memory Dashboard — Explanation & Additional Metrics**

File: `Server/docs/GUIDE_MONITORING/memory-dashboard.html`

Mục tiêu tài liệu

- Giải thích ngắn gọn nội dung từng biểu đồ trong file `memory-dashboard.html`.
- Gợi ý các chỉ số (metrics) bổ sung nên theo dõi ngoài memory, cùng kiểu biểu đồ và ngưỡng cảnh báo.
- Hướng dẫn hành động khi thấy chỉ số bất thường.

---

## 1) Tóm tắt các biểu đồ trong `memory-dashboard.html`

1. Bar chart — used_memory / used_memory_rss / used_memory_peak / maxmemory

- Mục đích: So sánh nhanh mức tiêu thụ bộ nhớ hiện tại (`used_memory`), bộ nhớ RSS mà OS báo (`used_memory_rss`), đỉnh bộ nhớ đã đạt (`used_memory_peak`) và giới hạn (`maxmemory`).
- Diễn giải:
  - `used_memory` là memory mà Redis báo đang dùng cho dữ liệu và cấu trúc nội bộ.
  - `used_memory_rss` là lượng RAM process chiếm trong hệ điều hành (có thể lớn hơn `used_memory` do fragmentation hoặc allocator chưa trả lại bộ nhớ).
  - Nếu `used_memory` gần `maxmemory` → eviction sẽ bắt đầu theo eviction-policy.
  - Khi `used_memory_rss` >> `used_memory` (ví dụ 5-10×) → có thể fragmentation hoặc jemalloc chưa trả memory về OS.
- Hành động:
  - Nếu `used_memory` > 80% `maxmemory`: tăng `maxmemory` hoặc giảm dữ liệu, hoặc đổi eviction policy.
  - Nếu `used_memory_rss` rất lớn so với `used_memory`: chạy `MEMORY DOCTOR`, kiểm tra fragmentation, cân nhắc restart trong maintenance window.

2. Doughnut (Pie) — dataset vs overhead

- Mục đích: Phân tách phần bộ nhớ thực tế chứa dữ liệu (`used_memory_dataset`) so với overhead (metadata, internal bookkeeping, fragment overhead).
- Diễn giải:
  - Overhead lớn → nhiều small-keys, many metadata, nhiều empty headers hoặc heavy data structures.
- Hành động:
  - Nếu overhead chiếm phần lớn: kiểm tra key distribution, compact large small-keys (use HASH encoding), nhóm dữ liệu, reduce TTL churn.

3. Allocator bar chart — allocated / active / resident

- Mục đích: Hiển thị số liệu nội bộ của allocator (jemalloc): allocated (đang phân bổ), active (đã được active), resident (được OS báo) — giúp debug fragmentation và phân bổ bộ nhớ bởi jemalloc.
- Diễn giải:
  - `allocator_resident` gần bằng `used_memory_rss`.
  - `allocator_active` − `allocator_allocated` lớn → internal fragmentation.
- Hành động:
  - Nếu resident cao so với allocated → fragmentation/allocator behaviour.

4. Line chart — synthesized timeseries for used_memory and used_memory_rss

- Mục đích: Trend visualization (hiện tại file dùng dữ liệu giả lập để minh họa). Khi có dữ liệu thời gian thực, biểu đồ sẽ giúp phát hiện growth hoặc divergence tức thời.
- Hành động:
  - Theo trend; nếu growth liên tục → điều tra hot keys/traffic pattern.

---

## 2) Những metrics bổ sung nên theo dõi (quan trọng ngoài memory)

Dưới đây là các metric hữu ích, loại biểu đồ gợi ý và thresholds cảnh báo.

- Throughput / Commands

  - Metric: `instantaneous_ops_per_sec`, `total_commands_processed`
  - Viz: line chart (ops/sec over time)
  - Alert: sudden drop hoặc spike; sustained high ops/sec > baseline
  - Why: đo tải hệ thống, phát hiện spikes do bots hoặc DDOS

- Command-level stats

  - Metric: `commandstats` (calls, usec_per_call)
  - Viz: table top commands (bar chart for usec_per_call)
  - Alert: a command with high `usec_per_call` or sudden increase
  - Why: tìm lệnh tốn thời gian (EX: HGETALL trên big key)

- Keyspace / Top keys by memory

  - Metric: `MEMORY USAGE <key>` (top N)
  - Viz: bar chart top 10 keys
  - Alert: presence of oversized keys (> few MB)
  - Why: big keys thường gây latency và fragmentation

- Clients / Connections

  - Metric: `connected_clients`, `blocked_clients`, `client_longest_output_list`
  - Viz: single-value + line chart
  - Alert: blocked_clients > 0 or connected_clients near maxclients
  - Why: phát hiện clients chặn/blocking và connection storms

- Evictions & TTL

  - Metric: `evicted_keys`, `expired_keys`
  - Viz: line chart (counts over time)
  - Alert: sustained `evicted_keys > 0`
  - Why: cho thấy memory pressure và policy-triggered removals

- Persistence & AOF/RDB

  - Metric: `rdb_last_save_time`, `rdb_changes_since_last_save`, `aof_enabled`, `aof_current_size`
  - Viz: single-value + event markers on timeline
  - Alert: long RDB/AOF save durations or frequent RDB forks
  - Why: persistence can cause spikes and blocks

- Latency & Slowlog

  - Metric: LATENCY DOCTOR, slowlog entries, p99/p95 latencies
  - Viz: histogram + table of recent slowlog
  - Alert: p99 > threshold (e.g., 50ms)
  - Why: detect command latency spikes affecting UX

- Eviction/Memory policy indicators

  - Metric: `maxmemory`, `evicted_keys`, `used_memory` percent
  - Viz: gauge + line
  - Alert: used_memory >= 75% of maxmemory

- Fragmentation / allocator

  - Metric: `memory_fragmentation_ratio`, `allocator_resident/used_memory`
  - Viz: single-value + sparkline
  - Alert: fragmentation_ratio > 1.3

- Background job indicators

  - Metric: `lazyfree_pending_objects`, `active_defrag_running`
  - Viz: single-value/time series
  - Why: background deletes and defrag impact CPU and memory

- Network IO
  - Metric: `total_net_input_bytes`, `total_net_output_bytes`
  - Viz: line chart
  - Why: phát hiện bandwidth spikes or large responses

## 3) Các biểu đồ nên có trong dashboard hoàn chỉnh

Sắp xếp gợi ý (Grafana panels):

1. Top row: Memory overview (used vs rss vs max) | Fragmentation ratio | Used% of maxmemory (gauge)
2. Second row: Dataset vs Overhead (stacked) | Top keys by memory | Allocator internals
3. Third row: Ops/sec (time series) | Top slow commands (table) | Evictions & expired
4. Bottom row: Clients (connected/blocked) | Persistence events + AOF size | Latency p95/p99

## 4) Ngưỡng cảnh báo mẫu (tùy workload)

- used_memory >= 80% maxmemory → Warning
- used_memory >= 95% maxmemory → Critical
- memory_fragmentation_ratio > 1.3 → Warning (consider restart/defrag)
- evicted_keys > 0 sustained (e.g., > 10/min for 10 min) → Critical
- p99 latency > 50ms → Warning/Critical depending service SLA
- connected_clients > 80% maxclients → Warning

---

## 5) Hành động khi thấy chỉ số bất thường (quick playbook)

- used_memory rising steadily:

  1. Check top keys (big keys) and TTL churn.
  2. Consider eviction policy or increase maxmemory or compact keys.

- used_memory_rss >> used_memory / high fragmentation:

  1. Run `MEMORY DOCTOR` and `MEMORY STATS`.
  2. If fragmentation persists, schedule restart during maintenance and consider jemalloc tuning or upgrade Redis.

- Evictions active:

  1. Identify which keys are being evicted if possible.
  2. Increase memory or change retention strategy.

- High command latency:

  1. Inspect `SLOWLOG GET 50` and commandstats.
  2. Optimize application patterns (avoid HGETALL, LRANGE large ranges), shard large keys.

- Persistence-caused spikes:
  1. Tune RDB snapshot frequency or AOF fsync policy.
  2. Offload heavy writes or batch them.

---

## 6) Quick CLI commands (useful for diagnostics)

```
# Memory
redis-cli INFO memory
redis-cli MEMORY STATS
redis-cli MEMORY USAGE <key>
redis-cli MEMORY DOCTOR

# General
redis-cli INFO stats
redis-cli INFO commandstats
redis-cli INFO clients
redis-cli INFO persistence
redis-cli SLOWLOG GET 50
redis-cli MONITOR  # very verbose

# Latency
redis-cli LATENCY LATEST
redis-cli LATENCY DOCTOR
```

---

## 7) Live monitoring / long-term

- For production monitoring and alerting use: `redis_exporter` -> Prometheus -> Grafana.
- RedisInsight is good for quick drill-down and top-keys UI, Grafana + Prometheus provides long-term retention, dashboards and alerting.

---

## 8) Where the files are

- Static snapshot dashboard: `Server/docs/GUIDE_MONITORING/memory-dashboard.html`
- This explanation doc: `Server/docs/GUIDE_MONITORING/memory-dashboard-explanation.md`

---

Nếu bạn muốn, tôi có thể:

- thêm auto-refresh + small Node endpoint that returns `INFO memory` as JSON and make the HTML fetch it periodically, hoặc
- tạo một Grafana dashboard JSON prefilled with recommended panels + alert rules.

Bạn muốn tiếp theo là: (A) auto-refresh HTML endpoint, (B) Grafana dashboard, hoặc (C) hướng dẫn cài `redis_exporter` + `prometheus` + `grafana`?
