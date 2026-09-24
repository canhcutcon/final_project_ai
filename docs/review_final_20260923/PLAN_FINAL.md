# Plan triển khai sau rà soát cuối

Chốt ngày **24/09/2026**, dựa trên audit23/09 trong `REVIEW_FINAL.md` và `audit_evidence.json`. Thư mục giữ mốc bắt đầu23/09. Đây là plan để triển khai, **không phải xác nhận các bước đã hoàn thành**. Mọi amendment tiền đăng ký phải lưu ngày, lý do và trạng thái holdout chưa mở.

**Revision 2 — 24/09/2026:** bổ sung D1b, trạng thái PREREG tại P0, task tạo base đồng nhất lượng tử hóa, kiểm cap theo arm, quy tắc cặp thiếu và định nghĩa đồng thuận. Đây là sửa plan trước triển khai; chưa sửa code, PREREG hoặc mở holdout.

## 1. Quyết định phạm vi

**Hướng chính:** hoàn thiện bằng chứng thực nghiệm cho báo cáo bất thường dựa trên Evidence Packet, so với baseline tất định hợp lệ. Phân biệt ba câu hỏi: mức thông tin có sẵn ảnh hưởng proxy thế nào; cấu hình FT khác base thế nào; báo cáo có giá trị gì cho chuyên gia/người dùng.

**Hướng nền bắt buộc:** sửa provenance, threshold/preprocessing, lý thuyết CASH và claim ensemble để luận văn không dựa trên bằng chứng sai.

**Gate:** giữ là pilot bổ trợ có giới hạn, sửa correctness và cách diễn giải. Không mở nhánh học constraint từ phản hồi hệ đích, không chạy thêm để cố cứu lợi thế chi phí, không nhận “benchmark đầu tiên”. Zero-downtime/CDC và hypercare chưa thuộc đóng góp được kiểm chứng của đề tài hiện tại.

**Đường hoàn thành tối thiểu:** công cụ đo đúng → protocol khóa → xác nhận F5 → sửa claim/bảng detector → viết luận văn theo kết quả. Kết quả âm hoặc template tốt hơn không làm plan thất bại. Giá trị học thuật nằm ở câu hỏi, thiết kế, bằng chứng có thể tái lập và phạm vi đóng góp; sửa bug tự nó chưa phải tính mới.

## 2. Thứ tự và phụ thuộc

| Gói | Việc | Phụ thuộc | Chặn gì? |
|---|---|---|---|
| P0 | Tạo một bảng claim/trạng thái hiện hành, đánh dấu tài liệu lịch sử | Không | Chặn viết kết luận mới từ tài liệu cũ |
| P1 | Hợp nhất template, sửa scorer, runner và provenance | P0 | Chặn mọi lần chạy xác nhận |
| P2 | Chuẩn hóa model/context/ngôn ngữ/bố cục; amend protocol | P1 | Chặn mở holdout |
| P3 | Dry-run và khóa cấu hình | P1+P2 | Là cửa kiểm cuối trước holdout |
| P4 | Chạy xác nhận n100 đúng cấu hình đã khóa | P3 đạt toàn bộ | Không được dùng để tuning |
| D | Sửa detector, lý thuyết và tái lập bảng bị ảnh hưởng | Sau P0; làm song song P1–P3 | Chặn claim detector và hoàn thiện luận văn, không tự chặn F5 độc lập |
| G | Sửa pilot gate và thu hẹp claim | Sau P0; làm song song khi không tranh tài nguyên | Chặn giữ kết quả gate trong bản cuối |
| U | Hoàn thiện expert/user evaluation riêng | Có cấu hình/report cuối và protocol U khóa | Chặn claim hữu ích nghiệp vụ/hiệu quả người dùng |
| W | Đồng bộ bản thảo, citation, bảng và kiểm bản dựng | P4+D; G/U theo claim giữ lại | Chặn bản nộp |

Chỉ dùng một công việc inference nặng tại một thời điểm để giữ môi trường đo có kiểm soát. Không cần đợi tuyển người chấm hoặc tối ưu gate để khóa phép đo tự động F5.

## 3. P0 — Một nguồn kết luận hiện hành

