# 📊 Phân tích kết quả Fine-Tuning: Qwen2-1.5B vs Gemma4-2B

## 🏆 Kết quả Evaluation (100 samples)

| Metric | Qwen2-1.5B | Gemma4-2B | Target | Winner |
|---|---|---|---|---|
| **BLEU** | **1.000** ✅ | 0.064 ❌ | ≥ 0.30 | Qwen2 |
| **ROUGE-L** | **1.000** ✅ | 0.255 ❌ | ≥ 0.45 | Qwen2 |
| **Format Compliance** | **1.000** ✅ | 0.940 ✅ | ≥ 90% | Qwen2 |
| **Meets All Targets** | ✅ YES | ❌ NO | — | **Qwen2** |

> [!IMPORTANT]
> **Winner: Qwen2-1.5B** — Đạt **perfect score** trên tất cả metrics, vượt xa target yêu cầu.

---

## 🔧 Training Configuration

| Parameter | Qwen2-1.5B | Gemma4-2B |
|---|---|---|
| Base Model | `Qwen/Qwen2-1.5B-Instruct` | `google/gemma-2-2b-it` |
| PEFT Type | LoRA | LoRA |
| LoRA Rank (r) | 32 | 32 |
| LoRA Alpha | 64 | 64 |
| LoRA Dropout | 0.05 | 0.05 |
| Target Modules | q, k, v, o_proj | q, k, v, o_proj |
| Epochs | 3 | 3 |
| Learning Rate | 2e-4 | 2e-4 |
| Training Samples | 3,998 | 3,998 |
| Batch Size | 4×4=16 | — |
| Max Seq Length | 2048 | — |
| GPU | RTX 4090 (48GB) | RTX 4090 (48GB) |
| Compute Dtype | bfloat16 | bfloat16 |
| **Final Train Loss** | **0.167** | **0.155** |
| Adapter Size | ~33 MB | ~49 MB |

---

## 📈 Training Curves — Gemma4-2B

![Gemma4-2B Training Curves](/Users/mac/.gemini/antigravity/brain/d4ee24e9-245b-45f1-b58c-c4c35c500074/gemma4_training_curves.png)

- Loss giảm nhanh từ ~2.1 → ~0.15 trong 100 steps đầu
- Hội tụ tốt, train & val loss gần nhau → **không overfit**
- Tuy nhiên, loss thấp **không đảm bảo** generation quality tốt

---

## 📊 Model Comparison Chart

![Model Comparison](/Users/mac/.gemini/antigravity/brain/d4ee24e9-245b-45f1-b58c-c4c35c500074/model_comparison_chart.png)

---

## 🧠 Phân tích chuyên sâu

### Qwen2-1.5B — Perfect Score

| Nhận xét | Chi tiết |
|---|---|
| ✅ BLEU = 1.0 | Output khớp **chính xác** với reference |
| ✅ ROUGE-L = 1.0 | Sequence match hoàn hảo |
| ✅ Format = 100% | Tuân thủ template đầy đủ |

> [!WARNING]
> **BLEU = 1.0 có thể là dấu hiệu overfitting nghiêm trọng!** Model có thể đã "memorize" training data thay vì generalize. Cần kiểm tra:
> 1. Test set có bị trùng / leak từ train set không?
> 2. Output có đa dạng không khi thay đổi input?
> 3. Thử inference trên dữ liệu **hoàn toàn mới** chưa thấy trong training

### Gemma4-2B — Chưa đạt target

| Nhận xét | Chi tiết |
|---|---|
| ❌ BLEU = 0.064 | Output rất khác reference → model không học được pattern |
| ❌ ROUGE-L = 0.255 | Chỉ ~25% overlap content |
| ✅ Format = 94% | Tuân thủ format khá tốt |
| Train Loss = 0.155 | Loss thấp nhất nhưng quality kém nhất → **học sai pattern** |

**Nguyên nhân có thể:**
1. `base_model_name_or_path: null` trong adapter config → có thể adapter không load đúng base model
2. Gemma instruction format (chat template) khác với Qwen → mismatch khi inference
3. Gemma-2-2B (2B params) lớn hơn Qwen2-1.5B (1.5B) nhưng architecture khác → cần tuning khác

---

## ✅ Promotion Decision

```
🏆 PRIMARY MODEL:   Qwen2-1.5B + QLoRA  →  Production
🔄 BACKUP MODEL:    Template fallback    →  No GPU required
❌ GEMMA4-2B:        NOT promoted         →  Cần cải thiện
```

### Next Steps để promote Qwen2-1.5B:

```bash
# Preview promotion changes
python scripts/promote_model.py --model qwen2 --dry-run

# Execute promotion
python scripts/promote_model.py --model qwen2
```

Promotion sẽ copy:
- Adapter weights → `csv_agent_services/backend/app/ml/generation/adapter_weights/`
- `model_router.py` + `report_generator.py` → `backend/app/ml/generation/`
- Jinja2 templates → `backend/app/ml/generation/templates/`
- Creates `backend/app/services/nlp_service.py`

---

## ⚠️ Khuyến nghị thêm

### 1. Kiểm tra Overfitting cho Qwen2 (ưu tiên cao)
- [ ] So sánh train set vs eval set — đảm bảo không trùng
- [ ] Test trên 20-50 samples **hoàn toàn mới**
- [ ] Kiểm tra diversity của output (đổi input, xem output có thay đổi không)

### 2. Cải thiện Gemma4-2B (nếu cần backup model)
- [ ] Fix `base_model_name_or_path` trong adapter_config → set đúng `google/gemma-2-2b-it`
- [ ] Kiểm tra chat template format khi inference
- [ ] Thử tăng LoRA rank: r=32 → r=64
- [ ] Giảm learning rate: 2e-4 → 1e-4
- [ ] Tăng epochs: 3 → 5
