> 🗂️ **TRẠNG THÁI: TÀI LIỆU LỊCH SỬ — 24/09/2026.**
> Bản đánh giá F1–F7 + chạy lại R1–R7 của lượt 21–22/09. Phần chẩn đoán vẫn dùng được; phần kết luận đã được thay bằng ledger.
> Nguồn kết luận hiện hành duy nhất là [`final_project_ai/docs/review_final_20260923/CLAIM_LEDGER.md`](/final_project_ai/docs/review_final_20260923/CLAIM_LEDGER.md).
> Không trích tài liệu này làm kết luận hiện hành; các số/bảng ở đây giữ nguyên theo run cũ
> để đối chiếu lịch sử, **không** được thay bằng số của run mới.

# Đánh giá hướng nghiên cứu và tính mới — 21/09/2026

## Phạm vi và trạng thái

Đánh giá trực tiếp có AI hỗ trợ, dựa trên các phần bản thảo và mã nguồn được dẫn dưới đây. Không sửa luận văn, không chạy lại huấn luyện, không chứng nhận production readiness. Đây không phải full peer review hay systematic review: agent phân tích lĩnh vực đã không chạy được do hạn mức; panel 5 reviewer độc lập và sprint-contract round chưa hoàn thành. **Cập nhật 22/09/2026:** đã bổ sung một lượt chạy lại mô hình và quét tài liệu (mục "Lượt chạy lại và đọc mở rộng"); lượt đó sửa cơ chế của F1, lượng hóa F2 và F4, và khoanh vùng F3. Không có điểm số hay đồng thuận giả lập. Áp dụng academic-paper-reviewer về bằng chứng và read-only, deep-research về xác minh nguồn, ai-mentor về tư vấn nghiên cứu. Nhận định ở lượt trước là giả thuyết cần kiểm tra, không phải đầu vào đã được xác nhận.

## Kết luận

Luận văn hiện tập trung vào phát hiện bất thường CSV và sinh báo cáo từ gói bằng chứng. Sản phẩm đang mở rộng sang đánh giá mức sẵn sàng dữ liệu theo ràng buộc hệ đích, có kiểm soát sửa và xuất bản. Hướng thứ hai phù hợp nhất với validation gate và AI-assisted data preparation trong bốn hướng người dùng nêu. Chưa có căn cứ trong mã/tài liệu đã kiểm tra để gọi đây là zero-downtime/trickle migration hoặc hypercare hậu di trú.

Giá trị triển khai là rõ, nhưng tính mới khoa học của readiness gate chưa được chứng minh. Khuyến nghị cho bản luận văn hiện có: củng cố đóng góp gói bằng chứng và đánh giá trung thực, giữ readiness là mở rộng trừ khi có thêm thí nghiệm độc lập. Không đổi toàn bộ trọng tâm chỉ vì ứng dụng vừa có nhiều tính năng hơn.

## Phát hiện có thể hành động

### F1 — Major: nhãn benchmark công khai không đồng nghĩa nhãn bất thường độc lập

