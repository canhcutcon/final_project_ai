1. Ablation \_biz_rule_violations_freq ngay (~nửa ngày, có sẵn script train) — biết con số thật của XGB trước khi mọi thứ khác được viết quanh nó.
2. Chạy khối NLP #8–#9 (fidelity) trước judge — không cần API key ngoài, cho ngay bằng chứng định lượng về chất lượng report thay cho cảm giác.
3. Chuyển khung ensemble trong Ch3–Ch5: XGB precision-first làm trụ (nhất quán với finding A1 rằng XGB ổn định 0.907–0.913 qua mọi phiên bản dữ liệu); BiLSTM/DAE là nhánh bổ trợ + limitation trung thực.
4. Đừng đầu tư thêm vào việc kéo BiLSTM lên 0.70 — A1 đã chứng minh seed-sweep không tới được, còn thay kiến trúc thì rủi ro trễ tiến độ đúng như nguyên tắc chống scope-creep trong kế hoạch của bạn.

Điểm mấu chốt từ A1: test chỉ có 98–158 anomaly → mọi cải thiện dưới 0.05 F1 là không chứng minh được (chìm trong phương sai seed). Nên bất kỳ thí nghiệm enhance nào cũng phải chạy ≥3 seed và so mean ± sd, không được so single-run — nếu không sẽ lặp lại đúng sai lầm "0.764" (một lần rút may được ghi thành năng lực model).
Phase E đã phóng lại (lần này ghi file theo lô để chống mất dữ liệu). Trạng thái tổng:

Xong 3/5 phase con:

- Phase D: PASS (0 verbatim)
- Phase C chương 3+5: 4 lệch + 1 claim không nguồn nghiêm trọng (ANON 3/9, ISOLET)
- Phase C chương 4: 15 lệch, 10 không nguồn, 5 mâu thuẫn nội bộ — nặng nhất là §4.12 Tenant A dùng số eval doanh nghiệp trình bày như kết quả trên HDB Resale, và §4.11 "loại 35 cột, F1 0,881→0,874" không có bằng chứng

Một mâu thuẫn giữa 2 agent tôi tự hoà giải được: agent chương 4 đánh "2.928 cặp" (§4.7.3) là LỆCH vì qwen2_training_metrics.json ghi 3.998 — nhưng file đó là artifact của lần train v1; adapter v2 (checkpoint-549: 549 steps = 3×⌈2928/16⌉) xác nhận 2.928 đúng. Kết luận: tex đúng, nhưng thiếu artifact metrics v2 — đây chính là gap mà smoke test + full eval đang chạy sẽ lấp (kể cả BLEU/ROUGE=1,0 ở §4.7.4 hiện đang dẫn artifact v1 memorization, sẽ phải thay bằng số structural eval mới).

Đang chạy: Phase E (17 claim), batch refs 20/81, smoke test LLM (vẫn tải model). Khi đủ tôi sẽ ra báo cáo tổng hợp + correction list — verdict Stage 2.5 chắc chắn FAIL vòng 1, cần vòng sửa trước khi sang Stage 3.

✻ Worked for 4m 9s · 2 shells still running

⏺ Agent "Phase E: xác minh claim (chạy lại)" failed: Agent terminated early due to an API error: You've hit your session limit · resets 2am (Asia/Saigon)
You've hit your session limit · resets 2am (Asia/Saigon)
/usage-credits to request more usage from your admin.

✻ Worked for 24m 31s · 2 shells still running

5 tasks (0 done, 3 in progress, 2 open)
◻ Smoke test eval LLM (nền) → full run 100×3 nếu pass
◼ Stage 2.5 Phase A: xác minh 100% 81 ref (S2/CrossRef batch + WebSearch)
◼ Stage 2.5 Phase C: đối chiếu 100% số liệu ↔ experiments/
◼ Stage 2.5 Phase B+D+E: ngữ cảnh trích 30% + originality 30% + claim 30%
◻ Stage 2.5: checklist 7 failure-mode + báo cáo tổng hợp + verdict

