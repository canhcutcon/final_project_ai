# Đánh giá hướng nghiên cứu và tính mới — 21/09/2026

## Phạm vi và trạng thái

Đánh giá trực tiếp có AI hỗ trợ, dựa trên các phần bản thảo và mã nguồn được dẫn dưới đây. Không sửa luận văn, không chạy lại huấn luyện, không chứng nhận production readiness. Đây không phải full peer review hay systematic review: agent phân tích lĩnh vực đã không chạy được do hạn mức; panel 5 reviewer độc lập và sprint-contract round chưa hoàn thành. Không có điểm số hay đồng thuận giả lập. Áp dụng academic-paper-reviewer về bằng chứng và read-only, deep-research về xác minh nguồn, ai-mentor về tư vấn nghiên cứu. Nhận định ở lượt trước là giả thuyết cần kiểm tra, không phải đầu vào đã được xác nhận.

## Kết luận

Luận văn hiện tập trung vào phát hiện bất thường CSV và sinh báo cáo từ gói bằng chứng. Sản phẩm đang mở rộng sang đánh giá mức sẵn sàng dữ liệu theo ràng buộc hệ đích, có kiểm soát sửa và xuất bản. Hướng thứ hai phù hợp nhất với validation gate và AI-assisted data preparation trong bốn hướng người dùng nêu. Chưa có căn cứ trong mã/tài liệu đã kiểm tra để gọi đây là zero-downtime/trickle migration hoặc hypercare hậu di trú.

Giá trị triển khai là rõ, nhưng tính mới khoa học của readiness gate chưa được chứng minh. Khuyến nghị cho bản luận văn hiện có: củng cố đóng góp gói bằng chứng và đánh giá trung thực, giữ readiness là mở rộng trừ khi có thêm thí nghiệm độc lập. Không đổi toàn bộ trọng tâm chỉ vì ứng dụng vừa có nhiều tính năng hơn.

## Phát hiện có thể hành động

### F1 — Major: nhãn benchmark công khai không đồng nghĩa nhãn bất thường độc lập

- Bằng chứng bản thảo: `iuh_master_thesis/chapters/cash_results.tex:14–18` mô tả toàn bộ benchmark là nhãn thật, không phải nhãn sinh từ luật.
- Bằng chứng code: `csv_agent_platform/detection/notebooks/ablation_cash.py` import loaders từ `ablation_k256.py`. File sau tạo nhãn House Prices tại dòng 273–275 bằng quantile 0.95 của SalePrice; Condo tại 312–313 bằng hai đuôi giá; HDB tại 325 bằng quantile 0.95 của resale_price.
- Condo/HDB vẫn giữ cột giá trong dataframe trả về. Đây là bài toán nhãn do hàm của đặc trưng quan sát tạo ra; F1 gần 1 không xác nhận bất thường nghiệp vụ độc lập. Không suy diễn điều này thành tất cả benchmark vô giá trị. Credit Card chỉ có nhãn nguồn khi nhánh OpenML thành công; loader có fallback tổng hợp âm thầm nên không được xếp vào nhóm provenance đáng tin chỉ từ tên dataset (xem F1a). Forest Cover/Madelon là các bài toán phân loại được chuyển đổi, cũng cần mô tả đúng.
- Artifact `outputs/ablation_cash_results.json` khớp các số gần bão hòa của bảng CASH, nhưng kiểm tra này không thay thế replay với môi trường và hash dữ liệu đã cố định.
- Sửa: lập label-provenance manifest từng tập; tách nhãn gốc, nhãn phân loại quy đổi, nhãn ngưỡng tổng hợp. Giữ các tập ngưỡng cho stress test, không dùng làm bằng chứng ground truth nghiệp vụ. Đánh giá claim tổng quát hóa trên tập có nhãn độc lập.

### F1a — Major: Credit Card âm thầm đổi sang dữ liệu tổng hợp nhưng giữ tên benchmark

