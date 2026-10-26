"""One GN-001 integration run, with JSON evidence for S0/S3 handoff."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from backend.data import load_case, load_regional_context, search_programs
from backend.data.sources import CONTRACT_STATUS, CONTRACT_VERSION, normalize_needs, parse_as_of, source_snapshot
from backend.rules import evaluate_candidates, build_document_requests


def run_once():
    as_of = parse_as_of().isoformat()
    case = load_case('GN-001')
    needs = normalize_needs([
        {'id': f'GN-001:{category}', 'category': category,
         'description': '기존 합성 사례의 명시적 지원 요청: ' + category,
         'evidence_ids': [case['evidence'][0]['id']]}
        for category in case['profile_snapshot']['needs']
    ])
    regional = load_regional_context(case['region_id'])
    candidates = search_programs(needs, case, as_of, 6)
    checks = evaluate_candidates(case, candidates, as_of)
    requests = build_document_requests(checks)
    rejected = {c['program_id'] for c in checks if c['eligibility_condition'] and c['result'] == 'fail'}
    results = []
    unresolved = []
    for need in needs:
        matches = [c['program_id'] for c in candidates if need['id'] in c['need_ids']]
        considered = [pid for pid in matches if pid not in rejected]
        reason = ('기존 목록에 해당 요청의 후보가 없습니다.' if not matches
                  else '후보가 있으나 현행 자격·모집·기관 심사는 미확인입니다.')
        results.append({'need_id': need['id'], 'category': need['category'],
                        'candidate_ids': matches, 'not_rejected_ids': considered,
                        'resolution_status': 'unmatched' if not matches else 'provisional_candidates',
                        'reason': reason})
        unresolved.append({'need_id': need['id'], 'reason': reason})
    evidence = {e['id']: e for e in case['evidence'] + regional['evidence']}
    for c in candidates:
        evidence.update({e['id']: e for e in c['evidence']})
    for c in checks:
        evidence[c['source_evidence']['id']] = c['source_evidence']
    verification = [
        {'program_id': c['program_id'], **c['request'], 'reason': c['reason'],
         'evidence_ids': c['evidence_ids'], 'rule_version': c['rule_version']}
        for c in checks if c['program_id'] not in rejected and c['result'] == 'unknown'
        and c.get('request') and c['request']['audience'] in ('agency', 'reviewer')
    ]
    validations = {
        'case_is_synthetic': case['synthetic'] is True,
        'employment_not_substituted_by_volunteering': next(r for r in results if r['category'] == 'employment')['candidate_ids'] == [],
        'connection_has_existing_candidates': any(r['candidate_ids'] for r in results if r['category'] == 'connection'),
        'candidate_limits': len(candidates) <= 6 and all(len(r['candidate_ids']) <= 3 for r in results),
        'all_checks_traceable': all(c['evidence_ids'] and c['rule_version'] for c in checks),
        'all_evidence_resolves': all(eid in evidence for c in checks for eid in c['evidence_ids']),
        'offering_is_separate': all(not c['eligibility_condition'] for c in checks if c['field'] == 'offering'),
        'unverified_offering_preserved': all(c['offering_status'] == 'unknown' for c in checks if c['field'] == 'offering'),
        'no_requests_for_rejected_candidates': all(not rejected.intersection(r['program_ids']) for r in requests),
        'single_deduplicated_bundle': len({(r['field'], r['document_type'], r['question']) for r in requests}) == len(requests),
        'regional_context_not_merged_into_person': regional['individual_inference_allowed'] is False,
    }
    if not all(validations.values()):
        raise AssertionError({k: v for k, v in validations.items() if not v})
    sources = source_snapshot()['sources']
    return {
        'session_id': 'S2', 'milestone': 'M1', 'status': 'ready',
        'contract_version': CONTRACT_VERSION, 'contract_status': CONTRACT_STATUS,
        'input_fixture': 'original dist/domain.js:createDemoCases()[GN-001]',
        'as_of': as_of, 'case': case, 'needs': needs,
        'regional_context': regional, 'candidates': candidates, 'checks': checks,
        'need_results': results, 'unresolved_items': unresolved,
        'document_requests': requests,
        'document_request_policy': {'max_rounds': 1, 'skip_allowed': True,
                                    'request_rounds_executed': 0,
                                    'scope': 'S2 builds a bundle; S3 enforces the run-level counter'},
        'verification_tasks': verification, 'evidence': list(evidence.values()),
        'rejected_candidate_ids': sorted(rejected), 'source_hashes': sources,
        'one_run_result': {'passed': True, 'assertions': validations,
                           'meaning': 'S2 standalone snapshot flow only'},
        'blocker': 'S0 확정 스키마·S3 호출부 미수신. M2 통합과 현행 기관 자격·모집 확인은 미실행.',
        'next_handoff': 'S0 필드 계약 확정 후 S3에 5개 Python 함수 연결',
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='gn001-result.json')
    args = parser.parse_args()
    result = run_once()
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'passed': result['one_run_result']['passed'], 'as_of': result['as_of'],
        'candidates': [c['program_id'] for c in result['candidates']],
        'rejected': result['rejected_candidate_ids'],
        'need_results': result['need_results'], 'document_requests': len(result['document_requests']),
        'agency_reviewer_tasks': len(result['verification_tasks']), 'output': str(path),
    }, ensure_ascii=False, indent=2))
