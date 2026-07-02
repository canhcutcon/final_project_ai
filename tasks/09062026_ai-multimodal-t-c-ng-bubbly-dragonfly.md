git config --global user.name "canhcutcon"
git config --global user.email "giangvo0206@gmail.com"

# Plan: Chuyên đề 2 & 3 — Multimodal AI (Time-series Image + Tabular)

## Context

Luận văn Thạc sĩ của Võ Thị Trà Giang (IUH, 2024-2026):
- Phát hiện bất thường trên CSV giao dịch BĐS (XGBoost + BiLSTM + DAE ensemble)
- Dữ liệu sẵn có: 9,812 giao dịch tabular + 707 tuần time-series (8-week sliding windows)
- Không có ảnh hợp đồng thực → chọn hướng multimodal: **Time-series as Image + Tabular**

---

## Bài toán được chọn

**Title chính thức (do user xác nhận):**
> "Cross-Modal Attention Network for Real Estate Transaction Anomaly Detection using Time-Series Imaging and Tabular Features"

**Luận điểm novelty (dựa trên văn liệu Time-Series Imaging):**
> "Although generated from the same temporal source, image-based representation captures spatial correlation patterns that cannot be explicitly modeled by conventional sequence models."

Cụ thể:
- **BiLSTM** → temporal pattern (sequential dependencies, trends, seasonality)
- **GAF** → spatial pattern (pairwise angular correlations giữa các time steps — cấu trúc 2D mà BiLSTM không model được explicitly)
- Đây là **Heterogeneous Representation Learning** — 2 không gian đặc trưng độc lập, kết hợp bằng cross-modal attention

Lý do khả thi:
1. Dữ liệu 707 tuần time-series sẵn có — không cần thu thập thêm
2. GAF encoding là kỹ thuật đã được chứng minh (GASF, GADF, MTF papers)
3. Kế thừa toàn bộ pipeline luận văn, chỉ thêm visual encoder
4. Contributions đủ để bảo vệ trước hội đồng (xem bên dưới)

---

## Chuyên đề 2: BÀI TOÁN (Problem Statement)

### Tiêu đề
"Phát hiện bất thường đa phương thức trên dữ liệu giao dịch bất động sản: Bài toán kết hợp biểu diễn ảnh chuỗi thời gian và đặc trưng bảng cấu trúc"

### Cấu trúc nội dung cần viết

**1. Bối cảnh và Động cơ nghiên cứu**
- Hiện trạng: BiLSTM trong luận văn xử lý time-series dạng 1D sequence, bỏ qua pattern không gian 2D
- Khoảng trống: Không có hệ thống nào kết hợp visual time-series pattern + tabular snapshot cho AD trong BĐS
- Ví dụ trực quan: Một giao dịch bất thường đơn lẻ (tabular) nhưng lại nằm trong một pattern tuần hoàn bình thường (time-series image) → conflict giữa 2 modality là tín hiệu bất thường cấp cao

**2. Phát biểu bài toán chính thức**
- **Input**: Cặp {I_t, X_t}
  - I_t ∈ R^{HxWxC}: ảnh GAF/Recurrence Plot từ cửa sổ 8 tuần xung quanh giao dịch t
  - X_t ∈ R^51: vector đặc trưng bảng 51 chiều của giao dịch t
- **Output**: y_t ∈ {0, 1} + anomaly_score ∈ [0,1] + attention_heatmap
- **Điều kiện đặc biệt**: Cross-modal inconsistency — phát hiện mâu thuẫn giữa pattern ảnh (bình thường) và giá trị bảng (bất thường)

**3. Các thách thức nghiên cứu (Research Challenges)**
- RC1: Chọn phương pháp mã hóa time-series tốt nhất (GASF vs GADF vs Recurrence Plot vs MTF)
- RC2: Căn chỉnh thời gian — ảnh từ cửa sổ 8 tuần vs đặc trưng snapshot của 1 giao dịch
- RC3: Chiến lược fusion dị thể (spatial 2D image features + 1D numerical vector)
- RC4: Giải thích được (explainability) — heatmap trên ảnh time-series phải có ý nghĩa business

**4. Câu hỏi nghiên cứu (Research Questions) — đã nâng cấp**
- RQ1: How effectively can time-series imaging preserve anomaly characteristics in real estate transaction sequences?
- RQ2: Can multimodal fusion improve anomaly detection performance compared with unimodal approaches?
- RQ3: How does cross-modal attention contribute to anomaly localization and explainability?
- RQ4: Which time-series image encoding method provides the best balance between performance and interpretability?

**5. Đóng góp dự kiến (3 contributions rõ ràng, defensible)**

- **C1 — Data Framework:** Framework chuyển đổi dữ liệu giao dịch BĐS time-series thành biểu diễn ảnh đa kênh bằng GAF/GADF/RP (mỗi transaction → 1 ảnh, ~9,812 ảnh tổng)
- **C2 — Model:** Cross-Modal Attention Network (CMAN) kết hợp Time-series Image + Tabular Features cho anomaly detection (heterogeneous representation learning)
- **C3 — Explainability:** Explainable anomaly detection thông qua Attention Visualization + Grad-CAM + Evidence Packet mở rộng

Phân tích bổ trợ (không là contribution chính): Attention Consistency Analysis / Cross-Modal Alignment Score — dùng để interpret attention weights, không cần benchmark riêng

---

