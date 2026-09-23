# Đánh giá lại plan sau full review — 23/09/2026

## Kết luận

**Major revision cho cách diễn giải và thứ tự triển khai.** Plan đã tiến từ nhận định sang thí nghiệm có artifact, nhưng chưa đủ căn cứ để chốt “F5 đã chứng minh”, “benchmark đầu tiên”, hoặc chuyển trọng tâm luận văn sang A+B. Phát hiện quan trọng nhất của lượt này: baseline template có lỗi bỏ trường; bổ sung đúng trường đó làm NumFid tăng từ 0,5700 lên **1,0000 trên cả 70 mẫu**. Kết luận LLM vượt template về fidelity phải rút lại.

Phạm vi: đọc bốn tài liệu được yêu cầu, đối chiếu mã và JSON của publication_gate/F5; tính lại các thống kê bên dưới từ artifact. Không chạy lại mô hình, không thực hiện panel reviewer độc lập, không xác minh lại toàn bộ prior work. Không sửa bốn tài liệu gốc. Báo cáo này không thêm citation học thuật mới; các khẳng định “đầu tiên/chưa ai làm” vẫn cần tìm kiếm và xác minh học thuật riêng theo AGENTS.md.

## 1. Phát hiện cần sửa trước khi dùng plan

### P1 — Baseline template lỗi, làm đảo kết luận F5

`csv_agent_platform/generation/experiments/f5_evidence_ablation/ablate.py:115–117` chỉ xuất ratio khi `isinstance(r, (int, float))`. Nhưng ratio trong các packet được đánh giá là chuỗi, ví dụ `0.75% of total records`. Vì vậy template bỏ trường mà `fidelity.py:236–266` lại coi là bắt buộc.

Kiểm chứng không gọi LLM: ghép 70 output template trong `results_n70.json` với bản ghi gốc theo gold/language/style, giữ nguyên báo cáo, chỉ chèn ratio chuỗi vào dòng cluster tương ứng, chấm bằng chính `evaluation.fidelity.score`:

| Chỉ số | Template hiện tại | Template bổ sung ratio |
|---|---:|---:|
| NumFid trung bình, n=70 | 0,5700226757 | **1,0000000000** |
| NumFid thấp nhất sau bổ sung | — | **1,0000000000** |

Đây là kiểm chứng độ nhạy của kết luận đối với lỗi baseline, chưa thay thế một lần chạy benchmark đã sửa và đóng phiên bản. Tuy vậy, nó đủ bác bỏ lập luận FT·L3=0,655 thắng template vì LLM trung thực hơn. Các câu ở novelty_map:525,529,618–620 phải rút. CI/bootstrap không chữa được đối chứng lỗi.

### P1 — Hai mô hình không cô lập tác động fine-tuning

novelty_map:480,523,601,616 coi `qwen2-csv-fix` và `qwen2.5:3b-instruct` là cặp giúp tách fine-tuning khỏi evidence. Artifact huấn luyện `generation/outputs/qwen2_v2_training_metrics.json:2` ghi nền `Qwen/Qwen2-1.5B-Instruct`; judge.py cũng mô tả generator 1,5B. Đối chứng là Qwen2.5 3B, khác phiên bản và kích thước.

Cần ghi nhận đây là so sánh hai hệ thống; chưa thể kết luận nhân quả “fine-tuning mua văn phong, không mua sự thật”. Cần cùng base checkpoint, tokenizer, template chat, lượng tử hóa và serving options; lưu digest của mô hình Ollama để xác minh chính xác adapter đang chạy. ROUGE-L tăng cũng chưa tự chứng minh văn phong tốt hơn.

### P1 — NumFid/hallucination proxy chưa đo đúng sai theo phát biểu

`fidelity.py:503–510` tạo tập số xuất hiện rồi kiểm số bắt buộc có trong tập đó không. Nó không kiểm số gắn đúng cluster/thuộc tính. Đảo số giữa hai cluster vẫn có thể giữ NumFid cao. Phần hallucination kiểm số thuộc tập giá trị packet và một số tên issue; không bao phủ mọi phát biểu nghiệp vụ sai.

Do đó nên gọi NumFid là độ phủ giá trị số bắt buộc theo bộ chấm hiện tại. `hallu_rate=0` không bảo đảm báo cáo không ảo giác ngữ nghĩa. Cần đánh giá tuple/entity–attribute–value hoặc kiểm chứng mẫu bởi người; giữ chỉ số cũ làm proxy, công bố giới hạn. Đánh giá template đúng đủ trường trước khi quyết định LLM mang thêm giá trị gì.

