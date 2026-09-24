> 🗂️ **TRẠNG THÁI: TÀI LIỆU LỊCH SỬ — 24/09/2026.**
> README của benchmark gate, lượt 22/09.
> Nguồn kết luận hiện hành duy nhất là [`final_project_ai/docs/review_final_20260923/CLAIM_LEDGER.md`](/final_project_ai/docs/review_final_20260923/CLAIM_LEDGER.md).
> Không trích tài liệu này làm kết luận hiện hành; các số/bảng ở đây giữ nguyên theo run cũ
> để đối chiếu lịch sử, **không** được thay bằng số của run mới.

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

> ⛔ **ĐÃ RÚT / THU HẸP (24/09/2026).** Mục này **đã lỗi thời**: B3 và phần đo chi phí đã được hiện thực ở lượt 2 (xem `FINDINGS.md`). Nhưng kết quả “B3 trùng khít B2f” cũng đã bị phản ví dụ bác bỏ. Trạng thái đúng: B3 có hiện thực, khác B2f ở ít nhất một lớp sự kiện, chưa đủ làm đóng góp chính.
- ❌ Chưa đo chi phí/độ trễ — đây là trục duy nhất cơ chế freshness có thể thắng