- Bằng chứng bản thảo: `iuh_master_thesis/chapters/cash_results.tex:14–18` mô tả toàn bộ benchmark là nhãn thật, không phải nhãn sinh từ luật.
- Bằng chứng code: `csv_agent_platform/detection/notebooks/ablation_cash.py` import loaders từ `ablation_k256.py`. File sau tạo nhãn House Prices tại dòng 273–275 bằng quantile 0.95 của SalePrice; Condo tại 312–313 bằng hai đuôi giá; HDB tại 325 bằng quantile 0.95 của resale_price.
- Condo/HDB vẫn giữ cột giá trong dataframe trả về. Đây là bài toán nhãn do hàm của đặc trưng quan sát tạo ra; F1 gần 1 không xác nhận bất thường nghiệp vụ độc lập. Không suy diễn điều này thành tất cả benchmark vô giá trị. Credit Card chỉ có nhãn nguồn khi nhánh OpenML thành công; loader có fallback tổng hợp âm thầm nên không được xếp vào nhóm provenance đáng tin chỉ từ tên dataset (xem F1a). Forest Cover/Madelon là các bài toán phân loại được chuyển đổi, cũng cần mô tả đúng.
- Artifact `outputs/ablation_cash_results.json` khớp các số gần bão hòa của bảng CASH, nhưng kiểm tra này không thay thế replay với môi trường và hash dữ liệu đã cố định.
- **[22/09 — xem R1]** Thí nghiệm bỏ cột giá cho thấy F1 chỉ giảm 0,035 (Condo) và 0,080 (HDB), không sập. Cơ chế quy cho "vẫn giữ cột giá" là **sai địa chỉ** và khuyến nghị bỏ cột là **không đủ**; kết luận Major vẫn giữ.
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
- **[22/09 — xem R2]** Đã lượng hóa: độ lạc quan +0,1844 F1 (House Prices, test 219 dòng) xuống +0,0004 (Condo/HDB, test >5.000). Ưu tiên truy vết các bảng có tập kiểm tra nhỏ.
- Sửa: xác định bảng nào dùng script cũ; chọn ngưỡng trên validation rồi khóa trước test; lưu split IDs, hash dữ liệu, seed, version và metric script. Không tự sửa số trong luận văn khi chưa chạy lại.

### F2a — Test trong eval_set: cần tách giám sát khỏi tác động đến mô hình

Bổ sung 22/09/2026: hai runner XGBoost của `v11_benchmark_public_run.py:94,122` truyền test vào eval_set. Tuy nhiên, constructor và fit hiện có không bật `early_stopping_rounds` hoặc callbacks; số vòng được đặt bằng `n_estimators=400`. Vì vậy chưa có cơ sở gọi đây là một nguồn rò rỉ do early stopping độc lập đã xảy ra. Theo API XGBoost, eval_set dùng để đánh giá; early stopping cần được bật riêng. Nếu kết quả test được dùng để chọn iteration, hyperparameter hoặc lựa chọn thủ công thì mới có đường tác động đó; chưa có bằng chứng việc này trong script đã kiểm tra.

Khuyến nghị vẫn chuyển eval_set sang validation hoặc bỏ theo dõi test khi fit để giữ test kín. Không khẳng định việc đổi eval_set riêng lẻ sẽ làm số giảm. `ablation_k256.run_xgb:169–171` dùng validation cho cả eval_set và ngưỡng, đúng ở hai điểm này; không chứng nhận toàn bộ pipeline sạch từ hai dòng đó.

Nguồn kỹ thuật sơ cấp (không phải tài liệu nghiên cứu dùng để chứng minh tính mới): https://xgboost.readthedocs.io/en/release_2.0.0/python/python_api.html. Chưa replay môi trường XGBoost của run lịch sử.

### F3 — Major: mệnh đề khôi phục CASH bỏ sót nhiễu nền của chính cột bất thường

- Bằng chứng: `chapters/cash_theory.tex:102–130` định nghĩa s_hat = tau + b_a + noise_collision, nhưng cận xác suất chỉ dùng sigma*sqrt((p-1)/K).
- Phản ví dụ do người đánh giá suy ra: p=1, b_a phân phối chuẩn tâm 0 với phương sai dương. Khi đó epsilon_collision=0 và P(s_hat >= tau)=1/2; chọn t=2 thì mệnh đề đòi ít nhất 3/4. Mệnh đề sai như đang viết.
- **[22/09 — xem R3]** Mô phỏng 200.000 lượt xác nhận phản ví dụ (p=1 cho 0,4999 so với cận 0,75) và khoanh vùng sai ở p ≲ 5; đúng từ p ≳ 10. KDD HTTP (3 cột) nằm trong vùng sai. Phương án B kiểm bằng số thì đúng ở mọi p đã thử.
- Sửa lựa chọn A: phát biểu cận cho s_hat - b_a, tức chỉ nhiễu va chạm. Lựa chọn B: giữ s_hat và dùng phương sai toàn bộ sigma²[1+(p-1)/K] dưới các giả định độc lập đã nêu. Quy tắc K phải làm rõ sigma, xác suất sai số và loại nhiễu đang kiểm soát. Chưa chứng minh rằng sửa cận sẽ cải thiện detector.

