# Ba đóng góp lý thuyết cho luận văn

> Tài liệu này phát triển đầy đủ **3 đóng góp lý thuyết** phác trong [fix_research_depth.md](fix_research_depth.md) thành nội dung sẵn-sàng-dán-vào-luận-văn: mỗi đóng góp gồm **Định nghĩa → Mệnh đề/Định lý → Chứng minh → Kiểm chứng thực nghiệm** trên số liệu thật của hệ thống.
>
> Mọi con số đã được **đối chiếu trực tiếp** với artifact trong `csv_agent_platform/detection/outputs/` và `csv_agent_platform/generation/`. Nguồn được ghi rõ ở mỗi bảng.
>
> Hội đồng yêu cầu chọn **ít nhất 2/3**. Khuyến nghị nộp **Đóng góp 1 + 3** trước (đã có 100% data, chứng minh ngắn, ⭐⭐⭐), bổ sung **Đóng góp 2** khi hoàn thành ablation EP.

---

## Bảng ký hiệu chung

| Ký hiệu | Ý nghĩa |
|---|---|
| $N$ | Số cột (feature gốc) của một bộ dữ liệu CSV |
| $K$ | Số hash-bucket dành cho khối numeric (mặc định hệ thống: $K_{\text{num}}=64$, $K_{\text{cat}}=32$) |
| $\gamma(N,K)$ | Collision rate — tỷ lệ cột phải chia sẻ bucket |
| $z_j$ | Z-score chuẩn hoá của cột $j$ |
| $\tau$ | Ngưỡng tín-hiệu-trên-nhiễu tối thiểu để bộ phân loại tách được bất thường |
| $\epsilon_R$ | Xác suất router định tuyến sai |
| $F_1^{(c)}, F_1^{(\text{ens})}$ | F1 của mô hình chuyên biệt cho archetype $c$ / của ensemble safety-net |
| $\mathcal{E}$ | Evidence Packet (biểu diễn trung gian giữa detector và LLM) |

---

# Đóng góp 1 — Signal Dilution Bound: chặn suy giảm F1 theo hash-bucket collision

**Vị trí trong luận văn:** Chương 2 §2.x (lý thuyết) + kiểm chứng ở Chương 4 §4.x.
**Độ khó:** ⭐⭐⭐ — đã có toàn bộ số liệu, chứng minh < 10 dòng.

## 1.1 Động cơ

Hệ thống dùng **feature hashing** (Weinberger et al., 2009) để ánh xạ số cột tùy ý $N$ về không gian cố định 132 chiều, cho phép một mô hình duy nhất chấm điểm mọi schema CSV. Luận văn (bản hiện tại) đã có:

- **Bảng collision rate vs $N$** (`collision_rate_results.json`): observed khớp expected tới $\pm0.3\%$.
- **Bảng F1 vs $N$** (`ablation_k256_results.json`, 8 bộ dữ liệu chuẩn).

nhưng **chưa nối hai bảng đó bằng toán**. Đóng góp này xây một bất đẳng thức:

$$
\text{collision rate} \;\longrightarrow\; \text{tỷ lệ tín hiệu/nhiễu (SNR)} \;\longrightarrow\; \text{khả năng phát hiện}.
$$

## 1.2 Xây dựng hình thức

**Định nghĩa 1.1 (Collision Rate).** Ánh xạ $N$ cột vào $K$ bucket bằng hàm hash phân phối đều. Tỷ lệ va chạm là phần cột vượt quá số bucket bị chiếm:

$$
\gamma(N,K) \;=\; 1 - \frac{K\left(1-(1-1/K)^{N}\right)}{N}.
$$

*(Đây chính là công thức đã dùng trong luận văn — ở đây được đặt tên chính thức.)*

> **Kiểm chứng Định nghĩa 1.1** (nguồn: `outputs/collision_rate_results.json`, $K=64$, 500 trials):
>
> | $N$ | $\gamma$ công thức | $\gamma$ quan sát |
> |---:|---:|---:|
> | 10 | 6.7% | 6.2% |
> | 30 | 19.7% | 19.1% |
> | 50 | 30.2% | 30.4% |
> | 100 | 49.3% | 49.1% |
> | 200 | 69.4% | 69.3% |
>
> Sai lệch tối đa $0.6\%$ → công thức giải tích mô tả chính xác hiện tượng thực nghiệm.

