# S2 Data and Rules Implementation Plan

> **For agentic workers:** Use executing-plans. This is the supplied S2 scope carried out in this session.

**Goal:** 기존 JS 자산에서 5개 데이터/규칙 인터페이스와 GN-001 1회 출력 제공.

**Architecture:** Python 표준 라이브러리 + 기존 Node.js bridge. 원본 데이터 매 호출 로드, 후보 ID를 원본으로 재조회. S0 확정 계약 미수신은 provisional.

**Tech Stack:** Python 3.11+, Node.js 18+.

**Spec:** docs/s2-design.md (사용자가 제공한 S2 지시를 구현 범위로 정리).

## Global Constraints

TOP_K_PER_NEED=3; MAX_CANDIDATES_TOTAL=6; UNKNOWN_POLICY=preserve; UTF-8; 자료 요청 1회 묶음; 테스트 범위는 사용자 요청의 기능 확인과 필요한 경계만.

## Review Focus

잘못된 날짜 거부; 누락/불리언 나이를 0으로 해석하지 않음; 취업/관계 매핑 분리; 소득 가구/연도/단위 미확인 유지; 불충족 후보 주민 자료 요청 억제.

### Task 1: S2 모듈과 연동 결과

- [x] 최소 smoke 테스트 작성: GN-001 직접 로드, employment 빈 후보, connection 기존 후보, 자격/모집 분리, evidence/rule_version 존재, 자료 요청 중복 없음.
- [x] 원본 JS bridge, Python 어댑터/규칙 구현. 조건이 없는 필드를 pass로 만들지 않음.
- [x] Python stdlib unittest 1회 실행 및 GN-001 JSON 1회 저장. 실패 시 필요한 부분만 수정/재확인.
- [x] 독립 리뷰로 판단/출처 오류 확인, S0 인계 문서와 배포용 ZIP 작성.

## Rulings

제공된 S2 명세와 앞선 구현 안내 후 전달된 소스 링크를 실행 범위로 사용한다. 새 제품 설계·새 프레임워크를 추가하지 않는다. 로컬 Git checkout이 없어 독립 디렉터리에 S2 파일만 작성하며 원본 JS는 byte 그대로 보존한다. S0 계약이 없으므로 contract_version=1.0, contract_status=provisional.