### P1 — Suy nguyên nhân thất bại L4 quá sớm

`ablate.generate` cố định `num_predict=700`, không lưu `done_reason`, không chốt `num_ctx` trong request. Tính trực tiếp từ artifact:

| Mô hình | L1 chạm 700 | L2 | L3 | L4 |
|---|---:|---:|---:|---:|
| qwen2-csv-fix | 0/70 | 0/70 | 0/70 | 2/70 |
| qwen2.5:3b-instruct | 25/70 | 26/70 | 29/70 | **54/70** |

Chạm trần là tín hiệu cần kiểm tra truncation, chưa phải bằng chứng duy nhất về nguyên nhân. Cùng giới hạn đầu ra không có nghĩa đã kiểm soát tổng token hoặc độ khó nhiệm vụ. L3 bỏ bằng chứng từng bản ghi trong khi prompt detailed vẫn yêu cầu giải thích từng bất thường; còn Cov@2 chấm theo packet đầy đủ. Các điều kiện khác nhau cả thông tin có thể trả lời.

Có thể giữ kết luận “L4 kém L3 trên các proxy đã đo trong cấu hình này”. Chưa được viết “2.350 token phá vỡ mô hình nhỏ”, “production tệ nhất” nói chung, hoặc chọn L3 trên chính tập test rồi xem số đó là đánh giá cuối. Cần budget sweep có done_reason/context/model manifest; chọn cấu hình trên validation và kiểm tra trên holdout mới.

### P1 — Gate: diễn giải sai quan hệ đánh đổi

`publication_gate/FINDINGS.md:12–16`: K=1, seed42, coarse B2 có unsafe=0,103 và false-block=0,769; B2′ có unsafe=0,359 và false-block=0. Revalidation giảm chặn nhầm nhưng tăng lọt ca không an toàn so với coarse. Vì vậy câu “coarse bị revalidation áp đảo” sai nếu xét đồng thời hai mục tiêu.

Cần so sánh Pareto hoặc đặt trước hàm chi phí/ràng buộc rủi ro. B2f trùng B2′ trên các ca đã chạy là kết quả hữu ích nhưng chưa phải chứng minh tương đương mọi tình huống.

Kết quả B3 trùng B2f chỉ hỗ trợ “không có giá trị tăng thêm trong event model này”. `events.py:_attempt_fix` thay đổi bytes ở các ca sửa được tạo; B2f đã quét các dòng đổi nên thí nghiệm chưa phân biệt được hai cơ chế. Không suy ra việc đánh giá ứng viên trước phê duyệt luôn tương đương kiểm lại sau sửa ở mọi hệ thống.

### P1 — 53% là đặc tính corpus thiết kế, không phải tỷ trọng vấn đề thực tế

JSON cả ba seed ghi K=0: B1/B2/B2f/B2′/B3 nhận sai **34/64**; riêng B0 là **0/64**, nên “mọi gate” sai.

Bảng trong TONG_HOP liệt kê 16 lossy +16 email +6 FK +6 lease=44 lượt loại lỗi. `corpus.py` có 10 ca soft-mix chứa cả lossy và email: hợp các ca là **44−10=34**. Đây là số đếm chồng lấp, không phải artifact mâu thuẫn. Phải ghi rõ overlap để tránh chia tỷ lệ sai.

Corpus chủ động tạo các loại lỗi, contract thiếu ràng buộc và 10 ca hỗn hợp. Tỷ lệ 53,1% không ước lượng prevalence nghiệp vụ, không đủ để kết luận nghiên cứu freshness là “tối ưu nhánh sai”. Ngay K=1 seed42, B1→B2f giảm unsafe 0,654→0,359, tức **29,5 điểm phần trăm**, không phải chỉ vài phần trăm.

### P2 — Benchmark đã chạy không đồng nghĩa benchmark đã được thẩm định độc lập

104/104 là kiểm tra nhất quán oracle với fixture. Hệ đích SQLite giúp tách triển khai oracle khỏi gate; tầng 3 vẫn do tác giả viết luật. Chưa có xác nhận độc lập bởi chuyên gia, dữ liệu thực/đa schema, hay held-out fault families. Gọi là benchmark thử nghiệm có oracle thực thi được là phù hợp; “đứng vững trong mọi kịch bản”, “oracle độc lập ba tầng có nhãn chuyên gia” và “benchmark đầu tiên” chưa được chứng minh.

