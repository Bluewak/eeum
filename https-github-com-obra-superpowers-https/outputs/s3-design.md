# S3 LangGraph·백엔드 API 설계 검토안

작성일: 2026-10-26. 상태: 구현 전 검토안. 이 문서는 구현 완료의 증거가 아니다.

## 기준과 확인한 자산

- 사용자가 전달한 공통 프롬프트와 S3 명세를 구현 범위로 삼는다.
- 원본: 제공한 Drive 폴더의 `GPT 참고용/ieum-map-mvp`.
- 현재 작업 루트: `C:/Users/A/Documents/ChatGPT/빅콘`.
- 인접한 `HDIT-빅콘/ieum-map-mvp/contracts/implementation.md`는 재사용 후보인 계약 초안이다. 현재 프로젝트에서 S0가 확정한 계약과 동일하다고 간주하지 않는다.
- 기존 지도는 정적 JavaScript 앱이다. 별도 세션이 소스를 가져오는 중이므로 이 세션은 원본 파일을 덮어쓰지 않는다.

## 목적·범위

S3는 실제 LangGraph 실행과 영속 상태, API, 실제 노드 이벤트를 담당한다. S2의 규칙 평가, S5의 리포트, S6의 발송 기능은 인터페이스로 연결한다. 아직 없는 인터페이스는 명시적인 fixture/mock으로만 대체한다.

자료 요청은 검토 실행당 최대 1회다. 건너뛰면 미확인 조건을 유지한다. LLM이 분리한 employment/connection을 끝까지 유지하고, 지역 집계로 개인 정보를 채우지 않는다. 실제 발송이나 운영 배포는 이번 개발 확인 범위에 포함하지 않는다.

## 접근 방식

1. **권장: 표준 ThreadingHTTPServer + LangGraph + SQLite.** 인접 계약 초안의 서버 구성과 맞고 SSE와 POST를 동시에 처리한다. 별도 API 프레임워크를 추가하지 않는다.
2. FastAPI + LangGraph + SQLite. 요청 모델과 API 문서화는 편리하나 이번 계약에 없는 의존성과 서버 구성이 추가된다.

두 방식 모두 LangGraph를 실제 실행 엔진으로 사용한다. 권장안 선택은 아직 사용자 확인 전이며, 세부 구현 선택은 S3가 맡는다.

## 수정 소유권과 연결

- S3: `backend/graph/`, API 조립, 체크포인트/이벤트 저장, LLM 구조화 출력 어댑터, S3 실행 설정과 확인 스크립트.
- 공통 스키마와 fixture는 S0 소유다. S3가 계약을 독단적으로 확정하거나 다른 세션의 파일을 덮어쓰지 않는다.
- S0 확정 계약이 아직 없으면 사용자가 전달한 공통 객체와 S3 API를 임시 경계로 사용한다. 인접 계약의 추가 필드는 내부 어댑터로만 처리하고, S0 계약이 도착하면 이 경계에서 매핑한다. 임시 계약임을 실행 결과에 표시한다.
- S2 `load_case`, `load_regional_context`, `search_programs`, `evaluate_candidates`, `build_document_requests`를 연결한다. 기존 JS 사업 목록과 규칙을 재사용하며 별도 사업 목록을 만들지 않는다.
- S5 `render_report`, S6 `draft_message`, `send_approved_message`, `complete_review`를 연결한다. 함수 인수와 상태값은 현재 S0 계약에 맞춘다.

## 실행과 영속성

`load_context → extract_needs → retrieve_programs → evaluate_conditions → prepare_documents → request_documents(interrupt, 필요 시) → reevaluate → compose_plan → render_report → draft_message → human_review(interrupt) → dispatch → await_completion(interrupt) → END`.

