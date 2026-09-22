"""Read-only inventory and citation audit; writes only beside this script."""
import ast
import collections
import concurrent.futures
import hashlib
import json
import re
import urllib.request
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
THESIS = ROOT / 'iuh_master_thesis'

def strip_comments(text):
    return re.sub(r'(?<!\\)%[^\n]*', '', text)

def active_files():
    seen = set()
    def visit(path):
        path = path.resolve()
        if path in seen or not path.exists():
            return
        seen.add(path)
        txt = strip_comments(path.read_text())
        for name in re.findall(r'\\(?:input|include)\{([^}]+)\}', txt):
            p = THESIS / name
            if not p.suffix:
                p = p.with_suffix('.tex')
            visit(p)
    visit(THESIS / 'main.tex')
    return sorted(seen)

def get_doi(entry):
    doi = entry.get('f_doi')
    if not doi or doi.startswith('10.48550/'):
        return {'key': entry['key'], 'status': 'NOT_FETCHED', 'reason': 'no CrossRef DOI; provider-specific verification required'}
    url = 'https://api.crossref.org/works/' + urllib.parse.quote(doi, safe='/')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'ThesisEvidenceAudit/1.0'})
        msg = json.load(urllib.request.urlopen(req, timeout=15))['message']
        return {'key': entry['key'], 'status': 'FETCHED_METADATA_ONLY', 'query': url,
                'metadata': {k: msg.get(k) for k in ['DOI', 'title', 'author', 'published', 'published-online', 'published-print', 'container-title', 'type']}}
    except Exception as e:
        return {'key': entry['key'], 'status': 'FETCH_FAILED', 'query': url, 'error': str(e)}

def main():
    src = (THESIS / 'pipeline/stage2_5/verify_refs.py').read_text()
    fn = next(n for n in ast.parse(src).body if isinstance(n, ast.FunctionDef) and n.name == 'parse_bib')
    ns = {'re': re}
    exec(compile(ast.Module(body=[fn], type_ignores=[]), '<existing-parser>', 'exec'), ns)
    entries = ns['parse_bib'](strip_comments((THESIS / 'refs/references.bib').read_text()))
    bykey = {e['key']: e for e in entries}
    files = active_files()
    citations, labels, refs, inventory = [], [], [], []
    for p in files:
        txt = p.read_text()
        rel = str(p.relative_to(ROOT))
        inventory.append({'path': rel, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'lines': len(txt.splitlines())})
        for line, text in enumerate(txt.splitlines(), 1):
            text = strip_comments(text)
            for match in re.finditer(r'\\cite\w*\*?(?:\[[^]]*\])*\{([^}]+)\}', text):
                for key in match[1].split(','):
                    citations.append({'key': key.strip(), 'file': rel, 'line': line, 'context': text})
            labels.extend({'key': k, 'file': rel, 'line': line} for k in re.findall(r'\\label\{([^}]+)\}', text))
            refs.extend({'key': k, 'file': rel, 'line': line} for k in re.findall(r'\\(?:ref|eqref|autoref)\{([^}]+)\}', text))
    used = {c['key'] for c in citations}
    label_keys = {l['key'] for l in labels}
    issues = {'missing_citations': sorted(used-set(bykey)), 'unused_bib': sorted(set(bykey)-used),
              'unresolved_refs': [r for r in refs if r['key'] not in label_keys],
              'duplicate_labels': [k for k, v in collections.Counter(l['key'] for l in labels).items() if v > 1],
              'no_doi_or_url': [e['key'] for e in entries if not e.get('f_doi') and not e.get('f_url') and not 'http' in e.get('f_howpublished', '')],
              'misc_or_techreport': [e['key'] for e in entries if e['type'] in ('misc','techreport')]}
    for name, obj in [('inventory.json', inventory), ('bib_entries.json', entries), ('citation_occurrences.json', citations), ('structural_checks.json', issues)]:
        (OUT/name).write_text(json.dumps(obj, ensure_ascii=False, indent=2))
    print(json.dumps({'files':len(files),'bib':len(entries),'citation_occurrences':len(citations),'unique_cited':len(used),'issues':issues},ensure_ascii=False), flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(get_doi, entries))
    (OUT/'crossref_current.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print(collections.Counter(r['status'] for r in results), flush=True)

if __name__ == '__main__':
    main()
