# Benchmark quyết định xuất bản dữ liệu (publication-gate decision benchmark)

Dựng 22/09/2026 theo thiết kế Phần C/F của `docs/review_novelty_20260921/novelty_map_mapping_cleansing_gate.md`.

## Chạy

```bash
SVC=../../../csv_agent_services/backend
PY=../../../csv_agent_platform/detection/.venv/bin/python3.12
PYTHONPATH=$SVC:. $PY run_bench.py 42
```

## Kiến trúc chống đánh giá vòng tròn

| Tệp | Vai trò | Ai được đọc |
|---|---|---|
| `target_schema.py` | DDL SQLite STRICT — **nguồn sự thật** của oracle | **Gate KHÔNG được đọc** |
| `contract.py` | Hợp đồng gate nhìn thấy — **cố ý thiếu sót** so với DDL | Gate |
| `oracle.py` | Phán xử ba tầng, không import `contract`/`gates` | — |
| `corpus.py` | Sinh dữ liệu + tiêm lỗi theo DDL đích | — |
| `gates.py` | Thang B0–B4 + B2′, dùng `evaluate_readiness` **thật** | — |
| `events.py` | Sự kiện thay đổi sau đánh giá, trước xuất bản | — |

Độ lệch giữa `contract.py` và `target_schema.py` là thứ tạo ra ca false-ready **thật**:
hợp đồng v1 cố ý không khai `lease_years BETWEEN 1..999` và không khai khoá ngoại
`district_id`, trong khi hệ đích **có** cưỡng chế cả hai.

## Oracle ba tầng

1. **Tầng 1** — nạp từng dòng vào SQLite STRICT thật; đếm dòng bị từ chối (NOT NULL, UNIQUE, FK, CHECK, kiểu).
2. **Tầng 2** — đối soát nguồn↔đích: số dòng, tổng kiểm từng cột số, toàn vẹn tham chiếu. Bắt mất mát **do phép biến đổi lúc nạp**.
3. **Tầng 3** — đặc tả nghiệp vụ độc lập (email). ⚠️ Tầng yếu nhất về tính độc lập — vẫn là luật do người viết, khai báo thẳng thay vì giả vờ là oracle thật.

Kiểm chứng oracle: 64/64 ca bẩn bị chặn đúng, 40/40 ca sạch được cho qua, **không sai ca nào**.

## Chỉ số

- `unsafe_acceptance` = ca oracle nói KHÔNG nên xuất mà gate cho qua / tổng ca không nên xuất
- `false_block` = ca oracle nói NÊN xuất mà gate chặn / tổng ca nên xuất
- `verdict_change` = quyết định của gate ở T khác ở T+K, trên **mọi** ca (theo Shraga et al., ACSOS 2026)

## Trạng thái

- ✅ B0, B1, B2, B2′ đã hiện thực
- ❌ **B3 (chấm lại bản sửa) và B4 (AI đề xuất sửa) CHƯA hiện thực** — hiện là lớp con của B2, số liệu của chúng **trùng B2 và không mang thông tin**
- ❌ Chưa đo chi phí/độ trễ — đây là trục duy nhất cơ chế freshness có thể thắng
