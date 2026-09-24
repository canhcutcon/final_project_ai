# Bản đồ khoảng trống — nhánh AI trong mapping/cleansing/ETL và Validation & reconciliation làm gate

Ngày: 22/09/2026. Chế độ: deep-research (lit-review + architect), chạy inline.
Phạm vi: tìm có mục tiêu qua OpenAlex + CrossRef (DBLP chặn bot; Semantic Scholar trả 429).
Log xác minh: `runs/crossref_verification_20260922.json`. Mọi nguồn dưới đây đã fetch qua CrossRef.

> **Cảnh báo phương pháp.** Đây không phải systematic review theo PRISMA. "Không tìm thấy" dưới đây nghĩa là *truy vấn có mục tiêu không trả về nguồn đạt chuẩn workspace*, không phải chứng minh không tồn tại.

---

> ## ⚠️ ĐÍNH CHÍNH 23/09/2026 — ĐỌC TRƯỚC PHẦN G VÀ H
>
> Một lượt phản biện độc lập đã tìm ra **năm lỗi thật** trong Phần G và H. Tôi đã kiểm chứng bằng số và
> **xác nhận cả năm**. Các kết luận dưới đây phải đọc kèm Phần I:
>
> 1. **Kết luận H4-4 ("LLM thắng template về độ trung thực") ĐÃ BỊ ĐẢO NGƯỢC.** Template của tôi có lỗi
>    `isinstance(ratio, (int,float))` trong khi dữ liệu lưu `ratio` dạng **chuỗi** (229/229 trường hợp),
>    nên nó không bao giờ in ratio. Sửa xong: NumFid **0,570 → 1,000**. Bootstrap có ý nghĩa **không**
>    cứu được lỗi baseline.
> 2. **Đối chứng fine-tuning ở H4-3 KHÔNG HỢP LỆ** — so Qwen2-1.5B fine-tuned với Qwen2.5-**3B**, khác
>    cả phiên bản lẫn kích thước.
> 3. **Quy kết L4 cho "packet dài" LÀ SAI HOÀN TOÀN** — nguyên nhân thật là harness của tôi không đặt
>    `num_ctx`, Ollama cắt mất khối `### Instruction`. Đặt `num_ctx=8192` thì Fmt hồi phục **0,343 → 1,000**.
>    Xem I11.
> 4. **Phần G gọi B2 là "bị áp đảo" là SAI** — đó là **đánh đổi**: tại K=1 coarse an toàn hơn 25,6 điểm %
>    nhưng chặn nhầm 76,9%.
> 5. **"Mọi gate đều lọt 34/64" là SAI** — B0 lọt **0/64**. Bảng 44 lượt lỗi thực chất là **34 ca**
>    (10 lượt chồng lấp). Và freshness giảm unsafe **29,5–77,9 điểm %**, không phải "vài phần trăm".

## Phần A — Bản đồ khoảng trống theo từng nhánh

### A1. Schema mapping — **ĐÃ ĐÓNG. Không còn chỗ cho tính mới ở mức luận văn.**

Chuỗi `exact → synonym → embedding → LLM` trong `mapping_matchers.py` / `mapping_embeddings.py` / `mapping_service.py` là **cascade đã được công bố và đánh giá**:

| Nguồn | Năm | Loại | Venue | Vì sao đe doạ |
|---|---|---|---|---|
| Zhang, Y., Floratou, A., Cahoon, J., Krishnan, S., Müller, A., Banda, D. et al. *Schema Matching using Pre-Trained Language Models*. ICDE 2023, 1558–1571. DOI 10.1109/ICDE55515.2023.00123 | 2023 | conference (CORE A*) | IEEE ICDE | Đúng kiến trúc: PLM cho schema matching, có đối chứng |
| Liu, Y. et al. *Magneto: Combining Small and Large Language Models for Schema Matching*. PVLDB 18(8), 2681–2694. DOI 10.14778/3742728.3742757 | 2025 | journal (PVLDB) | VLDB | SLM retrieval + LLM rerank — SOTA hiện tại |
| Narayan, A., Chami, I., Orr, L., & Ré, C. *Can Foundation Models Wrangle Your Data?* PVLDB 16(4), 738–746. DOI 10.14778/3574245.3574258 | 2022 | journal (PVLDB) | VLDB | Foundation model cho matching/cleaning — bài nền |

**Kết luận A1:** mô tả nhánh mapping là **ứng dụng kỹ thuật đã biết**. Nếu vẫn muốn claim, phải có cơ chế riêng + đối chứng trực tiếp với Magneto trên cùng benchmark — công sức ngang một bài hội nghị, không khả thi trong phạm vi còn lại.

### A2. Data cleansing / repair — **ĐÃ ĐÓNG. Mật độ công bố cao, có cả survey.**

| Nguồn | Năm | Loại | Venue |
|---|---|---|---|
| Zhu, J., Zhao, X., Sun, Y., Song, S., & Yuan, X. *Relational Data Cleaning Meets Artificial Intelligence: A Survey*. Data Science and Engineering 10(2), 147–174. DOI 10.1007/s41019-024-00266-7 | 2024 | journal (Q[CẦN XÁC MINH]) | Springer DSE |
| Naeem, Z., Ahmad, M., Eltabakh, M., Ouzzani, M., & Tang, N. *RetClean: Retrieval-Based Data Cleaning Using LLMs and Data Lakes*. PVLDB 17(12), 4421–4424. DOI 10.14778/3685800.3685890 | 2024 | journal (PVLDB) | VLDB |
| Ding, X., Qian, Z., Wang, H., Chen, S., Tang, Y., & Su, H. *UniClean: A Scalable Data Cleaning Solution for Mixed Errors*. PVLDB 18(11), 4117–4130. DOI 10.14778/3749646.3749681 | 2025 | journal (PVLDB) | VLDB |
| Reis, E., Abdelaal, M., & Binnig, C. *Generalizable Data Cleaning of Tabular Data in Latent Space*. PVLDB 17(13), 4786–4798. DOI 10.14778/3704965.3704983 | 2024 | journal (PVLDB) | VLDB |
| Valencia-Parra, Á. et al. *DMN4DQ+: Optimising data repair to enhance data usability*. ESWA 296, 129170. DOI 10.1016/j.eswa.2025.129170 | 2026 | journal (Q1) | Elsevier |
| Pereira, J., Fonseca, M., Lopes, A., & Galhardas, H. *Cleenex: Support for User Involvement during an Iterative Data Cleaning Process*. ACM JDIQ 16(1), 1–26. DOI 10.1145/3648476 | 2024 | journal | ACM JDIQ |

**Kết luận A2:** Có sẵn survey 2024 lập bản đồ toàn nhánh. Cleenex thậm chí đã chiếm trục "người dùng tham gia vòng lặp làm sạch". Không nên đặt tính mới ở đây.

### A3. Validation làm GATE — **MỞ MỘT PHẦN. Đây là chỗ duy nhất còn khe.**

Công trình gần nhất, **phải trích và phải phân biệt rõ**:

| Nguồn | Năm | Đối tượng được bảo vệ | Vì sao KHÔNG lấp khe |
|---|---|---|---|
| Lee, Chan, Fu et al. *Semantic Integrity Constraints: Declarative Guardrails for AI-Augmented Data Processing Systems*. PVLDB 18(11), 4073–4080. DOI 10.14778/3749646.3749677 | 2025 | **Đầu ra của LLM** trong semantic query (grounding/soundness/exclusion) | Ràng buộc trên output mô hình, không phải quyết định xuất bản dữ liệu sang hệ đích |
| Shankar, S., Li, H., Asawa, P. et al. *SPADE: Synthesizing Data Quality Assertions for LLM Pipelines*. PVLDB 17(12), 4173–4186. DOI 10.14778/3685800.3685835 | 2024 | **Đầu ra của LLM pipeline** | Sinh assertion từ lịch sử prompt; không mô hình hoá quyết định READY/BLOCKED |
| Shankar, S., Fawaz, L., Gyllstrom, K., & Parameswaran, A. *Automatic and Precise Data Validation for Machine Learning*. CIKM 2023, 2198–2207. DOI 10.1145/3583780.3614786 | 2023 | **Dữ liệu vào cho ML** | Phát hiện vi phạm, không có khái niệm hiệu lực theo thời gian của kết luận |
| Jackson, D., Groth, P., & Harmouch, H. *Fault Lines: Benchmarking the Impact of Label Data Quality on ML Robustness and Fairness*. PVLDB 19(4), 670–683. DOI 10.14778/3785297.3785308 | 2025 | **Chất lượng nhãn** | Là benchmark tác động, không phải gate |

**Khe còn lại (chưa thấy ai lấp, sau khi đã loại bốn công trình trên):**

1. **Quyết định READY/BLOCKED chưa bao giờ là đơn vị đo.** Toàn bộ nhóm trên đo ở mức ô/dòng/assertion. Không công trình nào báo cáo *unsafe-acceptance rate* và *false-block rate* ở mức **sự kiện quyết định**.
2. **Kết luận đánh giá chưa có khái niệm "hạn dùng".** Không thấy công trình nào mô hình hoá việc một verdict PASS **hết hiệu lực** khi dữ liệu, parser, hoặc ràng buộc đích đổi sau thời điểm đánh giá. Đây đúng là `Freshness.STALE` trong `readiness_policy.py`.
3. **Bản sửa ứng viên chưa được chấm trước khi duyệt.** Cleenex có vòng lặp người dùng nhưng không gắn với cổng xuất bản; DMN4DQ+ chọn hành động sửa theo chi phí nhưng không tái đánh giá trước phê duyệt.
4. **Verdict chưa bị ràng buộc vào đúng bytes xuất ra.** Đây là `assessment_artifact_service.py`.

### A4. Reconciliation nguồn↔đích — **TRỐNG Ở MỨC HỌC THUẬT, NHƯNG RỦI RO CAO**

Truy vấn "reconciliation source target record counts checksums integrity" và "ETL testing correctness verification data warehouse" trả về **không một nguồn nào đạt chuẩn workspace**: toàn SSRN posted-content, Zenodo, IJCESEN/IJISRT/JOCAAA và tạp chí không chỉ mục.

Hai cách đọc, phải nói thẳng cả hai:
- **(a) Khe thật:** cộng đồng CSDL coi đây là vấn đề kỹ thuật, chưa hình thức hoá.
- **(b) Khe giả:** vấn đề đã nằm dưới tên khác (integrity constraints, data provenance, ETL verification) và truy vấn của tôi trượt.

**Khuyến cáo:** KHÔNG đặt reconciliation làm đóng góp trung tâm. Trống ở mức học thuật thường có nghĩa hội đồng sẽ hỏi "vì sao chưa ai làm?" — và câu trả lời "vì nó là kỹ thuật thuần" sẽ hạ giá luận văn. Dùng reconciliation làm **oracle**, không làm **đóng góp**.

### A5. Benchmark false-ready / false-blocked — **KHÔNG TỒN TẠI**

Không tìm thấy benchmark công khai nào cho quyết định readiness hay migration validation. Hệ quả kép: (i) không có baseline để so — bất lợi; (ii) **tự xây benchmark trở thành đóng góp đứng được** — lợi thế, và là thứ vừa sức luận văn ThS.

---

## Phần B — Kết luận: nhánh nào khả thi

**Xếp hạng tính mới khả thi:**

| Nhánh | Tính mới | Công sức | Khuyến nghị |
|---|---|---|---|
| A3 — **Gate có hiệu lực theo phiên bản + chấm bản sửa trước duyệt** | Trung bình, phòng thủ được | Vừa | ✅ **CHỌN** |
| A5 — **Benchmark quyết định readiness** | Trung bình (chưa có) | Vừa | ✅ **CHỌN, gắn với A3** |
| A4 — Reconciliation | Cao trên giấy, rủi ro cao | Vừa | ⚠️ Dùng làm oracle |
| A1 — Mapping | ≈ 0 | Rất cao | ❌ Kỹ thuật ứng dụng |
| A2 — Cleansing | ≈ 0 | Rất cao | ❌ Kỹ thuật ứng dụng |

**Phát biểu đóng góp nên dùng (hẹp, phòng thủ được):**

> Luận văn hình thức hoá **quyết định xuất bản dữ liệu** thành một bài toán đo lường được, trong đó kết luận đánh giá có **hiệu lực gắn với phiên bản dữ liệu và ràng buộc đích**, và bản sửa ứng viên được **tái đánh giá trước khi phê duyệt**; kèm benchmark đầu tiên đo *unsafe-acceptance* và *false-block* ở mức sự kiện quyết định.

