# S2 데이터 어댑터 구현 범위

사용자가 전달한 S2 지시와 공통 계약을 실행한다. S0 확정 스키마 미수신: contract_status=provisional을 모든 통합 결과에 표시한다.

## 접근

Python 표준 라이브러리 어댑터에서 작은 Node.js bridge로 기존 dist/data.js와 domain.js를 읽는다. 원본 사업 목록은 유지하고 별도 사업 목록을 수작업 작성하지 않는다. JS 모듈을 Python으로 다시 정적으로 전사하는 방법은 원본 변경 반영과 합성 사례 생성 규칙을 놓치므로 사용하지 않는다.

## 파일/인터페이스

- backend/data/source_bridge.mjs: 원본 JS 모듈을 읽어 JSON으로 내보내기. Node.js 외 런타임 의존성 없음.
- backend/data/sources.py: load_case(case_id), load_regional_context(region_id), search_programs(needs, profile, as_of, limit). IEUM_SOURCE_ROOT 환경변수 또는 패키지 루트의 dist 사용.
- backend/rules/evaluation.py: evaluate_candidates(profile, candidates, as_of), build_document_requests(checks). pass/fail/unknown. 수집일로 모집·자격 검증을 추정하지 않음.
- tests/test_s2.py: 1회 실행할 동작 확인; GN-001 및 날짜/소득/누락/제한 관련 최소 경계 확인.
- smoke_s2.py: GN-001 결과 JSON 저장, source/evidence/규칙 버전과 미해결 요청 포함.

## 제약

TOP_K_PER_NEED=3; MAX_CANDIDATES_TOTAL=6; AS_OF=Asia/Seoul 실행일; unknown 유지. 승인 미확인 소득 비교는 수행하지 않는다. 지역 집계는 프로필 누락을 채우지 않는다. 알려진 불충족 후보의 서류를 요청하지 않는다. 기관 원문 검수·모집 확인은 기관 확인 항목으로 분류해 주민 서류 요청과 나눈다. 공식 목록의 requiredDocuments만 실제 문서 요청 종류에 사용하며 나머지는 확인 질문(document_type=null)이다. S0 소유 contracts/ 파일은 생성/수정하지 않는다.

## 완료

GN-001의 employment/connection을 별도로 보존하고 후보·조건 결과·1회 자료 요청 묶음·미해결 요청을 JSON 반환한다. S0/S3 연결과 기관의 현행 자격·모집 확인은 미완료로 보고한다.

