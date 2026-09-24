# Rà soát cuối hồ sơ review và điều kiện triển khai

Audit bắt đầu 23/09/2026, chốt báo cáo 24/09/2026. **Kết luận: chấp nhận hướng triển khai có điều kiện; chưa cho chạy xác nhận.** Plan hiện hành của lượt này là `PLAN_FINAL.md` cùng thư mục. Đây là báo cáo riêng; chưa sửa bản thảo, code nghiên cứu, tiền đăng ký hay tài liệu review cũ.

## Phạm vi và bằng chứng

Đọc/đối chiếu assessment, TONG_HOP, novelty_map (đến I13 và các đoạn lặp cuối), hai báo cáo đính chính trước; FINDINGS/README gate; FINDINGS_F5/JUDGE_FINDINGS; PREREGISTRATION; mã runner/scorer/template, thiết kế expert/pairwise/task; code detector và các claim LaTeX liên quan. Ba tác vụ rà soát chuyên biệt hỗ trợ kiểm F5, detector và gate; **không phải panel năm reviewer độc lập hay quyết định chấp nhận bài báo**.

Đã chạy ca nhỏ xác định cho baseline template, gate no-op repair và xóa dòng; đối chiếu JSON của ba seed gate và ghép đúng 25 ca retest cap. Script `audit_probes.py` tái lập các phép kiểm này, `audit_evidence.json` lưu kết quả và hash snapshot của 51 file. Hash snapshot ghi nhận phiên bản, không có nghĩa từng dòng của mọi artifact đã được kiểm thủ công.

**Không mở HOLDOUT_CONFIRM.json; không sinh/chấm báo cáo holdout; không gọi mô hình; không chạy lại huấn luyện; không sửa artifact cũ.** Chỉ đọc báo cáo độc lập đã lưu, không tái thực hiện audit trên nội dung niêm phong. Chưa xác minh lại toàn bộ thư mục sáu project hoặc toàn bộ tài liệu học thuật; kết luận về novelty vẫn có điều kiện. File lịch sử không tự trở thành bằng chứng hiện hành vì có chữ “đã sửa”.

Đường dẫn nguồn trong báo cáo tính từ workspace `/Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace`; số dòng theo snapshot lượt này.

## 1. Điều đã xác minh và điều chưa đóng

| Hạng mục | Trạng thái được phép dùng |
|---|---|
| Template bỏ ratio chuỗi | Lỗi đã xác nhận; artifact có bản sửa đạt NumFid 1; **runner mới vẫn dùng hàm lỗi** |
| Evidence L1→L3 | Bằng chứng thăm dò trên 70 ca phát triển; thông tin sẵn có cũng tăng, chưa chứng minh riêng cách tổ chức EP |
| L3↔L4 tại context 8192 | Đánh đổi trên tập phát triển; NumFid chưa phân biệt được, không có thắng chung |
| Context mặc định↔8192 | Kết quả ủng hộ mạnh ảnh hưởng cấu hình context; chưa xác minh chính xác phần prompt bị mất hoặc mọi token giữ đủ |
| FT↔base cùng họ/kích thước | So sánh cấu hình; khác quantization, chưa cô lập LoRA |
| NumFid/hallu/Fmt | Proxy có giới hạn; không thay thế đánh giá đúng ngữ nghĩa/giá trị người dùng |
| Holdout mới | Có manifest và báo cáo không trùng nội dung; chưa mở; khả năng truy vết nhóm nguồn chưa đủ trong artifact hiện có |
| Tiền đăng ký | Có nhưng H2, p-value, arm/config và failure policy chưa đặc tả đủ để thực thi |
| Expert/user study | Công cụ nháp; chưa có kết quả người chấm; còn lỗi thiết kế/scorer |
| Detector F1–F4/F6 | Các vấn đề chính vẫn còn trong code/bản thảo, thêm preprocessing leakage Arrhythmia |
| Gate | Pilot tổng hợp có kết quả; hai lỗi correctness được tái hiện; chưa đủ làm đóng góp chính |
| Tính mới | Không nhận “đầu tiên”, “không tồn tại”, hay “đóng hẳn lĩnh vực”; cần đối chiếu đúng claim với prior work |