Bổ sung ngày 22/09/2026 sau phản hồi của người dùng. Bản review đầu đã bỏ sót lỗi này mặc dù đoạn loader nằm trong mã đã đọc; câu diễn đạt cũ có thể khiến người đọc hiểu Credit Card đã được xác nhận đáng tin. Đây là thiếu sót của review.

- Bằng chứng: `csv_agent_platform/detection/notebooks/ablation_k256.py:255–268` bắt mọi `Exception`, kể cả lỗi tải, import hoặc chuyển kiểu nhãn; tạo 10.000 dòng ngẫu nhiên và nhãn Bernoulli ngẫu nhiên độc lập với đặc trưng theo cơ chế sinh. Không log/cảnh báo hoặc đổi tên: vẫn trả `Credit Card Fraud`.
- Hệ quả: benchmark có thể hoàn tất với một bài toán khác mà người đọc kết quả không biết. Đây là rủi ro provenance của loader, khác với việc chủ động dùng nhãn ngưỡng và khai báo rõ. Không có cơ sở định lượng để xếp hạng nó là rủi ro cao nhất trong toàn bộ project, nhưng đây là một đường thay thế nguồn dữ liệu âm thầm nghiêm trọng.
- Công bằng với run CASH đã báo cáo: kiểm tra lại `outputs/ablation_cash_results.json` ghi `n_samples=284807`, khớp chú thích `cash_results.tex`; nhánh fallback hiện tại chỉ tạo 10.000 dòng. Trong phạm vi loader và artifact đã kiểm tra, số dòng loại trừ việc run được ghi nhận này dùng chính fallback đó. Không có bằng chứng bảng CASH đã nhiễm fallback; cũng không cần suy ra rằng đã có một lần tải mạng thành công vì OpenML có thể đọc cache. Số dòng chưa thay thế hash và provenance manifest đầy đủ.
- Khuyến nghị sửa riêng: loader nghiên cứu phải báo lỗi/dừng hoặc đánh dấu dataset bị bỏ qua khi không lấy được dữ liệu; không thay bằng synthetic dưới cùng tên. Synthetic chỉ chạy bằng lựa chọn tường minh, có tên/ID riêng và cờ `is_synthetic`. Artifact cần lưu nguồn, OpenML data ID/version, hash, kích thước, nguồn nhãn và phiên bản loader; nếu bỏ qua dataset phải ghi rõ benchmark chưa đủ tập.
- Kiểm chứng cần có khi triển khai sửa: giả lập lỗi OpenML và xác nhận không sinh kết quả mang tên Credit Card thật; kiểm tra synthetic opt-in được đánh dấu riêng. Lượt đính chính này chỉ cập nhật review, chưa sửa loader hay chạy lại benchmark.

### F2 — Major, phạm vi cần truy vết: tối ưu ngưỡng trên test trong script benchmark công khai

- Bằng chứng: `notebooks/v11_benchmark_public_run.py:96–99` gọi `_find_best_threshold(proba, y_test)`; cả 5 runner đều chọn ngưỡng theo y_test: V11-XGBoost (98), XGBoost-Raw (124), Isolation Forest (140), LOF (158), COPOD (174, khi dependency khả dụng). Dòng 97 ghi rõ: `Calibrate threshold on test (optimistic — for fair comparison use val set in production)`. Comment xác nhận giao thức được ghi nhận ngay trong code; không suy luận từ đó về chủ ý của tác giả.
- Số F1 theo giao thức này là test-optimized, không phải hiệu năng của ngưỡng được chọn trước khi nhìn test. Việc áp dụng cho mọi mô hình không loại bỏ độ lạc quan của ước lượng.
- Giới hạn: chưa ánh xạ mọi bảng Chương 4 về đúng run/script. Không kết luận tất cả số F1 đều mắc lỗi này. CASH/K-sweep dùng `ablation_k256.run_xgb`, dòng 171 chọn ngưỡng từ validation: không có lỗi chọn ngưỡng trên test đó.
- Sửa: xác định bảng nào dùng script cũ; chọn ngưỡng trên validation rồi khóa trước test; lưu split IDs, hash dữ liệu, seed, version và metric script. Không tự sửa số trong luận văn khi chưa chạy lại.