**Đầu ra:** bảng `claim → trạng thái → artifact/hash → phạm vi → task còn lại`, bao gồm F1–F7, I1–I13 và R01–R19 của review mới.

- Đưa kết luận cũ của TONG_HOP, assessment, novelty_map, FINDINGS_F5, JUDGE_FINDINGS, PREREGISTRATION và README/FINDINGS gate vào trạng thái lịch sử/superseded tại đúng chỗ hoặc trong archive. Không chỉ nối thêm đính chính ở cuối.
- Loại khỏi kết luận hiện hành: LLM thắng template về truth; FT chỉ mua văn phong; đã xác định mất Instruction; mọi gate lọt34/64; coarse bị áp đảo; B3 luôn bị hấp thụ; p≥10 chứng minh định lý; MAE493× chứng minh detector kém493×; các firstness/không-tồn-tại chưa chứng minh.
- Rút claim Condo/HDB có nhãn thật độc lập và “không chịu phê phán đánh giá vòng tròn” ở cả `iuh_master_thesis/chapters/cash_results.tex` và `de_cuong_IUH/chapters/cash_results.tex`; task D1b xử lý nhãn và phạm vi bảng.
- Đối chiếu checkbox trong `csv_agent_platform/generation/experiments/f5_evidence_ablation/PREREGISTRATION.md` với live runner: bỏ dấu đạt ở template/context cho đến khi P1/P2 có bằng chứng nghiệm thu; mục output cap chuyển về chưa khóa cho đến khi ghi giá trị số và đạt P3. Default700 không tự có nghĩa cap không cố định, nhưng chưa chứng minh cấu hình1600 dự kiến đã được khóa. Mỗi checkbox đạt phải dẫn artifact/test/config hash; P3 không lấy chính checkbox làm bằng chứng độc lập. Giữ lịch sử amendment.
- Các bảng cũ phải giữ run/date rõ ràng, không thay số âm thầm bằng số run mới.

**Đạt khi:** đọc riêng mỗi tài liệu hiện hành không dẫn đến một trong các kết luận đã rút; các tài liệu gốc và luận văn không chứa yêu cầu thực thi mâu thuẫn với plan. Dùng occurrence manifest thay số đếm file viết tay.

## 4. P1 — Sửa công cụ đo và đường chạy

### P1.1 Template duy nhất

Phạm vi: `csv_agent_platform/generation/experiments/f5_evidence_ablation/ablate.py`, `csv_agent_platform/generation/experiments/f5_evidence_ablation/fix_template.py`, module template chung và fixture phù hợp.

- Hợp nhất det_v2 vào một implementation được runner mới và script tái chấm cùng sử dụng.
- Xử lý ratio chuỗi/số/thiếu; biểu diễn entity–field rõ ràng; không thêm nội dung suy diễn không có bằng chứng.
- Nhánh tiếng Anh phải có câu tiếng Anh, summary/detailed có yêu cầu nhất quán; không cải thiện riêng baseline hoặc model sau khi xem holdout.
- Ghi version template và schema. Phân biệt bản sửa tối thiểu ratio với template được mở rộng nhiều trường.

**Nghiệm thu:** fixture known-answer cho ratio và ngôn ngữ/style; không bỏ trường bắt buộc; không bịa trường absent; output deterministic. Tái chấm template trên tập phát triển bằng đúng hàm runner, không patch thủ công artifact rồi coi live code đã sửa.

### P1.2 Scorer có ID và phép ghép cặp đúng

- Lưu `(case_id, condition, model_digest, report_hash)` trong từng score; join trước khi xử lý missing.
- Từ chối ID trùng/arm thiếu ngoài failure policy; không zip hai danh sách lọc riêng.
- Giữ NumFid cũ với tên/định nghĩa proxy chính xác; thêm các fixture đảo số giữa cluster, số đúng ở sai thuộc tính để minh họa giới hạn. Không âm thầm đổi estimand NumFid trước xác nhận.
- Tách `language_compliance`, `layout_compliance`; giữ `fmt_legacy` để nối kết quả lịch sử. Khóa rubric nhận diện mục theo nghĩa/alias; kiểm cả output sai ngôn ngữ, thiếu mục, tiêu đề chỉ xuất hiện trong thân bài, mixed language trên dữ liệu phát triển.
- Hallucination proxy phải ghi cả numerator và denominator; một báo cáo dài có thể pha loãng tỷ lệ. Không đổi chỉ số chính sang metric khác vì kết quả tiện hơn.