- Bổ sung ký hiệu 22/09/2026: công thức đổi từ p (số cột số) sang N, rồi dùng N trong quy tắc K. Cần định nghĩa quan hệ p/N và giả định sigma cố định. Nếu N là tổng số cột và p ≤ N, biểu thức O(sqrt(N/K)) có thể là cận trên hợp lệ với sigma cố định; không tự động là sai toán học. Nhưng cận trên đó không đủ suy ra điều kiện cần K = Omega(N/tau²) khi chưa có p = Theta(N). Nên phát biểu điều kiện đủ theo p, sigma và mức sai số, tách khỏi lỗi bỏ b_a đã nêu.

### F4 — Major: tổng hợp sketch trong code khác đại lượng được lập luận

- Bằng chứng: `cash_theory.tex:93–98` nói tổng hợp các ước lượng; `src/data/cash_features.py:116–122,154–160` lại mean/median các vector bucket cùng chỉ số giữa những bảng có hàm băm khác nhau.
- Các bucket cùng chỉ số không nhất thiết chứa cùng đặc trưng giữa các bảng. Vì vậy không thể áp nguyên lập luận về trung bình các ước lượng tích trong sang median từng tọa độ của sketch. Đây là mismatch giữa chứng minh và hiện thực, không chỉ là chọn K chưa tốt.
- **[22/09 — xem R4]** Đã đo: median theo tọa độ sai gấp 3,1×–493× so với giải mã count-sketch đúng, và tăng d làm **xấu đi** (MAE 1,35 ở d=1 lên 3,57 ở d=5). Khớp với việc `signed_cs_d5` sập trên KDD (F1 = 0,073) trong chính bảng của luận văn. Đây là mục nên sửa trước tiên.
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

## Lượt chạy lại và đọc mở rộng — 22/09/2026

Lượt này đóng ba giới hạn đã khai báo: chạy lại mô hình, quét tài liệu sáu thư mục, mở rộng đối chiếu prior work. Môi trường: `csv_agent_platform/detection/.venv` (Python 3.12.13, scikit-learn 1.9.0, XGBoost 3.3.0, numpy 2.5.1, pandas 3.0.3). Script và kết quả thô lưu tại `runs/`. Mỗi thí nghiệm dùng lại chính loader và featurizer của repo (`ablation_k256.build_universal_features_parameterised`), chỉ đổi một biến mỗi lần.

**Tái lập nền.** Chạy lại cấu hình $K=64$ tái lập đúng các ô của Bảng CASH: House Prices 0,6667 (bản thảo 0,667), Condo 0,999, HDB 0,9996, Madelon 0,6713 (0,671), Arrhythmia 0,7586 (0,759). Vậy đường chạy CASH tái lập được, và các phát hiện dưới đây nói về chính giao thức đã sinh ra bảng đó.

### R1 — E1 bác bỏ một phần cơ chế mà F1 quy cho việc giữ cột giá

Giả thuyết ngầm của F1: F1 gần 1 trên Condo/HDB là do dataframe vẫn giữ cột giá. Kiểm bằng cách bỏ đúng cột sinh nhãn, giữ nguyên mọi thứ khác, ba hạt giống, ngưỡng chọn từ validation:

| Tập | Giữ nguyên | Bỏ cột sinh nhãn | Chênh |
|---|---|---|---|
| SG Condo Rental | 0,9993 | 0,9644 | −0,0349 |
| SG HDB Resale | 0,9995 | 0,9191 | −0,0804 |

**Bỏ cột giá không làm sập hiệu năng.** F1 vẫn ≥ 0,92. Vậy cơ chế chính không phải rò rỉ qua cột được giữ lại, mà là: nhãn được định nghĩa là phân vị của giá, còn giá lại dự đoán được gần như hoàn hảo từ các cột còn lại (diện tích, loại căn, thời hạn thuê, vị trí). Bài toán do đó là hồi quy giá trá hình, không phải phát hiện bất thường.

