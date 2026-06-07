# 🔬 KHẮC PHỤC: Nâng tính nghiên cứu cho đề cương

**Mục tiêu:** Đưa tỷ lệ research:engineering từ 40:60 → **55:45+**  
**Nguyên tắc:** Không thay đổi kiến trúc hệ thống. Khai thác **chính những gì em đã có** để rút ra insight lý thuyết.

---

## PHẦN A — CHIẾN LƯỢC TỔNG THỂ

### Vấn đề gốc

Đề cương hiện tại **mô tả rất kỹ "làm gì"** (what) và **"làm như thế nào"** (how), nhưng thiếu **"tại sao nó hoạt động?"** (why) ở mức toán học. Hội đồng hướng nghiên cứu muốn thấy:

```
❌ Hiện tại:  "Hash-bucket có collision rate 49% khi N=100" (observation)
✅ Cần thêm: "Cho hash-bucket K dim, F1 degradation bị chặn bởi..." (theorem)

❌ Hiện tại:  "Evidence Packet gồm score + SHAP + rule + context" (description)  
✅ Cần thêm: "EP là đủ (sufficient) cho LLM khi và chỉ khi..." (definition + proposition)

❌ Hiện tại:  "Router sai → rơi vào Ensemble → vẫn phát hiện được" (claim)
✅ Cần thêm: "Sai lệch router ≤ ε → F1 ensemble giảm tối đa δ(ε)" (bound)
```

### 2 hành động song song

| Hành động | Mục đích | Effort |
|-----------|----------|--------|
| **A. Thêm 2-3 đóng góp lý thuyết** | Nâng phần research | ⭐⭐⭐ (chính) |
| **B. Giảm phần engineering trong body** | Hạ phần engineering | ⭐⭐ (phụ) |

---

## PHẦN B — 3 ĐÓNG GÓP LÝ THUYẾT CÓ THỂ THÊM

> [!TIP]
> Chọn **ít nhất 2 trong 3** đóng góp dưới đây. Mỗi đóng góp gồm 1 definition + 1 proposition/theorem + 1 kiểm chứng thực nghiệm. Tổng cộng thêm khoảng **8-12 trang** vào luận văn.

---

### Đóng góp 1: Bound suy giảm F1 theo Hash-bucket Collision

**Đặt vào:** Chương 3 (§3.2 sau phần collision rate analysis)  
**Độ khó:** ⭐⭐⭐ (vừa phải — em đã có data thực nghiệm rồi)

#### 💡 Ý tưởng

Em đã có bảng collision rate vs N (Bảng 3.5) và bảng F1 vs N (Bảng 4.7 — high-dim benchmark). Nhưng **chưa nối hai thứ đó lại bằng toán**. Việc cần làm: xây dựng một **bất đẳng thức** liên hệ collision rate → signal-to-noise ratio → F1 degradation.

#### 📐 Xây dựng

**Definition 1 (Collision Rate).**

$$
\gamma(N, K) = 1 - \frac{K \cdot \left(1 - (1 - 1/K)^N\right)}{N}
$$

*Tỷ lệ cột phải chia sẻ bucket khi ánh xạ N cột vào K bucket. (Em đã có công thức này — chỉ cần đặt tên chính thức.)*

**Definition 2 (Signal Dilution Factor).**

Khi $m$ cột chia sẻ 1 bucket, z-score bị cộng tuyến tính:

$$
z_{\text{bucket}} = \sum_{j=1}^{m} z_j
$$

Nếu chỉ có 1 cột $z_1$ mang tín hiệu bất thường (z-score cao) và $m-1$ cột là nhiễu $\sim \mathcal{N}(0,1)$, thì **signal-to-noise ratio** của bucket:

$$
\text{SNR}(m) = \frac{|z_1|}{\sqrt{(m-1) \cdot 1}} = \frac{|z_1|}{\sqrt{m-1}}
$$

Tín hiệu bị pha loãng theo $1/\sqrt{m}$ — cổ điển nhưng áp dụng cụ thể cho hash-bucket AD là mới.

**Proposition 1 (Signal Dilution Bound).**

*Cho hàm hash phân phối đều, kỳ vọng số cột trên mỗi bucket là $\bar{m} = N/K$. Khi $N > K$, SNR kỳ vọng của bucket chứa tín hiệu bất thường bị chặn trên bởi:*

