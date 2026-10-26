"""Explainable, conservative checks over the original collected rules."""
from __future__ import annotations

import copy
import hashlib
import math
import re
from datetime import date, datetime, timedelta, timezone

from backend.data.sources import (
    RULE_VERSION, normalize_profile, parse_as_of, program_evidence, source_snapshot,
)


def known_number(value):
    return (not isinstance(value, bool) and isinstance(value, (int, float))
            and math.isfinite(value) and value >= 0)


def source_day(value):
    """A missing value is None; false/zero/empty/malformed values are invalid."""
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError('Source date must be a date or ISO timestamp string')
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        return date.fromisoformat(value)
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})', value):
        raise ValueError('Invalid source ISO timestamp')
    return datetime.fromisoformat(value.replace('Z', '+00:00')).astimezone(
        timezone(timedelta(hours=9))).date()


def evaluate_program_conditions(profile, program, as_of) -> list[dict]:
    """Each result is a single condition, never an institution's decision.

    Structured minAge/maxAge are draft snapshot checks. Unstructured clauses
    stay unknown even if a caller toggles rulesApproved on its own.
    """
    profile, day = normalize_profile(profile), parse_as_of(as_of)
    checks = []

    def add(field, result, reason, *, axis='eligibility', audience=None,
            question=None, document_type=None, request_field=None):
        check = {
            'program_id': program['id'], 'field': field, 'result': result,
            'reason': reason, 'evidence_ids': list(profile.get('evidence_ids') or []),
            'rule_version': program.get('ruleVersion') or 'source-rule-version-unknown',
            'evaluator_version': RULE_VERSION, 'as_of': day.isoformat(),
            'axis': axis, 'eligibility_condition': axis == 'eligibility',
            'request': None,
        }
        if result == 'unknown' and audience and question:
            check['request'] = {
                'field': request_field or field, 'audience': audience,
                'document_type': document_type, 'question': question,
            }
        checks.append(check)

    region, required_region = profile.get('region'), program.get('region')
    if required_region == 'all':
        add('region', 'pass', '스냅샷의 지역 범위는 전국입니다.')
    elif not required_region or not region or region in ('unknown', '미확인'):
        add('region', 'unknown', '사례 거주지 또는 사업의 지역 조건이 미확인입니다.',
            audience='resident' if required_region else 'agency',
            question='현재 거주 지역을 확인해 주세요.' if required_region else '사업의 지역 조건을 확인해 주세요.')
    else:
        add('region', 'pass' if region == required_region else 'fail',
            '사례 거주지와 수집된 사업 지역 조건을 대조했습니다.')

    minimum, maximum = program.get('minAge'), program.get('maxAge')
    if known_number(minimum) or known_number(maximum):
        age, age_day = profile.get('age'), profile.get('age_as_of')
        if not known_number(age) or (age_day is not None and age_day != day.isoformat()):
            add('age', 'unknown', '검토 기준일의 만 나이가 확인되지 않았습니다.',
                audience='resident', question='검토 기준일의 만 나이를 확인해 주세요.')
        else:
            failed = (known_number(minimum) and age < minimum) or (known_number(maximum) and age > maximum)
            add('age', 'fail' if failed else 'pass',
                f'수집 초안 연령 조건 {minimum}~{maximum}세와 확인한 나이 {age}세를 비교했습니다. 하위 서비스·예외는 별도 검수 대상입니다.')

    target = program.get('eligibilityText') or ''
    if '1인가구' in target or '독거' in target:
        living = profile.get('livingArrangement')
        alone = profile.get('living_alone')
        if alone not in ('yes', 'no'):
            alone = ('yes' if living == '혼자 거주'
                     else 'no' if living in ('가족과 거주', '배우자와 거주') else 'unknown')
        # Actual living situation is distinct from official household registration.
        # A negative answer does not exclude other, unstructured eligibility routes.
        add('living_alone', 'pass' if alone == 'yes' else 'unknown',
            '혼자 거주 응답을 확인했습니다. 공식 가구 기준·다른 대상 경로는 별도 확인합니다.'
            if alone == 'yes' else '사업에 혼자 거주 조건 또는 다른 대상 경로가 있어 기관 확인이 필요합니다.',
            audience='resident' if alone == 'unknown' else 'agency',
            question='현재 혼자 거주하는지 확인해 주세요.' if alone == 'unknown'
            else '다른 대상 경로와 공식 가구 기준을 확인해 주세요.')

    if program.get('incomeRequired'):
        # The source exposes a flag, not a household/year/unit-specific threshold.
        # Legacy strings incomeAssessments[id]='yes' are not calculation evidence.
        add('income', 'unknown',
            '소득·수급 조건의 가구 기준, 적용 연도, 비교 단위와 임계값이 구조화·검수되지 않아 계산하지 않았습니다. 일반 소득확인 또는 다른 사업 판정을 재사용하지 않습니다.',
            audience='resident', request_field='income_context',
            question='이 사업에 필요한 현재 가구 구성과 수급 유형·소득 자료의 보유 여부를 확인해 주세요.')

    if program.get('jobSeekingRequired'):
        seeking = profile.get('jobSeeking')
        add('job_seeking', 'pass' if seeking == 'yes' else 'fail' if seeking == 'no' else 'unknown',
            '현재 구직 의사 응답을 대조합니다.', audience='resident',
            question='현재 구직 의사와 취업 가능 여부를 확인해 주세요.')

    add('rules_approved', 'pass' if program.get('rulesApproved') is True else 'unknown',
        '수집 자료의 규칙 승인 상태입니다. 개별 필드 비교는 기관의 최종 자격 결정이 아닙니다.',
        axis='verification', audience='reviewer', question='공식 원문과 기계 규칙을 검수해 주세요.')

    verified = program.get('verifiedAt')
    try:
        verified_day = source_day(verified)
    except ValueError:
        verified_day = None
    verified_age = (day - verified_day).days if verified_day else None
    policy_year = program.get('policyYear')
    current = (program.get('rulesApproved') is True and verified_age is not None
               and 0 <= verified_age <= 180 and
               (policy_year is None or (type(policy_year) is int and policy_year == day.year)))
    add('current_conditions', 'pass' if current else 'unknown',
        '현행 검증일 기준의 스냅샷 신선도 확인입니다. 수집일·게시일은 현행 검증일로 사용하지 않습니다.',
        axis='verification', audience='agency', question='현행 사업 조건과 적용 연도를 확인해 주세요.')

    # No keyword-derived yes/no decision on complex legal or clinical conditions.
    detail = ' / '.join(str(program.get(k) or '') for k in ('eligibilityText', 'exclusionText', 'ruleNotes'))
    add('detailed_conditions', 'unknown',
        '하위 서비스·예외·중복 이용·기관 심사 등 미구조화 조건을 기관이 확인해야 합니다. ' + detail,
        audience='agency', question='지원대상·예외·제외·중복 이용 및 하위 서비스 조건을 검수해 주세요.')

    offer = program.get('offering') or {}
    offer_type = offer.get('type', 'unknown')
    dates, malformed = {}, False
    for key in ('start', 'end'):
        try:
            dates[key] = source_day(offer.get(key))
        except ValueError:
            dates[key], malformed = None, True
    if dates['start'] and dates['end'] and dates['start'] > dates['end']:
        malformed = True
    if offer_type == 'closed' or (dates['end'] and dates['end'] < day):
        offering, offer_result = 'closed', 'fail'
    elif (current and not malformed and not (dates['start'] and dates['start'] > day)
          and offer_type in ('open', 'consultation')):
        offering, offer_result = offer_type, 'pass'
    else:
        offering, offer_result = 'unknown', 'unknown'
    add('offering', offer_result, '모집 상태는 자격 조건과 별도로 확인합니다.',
        axis='offering', audience='agency', question='현재 모집·대기 접수·정원 상태를 확인해 주세요.')
    checks[-1]['offering_status'] = offering
    checks[-1]['verified_at'] = verified
    checks[-1]['collected_at'] = program.get('collectedAt')

    available_documents = profile.get('document_types') or []
    if not isinstance(available_documents, list):
        raise ValueError('document_types must be an array of confirmed document type names')
    for document in dict.fromkeys(program.get('requiredDocuments') or []):
        if not isinstance(document, str) or not document.strip():
            continue
        add('required_document:' + document, 'pass' if document in available_documents else 'unknown',
            f'기존 공식 수집 목록에 명시된 서류: {document}. 현행 필수 여부는 기관 확인 대상입니다.',
            axis='document', audience='resident', document_type=document,
            request_field='required_document:' + document,
            question=f'수집 안내에 명시된 {document}의 보유 여부를 확인해 주세요. 현행 제출 요구는 기관에 재확인합니다.')
    return checks