### F2a — Test trong eval_set: cần tách giám sát khỏi tác động đến mô hình

Bổ sung 22/09/2026: hai runner XGBoost của `v11_benchmark_public_run.py:94,122` truyền test vào eval_set. Tuy nhiên, constructor và fit hiện có không bật `early_stopping_rounds` hoặc callbacks; số vòng được đặt bằng `n_estimators=400`. Vì vậy chưa có cơ sở gọi đây là một nguồn rò rỉ do early stopping độc lập đã xảy ra. Theo API XGBoost, eval_set dùng để đánh giá; early stopping cần được bật riêng. Nếu kết quả test được dùng để chọn iteration, hyperparameter hoặc lựa chọn thủ công thì mới có đường tác động đó; chưa có bằng chứng việc này trong script đã kiểm tra.

Khuyến nghị vẫn chuyển eval_set sang validation hoặc bỏ theo dõi test khi fit để giữ test kín. Không khẳng định việc đổi eval_set riêng lẻ sẽ làm số giảm. `ablation_k256.run_xgb:169–171` dùng validation cho cả eval_set và ngưỡng, đúng ở hai điểm này; không chứng nhận toàn bộ pipeline sạch từ hai dòng đó.

Nguồn kỹ thuật sơ cấp (không phải tài liệu nghiên cứu dùng để chứng minh tính mới): https://xgboost.readthedocs.io/en/release_2.0.0/python/python_api.html. Chưa replay môi trường XGBoost của run lịch sử.

### F3 — Major: mệnh đề khôi phục CASH bỏ sót nhiễu nền của chính cột bất thường

- Bằng chứng: `chapters/cash_theory.tex:102–130` định nghĩa s_hat = tau + b_a + noise_collision, nhưng cận xác suất chỉ dùng sigma*sqrt((p-1)/K).
- Phản ví dụ do người đánh giá suy ra: p=1, b_a phân phối chuẩn tâm 0 với phương sai dương. Khi đó epsilon_collision=0 và P(s_hat >= tau)=1/2; chọn t=2 thì mệnh đề đòi ít nhất 3/4. Mệnh đề sai như đang viết.
- Sửa lựa chọn A: phát biểu cận cho s_hat - b_a, tức chỉ nhiễu va chạm. Lựa chọn B: giữ s_hat và dùng phương sai toàn bộ sigma²[1+(p-1)/K] dưới các giả định độc lập đã nêu. Quy tắc K phải làm rõ sigma, xác suất sai số và loại nhiễu đang kiểm soát. Chưa chứng minh rằng sửa cận sẽ cải thiện detector.

- Bổ sung ký hiệu 22/09/2026: công thức đổi từ p (số cột số) sang N, rồi dùng N trong quy tắc K. Cần định nghĩa quan hệ p/N và giả định sigma cố định. Nếu N là tổng số cột và p ≤ N, biểu thức O(sqrt(N/K)) có thể là cận trên hợp lệ với sigma cố định; không tự động là sai toán học. Nhưng cận trên đó không đủ suy ra điều kiện cần K = Omega(N/tau²) khi chưa có p = Theta(N). Nên phát biểu điều kiện đủ theo p, sigma và mức sai số, tách khỏi lỗi bỏ b_a đã nêu.

### F4 — Major: tổng hợp sketch trong code khác đại lượng được lập luận

- Bằng chứng: `cash_theory.tex:93–98` nói tổng hợp các ước lượng; `src/data/cash_features.py:116–122,154–160` lại mean/median các vector bucket cùng chỉ số giữa những bảng có hàm băm khác nhau.
- Các bucket cùng chỉ số không nhất thiết chứa cùng đặc trưng giữa các bảng. Vì vậy không thể áp nguyên lập luận về trung bình các ước lượng tích trong sang median từng tọa độ của sketch. Đây là mismatch giữa chứng minh và hiện thực, không chỉ là chọn K chưa tốt.
- Sửa: xác định đại lượng cần ước lượng; nếu là tích trong thì tính ước lượng theo từng bảng rồi tổng hợp. Nếu cần embedding cho XGBoost, phải định nghĩa và đánh giá riêng biểu diễn đó, không tự chuyển bảo đảm của estimator thành bảo đảm của embedding.

