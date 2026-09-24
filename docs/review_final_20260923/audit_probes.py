"""Read-only diagnostic probes; never opens confirmation holdout or invokes models."""
from pathlib import Path
import ast, hashlib, json, sys
ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
F5 = ROOT / 'csv_agent_platform/generation/experiments/f5_evidence_ablation'
GATE = ROOT / 'final_project_ai/bench/publication_gate'
report = {'scope': 'development artifacts and local deterministic probes only', 'confirmation_holdout_opened': False}

def function_from_file(path, name):
    tree = ast.parse(path.read_text())
    fn = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == name)
    scope = {}
    exec(compile(ast.Module(body=[fn], type_ignores=[]), str(path), 'exec'), scope)
    return scope[name]

packet = {'context': {'total_records': 100}, 'clusters': [{'issue_type': 'PRICE_OUTLIER', 'count': 7, 'ratio': '7% of total records', 'samples': []}], 'cross_analysis': []}
old = function_from_file(F5 / 'ablate.py', 'deterministic_report')(packet, 'vi')
fixed = function_from_file(F5 / 'fix_template.py', 'det_v2')(packet, 'vi')
report['template_live_vs_artifact_patch'] = {'live_emits_string_ratio': '7% of total records' in old, 'patch_emits_string_ratio': '7% of total records' in fixed}

sys.path[:0] = [str(GATE), str(ROOT / 'csv_agent_services/backend')]
from corpus import make_case
from contract import CONTRACT_V1
from gates import B0, B2F, B3, B2P
from oracle import judge
case = make_case('review-noop-fix', 10, ['type_currency'], 1, 42)
claimed = frozenset(i for i, _ in case.injected)
res = {}
for cls in [B2F, B3, B2P]:
    gate = cls(); a = gate.assess(case.rows, CONTRACT_V1, case.transform)
    d = gate.publish(a, case.rows, CONTRACT_V1, case.transform, claimed)
    res[gate.name] = {'publish': d.publish, 'rows_scanned': d.rows_scanned}
report['no_op_claimed_fix'] = {'oracle_should_publish': judge(case.rows, case.transform).should_publish, 'gates': res}
clean = make_case('review-delete', 10, [], 0, 42)
gate = B2F(); a = gate.assess(clean.rows, CONTRACT_V1, clean.transform)
try:
    d = gate.publish(a, clean.rows[:-1], CONTRACT_V1, clean.transform)
    report['delete_row'] = {'publish': d.publish}
except Exception as ex:
    report['delete_row'] = {'exception': type(ex).__name__, 'message': str(ex)}

report['gate_k0'] = {}
for seed in [42, 43, 44]:
    rows = json.loads((GATE / f'results_seed{seed}.json').read_text())
    report['gate_k0'][str(seed)] = {r['gate']: {k:r[k] for k in ['unsafe_n','fblock_n']} for r in rows if r['K'] == 0}

# Pair by original case IDs; no confirmation IDs loaded.
old_rows = json.loads((F5 / 'results_n70.json').read_text())['rows']
retest = json.loads((F5 / 'retest_cap1600.json').read_text())['rows']
index = {(r['i'],r['model'],r['level']):r for r in old_rows}
rs = [r for r in retest if r['model']=='qwen2.5:3b-instruct' and r['level']=='L4_full_ep']
def fmt(r):
    heads = ['tóm tắt','vấn đề chính','phân tích chéo','khuyến nghị'] if r['lang']=='vi' else ['summary','key issues','cross analysis','recommendation']
    return sum(h in r['report'].lower() for h in heads)/4
report['paired_25_cap'] = {}
for cap, rows in [(700,[index[(r['i'],r['model'],r['level'])] for r in rs]),(1600,rs)]:
    report['paired_25_cap'][str(cap)] = {'n':len(rows), 'fmt_mean':sum(map(fmt,rows))/len(rows), 'at_cap':sum((r['gen'].get('eval_count') or 0)>=cap for r in rows)}

tracked = [
 'final_project_ai/docs/review_novelty_20260921/assessment.md',
 'final_project_ai/docs/review_novelty_20260921/TONG_HOP.md',
 'final_project_ai/docs/review_novelty_20260921/novelty_map_mapping_cleansing_gate.md',
 'final_project_ai/docs/review_novelty_20260921/reassessment_20260923.md',
 'final_project_ai/docs/review_novelty_20260921/i3_input_serving_audit_20260923.md',
]
for base in [F5, GATE]:
    tracked += [str(p.relative_to(ROOT)) for p in base.iterdir() if p.is_file() and not p.name.startswith('._') and p.suffix in {'.md','.py','.json'} and p.name != 'HOLDOUT_CONFIRM.json']
tracked += [str(p.relative_to(ROOT)) for p in (F5/'expert_kit').iterdir() if p.is_file() and p.suffix in {'.py','.md'} and not p.name.startswith('._')]
report['snapshot'] = []
for rel in sorted(set(tracked)):
    path=ROOT/rel; data=path.read_bytes()
    report['snapshot'].append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
(OUT/'audit_evidence.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='snapshot'},indent=2,ensure_ascii=False))
print('Snapshot files:',len(report['snapshot']))