**Nghiệm thu:** đổi thứ tự output không đổi kết quả; missing khác phía không ghép nhầm; fixtures nêu trên cho kết quả đã biết; mỗi kết quả có trace về report và packet. Test thống kê all-zero, dấu đảo và dữ liệu ghép cặp giả lập.

### P1.3 Runner xác nhận riêng

- Nhận manifest/config cố định thay cho gọi `load_holdout(n)` tự sample. Default phải là development/dry-run; confirmation chỉ khi lock hợp lệ.
- Lưu code commit hoặc hash patch khi workspace dirty, model digest, base/adapter/checkpoint, converter/quantization, tokenizer/chat-template hash, Ollama version, request options, prompt hash, raw output, done_reason, input/output tokens, duration, lỗi và retry.
- Append kết quả theo ca/arm vào run riêng; không overwrite lịch sử. Resume chỉ cho request chưa thành công; mọi attempt đều lưu, không chọn output đẹp nhất.
- Lỗi hạ tầng tạm thời: tối đa hai retry cùng request/model/options đã khóa; nếu còn lỗi thì dừng phiên chạy và giữ log để sửa hạ tầng, không bỏ ca âm thầm. Nếu đổi code/model/prompt sau khi đã xem output xác nhận, đánh dấu deviation và mất trạng thái xác nhận của phép so bị ảnh hưởng.
- Output rỗng trong response thành công hoặc chạm output cap là kết quả mô hình theo protocol, không lý do sinh lại chọn mẫu. Báo failure/truncation riêng; cách chấm rỗng phải nhất quán đã thử ở development. Không biến transport error thành output rỗng được chấm như mô hình sinh thành công.
- **Cặp thiếu — quy tắc cố định:** phân tích xác nhận yêu cầu đủ100 cặp hợp lệ cho từng H; không tự xóa ca theo complete-case hoặc listwise để tuyên bố xác nhận. Nếu sau retry/resume đã định trước vẫn thiếu một arm, H dùng arm đó ghi “chưa hoàn tất”, không điền score0 hoặc p=1 cho ca thiếu. Giữ dữ liệu của các H khác, nhưng chưa chốt kết luận family Holm đến khi đủ cả ba phép so; nếu dừng nghiên cứu thì báo family chưa hoàn tất. Bảng mô tả tạm thời chỉ dùng giao case ID hợp lệ **riêng từng H**, báo mask/n/lý do thiếu, gắn nhãn thăm dò; không loại ca khỏi các H không liên quan. Lỗi metric không tính được xử lý như cặp thiếu, không bỏ âm thầm.

**Nghiệm thu:** dry-run bằng fixture/development chứng minh config sai/hash sai/arm thiếu bị từ chối; dừng giữa chừng rồi resume không nhân bản case/arm; không đọc HOLDOUT_CONFIRM trong các test phát triển.

## 5. P2 — Cấu hình và amendment tiền đăng ký

### P2.1 Cấu hình cố định

Cấu hình mục tiêu để kiểm ở development: FT và base Qwen2-1.5B-Instruct, **cùng Q4_K_M**, cùng base revision/converter/tokenizer/chat template; `num_ctx=8192`, `num_predict=1600`, temperature0, seed42. Đây là lựa chọn triển khai mới trước xác nhận, không mô tả lại các run cũ. Nếu development cho thấy cấu hình không đáp ứng điều kiện kỹ thuật, sửa và ghi amendment trước P3, không đổi sau mở tập.

**P2.1a — Tạo base Q4_K_M và hồ sơ model:** ưu tiên tạo base từ đúng checkpoint/revision dùng trước merge LoRA, qua cùng converter và quy trình quantization Q4_K_M. Có thể lấy GGUF có sẵn chỉ khi xác minh được chuỗi provenance tương ứng; không đoán tag Ollama hoặc coi cùng chữ Q4_K_M là đủ. Đăng ký model local tên riêng, giữ model cũ. Nếu thiếu provenance FT thì tái xuất cả hai từ nguồn xác minh được; chưa có nguồn thì H3 tiếp tục bị chặn.