### F5 — Major: đóng góp Evidence Packet chưa có phép đo trực tiếp

- Bằng chứng: `chapters/chuong4.tex:384–386` ghi Full EP vs Score-only chưa chạy; dòng 807 ghi chưa có phép đo chất lượng nghiệp vụ của báo cáo.
- Sửa: cố định detector, tập case và mô hình sinh; so sánh score-only, evidence đầy đủ, và template tất định. Đo sai số số liệu, phát biểu không có bằng chứng, bỏ sót và tính hữu ích bằng đánh giá độc lập. Nếu thêm raw-row baseline, cân bằng ngân sách token hoặc báo cáo rõ chênh lệch; ablate fine-tuning riêng khỏi input evidence.
- Cách phát biểu hiện tại: có đóng góp thiết kế giao diện giữa module; chưa chứng minh tăng factuality/giảm hallucination.

### F6 — Major: kết luận ensemble chưa nhất quán giữa các phần

- Bằng chứng: `chapters/mo_dau.tex` gọi kết quả âm có ý nghĩa thống kê; `chapters/chuong5.tex` phần nhận xét cũng nói mọi ensemble kém có ý nghĩa. Nhưng `chapters/chuong4.tex:137` ghi CI của delta F1 chứa 0, các ứng viên khác chưa chạy lại; `chuong5.tex` phần đóng góp lại diễn đạt đúng giới hạn này.
- Bổ sung kiểm kê 22/09/2026: cần sửa đủ bốn vị trí `mo_dau.tex:59–61`, `chuong5.tex:36`, `chuong3.tex:354`, `chuong3.tex:493`. Câu chữ không giống hệt nhau: dòng 354 nói “kết quả âm có ý nghĩa thống kê”, dòng 493 nói mọi tổ hợp kém có ý nghĩa. Bản review đầu chỉ chỉ ra hai vị trí nên chưa đủ làm danh sách sửa toàn văn.
- Sửa: thống nhất claim theo metric và run. F1 trung bình của XGBoost cao hơn không đồng nghĩa đã chứng minh ensemble kém hơn có ý nghĩa. Sự nhất quán của PR-AUC qua ba seed không tự thay thế kiểm định/CI.

### F7 — Major nếu dùng làm đóng góp chính: readiness có code nhưng chưa có kiểm chứng hiệu quả nghiên cứu

- Bằng chứng: `csv_agent_services/backend/app/services/assessment_gate_service.py` kiểm tra readiness/freshness, vẫn có legacy path; `assessment_candidate_service.py` đánh giá candidate; `assessment_artifact_service.py` gắn checksum với bytes xuất thực tế.
- `docs/evidence-claim-map-2026-09-17.md` chưa có benchmark false-ready/false-blocked nhãn độc lập. `docs/f08-2026-09-21-release-gate-evidence.md` kết luận chưa GO, ghi các ca chưa E2E và vấn đề uniqueness vừa sửa cần đánh giá lại dữ liệu thật.
- Sửa: đo quyết định xuất bản theo oracle độc lập, gồm sự kiện dữ liệu/constraint đổi sau đánh giá và sau phê duyệt. Manifest/checksum của file xuất không tự chứng minh dữ liệu đã được ghi đúng vào hệ đích.

## Đối chiếu tài liệu có giới hạn

Tìm kiếm có mục tiêu, không tuyên bố bao quát Scopus hay PRISMA. Ngày tìm 21/09/2026. Chuỗi truy vấn chính: DMN4DQ+ Optimising data repair; Automatic and Precise Data Validation for Machine Learning; data migration validation 2024 site:vldb.org; data cleaning large language models 2025 site:vldb.org. Tiêu chí: 2021–2026, bài báo học thuật đáp ứng chính sách workspace; workshop/preprint không tự được gán hạng của main conference; nguồn thương mại không dùng để chứng minh tính mới.

