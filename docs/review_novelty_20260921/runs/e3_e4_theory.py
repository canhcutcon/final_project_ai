"""E3: kiem chung so hoc Menh de 3 (cash_theory.tex). E4: tong hop sketch."""
from __future__ import annotations
import json, sys
from pathlib import Path
import numpy as np

_DET = Path("/Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/csv_agent_platform/detection")
sys.path.insert(0, str(_DET / "src"))

rng = np.random.default_rng(0)
TRIALS = 200_000
out = {}

# ---------- E3: Menh de 3 ----------
# s_hat = tau + b_a + xi(a)*sum_{j!=a, h(j)=h(a)} xi(j) b_j
# Claim: P[s_hat >= tau - t*eps_coll] >= 1 - 1/t^2,  eps_coll = sigma*sqrt((p-1)/K)
def prop3_empirical(p, K, tau, sigma, t, trials=TRIALS):
    eps = sigma * np.sqrt((p - 1) / K)
    b_a = rng.normal(0, sigma, trials)
    # so cot va cham ~ Binomial(p-1, 1/K)
    ncoll = rng.binomial(p - 1, 1.0 / K, trials)
    # tong co dau cua ncoll bien N(0,sigma^2) voi dau +-1 -> N(0, sigma^2*ncoll)
    coll = rng.normal(0, 1, trials) * sigma * np.sqrt(ncoll)
    s_hat = tau + b_a + coll
    emp = float((s_hat >= tau - t * eps).mean())
    return {"p": p, "K": K, "t": t, "sigma": sigma,
            "eps_coll": round(float(eps), 4),
            "claimed_lower_bound": round(1 - 1 / t**2, 4),
            "empirical_prob": round(emp, 4),
            "claim_holds": bool(emp >= 1 - 1 / t**2)}

e3 = []
for (p, K, t) in [(1, 64, 2.0), (1, 64, 3.0), (2, 64, 2.0), (5, 64, 2.0),
                  (10, 64, 2.0), (33, 64, 2.0), (65, 64, 2.0), (500, 64, 2.0),
                  (500, 64, 3.0), (279, 64, 2.0), (17, 64, 2.0), (11, 64, 2.0)]:
    e3.append(prop3_empirical(p, K, tau=3.0, sigma=1.0, t=t))
out["E3_proposition3"] = e3

# Phuong an B: dung phuong sai toan bo sigma^2*(1+(p-1)/K)
def prop3_fixed(p, K, tau, sigma, t, trials=TRIALS):
    eps_full = sigma * np.sqrt(1.0 + (p - 1) / K)
    b_a = rng.normal(0, sigma, trials)
    ncoll = rng.binomial(p - 1, 1.0 / K, trials)
    coll = rng.normal(0, 1, trials) * sigma * np.sqrt(ncoll)
    s_hat = tau + b_a + coll
    emp = float((s_hat >= tau - t * eps_full).mean())
    return {"p": p, "K": K, "t": t, "eps_full": round(float(eps_full), 4),
            "claimed_lower_bound": round(1 - 1 / t**2, 4),
            "empirical_prob": round(emp, 4),
            "claim_holds": bool(emp >= 1 - 1 / t**2)}

out["E3_optionB_fixed"] = [prop3_fixed(p, 64, 3.0, 1.0, t)
                           for (p, t) in [(1, 2.0), (5, 2.0), (65, 2.0), (500, 2.0), (500, 3.0)]]

# ---------- E4: tong hop sketch ----------
# So sanh: (a) giai ma count-sketch dung  median_t{ xi_t(a)*T_t[h_t(a)] }
#          (b) median theo toa do  median_t{ T_t[k] }  (cai code dang lam)
def sketch_experiment(p=200, K=64, d=5, trials=2000, sigma=1.0, tau=4.0):
    err_decode, err_coord = [], []
    for _ in range(trials):
        x = rng.normal(0, sigma, p)
        a = rng.integers(0, p)
        x[a] += tau                                  # cot bat thuong
        tabs = np.zeros((d, K))
        hs = rng.integers(0, K, size=(d, p))         # hash doc lap tung bang
        xis = rng.choice([-1.0, 1.0], size=(d, p))
        for t in range(d):
            np.add.at(tabs[t], hs[t], xis[t] * x)
        # (a) giai ma dung cho cot a
        est_decode = np.median([xis[t, a] * tabs[t, hs[t, a]] for t in range(d)])
        # (b) median theo toa do roi doc o bucket cua bang 0
        coordm = np.median(tabs, axis=0)
        est_coord = xis[0, a] * coordm[hs[0, a]]
        err_decode.append(abs(est_decode - x[a]))
        err_coord.append(abs(est_coord - x[a]))
    return {"p": p, "K": K, "d": d,
            "mae_proper_countsketch_decode": round(float(np.mean(err_decode)), 4),
            "mae_coordinatewise_median": round(float(np.mean(err_coord)), 4),
            "ratio_coord_over_decode": round(float(np.mean(err_coord) / np.mean(err_decode)), 3)}

out["E4_sketch_aggregation"] = [sketch_experiment(p=pp, K=64, d=dd)
                                for (pp, dd) in [(200, 3), (200, 5), (500, 5), (50, 5), (17, 5)]]

# E4b: median theo toa do co giam phuong sai so voi d=1 khong?
def coord_median_vs_single(p=200, K=64, d=5, trials=4000, sigma=1.0, tau=4.0):
    e1, ed = [], []
    for _ in range(trials):
        x = rng.normal(0, sigma, p); a = rng.integers(0, p); x[a] += tau
        tabs = np.zeros((d, K))
        hs = rng.integers(0, K, size=(d, p)); xis = rng.choice([-1.0, 1.0], size=(d, p))
        for t in range(d):
            np.add.at(tabs[t], hs[t], xis[t] * x)
        e1.append(abs(xis[0, a] * tabs[0, hs[0, a]] - x[a]))
        cm = np.median(tabs, axis=0)
        ed.append(abs(xis[0, a] * cm[hs[0, a]] - x[a]))
    return {"p": p, "d": d, "mae_single_table": round(float(np.mean(e1)), 4),
            "mae_coord_median_d_tables": round(float(np.mean(ed)), 4)}

out["E4b_does_more_tables_help_coordinatewise"] = [
    coord_median_vs_single(p=pp, d=dd) for (pp, dd) in [(200, 3), (200, 5), (500, 5)]]

dst = Path(__file__).parent / "e3_e4_results.json"
dst.write_text(json.dumps(out, indent=2))
print(json.dumps(out, indent=2))
