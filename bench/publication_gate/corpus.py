"""Sinh corpus: file sach + file tiem loi, ground truth theo DDL HE DICH.

Moi loai loi duoc gan tang oracle nho nhat bat duoc no:
  tier1 = he dich TU CHOI khi nap
  tier2 = he dich NHAN, nhung doi soat nguon<->dich phat hien mat/doi nghia
  tier3 = ca hai deu qua, chi chuyen gia nghiep vu moi biet sai
"""
from __future__ import annotations
import csv, random
from dataclasses import dataclass, field
from pathlib import Path

ERROR_TIERS = {
    "type_currency":   1,   # "S$1,250,000" -> REAL STRICT tu choi
    "null_required":   1,   # deal_ref rong -> NOT NULL
    "dup_unique":      1,   # deal_ref trung -> UNIQUE
    "fk_missing":      1,   # district_id = 99 -> FK
    "check_negative":  1,   # price_sgd <= 0 -> CHECK
    "date_format":     1,   # 15/03/2024 -> CHECK GLOB
    "lease_range":     1,   # lease_years = 0 -> CHECK (hop dong v1 KHONG khai)
    "lossy_load":      2,   # phep bien doi khi NAP lam tron -> tong kiem lech
    "email_semantic":  3,   # email sai dinh dang -> TEXT nhan het
}


@dataclass
class Case:
    case_id: str
    rows: list[dict]
    injected: list[tuple[int, str]] = field(default_factory=list)  # (row_idx, err)
    # Phep bien doi duoc CONG BO cung du lieu (ETL transform la mot phan cua ban xuat).
    # "round_area" lam tron area_sqm luc nap -> nguon va dich lech tong kiem.
    transform: str = "identity"
    @property
    def error_kinds(self) -> set[str]:
        return {k for _, k in self.injected}
    @property
    def max_tier(self) -> int:
        return max((ERROR_TIERS[k] for _, k in self.injected), default=0)
    @property
    def is_clean(self) -> bool:
        return not self.injected


def _clean_row(i: int, rng: random.Random) -> dict:
    return {
        "txn_id": i,
        "deal_ref": f"DL-{i:06d}",
        "district_id": rng.randint(1, 28),
        "price_sgd": round(rng.uniform(3e5, 5e6), 2),
        "area_sqm": round(rng.uniform(30, 350), 2),
        "txn_date": f"20{rng.randint(18,25):02d}-{rng.randint(1,12):02d}-{rng.randint(1,28):02d}",
        "buyer_email": f"buyer{i}@example.com",
        "lease_years": rng.choice([None, 99, 999, 60]),
    }


def _inject(row: dict, kind: str, rng: random.Random, prev_ref: str | None) -> dict:
    r = dict(row)
    if kind == "type_currency":
        r["price_sgd"] = f"S${row['price_sgd']:,.2f}"
    elif kind == "null_required":
        r["deal_ref"] = ""
    elif kind == "dup_unique":
        r["deal_ref"] = prev_ref or "DL-000001"
    elif kind == "fk_missing":
        r["district_id"] = rng.choice([0, 99, 128])
    elif kind == "check_negative":
        r["price_sgd"] = -abs(row["price_sgd"])
    elif kind == "date_format":
        y, m, d = row["txn_date"].split("-")
        r["txn_date"] = f"{d}/{m}/{y}"
    elif kind == "lease_range":
        r["lease_years"] = rng.choice([0, -5, 1500])
    elif kind == "email_semantic":
        r["buyer_email"] = rng.choice(["not-an-email", "a@@b", "buyer at example"])
    else:
        raise ValueError(kind)
    return r


def make_case(case_id: str, n_rows: int, kinds: list[str], n_bad: int, seed: int) -> Case:
    rng = random.Random(seed)
    rows = [_clean_row(i, rng) for i in range(1, n_rows + 1)]
    injected: list[tuple[int, str]] = []
    transform = "identity"
    row_kinds = [k for k in (kinds or []) if k != "lossy_load"]
    if "lossy_load" in (kinds or []):
        transform = "round_area"
        injected.append((-1, "lossy_load"))     # -1 = loi cap tep, khong thuoc dong nao
    if row_kinds and n_bad:
        idxs = rng.sample(range(n_rows), min(n_bad, n_rows))
        for j, idx in enumerate(idxs):
            kind = row_kinds[j % len(row_kinds)]
            prev = rows[idx - 1]["deal_ref"] if idx > 0 else None
            rows[idx] = _inject(rows[idx], kind, rng, prev)
            injected.append((idx, kind))
    return Case(case_id, rows, injected, transform=transform)


def build_corpus(seed: int = 42, n_clean: int = 40, n_rows: int = 200) -> list[Case]:
    """Corpus can bang: ca sach + ca loi tung tang + ca hon hop."""
    rng = random.Random(seed)
    cases: list[Case] = []
    for i in range(n_clean):
        cases.append(make_case(f"clean-{i:03d}", n_rows, [], 0, seed + i))
    # moi loai loi rieng le
    for kind in ERROR_TIERS:
        for i in range(6):
            cases.append(make_case(f"{kind}-{i:02d}", n_rows, [kind],
                                   rng.choice([1, 2, 5]), seed + 1000 + i))
    # hon hop: tier3 + tier2 (KHONG co tier1) -> bay false-ready manh nhat
    for i in range(10):
        cases.append(make_case(f"soft-mix-{i:02d}", n_rows,
                               ["lossy_load", "email_semantic"], 4, seed + 2000 + i))
    rng.shuffle(cases)
    return cases


def write_csv(case: Case, path: Path) -> Path:
    from target_schema import COLUMNS
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        for r in case.rows:
            w.writerow({k: ("" if r[k] is None else r[k]) for k in COLUMNS})
    return path
