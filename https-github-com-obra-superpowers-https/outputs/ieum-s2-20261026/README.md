# 이음 S2 — 데이터·규칙 평가 인계 패키지

S2 인터페이스 5개와 원본 자산을 읽는 어댑터입니다. **S0 확정 계약 미수신으로 1.0 연결 초안(provisional)**입니다. 기존 지도 앱 전체나 LangGraph 서버를 포함하는 패키지는 아닙니다.

## 실행

Python 3.10+와 Node.js 18+가 필요하며 pip/npm 설치는 없습니다. 패키지 루트에서 실행합니다.

```powershell
python -X utf8 smoke_s2.py --output evidence/gn001-result-new.json
```

보존된 1회 결과는 `evidence/gn001-result.json`입니다(2026-10-25 Asia/Seoul). 소스의 만 나이 기준일과 실행일이 다르면 나이는 unknown으로 남깁니다. 날짜가 달라진 실행의 결과가 달라질 수 있습니다.

실제 프로젝트의 최신 JS 파일을 읽으려면 `IEUM_SOURCE_ROOT`를 그 프로젝트 루트로 지정합니다. 기본값은 이 패키지 루트이며, `dist/domain.js`, `dist/data.js`가 필요합니다. `IEUM_NODE`로 Node.js 실행 경로를 지정할 수도 있습니다.

```powershell
$env:IEUM_SOURCE_ROOT = 'C:\Users\A\Documents\ChatGPT\빅콘\ieum-map-mvp'
python -X utf8 smoke_s2.py --output evidence/gn001-result-new.json
```

## 함수 계약

```python
from backend.data import load_case, load_regional_context, search_programs
from backend.rules import evaluate_candidates, build_document_requests

case = load_case("GN-001")
regional = load_regional_context(case["region_id"])
needs = [
    {"id": "employment-1", "category": "employment",
     "description": "재취업", "evidence_ids": case["profile_snapshot"]["evidence_ids"]},
    {"id": "connection-1", "category": "connection",
     "description": "관계 형성", "evidence_ids": case["profile_snapshot"]["evidence_ids"]},
]
candidates = search_programs(needs, case, "2026-10-25", 6)
checks = evaluate_candidates(case, candidates, "2026-10-25")
document_requests = build_document_requests(checks)
```

| 함수 | 입력 | 반환 |
|---|---|---|
| load_case(case_id) | 원본 사례 ID | CaseSnapshot: ReviewInput 필드, synthetic, evidence |
| load_regional_context(region_id) | gangnam / chuncheon | 지역 집계·시설·원본 메타데이터. 개인 판단에 사용 금지 |
| search_programs(needs, profile, as_of=None, limit=6) | Need 배열, profile 또는 ReviewInput | Candidate 배열. 요청별 최대 3, 전체 최대 6 |
| evaluate_candidates(profile, candidates, as_of=None) | profile 또는 ReviewInput, Candidate 배열 | ConditionCheck 배열. 후보 ID를 원본 목록으로 재조회 |
| build_document_requests(checks) | ConditionCheck 배열 | 중복 제거한 DocumentRequest 배열. 추가 왕복 실행 기능은 없음 |

`as_of=None`은 실제 실행일을 Asia/Seoul 기준으로 계산합니다. 지정 문자열은 YYYY-MM-DD 형식과 달력 날짜를 확인합니다. limit=0은 빈 목록입니다.

## 결과 해석

- `result=pass|fail|unknown`은 개별 수집 조건에 대한 비교입니다. 기관 선정·수급 승인 결과가 아닙니다.
- `axis=offering`과 `eligibility_condition=false`인 모집 상태는 자격 조건과 별개입니다.
- `rules_approved`와 `current_conditions`는 verification 축입니다.
- `detailed_conditions`는 원문의 하위 서비스·예외·제외·중복 이용·기관 심사 등을 unknown으로 보존합니다.
- source ruleVersion과 evaluator_version, evidence_ids, as_of를 각 조건에 남깁니다.
- Candidate의 source_sha256 확장 필드가 있으면 평가 시 소스 변경을 검출합니다. 공통 계약의 최소 필드만 받은 Candidate도 현재 원본을 읽어 평가합니다.
- 소득 플래그만 있는 현재 목록에서는 가구 기준·적용 연도·비교 단위·임계값을 확인할 수 없어 수치를 비교하지 않습니다. incomeConfirmed 또는 과거의 단순 yes/no 문자열로 적격 처리하지 않습니다.
- 주민에게 물어볼 항목만 DocumentRequest로 만듭니다. 기관·내부 검수자의 확인 항목은 체크의 request.audience 및 smoke 결과의 verification_tasks에 있습니다.
- 알려진 자격 불충족 후보는 주민 자료 요청에서 제외합니다.
- 원문 목록의 requiredDocuments만 문서 종류로 사용합니다. 나머지 확인 질문의 document_type은 null입니다. 이 목록은 과거 수집 안내이며 현행 필수 서류 확정이 아닙니다.
- 자료 요청 최대 1회, skip, run_id, 재평가·재개는 S3가 실행 상태로 관리해야 합니다. S2는 1개 목록을 산출합니다.

## 기존 데이터 보존

`dist/`의 두 JS는 Drive에서 받은 원본 바이트 그대로입니다. 원본을 별도 사업 목록으로 손으로 옮기지 않았으며 Node.js bridge가 원본 모듈의 내보낸 객체와 createDemoCases() 결과를 읽습니다. 분석·통신·카드 대용량 원자료를 모델이나 서버에 다시 전송하지 않습니다.

지원사업 기본 범위는 기존 지도 앱에서 골라 둔 12개입니다. 원본 services.csv는 18건이지만 추가 6개는 미구조화 조건이 있어 자동 목록 확장 대상으로 포함하지 않았습니다. 자료 검토에서 추가6건에도 취업사업이 없음을 확인했습니다. 취업 후보 0건은 현재 수집 자료의 범위이며 지역 전체 취업 지원이 없다는 뜻이 아닙니다.

## 보존된 실행 결과

| 요청/항목 | 2026-10-25 1회 결과 |
|---|---|
| GN-001 | 합성 사례, 63세, gangnam |
| employment | 후보 0개, 미해결 |
| connection | gn-community, gn-volunteer, gn-tailored-care |
| 불충족 후보 | gn-tailored-care: 수집 초안 minAge=65와 불일치 |
| 검토 유지 후보 | gn-community, gn-volunteer: 현행 조건·모집 unknown |
| 조건 결과 | 20개 |
| 주민 자료 요청 | 0개 |
| 기관·담당자 확인 | 8개 |
| 최소 단위 확인 | 7개 통과 (날짜 오류 수정 확인 포함, 2026-10-26) |
| GN-001 흐름 확인 | 1회, 11개 핵심 단언 통과 |
| 미연결 | S0 확정 계약, S3/LangGraph, 화면, 리포트, 발송 |

## 인계 상태

```text
session_id: S2
milestone: M1
status: ready
changed_files: backend/data/*, backend/rules/*, smoke_s2.py, tests/test_s2.py, docs/*
contract_version: 1.0 provisional
input_fixture: 원본 dist/domain.js:createDemoCases()[GN-001]
output_example: evidence/gn001-result.json
one_run_result: 2026-10-25 1회 통과; 기관 운영 자격·모집 검증 아님
blocker: S0 확정 계약과 S3 통합 호출부 미수신
next_handoff: S0 필드/확장 필드 합의 후 S3에서 5개 함수 연결
```