1. **Valencia-Parra, Á., Varela-Vaca, Á. J., Parody, L., Caballero, I., & Gómez-López, M. T. (2026). DMN4DQ+: Optimising data repair to enhance data usability. Expert Systems with Applications, 296, 129170.** DOI: https://doi.org/10.1016/j.eswa.2025.129170. Loại: journal article. Năm số báo 2026, online 2025. CrossRef đã xác minh; đã tải toàn văn từ kho Universidad de Sevilla và đọc phần phương pháp/giới hạn liên quan. Tạp chí Q1 theo dữ liệu SJR 2025 được IIT Comillas công bố; chưa đối chiếu trực tiếp JCR theo từng ngành.

   Bài báo đã có target usability, luật chất lượng và lựa chọn corrective actions theo chi phí bằng constraint optimisation. Do đó ý tưởng đánh giá khả năng sử dụng rồi sửa dữ liệu không đủ để nhận là mới. Phần 3.1 giới hạn biểu diễn trực tiếp ở single-tuple SAST/MAST nhưng cho phép tạo tuple qua join/aggregation: không nên tuyên bố bài hoàn toàn không xử lý được thông tin đa dòng. Snapshot freshness và phê duyệt theo bytes có thể là trục đối chiếu tiếp; chưa thấy trong phần đã đọc không có nghĩa chứng minh vắng trên toàn bộ lĩnh vực.

2. **Liu, Y., Pena, E. H. M., Santos, A., Wu, E., & Freire, J. (2025). Magneto: Combining Small and Large Language Models for Schema Matching. Proceedings of the VLDB Endowment, 18(8), 2681–2694.** DOI: https://doi.org/10.14778/3742728.3742757. Loại: journal article. CrossRef đã xác minh; đã đọc phương pháp từ PDF chính thức https://www.vldb.org/pvldb/vol18/p2681-freire.pdf. Quartile PVLDB [CẦN XÁC MINH], không thay bằng CORE của hội nghị.

   Magneto kết hợp SLM retrieval và LLM reranking. Vì vậy chuỗi exact/synonym/embedding/LLM của project là ứng dụng kỹ thuật hiện có trừ khi có cơ chế riêng và đối chứng thể hiện lợi ích. Không có phép so sánh project–Magneto trong lượt này.

3. **Shankar, S., Fawaz, L., Gyllstrom, K., & Parameswaran, A. G. (2023). Automatic and Precise Data Validation for Machine Learning. CIKM 2023, 2198–2207.** DOI: https://doi.org/10.1145/3583780.3614786. Loại: conference paper. CORE2023 A / ICORE2026 A, kiểm tra tại https://portal.core.edu.au/conf-ranks/25/. Metadata có log API cũ trong project; lần truy vấn CrossRef mới trả HTTP 429, trang ACM trả 403. Giữ là nguồn đối chiếu cần đọc đầy đủ, không sử dụng để khẳng định chi tiết cơ chế trong báo cáo này.

Nguồn hạng ESWA: https://www.iit.comillas.edu/publicacion/info_revista/en/60/Expert_Systems_with_Applications. Toàn văn DMN4DQ+: https://idus.us.es/server/api/core/bitstreams/ad3a26ee-c8cf-4baa-b7dc-263bf81aff17/content. Log mới lưu tại `crossref_verification.json`; lỗi xác minh được giữ nguyên, không đổi thành success.

## Định vị và thí nghiệm đề xuất

**Phương án ưu tiên cho luận văn hiện tại:** đóng góp hệ thống phát hiện bất thường CSV có giải thích và sinh báo cáo từ evidence có cấu trúc. Câu hỏi cần đo: cùng detector và mô hình sinh, evidence có cải thiện độ trung thực và hữu ích của báo cáo không? CASH là nhánh biểu diễn bổ trợ; cần sửa lý thuyết và nhãn benchmark trước khi dùng làm điểm mới trung tâm.