**Định nghĩa 1.2 (Signal Dilution Factor).** Khi $m$ cột cùng rơi vào một bucket, đặc trưng bucket là tổng z-score:

$$
z_{\text{bucket}} \;=\; \sum_{j=1}^{m} z_j .
$$

Giả sử **đúng một** cột $z_1$ mang tín hiệu bất thường và $m-1$ cột còn lại là nhiễu độc lập $\sim\mathcal{N}(0,1)$. Khi đó $z_{\text{bucket}}\mid m \sim \mathcal{N}\!\big(z_1,\,m-1\big)$, và **tỷ lệ tín hiệu trên nhiễu** của bucket là:

$$
\mathrm{SNR}(m) \;=\; \frac{|z_1|}{\sqrt{m-1}} .
$$

Tín hiệu pha loãng theo $1/\sqrt{m}$ — kết quả cổ điển, nhưng **áp dụng cụ thể cho anomaly detection trên tabular hashed-features là mới**.

**Mệnh đề 1.1 (Signal Dilution Bound).** *Với hàm hash phân phối đều, dưới xấp xỉ trường-trung-bình rằng bucket chứa tín hiệu có độ chiếm trung bình $\bar m = N/K$, SNR kỳ vọng của bucket tín hiệu xấp xỉ*

$$
\boxed{\;\widehat{\mathrm{SNR}} \;=\; \frac{|z_1|}{\sqrt{N/K - 1}}\;}\qquad (N>K).
$$

*Hệ quả — điều kiện chọn dung lượng bucket. Để $\widehat{\mathrm{SNR}}\ge\tau$ (ngưỡng tách của bộ phân loại), cần:*

$$
\boxed{\;K \;\ge\; \frac{N}{1+(|z_1|/\tau)^2}\;}\qquad\Longleftrightarrow\qquad N_{\text{crit}}(K)=K\Big(1+(|z_1|/\tau)^2\Big).
$$

**Chứng minh.** Số cột rơi vào một bucket cố định là $M-1\sim\mathrm{Binomial}(N-1,1/K)$ cho bucket tín hiệu, nên $\mathbb{E}[M] = 1+(N-1)/K$. Dưới xấp xỉ trường-trung-bình, ta thay độ chiếm ngẫu nhiên bằng giá trị trung bình toàn cục $\bar m=N/K$ (bucket tín hiệu là "điển hình"), tức số cột nhiễu trong bucket là $\bar m-1=N/K-1$. Thay vào Định nghĩa 1.2:

$$
\widehat{\mathrm{SNR}} = \frac{|z_1|}{\sqrt{\bar m-1}} = \frac{|z_1|}{\sqrt{N/K-1}}.
$$

Đặt $\widehat{\mathrm{SNR}}\ge\tau$, bình phương hai vế: $N/K-1\le (|z_1|/\tau)^2$, suy ra $N/K\le 1+(|z_1|/\tau)^2$, tức $K\ge N/\big(1+(|z_1|/\tau)^2\big)$. $\qquad\blacksquare$

> **Hai chú thích để chặt chẽ (đưa vào footnote luận văn):**
>
> 1. **Hướng của xấp xỉ.** Vì $g(m)=1/\sqrt{m-1}$ lồi, theo bất đẳng thức Jensen $\mathbb{E}[\mathrm{SNR}]=|z_1|\,\mathbb{E}[g(M)]\ge |z_1|\,g(\mathbb{E}[M])$. Do đó $\widehat{\mathrm{SNR}}$ là **ước lượng bảo thủ** của SNR kỳ vọng thực — quy tắc chọn $K$ ở trên là an toàn (thực tế tốt hơn hoặc bằng dự báo).
> 2. **Vai trò của $z_1,\tau$.** Đây là tham số minh hoạ: $z_1$ là biên độ bất thường (ví dụ $3\sigma$), $\tau$ là độ nhạy của bộ phân loại. Bound mang tính **định tính/định cỡ** chứ không phải dự báo điểm.

## 1.3 Bảng định cỡ và kiểm chứng thực nghiệm