Hệ quả cho bản sửa: khuyến nghị "bỏ cột giá" của F1 là **không đủ**, và nếu làm một mình sẽ tạo cảm giác an toàn sai. Phải mô tả lại chính cơ chế sinh nhãn, và không dùng hai tập này làm bằng chứng tổng quát hóa nghiệp vụ dù đã bỏ cột. Điểm cốt lõi của F1 — nhãn là hàm của đặc trưng quan sát — vẫn đứng; chỉ phần quy cho cột giá là sai địa chỉ.

### R2 — E2 lượng hóa độ lạc quan của việc chọn ngưỡng trên test (F2)

Cùng một mô hình, cùng proba, chỉ đổi nguồn chọn ngưỡng. Trung bình ba hạt giống:

| Tập | Cỡ test | Ngưỡng từ validation | Ngưỡng từ test | Độ lạc quan |
|---|---|---|---|---|
| House Prices | 219 | 0,5318 | 0,7162 | **+0,1844** |
| Arrhythmia | 68 | 0,7269 | 0,7652 | +0,0383 |
| Madelon | 390 | 0,6638 | 0,6716 | +0,0078 |
| SG Condo Rental | 5.404 | 0,9993 | 0,9997 | +0,0004 |
| SG HDB Resale | 7.060 | 0,9995 | 0,9999 | +0,0004 |

Độ lạc quan **tỉ lệ nghịch với cỡ test và số ca dương**: gần như bằng 0 ở tập vạn dòng, nhưng tới +0,18 F1 ở House Prices (219 dòng test, khoảng 11 ca dương). Vì vậy F2 không phải lỗi hình thức: với các bảng dùng tập nhỏ, con số công bố có thể cao hơn hiệu năng thật gần 0,2 F1. Ưu tiên truy vết phải đặt vào các bảng chạy trên tập nhỏ trước.

### R3 — E3 khoanh vùng mệnh đề CASH sai, và vùng đó chạm dữ liệu thật

> ⛔ **ĐÃ RÚT / THU HẸP (24/09/2026).** Mô phỏng chỉ **bác bỏ** mệnh đề ở p nhỏ. Không dùng “đúng từ p ≳ 10” như chứng minh; phải sửa mệnh đề theo giả thiết (task D3).

Mô phỏng Monte Carlo 200.000 lượt đúng theo mô hình của Mệnh đề 3 ($\tau=3$, $\sigma=1$, $K=64$, $t=2$, cận đòi 0,75):

| $p$ (số cột số) | $\varepsilon_{\text{coll}}$ | Xác suất thực nghiệm | Mệnh đề đúng? |
|---|---|---|---|
| 1 | 0,000 | 0,4999 | **Sai** |
| 2 | 0,125 | 0,5988 | **Sai** |
| 5 | 0,250 | 0,6898 | **Sai** |
| 10 | 0,375 | 0,7626 | Đúng |
| 17 | 0,500 | 0,8218 | Đúng |
| 500 | 2,792 | 0,9696 | Đúng |

Phản ví dụ $p=1$ được xác nhận bằng số: 0,4999 so với 0,75 mà mệnh đề đòi. Mệnh đề sai trong vùng $p \lesssim 5$ và đúng từ $p \gtrsim 10$.

**Vùng sai không phải giả định suông:** KDD HTTP trong chính bảng CASH chỉ có 3 cột. Phương án B (dùng phương sai toàn bộ $\sigma^2[1+(p-1)/K]$) kiểm bằng số thì đúng ở mọi $p$ đã thử (xác suất ≥ 0,975 so với cận 0,75).

### R4 — E4 cho thấy tổng hợp sketch trong code không chỉ lệch lý thuyết mà còn phản tác dụng

> ⛔ **ĐÃ RÚT / THU HẸP (24/09/2026).** Tỷ lệ MAE 3,1×–493× là của **decoder count-sketch áp lên pooled embedding**, không phải phép đo trên detector thật. Không đọc thành “detector kém 493 lần”; xem R12 và task D4.