Ba chữ phải tránh vì đã có người làm: "declarative guardrails" (SIC), "data quality assertions" (SPADE), "precise data validation" (Shankar 2023).

---

## Phần C — RQ và thiết kế thí nghiệm

### RQ chính
Việc gắn hiệu lực của kết luận đánh giá vào phiên bản dữ liệu/ràng buộc (freshness-aware gate) và tái chấm bản sửa trước phê duyệt có làm **giảm tỉ lệ chấp nhận không an toàn** mà **không làm tăng quá mức tỉ lệ chặn sai** và công sức người dùng, so với đánh giá một lần tại thời điểm assessment hay không?

### RQ phụ
- RQ2: Độ lớn của hiệu ứng phụ thuộc thế nào vào **độ dài cửa sổ lệch** (số sự kiện thay đổi giữa lúc đánh giá và lúc xuất)?
- RQ3: Tái đánh giá theo hash phiên bản có rẻ hơn **chạy lại validation tất định** tại thời điểm export mà vẫn an toàn tương đương không?

### Thang đối chứng (mỗi bậc thêm đúng MỘT cơ chế)

| Bậc | Giữ cố định | Thêm vào |
|---|---|---|
| B0 | Dữ liệu, split, ngân sách kiểm tra | Chỉ kiểm tra chất lượng chung |
| B1 | Như B0 | Ràng buộc theo lược đồ đích |
| B2 | Như B1 | **Freshness**: verdict hết hiệu lực khi phiên bản đổi |
| B3 | Như B2 | **Candidate re-scoring** trước phê duyệt |
| B4 | Như B3 | AI đề xuất sửa (kiểm soát phê duyệt giữ nguyên) |
| **B2′** | Như B1 | **Revalidation tất định tại export** (đối chứng quan trọng nhất) |

⚠️ **B2′ là baseline sống còn.** Nếu chạy lại validation lúc export cũng an toàn ngang B2 mà rẻ hơn, thì cơ chế freshness **không có đóng góp** — phải báo cáo trung thực kết quả này nếu xảy ra.

### Oracle độc lập — ba tầng
1. **Import thật vào hệ đích thử nghiệm** (Postgres/MySQL có ràng buộc đầy đủ): nhận được hay bị từ chối.
2. **Kiểm tra bảo toàn ngữ nghĩa** theo đặc tả độc lập: reconciliation nguồn↔đích (đếm bản ghi, tổng kiểm cột tiền, toàn vẹn tham chiếu). *Đây là chỗ A4 được dùng — làm oracle, không làm claim.*
3. **Nhãn chuyên gia** cho phần nghiệp vụ.

⚠️ Hệ đích **nhận** file không đủ kết luận dữ liệu đúng. Phải có cả ba tầng.

### Thao tác thực nghiệm mới (chính là điểm mới)
Tiêm **sự kiện thay đổi sau đánh giá**, trước xuất bản, theo bốn loại: (i) dữ liệu nguồn đổi; (ii) ràng buộc đích đổi; (iii) cấu hình parser/encoding đổi; (iv) bản sửa được áp một phần. Biến điều khiển: **độ dài cửa sổ lệch** (0, 1, 5, 20 sự kiện). B0/B1 mù với mọi loại; B2 bắt được (i)–(iii); B3 bắt thêm (iv).

### Metric — định nghĩa TRƯỚC khi đo
- **Unsafe-acceptance rate** = số ca không sẵn sàng theo oracle nhưng được cho qua / tổng ca không sẵn sàng.
- **False-block rate** = số ca sẵn sàng nhưng bị chặn / tổng ca sẵn sàng.
- Báo cáo **thêm** tỉ lệ quyết định sai trên toàn bộ lượt READY (mẫu số khác, không được nhập nhằng).
- Chi phí: thời gian thao tác, số sửa tay, latency, lỗi mới sinh do sửa.
- **Đơn vị phân tích là sự kiện quyết định** (file/job), KHÔNG phải ô dữ liệu. Dùng CI ghép cặp/cluster theo đơn vị nguồn. Cỡ mẫu tính theo độ chính xác mong muốn.

### Bẫy phải tránh (rút từ chính lỗi đã tìm thấy trong luận văn hiện tại)
1. **Không sinh nhãn oracle từ chính bộ luật của gate** — đó đúng là lỗi F1 lặp lại ở quy mô mới.
2. **Chọn ngưỡng trên validation, khoá trước khi chạm test** — lỗi F2, đã đo được +0,18 F1 khi tập nhỏ.
3. **Tách theo file/schema/nguồn TRƯỚC khi tiêm lỗi**, tránh rò rỉ cụm.
4. B1–B3 phải dùng **cùng chất lượng luật**, nếu không lợi ích chỉ đến từ việc thêm luật.
5. Công bố riêng ba loại dữ liệu: sạch, lỗi tự nhiên, lỗi tiêm.

---

---

## Phần D — Đọc toàn văn SIC và SPADE: khe SỐNG SÓT

Bổ sung 22/09/2026. Bản đầu chỉ đọc abstract qua CrossRef và đã tự đánh dấu đó là giới hạn. Nay đã tải và đọc toàn văn hai bài quyết định (bản arXiv của chính hai công bố PVLDB):

- SIC → arXiv:2503.00600v3, 11 trang (PVLDB 18(11), 4073–4080)
- SPADE → arXiv:2401.03038v2 (PVLDB 17(12), 4173–4186)

Văn bản đã trích lưu tại `runs/sic2.txt` và `runs/spade2.txt` để kiểm chứng lại.

### D1. Phép thử từ khoá trên toàn văn

Đếm số lần xuất hiện trong **toàn bộ** bài (không chỉ abstract):

| Khái niệm | SIC | SPADE |
|---|---|---|
| stale / staleness | 0 | 0 |
| freshness | 0 | 0 |
| revalidate / re-validation | 0 | 0 |
| invalidate | 0 | 0 |
| expire | 0 | 0 |
| publish | 0 | 0 |
| export | 0 | 0 |
| approve / approval | 0 | 0 |
| reconcile / reconciliation | 0 | 0 |
| migrate / migration | 0 | 0 |
| target schema | 0 | 0 |
| gate (nghĩa cổng) | **0** | 0 |

Ghi chú quan trọng: `grep` thô báo SIC có 8 lần "gate", nhưng kiểm ngữ cảnh thì **cả 8 đều là chuỗi con** của *aggregate*, *aggregates*, *aggregated*, *propagate*. Không có lần nào mang nghĩa cổng. Tương tự, SPADE có 42 lần "version" nhưng phân tích cụm cho thấy đó là *prompt version* (20 lần) và *template version* — phiên bản của **prompt**, không phải phiên bản của **dữ liệu**.

### D2. Đối tượng thật sự của từng bài

- **SPADE** (§Introduction): bài toán là bắt lỗi trong **đầu ra do LLM sinh ra** ở các pipeline như tóm tắt tài liệu, trích xuất thực thể, soạn email, viết blog. Related work gồm bốn nhánh: prompt engineering, đánh giá ML/LLM, LLM cho kiểm thử phần mềm, kiểm thử ML pipeline. Không nhánh nào chạm ETL, di trú, hay cổng xuất bản.
- **SIC** (§7 Related Work): truy vết dòng dõi Codd → INGRES/System R → model assertions → LLM guardrails (Guardrails AI, LangChain, SPADE, EvalGen). Toàn bộ nằm trong tuyến "ràng buộc trên output mô hình".
- **SIC §6 Enterprise-wide Constraints** — mục duy nhất nghe như có thể chạm liên hệ thống — thực chất bàn về *constraint store* để tái dùng và phân tích xung đột ràng buộc **giữa các truy vấn** trong tổ chức. Vẫn trong miền truy vấn LLM.

### D3. SIC là **vision paper**, không phải bài thực nghiệm

Nguyên văn §1: *"This paper presents our vision for SICs and sketches a general framework"*. Cấu trúc mục: Abstract → Introduction → System Architecture → Constraint Specification → Constraint Enforcement → Observability → Enterprise-wide Constraints → Conclusions. **Không có mục Evaluation hay Experiments.** Từ "vision" xuất hiện 4 lần.

Hệ quả cho định vị: SIC **đặt vấn đề** chứ chưa **đóng** nó bằng số liệu. Một luận văn thực nghiệm không bị SIC chặn đường; nhưng SIC đã chiếm hai nhãn — *declarative guardrails* và *observability* — nên cách gọi tên đóng góp phải tránh hai cụm đó.

### D4. Kết luận cập nhật về khe

Khe ở A3 **sống sót sau khi đọc toàn văn**, và mạnh hơn ước lượng ban đầu:

1. Hai công trình gần nhất bảo vệ **đầu ra mô hình**, không phải **quyết định xuất bản dữ liệu** — xác nhận bằng toàn văn, không chỉ abstract.
2. Không bài nào có khái niệm **hiệu lực theo thời gian** của một kết luận đánh giá.
3. Bài mạnh hơn trong hai bài (SIC) là **vision paper chưa có thực nghiệm**.

Rủi ro còn lại, phải nói rõ: (a) chưa quét được SIGMOD/EDBT/ICDT vì DBLP chặn bot, đây vẫn là lỗ hổng tìm kiếm thật; (b) SIC trích 66 tài liệu, tôi mới đọc phần Related Work chứ chưa truy từng tài liệu được trích — nếu một trong số đó lấp khe thì kết luận này phải sửa; (c) kết luận "không ai làm" vẫn là kết quả tìm kiếm có mục tiêu, không phải chứng minh phủ định.

---

## Phần E — Kiểm chứng kết quả Perplexity (22/09/2026): khe HẸP LẠI

Người dùng chạy ba prompt Perplexity và gửi kèm một PDF. Tôi xác minh lại **mọi** DOI qua CrossRef và arXiv API. Perplexity mắc **hai lỗi nghiêm trọng, cả hai đều theo hướng dọn đường sai** — tức kết luận "khe còn trống" của nó lạc quan hơn sự thật.

### E1. Mối đe doạ số 1 — bị Perplexity phân loại sai thành "không bình duyệt"

**Shraga, I., Eshel, R., & Gorelik, L. (2026). Approved Too Late: Verdict Staleness in LLM-Guarded Self-Adaptive Systems.** arXiv:2608.26306. Trường `arxiv:comment` ghi rõ: **"Accepted at the 2026 IEEE International Conference on Autonomic Computing and Self-Organizing Systems (ACSOS 2026)"**. Perplexity ghi "not peer-reviewed (arXiv preprint), DOI pending" — **sai**. Đây là bài đã được nhận tại hội nghị IEEE. Hạng CORE của ACSOS `[CẦN XÁC MINH]` (portal CORE render bằng JS, không tra được tự động). Chưa có bản ghi CrossRef vì kỷ yếu chưa xuất bản.

Nội dung abstract, đọc nguyên văn:

- Đặt vấn đề là **TOCTOU** (time-of-check to time-of-use): một phê duyệt đúng lúc kiểm tra nhưng đã cũ lúc thi hành.
- Nghiên cứu **verdict freshness**: verdict còn hiệu lực khi được dùng hay không.
- Đề xuất **Freshness-Bounded Shield**, ước lượng **validity horizon** của từng phê duyệt.
- Đánh giá bằng **oracle-labeled approval expiry** trên quỹ đạo ghi lại; giảm tỉ lệ hết hạn từ 3,4–24,7% xuống 0–1,8%.
- Phát biểu **freshness contract**: mọi phê duyệt phải đúng lúc kiểm tra **và** còn hiệu lực lúc sử dụng.

**Đánh giá trung thực về mức chồng lấn.** Về cấu trúc khái niệm, đây gần như **đúng khung** mà mục A3/D4 đề xuất: verdict có hạn dùng, phê duyệt có thể hết hiệu lực giữa kiểm tra và sử dụng, đo bằng oracle ở mức sự kiện quyết định. Khác biệt duy nhất mà cũng là khác biệt thật: **miền ứng dụng**. Bài kia là guardrail LLM cho hệ tự thích nghi (bước mô phỏng, động lực học đối tượng điều khiển); luận văn là cổng xuất bản dữ liệu (phiên bản dữ liệu/ràng buộc, hệ đích).

Hệ quả bắt buộc cho cách phát biểu đóng góp:

