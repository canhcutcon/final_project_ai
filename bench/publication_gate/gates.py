"""Thang doi chung: B0, B1, B2 (freshness tho), B2f (freshness hat min),
B2' (revalidate luc export), B3 (cham lai ban sua), B4 (AI de xuat sua).

Moi bac them DUNG MOT co che. Tat ca dung `evaluate_readiness` THAT cua
csv_agent_services. Chi phi duoc dem tuong minh:
  rows_scanned = so dong duoc kiem day du (dat)
  rows_hashed  = so dong chi bam digest (re)
"""
from __future__ import annotations
import hashlib, json, re
from dataclasses import dataclass, field
from datetime import datetime

from app.services.readiness_policy import (
    CheckOutcome, CheckStatus, ExecutionStatus, Freshness, Issue,
    MigrationImpact, Severity, evaluate_readiness,
)
from contract import CONTRACT_V1, ColumnSpec

_NUM = re.compile(r"^-?\d+(\.\d+)?$")


def _row_digest(r: dict) -> str:
    return hashlib.sha256(json.dumps(r, sort_keys=True, default=str).encode()).hexdigest()


def _contract_digest(c: dict) -> str:
    return hashlib.sha256(json.dumps({k: str(v) for k, v in sorted(c.items())}).encode()).hexdigest()


def scan_generic(rows, contract, only=None):
    out = []
    idxs = range(len(rows)) if only is None else sorted(only)
    for i in idxs:
        for k, v in rows[i].items():
            if v is None or v == "":
                out.append(Issue(f"g{i}-{k}", "empty_cell", Severity.MEDIUM, row_id=i, column_key=k))
    return out


def _typed_ok(v, spec: ColumnSpec) -> bool:
    if v is None or v == "":
        return not spec.required
    s = str(v)
    if spec.dtype in ("int", "float"):
        if not _NUM.match(s):
            return False
        x = float(s)
        if spec.dtype == "int" and x != int(x):
            return False
        if spec.min_value is not None and x < spec.min_value:
            return False
        if spec.max_value is not None and x > spec.max_value:
            return False
    elif spec.dtype == "date":
        try:
            datetime.strptime(s, spec.date_format or "%Y-%m-%d")
        except ValueError:
            return False
    return True


def scan_target_aware(rows, contract, only=None):
    """Kiem theo hop dong. `only` = chi kiem cac dong nay (freshness hat min).
    Rang buoc UNIQUE la lien dong nen luon duoc dung lai tren toan bo (chi bam gia tri)."""
    out: list[Issue] = []
    idxs = list(range(len(rows))) if only is None else sorted(only)
    for i in idxs:
        r = rows[i]
        for col, spec in contract.items():
            v = r.get(col)
            hard = frozenset({MigrationImpact.TARGET_REJECT})
            if not _typed_ok(v, spec):
                out.append(Issue(f"t{i}-{col}", "type_or_range", Severity.HIGH, hard,
                                 hard_constraint=True, row_id=i, column_key=col, raw_value=str(v)))
            if spec.required and (v is None or v == ""):
                out.append(Issue(f"r{i}-{col}", "required_missing", Severity.HIGH, hard,
                                 hard_constraint=True, row_id=i, column_key=col))
            if spec.fk_table == "district" and v not in (None, ""):
                try:
                    ok = 1 <= int(v) <= 28
                except (TypeError, ValueError):
                    ok = False
                if not ok:
                    out.append(Issue(f"f{i}-{col}", "fk_violation", Severity.HIGH, hard,
                                     hard_constraint=True, row_id=i, column_key=col))
    return out


def scan_unique(rows, contract):
    """Kiem UNIQUE tren toan bo — re, chi bam gia tri, khong kiem kieu/range."""
    out = []
    for col, spec in contract.items():
        if not spec.unique:
            continue
        seen = {}
        for i, r in enumerate(rows):
            v = r.get(col)
            if v in (None, ""):
                continue
            if v in seen:
                out.append(Issue(f"u{i}-{col}", "duplicate_key", Severity.HIGH,
                                 frozenset({MigrationImpact.TARGET_REJECT}),
                                 hard_constraint=True, row_id=i, column_key=col))
            seen[v] = i
    return out