1. Seed-probability ensemble — gần như miễn phí. Bạn đã có sẵn 3 checkpoint new_s42/43/44 trong runs/. Trung bình xác suất dự đoán của 3 checkpoint rồi mới đặt ngưỡng — thường được +0.02–0.05 F1, ổn định hơn hẳn, và không cần train gì thêm. Chạy inference vài phút là biết.
2. Focal loss + class weights — đúng nghĩa "thêm hardness" và là ứng viên hợp lý: nhãn lệch (4% anomaly), BiLSTM recall đang thấp (0.57–0.65). Đây thuộc nhóm "thay đổi thực chất" mà A1 nói là điều kiện cần để vượt 0.70. Nhưng không chắc thành công — budget tối đa 1–2 ngày, thất bại thì dừng.
3. "Hardness" theo nghĩa phân tích: phân tầng lỗi theo loại bất thường/rule (anomaly nào BiLSTM bắt được mà XGB trượt và ngược lại) — nửa ngày, không rủi ro, và là chất liệu rất tốt cho Chương 4 + bảo vệ. Nó cũng trả lời câu hỏi quan trọng hơn cả F1: BiLSTM có đóng góp độ phủ gì mà XGB không có? Nếu câu trả lời là "không" thì mọi công enhance đều vô ích về

Phase C (chương 3+5) hoàn tất — có phát hiện quan trọng:

Kết quả: 50 mục kiểm — 31 khớp, 4 lệch, 11 chưa tìm được nguồn. Các vấn đề chính phải sửa:

1. Nghiêm trọng nhất — chuong5:128–131: claim "ANON 3/9 tập (CCF, Madelon, ISOLET), 1.145/1.598 cột (71,7%)" không có artifact nào chống lưng — kết quả quét thật chỉ có 6 tập với 1 tập anonymized; ISOLET không hề tồn tại trong repo. Đây là ứng viên Mode 3 (hallucinated result) trong checklist 7 failure-mode.
2. chuong5:61: A2_DAE AUC ghi 0,965 — artifact (và chính chương 3, 4) là 0,953.
3. chuong3:549: warmup ratio ghi 0,1 — thực chạy 0,03.
4. Số tập benchmark không nhất quán giữa các chương (5 vs 8 vs 9).
5. Bảng 3.1 ghi "51 cột" trong khi artifact top-k = 50.

Tin tốt: hai điểm nghi vấn từ plan/08 đều ổn — số "2.928 cặp" trong tex là đúng (549 steps × 3 epochs khớp toán học với 2.928 mẫu; số 3.998 cũ chỉ còn sót trong plan/08 và progress.md, cần cập nhật docs), và LoRA r=32/α=64 khớp tuyệt đối với adapter_config.json.

Còn chờ: Phase C chương 4, Phase E (claims), batch refs (~15/81), smoke test. Khi đủ, tôi tổng hợp báo cáo Stage 2.5 — với các phát hiện hiện tại, verdict gần như chắc chắn là FAIL kèm correction list (theo protocol: fix → re-verify, tối đa 3 vòng).
Evaluation Qwen hoàn tất — cả 3 run trên 100 mẫu test holdout cấu trúc (seed 42, các tổ hợp chưa từng thấy trong train/val):

┌────────────┬───────────────────────────────────┬────────┬─────────┬────────┐
│ Run │ Adapter / prompt │ BLEU │ ROUGE-L │ Format │
├────────────┼───────────────────────────────────┼────────┼─────────┼────────┤
│ v2_serving │ v2, prompt production │ 0,1423 │ 0,3326 │ 0,89 │
├────────────┼───────────────────────────────────┼────────┼─────────┼────────┤
│ v1_legacy │ v1, prompt gốc của v1 (best case) │ 0,0055 │ 0,2068 │ 0,97 │
├────────────┼───────────────────────────────────┼────────┼─────────┼────────┤
│ v1_serving │ v1, prompt production │ 0,0041 │ 0,2002 │ 0,90 │
└────────────┴───────────────────────────────────┴────────┴─────────┴────────┘