## 2. Các phát hiện chặn triển khai F5

### R01 — Bản sửa template chưa nằm trong đường chạy mới [P1]

`csv_agent_platform/generation/experiments/f5_evidence_ablation/ablate.py:119–120` vẫn bỏ ratio chuỗi; main gọi hàm này tại165. `fix_template.py:13–54` có det_v2 nhưng chỉ cập nhật artifact cũ. Probe cùng packet có `ratio='7% of total records'`: hàm live không in, bản patch có in.

Checkbox “template đã sửa” ở PREREG:56 đúng cho artifact, sai cho pipeline. Phải dùng một implementation chung và kiểm fixture chuỗi/số/thiếu. Bản det_v2 cũng còn tiếng Việt trong nhánh EN; không thể dùng nó làm đối chứng ngôn ngữ đã cân bằng. Det_v2 thay nhiều trường ngoài ratio (sample scores, số cross_analysis, khuyến nghị), nên so BLEU/ROUGE trước/sau det_v2 không được quy riêng cho việc sửa ratio; phép bổ sung chỉ ratio trước đây chỉ chứng minh thay đổi NumFid.

### R02 — Chưa có runner xác nhận bị khóa theo manifest [P1]

`ablate.py:134–143,156` vẫn tự lấy mẫu seed42 trên test; không đọc tập niêm phong. `--num-ctx` mặc định None tại152. Metadata92–94 chỉ có token counts/ms; không lưu context/options/model digest/done_reason. `latest` là tên có thể đổi, chưa phải định danh model bất biến.

Không được lấy việc có PREREGISTRATION.md thay cho điều kiện kiểm máy. Runner xác nhận phải từ chối chạy nếu chưa có lock hợp lệ, đọc đúng manifest, giữ ID trong output/score, kiểm đủ arm, lưu cấu hình và xử lý retry đã định trước. Dry-run chỉ trên ca phát triển hoặc fixture.

### R03 — H2 “không kém” mâu thuẫn với phép kiểm đã nêu [P1]

PREREG:36 đặt non-inferiority nhưng47–48 nói chưa có margin; bootstrap20.000 và Holm:43 chưa định nghĩa p-value. H1/H2 thiếu model cố định, H3 thiếu mức evidence; `num_predict` chưa có giá trị số.

Plan chọn sửa H2 thành **so sánh hai phía chênh lệch trung bình L4−L3**, không giữ “không kém”, không bịa margin. H1/H3 cũng chốt arm và thống kê trước. Sửa này phải ghi amendment trước mở holdout, không ghi như đã được tiền đăng ký từ đầu.

NumFid chính đo độ phủ số bắt buộc theo matcher; không được gọi kết quả H1–H3 là xác nhận “LLM hữu ích hơn template”. Template hiện không nằm trong ba giả thuyết, và bộ chấm chưa kiểm entity–attribute–value. Chỉ số phụ không được dùng thay thế H thất bại, nhưng vẫn phải báo mặt trái về unsupported claims.

### R04 — Tập không trùng hoàn toàn chưa đồng nghĩa độc lập theo nguồn [P2]

HOLDOUT_INDEPENDENCE.json chỉ lưu hash/bytes và năm counter; chưa có phương pháp grouping hoặc script tái lập toàn bộ các trục đã tuyên bố. `make_fresh_holdout.py:26–30` chỉ loại70 chỉ số; chưa thấy phần loại pilot/expert theo code này. Không kết luận holdout đã nhiễm, nhưng chưa đóng chứng cứ “mọi biến thể cùng nguồn”.

Cần lưu quy tắc canonicalization, source/generator identity, phạm vi artifact đã dùng, phiên bản splitter; nếu không có lineage thì ghi giới hạn thay vì xác nhận tuyệt đối. Audit kiểm máy có thể không lộ ca cho người phân tích; lần rà soát này không mở tập để làm lại.

### R05 — Scorer ghép cặp có nhánh có thể ghép sai [P2]