- Claim nguyên văn ở Phần D **vẫn đúng chữ** (không phải *data-validation verdict*), nhưng **tính mới khái niệm đã giảm rõ rệt**. Không còn được nói "chưa ai mô hình hoá hiệu lực theo thời gian của một kết luận kiểm tra".
- Phải định vị lại thành: **chuyển một khung đã có (freshness contract / TOCTOU trên verdict) sang miền cổng xuất bản dữ liệu, với oracle và thao tác thực nghiệm của miền đó**. Đây vẫn là đóng góp hợp lệ ở mức ThS, nhưng là đóng góp *chuyển miền có kiểm chứng*, không phải *phát kiến khung*.
- Ba nhãn nữa nay đã có chủ, không được dùng làm tên đóng góp: **verdict freshness**, **freshness contract**, **validity horizon**.
- Mặt lợi: bài này cung cấp sẵn **bộ từ vựng đo lường** (verdict-change rate, approval-expiry rate, validity horizon) có thể mượn kèm trích dẫn, và chứng minh bài toán là công bố được. Khung TOCTOU cũng là cách gọi tên vấn đề sắc hơn hẳn cách gọi "freshness" chung chung.

### E2. Hai công trình bình duyệt khác bị Perplexity bỏ sót hoặc phân loại sai

| Nguồn | Thực tế đã xác minh | Perplexity nói |
|---|---|---|
| **Auto-Validate by-History: Auto-Program Data Quality Constraints to Validate Recurring Data Pipelines.** KDD 2023, 4991–5003. DOI 10.1145/3580305.3599776 | **KDD 2023, CORE A\*** (arXiv comment: "full version of a paper accepted to KDD 2023") | "Not peer-reviewed (arXiv preprint)" — **sai** |
| **Auto-Validate: Unsupervised Data Validation Using Data-Domain Patterns Inferred from Data Lakes.** SIGMOD 2021, 1678–1691. DOI 10.1145/3448016.3457250 | **SIGMOD 2021, CORE A\*** | Không nhắc tới |

Cả hai đều là **tự động sinh ràng buộc chất lượng dữ liệu cho pipeline định kỳ** — đúng miền dữ liệu, đúng bài toán validation, tại hai hội nghị A\*. Bắt buộc trích ở related work. AVH đặc biệt gần vì nó học ràng buộc từ **lịch sử các lần chạy trước**, tức đã chạm tới chiều thời gian của validation, dù không mô hình hoá hiệu lực của verdict.

### E3. Bài MDPI người dùng gửi — mối đe doạ thật cho nhánh reconciliation (A4)

**Netinant, P., Saengsuwan, N., Rukhiran, M., & Pukdesree, S. (2023). Enhancing Data Management Strategies with a Hybrid Layering Framework in Assessing Data Validation and High Availability Sustainability.** Sustainability, 15(20), 15034. DOI 10.3390/su152015034. CrossRef đã xác minh. Loại: journal article, MDPI, Q[CẦN XÁC MINH].

Vì sao nó quan trọng: đây là công trình bình duyệt **gần nhất** với nhánh reconciliation, và Perplexity **không** tìm ra nó trong prompt 2 — bằng chứng trực tiếp rằng kết luận "không tồn tại" của Perplexity là lỗi phủ sóng tìm kiếm, không phải chứng minh phủ định.

Bài này **có**: tám chỉ số đối soát nguồn↔đích (DCR, DIS, DAI, ER, DCP, DMR, DCI, DAP) cộng precision/recall; case study thật 222 bảng, 300.550 bản ghi, 4,65 GB; so sánh trickle vs zero-downtime vs hybrid; kiểm tra consistency/integrity/constraint bằng Python (Hình 5). Nó cũng chính là khung tham chiếu cho cụm "trickle / zero-downtime" mà mục Kết luận của bản đánh giá đầu đã nghi ngờ.

**Nhưng đánh giá của nó suy biến, và đây là chỗ luận văn chen vào được.** Đọc Bảng 8: **mọi** phòng ban, **mọi** vòng đều cho DIS = DAI = DCI = DAP = 100% và ER = 0%, SR = 100%. Cụ thể:

1. **Không có oracle độc lập.** Các hàm `check_consistency`, `check_integrity`, `check_constraints` của chính công cụ vừa thực hiện di trú vừa phán xử di trú đúng. Đây đúng là lỗi đánh giá vòng tròn mà F1 của luận văn mắc phải, ở quy mô khác.
2. **Không có ca âm.** Không tiêm lỗi, không có ca lẽ ra phải bị chặn. Vì vậy precision/recall được định nghĩa ở Bảng 5 nhưng **không bao giờ đo được** — mẫu số bằng 0.
3. **Baseline sụp một cách khó tin.** Bảng 7 ghi zero-downtime "Failure occurs" ở **mọi** phòng ban, 0 bản ghi, không chẩn đoán nguyên nhân. Bảng 6 ghi ba giải pháp công nghiệp đều "hệ thống không vận hành được", cũng không có số.
4. **Lệch venue.** *Sustainability* là tạp chí môi trường/bền vững; một bài hệ CSDL ở đó khó đã qua tay phản biện chuyên ngành CSDL.

**Kết luận E3:** A4 (reconciliation là khoảng trống) **phải hạ cấp từ "trống" xuống "đã có công trình, nhưng đánh giá không đứng vững"**. Đây thực ra là vị thế **tốt hơn** cho luận văn: có prior work để so, và có lý do phương pháp luận rõ ràng để làm lại — oracle độc lập, ca âm, tỉ lệ lỗi ở mức quyết định. Trích Netinant et al. làm mốc, chỉ ra ba điểm 1–3 ở trên là giới hạn cần khắc phục.

### E4. Khoảng trống benchmark (A5) — SỐNG SÓT, được củng cố

Prompt 3 không tìm được benchmark nào gán nhãn quyết định ready/not-ready ở mức file/job. Các nguồn gần nhất đã xác minh đều đo thứ khác:

| Nguồn | Đã xác minh | Đo cái gì |
|---|---|---|
| Data Readiness Report. IEEE SMDS 2021. DOI 10.1109/SMDS53860.2021.00016 | ✅ | Khung tài liệu mô tả chất lượng/nguồn gốc, không phải nhãn quyết định |
| DREAMER. BMC Med Inform Decis Mak 2024. DOI 10.1186/s12911-024-02544-w | ✅ | Chấm điểm readiness cho ML, không công bố corpus có nhãn quyết định |
| Schema validation and evaluation framework. Scientific Reports 2026. DOI 10.1038/s41598-026-45554-6 | ✅ | Chất lượng schema trích xuất, không phải quyết định nạp dữ liệu |

Vậy **A5 vẫn là đóng góp khả thi nhất và ít bị tranh chấp nhất**: xây benchmark đầu tiên gán nhãn quyết định ở mức file/job với oracle độc lập.

### E5. Hai DOI Perplexity đưa KHÔNG dùng được

- `10.25675/3.023602` (luận văn Homayouni, CSU) — CrossRef trả **404**. Luận văn thường không có bản ghi CrossRef; phải xác minh qua kho của trường trước khi trích. Ngoài ra bài này năm **2018**, ngoài khung 5 năm, chỉ dùng được cho phần định nghĩa.
- `10.53555/cse.v11i1.2474` (IJRACSE) — CrossRef trả bản ghi loại `journal-issue` **không có tiêu đề**. Bản ghi hỏng, tạp chí không rõ chỉ mục. **Không trích.**
- `10.58425/ajt.v4i3.455` (American Journal of Technology) — resolve được nhưng tạp chí không rõ chỉ mục Scopus/SCIE. Đánh dấu `[CẦN XÁC MINH]`, không dùng làm bằng chứng tính mới.
- ProvETL: Perplexity ghi 2026; CrossRef ghi **2025**, LNBIP book-chapter (ICEIS 2024).

### E6. Bảng tổng hợp lại tính mới sau lượt kiểm chứng

| Nhánh | Trước lượt này | Sau lượt này |
|---|---|---|
| A1 Mapping | Đóng | Đóng (không đổi) |
| A2 Cleansing | Đóng | Đóng, **thêm** AVH (KDD 2023) + Auto-Validate (SIGMOD 2021) phải trích |
| A3 Gate/verdict staleness | Mở, khe rộng | **Hẹp lại**: ACSOS 2026 đã chiếm khung khái niệm. Còn lại là **chuyển miền có kiểm chứng** |
| A4 Reconciliation | Trống ở mức học thuật | **Đã có prior work** (Netinant 2023), nhưng đánh giá suy biến → còn chỗ làm lại cho đúng |
| A5 Benchmark quyết định | Không tồn tại | **Vẫn không tồn tại** — nay là đóng góp mạnh nhất |

**Phát biểu đóng góp nên chuyển thành (ưu tiên A5, kèm A3 đã hạ cấp):**

> Luận văn xây **benchmark đầu tiên gán nhãn quyết định xuất bản dữ liệu ở mức file/job với oracle độc lập**, và dùng nó để kiểm chứng việc chuyển khung hợp đồng hiệu lực (TOCTOU trên verdict, theo Shraga et al. 2026) từ miền guardrail LLM sang miền cổng dữ liệu, so với đường cơ sở đối soát nguồn↔đích của Netinant et al. (2023) vốn chưa có ca âm và oracle độc lập.

### E7. Bài học về quy trình

Trong lượt này Perplexity **sai 2/2 ở các mục quan trọng nhất** (ACSOS 2026 và KDD 2023 đều bị gọi là không bình duyệt), **bỏ sót** bài MDPI nằm đúng trọng tâm câu hỏi của chính nó, và đưa **2 DOI không dùng được**. Kết luận "your claim stands unrefuted" của nó không đáng tin khi chưa xác minh. Quy trình đúng: Perplexity để **mở rộng vùng tìm**, CrossRef/arXiv API để **phán xử**. Không bao giờ để Perplexity phán xử.

---

## Phần F — Đọc toàn văn ACSOS 2026: cái gì chuyển miền được, cái gì phải làm mới

Đã tải và đọc toàn văn arXiv:2608.26306v1 (7 trang, ~5.800 từ). Văn bản trích lưu tại `runs/acsos2026_verdict_staleness.txt`.

### F1. Tính mới mà chính họ tuyên bố — và nó neo vào đâu

Nguyên văn §II: *"We are not aware of prior work that estimates such a plant-dependent horizon for an already-issued Execute-stage semantic approval under **endogenous closed-loop plant evolution**."*

Đây là điểm quyết định. Tính mới của họ neo vào **biến đổi nội sinh do chính vòng điều khiển gây ra**. Trong miền dữ liệu, biến đổi là **ngoại sinh**: người sửa dữ liệu nguồn, ai đó đổi ràng buộc hệ đích, cấu hình parser thay đổi. Không có "plant dynamics" để ước lượng. Hai chế độ khác nhau về bản chất, nên tuyên bố tính mới của họ **không phủ lên** trường hợp dữ liệu.

Dòng dõi TOCTOU trong Related Work của họ, đã kiểm:

| Ref | Nguồn | Loại | Ghi chú theo chính sách workspace |
|---|---|---|---|
| [1] | Bishop & Dilger (1996). Checking for race conditions in file accesses. *Computing Systems* 9(2), 131–152 | journal | **1996 — chỉ dùng cho ĐỊNH NGHĨA TOCTOU**, đánh dấu `[SEMINAL]`, không dùng làm bằng chứng hiện trạng |
| [2] | Lilienthal & Hong (2025). Mind the Gap: TOCTOU in LLM-enabled agents. arXiv:2508.17155 | **preprint** | Không được gán hạng; `[CẦN XÁC MINH]` |
| [17] | Jiang, Liu, Luo & Lin (2026). Atomicity for agents: TOCTOU in browser-use agents. arXiv:2603.00476 | **preprint** | Không được gán hạng; `[CẦN XÁC MINH]` |

**Kết luận F1:** toàn bộ dòng TOCTOU hiện đại nằm ở preprint hoặc miền tác tử; miền **cổng xuất bản dữ liệu** chưa có ai. Khe chuyển miền là thật, nhưng nó là khe *chuyển miền*, không phải khe *khung khái niệm*.

### F2. Những thứ BẮT BUỘC trích, không được nhận là mới

Sáu thứ sau đã có chủ. Dùng được, nhưng phải dẫn nguồn:

