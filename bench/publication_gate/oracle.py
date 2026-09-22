"""Oracle doc lap ba tang. KHONG bao gio import contract.py hay gates.py.

  Tang 1  he dich THAT: nap tung dong vao SQLite STRICT, dem dong bi tu choi.
  Tang 2  doi soat nguon<->dich: so dong, tong kiem tung cot so, toan ven tham chieu.
  Tang 3  dac ta nghiep vu doc lap (email). Day la tang YEU NHAT ve tinh doc lap:
          no van la luat do nguoi viet. Khai bao thang thay vi gia vo la oracle that.
"""
from __future__ import annotations
import re, sqlite3
from dataclasses import dataclass
from target_schema import fresh_target, COLUMNS

# Dac ta nghiep vu doc lap — CO Y khac cach gate kiem (gate dung ColumnSpec.dtype)
_EXPERT_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")


@dataclass(frozen=True)
class OracleResult:
    tier1_rejected_rows: int
    tier2_recon_mismatch: dict
    tier3_semantic_violations: int
    @property
    def should_publish(self) -> bool:
        return (self.tier1_rejected_rows == 0
                and not self.tier2_recon_mismatch
                and self.tier3_semantic_violations == 0)
    @property
    def failing_tier(self) -> int:
        if self.tier1_rejected_rows: return 1
        if self.tier2_recon_mismatch: return 2
        if self.tier3_semantic_violations: return 3
        return 0


def _coerce_for_load(v):
    """Nap NGUYEN VAN nhu du lieu den. Khong 'sua giup' — sua giup se giau loi."""
    if v is None or v == "":
        return None
    return v


def _tier1_load(rows: list[dict], transform: str = "identity") -> tuple[int, sqlite3.Connection]:
    con = fresh_target()
    rejected = 0
    ins = f"INSERT INTO txn ({','.join(COLUMNS)}) VALUES ({','.join('?' * len(COLUMNS))})"
    for r in rows:
        vals = []
        for c in COLUMNS:
            v = _coerce_for_load(r.get(c))
            # chi ep kieu khi chuoi la so THUAN — "S$1,250,000" phai giu nguyen de bi tu choi
            if isinstance(v, str) and c in ("txn_id", "district_id", "lease_years"):
                try: v = int(v)
                except ValueError: pass
            elif isinstance(v, str) and c in ("price_sgd", "area_sqm"):
                try: v = float(v)
                except ValueError: pass
            if transform == "round_area" and c == "area_sqm" and isinstance(v, float):
                v = float(round(v))          # phep bien doi ETL lam mat phan thap phan
            vals.append(v)
        try:
            con.execute(ins, vals)
        except sqlite3.IntegrityError:
            rejected += 1
        except sqlite3.Error:
            rejected += 1
    con.commit()
    return rejected, con


def _tier2_reconcile(rows: list[dict], con: sqlite3.Connection) -> dict:
    """Doi soat nguon<->dich. Chi tinh tren dong LE RA nap duoc."""
    mism: dict = {}
    cur = con.execute("SELECT COUNT(*) FROM txn")
    tgt_rows = cur.fetchone()[0]
    src_rows = len(rows)
    if tgt_rows != src_rows:
        mism["row_count"] = {"source": src_rows, "target": tgt_rows}
        return mism   # so dong da lech thi tong kiem vo nghia
    for col in ("price_sgd", "area_sqm"):
        try:
            src_total = round(sum(float(r[col]) for r in rows), 2)
        except (TypeError, ValueError):
            mism[f"{col}_uncomputable"] = True
            continue
        tgt_total = round(con.execute(f"SELECT COALESCE(SUM({col}),0) FROM txn").fetchone()[0], 2)
        if abs(src_total - tgt_total) > 0.01:
            mism[f"{col}_control_total"] = {"source": src_total, "target": tgt_total}
    orphan = con.execute(
        "SELECT COUNT(*) FROM txn t LEFT JOIN district d ON t.district_id=d.district_id "
        "WHERE d.district_id IS NULL").fetchone()[0]
    if orphan:
        mism["referential_orphans"] = orphan
    return mism


def _tier3_semantic(rows: list[dict]) -> int:
    bad = 0
    for r in rows:
        e = r.get("buyer_email")
        if e in (None, ""):
            continue
        if not _EXPERT_EMAIL.match(str(e)):
            bad += 1
    return bad


def judge(rows: list[dict], transform: str = "identity") -> OracleResult:
    rejected, con = _tier1_load(rows, transform)
    try:
        recon = _tier2_reconcile(rows, con)
    finally:
        pass
    sem = _tier3_semantic(rows)
    con.close()
    return OracleResult(rejected, recon, sem)
