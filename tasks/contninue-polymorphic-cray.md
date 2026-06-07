# Plan: CASH — Collision-Aware Signed Hashing for Schema-Agnostic Anomaly Detection

## Context

**Why this work exists.** The thesis' self-assessed novelty is 2.5/5 ⭐ because the "main
contribution" is framed as the *coupling architecture* (Evidence Packet, Model Router,
multi-tenant rule engine) — which a committee will correctly call **systems engineering, not
CS research**. Every model (XGBoost, BiLSTM, DAE, TranAD, AnoGAN, LoRA) is off-the-shelf; there
is no theorem, no proof, no algorithmic novelty.

**The one genuine research seam.** The Universal Feature Encoder in
[universal_features.py](csv_agent_platform/detection/src/data/universal_features.py) is the only
component that is both *unique to this thesis* (schema-agnostic, cross-table anomaly detection — an
active open ML problem, cf. TabPFN/XTab) **and** contains a fixable algorithmic flaw:

- [universal_features.py:63](csv_agent_platform/detection/src/data/universal_features.py#L63)
  accumulates hashed columns with **unsigned** addition (`out[:, bucket] += z`).
- [universal_features.py:41](csv_agent_platform/detection/src/data/universal_features.py#L41) uses a
  **single** MD5 hash, no sign function `ξ(j)`.

This is feature hashing *without* Weinberger et al. (2009)'s signed trick → hash collisions add a
**systematic bias** instead of cancelling in expectation. [measure_collision_rate.py](csv_agent_platform/detection/notebooks/measure_collision_rate.py)
confirms ~95% collision at N=200/K=64, so at high schema-width the encoder is mostly accumulated
collision noise. The thesis even works around this with `rename` augmentation in
[schema_augmentation.py](csv_agent_platform/detection/src/data/schema_augmentation.py) — a data-side
patch for an algorithmic problem.

**Intended outcome.** Introduce **CASH**, a principled replacement for the hashing block, with
provable properties, and prove empirically that it beats the naive encoder on public benchmarks +
cross-schema transfer. This converts "I used feature hashing (2009)" into a defensible CS
contribution with theorems, an ablation, and a recoverability bound.

**Scope decisions (confirmed with user):**
- Implement all 3 CASH layers, **including** the learned differentiable hashing (Layer 3).
- **Non-destructive**: add a new experimental module + new ablations. Do NOT edit the canonical
  `universal_features.py`, do NOT retrain production v11, do NOT touch `csv_agent_services`.
- Deliverables: code + ablation **+ LaTeX proofs + cross-schema transfer experiment + synthetic
  anomaly injection**.

**Key compatibility fact.** Signed hashing and count-sketch (Layers 1–2) keep the output shape
identical `(N, 132)`. Only Layer 3 (learned soft-hash) is a torch module; it can also emit a
fixed-width block, so the downstream `(N,132)` contract and `test_v11_universal.py` shape invariants
remain satisfiable.

---

## The Algorithm — CASH

Let row `x ∈ R^p` (p = #numeric cols), column j hashed by `h(j) ∈ {0..K-1}`.

- **Layer 1 — Signed hashing.** Add sign `ξ(j) ∈ {−1,+1}`: bucket value `φ_k = Σ_{j:h(j)=k} ξ(j)·z_j`.
  Restores unbiasedness of inner products.
- **Layer 2 — Count-sketch (d tables).** `d` independent `(h_t, ξ_t)` tables; aggregate per-bucket
  by **median** across tables → variance ↓ ~1/d, robust to extreme collisions.
- **Layer 3 — Learned soft-hash.** Replace fixed MD5 with a small differentiable assignment:
  per-column embedding `e_j = MLP([name_features(j) ‖ col_stats(j)])` → `softmax(e_j W) ∈ Δ^K`
  (soft bucket distribution); bucket block = `Σ_j p_j ⊗ (ξ_j z_j)`. Trained end-to-end against the
  detection loss. MD5 buckets serve as initialization. (Use Gumbel-softmax / temperature anneal for
  near-hard assignment at inference.)

### Theory to prove (LaTeX, thesis Ch.3)
- **Lemma 1 (Unbiasedness).** With `E[ξ]=0, ξ²=1`: `E[⟨φ(x),φ(x')⟩] = ⟨x,x'⟩`. Include the
  unsigned-case counterexample (2 columns) to show the *current* code lacks this property.
- **Lemma 2 (Variance bound).** `Var[⟨φ(x),φ(x')⟩] ≤ (1/K)(‖x‖²‖x'‖² + ⟨x,x'⟩²)`; with d-table median,
  tail prob of exceeding ε decays exponentially in d.
- **Proposition 3 (Anomaly recoverability).** A single-column outlier of z-magnitude τ is recovered
  with signal `ŝ ≥ τ − ε_coll`, `ε_coll = O(√(N/K))` w.h.p. ⇒ design rule `K = Ω(N/τ²)`.
- **Complexity.** Encode `O(nnz)`, memory `O(dK)`, **schema-independent** (motivates the problem).

---

## Files to create (all NEW — non-destructive)

| Path | Purpose |
|---|---|
| `csv_agent_platform/detection/src/data/cash_features.py` | Core CASH encoder. Public API mirrors `build_universal_features(df, fit, artifacts, rule_scorer, cash_cfg)` → `(N, 132)`. Implements `_col_hash_signed(name, K, table_id, seed)` and `_build_numeric_buckets_cash` / `_build_categorical_buckets_cash` (signed + d-table median). Reuses `_build_row_stats`, `_build_dataset_meta`, `_build_rule_features` imported from `universal_features.py` (no duplication). `cash_cfg` selects mode: `unsigned` (baseline parity), `signed`, `signed_countsketch`, `learned`. |
| `csv_agent_platform/detection/src/models/learned_hash.py` | Layer-3 PyTorch module `LearnedColumnHasher` (column-embedding MLP → softmax-over-K), with `encode(df, artifacts)` producing the numeric/categorical blocks differentiably; Gumbel-softmax + temperature anneal; MD5 init. Follows `BaseAnomalyModel`-adjacent style (lazy torch import like [tranad.py](csv_agent_platform/detection/src/models/tranad.py#L30)). |
| `csv_agent_platform/detection/notebooks/ablation_cash.py` | Main ablation: `unsigned vs signed vs signed_countsketch(d∈{3,5}) vs learned`, swept over K∈{32,64,128,256}, on the public-benchmark loaders. **Reuses the dataset loaders + `run_xgb` + `best_threshold` from** [ablation_no_hash.py](csv_agent_platform/detection/notebooks/ablation_no_hash.py) and the parameterized-K pattern from [ablation_k256.py](csv_agent_platform/detection/notebooks/ablation_k256.py). Emits LaTeX table + JSON to `outputs/`. |
| `csv_agent_platform/detection/notebooks/cross_schema_transfer.py` | Fit encoder+detector on schema A, evaluate on schema B **with no retraining** (real labels only → non-circular). Matrix of train→test pairs across the 5 benchmarks; reports F1/ROC-AUC/PR-AUC. Baseline: XGB-Raw (cannot transfer) to highlight CASH value. |
| `csv_agent_platform/detection/notebooks/synthetic_injection.py` | Inject single-column outliers of controlled severity τ into clean benchmark rows; measure detection vs τ and vs K; overlay the `K=Ω(N/τ²)` theoretical threshold from Prop 3. |
| `csv_agent_platform/detection/tests/test_cash_features.py` | Mirror [test_v11_universal.py](csv_agent_platform/detection/tests/test_v11_universal.py): shape `(N,132)` for n_cols∈{10,50,130,200}, dtype float32, no-NaN, fit/inference determinism (`almost_equal decimal=4`), unknown-cols→zeros. Plus CASH-specific: signed-hash unbiasedness empirical check, median aggregation stability. |
| `de_cuong_IUH/.../cash_theory.tex` (or thesis Ch.3 section) | Lemma 1, Lemma 2, Proposition 3, complexity — full proofs. Exact path confirmed against the thesis structure before writing. |

**Files explicitly NOT touched:** `universal_features.py` (canonical), `models/v11/*`,
`csv_agent_services/**`, production serving path, existing ablations. CASH imports the three
schema-agnostic block builders from `universal_features.py` so the row-stats/meta/rule blocks stay
bit-identical to baseline (clean ablation: only the hash block differs).

---

## Implementation order

**Phase A — Layers 1+2 (deterministic, fast).**
1. `cash_features.py`: signed `_col_hash_signed`, `signed` + `signed_countsketch` modes; `unsigned`
   mode reproduces baseline exactly (sanity parity check vs `build_universal_features`).
2. `test_cash_features.py` green (shape/determinism/no-NaN + unbiasedness empirical test).
3. `ablation_cash.py` over the 5 public loaders × modes × K. Produce the headline table.

**Phase B — Layer 3 (learned hashing).**
4. `learned_hash.py`: `LearnedColumnHasher` torch module; train end-to-end with a thin detector head
   (reuse XGBoost as frozen baseline comparator; for the learned block, train a small MLP/logistic
   head jointly). Temperature anneal → near-hard buckets at eval.
5. Extend `ablation_cash.py` with the `learned` mode row.

**Phase C — Evidence against the two committee attacks.**
6. `cross_schema_transfer.py` (anti-circular-evaluation: real labels, disjoint schemas).
7. `synthetic_injection.py` (validates Prop 3 recoverability threshold empirically).

**Phase D — Theory write-up.**
8. `cash_theory.tex`: Lemmas 1–2, Prop 3, complexity, with the unsigned counterexample.

---

## Verification

- **Unit:** `cd csv_agent_platform/detection && python -m pytest tests/test_cash_features.py -v` —
  all shape/determinism/no-NaN invariants pass; `unsigned` mode matches
  `build_universal_features` to `decimal=4`.
- **Unbiasedness empirical:** in tests, over many random column sets, mean of
  `⟨φ(x),φ(x')⟩ − ⟨x,x'⟩` → ~0 for `signed` and is biased-away-from-0 for `unsigned` (demonstrates
  Lemma 1 numerically).
- **Ablation:** `python notebooks/ablation_cash.py` → expect `signed`/`signed_countsketch`/`learned`
  ≥ `unsigned` on F1/PR-AUC for semantic-schema datasets, with the gap widening as K shrinks / N grows
  (consistent with Lemma 2 + Prop 3). LaTeX table emitted to `outputs/`.
- **Cross-schema:** `python notebooks/cross_schema_transfer.py` → CASH transfers (non-trivial F1 on
  unseen schema) while XGB-Raw collapses; this is the non-circular headline result.
- **Synthetic:** `python notebooks/synthetic_injection.py` → empirical detection-vs-τ curve tracks
  the `K=Ω(N/τ²)` threshold.
- **No regression:** existing `python -m pytest tests/test_v11_universal.py` still green (canonical
  encoder untouched); production v11 artifacts and `csv_agent_services` unchanged.

## Risks & mitigations
- **Learned hashing may not beat deterministic signed hashing** on small benchmarks → that is itself
  a reportable, honest finding; Phase A already secures a defensible contribution (Lemmas 1–2 +
  ablation) independent of Phase B.
- **Public-benchmark loaders need network/datasets** (sklearn fetch_*; Arrhythmia file present under
  `data/benchmark_high_dim/`) → reuse the exact loaders already working in `ablation_no_hash.py`;
  cache locally.
- **Thesis .tex integration path** unverified → confirm `de_cuong_IUH/` chapter file before writing
  the proof section.
