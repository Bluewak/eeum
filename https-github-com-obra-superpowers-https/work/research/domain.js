/**
 * 이음 지도 MVP — 응답 기반 분류·사업 조건 검토·업무 상태 전이.
 * 집계 활동 데이터나 인구학적 속성을 개인 고립 판정에 사용하지 않는다.
 * 규칙 평가 결과는 수급 승인이나 외부 기관의 실제 접수를 의미하지 않는다.
 */
export const NEEDS = Object.freeze({
  employment: '고용·소득',
  care: '일상생활·돌봄',
  connection: '관계 형성·사회참여',
  housing: '주거·생활 안정',
  emotional: '상담·정서',
  digital: '신청·디지털 이용',
});

export const STATUS = Object.freeze({
  new: '검토 대기',
  reviewing: '검토 중',
  preparing: '신청 준비',
  referred: '접수 확인',
  closed: '처리 완료',
});

const QUESTION_LABELS = Object.freeze({
  familyContact: '비동거 가족·친지와의 교류',
  friendContact: '그 밖의 사람과의 사적 교류',
  economicSupport: '경제적 도움을 받을 사람',
  dailySupport: '생활상 도움을 받을 사람',
  emotionalSupport: '정서적 도움을 받을 사람',
});
const RESPONSE_VALUES = new Set(['yes', 'no']);
const knownResponse = (value) => RESPONSE_VALUES.has(value) ? value : 'unknown';

// 부재는 해당하는 모든 응답이 no일 때만 확인한다. 하나라도 yes면 부재가 아니다.
function absence(values) {
  const answers = values.map(knownResponse);
  if (answers.includes('yes')) return 'present';
  return answers.every((value) => value === 'no') ? 'absent' : 'unknown';
}

export function assessIsolation(profile = {}) {
  const social = absence([profile.familyContact, profile.friendContact]);
  const support = absence([profile.economicSupport, profile.dailySupport, profile.emotionalSupport]);
  const isolation = social === 'present' || support === 'present'
    ? 'not_met'
    : social === 'absent' && support === 'absent' ? 'met' : 'unknown';
  return {
    social,
    support,
    isolation,
    missing: Object.entries(QUESTION_LABELS)
      .filter(([field]) => knownResponse(profile[field]) === 'unknown')
      .map(([, label]) => label),
    definitionVersion: 'contact-support-AND-v1.0',
  };
}

const ELIGIBILITY_LABELS = Object.freeze({
  matched: '확인한 조건에 부합',
  ineligible: '확인된 조건 불충족',
  missing: '추가 확인 필요',
  agency_review: '기관 심사 필요',
});
const OFFERING_LABELS = Object.freeze({
  open: '접수 확인',
  closed: '모집 종료',
  unknown: '현황 미확인',
  consultation: '상담·대기 접수 안내',
});
const EVIDENCE_LABELS = Object.freeze({
  current: '적용 자료 확인',
  stale: '오래된 자료 재확인 필요',
  unreviewed: '원문·규칙 검수 필요',
});

function validDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return null;
  const day = value.slice(0, 10);
  const parsed = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== day ? null : day;
}
function knownNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * incomeConfirmed는 자료 확보 여부이며 사업 자격 충족을 의미하지 않는다.
 * 소득 기준은 incomeAssessments[program.id]의 개별 검토 결과만 사용한다.
 * sourceYear/verifiedAt는 현재 운영 여부를 추측하기 위해 사용하지 않는다.
 */
