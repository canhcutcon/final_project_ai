"""He dich thu nghiem — SQLite STRICT.

NGUYEN TAC CHONG VONG TRON: rang buoc o day la NGUON SU THAT cua oracle tang 1.
Gate KHONG duoc doc file nay. Gate chi thay `contract.py` (hop dong khai bao,
co the THIEU SOT so voi DDL) — chinh cho lech do tao ra ca false-ready that.
"""
from __future__ import annotations
import sqlite3

DDL = [
    """
    CREATE TABLE district (
        district_id INTEGER PRIMARY KEY,
        name        TEXT NOT NULL
    ) STRICT
    """,
    """
    CREATE TABLE txn (
        txn_id      INTEGER PRIMARY KEY,
        deal_ref    TEXT    NOT NULL UNIQUE,
        district_id INTEGER NOT NULL REFERENCES district(district_id),
        price_sgd   REAL    NOT NULL CHECK (price_sgd > 0),
        area_sqm    REAL    NOT NULL CHECK (area_sqm > 0),
        txn_date    TEXT    NOT NULL CHECK (txn_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        buyer_email TEXT,
        lease_years INTEGER CHECK (lease_years IS NULL OR (lease_years BETWEEN 1 AND 999))
    ) STRICT
    """,
]

COLUMNS = ["txn_id", "deal_ref", "district_id", "price_sgd", "area_sqm",
           "txn_date", "buyer_email", "lease_years"]

DISTRICTS = [(i, f"D{i:02d}") for i in range(1, 29)]


def fresh_target(path: str = ":memory:") -> sqlite3.Connection:
    con = sqlite3.connect(path)
    con.execute("PRAGMA foreign_keys=ON")
    for stmt in DDL:
        con.execute(stmt)
    con.executemany("INSERT INTO district VALUES (?,?)", DISTRICTS)
    con.commit()
    return con
