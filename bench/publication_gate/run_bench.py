"""Chay thang gate tren corpus. Ba chi so + hai chi so chi phi."""
from __future__ import annotations
import json, sys
from collections import defaultdict
from pathlib import Path

from corpus import build_corpus
from oracle import judge
from contract import CONTRACT_V1
from gates import ALL_GATES
from events import apply_events

K_VALUES = [0, 1, 5, 20]


def main(seed: int = 42, out: str = "results.json"):
    cases = build_corpus(seed=seed)
    results = []
    for K in K_VALUES:
        agg = defaultdict(lambda: dict(un=0, ud=0, fn=0, fd=0, vn=0, vd=0,
                                       scan=0, hash=0))
        for ci, case in enumerate(cases):
            rows0, con0, tr0 = case.rows, CONTRACT_V1, case.transform
            ev = apply_events(rows0, con0, tr0, K, seed + ci)
            o_now = judge(ev.rows, ev.transform)
            for g in ALL_GATES:
                a = g.assess(rows0, con0, tr0)
                d = g.publish(a, ev.rows, ev.contract, ev.transform, ev.claimed_fixes)
                d0 = g.publish(a, rows0, con0, tr0, frozenset())
                s = agg[g.name]
                s["vd"] += 1; s["vn"] += int(d0.publish != d.publish)
                s["scan"] += d.rows_scanned; s["hash"] += d.rows_hashed
                if not o_now.should_publish:
                    s["ud"] += 1; s["un"] += int(d.publish)
                else:
                    s["fd"] += 1; s["fn"] += int(not d.publish)
        for name, s in agg.items():
            results.append({
                "K": K, "gate": name,
                "unsafe_acceptance": round(s["un"] / max(s["ud"], 1), 4),
                "unsafe_n": f"{s['un']}/{s['ud']}",
                "false_block": round(s["fn"] / max(s["fd"], 1), 4),
                "fblock_n": f"{s['fn']}/{s['fd']}",
                "verdict_change": round(s["vn"] / max(s["vd"], 1), 4),
                "rows_scanned_per_decision": round(s["scan"] / max(s["vd"], 1), 1),
                "rows_hashed_per_decision": round(s["hash"] / max(s["vd"], 1), 1),
            })
    Path(out).write_text(json.dumps(results, indent=2))
    h = (f"{'K':>3} {'gate':<28} {'unsafe':>8} {'n':>8} {'fblock':>8} {'n':>7} "
         f"{'vchg':>6} {'scan/qd':>8} {'hash/qd':>8}")
    print(h); print("-" * len(h))
    for r in results:
        print(f"{r['K']:>3} {r['gate']:<28} {r['unsafe_acceptance']:>8.3f} {r['unsafe_n']:>8} "
              f"{r['false_block']:>8.3f} {r['fblock_n']:>7} {r['verdict_change']:>6.3f} "
              f"{r['rows_scanned_per_decision']:>8.1f} {r['rows_hashed_per_decision']:>8.1f}")


if __name__ == "__main__":
    s = int(sys.argv[1]) if len(sys.argv) > 1 else 42
    main(s, sys.argv[2] if len(sys.argv) > 2 else "results.json")
