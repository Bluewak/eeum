import { AREA_DATA, PROGRAMS, FACILITIES } from './data.js';
import { NEEDS, assessIsolation, evaluateProgram } from './domain.js';

export const STARTERS = ['선택한 지역·격자 설명', '지원사업 찾아줘', '추가 상담 질문', '검토 메모 초안'];
const QUESTIONS = [
  ['familyContact', '비동거 가족·친지와 사적으로 교류하고 있나요?'],
  ['friendContact', '가족·친지 외에 사적으로 교류하는 사람이 있나요?'],
  ['economicSupport', '경제적으로 어려울 때 도움을 받을 사람이 있나요?'],
  ['dailySupport', '일상생활에 도움이 필요할 때 도와줄 사람이 있나요?'],
  ['emotionalSupport', '마음이 힘들 때 이야기하거나 도움을 받을 사람이 있나요?'],
];
const CHOICES = ['있음', '없음', '미확인'];
const answerValue = text => ({있음:'yes', 네:'yes', 예:'yes', 없어요:'no', 없음:'no', 아니요:'no', 미확인:'unknown', 모름:'unknown', 모르겠어요:'unknown'})[text.replace(/[.!?。]/g,'').trim()];
const needPatterns = {care:/돌봄|식사|병원|생활지원/,connection:/관계|친구|참여|모임|외로/,emotional:/정서|심리|마음/,housing:/주거|주택|생활 안정/,employment:/고용|소득|취업|일자리/,digital:/디지털|신청 도움/};
export function newChatSession(){return {pending:null,answers:{},asked:[],need:null};}
export function contextKey(c){return `${c.region}:${c.caseRecord?.id||c.cell?.id||'area'}`;}
export function contextLabel(c){return `${AREA_DATA.find(a=>a.id===c.region)?.name||''} · ${c.caseRecord?c.caseRecord.id+' 합성 사례':c.cell?c.cell.id:'지역 전체'}`;}
function ask(session){
  const q=QUESTIONS.find(([key])=>!session.asked.includes(key));
  if(q){session.pending=q[0];return {text:`상담 확인 ${session.asked.length+1} / 5\n${q[1]}\n\n당사자에게 확인한 응답을 선택하세요. 모르는 내용은 미확인으로 남깁니다.`,suggestions:CHOICES};}
  session.pending=null;
  const r=assessIsolation(session.answers);
  return {text:`5개 문항을 확인했습니다.\n응답 기반 정의: ${{met:'충족',not_met:'미충족',unknown:'추가 확인 필요'}[r.isolation]}\n\n이 결과는 임상 진단이나 지원 자격 확정이 아닙니다. 답변은 아직 사례에 저장되지 않았습니다.`,actions:[{type:'review-answers',label:'응답 검토 후 사례에 반영'}],suggestions:['지원사업 찾아줘','상담 질문 다시 시작']};
}
export function gridMemo(cell,region){
  return `${region} ${cell.id} · 250m 활동 격자\n2025년 7월 ${cell.july.toLocaleString('ko-KR',{maximumFractionDigits:2})} → 12월 ${cell.december.toLocaleString('ko-KR',{maximumFractionDigits:2})} (변화 ${cell.change===null?'비교 불가':cell.change.toFixed(1)+'%'})\n6개월 공통 원본 격자 ${cell.gridCount}개 집계. 실인원·거주자 수가 아니며 개인 고립을 뜻하지 않음.\n다음 행동 제안: 주변 시설 운영, 계절·통근·유입 변화 확인 후 지역 상담·홍보 필요성 검토.\n위치는 UTM-K / EPSG:5179 가정 변환으로 탐색용이며 방문 주소로 사용하지 않음.`;
}
export function answerChat(input,context,previous=newChatSession()){
  const session=structuredClone(previous),text=String(input).trim().slice(0,1200);
  const respond=result=>({...result,session});
  if(/그만|중단|취소/.test(text)){session.pending=null;return respond({text:'상담 질문을 중단했습니다. 다른 작업을 선택해 주세요.',suggestions:STARTERS});}
  if(session.pending&&answerValue(text)){
    session.answers[session.pending]=answerValue(text);session.asked.push(session.pending);
    return respond(ask(session));
  }
  if(/질문|문항/.test(text)&&/상담|추가|다음|다시/.test(text)){
    if(/다시/.test(text)){session.answers={};session.asked=[];}
    return respond(ask(session));
  }
  const region=/춘천/.test(text)?'chuncheon':/강남/.test(text)?'gangnam':context.region;
  const area=AREA_DATA.find(a=>a.id===region);
  const profile=context.caseRecord?.region===region?context.caseRecord:{region,age:null,needs:[],incomeAssessments:{}};
  if(/접수해|신청해|제출해|전송해|저장해/.test(text))return respond({text:'챗봇에서 기관 신청·접수나 사례 자동 저장은 할 수 없습니다. 담당자가 상담 정보와 공식 안내를 확인한 뒤 기존 업무 화면에서 처리해 주세요.',actions:context.caseRecord?[{type:'case',label:'선택 사례 검토'}]:[],suggestions:['지원사업 찾아줘']});
  if(/메모|초안/.test(text)){
    if(!context.cell)return respond({text:'지도에서 250m 활동 격자를 먼저 선택해 주세요. 선택한 격자의 관측치와 확인할 항목을 메모 초안으로 정리합니다.',suggestions:['선택한 지역·격자 설명']});
    return respond({text:gridMemo(context.cell,AREA_DATA.find(a=>a.id===context.cell.region).name),actions:[{type:'grid-memo',label:'검토 기록에 초안 넣기'}],sources:[{label:'대회 통신 원자료 · 2025.07–12 / 공통 격자 집계'}]});
  }
  if(/사업|돌봄|식사|병원|심리|소득|일자리|주거|모임|외로|고용|디지털|정서/.test(text)){
    session.pending=null;
    const need=Object.entries(needPatterns).find(([,re])=>re.test(text))?.[0]||null;
    session.need=need;
    const candidates=PROGRAMS.filter(p=>p.region===region||p.region==='all').filter(p=>!need||p.needs?.includes(need));
    const rows=candidates.map(p=>({p,r:evaluateProgram(profile,p,context.today)})).sort((a,b)=>Number(a.r.eligibility==='ineligible')-Number(b.r.eligibility==='ineligible')||Number(b.r.relevant)-Number(a.r.relevant));
    return respond({text:rows.length?`${area.name}${need?' · '+NEEDS[need]:''} 수록 사업 ${rows.length}개를 찾았습니다.\n${profile.id?profile.id+'의 저장된 상담 정보':'개인 조건 미확인 상태'}로 조건을 대조했습니다. 모집 여부와 최종 자격은 수행기관 확인이 필요합니다.`:`${area.name} 수록 자료에서 해당 지원 유형의 사업을 찾지 못했습니다. 등록된 사업 전체를 확인하거나 지역 지원기관에 문의하세요.`,programs:rows,suggestions:['돌봄 지원사업','정서 지원사업','지역 지원기관'],actions:[]});
  }
  if(/기관|시설|문의/.test(text))return respond({text:`${area.name} 수록 지원기관입니다. 방문 전 공식 안내에서 주소와 운영 현황을 확인하세요.`,sources:FACILITIES.filter(f=>f.region===region).map(f=>({label:f.name,url:f.sourceUrl})),suggestions:['지원사업 찾아줘']});
  if(/지역|격자|통계|설명|데이터|변화|감소|증가|왜/.test(text)){
    const cell=context.cell?.region===region?context.cell:null;
    return respond({text:cell?`${gridMemo(cell,area.name)}\n\n집계 데이터만으로 변화의 원인을 확정할 수 없습니다.`:`${area.name} · 2025년 하반기 지역 지표\n${area.metrics.map(m=>`${m.label}: ${m.value}${m.unit}\n${m.detail}`).join('\n\n')}\n\n지역 통계를 개인의 고립·실직 판정에 사용하지 않습니다.`,sources:cell?[{label:'대회 통신 flow_age_pop_202507–202512 · 연령·성별 합계'}]:area.sources.map(s=>({label:s.label,url:s.url})),actions:cell?[{type:'grid-memo',label:'현장 검토 초안 만들기'}]:[],suggestions:['검토 메모 초안','지원사업 찾아줘']});
  }
  if(/안녕|도움|사용법|할 수/.test(text))return respond({text:'지도의 선택 항목 설명, 수록 지원사업 검색, 5개 상담 문항 확인, 현장 검토 메모 작성을 도와드립니다. 데이터와 정해진 규칙으로 답하며 실시간 검색이나 생성형 AI 답변은 제공하지 않습니다.',suggestions:STARTERS});
  return respond({text:session.pending?'응답을 정확히 구분하지 못했습니다. 현재 문항에 대해 ‘있음’, ‘없음’, ‘미확인’ 중 하나를 선택해 주세요. 다른 작업을 하려면 ‘중단’을 입력하세요.':'질문의 의도를 확인하지 못했습니다. 수록 데이터와 정해진 상담 흐름 안에서 도와드릴 수 있어요. 아래에서 원하는 작업을 선택해 주세요.',suggestions:session.pending?[...CHOICES,'중단']:STARTERS});
}