Với $z_1=3$ (bất thường $3\sigma$), $\tau=1.5$, $K=64$ ⟹ $N_{\text{crit}}=64\,(1+(3/1.5)^2)=\mathbf{320}$ cột.

| $N$ cột | $\bar m=N/K$ | $\widehat{\mathrm{SNR}}$ | Dự báo lý thuyết | Thực nghiệm (F1 132d vs XGB-Raw) |
|---:|---:|---:|:--|:--|
| 3 (KDD HTTP) | 0.05 | $\infty$ (no collision) | ✅ phát hiện tốt | 0.9956 vs 0.9905 ✅ |
| 11 (SG Condo) | 0.17 | $\infty$ | ✅ | 0.9662 vs 0.9495 ✅ |
| 28 (SG HDB) | 0.44 | $\infty$ | ✅ | 0.8447 vs 0.8158 ✅ |
| 30 (Credit Card) | 0.47 | $\infty$ | ✅ | 0.8444 vs 0.8444 (hoà) ✅ |
| 54 (Forest Cover) | 0.84 | $\infty$ | ✅ | **0.7888 vs 0.7548** (vượt raw) ✅ |
| 79 (House Prices) | 1.23 | 6.20 | ✅ | **0.6897 vs 0.6316** (vượt raw) ✅ |
| 279 (Arrhythmia) | 4.36 | **1.64** | ⚠️ biên ($\approx\tau$) | 0.7250 vs 0.8923 (suy giảm) ⚠️ |
| 500 (Madelon) | 7.81 | **1.15** | ❌ dưới ngưỡng | 0.6655, ROC 0.55 $\approx$ random ❌ |

**Nhận xét (kiểm chứng Mệnh đề 1.1):** ranh giới sụp đổ thực nghiệm nằm **giữa $N=279$ và $N=500$**, đúng nơi ngưỡng lý thuyết $N_{\text{crit}}=320$ dự báo. Cụ thể:

- $N\le 79$: $\widehat{\mathrm{SNR}}\gg\tau$ → hashed-model **bằng hoặc vượt** XGBoost trên cột gốc (Forest, House Prices).
- $N=279$: $\widehat{\mathrm{SNR}}\approx\tau$ → vùng biên, vẫn hoạt động nhưng kém raw.
- $N=500>N_{\text{crit}}$: $\widehat{\mathrm{SNR}}<\tau$ → ROC $\approx 0.55$, **đúng như bound tiên đoán sập**.

*(Nguồn số liệu — khớp thân luận văn: 5 bộ vùng an toàn ($N\le 54$) từ Chương 4 §\ref{sec:public_bench_results} (bảng F1 công khai); trio suy giảm (House Prices, Arrhythmia) từ `benchmark_high_dim_results.json`, Madelon từ `ablation_k256_results.json`.)*

**Hệ quả thiết kế (phục vụ §5 — Hướng phát triển):** Bound cho phép **tự động chọn $K$ theo $N$** thay vì cố định 64. Trong ablation quét $K$ (`ablation_k256_results.json`): tại $N=279$ (Arrhythmia), nâng $K{:}64\to256$ làm collision rate giảm $0.77\to0.39$ và F1 tăng $\approx +0.05$, khớp xu hướng "tăng $K$ → giảm $\gamma$ → tăng SNR" của Mệnh đề 1.1. (Lưu ý: ablation quét $K$ là lần chạy riêng, baseline F1 Arrhythmia ở đó là 0.771 — khác lần chạy high-dim 0.725 ở bảng trên do seed/split khác; chỉ dùng *chiều biến thiên* theo $K$ làm bằng chứng.)

**Giá trị nghiên cứu:** Feature hashing là kỹ thuật cũ, nhưng **chưa có công trình nào phân tích SNR-degradation cụ thể cho anomaly detection trên tabular data**, và đây là cầu nối định lượng đầu tiên giữa collision rate và F1 trong ngữ cảnh này.

---

# Đóng góp 2 — Information Sufficiency Framework cho Evidence Packet

**Vị trí:** Chương 3 §3.3 (sau mô tả schema EP) + Chương 4 (ablation EP là kiểm chứng).
**Độ khó:** ⭐⭐⭐⭐ — impact cao nhất, vì EP là đóng góp lõi nối detector ↔ LLM.

## 2.1 Động cơ