**Artifact nghiệm thu:** `model_manifest.json` và bản export metadata `/api/show` cho mỗi arm: source revision, adapter/merge provenance, GGUF hash, model digest, converter/version, quantization, tokenizer/template/stop hashes. FT mặc định temperature0.2 phải được override bằng request `temperature=0.0` ở **mọi arm**. Log options hiệu lực (request + defaults liên quan); test bỏ option bắt buộc phải bị runner từ chối. Template/stop của hai model cũ giống nhau theo kiểm tra hiện có, nhưng phải kiểm lại sau khi tạo base mới.

- Đối chiếu token kỳ vọng của prompt đã bọc đúng template với serving; kiểm ngân sách prompt+special+output. Chỉ số prompt_eval_count là một bằng chứng, không thay thế kiểm này.
- Không dùng việc model nhớ được marker làm bằng chứng duy nhất prompt nguyên vẹn.
- Quy tắc khi input vượt ngân sách ở confirmation: đánh dấu vi phạm thiết kế, dừng trước inference cho ca đó; không tự cắt, không lặng lẽ tăng context, không drop ca khỏi mẫu để cứu kết quả.
- Chưa khớp quantization/provenance thì không chạy H3; theo kế hoạch hiện tại giữ cả lần xác nhận chờ P3, không mở một phần để xem trước kết quả.

### P2.2 Amendment đề xuất, thay H2 không-kém

Giữ NumFid proxy làm chỉ số xác nhận duy nhất; định nghĩa estimand là trung bình chênh lệch ghép cặp theo ca. Chốt trước ba phép so, **hai phía H0: Δ=0**:

| H | Arm A − B | Những yếu tố cố định |
|---|---|---|
| H1 | FT·L3 − FT·L1 | Model digest, context, cap, prompt task, cùng case |
| H2 | FT·L4 − FT·L3 | Như H1; bỏ từ “không kém” |
| H3 | FT·L3 − Base·L3 | Cùng họ/base revision, quantization, context/cap/template; khác adapter đã khai báo |

Chọn L3 cho H3 là lựa chọn từ tập phát triển, phải khai báo. H1 đo lợi ích cấp thêm thông tin; không coi đây là phép đo riêng hiệu quả format EP. Nếu muốn giữ claim cấu trúc EP tốt hơn cách biểu diễn khác, cần thí nghiệm cùng lượng thông tin; không thêm claim ấy trong đường tối thiểu.

- Bootstrap ghép cặp20.000 lần theo ca, seed cố định; lưu mean, raw differences, marginal CI95%. Đánh dấu CI này **chưa hiệu chỉnh đa so sánh**.
- Đặc tả p-value trong amendment/code: lựa chọn triển khai là bootstrap dưới H0 bằng hiệu số đã center (`d_i − mean(d)`), đếm `abs(mean(d_star)) >= abs(mean(d))` (bao gồm trường hợp bằng nhau), tính `(1 + số lần thỏa)/(B + 1)`; nếu mọi hiệu số bằng0 thì p=1. Nêu rõ phép kiểm bootstrap xấp xỉ, không gọi exact. Kiểm mô phỏng calibration trên dữ liệu giả và ca biên trước khóa; nếu không đạt thì sửa phương pháp trước mở tập.
- Dùng Holm trên đúng ba p-value chính; báo p thô và p hiệu chỉnh. Quyết định xác nhận dựa trên phép kiểm đã đăng ký, không dựa riêng CI95% chưa hiệu chỉnh. Không được diễn giải “CI không chứa0 nhưng Holm không đạt” thành đã xác nhận.
- Secondary metrics báo đầy đủ, nhãn thăm dò; không thay thế H không đạt nhưng phải dùng để nêu giới hạn/rủi ro. Không khẳng định cải thiện tổng thể nếu proxy phụ cho thấy mặt trái.
- Template đầy đủ là baseline mô tả bắt buộc, không tự thêm phép kiểm thứ tư sau khi xem số.