@dataclass
class GateDecision:
    publish: bool
    state: str
    freshness: str
    blockers: tuple = ()
    rows_scanned: int = 0
    rows_hashed: int = 0


def _decide(issues, freshness, scanned=0, hashed=0) -> GateDecision:
    checks = [CheckOutcome("scan", CheckStatus.FAIL if issues else CheckStatus.PASS)]
    v = evaluate_readiness(run_status=ExecutionStatus.SUCCEEDED, freshness=freshness,
                           checks=checks, issues=issues)
    return GateDecision(v.can_publish, v.state.value, v.freshness.value,
                        tuple(b.code for b in v.blockers), scanned, hashed)


class Gate:
    name = "B?"
    target_aware = False
    mode = "frozen"          # frozen | coarse | fine | revalidate
    rescore_fixes = False

    def scan(self, rows, contract, only=None):
        return (scan_target_aware if self.target_aware else scan_generic)(rows, contract, only)

    def assess(self, rows, contract, transform):
        issues = self.scan(rows, contract)
        if self.target_aware:
            issues = issues + scan_unique(rows, contract)
        return {"issues": issues,
                "row_digests": [_row_digest(r) for r in rows],
                "cdig": _contract_digest(contract), "transform": transform,
                "n": len(rows)}

    # ── helper: xoa issue cua cac dong duoc TUYEN BO da sua (khong kiem chung) ──
    @staticmethod
    def _trust_fixes(issues, claimed):
        if not claimed:
            return issues
        return [i for i in issues if i.row_id not in claimed]

    def publish(self, a, rows, contract, transform, claimed_fixes=frozenset()):
        n = len(rows)
        if self.mode == "revalidate":
            iss = self.scan(rows, contract)
            if self.target_aware:
                iss = iss + scan_unique(rows, contract)
            return _decide(iss, Freshness.CURRENT, scanned=n, hashed=0)

        if self.mode == "frozen":
            return _decide(self._trust_fixes(a["issues"], claimed_fixes),
                           Freshness.CURRENT, scanned=0, hashed=0)

        # so sanh danh tinh
        cur = [_row_digest(r) for r in rows]
        changed = {i for i in range(min(n, a["n"])) if cur[i] != a["row_digests"][i]}
        if n != a["n"]:
            changed |= set(range(min(n, a["n"]), max(n, a["n"])))
        sem_changed = (_contract_digest(contract) != a["cdig"]) or (transform != a["transform"])

        if self.mode == "coarse":
            fresh = Freshness.CURRENT if (not changed and not sem_changed) else Freshness.STALE
            return _decide(self._trust_fixes(a["issues"], claimed_fixes), fresh,
                           scanned=0, hashed=n)

        # mode == "fine"
        if sem_changed:
            iss = self.scan(rows, contract)
            if self.target_aware:
                iss = iss + scan_unique(rows, contract)
            return _decide(iss, Freshness.CURRENT, scanned=n, hashed=n)

        recheck = set(changed)
        if self.rescore_fixes:
            recheck |= set(claimed_fixes)          # B3: cham lai ban sua, khong tin tuyen bo
        kept = [i for i in a["issues"] if i.row_id not in recheck]
        if not self.rescore_fixes:
            kept = self._trust_fixes(kept, claimed_fixes)
        fresh_iss = self.scan(rows, contract, only=recheck) if recheck else []
        iss = kept + fresh_iss
        if self.target_aware:
            iss = [i for i in iss if i.rule_id != "duplicate_key"] + scan_unique(rows, contract)
        return _decide(iss, Freshness.CURRENT, scanned=len(recheck), hashed=n)


class B0(Gate):
    name = "B0-generic"

class B1(Gate):
    name = "B1-target-aware"
    target_aware = True

class B2(B1):
    name = "B2-freshness-coarse"
    mode = "coarse"

class B2F(B1):
    name = "B2f-freshness-fine"
    mode = "fine"

class B2P(B1):
    name = "B2prime-revalidate"
    mode = "revalidate"

class B3(B2F):
    name = "B3-candidate-rescoring"
    rescore_fixes = True

class B4(B3):
    name = "B4-ai-assisted-repair"


ALL_GATES = [B0(), B1(), B2(), B2F(), B2P(), B3()]
