"""Quet chi phi theo co tep: tim diem hoa von giua B2f (hat min) va B2' (revalidate).

Chi phi KHONG phu thuoc oracle, nen bo oracle ra khoi vong lap de chay duoc co lon.
Do hai dai luong:
  rows_scanned  — so dong duoc kiem day du (dai luong thay the, khong phu thuoc may)
  wall_ms       — thoi gian thuc cua buoc publish (phu thuoc may, co nhieu)
"""
from __future__ import annotations
import json, statistics, sys, time
from pathlib import Path

from corpus import make_case
from contract import CONTRACT_V1
from gates import B2F, B2P
from events import apply_events

SIZES = [200, 2_000, 20_000]
K_VALUES = [1, 2, 5, 10, 20]
REPS = 5


def bench_one(n_rows: int, K: int, seed: int):
    case = make_case(f"c{n_rows}-{K}", n_rows, ["type_currency"], 3, seed)
    rows0, con0, tr0 = case.rows, CONTRACT_V1, case.transform
    ev = apply_events(rows0, con0, tr0, K, seed)
    out = {}
    for G in (B2F, B2P):
        g = G()
        a = g.assess(rows0, con0, tr0)          # khong tinh vao chi phi publish
        t0 = time.perf_counter()
        d = g.publish(a, ev.rows, ev.contract, ev.transform, ev.claimed_fixes)
        dt = (time.perf_counter() - t0) * 1000
        out[g.name] = {"scanned": d.rows_scanned, "hashed": d.rows_hashed, "ms": dt}
    return out


def main():
    rows = []
    for n in SIZES:
        for K in K_VALUES:
            acc = {}
            for rep in range(REPS):
                r = bench_one(n, K, 42 + rep * 97)
                for gate, m in r.items():
                    acc.setdefault(gate, []).append(m)
            rec = {"n_rows": n, "K": K}
            for gate, ms in acc.items():
                tag = "B2f" if "fine" in gate else "B2p"
                rec[f"{tag}_scanned"] = round(statistics.mean(m["scanned"] for m in ms), 1)
                rec[f"{tag}_ms"] = round(statistics.median(m["ms"] for m in ms), 2)
            rec["scan_saving"] = round(1 - rec["B2f_scanned"] / max(rec["B2p_scanned"], 1), 3)
            rec["time_saving"] = round(1 - rec["B2f_ms"] / max(rec["B2p_ms"], 1e-9), 3)
            rows.append(rec)
            print(f"n={n:>6} K={K:>3}  B2f={rec['B2f_scanned']:>8.1f} dong / {rec['B2f_ms']:>7.2f} ms"
                  f"   B2'={rec['B2p_scanned']:>8.1f} / {rec['B2p_ms']:>7.2f} ms"
                  f"   tiet kiem: quet {rec['scan_saving']:>6.1%}  thoi gian {rec['time_saving']:>7.1%}", flush=True)
    Path("cost_sweep.json").write_text(json.dumps(rows, indent=2))


if __name__ == "__main__":
    main()