1. **Khung phát biểu.** *"An Execute-stage approval is not a timeless Boolean"* và **freshness contract**: phê duyệt phải đúng lúc kiểm tra **và** còn hiệu lực lúc dùng, kèm fallback có lý do khi hết hạn.
2. **Giao thức replay** — *fixed-action relabeling audit*: giữ nguyên ứng viên, lấy ngữ cảnh ghi lại ở thời điểm sau, chạy **cùng một bộ kiểm tra tất định** (oracle) và so hai verdict. Đây đúng là thứ cần cho dữ liệu: giữ nguyên gói xuất, lấy phiên bản dữ liệu/ràng buộc sau đó, chạy lại cùng validator, so verdict.
3. **Phân rã ba chỉ số theo tập điều kiện khác nhau** — đây là phần giá trị nhất và luận văn nên bê nguyên cấu trúc:
   - *all-candidate verdict-change rate*: đổi nhãn trên **mọi** ứng viên, trước khi lọc theo tập mà phương pháp cho qua.
   - *directional oracle-labeled approval-expiry rate*: chỉ tính trên ứng viên **phương pháp đó cho qua** VÀ **hợp lệ theo oracle tại thời điểm kiểm tra**.
   - *judge-conditioned use-time invalidity*: tính trong tập phê duyệt của chính bộ phán xử; **lẫn** lỗi tại thời điểm kiểm tra với hết hạn theo thời gian.
4. **Tuổi tính từ lúc lấy quan sát, không phải lúc phát verdict** — tức bao gồm mọi độ trễ giữa đọc dữ liệu và thi hành.
5. **Mô hình tuổi rời rạc** $K_{live} = \lceil \Delta / T_{ctrl} \rceil$. Ý tưởng "cửa sổ lệch đo bằng số bước" mà thiết kế ở Phần C đề xuất chính là cái này — **nay phải trích, không được trình bày như của mình**.
6. **Mô hình đe doạ**: loại trừ thao túng đối kháng; hiểm hoạ là biến đổi thông thường. Miền dữ liệu giống hệt.

### F3. Những thứ KHÔNG chuyển được — đây là chỗ còn trống thật

1. **Bộ ước lượng của FBS không có tương ứng.** FBS ước lượng validity horizon từ *safe-side margin* và *feature volatility* của đại lượng liên tục. Verdict validation dữ liệu là tổ hợp vi phạm rời rạc; không có biên liên tục tương đương. Muốn có phải tự định nghĩa (ví dụ theo số/độ nặng vi phạm còn cách ngưỡng bao xa) — **và đó là việc mới**.
2. **Họ không có khái niệm chấm lại bản sửa ứng viên.** Toàn văn không có chỗ nào đánh giá một bản sửa được đề xuất trước khi phê duyệt. Đây vẫn là trống.
3. **Họ không ràng buộc verdict vào bytes xuất ra.** Không có manifest/checksum. Vẫn trống.
4. **Oracle của họ tự nhận không đầy đủ:** *"The reference checker supplies deterministic labels for selected operational predicates but is not a complete safety oracle"*. Miền dữ liệu **có** oracle mạnh hơn hẳn: hệ đích thật sự nhận hay từ chối, cộng đối soát nguồn↔đích. Đây là lợi thế cấu trúc của luận văn, không phải điểm yếu.
5. **Ranh giới episode** làm cohort co lại khi K tăng — miền dữ liệu không có episode, nên bẫy này không tồn tại.

### F4. Ba điểm yếu họ TỰ KHAI — luận văn khai thác được

Trích §VI Limitations:

1. *"Replay is a fixed-action relabeling audit, **not an intervention-consistent causal simulation**: it evaluates $a_t$ on later recorded contexts rather than reconstructing the trajectory induced by delaying, rejecting, or replacing it."*
   → Trong miền dữ liệu, ta **thật sự áp được bản sửa rồi chạy lại**. Luận văn làm được đúng phiên bản can thiệp mà họ không làm được. **Đây là điểm phân biệt mạnh nhất.**
2. *"Judge-conditioned rates may mix check-time error with temporal expiry"* — họ **không tách được** lỗi tại thời điểm kiểm tra khỏi hết hạn theo thời gian.
   → Với oracle tất định của hệ đích, luận văn **tách được**. Điểm phân biệt mạnh thứ hai.
3. *"FBS remains a proof-of-concept heuristic, not a certified safety guarantee"*; trade-off tiện ích chỉ thử trên **một** môi trường tại **một** giá trị K.

### F5. Số liệu của họ dùng làm động cơ cho luận văn

Trích §VII: verdict-change rate **5,3–48,4%** tại K=8 qua năm môi trường; chênh khoảng **chín lần**. Họ kết luận: *"age alone does not determine the observed rate; plant dynamics, predicate structure, and the logged candidate distribution also matter."*

Dùng được hai cách: (a) chứng minh hiện tượng verdict hết hạn là **thật và lớn**, không phải lo hão — phần Mở đầu cần đúng câu này; (b) cảnh báo phương pháp: **đừng kỳ vọng một con số duy nhất**, tỉ lệ phụ thuộc mạnh vào cấu trúc ràng buộc và phân bố ứng viên. Thiết kế của luận văn phải báo cáo theo từng tập dữ liệu/hệ đích, không gộp một số.

### F6. Phát biểu đóng góp sau khi đã trừ hết phần đã có chủ

> Luận văn chuyển **hợp đồng hiệu lực** (freshness contract, Shraga et al., ACSOS 2026) từ miền guardrail LLM cho hệ tự thích nghi sang miền **cổng xuất bản dữ liệu**, nơi biến đổi là **ngoại sinh** chứ không nội sinh theo vòng điều khiển. Ba đóng góp cụ thể vượt ra ngoài khung đã có:
> 1. **Benchmark (chưa tìm thấy công bố tương đương)** gán nhãn quyết định xuất bản ở mức file/job với **oracle độc lập ba tầng** (hệ đích thật nhận/từ chối, đối soát nguồn↔đích, nhãn chuyên gia) — mục A5, vẫn chưa ai làm.
> 2. ~~**Đánh giá nhất quán can thiệp**~~ — **[22/09: xem G1, đã hiện thực và đo; bậc này trùng freshness mức dòng nên không đứng riêng.]**
> 3. **Tách được** lỗi tại thời điểm đánh giá khỏi hết hiệu lực theo thời gian, nhờ oracle tất định — thứ họ tự nhận không tách được.

Ba nhãn vẫn cấm dùng đặt tên: *verdict freshness*, *freshness contract*, *validity horizon*. Nhãn an toàn có thể dùng: **publication-gate TOCTOU**, **exogenous verdict expiry**, **decision-event benchmark**.

### F7. Điều chỉnh bắt buộc cho thiết kế ở Phần C

- Thang B0–B4 giữ nguyên, nhưng **B2 phải đổi tên và đổi cách trích**: không còn là "kiểm soát freshness" tự nghĩ ra, mà là *áp dụng freshness contract theo Shraga et al. 2026 cho miền dữ liệu*.
- "Độ dài cửa sổ lệch (0, 1, 5, 20 sự kiện)" phải trích $K_{live}$ của họ và giải thích vì sao đơn vị là **sự kiện thay đổi** chứ không phải bước mô phỏng.
- **Bổ sung chỉ số thứ ba** mà thiết kế cũ thiếu: ngoài unsafe-acceptance và false-block, phải có *all-candidate verdict-change rate* — đo trên mọi gói xuất trước khi lọc theo tập được cho qua. Thiếu nó thì không so được với con số 5,3–48,4% của họ.
- **B2′ (revalidation tất định lúc export) vẫn là baseline sống còn** và nay còn quan trọng hơn: nếu chạy lại validation lúc export rẻ và an toàn ngang cơ chế hợp đồng hiệu lực, thì phần chuyển miền mất giá trị, chỉ còn benchmark (A5) đứng được.

---

## Phần G — Hiện thực benchmark và ba lượt đo: đóng góp nào sống, nào chết

Ngày 22/09/2026 đã dựng và chạy benchmark theo đúng thiết kế Phần C/F.
Mã nguồn: `final_project_ai/bench/publication_gate/` — corpus, oracle ba tầng, thang B0–B4 + B2′,
bộ tiêm sự kiện, quét chi phí. Kết quả chi tiết: `bench/publication_gate/FINDINGS.md`.

Thang gate dùng **`evaluate_readiness` thật** của `csv_agent_services`, không phải bản mô phỏng.
Chống vòng tròn bằng kiến trúc: `target_schema.py` (DDL SQLite STRICT) là nguồn sự thật của oracle
và **gate không được đọc**; `contract.py` cố ý khai thiếu so với DDL.

**Kiểm chứng oracle: 104/104 ca đúng** — 64 ca bẩn bị chặn, 40 ca sạch được qua, không sai ca nào.

### G1. Ba kết quả đo, theo thứ tự xuất hiện

**Lượt 1 — freshness thô bị áp đảo.** Cơ chế đang chạy trong sản phẩm
(`assessment_gate_service._freshness_of`: so digest toàn tệp, lệch là STALE) cho false-block
**0,625–1,000** ở K≥1, tức chặn gần hết. B2′ (chạy lại validation lúc export) cho false-block
**0,000** ở mọi K, mọi hạt giống. Ổn định qua ba hạt giống.

**Lượt 2 — freshness hạt mịn cứu được an toàn, nhưng B3 chết.**
- B2f (phạm vi theo từng dòng đổi) **khớp B2′ đến từng chữ số** trên cả hai chỉ số an toàn, và xoá
  bỏ thảm hoạ false-block. Vậy kết luận âm ở lượt 1 **chỉ đúng cho freshness thô**.
- **B3 (chấm lại bản sửa ứng viên) trùng khít B2f** trên 3 hạt giống × 4 giá trị K × 3 chỉ số, trừ
  một chỗ lệch do làm tròn. Nguyên nhân có cấu trúc: freshness hạt mịn **vốn đã** quét lại mọi dòng
  có digest đổi, mà bản sửa được áp thì digest đổi. **"Chấm lại bản sửa" chính là freshness mức dòng,
  không phải cơ chế thứ hai.**

**Lượt 3 — freshness thua trên trục chi phí.** Quét ba cỡ tệp (200 / 2.000 / 20.000 dòng):
B2f quét ít hơn 40% số dòng nhưng **chậm hơn ~50% về thời gian thực ở mọi cỡ**. Đo trực tiếp trên
n=20.000: bằm dấu vân `h` = 2,334 µs/dòng, kiểm đầy đủ `v` = 4,754 µs/dòng, **h/v = 0,491**.

> Điều kiện hoà vốn: B2f rẻ hơn B2′ ⟺ **h/v < 1 − c/n**
> → với h/v = 0,491, freshness chỉ rẻ hơn khi tỉ lệ dòng đổi **c/n < 0,509**.

Nhưng hai trong bốn loại sự kiện đổi **ngữ nghĩa** nên buộc c/n = 1. Giả định nền của mọi cơ chế
freshness — *"so hash rẻ hơn nhiều so với kiểm lại"* — **sai với tải này**.

Phải phát biểu có biên: *với dấu vân SHA-256-trên-JSON và validator rẻ, freshness không hoà vốn.*
**Không** được kết luận "freshness luôn thua" — nếu kiểm dòng đắt hơn nhiều (tra khoá ngoại qua DB,
kiểm chéo bảng, gọi LLM) thì h/v giảm và cán cân đổi. Chưa thử dấu vân rẻ hơn (xxhash trên byte thô).

### G2. Phát hiện lớn nhất — và nó nằm ở chỗ ta KHÔNG nhìn

Ở **K = 0**, tức không có sự kiện nào, không có chuyện verdict cũ đi, **mọi** gate vẫn cho qua
**34/64 = 53,1%** số ca đáng lẽ phải chặn. Bóc tách:

| Nguồn | Số ca | Bản chất |
|---|---|---|
| `lossy_load` (tầng 2) | 16 | Mất mát do **phép biến đổi lúc nạp** — dòng nguồn hoàn toàn hợp lệ |
| `email_semantic` (tầng 3) | 16 | Đúng kiểu, **sai nghiệp vụ** |
| `fk_missing` | 6 | Hợp đồng **không khai** khoá ngoại; hệ đích **có** cưỡng chế |
| `lease_range` | 6 | Hợp đồng **không khai** khoảng; hệ đích **có** cưỡng chế |

Toàn bộ nhánh freshness dịch chuyển con số **vài phần trăm**. Lỗi nền là **53%**. Việc chọn
verdict staleness làm trọng tâm là **tối ưu nhánh sai**.

Con số này tách thành hai bài toán riêng biệt, cả hai đều chưa có ai làm:

1. **Độ phủ hợp đồng so với hệ đích** (12 ca, 19%): hợp đồng khai thiếu so với DDL được cưỡng chế.
2. **Mù cấu trúc** (32 ca, 50%): tầng 2 và tầng 3 **không một hợp đồng khai báo nào biểu diễn được**.
   Cổng dựa trên ràng buộc có **trần trên cứng**, và trần đó đo được.

### G3. Bốn hướng thay thế, xếp theo mức tôi tin