export function evaluateProgram(profile = {}, program = {}, today = '2026-10-25') {
  const matched = [];
  const missing = [];
  const failed = [];
  const currentDay = validDay(today);
  const currentYear = currentDay ? Number(currentDay.slice(0, 4)) : null;
  const needs = Array.isArray(profile.needs) ? profile.needs : [];
  const programNeeds = Array.isArray(program.needs) ? program.needs : [];
  const relevant = programNeeds.some((need) => needs.includes(need));

  if (!profile.region) {
    if (program.region && program.region !== 'all') missing.push('거주 지역 확인');
  } else if (program.region && program.region !== 'all' && program.region !== profile.region) {
    failed.push('사업의 거주 지역 조건과 불일치');
  } else {
    matched.push(program.region === 'all' ? '전국 공통 사업' : '거주 지역 조건 확인');
  }

  const hasMinAge = knownNumber(program.minAge);
  const hasMaxAge = knownNumber(program.maxAge);
  if (hasMinAge || hasMaxAge) {
    if (!knownNumber(profile.age)) {
      missing.push('정확한 만 나이와 기준일 확인');
    } else if (hasMinAge && profile.age < program.minAge) {
      failed.push(`만 ${program.minAge}세 이상 연령 조건 불충족 (현재 ${profile.age}세)`);
    } else if (hasMaxAge && profile.age > program.maxAge) {
      failed.push(`만 ${program.maxAge}세 이하 연령 조건 불충족 (현재 ${profile.age}세)`);
    } else {
      matched.push(`연령 조건 확인 (${profile.age}세)`);
    }
  }

  if (program.incomeRequired) {
    // 서로 다른 사업의 소득 기준을 공통 플래그로 확정하지 않는다.
    const income = profile.incomeAssessments?.[program.id];
    if (income === 'yes') matched.push('해당 사업의 소득 조건 충족 확인');
    else if (income === 'no') failed.push('해당 사업의 소득 조건 미충족 확인');
    else missing.push('가구 소득·재산 및 해당 사업의 기준 확인');
  }
  if (program.jobSeekingRequired) {
    if (profile.jobSeeking === 'yes') matched.push('현재 구직 의사 확인');
    else if (profile.jobSeeking === 'no') failed.push('현재 구직자 조건 미충족');
    else missing.push('현재 구직 의사와 취업 가능 여부 확인');
  }

  if (!program.rulesApproved) missing.push('담당자의 공식 원문·자격 규칙 검수');
  if (!currentDay) missing.push('올바른 검토 기준일 확인');

  const verified = validDay(program.verifiedAt);
  const sourceYear = Number.isInteger(program.sourceYear) ? program.sourceYear : Number(program.sourceYear);
  const ageInDays = verified && currentDay
    ? (Date.parse(`${currentDay}T00:00:00Z`) - Date.parse(`${verified}T00:00:00Z`)) / 86400000 : Infinity;
  const evidence = !program.rulesApproved
    ? 'unreviewed'
    : !verified || !currentDay || ageInDays < 0 || ageInDays > 180 || (sourceYear > 0 && sourceYear < currentYear)
      ? 'stale' : 'current';
  if (program.rulesApproved && evidence === 'stale') missing.push('현행 적용 조건·공고 재확인');

  const offer = program.offering || {};
  const start = validDay(offer.start);
  const end = validDay(offer.end);
  const hasMalformedDate = (offer.start !== null && offer.start !== undefined && !start)
    || (offer.end !== null && offer.end !== undefined && !end);
  let offering = 'unknown';
  // 이미 명시된 종료, 또는 종료일 경과는 다른 축과 무관하게 유지한다.
  if (offer.type === 'closed' || (end && currentDay && end < currentDay)) offering = 'closed';
  // 미래 모집, 뒤집힌 날짜, 미검증/오래된 자료는 현재 접수로 표시하지 않는다.
  else if (currentDay && !hasMalformedDate && !(start && end && start > end) && !(start && currentDay < start) && evidence === 'current') {
    if (offer.type === 'open') offering = 'open';
    else if (offer.type === 'consultation') offering = 'consultation';
  }

  let eligibility = failed.length ? 'ineligible'
    : missing.length ? 'missing'
      : program.agencyReview ? 'agency_review' : 'matched';
  let nextAction = typeof program.nextAction === 'string' && program.nextAction.trim()
    ? program.nextAction : '공식 안내를 확인하고 수행기관에 상담하기';
  if (eligibility === 'ineligible') nextAction = '불충족 조건과 예외 조항을 확인하고 다른 사업 후보를 검토하세요.';
  else if (offering === 'closed') nextAction = '동일 사업의 추가 모집 또는 상담·대기 접수 여부를 수행기관에 확인하세요.';
  else if (missing.length) nextAction = `${missing[0]} 후 조건을 다시 검토하세요.`;
  else if (eligibility === 'agency_review') nextAction = '수행기관의 선정조사·심사를 위한 상담을 준비하세요.';
  return {
    eligibility,
    eligibilityLabel: ELIGIBILITY_LABELS[eligibility],
    offering,
    offeringLabel: OFFERING_LABELS[offering],
    evidence,
    evidenceLabel: EVIDENCE_LABELS[evidence],
    matched,
    missing,
    failed,
    nextAction,
    relevant,
  };
}