Gate scan/contract là mã benchmark, dù phần ra quyết định gọi evaluate_readiness thật. Đây chưa phải kiểm chứng toàn tuyến hệ sản phẩm, đặc biệt ánh xạ, export và identity của bytes thực xuất.

### P2 — Những suy diễn khác cần hạ mức

- Mapping/cleansing có nhiều prior work không làm toàn bộ lĩnh vực “đóng hẳn”. Kết luận hợp lý: tổ hợp kỹ thuật phổ biến hiện tại chưa đủ làm tính mới.
- Không tìm thấy nghiên cứu tương tự chưa chứng minh “chưa ai suy ràng buộc từ target rejection” hoặc “benchmark đầu tiên”. Tên thuật ngữ có người dùng trước không cấm dùng lại; cần dẫn nguồn và phân biệt đóng góp.
- Reconciliation không mặc nhiên là thứ mọi ngôn ngữ ràng buộc khai báo không biểu diễn được. Phải định nghĩa lớp contract cụ thể rồi chỉ ra giới hạn của lớp đó.
- R3 trong assessment: mô phỏng không xác lập định lý “đúng từ p≥10” hay ngưỡng sai phổ quát p≤5. Phản ví dụ bác bỏ mệnh đề phổ quát; cách sửa cần chứng minh theo đầy đủ giả thiết.
- R4 cho thấy decoder/aggregation không khớp bảo đảm Count-Sketch; chưa chứng minh thay embedding trong detector sẽ cải thiện F1. Cần ablation pipeline thực sau thay đổi.
- Judge 3B tương quan kém với proxy tự động chưa phải calibration với nhãn chuyên gia như giao thức ban đầu. Không thể loại prompt làm nguyên nhân chỉ nhờ thêm một prompt hẹp. Chưa được đóng hạng mục đánh giá nghiệp vụ bằng kết quả này.

## 2. Plan nên đổi như thế nào

**Ưu tiên hoàn thiện nhánh Evidence Packet gắn luận văn hiện tại; giữ migration gate là nhánh thăm dò.** Đây là khuyến nghị theo mức sẵn sàng bằng chứng, không phải khẳng định nhánh nào mới hơn về học thuật.

1. Sửa baseline template và tên/định nghĩa metric; chấm lại 630 output đã có, giữ nguyên artifact gốc và lưu manifest. Chưa cần gọi LLM lại cho bước này.
2. Chạy đối chứng cùng mô hình nền; kiểm token budget/termination và lựa chọn evidence trên validation. Tách hiệu quả evidence, fine-tuning và độ dài prompt thành các câu hỏi riêng.
3. Chấm mù giá trị nghiệp vụ bằng rubric có người đánh giá; đo lỗi phát biểu, mức đầy đủ khuyến nghị và thời gian người dùng hoàn thành công việc. LLM chỉ có lý do đứng trong pipeline nếu cải thiện một mục tiêu hữu ích so với template đúng đủ trường.
4. Đóng các khoản nợ F1–F4/F6 về nhãn, provenance, ngưỡng, lý thuyết và claim thống kê trước khi mở thêm đóng góp.
5. Nếu tiếp tục gate: đặt trước trade-off unsafe/false-block, kiểm trên nhiều schema và fault families giữ kín; so contract-only, revalidation, shadow-load+reconciliation và cơ chế đề xuất với cùng quyền truy cập thông tin. Học constraint chỉ dùng phản hồi train/dev, không dùng oracle test để học rồi tự đánh giá.
6. Đồng bộ trạng thái tài liệu: TONG_HOP và assessment còn ghi F5 chưa chạy trong khi novelty_map H đã có 630 báo cáo; TONG_HOP chọn A+B còn H chuyển sang F5. Cần một quyết định hiện hành, ngày cập nhật và bảng claim→artifact→giới hạn.

## 3. Phát biểu đóng góp có thể bảo vệ ở thời điểm này

> Luận văn đánh giá ảnh hưởng của cấu trúc và mức thông tin trong gói bằng chứng tới báo cáo bất thường do mô hình ngôn ngữ nhỏ sinh ra, so với báo cáo tất định; đồng thời khảo sát đánh đổi giữa lọt lỗi, chặn nhầm và chi phí kiểm lại của cổng dữ liệu trong một benchmark tổng hợp.

Đây là mô tả phạm vi và đóng góp thực nghiệm đang xây dựng. Chưa nên thêm “đầu tiên”, “vượt template”, “fine-tuning cải thiện sự thật” hoặc bảo đảm không ảo giác. Tính mới phương pháp và giá trị nghiệp vụ vẫn cần đối chứng hợp lệ và định vị học thuật có kiểm chứng.
