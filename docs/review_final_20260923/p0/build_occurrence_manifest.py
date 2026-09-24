#!/usr/bin/env python3
"""P0 — occurrence manifest cho cac claim da rut.

Sinh bang may danh sach vi tri cac claim bi rut/thu hep trong PLAN_FINAL.md muc 3.
Thay cho so dem viet tay (vd "chin tep" o TONG_HOP, "bon vi tri" cho ensemble).

Read-only. Khong mo HOLDOUT_CONFIRM.json, khong goi model.
Chay:  python3 build_occurrence_manifest.py  ->  occurrence_manifest.json
"""
from __future__ import annotations
import hashlib, json, re, subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]          # giang_workspace
OUT = Path(__file__).resolve().parent / "occurrence_manifest.json"

# Thu muc quet. Tai lieu cua chinh luot review 23-24/09 KHONG tu quet minh.
SCAN_DIRS = [
    "iuh_master_thesis/chapters",
    "de_cuong_IUH/chapters",
    "final_project_ai/docs/review_novelty_20260921",
    "final_project_ai/bench/publication_gate",
    "csv_agent_platform/generation/experiments/f5_evidence_ablation",
]
SCAN_SUFFIX = {".tex", ".md"}
EXCLUDE_PARTS = {"review_final_20260923", ".venv", "venv", "node_modules", "__pycache__"}
EXCLUDE_SUFFIX_RE = re.compile(r"\.bak$|\.orig$")

# Moi claim: cac pattern phai CUNG xuat hien tren mot dong (AND theo dong).
# `any` = chi can mot pattern khop.
CLAIMS = {
    "C1_llm_beats_template": {
        "desc": "LLM thang template ve do trung thuc (NumFid)",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R01, I1",
        "any": [r"LLM\s+(tot nhat|tốt nhất|thắng|thang)[^\n]{0,60}template",
                r"template[^\n]{0,40}(thua|kém hơn|kem hon)[^\n]{0,30}LLM"],
    },
    "C2_ft_buys_style_only": {
        "desc": "Fine-tuning chi mua van phong / chi cai thien BLEU-ROUGE",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R18",
        "any": [r"(chỉ|chi)\s+(mua|cải thiện|cai thien)[^\n]{0,40}(văn phong|van phong|văn phong|phong cách|phong cach)",
                r"fine-?tun\w*[^\n]{0,60}(chỉ|chi)\s+[^\n]{0,20}(văn phong|van phong|phong cách|phong cach)"],
    },
    "C3_instruction_loss_identified": {
        "desc": "Da xac dinh Ollama cat mat khoi ### Instruction",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R06, I11",
        "any": [r"(cắt|cat)\s+mất[^\n]{0,40}Instruction",
                r"Instruction[^\n]{0,40}(bị cắt|bi cat|mất|mat)\b",
                r"nguyên nhân (thật|that)[^\n]{0,60}num_ctx"],
    },
    "C4_all_gates_34_64": {
        "desc": "Moi gate deu lot 34/64 (B0 that ra 0/64)",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R17",
        "any": [r"(mọi|moi|tất cả|tat ca)\s+gate[^\n]{0,40}34/64", r"34/64[^\n]{0,30}(mọi|moi|tất cả)"],
    },
    "C5_coarse_dominated": {
        "desc": "Freshness tho 'bi ap dao' (that ra la danh doi)",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R17, I4",
        "any": [r"(áp đảo|ap dao)"],
    },
    "C6_b3_absorbed": {
        "desc": "B3 luon bi hap thu vao B2f / trung khit B2f",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R14",
        "any": [r"(hấp thụ|hap thu)", r"B3[^\n]{0,40}(trùng khít|trung khit|trùng|trung)\s*B2f",
                r"B2f[^\n]{0,40}(trùng khít|trung khit)"],
    },
    "C7_p10_proves_theorem": {
        "desc": "Mo phong p>=10 duoc dung nhu chung minh menh de",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R11",
        "any": [r"(đúng|dung)\s+từ\s*\$?p\$?\s*(≳|>=|\\gtrsim|≥)", r"p\s*(≳|\\gtrsim)\s*10"],
    },
    "C8_mae_493x": {
        "desc": "MAE 493x duoc doc nhu detector kem 493 lan",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R12",
        "any": [r"493\s*(×|x|lần|lan)"],
    },
    "C9_firstness": {
        "desc": "Claim dau tien / khong ton tai / dong han linh vuc",
        "plan_ref": "PLAN_FINAL 3 / REVIEW R19",
        "any": [r"(lần đầu tiên|lan dau tien|đầu tiên|dau tien)\b", r"(chưa từng có|chua tung co)",
                r"(không tồn tại|khong ton tai)", r"(vẫn trống|van trong)"],
    },
    "C10_ensemble_significant": {
        "desc": "Ensemble kem CO Y NGHIA thong ke (R13: 4 occurrence / 3 file active)",
        "plan_ref": "PLAN_FINAL 7 D6 / REVIEW R13",
        "all": [r"ensemble|tổ hợp|to hop", r"(có ý nghĩa|co y nghia)"],
    },
    "C11_condo_hdb_real_labels": {
        "desc": "Condo/HDB co nhan that doc lap / khong chiu phe phan danh gia vong tron",
        "plan_ref": "PLAN_FINAL 7 D1b / REVIEW R10",
        "any": [r"(nhãn thật|nhan that)", r"(vòng tròn|vong tron)"],
    },
}


