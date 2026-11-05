# 임시 다이맥스 융합과 분리 HP 보정

2026-11-05, 기준 `3b6f797`. Sites와 탐험은 변경하지 않는다.

## 재현과 구현

기존 네이티브 3턴 다이맥스는 융합 개체도 사용할 수 있었으나, 첫 턴 뒤 파티의 `dynamaxed:true`와 늘어난 HP를 DNA 검증기가 거부했다. 실제 단일 세대 챌린지에서 첫 턴의 Mew+Squirtle 융합은 HP294/294가 되고 `validatedClassicDnaFusion`은 false를 반환했다. 다음 행동은 ‘지원하지 않거나 확인할 수 없는 챌린지입니다.’로 막혔다. 격리 제어기/네이티브 실행으로 수정 전을 재현했고 실제 계정은 사용하지 않았다.

`normalizeClassicTransientDynamax`는 영구 Gmax와 구분해 임시 상태의 HP가 현재 native 계약과 일치하는지 확인한다. 정수 HP·상한·기초 계산 HP의 배율·상호 배타적인 Mega/Primal/Ultra/Tera/영구 폼을 검사하고 사본만 정상 크기로 환산한다. native 몸이 Shedinja이면 HP1을 유지하고, 다른 몸의 Wonder Guard 융합 HP1은 현재 native 임시 배율2를 따른다. 현재 생성되는 Dynamax level10의 계약이며 다른 배율의 불명확한 저장은 자동 수용하지 않는다.

DNA 검증은 이 정상 크기 사본으로 원래 종·폼·특성·타입·기증자 증명을 그대로 확인한다. 실제 전투의 HP·남은 턴·스냅샷은 변경하지 않는다. 따라서 저장된 융합 Max 상태가 챌린지에서 복구되고 야생 연속 전투는 남은 턴을 유지한다. 교체와 새 트레이너 전투는 기존 엔진의 임시 상태 종료 정책을 따른다.

새 DNA 융합·분리·폼 변경은 파티 거래 전에 임시 HP를 `ceil(oldHP * normalMax / oldMax)`로 환산한다. held modifier 이전이 체력 캐시를 먼저 바꾸는 문제를 피하도록 선택한 두 파티원의 사본을 먼저 정상화한다. 기증자의 원래 정보는 이력 사본으로 보존하고, 잘못된 정보는 원본 파티를 소모하거나 수정하기 전에 거부한다. 거래 후 기존 `unspliceFreshBattle` 정책으로 변경된 파티가 새 전투에 들어간다.

이상한 꿈은 원본 `validated-v1` 융합 규칙을 확인하고 자연 출현 시 임시 HP를 한 번 정상화한다. 미리보기는 원본을 바꾸지 않는다. transform은 새 비융합 파티, battle/leave는 정상 크기의 기존 융합으로 이어지고 세 분기 모두 실제 저장 codec으로 복구한다. 독립 Gmax 검증과 미확인 상태 거부는 유지한다.

기존 프로젝트의 네이티브 3턴 기능과 DNA를 연결하는 변경이며, 고정 포켓로그 원본의 item 기반 Gmax 정책과는 구분해 관리한다. Gmax의 아이템·자동 역변신 정책은 앞선 구현을 유지한다.

## 원본 분리 HP 차이 보완

고정 원본 `field/pokemon.ts`의 `clearFusionSpecies`는 `calculateStats`를 호출한다. `calculateStats`(1570행 부근)는 HP가 남아 있고 새 최대 HP가 늘면 증가분을 현재 HP에도 더하고, 최대 HP가 줄면 상한으로 자른다. 기존 로컬 `previewClassicDnaUnsplice`는 증가분을 더하지 않았다.

분리 시 정상 크기 융합 HP를 기준으로 이 규칙을 적용한다. 최대 HP 증가/감소, Wonder Guard로 HP1인 융합의 특성 복원, 기절을 검사한다. HP0은 그대로0이며 기증자는 복원되지 않는다. 기존 저장의 비전투 파티 분리에도 적용하고 저장 전체를 일괄 변경하지 않는다.

## 검사

- 새 테스트11개: 단일/더블 챌린지의 실제 Max 턴→저장 codec→다음 턴→3턴 해제, 게임 DTO의 융합 유효성.
- 실제 야생 승리→보상 건너뛰기→다음 야생 웨이브와 남은 Max2턴·재사용 불가. 일반 트레이너 추첨은 wave-offset **seed 문자열**을 쓰므로 야생 경계용 fixture도 그 계약으로 선택한다. 초기 fixture가 RNG cursor만 바꿔 계속 트레이너가 된 실패는 수정했다.
- 교체·새 트레이너의 정상 HP 복구, 양쪽 DNA 입력의 홀수 Max HP와 Soul Dew 이전·기증자 이력·원본 불변성, 분리/메가 변경.
- 자연 이상한 꿈 출현과 변환/전투/거절의 실제 저장 복구·파티/다른 슬롯/탐험 보존.
- 실제 native 몸별 HP1 배율, 손상 HP·혼합 영구 폼·Tera·기증자 증명 거부.
- 원본 분리 HP 증가·감소·HP1·기절8경계, 입력 불변성과 기증자 미복원.

마지막 변경 후 확정 검사 결과를 아래 기록한다. 새 화면을 추가하지 않았고 실계정·실기기·운영 배포 검증은 별도다. 기존의 모든 전투 효과·폼 조합을 검증한 것은 아니다.

## 남은 구현과 이번 조사

Mega8폼, Zygarde Complete/10-Complete의 융합 상태 중간형·자동 Power Construct 변경, 다른 자동 폼·특수 진화·도구·이벤트 조합은 남았다. 이번 읽기 대조에서 Mega8개의 native 자료 자체는 확인했으나 현재 이름 매핑/`isMega` 플래그 처리가 맞지 않음을 확인했다: Magearna `mega-original`→`magearnaoriginalmega`, Tatsugiri `mega-<style>`→`tatsugiri<style>mega`; Mega-Z3종과 Meowstic 성별 Mega는 native `isMega`가 비어 있다. 전역 Dex를 임의 수정하지 않았고 분류·성별·표시·저장/전투 검증을 갖춘 어댑터가 다음 구현 대상이다. 이는 ‘자료가 전혀 없다’는 뜻이 아니다.

실계정 자연1~200, 실제 Safari/Android·이미지 자산, 운영 동시 저장·복구·랭킹·대량 알 처리, 전체 조합과 원본 엔진 차등 검사는 검증 잔량이다.

임시 다이맥스/분리 HP 최종 확정: 전체 **756/756**(156.7초), 집중 **42/42**(7.1초), 새11테스트 포함. 타입·production빌드·변경 린트(오류/경고0)·diff 검사 통과. 근거는 `/tmp/dna-dmax-release-full.log`, `/tmp/dna-dmax-final-focus.log`, `/tmp/dna-dmax-release-type.log`, `/tmp/dna-dmax-release-build.log`, `/tmp/dna-dmax-release-lint.log`. 새 실계정·실기기·브라우저·운영 배포 검증은 하지 않았다. 승인된 브랜치에 일반push 후 원격 SHA를 확인한다.