const TRANSITIONS = Object.freeze({
  new: ['reviewing'],
  reviewing: ['preparing'],
  preparing: ['reviewing', 'referred'],
  referred: ['preparing', 'closed'],
  closed: ['reviewing'],
});
export function allowedTransitions(current) {
  return [...(TRANSITIONS[current] || [])];
}
export function validateTransition(caseRecord, target, options = {}) {
  if (!caseRecord || !allowedTransitions(caseRecord.status).includes(target)) {
    return { ok: false, error: '현재 단계에서 선택한 처리 단계로 바로 이동할 수 없습니다.' };
  }
  if (typeof options.note !== 'string' || !options.note.trim()) {
    return { ok: false, error: '변경 사유와 다음 행동을 처리 메모에 남겨주세요.' };
  }
  if ((target === 'preparing' || target === 'referred') && !caseRecord.selectedProgramId) {
    return { ok: false, error: '먼저 연결할 지원사업을 선택해주세요.' };
  }
  if (target === 'referred' && options.consent !== true) {
    return { ok: false, error: '당사자의 신청·연계 동의를 확인해주세요.' };
  }
  if (target === 'referred' && (typeof options.receiptReference !== 'string' || !options.receiptReference.trim())) {
    return { ok: false, error: '실제 접수 확인번호 또는 기관 확인 내용을 기록해주세요. 이 화면은 신청서를 제출하지 않습니다.' };
  }
  return { ok: true, error: null };
}