**Nghiệm thu:** PREREGISTRATION amendment và executable config/analysis khớp nhau; đầy đủ model digest, cap số, seed, arm, p-value, family size, missing/retry, metric version; không còn H2 non-inferiority không margin.

### P2.3 Provenance holdout

Lưu script audit không xuất nội dung/ID cho analyst, quy tắc canonicalization, kiểm train/val/dev/pilot/expert, lineage/source grouping nếu tồn tại, hash dataset/index/content và splitter revision. Exact hash chỉ chứng minh không trùng nguyên văn. Nếu không thể kiểm biến thể cùng nguồn, ghi rõ giới hạn và đơn vị phụ thuộc, không dùng nhãn “sạch trên mọi trục” tuyệt đối.

n100 là cỡ mẫu kế hoạch; không hứa trước đủ power. Có thể ước lượng độ chính xác dự kiến từ development/giả lập, không xem outcome holdout để thay n.

## 6. P3/P4 — Cửa mở holdout và lần xác nhận

Chỉ mở khi mọi mục sau đạt và có artifact nghiệm thu:

- [ ] P0: trạng thái claim hiện hành đã đồng bộ.
- [ ] P1: runner sử dụng đúng template sửa; scorer ghép ID; language/layout tách riêng.
- [ ] P2: matched model/quant; prompt/context accounting; provenance manifests.
- [ ] Protocol amendment và implementation thống kê khớp, tests đạt.
- [ ] Holdout audit có cách tái lập và giới hạn lineage rõ ràng.
- [ ] Dry-run trên ca phát triển hoàn tất, logs/outputs không thiếu, resume không đổi mẫu.
- [ ] Có `development_cap_audit.json` cho **từng arm FT L1/L3/L4 và base L3** ở đúng cấu hình chuẩn bị khóa: n, cap số, phân bố output tokens, at-cap count/rate, done_reason và số trường hợp nghi cắt giữa chừng; báo chênh rate ghép cặp L4−L3. Không áp con số9/25 của Qwen2.5 trước đây cho Qwen2 mục tiêu.
- [ ] Nếu bất kỳ arm nào còn at-cap, ghi quyết định trước mở holdout: (a) điều chỉnh cap chung/ngân sách context qua amendment và kiểm lại development; hoặc (b) giữ cap, đăng ký rõ estimand là chất lượng **dưới ngân sách đầu ra cố định**, bắt buộc báo at-cap/truncation từng arm và giới hạn này ở H1–H3. Không dùng rate không-significant để coi đã hết ảnh hưởng; không bỏ ca at-cap. Hiệu ứng cap khác nhau có thể thuộc tác động dưới budget, không mặc nhiên là confound ngoại sinh.
- [ ] Test missing một arm đạt: H liên quan chưa hoàn tất; H khác giữ nguyên dữ liệu; không âm thầm complete-case để chốt Holm.
- [ ] Khóa hash code/config/model/metric/template và thời điểm trước khi mở.

**Chạy:** n100 × bốn arm LLM cần thiết (FT L1/L3/L4, base L3) + template đầy đủ. Không cần lặp mọi arm thăm dò cũ. Lưu mọi outcome. Xuất bảng H1–H3 với n cặp thực, Δ, CI marginal, p thô/p Holm, lỗi vận hành, secondary metrics và deviations.

**Hoàn thành:** một báo cáo xác nhận tái tạo được từ raw outputs mà không gọi lại model; không tuning trên tập này. Nếu phát hiện lỗi phép đo sau chạy, giữ run, ghi invalid/deviation đúng phạm vi, sửa trên development; không tái dùng để tuyên bố xác nhận như chưa từng thấy dữ liệu.

## 7. D — Detector và CASH (song song)