**Hướng A — Độ phủ hợp đồng ↔ hệ đích (nhắm 19%).**
Đo độ phủ declared-vs-enforced; **học ràng buộc còn thiếu từ phản hồi từ chối của hệ đích** (vòng kín).
Định vị: Auto-Validate (SIGMOD 2021) suy ràng buộc từ data lake; Auto-Validate-by-History (KDD 2023)
suy từ lịch sử các lần chạy. **Chưa ai suy từ phản hồi từ chối của hệ đích.** Có hai bài A\* để so.

**Hướng B — Đối soát làm ĐẦU VÀO của cổng, không phải báo cáo hậu kiểm (nhắm 50%).**
Tầng 2/3 vô hình với mọi cổng khai báo. Đưa đối soát (số dòng, tổng kiểm, toàn vẹn tham chiếu) vào
**quyết định xuất bản**. Đường cơ sở: Netinant et al. (2023) có đủ tám chỉ số nhưng **không có ca âm**
và **không nối vào cổng** — vượt họ ở đúng hai chỗ đó.

**Hướng C — Khi nào kiểm khai báo hơn thử nạp thật?**
Oracle tầng 1 của benchmark **chính là** một shadow load, nên phép so sánh đã có sẵn. Câu hỏi sắc:
*kiểm khai báo hơn shadow-load ở điểm nào, hơn bao nhiêu, trong chế độ nào?* Phản biện (chi phí, tác
dụng phụ, nạp một phần, cần giải thích chứ không chỉ mã lỗi, tầng 2/3 vẫn vô hình) chính là nội dung.

**Hướng D — Quay về đóng góp luận văn ĐÃ tuyên bố.**
Evidence Packet (F5) **vẫn chưa đo lần nào**. An toàn nhất nếu quỹ thời gian hẹp.

### G4. Khuyến nghị và trạng thái đóng góp

**A + B làm một luận văn mạch lạc, C làm câu hỏi sắc hoá:**

> Một cổng chỉ tốt bằng hợp đồng của nó. Luận văn đo độ phủ hợp đồng–hệ đích, học ràng buộc còn
> thiếu từ phản hồi từ chối, và đưa đối soát vào quyết định xuất bản cho phần mà ràng buộc khai báo
> **không thể** biểu diễn.