So sánh hai cách đọc tín hiệu cột bất thường ($\tau=4$, $K=64$): giải mã count-sketch đúng `median_t{ξ_t(a)·T_t[h_t(a)]}` so với median theo tọa độ như `_aggregate` đang làm.

| $p$ | $d$ | MAE giải mã đúng | MAE median theo tọa độ | Tỉ lệ |
|---|---|---|---|---|
| 17 | 5 | 0,008 | 3,981 | **493×** |
| 50 | 5 | 0,121 | 3,859 | 32× |
| 200 | 5 | 0,640 | 3,528 | 5,5× |
| 500 | 5 | 1,101 | 3,389 | 3,1× |

Median theo tọa độ cho MAE xấp xỉ 3,4–4,0 trong khi bản thân tín hiệu chỉ là 4,0 — tức gần như không khôi phục được gì. Tệ hơn, thêm bảng làm **xấu đi**:

| $p$ | MAE một bảng ($d{=}1$) | MAE median tọa độ $d$ bảng |
|---|---|---|
| 200 ($d{=}3$) | 1,354 | 3,150 |
| 200 ($d{=}5$) | 1,320 | 3,569 |
| 500 ($d{=}5$) | 2,174 | 3,389 |

Điều này mâu thuẫn trực tiếp với "Hệ quả (Count-sketch $d$ bảng)" ở `cash_theory.tex:92–98` vốn nói phương sai giảm theo $1/d$. Và nó **giải thích một hiện tượng đã có trong chính bảng của luận văn**: chế độ `signed_cs_d5` thua `signed` ở hầu hết tập, và sập hẳn trên KDD HTTP ($F_1 = 0{,}073$ tại $K=64$). Trước đây hiện tượng này được đọc như giới hạn của count-sketch; theo E4 nó khớp với dấu hiệu của lỗi tổng hợp trong hiện thực. Đây là bằng chứng gián tiếp, chưa phải phép đo trực tiếp trên pipeline thật.

### R5 — Provenance artifact: ba file trùng tên, chỉ một khớp bản thảo

| SHA-256 (16) | Kích thước | Sửa đổi | Đường dẫn |
|---|---|---|---|
| `82879f52c2c470d5` | 20.956 B | 13/07 19:21 | `csv_agent_platform/detection/outputs/ablation_cash_results.json` |
| `324bef23e690e119` | 20.963 B | 09/06 07:27 | `outputs/outputs/ablation_cash_results.json` |
| `f8481ddef6134f29` | 165 B | 09/06 06:43 | `outputs/ablation_cash_results.json` (rỗng) |

Hai file lớn có cùng dataset, cùng `n_samples`, nhưng khác toàn bộ metric. Đối chiếu Bảng CASH $K=64$: chỉ `82879f52…` khớp (KDD 0,9965 so với 0,997; Forest 0,9819 so với 0,982; Credit Card signed 0,8633 so với 0,863; House Prices 0,6667 so với 0,667); bản 09/06 lệch ở mọi ô. F1 và F1a phải trích kèm đường dẫn đầy đủ và hash này; nên dọn hai bản trùng.

### R6 — Quét tài liệu sáu thư mục: lỗi nhân đôi sang đề cương

Phạm vi quét: 358 tệp `.md` và 61 tệp `.tex` trong `iuh_master_thesis`, `csv_agent_platform`, `csv_agent_services`, `final_project_ai`, `de_cuong_IUH`, `chuyen_de_iuh`. Đây là quét theo mẫu mệnh đề mà F1–F7 đụng tới, không phải đọc tuần tự toàn bộ; các tệp không chứa mẫu nào chưa được đọc kỹ.