| Task | Việc | Bằng chứng nghiệm thu |
|---|---|---|
| D1 | Credit Card fail-closed/skip rõ ràng; synthetic chỉ opt-in và tên riêng; manifest nhãn/dataset/hash | Mock fetch lỗi không tạo metric mang danh Credit Card thật; artifact cũ giữ nguyên |
| D1b | Khai báo Condo/HDB là nhãn rule-generated từ phân vị giá; lưu công thức/ngưỡng/cột tạo nhãn/cột X. Rút claim nhãn thật độc lập/không vòng tròn ở cả hai cash_results.tex active; các bảng này chỉ là đánh giá proxy-label | Manifest phân biệt label provenance với feature leakage; thesis/proposal diễn đạt đúng. Bỏ giá khỏi X, nếu làm, là ablation truy cập trực tiếp nhãn, **không** biến nhãn thành độc lập hoặc thay thế sửa claim; proxy qua cột khác vẫn có thể còn. Bảng giữ lại có phạm vi và trace run rõ |
| D2 | Chia train/val/test trước fit preprocessing; Arrhythmia median train-only; threshold val-only cho cả5 runners | Thay held-out values không đổi fitted training preprocessing/threshold; trace mọi importer/table bị ảnh hưởng |
| D3 | Sửa mệnh đề CASH: biến ước lượng, variance nền+collision hoặc centered collision, p/N, điều kiện đủ K và noise floor | Derivation nhất quán giả thiết; phản ví dụ cũ không còn bác bound mới; không “chứng minh p≥10” bằng mô phỏng |
| D4 | Giữ signed single-table d1 làm phương án tối thiểu; pooling d>1 là heuristic, rút guarantee không áp dụng | Code/theory/claim cùng nói về một representation; không thay fixed-width bằng decoder khác bài toán |
| D5 | Lập map table→run→script→split→dataset và rerun các bảng giữ lại bị D1/D1b/D2–D4 ảnh hưởng | Artifact mới có manifest; test chỉ dùng đánh giá; báo khác biệt môi trường so run lịch sử |
| D6 | Đồng bộ bốn occurrence ensemble trong ba file active và tài liệu phụ liên quan | Mỗi claim mean/significance có metric/run/CI tương ứng; không nói mọi ensemble đã rerun |

Không cần tải/chạy mọi dataset vì chúng từng xuất hiện trong review. Mỗi claim/bảng giữ trong bản cuối phải có bằng chứng đủ; bảng không thể tái lập phải đánh dấu giới hạn hoặc rút, không tự coi là đạt. Không suy sửa pooling sẽ tăng F1 trước khi đo.

## 8. G — Gate ở phạm vi pilot

- Sửa no-op claim: blocker cũ không biến mất chỉ vì lời tuyên bố; nếu chưa kiểm lại thì giữ chặn. Sau sửa, định nghĩa rõ B2f/B3 còn khác ở đâu; kết quả hòa không tự xác nhận tương đương mọi miền.
- Sửa delete/append/reorder và cache invalidation; thêm regression đúng oracle cho no-op unsuccessful repair, row removal, uniqueness thay đổi.
- Đổi tên sự kiện thành **contract-knowledge update** với target DDL cố định; chưa mở nhánh DDL evolution.
- Báo B0 degenerates reject-all, thêm accept-all/reject-all reference nếu cần; mẫu số0 trả NA; log attempted/effective events và overlap corpus.
- Giữ oracle ba lớp đúng khả năng: DB load, các checksum đang có, luật email tác giả viết. Không gọi nhãn chuyên gia hay full migration correctness; ghi hạn chế sai lệch bù trừ.
- Rerun suite seed42/43/44 × K0/1/5/20 một lần sau sửa; giữ artifact cũ. Chỉ rerun cost nếu thay đổi tác động phần đo hoặc tiếp tục giữ claim chi phí; khi chạy phải ghép workload, đảo thứ tự và báo scope publish-only.

**Hoàn thành:** probes lỗi hiện tại chuyển thành ca kiểm đúng; các bảng có denominator và scenario rõ; không còn dominance/firstness/B3-equivalence phổ quát. Không tối ưu validator/hash chỉ để tìm một bên thắng.

## 9. U — Giá trị nghiệp vụ, tách khỏi xác nhận proxy

