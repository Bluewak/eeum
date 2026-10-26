# 이음 S1 — 레퍼런스 분석 및 구현 인계

확인일: 2026-10-25 (Asia/Seoul). 문서와 소스를 읽어 도출한 설계 제안이다. 제품 구현·실제 LLM 연결·발송·통합 실행 완료를 의미하지 않는다.

## 1. 결정과 조사 범위

- 적용할 핵심 패턴 3개: ① 영속 interrupt/resume ② 대기 상태 기반 검토·수정 UI ③ 승인 버전 고정 및 멱등 발송.
- 업무 상태의 단일 실행 주체는 LangGraph다. n8n은 노드 역할 분류만 참고한다.
- 신규 런타임 의존성 제안은 `langgraph`, `langgraph-checkpoint-sqlite` 두 직접 패키지 이내다. 전이 의존성은 별도이며 설치 버전은 S3가 호환 조합을 확정한다. S1에서는 패키지를 설치하지 않았다.
- 주요 레퍼런스는 LangGraph, Agent Inbox, n8n, Jev, Graphify의 5개다. Pyright는 요구된 구조 탐색 도구의 보조 소스 확인으로 한정했다. 추가 레퍼런스로 범위를 확장하지 않았다.
- 조사용 저장소는 work/research에만 받았다. 타사 코드를 제품에 복사하지 않았다.

## 2. 기존 앱에서 확인한 연결 지점

