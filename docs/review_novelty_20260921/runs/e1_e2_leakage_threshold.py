"""E1: dinh luong ro ri nhan (F1). E2: dinh luong toi uu nguong tren test (F2).

Tai dung loader + featurizer that cua repo, chi thay doi MOT bien moi lan.
"""
from __future__ import annotations
import json, sys, os
from pathlib import Path
import numpy as np, pandas as pd

_DET = Path("/Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/csv_agent_platform/detection")
sys.path.insert(0, str(_DET / "notebooks"))
sys.path.insert(0, str(_DET / "src"))

from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, roc_auc_score, average_precision_score
import ablation_k256 as A

SEEDS = [42, 43, 44]


def best_threshold(proba, y):
    """Copy dung semantics cua A.best_threshold de khong lech."""
    return A.best_threshold(proba, y)


def fit_and_score(X_tr, y_tr, X_va, y_va, X_te, y_te, seed):
    """Tra ve CA HAI giao thuc nguong tu CUNG mot model -> so sanh cong bang."""
    import xgboost as xgb
    pw = float((y_tr == 0).sum()) / max(float((y_tr == 1).sum()), 1)
    m = xgb.XGBClassifier(
        n_estimators=600, max_depth=6, learning_rate=0.05,
        subsample=0.85, colsample_bytree=0.85, scale_pos_weight=pw,
        eval_metric="aucpr", random_state=seed, tree_method="hist", n_jobs=4,
    )
    m.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], verbose=False)
    pv = m.predict_proba(X_va)[:, 1]
    pt = m.predict_proba(X_te)[:, 1]
    thr_val = best_threshold(pv, y_va)      # dung giao thuc (ablation_k256)
    thr_test = best_threshold(pt, y_te)     # giao thuc v11 (toi uu tren test)
    return {
        "f1_thr_val":  round(float(f1_score(y_te, (pt >= thr_val).astype(int), zero_division=0)), 4),
        "f1_thr_test": round(float(f1_score(y_te, (pt >= thr_test).astype(int), zero_division=0)), 4),
        "roc_auc":     round(float(roc_auc_score(y_te, pt)), 4),
        "pr_auc":      round(float(average_precision_score(y_te, pt)), 4),
    }


def run_variant(df, y, seed, k_num=64, k_cat=32):
    idx = np.arange(len(y))
    i_tr, i_tmp = train_test_split(idx, test_size=0.3, random_state=seed, stratify=y)
    i_va, i_te = train_test_split(i_tmp, test_size=0.5, random_state=seed, stratify=y[i_tmp])
    df_tr, df_va, df_te = df.iloc[i_tr], df.iloc[i_va], df.iloc[i_te]
    y_tr, y_va, y_te = y[i_tr], y[i_va], y[i_te]
    X_tr, arts = A.build_universal_features_parameterised(df_tr, fit=True, k_num=k_num, k_cat=k_cat)
    X_va, _ = A.build_universal_features_parameterised(df_va, fit=False, artifacts=arts, k_num=k_num, k_cat=k_cat)
    X_te, _ = A.build_universal_features_parameterised(df_te, fit=False, artifacts=arts, k_num=k_num, k_cat=k_cat)
    return fit_and_score(X_tr, y_tr, X_va, y_va, X_te, y_te, seed)


# (ten, loader, cot sinh nhan can bo de kiem ro ri)
CASES = [
    ("SG Condo Rental",      A.load_condo,         ["price"]),
    ("SG HDB Resale",        A.load_hdb,           ["resale_price"]),
    ("House Prices (Kaggle)", A.load_house_prices, []),   # SalePrice da bi drop trong loader -> doi chung
    ("Arrhythmia (UCI)",     A.load_arrhythmia,    []),   # nhan goc -> doi chung
    ("Madelon (UCI)",        A.load_madelon,       []),   # nhan quy doi -> doi chung
]

out = []
for name, loader, leak_cols in CASES:
    df, y, real = loader()
    if df is None:
        print(f"SKIP {name}", flush=True); continue
    print(f"\n=== {name}  shape={df.shape}  anom={y.mean():.4f} ===", flush=True)
    rec = {"dataset": name, "n_rows": int(len(y)), "n_cols": int(df.shape[1]),
           "anomaly_rate": round(float(y.mean()), 4), "label_source_cols": leak_cols,
           "variants": {}}
    variants = {"as_is": df}
    if leak_cols:
        present = [c for c in leak_cols if c in df.columns]
        if present:
            variants["drop_label_source"] = df.drop(columns=present)
            rec["dropped"] = present
    for vname, dfv in variants.items():
        runs = []
        for s in SEEDS:
            r = run_variant(dfv, y, s)
            runs.append(r); print(f"  {vname} seed={s}: {r}", flush=True)
        agg = {k: round(float(np.mean([r[k] for r in runs])), 4) for k in runs[0]}
        agg_sd = {k + "_sd": round(float(np.std([r[k] for r in runs])), 4) for k in runs[0]}
        rec["variants"][vname] = {"mean": agg, "sd": agg_sd, "per_seed": runs,
                                  "n_cols": int(dfv.shape[1])}
    out.append(rec)

dst = Path(__file__).parent / "e1_e2_results.json"
dst.write_text(json.dumps(out, indent=2, ensure_ascii=False))
print(f"\nSAVED {dst}")
