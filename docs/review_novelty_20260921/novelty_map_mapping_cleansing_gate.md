# Bản đồ khoảng trống — nhánh AI trong mapping/cleansing/ETL và Validation & reconciliation làm gate

Ngày: 22/09/2026. Chế độ: deep-research (lit-review + architect), chạy inline.
Phạm vi: tìm có mục tiêu qua OpenAlex + CrossRef (DBLP chặn bot; Semantic Scholar trả 429).
Log xác minh: `runs/crossref_verification_20260922.json`. Mọi nguồn dưới đây đã fetch qua CrossRef.

> **Cảnh báo phương pháp.** Đây không phải systematic review theo PRISMA. "Không tìm thấy" dưới đây nghĩa là *truy vấn có mục tiêu không trả về nguồn đạt chuẩn workspace*, không phải chứng minh không tồn tại.

---

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
> 1. **Benchmark đầu tiên** gán nhãn quyết định xuất bản ở mức file/job với **oracle độc lập ba tầng** (hệ đích thật nhận/từ chối, đối soát nguồn↔đích, nhãn chuyên gia) — mục A5, vẫn chưa ai làm.
> 2. **Đánh giá nhất quán can thiệp**, không chỉ replay gán nhãn lại: thật sự áp bản sửa ứng viên và chạy lại — đúng thứ §VI của họ tự nhận không làm được.
> 3. **Tách được** lỗi tại thời điểm đánh giá khỏi hết hiệu lực theo thời gian, nhờ oracle tất định — thứ họ tự nhận không tách được.

Ba nhãn vẫn cấm dùng đặt tên: *verdict freshness*, *freshness contract*, *validity horizon*. Nhãn an toàn có thể dùng: **publication-gate TOCTOU**, **exogenous verdict expiry**, **decision-event benchmark**.

### F7. Điều chỉnh bắt buộc cho thiết kế ở Phần C

- Thang B0–B4 giữ nguyên, nhưng **B2 phải đổi tên và đổi cách trích**: không còn là "kiểm soát freshness" tự nghĩ ra, mà là *áp dụng freshness contract theo Shraga et al. 2026 cho miền dữ liệu*.
- "Độ dài cửa sổ lệch (0, 1, 5, 20 sự kiện)" phải trích $K_{live}$ của họ và giải thích vì sao đơn vị là **sự kiện thay đổi** chứ không phải bước mô phỏng.
- **Bổ sung chỉ số thứ ba** mà thiết kế cũ thiếu: ngoài unsafe-acceptance và false-block, phải có *all-candidate verdict-change rate* — đo trên mọi gói xuất trước khi lọc theo tập được cho qua. Thiếu nó thì không so được với con số 5,3–48,4% của họ.
- **B2′ (revalidation tất định lúc export) vẫn là baseline sống còn** và nay còn quan trọng hơn: nếu chạy lại validation lúc export rẻ và an toàn ngang cơ chế hợp đồng hiệu lực, thì phần chuyển miền mất giá trị, chỉ còn benchmark (A5) đứng được.

## Giới hạn của chính báo cáo này

Tìm có mục tiêu, không PRISMA. DBLP không truy cập được (chặn bot) nên có thể sót công trình ở SIGMOD/EDBT/ICDT. Semantic Scholar trả 429, không dùng được để kiểm chéo. Xếp hạng Q của PVLDB, Data Science and Engineering và ACM JDIQ để `[CẦN XÁC MINH]`, không tự gán. Kết luận "khe còn lại" ở A3 **đã được xác minh bằng toàn văn** (xem Phần D), không còn dựa trên abstract. Kết luận "trống" ở A4 và A5 là kết quả truy vấn, không phải chứng minh phủ định.