Lý do: nhắm vào 53% thay vì vài phần trăm; benchmark **đã dựng xong** và đo được ngay; và hai kết
quả âm ở G1 trở thành **Related Work của chính nó** ("đã thử freshness, đây là điều kiện hoà vốn,
đây là lý do nó không phải nút thắt").

| Đóng góp | Trạng thái sau ba lượt đo |
|---|---|
| **A5 — benchmark quyết định có oracle độc lập** | ✅ **Đứng vững** — đã hiện thực, oracle đúng 104/104 |
| Chuyển miền hợp đồng hiệu lực (Phần E/F) | ❌ **Hoà về an toàn, thua về chi phí** — không trục nào thắng |
| Chấm lại bản sửa trước phê duyệt (Phần D4, F3) | ❌ **Bị hấp thụ** vào freshness mức dòng — phải gỡ khỏi danh sách khoảng trống |
| **Độ phủ hợp đồng ↔ hệ đích (mới)** | 🆕 Nhắm 19% lỗi nền, có hai bài A\* để định vị |
| **Đối soát làm đầu vào cổng (mới)** | 🆕 Nhắm 50% lỗi nền, có đường cơ sở 2023 để vượt |

**Điều kiện dừng nên đặt NGAY, lúc chưa bị áp lực thời gian:** nếu sau hai tuần hướng A+B chưa cho
kết quả đo được, chuyển sang D và đóng luận văn bằng đúng thứ nó đã tuyên bố.

---

## Phần H — F5 đã được đo lần đầu (22/09/2026): Evidence Packet CÓ đóng góp

`chuong4.tex:386` ghi "Đợt đo chưa được thực hiện". Nay đã thực hiện.
Mã và kết quả: `csv_agent_platform/generation/experiments/f5_evidence_ablation/` (`FINDINGS_F5.md`).

### H1. Giao thức

| Mục | Giá trị |
|---|---|
| Tập đánh giá | **Structural holdout** seed=42 (3 combo chưa từng thấy): train=2928, val=733, **test=1339** |
| Mẫu | **n = 70**, seed=42, chỉ số lưu trong `results_n70.json` |
| Mô hình | `qwen2-csv-fix` (LoRA) **và** `qwen2.5:3b-instruct` (gốc) — tách fine-tuning khỏi evidence |
| Điều kiện | 4 mức bằng chứng × 2 mô hình + template tất định = **9**, tổng **630 báo cáo** |
| Kiểm soát | `num_predict=700`, `temperature=0`, `seed=42` cố định; prompt token báo cáo tường minh |
| Chỉ số | NumFid/IssueFid/Cov@2/ảo giác (dùng `src/evaluation/fidelity.py` của repo) + BLEU-4/ROUGE-L/định dạng |
| Kiểm định | Bootstrap **ghép cặp** 5.000 lần trên cùng 70 mẫu |

Bốn mức: **L1** chỉ điểm số · **L2** +loại vấn đề/tỷ lệ/ưu tiên · **L3** +ngữ cảnh tập dữ liệu và phân tích chéo · **L4** gói đầy đủ như production.

### H2. Kết quả

| Điều kiện | NumFid | IssueFid | Ảo giác | BLEU-4 | ROUGE-L | Fmt | pTok |
|---|---|---|---|---|---|---|---|
| **T tất định** | 0,570 | **1,000** | **0,0000** | 0,0488 | 0,2025 | 1,00 | 0 |
| FT · L1 score-only | 0,253 | 0,106 | 0,0214 | 0,0266 | 0,1654 | 1,00 | 224 |
| FT · L2 +rule | 0,508 | 0,796 | 0,0154 | 0,0629 | 0,2290 | 1,00 | 337 |
| **FT · L3 +context** | **0,655** | 0,825 | 0,0059 | **0,0878** | **0,2513** | 1,00 | 616 |
| FT · L4 full EP | 0,344 | 0,687 | 0,0424 | 0,0529 | 0,1653 | **0,34** | 2350 |
| Base · L1 | 0,345 | 0,104 | 0,0020 | 0,0135 | 0,1227 | 1,00 | 245 |
| **Base · L2** | **0,719** | 0,960 | 0,0029 | 0,0468 | 0,1691 | 1,00 | 358 |
| Base · L3 | 0,647 | **0,963** | **0,0023** | 0,0472 | 0,1721 | 0,98 | 637 |
| Base · L4 | 0,297 | 0,793 | 0,0078 | 0,0338 | 0,1432 | 0,35 | 2356 |

### H3. Kiểm định ghép cặp (CI 95%)

| So sánh (a − b) | Δ | CI 95% | Kết luận |
|---|---|---|---|
| **L3 − L1**, NumFid | +0,4024 | [0,3553; 0,4496] | ✅ Có ý nghĩa |
| **L3 − L1**, ảo giác | −0,0154 | [−0,0199; −0,0116] | ✅ Có ý nghĩa (giảm) |
| **L4 − L3**, NumFid | −0,3114 | [−0,3723; −0,2484] | ✅ Có ý nghĩa |
| **L4 − L3**, ảo giác | +0,0365 | [0,0154; 0,0674] | ✅ Có ý nghĩa (tăng) |
| **L4 − L3**, định dạng | −0,6571 | [−0,7500; −0,5571] | ✅ Có ý nghĩa |
| **FT − Base** tại L3, ROUGE-L | +0,0792 | [0,0619; 0,0979] | ✅ Có ý nghĩa |
| **FT − Base** tại L3, NumFid | +0,0083 | [−0,0654; 0,0801] | ❌ **CHƯA có ý nghĩa** |
| **FT − Base** tại L3, ảo giác | +0,0037 | [0,0021; 0,0053] | ✅ Có ý nghĩa (**tệ hơn**) |
| **FT·L3 − Template**, NumFid | +0,0853 | [0,0400; 0,1319] | ✅ Có ý nghĩa |
| **FT·L3 − Template**, ảo giác | +0,0059 | [0,0046; 0,0075] | ✅ Có ý nghĩa (**tệ hơn**) |

### H4. Bốn kết luận

1. **✅ Evidence Packet CÓ đóng góp.** L1→L3: NumFid gấp 2,6 lần, ảo giác giảm 3,6 lần, cả hai có ý nghĩa. **F5 được trả lời, và câu trả lời là CÓ.** Đây là đóng góp duy nhất của luận văn được chứng minh bằng thực nghiệm có kiểm định trong toàn bộ đợt rà soát này.

2. **❌ Cấu hình production (L4) là cấu hình TỆ NHẤT.** Sụp trên **cả hai** mô hình: định dạng rơi 1,00 → 0,34, ảo giác tăng 7 lần. Gói 2.350 token phá vỡ mô hình nhỏ. **Sửa được ngay:** dùng gói rút gọn mức L3 (fine-tuned) hoặc L2 (base); mức tối ưu **phụ thuộc mô hình**.

3. **⚠️ Fine-tuning mua VĂN PHONG, không mua SỰ THẬT.** ROUGE-L +0,0792 có ý nghĩa; NumFid **CI chứa 0**; ảo giác **tệ hơn** có ý nghĩa. Luận văn dùng BLEU 0,1423 / ROUGE-L 0,3326 làm bằng chứng fine-tune thành công — phép đo cho thấy hai chỉ số đó bắt **văn phong**, không bắt **tính đúng**. Đúng cảnh báo ở `chuong4.tex:807`, nay có số.

4. **⚖️ LLM thắng template về độ trung thực, KHÔNG BAO GIỜ thắng về ảo giác.** Template đạt 0,0000 tuyệt đối theo thiết kế. Mọi tuyên bố "không ảo giác" phải thuộc về template, không thuộc về LLM.

### H5. Đính chính và giới hạn

**Đính chính:** ở pilot n=3 tôi báo "template thắng mọi điều kiện LLM về NumFid". Ở n=70 điều đó **sai** — FT·L3 vượt template có ý nghĩa (+0,0853).

**Giới hạn phải ghi vào luận văn:**
1. **Cov@2 = 0,000** ở mọi điều kiện LLM trừ L4 là **hiện vật đo lường** (chỉ L4 chứa mã bản ghi), không phải thất bại của mô hình. Không đọc cột này như so sánh.
2. Dữ liệu **tổng hợp**, không phải báo cáo nghiệp vụ thật.
3. Bốn chỉ số này đo **độ trung thực với gói bằng chứng**, **không** đo tính hữu ích nghiệp vụ.
4. Kết luận 2 gắn với **lớp mô hình 1,5B/3B**; mô hình lớn hơn có thể không sụp ở L4.
5. Template tất định do tôi viết; NumFid 0,570 có thể nâng gần 1,0 nếu xuất đủ trường — tức so sánh hiện **có lợi cho LLM**.

### H6. Ảnh hưởng tới trạng thái đóng góp toàn cục

| Đóng góp | Trạng thái |
|---|---|
| **F5 — Evidence Packet (độ trung thực)** | ⚠️ **Có bằng chứng cho L1→L3**, nhưng so với template phải đọc Phần I (baseline đã sửa) |
| F5 — LLM-as-Judge | ❌ **Đã chạy, không đạt calibration** (ρ = 0,174 / −0,101) |
| F5 — chất lượng nghiệp vụ (chuyên gia) | ⏳ **Chưa chạy** — bộ công cụ đã sẵn sàng tại `expert_kit/` |
| A5 — benchmark quyết định xuất bản | ✅ Đứng vững (Phần G) |
| Chuyển miền hợp đồng hiệu lực | ❌ Hoà an toàn, thua chi phí (Phần G) |
| Chấm lại bản sửa trước duyệt | ❌ Bị hấp thụ vào freshness mức dòng (Phần G) |

**Hệ quả chiến lược:** hướng D ở Phần G4 (quay về đóng góp luận văn đã tuyên bố) **không còn là đường lui**
— nó nay là **đường mạnh nhất**, vì đã có số liệu có ý nghĩa thống kê chứng minh.
### H7. LLM-as-Judge — ĐÃ CHẠY, KHÔNG ĐẠT CALIBRATION (23/09/2026)

Giao thức theo đúng `chuong4.tex`: 5 tiêu chí, thang 1–5, calibration subset n=15.
Judge: `qwen2.5:3b-instruct`. Chi tiết: `experiments/f5_evidence_ablation/JUDGE_FINDINGS.md`.

**Judge có phân biệt được** (dùng đủ thang 1–5, sd=1,238; xếp L4 thấp nhất, khớp fidelity):
T tất định 3,20 · FT·L3 3,17 · FT·L4 2,91.

**Nhưng phép kiểm quyết định thất bại** — tương quan Spearman với fidelity tự động (45 cặp):

| Cặp | ρ |
|---|---|
| judge `accuracy` ↔ `NumFid` | **0,174** (gần như không tương quan) |
| judge `groundedness` ↔ (−ảo giác) | **−0,101** (**ngược dấu**) |
| Riêng T tất định: `accuracy` ↔ `NumFid` | **−0,389** |

**Chẩn đoán:** đã kiểm giả thuyết cạnh tranh "5 tiêu chí trừu tượng quá khó". Giao judge nhiệm vụ
**hẹp** (chỉ đếm số khớp/không khớp) cho ρ = **−0,130** — không khá hơn. Vậy lỗi do **năng lực judge
3B**, không do thiết kế prompt. Đáng chú ý: judge cho **trung bình tổng thể gần đúng** (0,744 so với
NumFid 0,696) nhưng **thứ hạng từng mẫu sai** — dạng hỏng nguy hiểm nhất, sinh ra con số trông hợp lý
mà không mang tín hiệu.

**Quyết định: KHÔNG chạy đủ 630 lần chấm.** Báo cáo chúng như "chất lượng nghiệp vụ" sẽ tạo đúng loại
số liệu mà cả đợt rà soát này đang chống.

**Hệ quả:** hạng mục "LLM-as-Judge 70 báo cáo" trong bảng cam kết phải ghi **ĐÃ CHẠY — KHÔNG ĐẠT
CALIBRATION** kèm ρ = 0,174 và −0,101. Đây là **kết quả**, không phải việc còn treo. Giao thức chỉ cứu
được bằng judge mạnh hơn nhiều (lớp GPT-4/Claude) — **chưa thử**, không được suy ra là "sẽ đạt".

### H8. Đánh giá chuyên gia — bộ công cụ đã dựng, CHƯA CHẠY

Chất lượng nghiệp vụ nay chỉ còn **một** con đường hợp lệ: chuyên gia người chấm. Tôi **không** chạy
được việc này — nó cần người có nền nghiệp vụ kiểm toán/bất động sản. Đã dựng sẵn bộ công cụ tại
`experiments/f5_evidence_ablation/expert_kit/`:

- **108 báo cáo** lấy phân tầng 12 mẫu × 9 điều kiện
- **Làm mù**: tệp đặt tên `R001`…, khoá giải mã nằm trong `BLIND_KEY_do_not_share.json` (không đưa giám khảo)
- **15 phiếu chồng lặp** giữa 2 giám khảo để đo Krippendorff α
- `score_expert.py` tính trung bình theo điều kiện + độ đồng thuận; **α < 0,67 thì không dùng làm bằng chứng**

Trạng thái trong luận văn phải ghi: **CHƯA CHẠY, công cụ đã sẵn sàng** — không được ghi là đã đo.


---

## Phần I — Phản biện độc lập 23/09/2026: năm lỗi, **cả năm đều đúng**

Một lượt phản biện độc lập chỉ ra sáu điểm. Tôi kiểm chứng bằng số, không nhận hay bác bằng lời.
**Năm điểm thực nghiệm đều được xác nhận.** Đây là các lỗi của tôi, không phải khác biệt quan điểm.

### I1. ❌ Kết luận "LLM thắng template" — SAI vì lỗi baseline

**Cáo buộc:** template chỉ in `ratio` khi là số, nhưng dữ liệu lưu dạng chuỗi.

**Kiểm chứng:** `cluster.ratio` là **`str` ở 229/229** trường hợp (ví dụ `"0.22% of total records"`).
Template của tôi có `isinstance(r, (int, float))` → **không bao giờ in ratio**.

**Sửa và chấm lại** (giữ nguyên 70 báo cáo LLM, chỉ sinh lại điều kiện template):

| Chỉ số | Template v1 (lỗi) | Template v2 (sửa) | FT·L3 |
|---|---|---|---|
| **NumFid** | 0,570 | **1,000** | 0,655 |
| Ảo giác | 0,0000 | **0,0000** | 0,0059 |
| BLEU-4 | 0,0488 | **0,0974** | 0,0878 |
| ROUGE-L | 0,2025 | **0,2325** | 0,2513 |

Trường bắt buộc còn thiếu: **0/528**.

**Kết luận H4-4 bị đảo ngược.** Template tất định **thắng** LLM ở NumFid (1,000 vs 0,655), ảo giác
(0 vs 0,0059) và BLEU-4. LLM chỉ còn hơn ở **ROUGE-L** (0,2513 vs 0,2325) — tức **gần văn bản tham chiếu hơn**.
Điều đó **không** chứng minh văn phong hay hơn (xem I9).

Bài học phương pháp: **bootstrap có ý nghĩa thống kê không cứu được baseline bị cài đặt sai.** Tôi đã
báo CI 95% cho một so sánh mà một bên bị tôi làm yếu đi.

### I2. ❌ Đối chứng fine-tuning KHÔNG HỢP LỆ

`models/qwen2-1.5b-lora-adapter-v2/adapter_config.json` ghi
`base_model_name_or_path: Qwen/Qwen2-1.5B-Instruct`. Tôi lại so với `qwen2.5:3b-instruct` — đổi **cả
phiên bản (2 → 2.5) lẫn kích thước (1,5B → 3B)**. Hai biến cùng thay đổi.

**ĐÃ CHẠY LẠI** với `qwen2:1.5b-instruct` (n=70, cùng họ, cùng kích thước, chỉ khác có/không LoRA).
Bootstrap ghép cặp 5.000 lần:

| Mức | NumFid FT | NumFid base | Δ | CI 95% | |
|---|---|---|---|---|---|
| L1 | 0,253 | 0,069 | **+0,1835** | [+0,1458; +0,2190] | ✅ |
| L2 | 0,509 | 0,366 | **+0,1422** | [+0,0637; +0,2235] | ✅ |
| L3 | 0,655 | 0,491 | **+0,1640** | [+0,0850; +0,2417] | ✅ |
| L4 | 0,344 | 0,234 | **+0,1100** | [+0,0584; +0,1645] | ✅ |

| Mức | Ảo giác FT | base | Δ | CI 95% | |
|---|---|---|---|---|---|
| L1 | 0,0214 | 0,0004 | **+0,0209** | [+0,0169; +0,0257] | ✅ tệ hơn |
| L2 | 0,0154 | 0,0024 | **+0,0130** | [+0,0098; +0,0164] | ✅ tệ hơn |
| L3 | 0,0059 | 0,0007 | **+0,0052** | [+0,0039; +0,0067] | ✅ tệ hơn |
| L4 | 0,0424 | 0,0017 | **+0,0407** | [+0,0205; +0,0712] | ✅ tệ hơn |

**Kết luận H4-3 phải RÚT LẠI HOÀN TOÀN.** Câu "fine-tuning mua văn phong, không mua sự thật" là
**hiện vật của đối chứng sai** — khi so với một mô hình lớn hơn và mới hơn (Qwen2.5-3B), lợi thế của
fine-tuning bị che lấp.

**⚠️ NHƯNG đối chứng này VẪN CHƯA "chỉ khác LoRA".** Kiểm metadata serving 23/09:

| Cấu hình | Lượng tử hoá | Context length |
|---|---|---|
| FT Qwen2-1.5B (`qwen2-csv-fix`) | **Q4_K_M** | 32768 |
| Base Qwen2-1.5B (`qwen2:1.5b-instruct`) | **Q4_0** | 32768 |

Serving template giống nhau, nhưng **lượng tử hoá khác** — Q4_K_M chất lượng cao hơn Q4_0. Vẫn còn
**hai biến** cùng thay đổi.

**Phát biểu được bằng chứng hỗ trợ (và chỉ đến đó):** *cấu hình FT đạt NumFid cao hơn và tỷ lệ ảo
giác proxy cao hơn so với cấu hình base.* **KHÔNG** được quy toàn bộ chênh lệch cho LoRA. Muốn tách
phải lượng tử hoá hai bản về cùng một mức rồi chạy lại.

Câu "fine-tuning mua văn phong, không mua sự thật" vẫn **rút lại** — nhưng câu thay thế cũng chỉ là
*so sánh cấu hình*, chưa phải *so sánh LoRA*.

### I3. ⚠️ Quy kết L4 cho "packet dài" — chưa đủ bằng chứng, và phải tách hai trường hợp

| Điều kiện | Chạm trần 700 token | oTok TB | Kết thúc giữa chừng |
|---|---|---|---|
| FT·L1/L2/L3 | 0% | 226–253 | 1–7% |
| **FT·L4** | **2%** | 282 | 11% |
| Base·L1/L2/L3 | 37–41% | 589–618 | 30–34% |
| **Base·L4** | **77%** | 667 | **61%** |

- **Base·L4**: Fmt 0,35 **phần lớn do truncation**, không phải "mô hình bị phá vỡ". Chưa kết luận được.
- **FT·L4**: chỉ 2% chạm trần mà Fmt vẫn 0,34 → ở đây L4 sụp **không** do truncation.

Câu "2.350 token phá vỡ mô hình nhỏ" **phải rút lại hoàn toàn**, không chỉ thu hẹp:

- **Base·L4**: đã chạy lại với `num_predict=1600`. **Ghép đúng 25 ca** giữa hai lần chạy:

  | | Cap 700 | Cap 1600 |
  |---|---|---|
  | Fmt | 0,36 | 0,36 |
  | Chạm trần | 19/25 | 9/25 |

  **Phát biểu được hỗ trợ:** *nới cap chưa cải thiện Fmt trên 25 ca này.* **KHÔNG** được nói
  "truncation đã bị loại" — vẫn còn **36% chạm trần**, và **cắt ĐẦU VÀO/context chưa được kiểm soát**.
  (Tôi đã so 77% với 36% trên hai cỡ mẫu khác nhau (n=70 vs n=25) — so sánh sai.)
- **FT·L4**: tỷ lệ chạm trần 2% **loại việc cắt đầu ra khỏi vai trò giải thích chính** — nhưng **KHÔNG
  xác định được nguyên nhân**. Tôi đã viết "ở đó L4 sụp không do truncation" theo cách ngầm hiểu là đã
  biết nguyên nhân. Chưa biết.

**Còn phải kiểm trước khi quy kết bất cứ điều gì cho độ dài packet:**
1. **Context thực nhận** — mô hình có thật sự nhận đủ 2.350 token không, hay bị cắt ở tầng serving?
2. **Prompt và serving template** của Ollama cho model đã merge — có khác `report_prompt.j2` không?
3. **Khác biệt với dữ liệu huấn luyện** — LoRA học trên gói đầy đủ hay gói rút gọn? Nếu phân bố đầu vào
   lúc suy luận lệch khỏi lúc huấn luyện thì đó mới là nguyên nhân, không phải "độ dài".
4. **Yêu cầu báo cáo** — style `detailed` vs `summary` phân bố thế nào giữa các mức.

**Cập nhật 23/09 — bốn mục kiểm đã cho bằng chứng:**

1. **Dữ liệu huấn luyện:** cả 5.000 mẫu chứa packet **đầy đủ**, không phải L3 rút gọn. Nên giả thuyết
   "LoRA học trên gói rút gọn" **không** giải thích được. Còn phải kiểm `max_seq_length=2048` trong
   script huấn luyện giữ thực sự bao nhiêu token ở run lịch sử.
2. **Context serving:** `prompt_eval_count` = **đúng 2050** ở **51/70** ca L4, giống hệt trên cả ba
   mô hình. Đây là **dấu hiệu ưu tiên truy vết**, chưa phải bằng chứng xác nhận cắt prompt.
3. **Style không lệch:** cùng 36 detailed / 34 summary ở mọi mức. Giả thuyết lệch tỷ trọng style
   **bị loại**.
4. **Prompt benchmark ≠ template huấn luyện** ở một số chỉ dẫn tiếng Anh. Và một output FT·L4 là
   **tiếng Trung** → **`Fmt` hiện đang TRỘN lỗi ngôn ngữ với lỗi bố cục**, nên bản thân chỉ số này
   chưa tách bạch.

**Bước tiếp theo đúng thứ tự:** kiểm **context thực nhận** trước, giữ nguyên mọi biến khác. Giả thuyết
lệch huấn luyện LoRA **không tự giải thích** việc hai mô hình base cũng gặp vấn đề.

### I4. ❌ Phần G gọi B2 là "bị áp đảo" — SAI, đó là ĐÁNH ĐỔI

| K | Gate | unsafe | false-block |
|---|---|---|---|
| 1 | B1 | 0,654 | 0,000 |
| 1 | **B2 coarse** | **0,103** | **0,769** |
| 1 | B2f fine / B2′ | 0,359 | 0,000 |
| 5 | **B2 coarse** | **0,022** | **1,000** |
| 5 | B2f fine / B2′ | 0,163 | 0,000 |

Coarse **an toàn hơn 25,6 điểm %** tại K=1 (0,103 vs 0,359), đổi lại chặn nhầm 76,9%. Gọi nó là
"dominated" chỉ đúng nếu đã đặt trước tiêu chí ưu tiên khả dụng hơn an toàn — **tôi chưa đặt**.

**Phải sửa:** nêu hàm đánh đổi (ví dụ chi phí một ca unsafe so với một ca chặn nhầm) **trước** khi
tuyên bố bên thắng.

### I5. ❌ "53% lỗi nền" — hai sai sót trong cách trình bày

1. **"Mọi gate đều cho qua 34/64" là SAI.** Kiểm lại: **B0 lọt 0/64**, B1 lọt 34/64. B0 chặn tất cả.
2. **Bảng 44 lượt lỗi thực chất là 34 ca** — 10 lượt dư là do ca chồng lấp nhiều loại (soft-mix có cả
   `lossy_load` lẫn `email_semantic`). Tôi in bảng lượt mà không ghi chú, gây hiểu là 44 ca.
3. **"Freshness chỉ dịch chuyển vài phần trăm" là SAI:**

| K | B1 → coarse | B1 → fine |
|---|---|---|
| 1 | giảm **55,1** điểm % | giảm **29,5** điểm % |
| 5 | giảm **69,6** điểm % | giảm **55,4** điểm % |
| 20 | giảm **77,9** điểm % | giảm **75,0** điểm % |

Ý tôi muốn nói là freshness **không chạm tới** 53% lỗi tại K=0, nhưng tôi đã phát biểu thành một câu sai.

Thêm nữa: 53% là tỷ lệ trong **corpus do tôi chủ động thiết kế** (tỷ lệ lỗi tầng 2/3 là lựa chọn của tôi),
nên **không** đủ để một mình quyết định chuyển hướng nghiên cứu.

### I6. ❌ Bốn tài liệu không thống nhất, nhiều tuyên bố mạnh hơn bằng chứng

Đã sửa: `TONG_HOP.md` và `assessment.md` còn ghi F5 chưa chạy trong khi Phần H đã có 630 báo cáo.
Đã hạ các cụm **"đóng hẳn"** → "nhiều prior work mạnh; tìm kiếm có mục tiêu, chưa bao quát";
**"benchmark đầu tiên"** → "chưa tìm thấy công bố tương đương"; **"đã chứng minh"** → "có bằng chứng cho L1→L3".

### I7. Trạng thái đóng góp sau đính chính

| Đóng góp | Trước | Sau |
|---|---|---|
| Evidence Packet giúp (L1→L3) | ✅ | ✅ **Giữ nguyên** — Δ NumFid +0,4024 [0,3553; 0,4496], ảo giác −0,0154 |
| LLM hơn template tất định | ✅ | ❌ **ĐẢO NGƯỢC** — template đạt NumFid 1,000, ảo giác 0 |
| Fine-tuning mua văn phong, không mua sự thật | ✅ | ❌ **Rút lại.** Thay bằng: *cấu hình FT* đạt NumFid cao hơn **và** ảo giác proxy cao hơn *cấu hình base*. Chưa quy được cho LoRA — **lượng tử hoá còn khác** (Q4_K_M vs Q4_0). |
| L4 sụp do packet dài | ✅ | ⚠️ **Hiện tượng có thật trên cả ba mô hình**; nới cap đầu ra chưa cải thiện Fmt, nhưng **truncation đầu vào chưa loại được**; `Fmt` còn trộn lỗi ngôn ngữ với bố cục |
| B2 bị B2′ áp đảo | ✅ | ❌ **Là đánh đổi**, không phải áp đảo |
| 53% lỗi nền → đổi hướng | ✅ | ⚠️ **Đúng số nhưng là corpus tự thiết kế**, không đủ để một mình quyết định |

### I8. Câu hỏi nghiên cứu, phát biểu lại cho sắc (sửa 23/09/2026 lần hai)

**Tôi đã viết sai ở bản trước.** Bản đó đề xuất "chuyển sang phép đo mà template **không thể thắng
theo cấu trúc**". Đó là **rigging phép đo** — chọn thước để định sẵn bên thắng, đúng thứ mà cả đợt rà
soát này đang chống. Phản biện bắt được, và đúng.

**Nguyên tắc thay thế:** chọn phép đo phản ánh **công việc thực tế**, cho phép **cả template lẫn LLM
thắng hoặc hoà**. Nếu template tốt hơn, **đó vẫn là kết quả nghiên cứu có giá trị** — không phải thất
bại cần diễn giải lại.

**Câu hỏi nghiên cứu:**

> Trong **những loại ca nào**, báo cáo LLM giúp người dùng xử lý bất thường **tốt hơn** báo cáo tất
> định, và lợi ích đó có **đánh đổi** bằng lỗi thiếu căn cứ hay chi phí hay không?

Ba mệnh đề then chốt: *loại ca nào* (không phải "có tốt hơn không" nói chung) · *giúp người dùng xử lý*
(không phải điểm chấm trên giấy) · *có đánh đổi không* (bắt buộc báo cáo mặt trái).

### I9. ⚠️ Giới hạn diễn giải của bốn chỉ số hiện có

Ba cảnh báo phải ghi vào luận văn, vì tôi đã diễn giải quá mức ở **cả hai chiều**:

1. **ROUGE-L cao hơn chỉ nghĩa là GẦN VĂN BẢN THAM CHIẾU hơn.** Không chứng minh "văn phong hay hơn".
   Câu ở H4-3 và I1 nói LLM "hơn ở văn phong" là **suy diễn vượt bằng chứng** — đúng phải nói là
   *gần bản vàng hơn*.
2. **NumFid = 1 và tỷ lệ ảo giác = 0 là PROXY.** Chúng đo *sự có mặt của các số bắt buộc* và *số token
   không truy được về gói*. Chúng **không** bảo đảm mọi phát biểu đúng ngữ nghĩa. Template đạt 1,000/0
   vẫn có thể phát biểu sai quan hệ nhân quả hoặc khuyến nghị lệch.
3. **Ba trục khuyến nghị và câu hỏi "phát biểu nào không kiểm chứng được"** mới là chỗ bắt lỗi ngữ
   nghĩa. Bốn chỉ số tự động không thay thế được.

### I10. Giao thức đánh giá — CHỐT TRƯỚC khi xem kết quả mới

Đã hiện thực tại `experiments/f5_evidence_ablation/expert_kit/`.

**A. So sánh cặp** (`build_pairwise.py`, `score_pairwise.py`, 40 ca):
1. **Cùng ca, cùng gói bằng chứng** cho cả hai bản; ẩn tên hệ thống; **đảo ngẫu nhiên A/B** từng ca;
   **cho phép HOÀ**.
2. Chấm **riêng**, không gộp điểm: khuyến nghị *đúng* / *cụ thể* / *khả thi*; **đếm** phát biểu thiếu
   căn cứ; **đếm** lỗi quan trọng bị bỏ sót.
3. Phân tích **ghép cặp theo ca**; công bố **bất đồng giữa người chấm** và **khoảng tin cậy** bootstrap.
   CI chứa 0 → kết luận là *chưa phân biệt được*, không phải "LLM không kém".

**B. Hiệu quả người dùng** (`task_protocol.md`) — nếu đo:
- Nhiệm vụ có **đáp án kiểm chứng được** từ gói bằng chứng (nhóm nghiêm trọng nhất; số bản ghi; cột
  cần nhắm; phát biểu không kiểm chứng được).
- Ghi **cả độ chính xác lẫn thời gian**. Nhanh hơn mà sai nhiều hơn **không** phải cải thiện.
- Thiết kế trong-đối-tượng, cân bằng thứ tự theo ô Latin, làm mù.
- **Điểm chuyên gia về "hữu ích" KHÔNG thay thế phép đo này.**


### I11. 🔴 NGUYÊN NHÂN L4 ĐÃ TÌM RA — là lỗi trong harness của chính tôi

Ngày 23/09/2026, sau gợi ý truy vết context serving.

**Phép thử trực tiếp.** Nhét mã bí mật ở **cuối** prompt, tăng dần độ dài, hỏi lại mã:

| Độ dài prompt | pEval (mặc định) | pEval (`num_ctx=8192`) | Đọc được mã? |
|---|---|---|---|
| ~500 tok | 837 | 837 | có / có |
| ~1.500 tok | 2.433 | 2.433 | có / có |
| ~2.500 tok | 4.010 | 4.010 | có / có |
| **~3.500 tok** | **2.050** | **5.587** | có / có |

Con số **2.050** tái hiện **chính xác** — đúng giá trị xuất hiện 51/70 lần ở L4. Nó là **hiện vật của
cấu hình context mặc định của Ollama**, không phải đặc tính dữ liệu. Mô hình vẫn đọc được mã ở cuối
→ **Ollama cắt từ ĐẦU prompt**.

### Mức bằng chứng — phân định rõ hai tầng

**✅ ĐÃ XÁC NHẬN: có cắt đầu vào.** Với **prompt y hệt nhau**, tầng phục vụ tự báo số token đầu vào
nó xử lý:

| Ca | Mặc định | `num_ctx=8192` |
|---|---|---|
| 13 | **2.050** | 4.584 |
| 51 | **2.050** | 5.974 |
| 54 | **2.050** | 6.517 |

Cùng một prompt mà số token được xử lý chênh 2–3 lần → **giới hạn context làm GIẢM lượng đầu vào
được xử lý ở cấu hình mặc định**. Đây là bằng chứng từ chính kế toán token của tầng phục vụ.

**⚠️ Nhưng `pEval` cao KHÔNG tự chứng minh toàn bộ prompt đã được giữ.** Muốn khẳng định điều đó phải
đối chiếu với **tổng token kỳ vọng**, tính bằng đúng tokenizer của mô hình và đúng serving template
tương ứng — **chưa làm**. Hiện chỉ kết luận được là *ít hơn ở mặc định*, không phải *đủ ở 8192*.

**❌ CHƯA XÁC ĐỊNH: phần nào bị mất.** Tôi đã thử hai phép dò (đặt chỉ dấu ở đầu và cuối prompt, hỏi
lại mô hình) và **cả hai đều thất bại**: mô hình 1,5B không truy hồi được chỉ dấu ngay cả khi
`pEval` = 4.584–6.480 chứng tỏ prompt **không** bị cắt. Đó là giới hạn truy hồi của mô hình nhỏ, không
phải tín hiệu cắt. Nên phép dò **không phân định được**.

Giả thuyết "khối `### Instruction` ở đầu bị mất" **phù hợp với** hành vi cắt-từ-đầu quan sát được ở
phép thử mã bí mật (phần đuôi sống sót ở ~3.500 token), nhưng phép thử đó chạy trên văn bản độn tổng
hợp, **không phải** prompt L4 thật. **Chưa chứng minh.**

Cách phát biểu đúng: *can thiệp context (`num_ctx=8192`) cải thiện kết quả một cách nhất quán, phù hợp
với giả thuyết cắt đầu vào; đã xác nhận có cắt, chưa xác định phần nào bị mất.*

**Giả thuyết cơ chế (chưa chứng minh).** Harness của tôi **không đặt `num_ctx`**. Prompt có cấu trúc:

```
### Instruction          <-- yêu cầu định dạng: **Tóm tắt** → **Vấn đề chính** → ...
### Input                <-- gói bằng chứng JSON
### Output
```

Nếu cắt từ đầu thì với L4 (~2.350 token) khối `### Instruction` sẽ mất, nên mô hình không nhận được
yêu cầu định dạng. L1–L3 (224–637 token) dưới ngưỡng nên không bị ảnh hưởng — điều này **khớp** với
việc chỉ L4 hỏng. Nhưng đó là **suy luận nhất quán**, không phải xác minh trực tiếp.

**Kiểm chứng** (n=25, `num_ctx=8192`):

| Chỉ số | Mặc định | `num_ctx=8192` |
|---|---|---|
| FT·L4 **Fmt** | 0,343 | **1,000** |
| FT·L4 NumFid | 0,344 | **0,685** |
| FT·L4 ảo giác | 0,0424 | **0,0038** |
| FT·L4 ROUGE-L | 0,1653 | **0,2566** |
| base·L4 Fmt | 0,279 | **1,000** |
| Số ca pEval = 2.050 | 51/70 | **0/25** |

Ba quan sát khó hiểu trước đây **nhất quán** với giả thuyết này: cả ba mô hình cùng hỏng ở đúng L4;
nới `num_predict` không cứu được; và có output tiếng Trung. Nhất quán ≠ chứng minh.

**Hệ quả — đảo ngược H4-2.** Kết luận cũ là *"cấu hình production L4 tệ nhất, nên rút gọn về L3"*.
Với context đủ, FT·L4 **vượt** L3 ở cả NumFid (0,685 vs 0,655) và ROUGE-L (0,2566 vs 0,2513).
Tôi suýt khuyến nghị rút gọn packet để chữa một lỗi **do chính mình gây ra**.

⚠️ n=25 khác cỡ mẫu với n=70 — **đang chạy đủ 70 cho L3+L4** để so ghép cặp đúng. Chưa chốt.

**Còn nguyên hai vấn đề:** lượng tử hoá vẫn khác (I2), và **`Fmt` vẫn trộn lỗi ngôn ngữ với lỗi bố
cục**. Việc Fmt lên 1,000 khi có đủ context gợi ý phần lớn lỗi ngôn ngữ cũng do mất chỉ dẫn, nhưng
phải tách hai loại mới khẳng định được.

### I12. Bài học phương pháp

Ba vòng phản biện, **ba kết luận "mô hình/phương pháp kém" của tôi đều hoá ra là lỗi trong harness
của chính tôi**:

| Kết luận sai | Nguyên nhân thật |
|---|---|
| "LLM thắng template về độ trung thực" | Template bỏ qua `ratio` dạng chuỗi |
| "Fine-tuning không mua sự thật" | Đối chứng sai model (3B vs 1,5B) |
| "Packet dài phá vỡ mô hình nhỏ" | Không đặt `num_ctx`, Ollama cắt mất khối Instruction |

**Quy tắc rút ra:** trước khi quy một kết quả kém cho **đối tượng nghiên cứu**, phải loại trừ **công
cụ đo** — baseline có được cài đúng không, đối chứng có đúng một biến không, tầng phục vụ có giữ
nguyên đầu vào không. Bootstrap và CI **không** phát hiện được nhóm lỗi này: chúng đo độ ổn định của
một phép đo, không đo tính đúng của phép đo.

### I13. Bốn điều khoá thêm trước khi mở holdout (23/09/2026)

**a) Kiểm độc lập — đã chạy đủ, tất cả bằng 0** (`HOLDOUT_INDEPENDENCE.json`):