Hai kết luận chính cho Ch4:

1. v2 generalize thật. BLEU/ROUGE không còn =1,0 như bộ số cũ tháng 4 — đúng dấu hiệu tốt mà plan/08 dự đoán (model học cấu trúc thay vì thuộc lòng). 11/100 mẫu fail format là lỗi thật đáng ghi nhận: 7 mẫu tự đổi tên section ("Summary Report" thay vì "Executive Summary"), 4 mẫu thiếu bullet.
2. Bằng chứng định lượng overfitting của v1 (điều plan/08 muốn có cho threats-to-validity): v1 giữ format gần hoàn hảo (0,97 — thuộc lòng template) nhưng nội dung sụp đổ trên tổ hợp cấu trúc mới, BLEU kém v2 ~26 lần ngay cả với prompt gốc của chính nó.

Sự cố đã xử lý trong quá trình chạy: (1) format compliance ban đầu báo 0/100 — do checker cũ đòi heading ## trong khi data v2 dùng header bold; đã sửa evaluate.py (ground truth giờ pass 5000/5000, số 0,89 của v2 là số đúng); (2) MPS OOM khi chạy 3 run liên tiếp trong 1 process — chuyển sang mỗi run một process riêng, không mất dữ liệu.

File đã cập nhật:

- generation/outputs/qwen2_v2_structural_eval.json — đủ 3 run + 300 predictions + ghi chú checker
- evaluation_decision.json mới (bản BLEU=1.0 cũ giữ tại evaluation_decision_v1_suspect_leakage.json làm bằng chứng before/after)
- qwen2_v2_training_metrics.json (train_loss 0,219 / eval_loss 0,214, 549 step, r=32/α=64)
- plan/08 — tick xong Phần 3 (Qwen) + toàn bộ Phần 4

Còn lại theo plan/08: Gemma v2 retrain (tuỳ chọn, làm đối chứng),
và B8 (LLM-as-Judge) giờ đã hết bị chặn — có model v2 + test set cấu trúc rồi, chỉ còn thiếu tooling (plan/05 D8). Nhắc lại: token HF cũ vẫn cần bạn revoke trên huggingface.co.

"Format compliance" là bài kiểm tra khuôn mẫu, giống kiểm tra một biểu mẫu hành chính. Mỗi báo cáo sinh ra phải có đủ 3 điều: (1) có đề mục, (2) có ít nhất một dòng gạch đầu dòng (- ...), và (3) 3 mục bắt buộc phải đúng tên chuẩn: Executive Summary → Key Issues → Recommendations (hoặc bản tiếng Việt: Tóm tắt / Vấn đề / Khuyến nghị). Sai một trong ba là bị đánh rớt, dù nội dung bên trong viết hay đến đâu.

Trong 100 báo cáo của model v2, có 11 bài rớt, chia 2 nhóm — đây là ví dụ thật vừa trích từ dữ liệu:

Nhóm 1 — 7 bài "tự đổi tên đề mục" (viết đủ nội dung nhưng đặt sai tên mục):

- Mẫu #17, #47, #52, #94: viết "Summary Report" thay vì "Executive Summary" — như điền đơn mà ghi "Bản tường trình" vào ô đáng lẽ phải ghi "Đơn xin việc". Nội dung vẫn có tóm tắt, vẫn có Key Issues, Recommendations đầy đủ.
- Mẫu #39, #81: quên hẳn mục "Recommendations" — báo cáo dừng lại sau phần phân tích, không có phần khuyến nghị.
- Mẫu #87: tự chế mục "Anomaly details" không có trong khuôn.