/** 동 중심 부근의 합성 시연 좌표. 주민 주소·실제 상담 정보가 아니다. */
export function createDemoCases() {
  const base = {
    gender: '미확인', maritalStatus: '미확인', livingArrangement: '미확인',
    employmentStatus: '미확인', pastEmployment: '미확인', jobSeeking: 'unknown',
    familyContact: 'unknown', friendContact: 'unknown', economicSupport: 'unknown',
    dailySupport: 'unknown', emotionalSupport: 'unknown', incomeConfirmed: 'unknown',
    assignee: '미배정', dueDate: '2026-10-27', selectedProgramId: null,
    consent: false, urgent: false, createdAt: '2026-10-25T09:00:00+09:00',
    synthetic: true, locationPrecision: '동 중심 부근 합성 좌표',
  };
  const rows = [
    { id:'GN-001', alias:'김○○', region:'gangnam', dong:'역삼1동', lat:37.5006, lng:127.0355, age:63, gender:'남성', maritalStatus:'이혼', livingArrangement:'혼자 거주', employmentStatus:'현재 근로 없음', pastEmployment:'일용근로', jobSeeking:'yes', familyContact:'no', friendContact:'no', economicSupport:'no', dailySupport:'no', emotionalSupport:'no', needs:['employment','connection'], status:'new', urgent:true, dueDate:'2026-10-26', summary:'최근 근로가 없으며 재취업과 정기적인 모임 참여를 희망합니다. 본인이 빠른 상담을 요청했습니다.' },
    { id:'GN-002', alias:'이○○', region:'gangnam', dong:'논현2동', lat:37.5161, lng:127.0375, age:71, gender:'여성', maritalStatus:'사별', livingArrangement:'혼자 거주', employmentStatus:'은퇴', familyContact:'yes', friendContact:'no', economicSupport:'unknown', dailySupport:'no', emotionalSupport:'yes', needs:['care','digital'], status:'reviewing', assignee:'박지민', summary:'가족과 연락은 유지하지만 장보기와 온라인 신청에 도움을 원합니다. 현재 이용 중인 돌봄서비스 확인이 필요합니다.' },
    { id:'GN-003', alias:'박○○', region:'gangnam', dong:'대치2동', lat:37.5028, lng:127.0644, age:45, gender:'남성', maritalStatus:'기혼', livingArrangement:'혼자 거주', employmentStatus:'취업', jobSeeking:'no', familyContact:'yes', friendContact:'unknown', economicSupport:'yes', dailySupport:'unknown', emotionalSupport:'unknown', needs:['connection','emotional'], status:'new', summary:'가족과 별도로 거주하고 있습니다. 퇴근 후 참여할 수 있는 모임과 상담 정보를 희망합니다.' },
    { id:'GN-004', alias:'최○○', region:'gangnam', dong:'개포2동', lat:37.4893, lng:127.0672, age:64, gender:'여성', maritalStatus:'기혼', livingArrangement:'가족과 거주', employmentStatus:'현재 근로 없음', familyContact:'yes', friendContact:'yes', economicSupport:'yes', dailySupport:'no', emotionalSupport:'yes', needs:['care'], status:'reviewing', assignee:'박지민', summary:'동거 가족이 근무 중에는 돌봄을 제공하기 어렵다고 응답했습니다. 일상생활 지원 범위를 상담할 예정입니다.' },
    { id:'GN-005', alias:'정○○', region:'gangnam', dong:'일원1동', lat:37.4906, lng:127.0875, age:68, gender:'남성', maritalStatus:'기혼', livingArrangement:'배우자와 거주', employmentStatus:'취업', pastEmployment:'퇴직 후 재취업', jobSeeking:'no', familyContact:'yes', friendContact:'yes', economicSupport:'yes', dailySupport:'yes', emotionalSupport:'yes', needs:['digital'], status:'new', summary:'퇴직 후 다시 근무하고 있습니다. 본인에게 필요한 복지 정보 검색과 디지털 신청 방법을 알고 싶어 합니다.' },
    { id:'GN-006', alias:'윤○○', region:'gangnam', dong:'수서동', lat:37.4889, lng:127.1048, age:39, gender:'여성', maritalStatus:'미혼', livingArrangement:'혼자 거주', employmentStatus:'현재 근로 없음', jobSeeking:'yes', familyContact:'unknown', friendContact:'yes', economicSupport:'no', dailySupport:'unknown', emotionalSupport:'yes', needs:['employment','housing'], status:'new', urgent:true, dueDate:'2026-10-26', summary:'생계와 주거비 관련 상담을 빠르게 요청했습니다. 소득 질문은 아직 답하지 않았으며 사업별 확인이 필요합니다.' },
    { id:'CC-001', alias:'장○○', region:'chuncheon', dong:'효자2동', lat:37.8712, lng:127.7408, age:63, gender:'남성', maritalStatus:'이혼', livingArrangement:'혼자 거주', employmentStatus:'현재 근로 없음', pastEmployment:'일용근로', jobSeeking:'yes', familyContact:'no', friendContact:'no', economicSupport:'no', dailySupport:'no', emotionalSupport:'no', needs:['employment','connection'], status:'new', urgent:true, dueDate:'2026-10-26', summary:'최근 몇 달간 일을 쉬고 있으며 재취업과 관계망 지원 상담을 희망합니다. 현재 구직 의사를 확인했습니다.' },
    { id:'CC-002', alias:'한○○', region:'chuncheon', dong:'퇴계동', lat:37.8562, lng:127.7285, age:65, gender:'여성', maritalStatus:'사별', livingArrangement:'혼자 거주', employmentStatus:'은퇴', familyContact:'yes', friendContact:'no', economicSupport:'unknown', dailySupport:'no', emotionalSupport:'yes', needs:['care','connection'], status:'reviewing', assignee:'이서연', summary:'전화로 가족과 연락하고 있습니다. 일상 돌봄과 가까운 활동 프로그램을 희망하며 중복 서비스 이용 여부 확인이 남아 있습니다.' },
    { id:'CC-003', alias:'조○○', region:'chuncheon', dong:'석사동', lat:37.8567, lng:127.7492, age:52, gender:'남성', maritalStatus:'기혼', livingArrangement:'가족과 거주', employmentStatus:'휴직', familyContact:'yes', friendContact:'unknown', economicSupport:'yes', dailySupport:'no', emotionalSupport:'unknown', needs:['care','emotional'], status:'reviewing', assignee:'이서연', summary:'함께 사는 가족의 일정상 돌봄을 받기 어렵다고 답했습니다. 생활 지원과 정서 상담을 함께 검토합니다.' },
    { id:'CC-004', alias:'임○○', region:'chuncheon', dong:'후평2동', lat:37.8858, lng:127.7538, age:29, gender:'여성', maritalStatus:'미혼', livingArrangement:'혼자 거주', employmentStatus:'취업', familyContact:'unknown', friendContact:'no', economicSupport:'unknown', dailySupport:'unknown', emotionalSupport:'no', needs:['connection','emotional'], status:'new', summary:'최근 전입해 지역 활동에 참여하고 싶어 합니다. 비동거 가족과의 교류 및 생활 지원망은 아직 확인하지 않았습니다.' },
    { id:'CC-005', alias:'오○○', region:'chuncheon', dong:'약사명동', lat:37.8746, lng:127.7222, age:76, gender:'남성', maritalStatus:'사별', livingArrangement:'혼자 거주', employmentStatus:'은퇴', familyContact:'no', friendContact:'yes', economicSupport:'no', dailySupport:'no', emotionalSupport:'yes', needs:['care','digital'], status:'reviewing', assignee:'이서연', summary:'이웃과의 교류는 유지하고 있습니다. 생활 돌봄 상담과 신청 서류 준비에 도움을 요청했습니다.' },
    { id:'CC-006', alias:'서○○', region:'chuncheon', dong:'신사우동', lat:37.9067, lng:127.7262, age:null, gender:'미확인', maritalStatus:'미확인', livingArrangement:'미확인', employmentStatus:'미확인', needs:['housing'], status:'new', summary:'주거 지원 정보를 문의한 초기 사례입니다. 정확한 나이와 생활 상황을 추가 확인해야 합니다.' },
  ];
  return rows.map((row) => ({ ...base, ...row, needs: [...row.needs], notes: [], history: [] }));
}