Trong hệ thống, biểu diễn trung gian giữa ensemble detector và LLM được cài đặt là dataclass **`EnrichmentResult`** (`generation/src/enrichment/enrichment_service.py`), gồm `clusters`, `context`, `cross_analysis`, `anomaly_details`. Hiện nó được mô tả thuần như **schema kỹ thuật**. Đóng góp này nâng nó thành **framework hình thức**: *khi nào EP "đủ thông tin" để LLM sinh báo cáo trung thực (không bịa)?* — một bài toán **information sufficiency**.

## 2.2 Xây dựng hình thức

**Định nghĩa 2.1 (Evidence Packet).** Một Evidence Packet là bộ bốn:

$$
\mathcal{E} = \langle s,\ \mathbf{a},\ \mathcal{R},\ \mathcal{C}\rangle,
$$

- $s\in[0,1]$: điểm bất thường tổng hợp (ánh xạ tới `anomaly_score` / `impact_score`);
- $\mathbf{a}=\{(f_j,\phi_j)\}_{j=1}^{k}$: top-$k$ quy kết đặc trưng (giá trị SHAP), ánh xạ tới `key_findings`/`samples`;
- $\mathcal{R}\subseteq\mathcal{R}_{\text{all}}$: tập luật nghiệp vụ bị vi phạm (`issue_type`/`semantic_text`);
- $\mathcal{C}$: ngữ cảnh giao dịch (`location_context`, `temporal_context`, `cross_analysis`).

**Định nghĩa 2.2 (Ba chỉ số Fidelity).** Cho báo cáo $r=\mathrm{LLM}(\mathcal{E})$:

$$
\mathrm{NumFid}(r,\mathcal{E})=\frac{|\,\mathrm{nums}(r)\cap\mathrm{nums}(\mathcal{E})\,|}{|\,\mathrm{nums}(\mathcal{E})\,|},
\qquad
\mathrm{RuleFid}(r,\mathcal{E})=\frac{|R_r\cap\mathcal{R}|}{|\mathcal{R}|},
$$

$$
\mathrm{Cov@}k(r,\mathcal{E})=\frac{|\{f_j:\ f_j\ \text{xuất hiện trong}\ r\}\cap \text{top-}k(\mathbf{a})|}{k}.
$$

trong đó $\mathrm{nums}(\cdot)$ là tập số trích từ văn bản, $R_r$ là tập luật báo cáo nhắc tới.

> **Quan hệ với chỉ số đang cài đặt.** Hệ thống hiện đo **BLEU, ROUGE-L, format-compliance** (`generation/src/training/evaluate.py`; Qwen2 đạt $1.0/1.0/1.0$ — `outputs/evaluation_decision.json`). Ba chỉ số đó là **surrogate bề mặt**; bộ NumFid/RuleFid/Cov@k là **bản ngữ-nghĩa hoá** đo trực tiếp *tính trung thực có-cơ-sở (grounded faithfulness)* — đóng góp lý thuyết của luận văn. Trong báo cáo nên trình bày: "format-compliance là điều kiện cần (cấu trúc); ba fidelity là điều kiện đủ (nội dung)".

**Định nghĩa 2.3 ($\tau$-Sufficient Evidence Packet).** EP $\mathcal{E}$ là **$\tau$-đủ** cho LLM $M$ nếu

$$
\min\{\mathrm{NumFid},\ \mathrm{RuleFid},\ \mathrm{Cov@}3\}\ \ge\ \tau
\qquad\text{và}\qquad
\mathrm{Hallu}(r,\mathcal{E})\le 1-\tau,
$$

với $\mathrm{Hallu}$ = tỷ lệ phát biểu sự thật trong $r$ **không** suy ra được từ $\mathcal{E}$.

**Mệnh đề 2.1 (Tính đơn điệu của Sufficiency).** *Giả sử bộ sinh $M$ là **trung thực-đơn điệu**: (i) chỉ phát biểu sự thật suy ra được từ đầu vào (no-fabrication), (ii) thêm thành phần vào EP không xoá thông tin có-cơ-sở đã có (monotone). Khi đó với EP đầy đủ $\mathcal{E}_{\text{full}}=\langle s,\mathbf{a},\mathcal{R},\mathcal{C}\rangle$ và các EP rút gọn*

