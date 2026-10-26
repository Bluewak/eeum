// Bundled snapshot from existing analysis and official-source collections.
// Source page dates, collection dates, policy validity, and offering verification are separate.
export const AREA_DATA = [
  {
    "id": "gangnam",
    "name": "강남구",
    "center": [
      37.5031,
      127.0589
    ],
    "zoom": 13,
    "metrics": [
      {
        "label": "1인세대 비율",
        "value": 39.8,
        "unit": "%",
        "detail": "2025.12 주민등록 97,519세대 / 전체 245,264세대. 통계청 1인가구와 정의가 다름."
      },
      {
        "label": "65세 이상 주민 비중",
        "value": 17.1,
        "unit": "%",
        "detail": "2025.12 주민등록 95,349명 / 전체 556,330명."
      },
      {
        "label": "12월 통신 활동 변화",
        "value": -1.9,
        "unit": "%",
        "detail": "2025.11 대비 12월, 6개월 공통 관측 격자 15,178개에서 연령·성별 통신 유동인구 수치 합을 비교. 실인원·거주자 수가 아님."
      },
      {
        "label": "12월 카드 이용 변화",
        "value": -0.2,
        "unit": "%",
        "detail": "2025.11 대비 12월, 지역 가맹점 카드 이용 건수를 월 일수로 나눈 일평균 비교. 전체 거주지 이용자 포함."
      }
    ],
    "monthly": [
      {
        "month": "2025-07",
        "activity": 100.0,
        "consumption": 100.0
      },
      {
        "month": "2025-08",
        "activity": 95.24,
        "consumption": 97.44
      },
      {
        "month": "2025-09",
        "activity": 100.74,
        "consumption": 101.14
      },
      {
        "month": "2025-10",
        "activity": 94.54,
        "consumption": 95.3
      },
      {
        "month": "2025-11",
        "activity": 98.87,
        "consumption": 99.26
      },
      {
        "month": "2025-12",
        "activity": 97.03,
        "consumption": 99.1
      }
    ],
    "sourceNote": "2025.07~12 대회 통신·카드 집계 및 행정안전부 주민등록 통계. 월별 추이는 각 지역 2025.07=100. 개인 고립 여부나 주민의 이동을 판정하지 않습니다.",
    "evidence": [
      {
        "label": "통신 관측 범위",
        "value": "15,178개 공통 격자",
        "note": "BLOCK_CD + X_COORD + Y_COORD가 6개월 모두 존재하는 격자. 연령·성별 값을 합산; 통신사의 전수 인구가 아님."
      },
      {
        "label": "통신 활동지수",
        "value": "97.0",
        "note": "2025.12 / 2025.07 × 100. 계절·휴일·유입 인구 영향이 포함된 기술 통계."
      },
      {
        "label": "카드 이용지수",
        "value": "99.1",
        "note": "가맹점 소재지 기준 일평균 이용 건수의 2025.07=100 지수. 개인별 소비·실직을 추정하지 않음."
      },
      {
        "label": "65세 이상 1인세대",
        "value": "18,952세대",
        "note": "2025.12 주민등록 기준. 독거·고립 또는 돌봄 필요가 자동 확정되는 수치가 아님."
      }
    ],
    "sources": [
      {
        "label": "통신·카드 지역 월별 집계",
        "file": "analysis/monthly_combined_summary.csv"
      },
      {
        "label": "주민등록 인구통계",
        "url": "https://jumin.mois.go.kr/ageStatMonth.do",
        "file": "public_data_2025h2/processed/population/population_households_monthly_sigungu.csv"
      }
    ],
    "unitNote": "시·군·구 집계. 지도의 합성 사례 및 시설 위치와 통계적으로 결합하지 않음.",
    "centerNote": "지역 탐색용 지도 중심점이며 개인·시설·행정기관 주소가 아님."
  },
  {
    "id": "chuncheon",
    "name": "춘천시",
    "center": [
      37.8784,
      127.7336
    ],
    "zoom": 13,
    "metrics": [
      {
        "label": "1인세대 비율",
        "value": 43.5,
        "unit": "%",
        "detail": "2025.12 주민등록 60,122세대 / 전체 138,329세대. 통계청 1인가구와 정의가 다름."
      },
      {
        "label": "65세 이상 주민 비중",
        "value": 22.6,
        "unit": "%",
        "detail": "2025.12 주민등록 64,332명 / 전체 285,234명."
      },
      {
        "label": "12월 통신 활동 변화",
        "value": -4.6,
        "unit": "%",
        "detail": "2025.11 대비 12월, 6개월 공통 관측 격자 72,272개에서 연령·성별 통신 유동인구 수치 합을 비교. 실인원·거주자 수가 아님."
      },
      {
        "label": "12월 카드 이용 변화",
        "value": -6.6,
        "unit": "%",
        "detail": "2025.11 대비 12월, 지역 가맹점 카드 이용 건수를 월 일수로 나눈 일평균 비교. 전체 거주지 이용자 포함."
      }
    ],
    "monthly": [
      {
        "month": "2025-07",
        "activity": 100.0,
        "consumption": 100.0
      },
      {
        "month": "2025-08",
        "activity": 103.49,
        "consumption": 102.43
      },
      {
        "month": "2025-09",
        "activity": 108.73,
        "consumption": 106.22
      },
      {
        "month": "2025-10",
        "activity": 104.93,
        "consumption": 106.76
      },
      {
        "month": "2025-11",
        "activity": 102.86,
        "consumption": 103.61
      },
      {
        "month": "2025-12",
        "activity": 98.13,
        "consumption": 96.8
      }
    ],
    "sourceNote": "2025.07~12 대회 통신·카드 집계 및 행정안전부 주민등록 통계. 월별 추이는 각 지역 2025.07=100. 개인 고립 여부나 주민의 이동을 판정하지 않습니다.",
    "evidence": [
      {
        "label": "통신 관측 범위",
        "value": "72,272개 공통 격자",
        "note": "BLOCK_CD + X_COORD + Y_COORD가 6개월 모두 존재하는 격자. 연령·성별 값을 합산; 통신사의 전수 인구가 아님."
      },
      {
        "label": "통신 활동지수",
        "value": "98.1",
        "note": "2025.12 / 2025.07 × 100. 계절·휴일·유입 인구 영향이 포함된 기술 통계."
      },
      {
        "label": "카드 이용지수",
        "value": "96.8",
        "note": "가맹점 소재지 기준 일평균 이용 건수의 2025.07=100 지수. 개인별 소비·실직을 추정하지 않음."
      },
      {
        "label": "65세 이상 1인세대",
        "value": "19,178세대",
        "note": "2025.12 주민등록 기준. 독거·고립 또는 돌봄 필요가 자동 확정되는 수치가 아님."
      }
    ],
    "sources": [
      {
        "label": "통신·카드 지역 월별 집계",
        "file": "analysis/monthly_combined_summary.csv"
      },
      {
        "label": "주민등록 인구통계",
        "url": "https://jumin.mois.go.kr/ageStatMonth.do",
        "file": "public_data_2025h2/processed/population/population_households_monthly_sigungu.csv"
      }
    ],
    "unitNote": "시·군·구 집계. 지도의 합성 사례 및 시설 위치와 통계적으로 결합하지 않음.",
    "centerNote": "지역 탐색용 지도 중심점이며 개인·시설·행정기관 주소가 아님."
  }
];