**U1 Expert pairwise:** sửa counts bootstrap theo ca; cho giám khảo đủ nguồn kiểm report; quy định đúng/cụ thể/khả thi, unsupported/missed; báo mức đồng thuận và số ca/số lượt riêng. Pilot kit40 ca hiện tại thuộc phát triển. Nếu dùng đánh giá cấu hình cuối, dựng bộ mới từ output đã khóa và ghi nguồn ca, không gọi pilot là xác nhận cuối. Có thể hòa hoặc template thắng.

**Đại lượng đồng thuận vào luận văn:** preference A/B/HÒA báo raw agreement riêng và Krippendorff alpha nominal trên ca chồng lặp; không gọi raw agreement67% là alpha. Kit thang1–5 nếu giữ thì báo alpha ordinal theo từng tiêu chí, kiểm công thức bằng implementation tham chiếu/fixture đã biết trước khi dùng. Hàm `score_expert.py:14` mang tên ordinal nhưng dùng squared score distance; tên hàm chưa xác nhận implementation ordinal chuẩn. Ngưỡng0,67 nếu giữ là quy tắc protocol cho alpha đã xác minh, không áp cho raw agreement và không bảo đảm chất lượng chung. Counts báo thêm bất đồng tuyệt đối giữa giám khảo, không chuyển tùy tiện sang thang preference.

**U2 User task:** mỗi participant gặp một case dưới một điều kiện; đối trọng điều kiện giữa participants. Định nghĩa source access, đáp án và tie-breaking; câu3 cần rule cụ thể trước khi gọi kiểm máy; câu4 phải có packet để kiểm hoặc đổi cách hỏi. Khóa số người/ca và phân tích phụ thuộc người×ca trước thu thập. Báo accuracy và time, không thay bằng cảm nhận hữu ích.

Nhóm “loại ca nào” phải đặt trước theo yếu tố nghiệp vụ, ít nhóm; nhóm tìm sau là khám phá. Nếu không có người tham gia phù hợp, không bịa hoặc thay bằng LLM judge; ghi chưa đo và thu hẹp kết luận. Chỉ cần U2 nếu giữ claim hiệu quả người dùng; U1 chỉ hỗ trợ chất lượng khuyến nghị theo giám khảo.

## 10. W — Viết và đóng luận văn

- Viết kết luận theo ledger cuối, không chép H/I lịch sử. Tách development, confirmation và pilot; tách artifact đã sửa khỏi live pipeline.
- Cập nhật định nghĩa NumFid/IssueFid/Cov@k so với RuleFid/top-SHAP trong bản thảo; không tuyên bố metric đã đo nếu packet thực không có trường.
- Literature matrix theo **claim hẹp được giữ**: nguồn2021+, loại học thuật hợp lệ, API metadata, full-text mechanism/experiment, venue/rank có bằng chứng; nguồn cũ chỉ `[SEMINAL — định nghĩa]`. Metadata chưa đủ thì `[CẦN XÁC MINH]`; không dùng nguồn chưa đủ để chốt novelty.
- Kiểm bibliography theo policy workspace; tận dụng snapshot cũ để tìm lỗi nhưng xác minh lại phiên bản hiện tại. Không tự đổi nguồn định nghĩa sang nguồn mới chỉ vì năm, không giữ blog thương mại làm bằng chứng nghiên cứu.
- Đồng bộ thesis/proposal tại nơi còn là tài liệu active; bản lịch sử gắn superseded. Dựng LaTeX, kiểm cite/ref/table và kiểm từng claim có dẫn artifact/source.

**Định nghĩa hoàn thành:** không còn blocker correctness/phương pháp trong claim giữ lại; H1–H3 được báo đúng protocol hoặc lý do không thể xác nhận; tất cả kết luận hữu ích/ngữ nghĩa có phép đo phù hợp hoặc được rút; gate là pilot; các giới hạn và kết quả âm hiển thị; bản dựng tái tạo được.

## 11. Việc bắt đầu ngay ở lượt triển khai

**P0 → P1.1/P1.2/P1.3**, đồng thời D1/D1b/D2 nếu có nguồn lực. Sau đó P2/P3; chỉ khi đạt mới P4. G và U chạy theo phạm vi đã chốt, không kéo dài việc khóa F5. Không mở holdout trong giai đoạn sửa công cụ đo.
