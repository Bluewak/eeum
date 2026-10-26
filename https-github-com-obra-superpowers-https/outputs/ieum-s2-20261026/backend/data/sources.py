"""Live adapters for the existing JS snapshot. All dates and text use UTF-8."""
from __future__ import annotations

import copy
import json
import os
import re
import shutil
import subprocess
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

TOP_K_PER_NEED = 3
MAX_CANDIDATES_TOTAL = 6
CONTRACT_VERSION = '1.0'
CONTRACT_STATUS = 'provisional'
RULE_VERSION = 's2-snapshot-review-1.0'
SOURCE_URLS = {
    'domain.js': 'https://drive.google.com/file/d/1REJ37EuPYSdMnmXjEybVjPuKD8GyH9jh/view',
    'data.js': 'https://drive.google.com/file/d/1bdzJzXPk4eOTWJ-LXFUNAuEAc_x24sqz/view',
}


def parse_as_of(value=None) -> date:
    if value is None:
        return datetime.now(timezone(timedelta(hours=9))).date()
    if isinstance(value, datetime):
        raise ValueError('as_of must be an Asia/Seoul calendar date, not a datetime')
    if isinstance(value, date):
        return value
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        raise ValueError('as_of must be YYYY-MM-DD')
    return date.fromisoformat(value)


def validate_limit(limit) -> int:
    if isinstance(limit, bool) or not isinstance(limit, int) or limit < 0:
        raise ValueError('limit must be a non-negative integer')
    return min(limit, MAX_CANDIDATES_TOTAL)


def source_snapshot() -> dict:
    root = Path(os.environ.get('IEUM_SOURCE_ROOT', Path(__file__).resolve().parents[2])).resolve()
    node = os.environ.get('IEUM_NODE') or shutil.which('node')
    if not node:
        raise RuntimeError('Node.js 18+ is required to read the existing JS assets')
    bridge = Path(__file__).with_name('source_bridge.mjs')
    run = subprocess.run([node, str(bridge), str(root)], capture_output=True,
                         text=True, encoding='utf-8', timeout=20)
    if run.returncode:
        raise RuntimeError('Cannot read original JS assets: ' + run.stderr.strip())
    result = json.loads(run.stdout)
    for name in ('cases', 'areas', 'programs', 'facilities'):
        if not isinstance(result.get(name), list):
            raise ValueError(f'Original source export missing: {name}')
    return result


def source_evidence(snapshot, module, record_id, *, synthetic=False, observed_at=None):
    stamp = snapshot['sources'][module]['sha256']
    return {
        'id': f'{module}:{stamp}:{record_id}',
        'source_type': 'synthetic_case' if synthetic else 'collected_snapshot',
        'source_ref': f'dist/{module}', 'record_id': record_id,
        'observed_at': observed_at, 'retrieved_at': snapshot['retrieved_at'],
        'synthetic': synthetic, 'sha256': stamp, 'origin_url': SOURCE_URLS[module],
    }


def program_evidence(snapshot, program):
    evidence = source_evidence(snapshot, 'data.js', program['id'])
    # Collection/publication dates are not a current eligibility observation.
    evidence.update({
        'official_url': program.get('sourceUrl'),
        'collected_at': program.get('collectedAt'),
        'verified_at': program.get('verifiedAt'),
        'source_record': copy.deepcopy(program.get('sourceRecord')),
    })
    return evidence


def normalize_profile(profile):
    if not isinstance(profile, dict):
        raise ValueError('profile must be a profile or ReviewInput object')
    if 'profile_snapshot' in profile:
        result = copy.deepcopy(profile['profile_snapshot'])
        if not isinstance(result, dict):
            raise ValueError('profile_snapshot must be an object')
        # region_id is the contract-level region when explicitly supplied.
        if 'region_id' in profile:
            result['region'] = profile['region_id']
        if profile.get('case_id'):
            result['case_id'] = profile['case_id']
        return result
    return copy.deepcopy(profile)