| Trục kiểm | Kết quả |
|---|---|
| Trùng **nội dung** với train của adapter | 0 |
| Trùng **nội dung** với val | 0 |
| Giao **chỉ số** với 70 ca phát triển | 0 |
| Giao với pilot / expert_kit / pairwise | 0 / 0 / 0 |
| Trùng **nội dung** với ca đã dùng (biến thể cùng nguồn) | 0 |
| Trùng nội dung **nội bộ** holdout | 0 |

Đã lưu **cả ba** loại định danh: hash chỉ số `aae8acb6…`, **hash nội dung** `5637126c…`, và
**phiên bản dataset** (`synthetic_samples_v2.jsonl`, 63.670.860 bytes, sha256 `07705f1f…`).

**b) Chỉ số chính và quy tắc kết luận — đã tiền đăng ký** (`PREREGISTRATION.md`):
chỉ số xác nhận **duy nhất** là `num_fid`; năm chỉ số còn lại là **phụ, thăm dò, không dùng kết luận**;
ba giả thuyết H1–H3 hiệu chỉnh **Holm–Bonferroni** α = 0,05. **Cấm chọn chỉ số thắng sau khi xem kết quả.**

**c) BLEU — CI chưa làm tròn:** cận dưới thật là **+0,000567** (không phải +0,000). Phân biệt được về
kỹ thuật, nhưng **biên cực mỏng**, và kể cả vậy nó chỉ là cải thiện **độ trùng văn bản tham chiếu**.
Không dùng làm căn cứ.