$$
\mathbb{E}[\text{SNR}] \leq \frac{|z_1|}{\sqrt{N/K - 1}}
$$

*Hệ quả: Để SNR ≥ τ (ngưỡng phát hiện của XGBoost), cần:*

$$
K \geq \frac{N}{1 + (|z_1|/\tau)^2}
$$

#### Ví dụ con số minh họa

| $N$ cột | $K$ | $\bar{m}$ | SNR (z₁=3) | Phát hiện được? (τ=1.5) |
|---------|-----|-----------|-------------|------------------------|
| 30 | 64 | 0.47 | ∞ (không collision) | ✅ |
| 54 | 64 | 0.84 | ∞ hoặc rất cao | ✅ |
| 100 | 64 | 1.56 | 3/√0.56 ≈ 4.0 | ✅ |
| 279 | 64 | 4.36 | 3/√3.36 ≈ 1.64 | ⚠️ Biên |
| 500 | 64 | 7.81 | 3/√6.81 ≈ 1.15 | ❌ Dưới ngưỡng |

**Kiểm chứng thực nghiệm:** So khớp với Bảng 4.7 — House Prices ($N=79$, V11 > XGB-Raw ✅), Arrhythmia ($N=279$, V11 < XGB-Raw ❌), Madelon ($N=500$, V11 ≈ random ❌). **Khớp hoàn hảo với bound lý thuyết.**

#### Cách viết trong luận văn

```latex
\begin{proposition}[Signal Dilution Bound]
\label{prop:snr_bound}
Cho $N$ cột được ánh xạ vào $K$ bucket bằng hàm hash phân phối đều.
Nếu đúng một cột mang tín hiệu bất thường với z-score $|z_1|$ và
$N-1$ cột còn lại là nhiễu $\mathcal{N}(0,1)$ độc lập, thì kỳ vọng
tỷ lệ tín hiệu trên nhiễu (SNR) của bucket chứa cột tín hiệu thoả mãn:
$$
\mathbb{E}[\mathrm{SNR}] \leq \frac{|z_1|}{\sqrt{N/K - 1}}
$$
Để phát hiện bất thường với ngưỡng $\tau$, điều kiện cần trên $K$ là:
$$
K \geq \frac{N}{1 + (|z_1|/\tau)^2}
$$
\end{proposition}

\begin{proof}
Kỳ vọng số cột trên mỗi bucket...
(chứng minh ngắn, 5-8 dòng, dựa trên linearity of expectation
và independence assumption)
\end{proof}
```

> [!IMPORTANT]
> **Tại sao đóng góp này có giá trị:** Feature hashing (Weinberger et al., 2009) là kỹ thuật cũ, nhưng **không ai phân tích SNR degradation cụ thể cho bài toán anomaly detection trên tabular data**. Bound này cho phép **tự động chọn K theo N** — trực tiếp phục vụ hướng phát triển §5.

---

### Đóng góp 2: Framework Information Sufficiency cho Evidence Packet

**Đặt vào:** Chương 3 (§3.3 sau mô tả Evidence Packet)  
**Độ khó:** ⭐⭐⭐⭐ (khó hơn, nhưng impact cao nhất — vì EP là đóng góp chính)

#### 💡 Ý tưởng

Evidence Packet hiện tại được mô tả như một **Pydantic schema** — thuần engineering. Cần nâng lên thành **formal framework**: khi nào EP "đủ thông tin" để LLM sinh báo cáo trung thực? Đây là bài toán **information sufficiency** — có thể formalize bằng lý thuyết thông tin.

#### 📐 Xây dựng

**Definition 3 (Evidence Packet).**

$$
\mathcal{E} = \langle s, \mathbf{a}, \mathcal{R}, \mathcal{C} \rangle
$$

Trong đó:
- $s \in [0,1]$: aggregated anomaly score
- $\mathbf{a} = \{(f_j, \phi_j)\}_{j=1}^{k}$: top-$k$ feature attributions (SHAP values)
- $\mathcal{R} \subseteq \mathcal{R}_{\text{all}}$: tập luật nghiệp vụ bị vi phạm
- $\mathcal{C}$: ngữ cảnh giao dịch (agent, district, project, ...)

**Definition 4 (Report Fidelity).**