- `de_cuong_IUH/chapters/cash_theory.tex` **giống hệt từng byte** với bản trong luận văn. Mệnh đề 3 sai tồn tại ở **hai** tài liệu; bản sửa phải áp cho cả hai.
- `de_cuong_IUH/chapters/cash_results.tex:16–18` lặp nguyên claim "nhãn thật (không phải nhãn giả sinh từ luật)". F1 cũng có bề mặt sửa kép.
- Claim ensemble "có ý nghĩa thống kê" còn nằm ngoài các chương: `iuh_master_thesis/progress.md`, `plan/05_todo_khop_de_cuong.md`, `plan/06_ke_hoach_retrain.md`, `pipeline/stage2_5/stage2_5_gate.md`, `pipeline/stage2_5/phaseE_claims.md`. Cộng bốn vị trí trong chương đã kiểm kê, tổng bề mặt sửa của F6 là chín tệp.
- `de_cuong_IUH/defense/cash_rebuttal.md` và `defense/qa_prep_evidence_circularity.md` là tài liệu chuẩn bị bảo vệ về đúng chủ đề vòng tròn bằng chứng; chưa đọc kỹ trong lượt này, cần đối chiếu để tránh mâu thuẫn giữa bản sửa và lời đã chuẩn bị.

### R7 — Mở rộng đối chiếu prior work

Tìm ngày 22/09/2026, vẫn theo chính sách trích dẫn của workspace. Hai nguồn mới đạt tiêu chí, đã xác minh qua API:

4. **Ramos-Vidal, Cortiñas, Luaces, Pedreira, Saavedra Places, & Assunção (2025). Seamless Data Migration between Database Schemas with DAMI-Framework: An Empirical Study on Developer Experience. EASE 2025, 453–464.** DOI: https://doi.org/10.1145/3756681.3756947. Loại: conference paper (ACM). CrossRef đã xác minh. Hạng CORE của EASE [CẦN XÁC MINH] trong lượt này. Liên quan trực tiếp F7: đã có công trình học thuật về di trú dữ liệu giữa các lược đồ kèm đánh giá thực nghiệm, nên "readiness theo ràng buộc hệ đích" càng cần định vị hẹp hơn để nhận là mới.

5. **Wu, R., & Keogh, E. (2021). Current Time Series Anomaly Detection Benchmarks are Flawed and are Creating the Illusion of Progress. IEEE Transactions on Knowledge and Data Engineering.** DOI: https://doi.org/10.1109/TKDE.2021.3112126. Loại: journal article, Q1. CrossRef đã xác minh. Hỗ trợ trực tiếp F1 và F2: chỉ ra benchmark có nhãn dựng sẵn và chỉ số phụ thuộc ngưỡng đều tạo ảo giác tiến bộ. Nên trích khi mô tả lại giới hạn benchmark thay vì tự phát biểu lại.

Một kết quả liên quan khác, *We Need to Rethink Benchmarking in Anomaly Detection* (arXiv 2507.15584), hiện **không có `journal_ref`** trên arXiv nên là preprint; theo chính sách workspace, đánh dấu `[CẦN XÁC MINH]` và không dùng làm bằng chứng đã bình duyệt.

### Ảnh hưởng tới xếp hạng phát hiện

- F2 và F4 **mạnh lên** và đã có số: F2 tới +0,18 F1 trên tập nhỏ; F4 sai tới 493× và phản tác dụng khi tăng $d$.
- F3 **giữ nguyên mức**, nay có vùng sai xác định ($p \lesssim 5$) và chạm dữ liệu thật (KDD, 3 cột).
- F1 **đổi cơ chế, không đổi kết luận**: vẫn Major, nhưng cách sửa phải khác vì bỏ cột không giải quyết được.
- F5, F6, F7 chưa chạy lại được trong lượt này (F5 cần gọi API sinh báo cáo; F7 cần oracle độc lập), nên giữ nguyên trạng thái.

## Thứ tự xử lý

Cập nhật 22/09/2026 theo kết quả chạy lại; xếp theo tỉ lệ tác động trên công sức.