`analyze_two_questions.py:43–46` lọc missing hai bên riêng rồi zip: nếu missing khác case nhưng số lượng bằng nhau sẽ ghép sai. Chưa có bằng chứng kết quả n70 hiện tại bị lỗi này. Scorer xác nhận phải join theo case/condition rồi lọc nguyên cặp; từ chối duplicate và công bố missing/failure. `score_ablation.py` chỉ lưu thứ tự per_sample, làm provenance yếu khi đổi thứ tự output.

### R06 — Chẩn đoán context vẫn bị viết như đã biết cơ chế [P1 về claim]

novelty_map banner:21–23, tiêu đề I11 và I12 còn khẳng định mất Instruction; ngay trong I11 lại thừa nhận chưa xác định đoạn mất và chưa biết prompt đầy đủ ở8192. Các bảng n25 còn cạnh baseline n70; phần cuối lặp nguyên kết luận cũ.

Giữ kết luận can thiệp context cải thiện kết quả trên tập phát triển; cơ chế cụ thể chưa chứng minh. Đủ điều kiện pipeline là kiểm payload/tokenizer/serving với ngân sách input+output+special tokens, fail closed khi vượt, không chỉ hardcode8192. Không cần giải mọi cơ chế nội bộ để hoàn thành luận văn, nhưng phải bảo đảm phép chạy xác nhận thực hiện đúng can thiệp đã khai báo.

## 3. Expert/pairwise và nghiên cứu người dùng

### R07 — Bootstrap đếm lỗi dùng sai đơn vị [P1]

`expert_kit/score_pairwise.py:72–78` đưa mỗi lượt rater×case vào bootstrap; ca có hai người chấm được trọng số gấp đôi. Nhánh preference51–61 đã lấy trung bình theo ca. Cần aggregate hoặc resample cluster theo ca cho counts, giữ mọi rating trong ca. Kết luận về quần thể người chấm rộng hơn cần thiết kế khác; chỉ hai giám khảo không đủ tự suy rộng. Raw agreement67% không phải Krippendorff alpha.

### R08 — Bộ bằng chứng người chấm thiếu các trường báo cáo sử dụng [P1]

`build_pairwise.py:65–69` tạo slim packet bỏ samples/IDs/scores, còn template sửa in chúng (`fix_template.py:40–46`). Người chấm có thể đánh dấu một claim được nguồn đầy đủ hỗ trợ thành “thiếu căn cứ”. Cần cho người chấm đủ nguồn kiểm mọi claim; mức input của model và nguồn dành cho giám khảo phải khai báo tách biệt. Chuẩn hóa ngôn ngữ đối chứng; không dùng model name trong gói gửi giám khảo. Kit hiện lấy output phát triển chưa khóa, không phải đánh giá cấu hình cuối.

### R09 — User task chưa khả thi đúng như mô tả [P2]

`task_protocol.md:11–12` vẫn để một người gặp cùng ca cả hai điều kiện và nói Latin khử học; cân bằng thứ tự không xóa trí nhớ đáp án. Câu4 hỏi kiểm chứng từ packet nhưng phần16 chỉ cho xem report. Câu1 nghiêm trọng nhất chưa có quy tắc khi count/impact xung đột; câu3 chưa có khóa đáp án/luật đủ để tự chấm như đã hứa. Phân tích cần tính phụ thuộc theo người và ca.

Giữ đây là nhánh đánh giá riêng. RQ “giúp người dùng xử lý tốt hơn” chỉ được kết luận khi thực sự đo nhiệm vụ. Nếu không tuyển được người phù hợp, thu hẹp phạm vi báo cáo; không dùng điểm expert hay proxy để điền vào kết quả user study còn thiếu.

## 4. Detector/CASH: lỗi nghiên cứu và lỗi trong chính review

### R10 — Provenance, preprocessing, threshold chưa sửa [P1]