**Phương án mở rộng nếu chọn migration readiness:** thiết kế và đánh giá cơ chế quyết định xuất bản theo ràng buộc hệ đích, có kiểm tra tính hiện hành và bản sửa. Đây là giả thuyết đóng góp, không phải công bố đã mới.

RQ: các cơ chế trên có giảm quyết định READY sai mà không làm tăng quá mức quyết định chặn sai và công sức người dùng hay không?

| Đối chứng | Giữ cố định | Thành phần được thêm |
|---|---|---|
| B0: kiểm tra chất lượng chung | Dữ liệu và split | Chỉ kiểm tra chung |
| B1: target-aware validation | Cùng parser, luật target và ngân sách kiểm tra với B2/B3 | Ràng buộc đích |
| B2: version-aware gate | Như B1 | Kiểm soát freshness |
| B3: candidate-aware gate | Như B2 | Đánh giá bản sửa trước duyệt |
| B4: AI-assisted repair | Cùng B3 | AI đề xuất, kiểm soát phê duyệt giữ nguyên |

B1–B3 phải dùng cùng chất lượng detector/rule để tránh lợi ích chỉ đến từ thêm luật. Thêm baseline revalidation tất định tại thời điểm export/commit, vì freshness hash không mặc nhiên tốt hơn chạy lại validation. So sánh an toàn, độ trễ, chi phí và auditability.

Thiết kế tách theo file/schema/đơn vị nguồn trước khi tạo lỗi. Có dữ liệu sạch, lỗi tự nhiên và lỗi tiêm được công bố riêng. Oracle có ba phần: kết quả import vào hệ đích thử nghiệm; kiểm tra bảo toàn/ngữ nghĩa theo đặc tả độc lập; nhãn chuyên gia nếu mục tiêu là nghiệp vụ. Hệ đích nhận file không đủ xác nhận dữ liệu đúng nghĩa.

Định nghĩa metric trước khi đo:

- Unsafe-acceptance rate = số case không sẵn sàng nhưng bị cho qua / tổng case không sẵn sàng theo oracle.
- False-block rate = số case sẵn sàng nhưng bị chặn / tổng case sẵn sàng theo oracle.
- Đồng thời báo cáo số quyết định sai trong toàn bộ lượt READY để đo rủi ro người dùng; không nhập nhằng mẫu số với unsafe-acceptance rate.
- Thời gian thao tác, số sửa tay, latency, lỗi mới do sửa và tỷ lệ mất/đổi nghĩa giá trị.
- Unit phân tích là file/job hoặc sự kiện quyết định, không coi hàng triệu cell cùng file là mẫu độc lập. Dùng CI ghép cặp/cluster theo đơn vị độc lập; cỡ mẫu theo độ chính xác mong muốn, không tự chọn 30/100/200 vì tiện.

## Thứ tự xử lý

1. Sửa các phát biểu vượt bằng chứng và lập manifest nhãn/run/bảng; không cần thêm model.
2. Sửa mệnh đề CASH, xác định estimator/embedding và kiểm tra phản ví dụ trước thực nghiệm lớn.
3. Chạy phép đo đóng góp Evidence Packet với baseline tất định và đánh giá factuality độc lập.
4. Chỉ đưa readiness lên đóng góp chính sau khi đối chiếu prior work rộng hơn và chạy B1–B3 với oracle độc lập.

## Giới hạn

Chưa đọc trọn mọi tài liệu trong sáu thư mục; chưa chạy lại mô hình; chưa hoàn thành panel review; tìm kiếm tài liệu có mục tiêu, chưa đủ chứng minh không tồn tại nghiên cứu tương tự. Các kết quả phát hiện trong code là nhận định về code hiện có; quan hệ với từng run đã công bố phải xác minh qua provenance. Không suy diễn có hành vi gian lận từ các lỗi phương pháp và mô tả này.