1. **Sửa `_aggregate` trong `cash_features.py` (R4).** Đây là lỗi hiện thực có số đo, không phải chuyện diễn đạt: sai tới 493× và tăng $d$ làm xấu đi. Sửa xong phải chạy lại toàn bộ chế độ `signed_cs_*`; nhiều khả năng các ô `cs_d3/cs_d5` trong bảng CASH sẽ đổi.
2. **Truy vết các bảng dùng ngưỡng-trên-test, ưu tiên tập nhỏ (R2).** Độ lạc quan tới +0,18 F1 khi test ~200 dòng, gần 0 khi test ~5.000 dòng. Bắt đầu từ House Prices, Arrhythmia và mọi bảng Chương 4 có tập kiểm tra nhỏ.
3. **Sửa Mệnh đề 3 ở cả hai tài liệu (R3, R6).** Dùng phương án B, nêu rõ vùng hiệu lực $p \gtrsim 10$, định nghĩa $p$ và $N$ tường minh. `cash_theory.tex` giống hệt nhau nên sửa một lần rồi đồng bộ.
4. **Mô tả lại cơ chế sinh nhãn Condo/HDB (R1) — không dùng cách bỏ cột.** Bỏ cột giá chỉ hạ F1 xuống 0,92–0,96, không giải quyết vấn đề. Phải khai báo nhãn là phân vị của giá và rút hai tập khỏi vai trò bằng chứng tổng quát hóa nghiệp vụ.
5. **Đồng bộ chín tệp chứa claim ensemble (R6)** và lập manifest nhãn/run/bảng kèm hash như R5.
6. Chạy phép đo đóng góp Evidence Packet với baseline tất định và đánh giá factuality độc lập (F5, chưa chạy được).
7. Chỉ đưa readiness lên đóng góp chính sau khi đối chiếu prior work rộng hơn — nay có thêm DAMI-Framework (R7) — và chạy B1–B3 với oracle độc lập.

## Giới hạn

Cập nhật 22/09/2026 sau lượt chạy lại. Trạng thái từng giới hạn đã khai báo ở bản đầu:

- **Chạy lại mô hình — đã làm một phần.** Đã tái lập đường CASH ở $K=64$ trên năm tập có dữ liệu cục bộ và chạy bốn thí nghiệm E1–E4 (`runs/`). **Chưa** chạy lại: Credit Card, KDD HTTP, Forest Cover, Gisette, Dorothea, Isolet (cần tải OpenML/sklearn fetch); toàn bộ bảng Chương 4 của pipeline V11; K-sweep đầy đủ. Số tái lập khớp bản thảo ở các ô đã thử, nhưng đây là tái lập trên môi trường **hiện tại** (scikit-learn 1.9.0, XGBoost 3.3.0), không phải replay môi trường lịch sử đã cố định.
- **Đọc sáu thư mục — đã quét, chưa đọc trọn.** Quét mẫu mệnh đề trên 358 `.md` + 61 `.tex`; các tệp không khớp mẫu vẫn chưa đọc kỹ. `de_cuong_IUH/defense/*.md` đã xác định là cần đọc nhưng chưa đọc.
- **Đối chiếu prior work — đã mở rộng, vẫn không đủ chứng minh phủ định.** Thêm hai nguồn đã xác minh (mục R7). Vẫn không tuyên bố bao quát Scopus/PRISMA, và không đủ căn cứ để nói không tồn tại nghiên cứu tương tự.
- **Panel 5 reviewer — vẫn chưa chạy.** Không có điểm số hay đồng thuận giả lập trong tài liệu này.
- **F5 và F7 — vẫn chưa có phép đo.** F5 cần gọi API mô hình sinh trên 70 báo cáo giữ kín; F7 cần oracle độc lập và hệ đích thử nghiệm. Không thứ nào chạy được trong lượt này.

Các kết quả phát hiện trong code là nhận định về code hiện có; quan hệ với từng run đã công bố phải xác minh qua provenance, nay đã có hash ở R5 cho artifact CASH nhưng chưa có cho các bảng khác. Thí nghiệm E3/E4 là mô phỏng theo mô hình giả định của chính bản thảo, không phải phép đo trên pipeline sản xuất: chúng chứng minh mệnh đề và cách tổng hợp sai ở đâu, không tự chứng minh mức thiệt hại cuối cùng lên F1 của detector. Không suy diễn có hành vi gian lận từ các lỗi phương pháp và mô tả này.