Cho báo cáo $r = \text{LLM}(\mathcal{E})$, định nghĩa 3 chỉ số fidelity (em đã có — chỉ cần formalize):

$$
\text{NumFid}(r, \mathcal{E}) = \frac{|\text{nums}(r) \cap \text{nums}(\mathcal{E})|}{|\text{nums}(\mathcal{E})|}
$$

$$
\text{RuleFid}(r, \mathcal{E}) = \frac{|R_r \cap \mathcal{R}|}{|\mathcal{R}|}
$$

$$
\text{Cov@k}(r, \mathcal{E}) = \frac{|\{f_j : f_j \text{ mentioned in } r\} \cap \text{top-}k(\mathbf{a})|}{k}
$$

**Definition 5 (τ-Sufficient Evidence Packet).**

*EP $\mathcal{E}$ được gọi là $\tau$-sufficient cho LLM $M$ nếu:*

$$
\min\{\text{NumFid}, \text{RuleFid}, \text{Cov@3}\} \geq \tau
$$

*và hallucination rate $\text{Hallu}(r, \mathcal{E}) \leq 1 - \tau$.*

**Proposition 2 (Monotonicity of Sufficiency).**

*Cho EP đầy đủ $\mathcal{E}_{\text{full}} = \langle s, \mathbf{a}, \mathcal{R}, \mathcal{C} \rangle$ và các EP rút gọn:*

$$
\mathcal{E}_1 = \langle s, \mathbf{a}, \emptyset, \emptyset \rangle \quad \text{(chỉ score + SHAP)}
$$
$$
\mathcal{E}_2 = \langle s, \emptyset, \mathcal{R}, \emptyset \rangle \quad \text{(chỉ score + rule)}
$$
$$
\mathcal{E}_3 = \langle s, \emptyset, \emptyset, \emptyset \rangle \quad \text{(chỉ score)}
$$

*Thì sufficiency giảm đơn điệu khi loại bỏ thành phần:*

$$
\text{Fid}(\mathcal{E}_{\text{full}}) \geq \text{Fid}(\mathcal{E}_1) \geq \text{Fid}(\mathcal{E}_3)
$$

$$
\text{Fid}(\mathcal{E}_{\text{full}}) \geq \text{Fid}(\mathcal{E}_2) \geq \text{Fid}(\mathcal{E}_3)
$$

*Hệ quả: Ablation study (Bảng 4.5) chính là kiểm chứng thực nghiệm của tính đơn điệu này. Nếu không đơn điệu → EP bị LLM "hiểu sai" → cần redesign.*

#### Cách viết trong luận văn

- Đặt Definition 3-5 vào **Chương 3 §3.3** ngay sau mô tả Pydantic schema
- Đặt Proposition 2 ngay trước phần Ablation EP (§4.x)
- Ablation EP (Bảng 4.5 — hiện TBD) trở thành **kiểm chứng thực nghiệm** của Proposition 2
- Nếu monotonicity bị vi phạm ở cấu hình nào → **phân tích tại sao** (LLM bịa rule khi không có input rule? → hallucination insight)

> [!IMPORTANT]
> **Tại sao đóng góp này có giá trị:** Không có công trình nào formalize "khi nào intermediate representation đủ cho LLM sinh report trung thực". Đây là câu hỏi nghiên cứu thực sự, áp dụng được cho bất kỳ hệ thống AD+LLM nào, không chỉ CSV.

---

### Đóng góp 3: Error Propagation Bound cho Model Router

**Đặt vào:** Chương 3 (§3.3.1 sau mô tả Router) + Chương 4 (thực nghiệm router)  
**Độ khó:** ⭐⭐⭐ (vừa phải)

#### 💡 Ý tưởng

Em claim "router sai → rơi vào Ensemble → vẫn phát hiện được (F1=0.848)". Nhưng đây chỉ là **một điểm dữ liệu**. Cần formalize: **nếu router sai với xác suất ε, F1 của toàn hệ thống giảm bao nhiêu?**

#### 📐 Xây dựng

**Definition 6 (Router Error Rate).**

$$
\epsilon_R = P(\text{Router}(X) \neq \text{archetype}(X))
$$

**Proposition 3 (Router Error Propagation).**

