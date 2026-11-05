# 이상한 꿈의 일반 native 도구 조합

원본 pinned7c088125 weird-dream-encounter.ts277–282,477 이후는 폼 변경 modifier를 제외한 소지 효과를 변환/대체전투 개체에 옮긴다. 이 프로젝트는 native item과 modifier를 별도로 보존하며 기존9종만 검토되어 있었다.

검토한 일반 native 도구9종(focussash,blacksludge,rockyhelmet,expertbelt,shellbell,safetygoggles,heavydutyboots,muscleband,wiseglasses)을 추가해18종을 연결했다. 폼·종족·잠금 상태를 바꾸는 도구가 아니며 고정 native 엔진의 기존 효과를 사용한다. 이벤트 후보 준비, 실제 변환 선택/저장/확인, 대체 전투와 원래 파티 보존이 같은 검사를 통과한다. 독립 active 폼 도구나 다른 미검증native를 임의 허용하지 않는다.

신규 검사3개: 9종×변환/대체 전투18경로와codec 복구/다른슬롯·탐험 보존; 변환 후FocusSash 실제 전투1HP 생존/소모; 폼 도구·알수없는 도구 거부/무변경. 기존 native 엔진 효과 전체를 새로 구현한 것이 아니며 모든 조합을 전수 검사했다는 의미도 아니다. /tmp/batch-six-dream.log 및 최종 통합 기록 참조. 원본 비활성 콘텐츠·Sites·운영 저장은 변경하지 않는다.
