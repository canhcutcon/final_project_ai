"""Su kien thay doi SAU danh gia, TRUOC xuat ban.

Bon loai (thiet ke Phan C/F). Cua so lech K = SO SU KIEN (bien doi NGOAI SINH),
tuong ung K_live cua Shraga et al. (ACSOS 2026) nhung don vi khac.

`claimed_fixes` la kenh RIENG: he thong TUYEN BO da sua dong nao. Gate khong
cham lai se TIN tuyen bo do; gate co cham lai se kiem chung. Do la khac biet
duy nhat giua B2f va B3.
"""
from __future__ import annotations
import random
from dataclasses import dataclass, field
from contract import CONTRACT_V2

EVENT_KINDS = ["data_change", "constraint_tighten", "transform_change", "partial_fix"]


@dataclass
class EventOutcome:
    rows: list
    contract: dict
    transform: str
    claimed_fixes: set = field(default_factory=set)   # chi so dong duoc TUYEN BO da sua
    log: list = field(default_factory=list)


def _corrupt_one(rows, rng):
    """(i) mot dong tro nen hong theo kieu hop dong v1 CO bat."""
    r = rng.randrange(len(rows))
    rows[r] = dict(rows[r])
    v = rows[r].get("price_sgd")
    try:
        f = abs(float(v))
    except (TypeError, ValueError):
        f = 1000.0
    rows[r]["price_sgd"] = f"S${f:,.2f}"
    return rows, r


def _attempt_fix(rows, rng):
    """(iv) sua MOT loi. CO CHU Y: 40% lan sua HONG (van con sai) nhung VAN tuyen bo da sua.
    Day chinh la thu ma viec cham lai ban sua phai bat duoc."""
    for i, r in enumerate(rows):
        v = str(r.get("price_sgd", ""))
        if v.startswith("S$"):
            rows[i] = dict(r)
            if rng.random() < 0.4:
                rows[i]["price_sgd"] = v.replace("S$", "")      # SUA HONG: con dau phay
            else:
                rows[i]["price_sgd"] = float(v.replace("S$", "").replace(",", ""))
            return rows, i
        if r.get("deal_ref") == "":
            rows[i] = dict(r)
            rows[i]["deal_ref"] = f"FIXED-{i:06d}"
            return rows, i
    return rows, None


def apply_events(rows, contract, transform, k: int, seed: int) -> EventOutcome:
    rng = random.Random(seed)
    rows = [dict(r) for r in rows]
    claimed: set = set()
    log = []
    for _ in range(k):
        kind = rng.choice(EVENT_KINDS)
        if kind == "data_change":
            rows, _i = _corrupt_one(rows, rng)
        elif kind == "constraint_tighten":
            contract = CONTRACT_V2
        elif kind == "transform_change":
            transform = "round_area" if transform == "identity" else "identity"
        elif kind == "partial_fix":
            rows, i = _attempt_fix(rows, rng)
            if i is not None:
                claimed.add(i)
        log.append(kind)
    return EventOutcome(rows, contract, transform, claimed, log)
