discuss to edit epic 4
để chọn model cho NLP Report Generation

tập trung
Fine-tune LLM nhỏ
Model đề xuất:
Gemma 4
Qwen2-1.5B ⭐ BEST
Phi-2
TinyLlama
T5
Cách làm:

1. Instruction tuning
   {
   "instruction": "Generate anomaly report in Vietnamese",
   "input": "{structured anomaly data}",
   "output": "{full report}"
   }
2. Train bằng:
   LoRA / QLoRA (bắt buộc)