[Drive 프로젝트 폴더](https://drive.google.com/drive/folders/1ZteOwzLlr2siFFMuVa1emQMF_YHL1kte)의 루트, dist와 docs 직계 목록을 조회했다. 조회 목록에는 contracts가 없었다. S0가 확정한 스키마는 받지 못했으므로 아래 JSON은 공통 프롬프트 계약을 기반으로 한 예시이며 확정 계약으로 취급하지 않는다.

| 실제 확인 파일 | 확인한 동작 | 구현 인계 |
|---|---|---|
| [dist/domain.js](https://drive.google.com/file/d/1REJ37EuPYSdMnmXjEybVjPuKD8GyH9jh/view) | `createDemoCases()`의 GN-001은 63세, gangnam, needs=[employment,connection], synthetic=true. `evaluateProgram()`은 eligibility/offering/evidence와 matched/missing/failed를 구분한다. | S2: 요청 배열 유지. 집계 결과를 조건별 pass/fail/unknown으로 분해할 때 근거를 붙인다. matched를 최종 선정으로 변환하지 않는다. |
| 같은 파일 | `validateTransition()`은 referred 전환에 consent와 receiptReference를 요구한다. | S6: 메시지 발송 성공을 referred로 자동 변환하지 않는다. 완료와 접수는 별개다. |
| [dist/chat.js](https://drive.google.com/file/d/1GN-7OYOnHMIer-ScazTyW10KZQQUXLaj/view) | `answerChat()`에서 `Object.entries(needPatterns).find(...)`로 단일 need를 고른다. `newChatSession()`도 need 단일 필드를 가진다. | S2/S3: 새 검토 실행에서는 Need[]로 모든 요청을 전달한다. 기존 채팅 함수만 재사용하면 다중 요청이 손실될 수 있다. |
| [dist/storage.js](https://drive.google.com/file/d/1XBEDUaXxsz0J0UZoD1umtyOWJnBqrJXh/view) | `createStore()`가 UUID revision으로 오래된 스냅샷을 감지한다. 주석에 localStorage의 탭 간 원자적 CAS가 없다고 명시한다. | S4: revision을 서버 입력에 연결하되 사례별 revision과 저장소 revision의 매핑은 S0 확정 필요. S6의 승인·멱등성은 서버 DB에서 보장한다. |

파일 본문을 읽고 판단했다. app.js/chat-ui.js 전체 호출 흐름과 서버 API는 실행 검증하지 않았다. 대용량 grid-data.js는 이 조사에 불필요하여 본문을 읽지 않았다.

## 3. 레퍼런스와 소스 근거

### R1. LangGraph — 영속 대기·재개와 이벤트

- 공식: https://github.com/langchain-ai/langgraph
- 확인 commit: `7bf29e9798f0727b7eab72bd9a138194207fd144` (조사 시 HEAD 스냅샷, 배포 버전 지정 아님).
- 소스: [types.py](https://github.com/langchain-ai/langgraph/blob/7bf29e9798f0727b7eab72bd9a138194207fd144/libs/langgraph/langgraph/types.py)의 `interrupt()`, `Command`; [SQLite saver](https://github.com/langchain-ai/langgraph/blob/7bf29e9798f0727b7eab72bd9a138194207fd144/libs/checkpoint-sqlite/langgraph/checkpoint/sqlite/__init__.py)의 `SqliteSaver.get_tuple()/put()/put_writes()`.
- 확인: interrupt는 저장된 resume 값을 반환하거나 GraphInterrupt를 발생시킨다. SQLite put은 thread_id/checkpoint_ns/checkpoint_id를 키로 상태를 저장한다.
- 도입: 같은 run_id/thread_id로 재개하고 DB 파일은 영속 경로에 둔다. request_documents 전용 노드와 human_review 노드를 분리한다. interrupt 이전에 발송을 두지 않는다. 재실행 때 요청 횟수를 중복 증가시키지 않도록 요청 준비 노드가 rounds=1을 저장하고 대기 노드는 저장된 묶음만 표시한다.
- 이벤트: node update를 서버의 ReviewEvent로 변환한다. 시작 이벤트가 필요하면 실제 실행 시점에 따로 기록한다. SSE 재접속은 저장한 sequence 이후부터 재생한다. updates만으로 시작 시각을 만들지 않는다. LLM 토큰·내부 추론은 업무 이벤트로 노출하지 않는다.
- 라이선스: [MIT](https://github.com/langchain-ai/langgraph/blob/7bf29e9798f0727b7eab72bd9a138194207fd144/LICENSE). 코드 복사 시 저작권/허가문 유지.
- 제외: LangGraph Platform, 클라우드 배포, 다중 DB, 새로운 프런트 SDK. 초기 단일 서버에 불필요하다.

### R2. Agent Inbox — 검토 가능한 작업과 행동

- 공식: https://github.com/langchain-ai/agent-inbox
- 확인 commit: `f1616f3e7998e7e4fd574545b9558554d88d9c49`.
- 소스: `src/components/agent-inbox/types.ts`의 `HumanInterruptConfig`, `HumanInterrupt`, `HumanResponse`; `hooks/use-interrupted-actions.tsx`의 `useInterruptedActions()/handleSubmit()`; `contexts/ThreadContext.tsx`의 `sendHumanResponse()`.
- [소스 디렉터리](https://github.com/langchain-ai/agent-inbox/tree/f1616f3e7998e7e4fd574545b9558554d88d9c49/src/components/agent-inbox).
- 확인: 허용 행동을 config로 제한하고, 편집/응답/수락을 구분한다. sendHumanResponse는 동일 thread에 command.resume을 전달한다. 제출 후 서버 thread를 다시 읽는다.
- 도입: 대기 종류와 허용 행동을 서버에서 내려주고 UI는 그 행동만 표시한다. 자료 대기는 입력·건너뛰기, 최종 검토는 수정·보내기, 발송 후에는 완료를 제공한다.
- 주의: Inbox의 ignore는 우리 서비스의 skip과 동일하지 않다. skip은 분석을 계속해야 한다. 해당 hook의 ignore 허용 fallback과 조기 성공 토스트는 그대로 가져오지 않는다. 서버 응답으로 성공을 확정한다.
- 라이선스: [MIT](https://github.com/langchain-ai/agent-inbox/blob/f1616f3e7998e7e4fd574545b9558554d88d9c49/LICENSE). 복사 시 고지 유지.
- 제외: Next.js/React 앱 전체 이식, 배포 설정 UI, 이메일 전용 ThreadValues. 기존 정적 JavaScript 화면에 상호작용만 재구현한다.

### R3. n8n — 노드 역할 분류

- 공식: https://github.com/n8n-io/n8n
- 확인 commit: `cfbd9a56cba2e73901dc1962e47727adbea0b23e`.
- 읽은 소스: [Wait.node.ts](https://github.com/n8n-io/n8n/blob/cfbd9a56cba2e73901dc1962e47727adbea0b23e/packages/nodes-base/nodes/Wait/Wait.node.ts)의 `execute()/configureAndPutToWait()/putToWait()`와 [IfV2.node.ts](https://github.com/n8n-io/n8n/blob/cfbd9a56cba2e73901dc1962e47727adbea0b23e/packages/nodes-base/nodes/If/V2/IfV2.node.ts)의 `execute()`.
- 확인: Wait는 실행 대기 저장을 호출하며 대기 종류에 따라 resume 요청 허용을 구분한다. IfV2는 조건 평가로 true/false 출력을 나눈다.
- 적용할 역할 분류(이음 설계상의 대응): trigger=검토 API, action=검색/리포트, condition=조건 분기, wait=자료 interrupt, approval=human_review, notification=dispatch. 여섯 역할 모두의 n8n 구현을 분석했다는 뜻은 아니다.
- 라이선스: [Sustainable Use License 1.0 및 예외](https://github.com/n8n-io/n8n/blob/cfbd9a56cba2e73901dc1962e47727adbea0b23e/LICENSE.md). 일반적인 MIT/Apache 오픈소스로 분류하지 않는다. 내부 업무/비상업·개인 사용 및 배포 제한이 있고 .ee 파일은 별도 Enterprise 범위다.
- 제외: 소스 복사, n8n 런타임/워크플로 엔진 도입. 동일 업무 상태를 이중으로 관리하지 않는다.

### R4. Jev / TypeSafe — 개별 판단의 구조화

- 공식: https://docs.typesafe.ai/introduction
- 확인 기준: 2026-10-25 공개 문서. 소스 commit/공개 모델 버전/재사용 가능한 모델 라이선스는 확인하지 못했다. 사용자가 말한 Jev가 이 제품이라는 동일성도 확정되지 않았다.
- 문서에서 확인한 범위: Choice는 허용 목록 선택, Score는 rubric 기반 평가를 반환하며 복합 판단을 개별 질문으로 나누는 방식을 안내한다. 소스 파일·함수 분석은 수행하지 못했으므로 공개 코드 분석 결과로 보고하지 않는다.
- 적용: 상담에서 employment 필요 여부와 connection 필요 여부를 독립적으로 분류한다. 전체 상담을 하나의 배타적 Choice로만 분류하지 않는다. 허용 category 목록과 evidence_ids를 검증하고 unknown을 보존한다.
- 제외: Jev SDK/API 필수 의존성, 근거 없는 위험 점수·선정 확률, 공급자 confidence를 자격 판정으로 사용하는 방식. 현재 LLM의 구조화 출력으로 패턴만 적용한다.

### R5. Graphify — 필요할 때 구조 탐색

- 공식: https://github.com/Graphify-Labs/graphify
- 확인 commit: `92741d162b2094ffc2fed58cfbd8ee823e9da62c`.
- 읽은 소스: [graphify/cli.py](https://github.com/Graphify-Labs/graphify/blob/92741d162b2094ffc2fed58cfbd8ee823e9da62c/graphify/cli.py)의 `_stale_graph_sources()`, `_prune_graph_json_sources()` 등 소스 변경과 그래프 갱신 관련 구현. 전체 파서·호출 그래프 정확성은 검증하지 않았다.
- 라이선스: 읽은 [LICENSE](https://github.com/Graphify-Labs/graphify/blob/92741d162b2094ffc2fed58cfbd8ee823e9da62c/LICENSE)는 Apache-2.0. LICENSE-MIT 파일도 tree에 존재하므로 파일별 적용 범위를 일괄 단정하지 않는다. 실제 배포·복사 전에 해당 패키지의 고지 범위를 확인한다. 이 작업에서는 도구를 설치하거나 코드를 복사하지 않았다.
- 적용/제외: 여러 모듈의 의존 관계가 불명확해질 때 개발 도구로 검토한다. 제품 런타임 의존성으로 넣지 않으며 정적 그래프를 실제 동작 증거로 사용하지 않는다.

보조 도구 Pyright: https://github.com/microsoft/pyright, commit `5e11909c674129533b67b11747b6dbd03c748ec3`. `packages/pyright-internal/src/languageServerBase.ts`의 `onDefinition()/onReferences()/onHover()` 등록 및 핸들러를 확인했다. [MIT LICENSE](https://github.com/microsoft/pyright/blob/5e11909c674129533b67b11747b6dbd03c748ec3/LICENSE.txt). Python 백엔드의 정의/참조/타입 탐색에만 사용한다. JavaScript 앱 전체 흐름이나 LangGraph 실행 완료를 증명하지 않는다. 이 조사에서 실제 language server를 실행하지 않았다.

## 4. 핵심 패턴 3개와 세션별 입출력

아래 ID와 revision은 연결 설명용 합성 값이다. 실제 사업·문서·리포트 URL은 만들어 넣지 않았다.

### 패턴 1 → S3: 저장된 요청 1회 대기와 동일 thread 재개

연결: POST `/api/reviews/{run_id}/resume` → 서버가 run 소유권/대기 interrupt 일치/허용 action을 확인 → `Command(resume={interrupt_id: payload})`와 동일 configurable.thread_id로 실행. 한 개 interrupt에서도 명시적으로 ID를 매칭한다. 정확한 호출 형식은 고정한 LangGraph 버전에서 확인한다.

입력:
```json
{"run_id":"demo-GN-001-01","interrupt_id":"demo-doc-01","action":"skip","answers":{},"attachment_refs":[]}
```
출력 예시(일부 상태):
```json
{"workflow_status":"awaiting_human_review","document_request_rounds":1,"needs":[{"id":"n1","category":"employment","description":"재취업 지원","evidence_ids":["e-consult"]},{"id":"n2","category":"connection","description":"정기 모임 참여","evidence_ids":["e-consult"]}],"unresolved_items":["확인되지 않은 사업별 조건은 unknown 유지"]}
```
자료 요청이 필요 없으면 interrupt를 생략한다. skip 이후 reevaluate는 수행하되 자료 요청 노드로 돌아가는 간선을 두지 않는다. human_review와 최종 완료 대기는 자료 요청 횟수에 포함하지 않는다.

### 패턴 2 → S4: 상태에서 복원되는 최소 검토 화면

연결: GET review 상태와 SSE ReviewEvent → 기존 지도 선택 사례의 run_id에 묶인 패널 → 자료 입력/skip 또는 결과 수정/보내기. 서버 상태가 기준이며 다른 사례의 이벤트를 섞지 않는다. 문서 수정은 S0가 확정할 저장 API로 전달하고 revision을 갱신한다.

입력(상태 응답 예시, 아래 allowed_actions와 waiting은 S0 추가 제안):
```json
{"run_id":"demo-GN-001-01","workflow_status":"awaiting_documents","waiting":{"interrupt_id":"demo-doc-01","kind":"documents"},"allowed_actions":["submit","skip"],"document_requests":[]}
```
출력(사용자 건너뛰기 요청):
```json
{"interrupt_id":"demo-doc-01","action":"skip","answers":{},"attachment_refs":[]}
```
위 빈 document_requests는 렌더링 형식만 보인 예시다. 실제로 빈 목록이면 자료 대기로 보내지 않고 다음 단계로 진행한다. 자료 요청 항목은 S2가 반환한 실제 요구사항만 표시한다. 버튼은 처리 중 비활성화하고 응답 실패 시 재시도 가능한 상태를 표시한다. human_review에서는 별도 승인 버튼 없이 보내기를 사용한다.

### 패턴 3 → S6: 승인된 내용 고정 + 멱등 발송

연결: POST `/send` → 현재 report/message revision 및 수신자/채널 검증 → 승인 스냅샷과 발송 레코드를 서버 DB에 기록 → 별도 dispatch 노드/어댑터 → 결과 저장. LangGraph 체크포인트만으로 외부 발송의 exactly-once가 보장되지 않는다.

입력:
```json
{"report_revision":"r1","message_revision":"m2","recipient_ref":"demo-recipient","channel":"demo","idempotency_key":"demo-GN-001-01:m2:demo-recipient:demo"}
```
출력(dry_run 예시):
```json
{"id":"demo-delivery-01","status":"dry_run","provider_message_id":null,"idempotency_key":"demo-GN-001-01:m2:demo-recipient:demo","error":null}
```
- 키에 DB UNIQUE 제약을 두고 병렬 요청도 한 번만 예약한다. 같은 키+같은 payload는 기존 결과를 반환한다. 같은 키+다른 payload는 충돌로 거부한다.
- payload fingerprint에는 report_revision, message_revision, recipient_ref, channel 및 실제 발송 본문/링크 스냅샷을 포함한다. report만 바뀌어도 이전 키를 새 내용으로 재사용하지 않는다. 승인 후 편집은 승인 무효화 및 새 message revision 발행으로 연결할 것을 S0에 제안한다.
- 승인 전/버전 불일치에는 발송하지 않는다. provider가 멱등키를 지원하면 함께 전달한다. provider 성공 뒤 로컬 저장 전 장애에는 중복 위험이 남으므로 provider 조회/대조가 필요하다.
- 타임아웃은 unknown으로 남기고 자동 재발송하지 않는다. pending/unknown을 성공으로 바꾸지 않는다. dry_run을 실제 성공으로 표시하지 않는다.
- 발송 없이도 담당자가 종료할 수 있는지, 실패/unknown 이후 완료의 disposition은 S0가 확정해야 한다. complete는 기관 접수·지원 해결 상태를 변경하지 않는다.

## 5. S0에 전달할 최소 계약 보완

1. workflow_status, waiting.kind/interrupt_id, allowed_actions의 열거값과 상태 복원 형식.
2. 사례 revision과 localStorage 전체 revision의 매핑 및 서버의 충돌 거부 정책.
3. condition별 evidence_ids/rule_version과 offering/evidence 상태의 별도 필드.
4. dry_run/pending/unknown/failed/sent 등 DeliveryResult.status 허용값. 위 예시의 dry_run은 제안값이다.
5. 수정 저장 API, 승인한 report+message revision 쌍, idempotency payload 충돌, 완료 disposition.

## 6. 검증 및 진행 보고

- 수행: Drive 기존 소스 3개 본문 확인, 공식 저장소 commit/선정 함수/라이선스 확인, 문서 UTF-8 및 JSON 예시 구문 확인.
- 미수행: 제품 구현, LangGraph 실행, LLM 호출, Graphify/Pyright 구동, 메시지 발송, GN-001 E2E. S1의 산출물은 구현 인계용 분석이다.
- 후속 핵심 확인 1회: S3/S4/S6가 연결된 뒤 GN-001의 두 요청 유지 → 자료 skip → unknown 유지 리포트 → 검토 → dry_run → 완료를 수행한다. 통과한 구간은 반복하지 않는다.

```text
session_id: S1
milestone: M0_reference_handoff
status: ready
changed_files: docs/references.md
contract_version: 1.0 proposal; S0 확정본 미수신
input_fixture: 실제 코드의 합성 GN-001 구조; 연결 JSON은 설명용 합성 값
output_example: 위 S3/S4/S6 입출력 3쌍
one_run_result: source_review 완료; 제품 runtime 미실행
blocker: S0 확정 계약 및 실행 가능한 프로젝트 checkout 미수신
next_handoff: S0 계약 보완; S3 대기/재개; S4 상태 기반 UI; S6 승인/멱등 발송
```