export const PROGRAMS = [
  {
    "id": "cc-emergency-safety",
    "name": "독거노인·장애인 응급안전안심서비스",
    "region": "chuncheon",
    "needs": [
      "care"
    ],
    "description": "응급장비와 안전 확인을 지원합니다. 원문의 노인 대상 경로를 구조화한 초안이며 장애인 경로는 별도 확인이 필요합니다.",
    "sourceUrl": "https://state.gwd.go.kr/portal/partinfo/welfare/singleperson/localpresent",
    "sourceTitle": "독거노인·장애인 응급안전안심서비스 · 강원특별자치도 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:53.570603+09:00",
    "minAge": null,
    "maxAge": null,
    "incomeRequired": false,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [
      "신분증"
    ],
    "nextAction": "주소지 행정복지센터에 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "65세 이상 독거노인 등",
    "applicationText": "주소지 행정복지센터 방문 신청, 신분증 지참",
    "contactText": "춘천시 복지국 통합돌봄과 250-4373",
    "exclusionText": "",
    "sourceNotes": "표의 사업규모 숫자는 현재 정원/잔여 신청 가능량을 의미하지 않음.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "chuncheon_single_services",
    "ruleNotes": "원문 사업명은 노인·장애인 경로를 함께 포함하나 요약 대상 문구는 65세 이상 독거노인 등으로 불완전함. 단일 연령 하한으로 65세 미만 장애인 경로를 자동 배제하지 않음. 실제 대상·중복 이용·장비 설치 여부는 기관 확인.",
    "policyYear": null,
    "sourceUpdatedAt": "2026-10-01",
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문 하단 ‘최근 업데이트’ 날짜. 개별 사업의 적용연도·모집일이 아님.",
    "sourceRecord": {
      "sourceId": "chuncheon_single_services",
      "rawFile": "public_data_2025h2/raw/welfare/chuncheon_single_services.html",
      "sha256": "2896208196f254e7f431dc9a9dce2af432b4039b14c55b0e6674dd48f3393b1d",
      "sourceTitle": "춘천시 1인가구 지원사업 현황",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "cc-hospital-companion",
    "name": "어르신 병원동행서비스",
    "region": "chuncheon",
    "needs": [
      "care"
    ],
    "description": "재가노인의 병원 이동, 접수·수납, 검사실 이동 등을 돕습니다.",
    "sourceUrl": "https://state.gwd.go.kr/portal/partinfo/welfare/singleperson/localpresent",
    "sourceTitle": "어르신 병원동행서비스 · 강원특별자치도 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:53.570603+09:00",
    "minAge": 65,
    "maxAge": null,
    "incomeRequired": false,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [
      "신분증"
    ],
    "nextAction": "주소지 행정복지센터에 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "65세 이상 재가노인",
    "applicationText": "수행기관(춘천남부재가노인센터)에 전화 또는 방문 신청, 신분증 지참",
    "contactText": "춘천시 복지국 통합돌봄과 250-4373",
    "exclusionText": "",
    "sourceNotes": "표의 사업규모 숫자는 현재 정원/잔여 신청 가능량을 의미하지 않음.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "chuncheon_single_services",
    "ruleNotes": "65세 이상 재가노인이라는 원문 조건만 연령 하한으로 구조화. 재가 여부·동행 필요·수행기관 여력 및 추가 조건은 기관 확인. 연령 충족만으로 선정 확정하지 않음.",
    "policyYear": null,
    "sourceUpdatedAt": "2026-10-01",
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문 하단 ‘최근 업데이트’ 날짜. 개별 사업의 적용연도·모집일이 아님.",
    "sourceRecord": {
      "sourceId": "chuncheon_single_services",
      "rawFile": "public_data_2025h2/raw/welfare/chuncheon_single_services.html",
      "sha256": "2896208196f254e7f431dc9a9dce2af432b4039b14c55b0e6674dd48f3393b1d",
      "sourceTitle": "춘천시 1인가구 지원사업 현황",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "cc-tailored-care",
    "name": "노인맞춤돌봄서비스",
    "region": "chuncheon",
    "needs": [
      "care",
      "connection"
    ],
    "description": "안부 확인과 사회참여, 생활교육, 일상생활 지원을 연결합니다.",
    "sourceUrl": "https://state.gwd.go.kr/portal/partinfo/welfare/singleperson/localpresent",
    "sourceTitle": "노인맞춤돌봄서비스 · 강원특별자치도 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:53.570603+09:00",
    "minAge": 65,
    "maxAge": null,
    "incomeRequired": true,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [
      "신분증"
    ],
    "nextAction": "주소지 행정복지센터에 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "65세 이상 노인 (①기초생활수급자, ②차상위계층, ③기초연금수급자)",
    "applicationText": "주소지 행정복지센터 방문 신청, 신분증 지참",
    "contactText": "춘천시 복지국 통합돌봄과 250-4931",
    "exclusionText": "",
    "sourceNotes": "표의 사업규모 숫자는 현재 정원/잔여 신청 가능량을 의미하지 않음.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "chuncheon_single_services",
    "ruleNotes": "65세 이상과 기초생활수급·차상위·기초연금 경로를 원문에서 확인. incomeRequired는 수급자격 추가 확인 표시이며 소득 숫자 충족을 의미하지 않음. 돌봄 필요·기존 유사서비스·중복 제한과 예외는 현행 기관 기준 확인. 혼인·동거만으로 자동 배제하지 않음.",
    "policyYear": null,
    "sourceUpdatedAt": "2026-10-01",
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문 하단 ‘최근 업데이트’ 날짜. 개별 사업의 적용연도·모집일이 아님.",
    "sourceRecord": {
      "sourceId": "chuncheon_single_services",
      "rawFile": "public_data_2025h2/raw/welfare/chuncheon_single_services.html",
      "sha256": "2896208196f254e7f431dc9a9dce2af432b4039b14c55b0e6674dd48f3393b1d",
      "sourceTitle": "춘천시 1인가구 지원사업 현황",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "cc-safe-call",
    "name": "춘천형 노인통합돌봄 “춘천안심서비스”",
    "region": "chuncheon",
    "needs": [
      "care",
      "digital"
    ],
    "description": "안드로이드 휴대전화의 활동 감지와 등록 보호자 알림을 활용한 안부 확인 사업입니다.",
    "sourceUrl": "https://state.gwd.go.kr/portal/partinfo/welfare/singleperson/localpresent",
    "sourceTitle": "춘천형 노인통합돌봄 “춘천안심서비스” · 강원특별자치도 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:53.570603+09:00",
    "minAge": null,
    "maxAge": null,
    "incomeRequired": false,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [],
    "nextAction": "주소지 행정복지센터에 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "안드로이드 핸드폰 사용 독거가구 2,000가구",
    "applicationText": "신청방법 QR코드 스캔 다운 구글플레이스토어 다운 구글 플레이스토어 → ‘춘천안심서비스’ 검색 → 설치",
    "contactText": "춘천시 복지국 통합돌봄과 250-3318",
    "exclusionText": "",
    "sourceNotes": "표의 사업규모 숫자는 현재 정원/잔여 신청 가능량을 의미하지 않음.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "chuncheon_single_services",
    "ruleNotes": "원문은 안드로이드 휴대전화 사용 독거가구 대상으로 안내. 현재 동거 상태·기기 호환·보호자 등록 가능 여부와 운영 상태를 확인. 이름의 노인이라는 표현만으로 임의 연령 하한을 만들지 않음. 알림 설치가 실제 돌봄 서비스 제공을 보장하지 않음.",
    "policyYear": null,
    "sourceUpdatedAt": "2026-10-01",
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문 하단 ‘최근 업데이트’ 날짜. 개별 사업의 적용연도·모집일이 아님.",
    "sourceRecord": {
      "sourceId": "chuncheon_single_services",
      "rawFile": "public_data_2025h2/raw/welfare/chuncheon_single_services.html",
      "sha256": "2896208196f254e7f431dc9a9dce2af432b4039b14c55b0e6674dd48f3393b1d",
      "sourceTitle": "춘천시 1인가구 지원사업 현황",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "cc-local-food",
    "name": "저소득 취약계층 로컬푸드",
    "region": "chuncheon",
    "needs": [
      "care"
    ],
    "description": "저소득 독거노인의 먹거리 지원 후보입니다. 운영 차수와 잔여 지원 규모는 확인이 필요합니다.",
    "sourceUrl": "https://state.gwd.go.kr/portal/partinfo/welfare/singleperson/localpresent",
    "sourceTitle": "저소득 취약계층 로컬푸드 · 강원특별자치도 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:53.570603+09:00",
    "minAge": 65,
    "maxAge": null,
    "incomeRequired": true,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [
      "신분증"
    ],
    "nextAction": "주소지 행정복지센터에 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "65세 이상 기초생활수급자 독거노인",
    "applicationText": "주소지 행정복지센터 방문 신청, 신분증 지참",
    "contactText": "춘천시 농업기술센터 농산물유통과 033-250-3530",
    "exclusionText": "",
    "sourceNotes": "표의 사업규모 숫자는 현재 정원/잔여 신청 가능량을 의미하지 않음.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "chuncheon_single_services",
    "ruleNotes": "원문 조건은 65세 이상 기초생활수급자 독거노인. 일반 저소득 또는 차상위만으로 충족 처리하지 않음. 현재 수급 유형·독거 여부·지원 차수·중복 수혜와 잔여 물량은 기관 확인.",
    "policyYear": null,
    "sourceUpdatedAt": "2026-10-01",
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문 하단 ‘최근 업데이트’ 날짜. 개별 사업의 적용연도·모집일이 아님.",
    "sourceRecord": {
      "sourceId": "chuncheon_single_services",
      "rawFile": "public_data_2025h2/raw/welfare/chuncheon_single_services.html",
      "sha256": "2896208196f254e7f431dc9a9dce2af432b4039b14c55b0e6674dd48f3393b1d",
      "sourceTitle": "춘천시 1인가구 지원사업 현황",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "gn-tailored-care",
    "name": "노인맞춤돌봄서비스",
    "region": "gangnam",
    "needs": [
      "care",
      "connection"
    ],
    "description": "방문·전화 안부 확인, 사회관계 프로그램과 일상생활 지원을 연결합니다.",
    "sourceUrl": "https://bokji.gangnam.go.kr/board/senior_support/list.do?mid=ID06_06",
    "sourceTitle": "노인맞춤돌봄서비스 · 강남구 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:49.622510+09:00",
    "minAge": 65,
    "maxAge": null,
    "incomeRequired": true,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [
      "신분증"
    ],
    "nextAction": "공식 안내의 담당 창구에서 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "65세 이상 국민기초생활수급자, 차상위계층 또는 기초연금수급자",
    "applicationText": "본인, 가족 또는 그 밖의 관계인이 서비스 대상자 주소지 동 주민센터에서 신청 제출서류 서식 제1-1호 노인맞춤돌봄서비스 신청서 신청자 신분증(주민등록증, 여권, 운전면허증)이나 국가유공자증 서비스 대상자의 건강보험증 사본 (해당자의 경우)",
    "contactText": "강남구노인통합지원센터(봉은사로 24길 70), 02-557-8091~4",
    "exclusionText": "재가서비스사업의 대상이 아닌 자 의료기관 입원 중인 노인, 국민기초생활보장법 제32조에 따른 보장시설 입소자 국고사업에 의하여 동일한 또는 유사한 재가서비스를 받고 있는 자 자활근로에 의한 간병서비스, 노인돌봄기본서비스, 노인복지법에 의한 방문요양 서비스(구. 가정봉사원파견사업), 노인장기요양보험(저소득층본인일부부담금지원, 특별현금급여, 재가급여, 시설급여), 국가보훈처 복지도우미, 기타 정부부처, 지방자치단체에서 시행하는 사회서비스일자리사업의 가사간병서비스 등 이에 준하는 재가서비스 실제 주거를 같이 하는 가구원이 노인돌봄종합서비스, 가사간병서비스, 노인장기요양보험, 방문요양서비스를 받고 있을 경우 서비스 대상에서 제외",
    "sourceNotes": "본문에 2025 소득기준이 있으나 일부 제도 문구가 오래되었을 수 있어 신청 시 기관 재확인 필요.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "gangnam_senior_services",
    "ruleNotes": "65세 이상과 수급·차상위·기초연금 경로를 확인한 초안. 원문 제외 조건에는 구 제도 명칭 및 가구원 서비스 조건이 섞여 있어 그대로 자동 배제 규칙으로 실행하지 않음. 본인 기존 서비스, 돌봄 필요, 현행 중복 제한·예외를 기관에서 재확인. 기혼·동거만으로 탈락시키지 않음.",
    "policyYear": null,
    "sourceUpdatedAt": null,
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문에 게시·수정일을 확인하지 못함. 사업 적용연도 및 현재 운영 조건 미확인.",
    "sourceRecord": {
      "sourceId": "gangnam_senior_services",
      "rawFile": "public_data_2025h2/raw/welfare/gangnam_senior_services.html",
      "sha256": "06e0e2754631fa43251c68c8eb5d2020b18482d24d93ec99e12e075bd533dc54",
      "sourceTitle": "강남구 어르신지원정책",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "gn-meals",
    "name": "무료급식지원",
    "region": "gangnam",
    "needs": [
      "care"
    ],
    "description": "결식 우려가 있는 어르신에게 급식 또는 배달을 지원합니다. 식사·밑반찬 배달의 별도 65세 요건과 거동 상태를 추가 확인합니다.",
    "sourceUrl": "https://bokji.gangnam.go.kr/board/senior_support/list.do?mid=ID06_06",
    "sourceTitle": "무료급식지원 · 강남구 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:49.622510+09:00",
    "minAge": 60,
    "maxAge": null,
    "incomeRequired": true,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [],
    "nextAction": "공식 안내의 담당 창구에서 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "무료경로식당 국민기초생활수급자 및 차상위계층에 해당되는 60세 이상 어르신 식사배달 국민기초생활수급자 및 차상위계층 65세 이상 독거노인 중 거동불편으로 경로식당을 이용할 수 없는 어르신 밑반찬배달 국민기초생활수급자 및 차상위계층 65세 이상 독거노인 중 거동이 불편한 어르신을 우선 선정",
    "applicationText": "각 사업기관",
    "contactText": "",
    "exclusionText": "",
    "sourceNotes": "세부 사업기관·전화는 source_excerpt 및 원본 내 급식시설 표 참조. 정원을 실시간 이용가능량으로 해석하지 말 것.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "gangnam_senior_services",
    "ruleNotes": "minAge 60은 무료경로식당의 최소 연령만 나타냄. 식사배달·밑반찬배달은 원문상 65세 이상 독거 및 거동불편 등 별도 조건이며 60~64세에게 배달 적격으로 표시하면 안 됨. 수급자·차상위 여부와 이용 유형·기관 정원·중복 지원을 확인. 이 통합 사업 카드의 연령 충족은 서비스 유형별 선정 승인이 아님.",
    "policyYear": null,
    "sourceUpdatedAt": null,
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문에 게시·수정일을 확인하지 못함. 사업 적용연도 및 현재 운영 조건 미확인.",
    "sourceRecord": {
      "sourceId": "gangnam_senior_services",
      "rawFile": "public_data_2025h2/raw/welfare/gangnam_senior_services.html",
      "sha256": "06e0e2754631fa43251c68c8eb5d2020b18482d24d93ec99e12e075bd533dc54",
      "sourceTitle": "강남구 어르신지원정책",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "gn-volunteer",
    "name": "노인자원봉사",
    "region": "gangnam",
    "needs": [
      "connection"
    ],
    "description": "어르신의 경험과 역량을 살린 자원봉사와 사회참여 활동을 연결합니다.",
    "sourceUrl": "https://bokji.gangnam.go.kr/board/senior_support/list.do?mid=ID06_06",
    "sourceTitle": "노인자원봉사 · 강남구 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:49.622510+09:00",
    "minAge": 60,
    "maxAge": null,
    "incomeRequired": false,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [],
    "nextAction": "공식 안내의 담당 창구에서 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "60세이상 어르신",
    "applicationText": "강남구자원봉사센터 (☎ 02-3445-5152)",
    "contactText": "강남구자원봉사센터 (☎ 02-3445-5152)",
    "exclusionText": "",
    "sourceNotes": "",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "gangnam_senior_services",
    "ruleNotes": "60세 이상이라는 원문 연령을 구조화. 활동 종류·참여 가능 일정·모집 상태는 기관 확인. 자원봉사는 고용·급여 지급 사업이 아니며 취업지원으로 분류하지 않음.",
    "policyYear": null,
    "sourceUpdatedAt": null,
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문에 게시·수정일을 확인하지 못함. 사업 적용연도 및 현재 운영 조건 미확인.",
    "sourceRecord": {
      "sourceId": "gangnam_senior_services",
      "rawFile": "public_data_2025h2/raw/welfare/gangnam_senior_services.html",
      "sha256": "06e0e2754631fa43251c68c8eb5d2020b18482d24d93ec99e12e075bd533dc54",
      "sourceTitle": "강남구 어르신지원정책",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "gn-community",
    "name": "강남구 1인가구 커뮤니티센터 운영",
    "region": "gangnam",
    "needs": [
      "connection",
      "emotional"
    ],
    "description": "1인가구의 소모임, 커뮤니티 공간, 생활역량 및 심리상담 프로그램을 안내합니다.",
    "sourceUrl": "https://www.gangnam.go.kr/board/youthgn_biz03/list.do?mid=youthgn_biz03",
    "sourceTitle": "강남구 1인가구 커뮤니티센터 운영 · 강남구 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:50.272686+09:00",
    "minAge": null,
    "maxAge": null,
    "incomeRequired": false,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [],
    "nextAction": "공식 안내의 담당 창구에서 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "강남구 거주 1인가구",
    "applicationText": "홈페이지 : gangnam1.org 카카오톡 : ‘강남구1인가구커뮤니티센터’ 채널 추가",
    "contactText": "복지정책과 복지자원팀 (☎02-3423-5793) 강남구 1인가구커뮤니티센터",
    "exclusionText": "",
    "sourceNotes": "",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "gangnam_single_household",
    "ruleNotes": "원문은 강남구 거주 1인가구. 주민등록/실제 거주 요건, 현재 1인가구 여부 및 세부 프로그램 추가 조건을 확인. 혼인 상태에서 독거를 추론하지 않음. 센터 운영 안내가 개별 소모임 접수 가능을 의미하지 않음.",
    "policyYear": null,
    "sourceUpdatedAt": null,
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문에 게시·수정일을 확인하지 못함. 사업 적용연도 및 현재 운영 조건 미확인.",
    "sourceRecord": {
      "sourceId": "gangnam_single_household",
      "rawFile": "public_data_2025h2/raw/welfare/gangnam_single_household.html",
      "sha256": "db35c41e8d9ce5b7553b4535d4ae507916e5015ac1af265cc65ff98842144d9b",
      "sourceTitle": "강남구 1인가구 커뮤니티센터 운영",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "gn-emergency-welfare",
    "name": "긴급복지 지원제도",
    "region": "gangnam",
    "needs": [
      "housing",
      "care"
    ],
    "description": "위기 가구의 생계·의료·주거 등 필요한 지원을 검토합니다. 위기사유와 소득·재산 기준은 기관 확인이 필요합니다.",
    "sourceUrl": "https://bokji.gangnam.go.kr/board/BBS_QNA/730/view.do?mid=ID03_03&pgno=1&type=",
    "sourceTitle": "긴급복지 지원제도 · 강남구 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:51.587008+09:00",
    "minAge": null,
    "maxAge": null,
    "incomeRequired": true,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [],
    "nextAction": "공식 안내의 담당 창구에서 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "생계유지가 곤란한 저소득층으로 아래 위기사유와 소득･재산 기준을 충족하는 가구",
    "applicationText": "시･군･구청, 읍･면･동 주민센터(행정복지센터) 및 보건복지상담센터(☎129)에 지원요청 또는 신고",
    "contactText": "시･군･구청, 읍･면･동 주민센터(행정복지센터) 및 보건복지상담센터(☎129)",
    "exclusionText": "",
    "sourceNotes": "수집 본문 게시일은 2026-08-10. 상세 소득·재산·위기사유 기준은 첨부 이미지 원본에 있고 자동 OCR하지 않음. 자격 판단용 숫자 필드 미작성.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "gangnam_emergency_2025",
    "ruleNotes": "위기사유와 소득·재산 기준 및 가구 구성을 기관 확인. 세부 수치가 첨부 이미지에 있어 이 스냅샷에서 자동 추출하지 않았음. incomeRequired는 추가 확인 요청이며 임의 소득 임계값이나 자격 확정을 만들지 않음. 현행 중복 수급·지원 횟수 제한도 기관 심사 사항.",
    "policyYear": null,
    "sourceUpdatedAt": null,
    "sourcePublishedAt": null,
    "sourceDisplayedAt": "2026-08-10",
    "sourceDateMeaning": "제목 아래 달력 아이콘 옆 날짜. 게시·수정일의 명시적 구분이 없어 원문 표시일로 보존; 정책 적용일이 아님.",
    "sourceRecord": {
      "sourceId": "gangnam_emergency_2025",
      "rawFile": "public_data_2025h2/raw/welfare/gangnam_emergency_2025.html",
      "sha256": "4ada17aa9a43712335d30b81984741334cb0cb6cf13a82a85dd2993d5c3424ce",
      "sourceTitle": "긴급복지 지원제도 (원래 검색색인 2025, 실제 수집 본문 2026 갱신)",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "gn-counseling",
    "name": "강남구정신건강복지센터 8회기 심리상담",
    "region": "gangnam",
    "needs": [
      "emotional"
    ],
    "description": "대인관계, 진로·취업, 가족문제 등의 일대일 심리상담을 안내합니다. 상담 적합성과 현재 대기 기간을 확인해야 합니다.",
    "sourceUrl": "https://health.gangnam.go.kr/web/Board/281/detailView.do",
    "sourceTitle": "강남구정신건강복지센터 8회기 심리상담 · 강남구 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:11:51.049898+09:00",
    "minAge": null,
    "maxAge": null,
    "incomeRequired": false,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [],
    "nextAction": "공식 안내의 담당 창구에서 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "강남구 관내 거주자  관내 취약계층 대상 우선제공  취약계층의 구체적 기준  수급자, 차상위, 고령자, 한부모, 청년 및 경력  단절 여성 등 중 고용촉진장려금의 지급 대상  이 되는 사람, 범죄피해자, 성매매피해자 등",
    "applicationText": "강남구정신건강복지센터  8회기 심리상담 순서  01 상담신청 강남구정신건강복지센터 유선신청 02-2226-0344  유선 상담 후 서비스 제공 여부 결정되며, 서비스 제공에 적합하지 않을 시에는 타 서비스 연계 및 정보 안내할 수 있습니다  02 상담준비  상담신청서, 동의서 작성,  BDI(우울감), BAI(불안감) 심리검사  필요시, 상담중 추가 심리검사 진행될 수 있습니다.  04 상담종결  상담이 종결된 후 필요시, 서비스 연계 진행  강남구 마음건강검진, 전국민 마음투자지원사업  03 상담시작  내담자의 주호소를 파악한 뒤 상담을 진행합니다 상담은 기본 50분씩 진행됩니다  신청 즉시 상담 시작되는 것이 아니며, 최소 한 달~최대 3개월까지 대기가 발생할 수 있습니다.",
    "contactText": "02-2226-0344",
    "exclusionText": "",
    "sourceNotes": "공식 카드뉴스 이미지 alt에서 추출; 최소 1개월~최대 3개월 대기 가능 표기. 개별 상담 후 서비스 적합성 확인.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "gangnam_psychological_2025",
    "ruleNotes": "강남구 거주 및 취약계층 우선 조건은 원문에서 확인. 취약계층이 아니라는 이유로 자동 제외하지 않음. 기관 유선상담 후 서비스 적합성 결정; 2025년 게시물의 대기 기간은 현재 대기 정보가 아님. 기존 상담과 연계·중복 이용 가능 여부는 담당 기관 확인.",
    "policyYear": null,
    "sourceUpdatedAt": null,
    "sourcePublishedAt": "2025-03-18",
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "게시물 HTML에서 작성일로 표시한 날짜. 사후 수정 여부 및 현재 상담 운영·대기는 별도 확인.",
    "sourceRecord": {
      "sourceId": "gangnam_psychological_2025",
      "rawFile": "public_data_2025h2/raw/welfare/gangnam_psychological_2025.html",
      "sha256": "9e6df4bc7662096f051aa4578b61b2b73f07baa9929b5c51851265d8305f2f60",
      "sourceTitle": "일상 마음돌봄을 위한 강남구민 심리 상담 서비스",
      "snapshotHttpStatus": 200
    }
  },
  {
    "id": "cc-connection",
    "name": "고독사 예방 사업",
    "region": "chuncheon",
    "needs": [
      "connection",
      "emotional"
    ],
    "description": "청년의 마음·일상·관계 회복과 중장년의 안부 확인, 생활 개선, 관계망 형성을 지원합니다.",
    "sourceUrl": "https://www.chuncheon.go.kr/new-welfare/life/youth-old/prevention-lonely-death/",
    "sourceTitle": "고독사 예방 사업 · 춘천시 공식 안내",
    "sourceYear": null,
    "sourceDate": null,
    "verifiedAt": null,
    "collectedAt": "2026-10-25T20:16:46.178554+09:00",
    "minAge": 19,
    "maxAge": 64,
    "incomeRequired": false,
    "agencyReview": true,
    "offering": {
      "type": "unknown",
      "start": null,
      "end": null
    },
    "rulesApproved": false,
    "requiredDocuments": [
      "신분증"
    ],
    "nextAction": "주소지 행정복지센터에 현재 운영 및 대상 조건을 확인합니다.",
    "eligibilityText": "사회적 교류가 적은 *은둔청년 또는 중장년 고립가구(19세~64세) * 보건복지부 고독사 위험도 판단도구에 의해 선정 소득기준 없음",
    "applicationText": "신청방법: 방문 또는 유선 신청 청년: 주소지 읍면동 행정복지센터, 사단법인 늘봄청소년 신청(☎033-255-9582) 중장년: 주소지 읍면동 행정복지센터, 춘천효자종합사회복지관 신청(☎033-261-1790) 신청권자: 본인, 친족, 법적대리인 신청기간: 상시 제출서류: 신분증",
    "contactText": "통합돌봄과 033-250-4180",
    "exclusionText": "",
    "sourceNotes": "공식 페이지 최종수정일 2025-06-18. 19~64세 은둔청년·중장년 고립가구, 소득기준 및 본인부담 없음. 기관 위험도 도구로 선정하며 집계 활동지수만으로 대상 확정하지 않음.",
    "ruleVersion": "snapshot-draft-2026-10-25",
    "sourceId": "chuncheon_isolation_prevention_2025",
    "ruleNotes": "원문 연령은 19~64세이며 소득기준 없음. 사회적 교류가 적은 은둔청년·중장년 고립가구이고 기관의 고독사 위험도 도구에 따른 선정이 필요. 앱의 응답 기반 고립 분류가 해당 기관 평가를 대체하지 않음. 2025년 수정 안내의 상시 문구는 현재 접수 확인이 아님.",
    "policyYear": null,
    "sourceUpdatedAt": "2025-06-18",
    "sourcePublishedAt": null,
    "sourceDisplayedAt": null,
    "sourceDateMeaning": "원문 하단 ‘최종수정일’. 사업 적용연도·공고 게시일·접수 확인일이 아님.",
    "sourceRecord": {
      "sourceId": "chuncheon_isolation_prevention_2025",
      "rawFile": "public_data_2025h2/raw/welfare/chuncheon_isolation_prevention_2025.html",
      "sha256": "e43a2c2a644591f93cac36e70ded5399936e38f5891b7b52122a83413bb9f6e9",
      "sourceTitle": "고독사 예방",
      "snapshotHttpStatus": 200
    }
  }
];

export const FACILITIES = [
  {
    "id": "facility-176cb7781a2f2332",
    "name": "태화기독교사회복지관",
    "region": "gangnam",
    "type": "종합사회복지관",
    "address": "서울특별시 강남구 광평로 185 (일원본동)",
    "phone": "02-2040-1606",
    "hours": null,
    "sourceUrl": "https://bokji.gangnam.go.kr/map/facility.do?mid=ID05_02&pgno=5",
    "website": null,
    "collectedAt": "2026-10-25T20:11:48.359482+09:00",
    "lat": null,
    "lng": null,
    "coordinateStatus": "unverified",
    "note": "공식 명부의 주소이며 좌표는 수집되지 않았습니다. 현장 방문 전 기관 확인이 필요합니다."
  },
  {
    "id": "facility-50fb61be54d03fad",
    "name": "수서종합사회복지관",
    "region": "gangnam",
    "type": "종합사회복지관",
    "address": "서울특별시 강남구 광평로56길 11 (수서동)",
    "phone": "02-459-5504",
    "hours": null,
    "sourceUrl": "https://bokji.gangnam.go.kr/map/facility.do?mid=ID05_02&pgno=5",
    "website": null,
    "collectedAt": "2026-10-25T20:11:48.359482+09:00",
    "lat": null,
    "lng": null,
    "coordinateStatus": "unverified",
    "note": "공식 명부의 주소이며 좌표는 수집되지 않았습니다. 현장 방문 전 기관 확인이 필요합니다."
  },
  {
    "id": "facility-4a64dc9c5aae85ac",
    "name": "강남종합사회복지관",
    "region": "gangnam",
    "type": "종합사회복지관",
    "address": "서울특별시 강남구 개포로109길 5 (개포3동)",
    "phone": "02-451-0051",
    "hours": null,
    "sourceUrl": "https://bokji.gangnam.go.kr/map/facility.do?mid=ID05_02&pgno=5",
    "website": null,
    "collectedAt": "2026-10-25T20:11:48.359482+09:00",
    "lat": null,
    "lng": null,
    "coordinateStatus": "unverified",
    "note": "공식 명부의 주소이며 좌표는 수집되지 않았습니다. 현장 방문 전 기관 확인이 필요합니다."
  },
  {
    "id": "facility-93c6bc08acc82d14",
    "name": "춘천남부노인복지관",
    "region": "chuncheon",
    "type": "노인복지관",
    "address": "(24364) 춘천시 방송길 86(온의동 6-33)",
    "phone": "033-241-5600",
    "hours": "(월~금) 09:00 ~ 17:30",
    "sourceUrl": "https://www.chuncheon.go.kr/new-welfare/",
    "website": "http://ccnoin.or.kr/",
    "collectedAt": "2026-10-25T20:11:52.990411+09:00",
    "lat": null,
    "lng": null,
    "coordinateStatus": "unverified",
    "note": "공식 명부의 주소이며 좌표는 수집되지 않았습니다. 현장 방문 전 기관 확인이 필요합니다."
  },
  {
    "id": "facility-8813c40d62c1dd7d",
    "name": "춘천종합사회복지관",
    "region": "chuncheon",
    "type": "종합사회복지관",
    "address": "(24309) 춘천시 후석로 228번길 47",
    "phone": "033-242-0051~3",
    "hours": "(월~금) 09:00 ~ 18:00",
    "sourceUrl": "https://www.chuncheon.go.kr/new-welfare/",
    "website": "https://ccwelfare.or.kr/",
    "collectedAt": "2026-10-25T20:11:52.990411+09:00",
    "lat": null,
    "lng": null,
    "coordinateStatus": "unverified",
    "note": "공식 명부의 주소이며 좌표는 수집되지 않았습니다. 현장 방문 전 기관 확인이 필요합니다."
  },
  {
    "id": "facility-628f45d45eba0bb2",
    "name": "춘천효자종합사회복지관",
    "region": "chuncheon",
    "type": "종합사회복지관",
    "address": "(24344) 춘천시 공지로 234-16(효자2동 333번지)",
    "phone": "033-261-1790",
    "hours": "(월~금) 09:00 ~ 18:00",
    "sourceUrl": "https://www.chuncheon.go.kr/new-welfare/",
    "website": "http://www.hyojaswc.or.kr/",
    "collectedAt": "2026-10-25T20:11:52.990411+09:00",
    "lat": null,
    "lng": null,
    "coordinateStatus": "unverified",
    "note": "공식 명부의 주소이며 좌표는 수집되지 않았습니다. 현장 방문 전 기관 확인이 필요합니다."
  }
];

export const DATA_META = {
  "version": "2026-10-25.2",
  "analysisPeriod": "2025.07–2025.12",
  "programCollectedAt": "2026-10-25",
  "programCurrentOfferingVerified": false,
  "caseDataType": "synthetic",
  "chartBase": "각 지역 2025.07 = 100",
  "activityDefinition": "6개월 공통 관측 격자의 성·연령별 통신 유동인구 수치 합",
  "consumptionDefinition": "카드 데이터 2의 지역 가맹점 이용 건수 / 해당 월 일수",
  "populationDefinition": "주민등록 1인세대; 통계청 1인가구와 다름",
  "geoScope": "시·군·구 단위 지역 비교. 시설 위경도 미확인. 지도 중심은 지역 탐색용.",
  "limitations": [
    "지역 집계로 개인의 고립·소득·고용·연락 단절을 추정하지 않습니다.",
    "사례·상담 기록·처리 이력은 합성 시연 데이터입니다.",
    "지원사업 수집일은 현재 접수 확인일이 아닙니다. 모든 모집 상태는 현황 미확인입니다.",
    "사업 조건은 검수 전 초안이며 예외·제외·중복 이용 조건을 완전히 기계화하지 않았습니다.",
    "통신 지역 코드 매핑은 대회 범위와 좌표 군집을 이용한 잠정 매핑입니다.",
    "통신·카드 수치는 지역별 기술 통계이며 개인 고립 예측 정확도를 의미하지 않습니다.",
    "시설 명부 좌표가 없어 지도에 실측 시설 마커를 생성하지 않습니다."
  ],
  "sources": [
    "analysis/monthly_combined_summary.csv",
    "analysis/telecom_fixed_grid_month.csv",
    "public_data_2025h2/processed/population/population_households_monthly_sigungu.csv",
    "public_data_2025h2/processed/welfare/services.csv",
    "public_data_2025h2/processed/welfare/facilities_deduplicated_candidates.csv"
  ],
  "dateSemantics": {
    "analysisPeriod": "통계 관측 기간",
    "programCollectedAt": "원문 웹페이지를 저장한 수집 날짜. 운영·모집 확인 날짜가 아님.",
    "collectedAt": "사업/시설 원문을 저장한 수집 타임스탬프",
    "sourceUpdatedAt": "원문에 명시한 최근 업데이트 또는 최종수정일",
    "sourcePublishedAt": "원문 HTML에서 작성일로 확인한 날짜",
    "sourceDisplayedAt": "게시/수정 구분이 명시되지 않은 원문 날짜",
    "sourceDate": "모호성 방지를 위해 미사용(null)",
    "sourceYear": "정책 적용연도로 오인하지 않도록 미사용(null)",
    "policyYear": "실제 정책 적용연도; 미검증(null)",
    "verifiedAt": "현행 조건·접수 확인일; 이번 스냅샷은 미검증(null)"
  },
  "snapshotValidation": "선택한 12개 사업의 이름·대상·신청방법·제외조건·출처 URL을 보존된 services.csv 및 원문 HTML 날짜 표시와 대조. 새 온라인 조회나 현행 자격·접수 검증은 수행하지 않음."
};

