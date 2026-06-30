# BÁO CÁO TIẾN ĐỘ LUẬN VĂN THẠC SĨ

**Đề tài:** Xây dựng nền tảng AI phát hiện bất thường trên dữ liệu CSV và tự động sinh báo cáo bằng mô hình ngôn ngữ lớn
**Học viên:** Võ Thị Trà Giang (MSHV 24712121) · GVHD: TS. Tôn Long Phước · IUH, khóa 2024–2026
**Ngày lập báo cáo:** 29/06/2026 · **Bảo vệ chính thức (dự kiến):** 10/2026
**Cơ sở đối chiếu:** Kế hoạch 30 đầu việc / 7 giai đoạn trong `de_cuong_IUH/chapters/ke_hoach.tex`, đối chiếu với hiện trạng code (`csv_agent_platform`, `csv_agent_services`) và bản thảo các chương.

---

## 1. Đánh giá tổng quan

Tiến độ ở mức **cao và bám sát kế hoạch**. Toàn bộ khối nghiên cứu – triển khai (Giai đoạn 1–5) đã hoàn thành: ba mô hình phát hiện bất thường đã huấn luyện qua nhiều phiên bản (V6 → V10 → V11), hai adapter LoRA (Qwen2-1.5B, Gemma-2B) đã fine-tune xong, hệ thống production (FastAPI + Next.js + Celery + Docker) đã dựng, và bài báo FDSE 2025 đã **xuất bản chính thức** (có DOI). Cả 5 chương luận văn đều đã có bản thảo nội dung đáng kể.

Phần còn lại tập trung ở **một nhóm thực nghiệm cuối chưa chạy** (chủ yếu là đánh giá báo cáo NLP bằng LLM-as-Judge + calibration) và việc **điền số liệu vào các bảng còn để trống (TBD)** trước mốc đóng băng số liệu 09/2026.

Mức độ hoàn thành ước lượng: **~80–85%**.

---

## 2. Checklist theo hạng mục

### ĐÃ XONG ✅

| Hạng mục                                             | Bằng chứng                                                                                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Tổng quan tài liệu, xác định khoảng trống nghiên cứu | `chuong1.tex` (2.884 từ), bảng so sánh công trình                                                                                       |
| Thu thập dữ liệu BĐS Singapore + 13 luật nghiệp vụ   | pipeline 8 giai đoạn, `data/processed_*`                                                                                                |
| Pipeline tiền xử lý 8 giai đoạn                      | `detection/scripts/run_pipeline.py`, log `run_all.log`                                                                                  |
| Mô hình XGBoost / DAE / BiLSTM (AD)                  | artifacts `models/v10`, `v10_retrain`, `v11`, `v11_retrain`                                                                             |
| Đánh giá tổng quát hoá trên dataset công khai        | KDD, Forest Cover, Credit Card, House Prices, Arrhythmia (279 cột), Madelon (500 cột) — `chuong4` §4.4                                  |
| **Toàn bộ ablation study**                           | `outputs/ablation_{k256,no_hash,topk,cash}_results.json`, `benchmark_high_dim`, `collision_rate`, `highdim_ksweep` — đã có file kết quả |
| Fine-tune Qwen2-1.5B + LoRA và Gemma-2B + LoRA       | `generation/models/*-lora-adapter` + checkpoints; Qwen2 thắng (`evaluation_decision.json`)                                              |
| Backend FastAPI + frontend Next.js + Celery + Docker | repo `csv_agent_services` (theo bản scan kiến trúc)                                                                                     |
| Đo latency end-to-end p50/p95/p99 (CSV 10K dòng)     | bảng latency trong `chuong4.tex` §4.11                                                                                                  |
| **Bài báo FDSE 2025 — đã công bố**                   | `cong_trinh.tex`: Springer CCIS vol. 2708, pp. 367–381, DOI 10.1007/978-981-95-4721-0_25                                                |
| Bản thảo 5 chương + Mở đầu + Kế hoạch                | mo_dau 2.1k, ch1 2.9k, ch2 1.9k, ch3 7.2k, ch4 9.3k, ch5 1.7k từ                                                                        |
| Tài liệu chuẩn bị bảo vệ đề cương                    | thư mục `de_cuong_IUH/defense/` (rebuttal, Q&A, slide)                                                                                  |

### ĐANG LÀM / CÒN THIẾU ⏳