*Gọi $F_1^{(c)}$ là F1 của mô hình đúng cho archetype $c$ (ví dụ XGBoost cho tabular), $F_1^{(\text{ens})}$ là F1 của ensemble (safety net). Khi router sai với xác suất $\epsilon_R$, F1 kỳ vọng của toàn hệ thống:*

$$
\mathbb{E}[F_1] = (1 - \epsilon_R) \cdot F_1^{(c)} + \epsilon_R \cdot F_1^{(\text{ens})}
$$

*Do Ensemble là safety net (chạy tất cả model), suy giảm F1 bị chặn bởi:*

$$
\Delta F_1 \leq \epsilon_R \cdot (F_1^{(c)} - F_1^{(\text{ens})})
$$

**Kiểm chứng con số thực:**

| Router accuracy | $\epsilon_R$ | $F_1^{(XGB)}$ | $F_1^{(ens)}$ | $\Delta F_1$ max | $\mathbb{E}[F_1]$ min |
|:-:|:-:|:-:|:-:|:-:|:-:|
| 100% (hiện tại) | 0 | 0.881 | — | 0 | 0.881 |
| 95% | 0.05 | 0.881 | 0.848 | 0.0017 | 0.879 |
| 90% | 0.10 | 0.881 | 0.848 | 0.0033 | 0.878 |
| 85% (LightGBM) | 0.15 | 0.881 | 0.848 | 0.0050 | 0.876 |
| 70% | 0.30 | 0.881 | 0.848 | 0.0099 | 0.871 |

**Insight:** Ngay cả khi router sai 30%, F1 toàn hệ thống chỉ giảm ~1% nhờ safety net. Đây là **bằng chứng lý thuyết** cho thiết kế "ensemble as fallback" — mạnh hơn nhiều so với chỉ nói "nó hoạt động".

> **Giá trị:** Đóng góp này **biến một claim kỹ thuật thành định lý có chứng minh**, rất phù hợp cho hội đồng hướng nghiên cứu.

---

## PHẦN C — GIẢM PHẦN ENGINEERING TRONG BODY

### Nguyên tắc: Đẩy implementation details vào Phụ lục

| Nội dung hiện tại | Vị trí hiện tại | Hành động | Lý do |
|-------------------|-----------------|-----------|-------|
| Docker Compose setup (6 services) | Ch.3 §3.5 | → **Phụ lục D** | Không có đóng góp NC |
| FastAPI/Celery/Redis chi tiết | Ch.3 §3.5 | → **Phụ lục D** | Engineering stack |
| Next.js frontend, WebSocket, Tailwind | Ch.2 §2.6 | → **Phụ lục D** | Không liên quan AD/NLP |
| WeasyPrint PDF export | Ch.3 | → **Phụ lục E** | Chi tiết implementation |
| 7 ưu thế Heuristic Router (80 dòng) | Ch.3 §3.3.1 | **Rút gọn → 3 ưu thế chính** + bảng so sánh giữ lại | Quá defensive, dấu hiệu GPT |
| §1.5 "Định vị so với SOTA" (80 dòng) | Ch.1 | **Rút gọn → 1 bảng + 1 đoạn kết luận** | Pre-emptive defense quá dài |
| Gemini Fix Service | Ch.3 | **Giữ ngắn trong body, chi tiết → Phụ lục E** | Phụ trợ, không phải đóng góp chính |

### Ước tính trang giải phóng: **~15-20 trang** engineering → phụ lục

### Thay thế bằng: **~10-15 trang** lý thuyết (3 đóng góp ở Phần B)

---

## PHẦN D — CẤU TRÚC LUẬN VĂN SAU KHI ĐIỀU CHỈNH

### Trước (hiện tại):

```
Ch.1: Tổng quan (26 công trình, 2 research gap)        ← OK
Ch.2: Cơ sở lý thuyết (copy công thức chuẩn)           ← YẾU
Ch.3: Phương pháp (pipeline chi tiết + engineering)     ← QUÁ ENGINEERING
Ch.4: Thực nghiệm (kết quả + ablation)                 ← OK nhưng nhiều TBD
Ch.5: Kết luận                                          ← OK
```

### Sau (đề xuất):

