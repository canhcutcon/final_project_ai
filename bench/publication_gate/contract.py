"""Hop dong ma GATE nhin thay — CO Y THIEU SOT so voi DDL that.

Do lech giua file nay va `target_schema.py` la thu tao ra ca false-ready.
Moi muc `declared` = gate biet; `undeclared_in_target` = hệ dich van cuong che
nhung hop dong khong khai -> gate khong the bat neu chi doc hop dong.
"""
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass(frozen=True)
class ColumnSpec:
    name: str
    dtype: str                 # "int" | "float" | "text" | "date"
    required: bool = False
    unique: bool = False
    fk_table: str | None = None
    min_value: float | None = None
    max_value: float | None = None
    date_format: str | None = None


# v1 — hop dong "day du mot cach hop ly" nhung VAN thieu 2 thu:
#   * khong khai lease_years BETWEEN 1..999  (he dich CO cuong che)
#   * khong khai district_id la khoa ngoai    (he dich CO cuong che)
CONTRACT_V1 = {
    "txn_id":      ColumnSpec("txn_id", "int", required=True, unique=True),
    "deal_ref":    ColumnSpec("deal_ref", "text", required=True, unique=True),
    "district_id": ColumnSpec("district_id", "int", required=True),
    "price_sgd":   ColumnSpec("price_sgd", "float", required=True, min_value=0.000001),
    "area_sqm":    ColumnSpec("area_sqm", "float", required=True, min_value=0.000001),
    "txn_date":    ColumnSpec("txn_date", "date", required=True, date_format="%Y-%m-%d"),
    "buyer_email": ColumnSpec("buyer_email", "text"),
    "lease_years": ColumnSpec("lease_years", "int"),
}

# v2 — hop dong duoc SIET (su kien "rang buoc dich doi"): them FK + range
CONTRACT_V2 = dict(CONTRACT_V1)
CONTRACT_V2["district_id"] = ColumnSpec("district_id", "int", required=True, fk_table="district")
CONTRACT_V2["lease_years"] = ColumnSpec("lease_years", "int", min_value=1, max_value=999)