| Hạng mục                                                                          | Tình trạng      | Ghi chú                                                                                                           |
| --------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Đánh giá báo cáo NLP bằng LLM-as-Judge** (GPT-4o + Claude + Gemini, 70 báo cáo) | **Chưa chạy**   | Phương pháp đã viết đầy đủ (`chuong4` §4.8) nhưng **chưa có file kết quả** judge; bảng ICC/Krippendorff còn trống |
| **Calibration subset** (Spearman ρ human vs LLM judge, n=15)                      | Chưa làm        | ρ TBD trong `chuong4` §4.8.4 và `chuong5`                                                                         |
| **Bảng fidelity NLP** (NumFid / RuleFid / Cov@3 / Hallu, T5–T8)                   | Chưa điền số    | "Bảng số liệu bổ sung sau đợt thực nghiệm cuối" — `chuong4` §4.7                                                  |
| **Phụ lục F** — bảng BLEU/ROUGE/BERTScore Qwen2/Gemma                             | Toàn bộ **TBD** | `phu_luc.tex` dòng 231–237                                                                                        |
| So sánh trực diện AnoLLM / TAD-GP                                                 | TBD             | `chuong5.tex` dòng 27                                                                                             |
| Điều tra hồi quy BiLSTM (F1 0,764 → 0,589 ở v10-retrain)                          | Chưa xử lý      | Đường găng A1 trong kế hoạch                                                                                      |
| Tinh chỉnh lại trọng số Ensemble theo PR-AUC v10                                  | Chưa làm        | Đường găng A2                                                                                                     |
| **Tích hợp V11 vào backend**                                                      | **Chưa xong**   | Thư mục `backend/app/ml/models/v11` **rỗng** (mới chỉ serve V10) — đường găng B6                                  |
| Đồng bộ số liệu V10/V11 xuyên suốt luận văn (Ch3, Mở đầu, Kết luận, tóm tắt)      | Đang làm        | C9–C10                                                                                                            |
| Bài báo thứ 2 (VCSE 2026, về LoRA report generation)                              | Chưa nộp        | Đang để comment trong `cong_trinh.tex` — _không bắt buộc cho luận văn_                                            |

### CẦN QUYẾT ĐỊNH / LƯU Ý ⚠️

- **Phạm vi "multimodal":** commit mới nhất của `de_cuong_IUH` (25/06) và `final_project_ai` (10/06) thêm chủ đề _phát hiện bất thường đa phương thức (multimodal)_. Cần làm rõ đây là **hướng phát triển tương lai** (Chương 5) hay định mở rộng phạm vi luận văn hiện tại — nếu mở rộng sẽ tạo rủi ro trễ tiến độ.
- 4 mục **Bắt buộc** theo phản hồi đánh giá V11 (collision-rate, dataset ≥100 cột, sửa naming Bảng 3.5, khai báo limitation cột ẩn danh): hai mục đầu **đã có dữ liệu** (`collision_rate_results.json`, Arrhythmia/Madelon/`benchmark_high_dim`); còn lại là chỉnh sửa biên tập nhanh.

---

## 3. Đường găng tới ngày bảo vệ (critical path)

Theo kế hoạch, đóng băng số liệu trước **09/2026 (T1)** để nộp phản biện. Thứ tự ưu tiên:

1. **B6 — Tích hợp V11/V10 vào backend** (nạp `.pt/.json` + scaler + thresholds; thư mục v11 đang rỗng).
2. **A1 — Điều tra & khắc phục hồi quy BiLSTM**, sau đó **A2 — retune trọng số Ensemble**.
3. **Chạy LLM-as-Judge ensemble + calibration subset** → điền bảng §4.7, §4.8 và Phụ lục F (đây là khối thực nghiệm còn thiếu lớn nhất).
4. **C9–C10 — Cập nhật & đồng bộ số liệu** V10/V11 trong Chương 3–4, Mở đầu, Kết luận.
5. Hoàn tất 4 mục Bắt buộc (D1–D4) + slide bảo vệ + 2 lượt diễn tập với GVHD.

---

## 4. Rủi ro chính

- **LLM-as-Judge phụ thuộc API ngoài** (GPT-4o/Claude/Gemini) — chi phí + thời gian chấm 70×3 báo cáo; nên đặt lịch sớm để không dồn vào sát mốc đóng băng.
- **Hồi quy BiLSTM** chưa rõ nguyên nhân (nghi do anonymization tác động đặc trưng thời gian) — nếu không xử lý kịp, cần khai báo minh bạch như limitation thay vì để lùi lịch.
- **Trôi phạm vi (scope creep)** từ hướng multimodal — giữ nguyên nguyên tắc trong kế hoạch: ưu tiên cắt giảm thực nghiệm bổ sung thay vì lùi ngày bảo vệ.

---

_Báo cáo dựa trên: `ke_hoach.tex`, các chương `chuong1–5.tex`, `phu_luc.tex`, `cong_trinh.tex`; artifacts trong `csv_agent_platform/{detection,generation}`; và bản scan kiến trúc `csv_agent_services`. Các mục "chưa xong" được xác định từ marker TBD trong bản thảo và việc thiếu file kết quả tương ứng trong thư mục `outputs/`._