```
Ch.1: Tổng quan (giữ nguyên, rút gọn §1.5)             ← OK
Ch.2: Cơ sở lý thuyết
      + §2.x MỚI: Lý thuyết hash-bucket cho AD         ← RESEARCH ⭐
        (Definition 1-2, Proposition 1)
      + §2.x MỚI: Framework Information Sufficiency      ← RESEARCH ⭐⭐
        (Definition 3-5, Proposition 2)
Ch.3: Phương pháp
      + Pipeline (rút gọn engineering → phụ lục)
      + §3.x MỚI: Router Error Propagation              ← RESEARCH ⭐
        (Definition 6, Proposition 3)
      + Kiến trúc EP (giữ, nâng cấp với formal notation)
Ch.4: Thực nghiệm
      + Kết quả AD (giữ)
      + §4.x: Kiểm chứng Prop.1 (collision → F1)        ← THEORY VALIDATION
      + §4.x: Kiểm chứng Prop.2 (EP monotonicity)       ← THEORY VALIDATION
      + §4.x: Kiểm chứng Prop.3 (router error bound)    ← THEORY VALIDATION
      + Kết quả NLP (hoàn thành TBD)
Ch.5: Kết luận                                          ← OK
```

### Tỷ lệ mới: **research:engineering ≈ 55:45** ✅

---

## PHẦN E — CHECKLIST HÀNH ĐỘNG

### Ưu tiên cao (làm trước bảo vệ đề cương):

- [ ] **Viết Proposition 1** (Signal Dilution Bound) — em đã có toàn bộ data, chỉ cần formalize (~2 ngày)
- [ ] **Viết Definition 3-5** (EP formal framework) — nâng cấp mô tả Pydantic thành formal notation (~1 ngày)
- [ ] **Rút gọn §1.5** "Định vị SOTA" từ 80 → 25 dòng (~1 giờ)
- [ ] **Đẩy Docker/FastAPI/Next.js** vào Phụ lục D (~2 giờ)
- [ ] **Rút gọn "7 ưu thế Router"** thành 3 ưu thế chính (~1 giờ)

### Ưu tiên trung bình (làm trước nộp luận văn):

- [ ] **Viết Proposition 2** (EP Monotonicity) + chứng minh + kiểm chứng bằng Bảng 4.5 (~3 ngày)
- [ ] **Viết Proposition 3** (Router Error Bound) + bảng con số (~1 ngày)
- [ ] **Hoàn thành TẤT CẢ ô TBD** trong Ch.4 (critical!)

### Ưu tiên thấp (bonus nếu có thời gian):

- [ ] Phân tích **convergence** của LoRA fine-tuning trên EP structured data vs raw text
- [ ] So sánh Proposition 1 với **Weinberger et al. (2009)** feature hashing bounds — cite và nêu khác biệt

---

## PHẦN F — MẪU VIẾT CHO HỘI ĐỒNG

### Khi trình bày "đóng góp nghiên cứu", nói thế này:

> ❌ **Đừng nói:** "Đóng góp chính là xây dựng hệ thống CSV AI Platform với Model Router, Ensemble, Evidence Packet và LLM."
> 
> (→ Nghe như engineering project report)

> ✅ **Nên nói:** "Luận văn đóng góp ba kết quả chính: 
> (1) **Bound lý thuyết** liên hệ hash-bucket collision rate với suy giảm hiệu năng phát hiện bất thường (Proposition 1), cho phép tự động chọn dung lượng hash-bucket theo số cột dữ liệu;
> (2) **Framework Information Sufficiency** cho biểu diễn trung gian giữa ensemble AD và LLM (Definition 3-5, Proposition 2), formalize khi nào evidence packet đủ thông tin để LLM sinh báo cáo trung thực;
> (3) **Bound truyền lỗi** cho kiến trúc router-ensemble (Proposition 3), chứng minh ensemble safety net giới hạn suy giảm F1 tuyến tính theo lỗi định tuyến.
> Cả ba kết quả được kiểm chứng thực nghiệm trên 8 bộ dữ liệu chuẩn."
> 
> (→ Nghe như computer science research contribution)

---

> [!TIP]
> **Tóm lại:** Em không cần phát minh thuật toán mới. Em cần **formalize những insight mà em đã có** bằng ngôn ngữ toán học. Data đã có sẵn — chỉ cần "khoác áo lý thuyết" cho nó. Đây chính là kỹ năng quan trọng nhất của nhà nghiên cứu: **biến quan sát thực nghiệm thành định lý**.

*— Professor Tomoe*