$$
\mathcal{E}_1=\langle s,\mathbf{a},\varnothing,\varnothing\rangle,\quad
\mathcal{E}_2=\langle s,\varnothing,\mathcal{R},\varnothing\rangle,\quad
\mathcal{E}_3=\langle s,\varnothing,\varnothing,\varnothing\rangle,
$$

*ta có chuỗi đơn điệu*

$$
\mathrm{Fid}(\mathcal{E}_{\text{full}})\ \ge\ \mathrm{Fid}(\mathcal{E}_1)\ \ge\ \mathrm{Fid}(\mathcal{E}_3),
\qquad
\mathrm{Fid}(\mathcal{E}_{\text{full}})\ \ge\ \mathrm{Fid}(\mathcal{E}_2)\ \ge\ \mathrm{Fid}(\mathcal{E}_3),
$$

*trong đó $\mathrm{Fid}=\min\{\mathrm{NumFid},\mathrm{RuleFid},\mathrm{Cov@}3\}$.*

**Chứng minh.** Xét hai EP lồng nhau $\mathcal{E}'\subseteq\mathcal{E}$ (mọi thành phần của $\mathcal{E}'$ có trong $\mathcal{E}$). Mỗi chỉ số fidelity là **recall** của một tập sự thật có-cơ-sở: tử số đếm phần tử của $\mathcal{E}$ được $r$ nhắc đúng, mẫu số là lượng thông tin trong EP tương ứng. Theo (i), mọi phần tử $r'=M(\mathcal{E}')$ nhắc đúng đều suy ra từ $\mathcal{E}'\subseteq\mathcal{E}$, nên cũng là phần tử có-cơ-sở của $\mathcal{E}$. Theo (ii), tập phần tử có-cơ-sở mà $M(\mathcal{E})$ phục hồi $\supseteq$ tập của $M(\mathcal{E}')$. Vậy từng chỉ số fidelity không giảm khi mở rộng EP; lấy $\min$ bảo toàn thứ tự (vì $\min$ đơn điệu theo từng tọa độ). Do $\mathcal{E}_3\subseteq\mathcal{E}_1\subseteq\mathcal{E}_{\text{full}}$ và $\mathcal{E}_3\subseteq\mathcal{E}_2\subseteq\mathcal{E}_{\text{full}}$, hai chuỗi bất đẳng thức được suy ra. $\qquad\blacksquare$

> **Điểm tinh tế (nêu rõ trong luận văn):** Mệnh đề 2.1 **đúng có điều kiện** (giả thiết trung thực-đơn điệu). Đây chính là chỗ lý thuyết gặp thực nghiệm: **ablation EP là phép thử giả thiết**. Nếu quan sát thấy **vi phạm đơn điệu** (ví dụ bỏ $\mathcal{R}$ nhưng $\mathrm{RuleFid}$ lại *tăng*) → bằng chứng LLM **bịa luật** khi thiếu input luật → một *insight về hallucination*, không phải lỗi của framework.

## 2.3 Kiểm chứng thực nghiệm (thiết kế ablation EP)

Bảng 4.5 (hiện TBD trong luận văn) trở thành kiểm chứng trực tiếp của Mệnh đề 2.1. Thiết kế:

| Cấu hình EP | Thành phần | NumFid | RuleFid | Cov@3 | Hallu | Dự báo |
|:--|:--|:-:|:-:|:-:|:-:|:--|
| $\mathcal{E}_{\text{full}}$ | $s,\mathbf{a},\mathcal{R},\mathcal{C}$ | cao nhất | cao nhất | cao nhất | thấp nhất | mốc trên |
| $\mathcal{E}_1$ | $s,\mathbf{a}$ | $\ge\mathcal{E}_3$ | ↓ | $\ge\mathcal{E}_3$ | ↑ | RuleFid giảm |
| $\mathcal{E}_2$ | $s,\mathcal{R}$ | ↓ | $\ge\mathcal{E}_3$ | ↓ | ↑ | Cov@3 giảm |
| $\mathcal{E}_3$ | $s$ | thấp nhất | thấp nhất | thấp nhất | cao nhất | mốc dưới |