Nhóm 2 — 4 bài "quên gạch đầu dòng" (#46, #92, #95, #98): tên mục gần như đúng hết, nhưng phần liệt kê bất thường viết thành văn xuôi liền mạch thay vì danh sách - từng bất thường một. Riêng #46 tệ nhất: còn lẫn cả tiếng Trung ("主要教训", "建议") — model trôi sang ngôn ngữ khác giữa chừng.

Vì sao chuyện này quan trọng dù "chỉ là hình thức": hệ thống production đọc báo cáo bằng máy — dashboard và parser tìm đúng chuỗi "Executive Summary" để cắt mục. Model đổi tên mục là parser vỡ, y như phần mềm kế toán không đọc được hóa đơn viết tay sai mẫu. Đó chính là lý do con số 0,89 (89/100 đạt) vẫn dưới ngưỡng vận hành 0,95, và vì thế lớp dự phòng Jinja2 (khuôn cứng, đúng format 100% nhưng văn khô) vẫn phải giữ trong pipeline — đúng như đã viết trong Ch4.

## Cách fix

Tầng 1 — Guardrail trong pipeline phục vụ (khuyến nghị, ~1 buổi, không GPU)

Sửa ở report_generator.py, không đụng model. Sau khi model sinh xong thì chạy chính \_is_format_compliant làm cổng kiểm tra, kèm bộ sửa tự động:

- 7 lỗi đổi tên đề mục: sửa được bằng bảng ánh xạ regex an toàn — Summary Report → Executive Summary, v.v. Chỉ đổi dòng đề mục, không chạm nội dung, nên rủi ro gần bằng 0. Nhóm này chiếm 7/11 lỗi.
- Thiếu mục Recommendations / thiếu bullet / lẫn tiếng Trung (4 lỗi còn lại, khó sửa máy): retry sinh lại 1 lần (temperature thấp hơn), vẫn fail thì rơi xuống fallback Jinja2 có sẵn — vốn đúng format 100% theo thiết kế.

Kết quả: format compliance hiệu dụng của hệ thống = 1,0, còn con số 0,89 của model thô vẫn báo cáo trung thực trong Ch4. Đây cũng là câu chuyện đẹp cho luận văn: đúng kiến trúc defense-in-depth mà Ch4 vừa viết ("lớp dự phòng Jinja2 tiếp tục là thành phần bắt buộc") — giờ có số chứng minh vì sao.

Tầng 2 — Siết prompt (cẩn thận, dễ dẫm lại vết xe đổ)

Thêm vào report_prompt.j2 chỉ dẫn cứng kiểu "BẮT BUỘC dùng đúng 3 đề mục: Executive Summary, Key Issues, Recommendations; mỗi bất thường một dòng bắt đầu bằng - ". Nhưng nhớ bài học Mục B của plan/08: report_prompt.j2 là nguồn sự thật duy nhất cho cả train lẫn serve — đổi nó nghĩa là phải sinh lại data v3 + retrain, nếu không train và serve lại lệch nhau đúng như lỗi cũ. Nên tầng này chỉ làm khi nào đằng nào cũng retrain.

Tầng 3 — Retrain nhắm vào format (đắt nhất, lợi ích không chắc)

Thêm epoch hoặc tăng cường mẫu train, hoặc dùng constrained decoding (thư viện outlines/logit bias ép cấu trúc đề mục). Tốn GPU, thêm dependency, và 11% lỗi format không đáng chi phí đó khi tầng 1 đã đưa hệ thống về 1,0.

Một việc đáng làm thêm trước khi chọn: kiểm tra nhanh xem 5.000 reference trong data train v2 có tuyệt đối thống nhất 3 đề mục chuẩn không — nếu pool paraphrase lỡ đa dạng hoá cả tên đề mục (chứ không chỉ câu văn), thì model học "đề mục cũng đổi được" là lỗi từ data, và fix đúng là sửa generator + retrain (tầng 3 trở nên đáng giá). Còn nếu data sạch 100% thì lỗi chỉ là sampling noise của model 1.5B, tầng 1 là đủ.