| Chỉ số (L4 − L3) | Δ | CI 95% chưa làm tròn |
|---|---|---|
| bleu4 | +0,012717 | [+0,000567; +0,025374] |
| rouge_l | +0,017225 | [+0,003633; +0,031362] |
| num_fid | +0,041905 | [−0,011020; +0,094830] |

**d) Fmt — chênh lệch từng ca:** **70/70 ca chênh đúng 0**, phân bố `{0.0: 70}`; cả hai nhánh có
min = 0,75. Tức không chỉ trung bình bằng nhau mà **từng ca đều bằng nhau**. Dù vậy vẫn **chỉ nói
được**: *không quan sát thấy khác biệt trên tập này*. Muốn kết luận **tương đương** phải đặt trước
biên tương đương và dùng TOST — **chưa đặt**. Nhiều khả năng chỉ số này quá thô để phân biệt L3/L4.

## Giới hạn của chính báo cáo này

Tìm có mục tiêu, không PRISMA. DBLP không truy cập được (chặn bot) nên có thể sót công trình ở SIGMOD/EDBT/ICDT. Semantic Scholar trả 429, không dùng được để kiểm chéo. Xếp hạng Q của PVLDB, Data Science and Engineering và ACM JDIQ để `[CẦN XÁC MINH]`, không tự gán. Kết luận "khe còn lại" ở A3 **đã được xác minh bằng toàn văn** (xem Phần D), không còn dựa trên abstract. Kết luận "trống" ở A4 và A5 là kết quả truy vấn, không phải chứng minh phủ định.


F5 đã được đo lần đầu tiên. Kết quả ở FINDINGS_F5.md.

Giao thức: structural holdout seed=42 (3 combo chưa từng thấy, test=1339), n=70, hai mô hình để tách fine-tuning khỏi evidence, token budget cố định, bootstrap ghép cặp 5.000 lần.

Điều kiện	NumFid	Ảo giác	ROUGE-L	Fmt	pTok
T tất định	0,570	0,0000	0,2025	1,00	0
FT · L1 score-only	0,253	0,0214	0,1654	1,00	224
FT · L2 +rule	0,508	0,0154	0,2290	1,00	337
FT · L3 +context	0,655	0,0059	0,2513	1,00	616
FT · L4 full EP	0,344	0,0424	0,1653	0,34	2350
Base · L2	0,719	0,0029	0,1691	1,00	358
Base · L4	0,297	0,0078	0,1432	0,35	2356
Bốn kết luận, tất cả có kiểm định
1. ✅ Evidence Packet CÓ đóng góp — luận điểm trung tâm đứng vững. L1→L3: NumFid +0,4024 [0,3553; 0,4496], ảo giác −0,0154 [−0,0199; −0,0116]. Cả hai có ý nghĩa. Sau khi sửa, luận văn được phép tuyên bố điều này kèm CI.

2. ❌ Cấu hình production (L4) là cấu hình TỆ NHẤT. Sụp trên cả hai mô hình: NumFid −0,3114, ảo giác +0,0365, định dạng −0,6571 — đều có ý nghĩa. Gói 2.350 token phá vỡ mô hình nhỏ. Đây là việc sửa được ngay: hệ thống đang gửi gói đầy đủ, mà mức L3 tốt hơn hẳn.

3. ⚠️ Fine-tuning mua VĂN PHONG, không mua SỰ THẬT. Cùng mức L3: ROUGE-L +0,0792 có ý nghĩa; NumFid +0,0083 CI chứa 0; ảo giác +0,0037 có ý nghĩa và tệ hơn. Luận văn đang dùng BLEU 0,1423 / ROUGE-L 0,3326 làm bằng chứng fine-tune thành công — phép đo cho thấy hai chỉ số đó bắt văn phong, không bắt tính đúng. Đúng cảnh báo ở chuong4.tex:807, nay có số.

4. ⚖️ LLM thắng template về độ trung thực, không bao giờ thắng về ảo giác. FT·L3 vượt template ở NumFid (+0,0853) và ROUGE-L (+0,0488), đều có ý nghĩa. Nhưng template đạt ảo giác 0,0000 tuyệt đối.

Tôi phải đính chính pilot: ở n=3 tôi báo "template thắng mọi điều kiện LLM về NumFid". Ở n=70 điều đó sai — cấu hình LLM tốt nhất vượt template có ý nghĩa. Kết luận đúng: LLM đáng dùng, nhưng mọi tuyên bố "không ảo giác" phải thuộc về template.

Còn nợ: LLM-as-Judge và đánh giá chuyên gia vẫn chưa chạy — bốn chỉ số này đo độ trung thực với gói bằng chứng, không đo tính hữu ích nghiệp vụ. Ngoài ra dữ liệu là tổng hợp, và kết luận 2 gắn với lớp mô hình 1,5B/3B.

Việc tiếp theo có giá trị nhất: viết lại chuong4.tex §4.5 theo bốn kết luận này — đặc biệt kết luận 2 và 3, vì chúng mâu thuẫn với những gì bản thảo đang nói.

LLM-as-Judge: đã chạy, và thất bại calibration
Judge (qwen2.5:3b) có phân biệt được — dùng đủ thang 1–5 (sd 1,238), xếp L4 thấp nhất đúng như fidelity. Nhưng phép kiểm quyết định mà luận văn đã hứa thì hỏng:

Cặp	ρ
judge accuracy ↔ NumFid	0,174 — gần như không tương quan
judge groundedness ↔ (−ảo giác)	−0,101 — ngược dấu
Riêng template tất định	−0,389 — nghịch đảo rõ
Tôi đã kiểm giả thuyết cạnh tranh thay vì kết luận vội: có thể 5 tiêu chí trừu tượng là quá khó? Giao judge nhiệm vụ hẹp — chỉ đếm số khớp/không khớp — cho ρ = −0,130, không khá hơn. Vậy lỗi là năng lực judge 3B, không phải thiết kế prompt.

Chi tiết đáng sợ nhất: judge cho trung bình tổng thể gần đúng (0,744 so với NumFid 0,696) nhưng thứ hạng từng mẫu sai. Đó là dạng hỏng nguy hiểm nhất — sinh ra con số trông hợp lý mà không mang tín hiệu.

Nên tôi dừng, không chạy đủ 630 lần chấm. Báo cáo chúng như "chất lượng nghiệp vụ" sẽ tạo đúng loại số liệu mà cả đợt rà soát này đang chống. Trong luận văn, hạng mục này phải ghi ĐÃ CHẠY — KHÔNG ĐẠT CALIBRATION kèm hai con số ρ. Đó là kết quả, không phải việc còn treo.

Nó cũng xác nhận cảnh báo ở chuong4.tex:807 theo hướng mạnh hơn bản thảo nghĩ: không chỉ BLEU/ROUGE không đo được chất lượng nghiệp vụ, mà LLM-as-Judge quy mô nhỏ cũng không.

Đánh giá chuyên gia: tôi không làm được — đã dựng công cụ thay thế
Việc này cần người có nền kiểm toán/bất động sản thật. Tôi không bịa số. Bộ công cụ ở expert_kit/:

108 báo cáo, phân tầng 12 mẫu × 9 điều kiện
Làm mù: tệp đặt tên R001…, khoá giải mã tách riêng, không đưa giám khảo
15 phiếu chồng lặp giữa 2 giám khảo để đo Krippendorff α
score_expert.py tính trung bình theo điều kiện + độ đồng thuận, và chặn: α < 0,67 thì không được dùng làm bằng chứng
Trạng thái phải ghi vào luận văn: CHƯA CHẠY, công cụ đã sẵn sàng.

Bảng trạng thái sau hôm nay
Đóng góp	Trạng thái
F5 — Evidence Packet (độ trung thực)	✅ ĐÃ CHỨNG MINH có kiểm định — mạnh nhất hiện có
F5 — LLM-as-Judge	❌ Đã chạy, không đạt calibration
F5 — chất lượng nghiệp vụ	⏳ Chưa chạy, công cụ sẵn sàng
A5 — benchmark quyết định	✅ Đứng vững
Chuyển miền hợp đồng hiệu lực	❌ Hoà an toàn, thua chi phí
Hướng D ở Phần G — "quay về đóng góp luận văn đã tuyên bố" — không còn là đường lui, nó nay là đường mạnh nhất.

Việc tiếp theo có giá trị nhất: viết lại chuong4.tex §4.5 theo bốn kết luận H4, đặc biệt kết luận 2 (cấu hình production L4 là tệ nhất) và 3 (fine-tuning mua văn phong chứ không mua sự thật) — vì cả hai mâu thuẫn với những gì bản thảo đang nói.