## Chuyên đề 3: HƯỚNG GIẢI QUYẾT (Solution Approach)

### Tiêu đề
"Kiến trúc Cross-Modal Attention Network (CMAN) cho Phát hiện bất thường đa phương thức: Time-series Image + Tabular Features"

### Cấu trúc nội dung cần viết

**1. Tổng quan kiến trúc**

```
[Time-series window 8 tuần]                [Dữ liệu giao dịch CSV]
        ↓                                          ↓
[GAF/Recurrence Plot encoding]         [Feature Engineering (kế thừa)]
   → ảnh 2D (e.g. 64×64 pixels)          (51 features, StandardScaler)
        ↓                                          ↓
[CNN / Vision Transformer (ViT-S)]     [Ensemble sẵn có: XGBoost/BiLSTM/DAE]
        ↓                                          ↓
  [Visual Features v_t ∈ R^d1]          [Tabular Features h_t ∈ R^d2]
        ↓_____________  ↑________________↓
                [Cross-Modal Attention Layer]
                  (Tabular attends to Visual)
                         ↓
              [Fused Representation f_t ∈ R^d]
                         ↓
              [Anomaly Classifier (MLP)]
                         ↓
     [Score + Heatmap trên ảnh GAF + Evidence Packet mở rộng]
```

**2. Module A: Time-series to Image Encoding**

**⚠️ Vấn đề dữ liệu quan trọng:**
- 707 weekly aggregation windows → chỉ 707 ảnh → CNN gần như chắc chắn **overfit**
- **Giải pháp:** Tạo image từ mỗi transaction, không phải từ mỗi tuần

```
9,812 transactions
transaction_i (date_i) → lấy 8 tuần trước date_i → GAF image_i
→ ~9,812 images (đủ để train CNN)
```

Mỗi ảnh gắn liền với 1 transaction có nhãn → label trực tiếp từ tập ground-truth sẵn có.

- Gramian Angular Summation Field (GASF): temporal correlation dạng góc cộng
- Gramian Angular Difference Field (GADF): temporal difference dạng góc trừ
- Recurrence Plot (RP): recurrence structure
- Ablation: so sánh 3 encoding methods trên tập validation
- Input: 8-week window × k features → stack thành multi-channel image (C channels)

**3. Module B: Visual Feature Extractor (CNN-based Encoder)**
- Trong chuyên đề: chỉ ghi "CNN-based Encoder" — không commit vào model cụ thể
- Thực nghiệm so sánh: ResNet18 vs EfficientNet-B0 vs ViT-Small
- Lưu ý: ViT-Small cần dữ liệu lớn hơn → khả năng cao ResNet18/EfficientNet-B0 sẽ thắng trên tập 707 tuần
- Input: (C, 64, 64) multi-channel GAF images
- Output: visual feature vector v_t ∈ R^d1
- Pre-training: fine-tune từ ImageNet weights (transfer learning)

**4. Module C: Cross-Modal Attention Fusion**
- Tabular features h_t attend to visual tokens V_t (cross-attention)
- Cho phép mô hình "hỏi" ảnh time-series: "Pattern 8 tuần này có ủng hộ bất thường không?"
- 3 variants: Early Fusion (concat), Late Fusion (score avg), Cross-Attention (đề xuất)

**5. Module D: Anomaly Detection Output**
- Binary classifier + anomaly score
- Attention heatmap: Grad-CAM trên ảnh GAF để highlight tuần nào bất thường
- Evidence Packet mở rộng: thêm visual_evidence (heatmap URL + top anomalous weeks)
- Report generation: kế thừa LoRA LLM từ luận văn, thêm visual context

**6. Tập dữ liệu và thực nghiệm**

| Experiment | Mô tả | Metric |
|-----------|-------|--------|
| Baseline 1 | Tabular only (kết quả luận văn: F1=0.848) | F1, AUC |
| Baseline 2 | Image only (GASF + CNN) | F1, AUC |
| Late Fusion | Score(tabular) + Score(image) / 2 | F1, AUC |
| CMAN (đề xuất) | Cross-attention fusion | F1, AUC |
| Ablation: encoding | GASF vs GADF vs RP | F1, AUC |
| Ablation: visual model | EfficientNet vs ViT-S | F1, AUC |

**7. Kế thừa từ luận văn**
- `csv_agent_platform/detection/data/windowing.py` → thêm `to_gaf_image()` function
- `csv_agent_platform/detection/models/` → thêm `visual_encoder.py`
- `evidence_packet` schema → thêm `visual_evidence` field
- Multi-tenant pipeline → GAF encoding parameters có thể cấu hình per-tenant

---

## Output files cần tạo khi thực thi

- `de_cuong_IUH/chuyen_de_2_bai_toan.md` — Bài toán chi tiết (~10-15 trang)
- `de_cuong_IUH/chuyen_de_3_huong_giai_quyet.md` — Hướng giải quyết (~12-18 trang)

---

## Verification

1. Chuyên đề 2 có đủ: bối cảnh → khoảng trống nghiên cứu → phát biểu chính thức → thách thức → RQ → đóng góp
2. Chuyên đề 3 có đủ: kiến trúc tổng thể → chi tiết từng module → ablation plan → kế thừa luận văn
3. 2 chuyên đề liên kết: Chuyên đề 3 giải quyết đúng từng RQ của Chuyên đề 2
4. Feasibility check: tất cả data đều có sẵn trong luận văn, không cần thu thập thêm