def evaluate_candidates(profile, candidates, as_of=None) -> list[dict]:
    profile, day = normalize_profile(profile), parse_as_of(as_of)
    snapshot = source_snapshot()
    programs = {p['id']: p for p in snapshot['programs']}
    output, seen = [], set()
    for candidate in candidates:
        program_id = candidate['program_id']
        if program_id in seen:
            continue
        seen.add(program_id)
        if program_id not in programs:
            raise KeyError(f'Candidate is absent from original catalogue: {program_id}')
        if (candidate.get('source_sha256') is not None
                and candidate['source_sha256'] != snapshot['sources']['data.js']['sha256']):
            raise ValueError('Candidate source revision changed; search again before evaluating')
        program = programs[program_id]
        evidence = program_evidence(snapshot, program)
        for check in evaluate_program_conditions(profile, program, day):
            check['evidence_ids'] = list(dict.fromkeys(check['evidence_ids'] + [evidence['id']]))
            check['source_evidence'] = evidence
            output.append(check)
    return output


def build_document_requests(checks) -> list[dict]:
    """A single deduplicated bundle; agency/reviewer tasks never become resident asks."""
    rejected = {c['program_id'] for c in checks
                if c.get('eligibility_condition') and c['result'] == 'fail'}
    grouped = {}
    for check in checks:
        request = check.get('request')
        if (check['program_id'] in rejected or check['result'] != 'unknown'
                or not request or request['audience'] != 'resident'):
            continue
        key = (request['field'], request['document_type'], request['question'])
        if key not in grouped:
            token = hashlib.sha256(repr(key).encode('utf-8')).hexdigest()[:16]
            grouped[key] = {
                'id': 'request-' + token, 'field': request['field'],
                'document_type': request['document_type'], 'question': request['question'],
                'reason': check['reason'], 'program_ids': [], 'evidence_ids': [],
                'rule_versions': {}, 'audience': 'resident',
            }
        item = grouped[key]
        if check['program_id'] not in item['program_ids']:
            item['program_ids'].append(check['program_id'])
        item['evidence_ids'] = list(dict.fromkeys(item['evidence_ids'] + check.get('evidence_ids', [])))
        item['rule_versions'][check['program_id']] = check.get('rule_version')
    return list(grouped.values())