def load_case(case_id) -> dict:
    snapshot = source_snapshot()
    record = next((c for c in snapshot['cases'] if c['id'] == case_id), None)
    if record is None:
        raise KeyError(f'Unknown case_id: {case_id}')
    evidence = source_evidence(snapshot, 'domain.js', case_id,
                               synthetic=record.get('synthetic') is True,
                               observed_at=record.get('createdAt'))
    profile = copy.deepcopy(record)
    profile['evidence_ids'] = [evidence['id']]
    profile['age_as_of'] = (record.get('createdAt') or '')[:10] or None
    # A hash is a source revision, not an asserted browser localStorage revision.
    return {
        'case_id': case_id,
        'case_revision': 'source-sha256:' + snapshot['sources']['domain.js']['sha256'],
        'profile_snapshot': profile, 'consultation_text': record.get('summary', ''),
        'region_id': record.get('region'), 'synthetic': record.get('synthetic') is True,
        'evidence': [evidence], 'contract_version': CONTRACT_VERSION,
        'contract_status': CONTRACT_STATUS,
    }


def load_regional_context(region_id) -> dict:
    snapshot = source_snapshot()
    area = next((a for a in snapshot['areas'] if a['id'] == region_id), None)
    if area is None:
        raise KeyError(f'Unknown region_id: {region_id}')
    return {
        'region_id': region_id, 'area': copy.deepcopy(area),
        'facilities': [copy.deepcopy(f) for f in snapshot['facilities'] if f.get('region') == region_id],
        'data_meta': copy.deepcopy(snapshot['meta']),
        'evidence': [source_evidence(snapshot, 'data.js', f'area:{region_id}')],
        'individual_inference_allowed': False,
    }


def normalize_needs(needs):
    if not isinstance(needs, (list, tuple)):
        raise ValueError('needs must be an array')
    output, ids = [], set()
    for need in needs:
        if not isinstance(need, dict) or not isinstance(need.get('id'), str) or not isinstance(need.get('category'), str):
            raise ValueError('Each need requires string id and category')
        if not need['id'] or not need['category'] or need['id'] in ids:
            raise ValueError('Need IDs must be unique and nonempty')
        ids.add(need['id'])
        output.append(copy.deepcopy(need))
    return output


def search_programs(needs, profile, as_of=None, limit=MAX_CANDIDATES_TOTAL) -> list[dict]:
    """Rank within explicit need codes; known mismatches remain auditable candidates."""
    from backend.rules.evaluation import evaluate_program_conditions

    day, count = parse_as_of(as_of), validate_limit(limit)
    needs, profile = normalize_needs(needs), normalize_profile(profile)
    if count == 0 or not needs:
        return []
    snapshot = source_snapshot()
    pools = {}
    for need in needs:
        matches = []
        for program in snapshot['programs']:
            if need['category'] not in program.get('needs', []):
                continue
            region = profile.get('region')
            if region and region not in ('unknown', '미확인') and program.get('region') not in (region, 'all', None):
                continue
            checks = evaluate_program_conditions(profile, program, day)
            failures = sum(c['result'] == 'fail' and c['eligibility_condition'] for c in checks)
            matches.append((failures, program['id'], program))
        pools[need['id']] = [p for _, _, p in sorted(matches, key=lambda row: row[:2])[:TOP_K_PER_NEED]]
    # Round-robin gives every request a chance before the global cap is spent.
    selected = {}
    for rank in range(TOP_K_PER_NEED):
        for need in needs:
            pool = pools[need['id']]
            if rank < len(pool) and pool[rank]['id'] not in selected and len(selected) < count:
                selected[pool[rank]['id']] = pool[rank]
    candidates = []
    for program_id, program in selected.items():
        evidence = program_evidence(snapshot, program)
        ids = [n['id'] for n in needs if any(p['id'] == program_id for p in pools[n['id']])]
        candidates.append({
            'program_id': program_id, 'need_ids': ids, 'program_name': program['name'],
            'match_reason': '기존 needs 코드가 일치하는 지원 요청의 후보입니다. 자격·모집·선정을 확정하지 않습니다.',
            'evidence_ids': [evidence['id']], 'evidence': [evidence],
            'matched_categories': [n['category'] for n in needs if n['id'] in ids],
            'rule_version': program.get('ruleVersion'), 'as_of': day.isoformat(),
            'source_sha256': snapshot['sources']['data.js']['sha256'],
            'offering': copy.deepcopy(next(c for c in evaluate_program_conditions(profile, program, day)
                                          if c['field'] == 'offering')),
        })
    return candidates