- `detection/notebooks/ablation_k256.py:256–267` vẫn fallback Credit Card10k nhãn ngẫu nhiên mà giữ tên dataset. Artifact284807 loại trừ fallback cụ thể đó, chưa là provenance đầy đủ.
- Condo/HDB:312–332 dùng nhãn phân vị giá, giữ giá trong X; `cash_results.tex:16–17` ở thesis/proposal vẫn gọi nhãn thực, không rule-generated. Bỏ giá rồi F1 vẫn cao không xóa vấn đề nhãn vòng tròn; chưa đo được giá liên tục “gần như hoàn hảo”.
- `ablation_k256.py:289–290` impute Arrhythmia bằng median trước split; CASH nhập lại loader này. Phải fit imputer trên train.
- `v11_benchmark_public_run.py:98,124,140,158,174` cả năm runner vẫn chọn threshold trên test. eval_set=test với số cây cố định không tự chứng minh leakage qua early stopping; không phục hồi claim F2a đã rút.

### R11 — Lý thuyết phải sửa theo giả thiết, không theo ngưỡng p từ mô phỏng [P1]

`iuh_master_thesis/chapters/cash_theory.tex:107,114–126` chứa nhiễu b_a nhưng cận bỏ phương sai của nó;133 còn K=Omega(N/tau²). Cần chọn biến cần ước lượng và phương sai đầy đủ hoặc chỉ phần collision, nêu rõ giả thiết. Simulation ở vài p không chứng minh “đúng từ p≥10”; không suy áp dụng cho KDD chỉ từ số cột. N/Nrows và p/Nfeatures phải định nghĩa rõ; phân biệt điều kiện đủ với cận cần thiết.

### R12 — Không dùng MAE decoder để kết luận detector sai493 lần [P1 về claim]

`cash_features.py:116–122,155–161` coordinate pooling không tương đương median các decoded estimates. Nhưng `runs/e3_e4_theory.py:70–75` áp decoder bảng0 vào pooled embedding; downstream XGBoost không dùng decoder này. Kết quả MAE chứng minh không thể viện cùng bảo đảm estimator, không chứng minh F1 mất mát bao nhiêu hoặc nguyên nhân KDD sập.

Plan tối thiểu: giữ single-table signed d=1 làm cấu hình chính, gắn d>1 pooling nhãn heuristic, rút bảo đảm không áp dụng. Không thay `_aggregate` bằng decoder p-chiều một cách máy móc vì phá thiết kế fixed-width. Nếu giữ claim thuật toán multi-table mới thì phải định nghĩa representation và chạy đối chứng cùng ngân sách; không nằm trong đường hoàn thành tối thiểu.

### R13 — Claim ensemble vẫn mâu thuẫn, review đếm sai file [P1]

Bốn vị trí active nằm trong **ba file** thesis: mo_dau59–61; chuong3:354,493; chuong5:36. Chương4:134–137,794 không hỗ trợ “mọi ensemble thua có ý nghĩa”. Inventory review liệt kê thêm năm file phụ, tức tám file khác nhau theo danh sách đó, không phải chín. Dùng occurrence manifest thay số đếm viết tay; log lịch sử đánh dấu superseded, không viết lại như kết quả cũ chưa từng tồn tại.

Không suy “threshold bias tỉ lệ nghịch cỡ test” từ vài dataset khác nhau. Mọi benchmark vẫn phải tuân thủ validation-only dù bias quan sát nhỏ.

## 5. Gate: hai phản ví dụ mới và giới hạn thiết kế

### R14 — “B3 bị hấp thụ vào B2f” bị phản ví dụ bác bỏ [P1]

Probe10 dòng có một lỗi currency; assess rồi tuyên bố dòng lỗi đã sửa nhưng giữ nguyên bytes:

| Gate | Cho xuất | Dòng kiểm lại |
|---|---|---:|
| B2f | **Có** | 0 |
| B3 | Không | 1 |
| B2′ | Không | 10 |

Oracle vẫn chặn. Nguyên nhân `gates.py:183–189` xóa cached issue theo claimed_fixes khi B2f không recheck; corpus hiện mọi sửa có claim đều đổi bytes nên không lộ khác biệt. Kết quả này bác bỏ tương đương tổng quát, **không chứng minh B3 mới về học thuật**.

### R15 — Xóa dòng gây crash [P1]

