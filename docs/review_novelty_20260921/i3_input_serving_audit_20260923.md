# Kiểm tra I2/I3: input, serving, style — 23/09/2026

Phạm vi: kiểm artifact hiện có và API `/api/show`, `/api/ps` của Ollama (chỉ đọc); không gọi sinh báo cáo, không đổi cấu hình mô hình. Metadata serving là trạng thái hiện tại, chưa có manifest lịch sử để bảo đảm giống hệt lúc chạy.

## Kết quả trực tiếp

1. **Dataset huấn luyện không phải packet rút gọn.** Cả 5.000 dòng `generation/data/training/synthetic_samples_v2.jsonl` có đủ `anomaly_details`, `clusters`, `context`, `cross_analysis`. `data_loader.py:_format_training_text` đưa nguyên input qua `render_full_prompt`, bọc chat template rồi nối output. Tuy nhiên script `train_qwen_lora.py:298` đặt `max_seq_length=2048`; vì vậy schema đầy đủ trên đĩa chưa chứng minh mọi token của input/output đã tới mô hình trong run lịch sử. Cần token hóa đúng tokenizer và kiểm cấu hình preprocessing của run; không suy diễn từ script hiện tại thành chứng cứ run lịch sử.

2. **Đối chứng mới khớp họ/kích thước nhưng chưa “chỉ khác LoRA”.** `/api/show` cho FT `qwen2-csv-fix:latest`: 1.5B, Q4_K_M; base `qwen2:1.5b-instruct`: 1.5B, Q4_0. Hai serving template này giống nhau; FT mặc định temperature=0.2 nhưng ablate ghi đè 0.0 cho cả hai. Muốn cô lập LoRA cần khớp lượng tử hóa, checkpoint và cách chuyển đổi, lưu model digest. Kết quả mới là bằng chứng so sánh hai cấu hình gần nhau hơn, chưa là ước lượng thuần tác động adapter.

3. **Dấu hiệu context đáng kiểm nhất: 51/70 prompt L4 được ghi đúng 2050 token trên cả ba mô hình.** Các prompt còn lại có số token khác: FT/base Qwen2 từ 1830 tới 3960; Qwen2.5 từ 1851 tới 3981. Retest 1600 có 17/25 prompt ghi 2050. Đây là sự tập trung bất thường cần kiểm, chưa đủ xác định truncation hay cơ chế đếm/cache. Request không chốt `num_ctx`; artifact không lưu prompt đã render sau serving, done_reason hay context hiệu lực. `/api/ps` lúc kiểm không có mô hình đang nạp nên không truy hồi được context của run trước.

4. **Style được ghép cặp, không lệch thành phần giữa L1–L4.** Trong mỗi mô hình của mẫu n70: detailed=36, summary=34. Mẫu retest n25: detailed=14, summary=11. Vì vậy chênh lệch tỷ trọng style giữa các mức không giải thích L4 trên các mẫu ghép cặp này; tương tác mức evidence × style vẫn cần phân tích riêng.

5. **Prompt benchmark chưa hoàn toàn giống template dùng trong code huấn luyện hiện tại.** `ablate.build_prompt` viết tay, trong khi data_loader dùng `report_prompt.j2`. Ví dụ tiếng Anh summary thiếu “do not explain individual anomalies”; detailed thiếu yêu cầu dùng semantic_text; câu khuyến nghị cũng khác. Đây là mismatch cần kiểm soát, không phải bằng chứng nguyên nhân. Prompt tiếng Việt có cấu trúc gần nhau, cần so sánh token thực tế thay vì chỉ đọc bằng mắt.

6. **So đúng 25 ca cho retest:** Qwen2.5 L4 Fmt=0.36 ở cả 700 và 1600; chạm trần giảm 19/25 xuống 9/25. L3 trên cùng mẫu: Fmt 0.99→1.00; chạm trần 12/25→0/25. Vì vậy tăng cap không cải thiện Fmt trung bình trong 25 ca L4 này. Không được kết luận loại hoàn toàn truncation: 36% còn chạm cap, chưa loại input/context truncation, chưa có thử nghiệm tương đương với biên định trước. Báo cáo trước dùng 0.35/77% từ n70 cạnh 0.36/36% từ n25 cần thay bằng so sánh ghép cặp này.

7. **Fmt có thể lẫn lỗi ngôn ngữ với lỗi bố cục.** Bộ chấm tìm chuỗi tiêu đề theo VI/EN. FT L4 có 9/70 output chứa ký tự CJK; đọc một ca thấy báo cáo tiếng Trung với tiêu đề tiếng Trung. Chưa kiểm cả 9 ca để gọi tất cả là sai ngôn ngữ. Cần tách tuân thủ ngôn ngữ, đủ mục theo nghĩa và khớp chuỗi tiêu đề. Output sai ngôn ngữ vẫn là lỗi thực tế, nhưng Fmt thấp không xác định được một nguyên nhân duy nhất.

## Kết luận và kiểm tra tiếp theo

- Chưa có bằng chứng LoRA được huấn luyện trên packet L3 rút gọn; giả thuyết đó không khớp dataset/code hiện có. Dù có lệch huấn luyện LoRA, nó không tự giải thích hai base model cũng kém ở L4.
- Ưu tiên một thử nghiệm nhỏ ghép cặp: giữ nguyên model/prompt/cap, chốt context đủ chứa input và output; lưu request hash, model digest, tokenizer length, prompt_eval_count, context và done_reason. Chỉ đổi context để phân biệt giả thuyết cắt đầu vào với giả thuyết khác.
- Sau đó kiểm prompt chuẩn dùng chung với huấn luyện; tách summary/detailed và kiểm ngôn ngữ/bố cục theo nghĩa. Không đồng thời đổi mọi biến rồi quy kết nguyên nhân.
- I2 nên ghi “cấu hình FT có NumFid proxy cao hơn và hallucination proxy cao hơn base cùng họ/kích thước”; chưa ghi “chỉ khác LoRA”. I3 nên ghi “nới cap chưa cải thiện Fmt; nguyên nhân chưa xác định”, bỏ “truncation đã bị loại”.