def paragraphs(text: str):
    """Doan = khoi ngan cach boi dong trong. LaTeX xuong dong giua cau nen khop
    theo DONG se bo sot (vd mo_dau.tex:59-61). Comment LaTeX bi loai truoc khi ghep."""
    buf, start = [], None
    for lineno, line in enumerate(text.splitlines(), 1):
        if line.lstrip().startswith("%"):
            continue
        if line.strip():
            if start is None:
                start = lineno
            buf.append(line.strip())
            end = lineno
        elif buf:
            yield {"start": start, "end": end, "text": " ".join(buf)}
            buf, start = [], None
    if buf:
        yield {"start": start, "end": end, "text": " ".join(buf)}


def iter_files():
    for d in SCAN_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for p in sorted(base.rglob("*")):
            if not p.is_file() or p.suffix not in SCAN_SUFFIX:
                continue
            if EXCLUDE_SUFFIX_RE.search(p.name):
                continue
            if EXCLUDE_PARTS & set(p.parts):
                continue
            yield p


def git_head() -> str:
    try:
        return subprocess.run(["git", "-C", str(ROOT), "rev-parse", "HEAD"],
                              capture_output=True, text=True, timeout=20).stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def main() -> int:
    compiled = {
        cid: {"any": [re.compile(p, re.I) for p in spec.get("any", [])],
              "all": [re.compile(p, re.I) for p in spec.get("all", [])]}
        for cid, spec in CLAIMS.items()
    }
    occurrences = {cid: [] for cid in CLAIMS}
    files_seen = []

    for path in iter_files():
        raw = path.read_bytes()
        rel = str(path.relative_to(ROOT))
        files_seen.append({"path": rel, "bytes": len(raw),
                           "sha256": hashlib.sha256(raw).hexdigest()})
        for para in paragraphs(raw.decode("utf-8", "replace")):
            for cid, pats in compiled.items():
                hit = (any(r.search(para["text"]) for r in pats["any"]) if pats["any"] else False) or \
                      (bool(pats["all"]) and all(r.search(para["text"]) for r in pats["all"]))
                if hit:
                    occurrences[cid].append({
                        "path": rel,
                        "line": para["start"], "line_end": para["end"],
                        "text": para["text"][:400],
                    })

    report = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "git_head": git_head(),
        "scope": "active thesis/proposal/docs/bench; review_final_20260923 excluded",
        "note": "Dem theo DOAN (khoi ngan cach dong trong), vi LaTeX xuong dong giua cau. "
                "Danh sach nay la dau vao de RA SOAT thu cong, khong phai phan quyet tu dong.",
        "scan_dirs": SCAN_DIRS,
        "claims": {
            cid: {"desc": CLAIMS[cid]["desc"], "plan_ref": CLAIMS[cid]["plan_ref"],
                  "n_occurrences": len(occurrences[cid]),
                  "n_files": len({o["path"] for o in occurrences[cid]}),
                  "files": sorted({o["path"] for o in occurrences[cid]}),
                  "occurrences": occurrences[cid]}
            for cid in CLAIMS
        },
        "files_scanned": files_seen,
        "n_files_scanned": len(files_seen),
    }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"-> {OUT.name}: {len(files_seen)} file quet")
    for cid, c in report["claims"].items():
        print(f"  {cid:<32} {c['n_occurrences']:>3} occurrence / {c['n_files']} file")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