Assess10 dòng sạch, publish9 dòng: B2f ném IndexError. `gates.py:166–168,189` đưa index đã xóa vào scan rồi truy cập rows[i] ở69. Cần tách deleted/added/changed, quản lý cache theo row identity/position đã định nghĩa; thêm ca append/delete/reorder/no-op repair trước khi coi benchmark đủ miền sự kiện.

### R16 — “Constraint change” đang là thay đổi hiểu biết về hệ đích cố định [P1 về thiết kế]

`events.py:68–69` chỉ thay CONTRACT_V2; oracle `run_bench.py:25` chỉ nhận rows/transform, DDL không đổi. Kết quả không đo target constraint evolution. Plan tối thiểu đổi tên thành contract-knowledge update và thu hẹp claim; chỉ version DDL/oracle nếu thật sự chọn nghiên cứu hệ đích thay đổi.

### R17 — B0, oracle, mẫu số và chi phí cần báo đúng [P2]

- K0 cả ba seed: B0 unsafe0/64 nhưng false-block40/40. Nó là reject-all trên các ca ghi nhận vì nullable lease bị generic scanner đánh lỗi; không phải thành công an toàn hữu dụng.
- 16lossy+16email+6FK+6lease là44 lượt, có10 ca overlap nên34 ca. Corpus tự đặt tỷ lệ này, không phải prevalence thực tế.
- “104/104” chỉ là oracle khớp fixtures tác giả tạo. Tầng3 regex email chưa có nhãn chuyên gia; reconciliation mới kiểm hai tổng có thể bỏ lọt sai lệch bù trừ theo dòng/key.
- `run_bench.py:40–43` biến mẫu số0 thành1 khiến tỷ lệ thành0; phải trả NA. K là số sự kiện thử áp dụng, không phải số thay đổi hiệu lực; nhiều seed dùng vùng seed con trùng, không coi312 ca là độc lập ngoài miền.
- Coarse unsafe thấp hơn nhưng chặn nhầm cao hơn revalidation: trade-off, không dominance. Finegrain chậm hơn trong tải đã đo; không suy luôn thua hoặc không thể hòa vốn. Cost sweep cố định thứ tự, năm seed/tải không phải năm lặp cùng input; chỉ đo publish step, chưa end-to-end.

## 6. Tài liệu và tính mới

R18 [P1]: các đính chính chưa đồng bộ. TONG_HOP vẫn chọn A+B theo53% và “vài phần trăm”; FINDINGS_F5 vẫn baseline0.570, L4 tệ nhất, fine-tuning chỉ văn phong; README gate vẫn nói B3/chí phí chưa hiện thực. novelty_map có banner, I11/I12 và phần lặp cuối tự mâu thuẫn. assessment còn F5/F7 chưa đo; trạng thái cũ phải gắn mốc hoặc chuyển lịch sử.

R19 [P2]: nguồn hỗ trợ novelty chưa đủ để khẳng định không có công trình tương đương. Metadata CrossRef chỉ xác minh danh tính nguồn, không tự xác minh mọi claim về nội dung/hạng. Quy tắc workspace vẫn áp dụng: related work2021+, scholarly venue được phép, API/DOI/author/year, rank nếu xác định được; nguồn cũ chỉ foundational-definition. Không dùng blog/thống kê thương mại để chứng minh gap. Snapshot scan22/09 ghi10 bib key thiếu DOI/URL và25 misc/techreport: cần kiểm từng nguồn, không tự đồng nhất BibTeX type với chất lượng; đây là backlog lịch sử, không phải kết quả quét bibliographic mới hôm nay.

**Kết luận định vị:** hướng chính khả thi hiện tại là đánh giá báo cáo dựa trên bằng chứng và giới hạn của pipeline; detector cần bằng chứng/lý thuyết đúng để đỡ phần nền. Gate giữ dạng pilot phụ trợ. Không chuyển đề tài sang học constraint từ target rejection chỉ vì một tỷ lệ lỗi trong corpus chủ động thiết kế. Tính mới còn phải được diễn đạt theo đóng góp thực nghiệm có phạm vi và prior work, không theo việc đã sửa bug.