- `thread_id=run_id`를 생성부터 재개까지 유지한다.
- 프로젝트 `runtime/` 또는 명시적으로 지정한 영속 경로의 SQLite 파일에 체크포인트를 기록한다. 임시 경로와 메모리 저장소를 영속 저장이라고 표시하지 않는다.
- 자료 요청 카운트와 대기 상태를 interrupt 앞의 별도 노드에서 기록한다. 재실행되어도 카운트를 중복 증가시키지 않는다.
- 재개 요청은 현재 interrupt ID와 종류를 확인하고 `Command(resume=...)`로만 재개한다. 일반 resume으로 최종 검토를 우회하지 않는다.
- 실행 단위 잠금으로 resume·초안 수정·send·complete를 직렬화한다. 동시에 두 작업자가 같은 실행을 처리하지 않도록 배포는 단일 서버 프로세스로 한정한다.
- 이벤트는 실제 노드 완료·대기·오류에 대해 순서 번호와 함께 저장한다. SSE는 저장된 이벤트를 재전송하며 `Last-Event-ID` 이후부터 이어받을 수 있다.
- 노드 안의 리포트 생성과 발송은 안정적인 ID 및 멱등키를 사용한다. 발송 결과가 불명확하면 unknown으로 두고 자동 재발송하지 않는다.

## API

- `POST /api/cases/{case_id}/reviews`: ReviewInput으로 실행 생성.
- `GET /api/reviews/{run_id}`: 현재 상태·결과·대기 중 interrupt.
- `GET /api/reviews/{run_id}/events`: ReviewEvent SSE.
- `POST /api/reviews/{run_id}/resume`: 문서 입력 또는 skip.
- `POST /api/reviews/{run_id}/send`: 현재 report/message revision 승인과 발송 요청을 하나로 처리.
- `POST /api/reviews/{run_id}/complete`: 이번 업무 처리 완료 기록.
- 초안 수정·첨부·latest 조회 라우트는 S0 확정 계약이 요구하는 범위에서 조립한다.

최종 검토 중 내용을 수정하면 승인을 무효화한다. 리포트를 재생성할 때 메시지 revision도 갱신하여 이전 발송 결과가 새 리포트에 잘못 재사용되지 않게 한다. 자격·모집·업무·발송 상태는 분리한다.

## LLM과 미완성 의존성

요청 분류, 확인 질문, 대응안 작성에 검증 가능한 구조화 출력을 사용한다. 모델은 설정으로 지정하고 호출 시간 제한은 60초, 일시 오류 재시도는 최대 1회다. 근거 ID와 허용된 범주를 확인하며 알 수 없는 사업·개인 사실을 생성하지 않도록 입력과 출력을 제한한다.

키 또는 모델 설정이 없으면 미연결로 보고한다. 명시적인 테스트용 fake는 별도 설정으로 주입하며 실제 LLM 연결로 집계하지 않는다. S2·S5·S6 mock 상태도 응답과 실행 로그에 표시한다.

## 완료 증거

핵심 확인 1회로 자료 대기 → 서버/체크포인터 재연결 → 동일 run_id로 skip → 미확인 조건 보존 → 리포트 생성 → 담당자 검토 대기에 도달한다. 이벤트, 최종 상태, SQLite 경로 구분, 그래프 Mermaid, 사용 패키지 버전을 남긴다. 잘못된 interrupt와 승인 없는 발송 거절은 같은 확인 흐름에서 검증한다.

발송·완료 라우트는 dry_run 어댑터로 확인한다. 이 확인이 실제 LLM 연결, 외부 메시지 전달, 기관 신청 또는 전체 지도 UI 통합을 입증하지는 않는다. 실패한 구간만 수정 후 재확인한다.

## 구현 시 참고할 공식 문서

- [LangGraph interrupt와 재개](https://docs.langchain.com/oss/python/langgraph/interrupts): 동일 thread_id, 중단 노드 재실행, Command 기반 재개.
- [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence): 파일 기반 SQLite checkpointer와 메모리 저장소의 범위.

독립 검토에서 제기한 계약 기준 질문은 위 임시 어댑터 경계로 해소했다. 사용자의 미완성 의존성 fixture/mock 허용 범위에 맞추며, 이를 S0 확정 계약으로 표시하지 않는다.