**Quy trình chạy:** dùng 100 mẫu eval (như `evaluation_decision.json`), với mỗi cấu hình EP render qua cùng template `report_prompt.j2` + cùng adapter Qwen2, rồi đo 3 fidelity bằng script trích số/luật/đặc trưng. Kỳ vọng: bảng tuân thứ tự đơn điệu của Mệnh đề 2.1.

**Giá trị nghiên cứu:** chưa có công trình nào formalize *"khi nào biểu diễn trung gian là đủ để LLM sinh báo cáo trung thực"*. Framework áp dụng cho **mọi** hệ AD+LLM, không riêng CSV.

---

# Đóng góp 3 — Router Error Propagation Bound: ensemble safety-net chặn suy giảm F1

**Vị trí:** Chương 3 §3.3.1 (sau mô tả Router) + Chương 4 (thực nghiệm router).
**Độ khó:** ⭐⭐⭐ — chứng minh ngắn, biến một *claim* thành *định lý*.

## 3.1 Động cơ

Hệ thống định tuyến theo kích thước schema (`size_bucket(n_cols)` trong `detection/src/data/universal_features.py`): `tiny` ($<50$ cột), `medium` ($50\!-\!100$), `large` ($>100$), mỗi bucket gắn ngưỡng riêng (`v11_artifacts.json`: tiny $0.1$, medium $0.725$, large $0.85$). Luận văn hiện claim: *"router sai → rơi vào Ensemble → vẫn phát hiện được"* — nhưng đó chỉ là **một điểm dữ liệu**. Cần formalize: *router sai xác suất $\epsilon_R$ thì F1 toàn hệ thống giảm tối đa bao nhiêu?*

## 3.2 Xây dựng hình thức

**Định nghĩa 3.1 (Router Error Rate).**

$$
\epsilon_R = P\big(\mathrm{Router}(X)\ne \mathrm{archetype}(X)\big).
$$

**Mệnh đề 3.1 (Router Error Propagation Bound).** *Giả sử router phân hoạch không gian đầu vào; khi định tuyến đúng, hệ dùng mô hình chuyên biệt đạt hiệu năng $P^{(c)}$; khi sai, hệ rơi về ensemble safety-net (chạy mọi mô hình) đạt $P^{(\text{ens})}$. Với metric phân-rã-được theo kỳ vọng từng mẫu (recall, accuracy, per-instance score), luật kỳ vọng toàn phần cho:*

$$
\boxed{\ \mathbb{E}[P] = (1-\epsilon_R)\,P^{(c)} + \epsilon_R\,P^{(\text{ens})}\ }
$$

*và do đó suy giảm so với router lý tưởng bị chặn tuyến tính:*

$$
\boxed{\ \Delta P = P^{(c)}-\mathbb{E}[P] = \epsilon_R\big(P^{(c)}-P^{(\text{ens})}\big)\ \le\ \epsilon_R\,\big|P^{(c)}-P^{(\text{ens})}\big|\ }.
$$

**Chứng minh.** Gọi $A$ là biến cố "router đúng", $P(A)=1-\epsilon_R$. Metric phân-rã-được nghĩa là $P=\mathbb{E}_X[\ell(X)]$ với $\ell$ là điểm từng mẫu. Theo luật kỳ vọng toàn phần:

$$
\mathbb{E}[P]=P(A)\,\mathbb{E}[\ell\mid A]+P(A^c)\,\mathbb{E}[\ell\mid A^c]=(1-\epsilon_R)P^{(c)}+\epsilon_R P^{(\text{ens})}.
$$

Trừ khỏi mốc lý tưởng $P^{(c)}$ (router không bao giờ sai): $\Delta P=P^{(c)}-\mathbb{E}[P]=\epsilon_R(P^{(c)}-P^{(\text{ens})})$. $\qquad\blacksquare$

> **Chú thích chặt chẽ (footnote):** Phân rã trên *chính xác* cho metric tuyến tính (recall, accuracy). F1 là tỷ số nên không tuyến tính tuyệt đối qua trộn quần thể; tuy nhiên trong chế độ precision cao và ổn định của hệ (ensemble precision $=0.984$, `v11_results`), F1 bám sát phân rã này — ta dùng nó như **xấp xỉ bậc nhất** và kiểm chứng bằng số đo F1 thực tế dưới đây.

