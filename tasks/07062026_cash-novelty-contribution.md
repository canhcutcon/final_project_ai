---
name: cash-novelty-contribution
description: CASH (Collision-Aware Signed Hashing) is the chosen algorithmic-novelty contribution for the IUH thesis detection module.
metadata:
  node_type: memory
  type: project
  originSessionId: 34a54458-fa36-4524-b343-11811491a6b1
---

To answer the committee's "this is systems engineering, not CS research" challenge, the thesis' algorithmic novelty was localized to the **Universal Feature Encoder** in `csv_agent_platform/detection/src/data/universal_features.py`. Its flaw: unsigned hash accumulation (`out[:, bucket] += z`, line ~63) → biased collisions (feature hashing without Weinberger 2009's sign trick).

The contribution is **CASH**, built as a NON-DESTRUCTIVE experimental module (canonical encoder + production v11 serving left untouched):

- `src/data/cash_features.py` — signed + count-sketch encoder; `mode="unsigned"` reproduces canonical exactly. Also fixes a pre-existing NaN bug (canonical `test_no_crash_all_missing` fails on all-NaN input).
- `src/models/learned_hash.py` — Layer 3 differentiable soft-hash (PyTorch), frozen then scored by the same XGBoost for a fair ablation.

DECISION (confirmed 2026-06-07): the model being deepened = Universal Encoder (CASH) + **XGBoost head** (`A7-XGBoost-Universal`, F1=0.88). XGBoost head kept fixed/off-the-shelf as the clean measuring stick; novelty lives entirely in the encoder. NOT deepening TranAD/AnoGAN/BiLSTM/DAE. (Possible future: swap head for TranAD/BiLSTM, or make learned-hash the first layer of an end-to-end net — user chose to keep XGBoost for safety.)

- `notebooks/ablation_cash.py`, `cross_schema_transfer.py`, `synthetic_injection.py` — evidence (last two defend against the circular-evaluation critique using real public-benchmark labels).
- `de_cuong_IUH/chapters/cash_theory.tex` — Lemma 1 (unbiased), Lemma 2 (variance bound), Proposition 3 (recoverability threshold K=Ω(N/τ²)). `\input`-able; uses only amsmath.

Theory↔code validation lives in `tests/test_cash_features.py`. Real public-benchmark runs (ablation/transfer) need network downloads; only validated on synthetic so far. See plan `/Users/mac/.claude/plans/contninue-polymorphic-cray.md`. Related: [[de-cuong-iuh-build]].
Em muốn thầy phân tích sâu hướng nào để nâng điểm, hay soạn sẵn phần "rebuttal" trả lời 2 đòn trên cho buổi bảo vệ?