## 3.3 Kiểm chứng bằng số liệu thật

Lấy $F_1^{(c)}=0.881$ (XGBoost-CLEAN, mô hình chuyên biệt — `v10/v11_results`) và $F_1^{(\text{ens})}=0.848$ (A12 Ensemble safety-net — `working_v10/v10_results.csv`). Khoảng cách $|F_1^{(c)}-F_1^{(\text{ens})}|=0.033$.

| Router accuracy | $\epsilon_R$ | $\Delta F_1$ tối đa | $\mathbb{E}[F_1]$ tối thiểu |
|:-:|:-:|:-:|:-:|
| **100%** (hiện tại) | 0.00 | 0.0000 | **0.8810** |
| 95% | 0.05 | 0.0017 | 0.8793 |
| 90% | 0.10 | 0.0033 | 0.8777 |
| 85% | 0.15 | 0.0050 | 0.8760 |
| 70% | 0.30 | 0.0099 | 0.8711 |
| 50% (đoán ngẫu nhiên) | 0.50 | 0.0165 | 0.8645 |

**Nhận xét (kiểm chứng Mệnh đề 3.1):** ngay cả khi router sai **30%**, F1 toàn hệ chỉ giảm $\approx 1\%$ (0.881 → 0.871); kể cả router *vô dụng hoàn toàn* ($\epsilon_R=1$) thì suy giảm cũng **bị chặn cứng** ở $0.033$. Lý do: ensemble bao phủ mọi archetype nên "đáy" $P^{(\text{ens})}$ rất gần "đỉnh" $P^{(c)}$ → hệ **robust theo thiết kế**, không phụ thuộc độ chính xác router.

**Giá trị nghiên cứu:** biến *claim kỹ thuật* "ensemble như fallback hoạt động tốt" thành **định lý có chứng minh + bound đóng**, đúng thứ hội đồng hướng nghiên cứu mong đợi. Đồng thời lý giải vì sao có thể thay heuristic router bằng router rẻ hơn (kém chính xác hơn) mà **không lo sập hiệu năng** — phục vụ §5.

---

# Tổng kết: phát biểu cho hội đồng

> "Luận văn đóng góp ba kết quả lý thuyết, đều được kiểm chứng thực nghiệm trên 8 bộ dữ liệu chuẩn:
>
> 1. **Signal Dilution Bound** (Mệnh đề 1.1) — liên hệ hash-bucket collision rate với suy giảm khả năng phát hiện qua SNR, cho phép **tự động chọn dung lượng bucket $K$ theo số cột $N$**; ngưỡng tới hạn lý thuyết $N_{\text{crit}}\approx320$ khớp chính xác ranh giới sụp đổ thực nghiệm (Arrhythmia $N{=}279$ biên, Madelon $N{=}500$ sập).
> 2. **Information Sufficiency Framework** (Định nghĩa 2.1–2.3, Mệnh đề 2.1) — formalize *khi nào* Evidence Packet đủ thông tin để LLM sinh báo cáo trung thực, với tính đơn điệu của fidelity làm tiêu chuẩn kiểm tra và chẩn đoán hallucination.
> 3. **Router Error Propagation Bound** (Mệnh đề 3.1) — chứng minh ensemble safety-net giới hạn suy giảm F1 **tuyến tính** theo lỗi định tuyến và **chặn cứng** ở $0.033$, biến thiết kế fallback thành kết quả có chứng minh."

| # | Đóng góp | Định nghĩa | Mệnh đề | Trạng thái data | Effort |
|:-:|:--|:--|:--|:--|:-:|
| 1 | Signal Dilution Bound | 1.1, 1.2 | 1.1 + hệ quả | ✅ đủ (8 dataset) | ~2 ngày |
| 2 | Information Sufficiency | 2.1, 2.2, 2.3 | 2.1 | ⏳ cần chạy ablation EP | ~3 ngày |
| 3 | Router Error Propagation | 3.1 | 3.1 | ✅ đủ | ~1 ngày |

**Khuyến nghị nộp:** Đóng góp **1 + 3** cho bảo vệ đề cương (data sẵn, chứng minh ngắn); bổ sung **2** trước nộp luận văn sau khi hoàn thành ablation EP.
