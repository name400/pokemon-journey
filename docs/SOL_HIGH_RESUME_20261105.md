# Sol High 이어받기 — R3 통합 저장

2026-11-05. 사용자는 구현을 끝까지 이어가되 반복 자연 플레이를 줄이고, 필요한 Astra 오류 분석을 마친 뒤 일반 구현을 Sol High로 이어가는 데 동의했다. 이 문서는 현재까지 완료한 분석의 종료점이며 프로젝트 종료 선언이 아니다. 다음 턴 모델 변경은 실행 측 설정으로 적용해야 한다. 현재 턴에서 변경됐다고 주장하지 않는다.

저장소 `name400/pokemon-journey`, 브랜치 `cloud/pokerogue-continue-20261105`. 이후 구현 코드와 작업 문서의 같은 공개 브랜치 저장은 계속 승인돼 있다. 강제 푸시·리셋·기존 변경 삭제를 하지 않는다. Sites 저장·배포는 사용자가 별도 Work에서 담당한다. 운영 계정/저장은 변경하지 않는다. 탐험과 다른 슬롯을 보존하며 원본 비활성 콘텐츠를 임의 활성화하지 않는다.

## 이번에 연결하고 검증한 범위

- 자동 폼: Morpeko, Cramorant, Battle Bond/Ash, Meloetta Relic Song, Xerneas 입퇴장, Ogerpon 네 Tera 폼. 주체/기증자 규칙, 실제 전투·기절·Transform·패시브·저장·연속 야생/새 전투 경계를 구분한다. 융합 허용 비기본 폼은 **354/416**이다. 허용 수는 모든 획득/효과 조합의 완성 수가 아니다. `SOURCE_TRIGGER_FORMS_R3_QA_20261105.md`.
- 폼 도구의 독립 활성값과 이전/복제/꿈 변환, 획득 시 발동·여러 이전의 FIFO 적용, Ultra 양쪽 출신 복귀. 새 도전 `formItemStateRule:source-v1`; 기존 marker 없는 저장의 동작은 유지한다. 검토된 137 전환 경로. `FORM_ITEM_ACTIVE_STATE_QA_20261105.md`.
- native 타입 강화 도구 18종과 modifier의 합산·cap99, Focus Band 10%×stack/cap5, Scope Lens +1/cap1. 표현 불가능한 중복은 원자적으로 거부하고 과거 초과 소지품은 삭제하지 않는다. `DNA_NATIVE_COUNTERPART_NORMALIZATION_QA_20261105.md`.
- 이상한 꿈의 검토된 일반 native 도구는 **143종**이다. 기존 134에 abilityshield/adamantorb/boosterenergy/ejectpack/lightball/lustrousorb/mirrorherb/souldew/whiteherb를 추가했다. 143종의 파티 변환·대체 전투·codec을 검사했다. 도구 분류 587종을 전부 지원한다는 뜻은 아니다. 구형 18종 정책은 보존한다.
- Metronome 원본 후보 794개, Copycat/Sleep Talk/Assist 제한, Mirror Move 이력과 실패한 호출의 전역 이력 보존, Instruct 충전 처리, 호출 충전 기술 FOLLOW_UP의 수면/얼음/혼란·마비 경계를 연결했다. 새 도전 `calledMoveRule:source-pool-v1`, 기존 저장과 공유 Dex 보존. 원본 RNG 전체 동등성은 남는다. `BATTLE_CALLERS_SOL_HANDOFF_20261105.md` 및 관련 QA.
- AI matchup 타입 계산에 접지/공중, 노출 Ghost/Dark, Scrappy/Mind's Eye, Stellar 방어, Strong Winds를 연결했다. 함정 피해에서는 Strong Winds를 제외한다. 전체 행동 점수·대상 가중치·원본 RNG/UUID 일치는 아직 아니다.
- 일반 폼 이미지 **272종**, 실제 게임이 허용한 일반 폼 융합 주체 **217종**, 성별/이로치·앞뒤 이미지, nonzero packed atlas crop, 성공한 융합 이미지의 잘못된 fallback 안내를 연결했다. 원본 자산 바이트와 attribution을 유지한다. `ORDINARY_FORM_ARTWORK_QA_20261105.md`, `FUSION_PRIMARY_AND_ATLAS_OFFSET_QA_20261105.md`.

## 최종 통합 확인

- 변경/신규 테스트 15파일의 영향 범위 검사 **일반 113/113, Worker 113/113**. 로그 `/tmp/sol-handoff-focused.log`, `/tmp/sol-handoff-focused-worker.log`; 목록 `/tmp/sol-handoff-focused-files.json`.
- 최종 타입 검사와 production 빌드 통과. `/tmp/sol-handoff-type.log`, `/tmp/sol-handoff-build.log`. 빌드의 eval/큰 chunk/정적 route 분류 경고는 남아 있으며 경고 없는 빌드라고 주장하지 않는다.
- 빈 이벤트 보상·상인·사파리 중단 저장 회귀 **14/14** 통과(`/tmp/sol-handoff-progress-regression.log`). 변경 MJS 52파일 lint 오류0, rewards의 기존 경고2개 유지(`/tmp/sol-handoff-lint.log`). 기존 화면 lint 오류까지 모두 해소했다고 주장하지 않는다.
- 꿈 정책·융합 주체 이미지·전체 폼 이미지 감사 생성 결과의 `--check` 통과. 마지막 감사 자료에 backend가 새로 지원한 5폼 native alias를 반영했다. 이미지 자체의 기존 11개 보호 조건은 확대하지 않았다.
- 중복 비용이 큰 232개 양역할 실제 전투/codec/분리 검사는 담당자가 수행한 12/12 결과를 재사용했다(`/tmp/forms-r3-donor-final.log`). 이번 통합에서 다시 실행하지 않았다. 담당자별 63/72/80/59/36 등의 겹치는 부분 검사 수를 합산하지 않는다.
- 활성 도구 브라우저 6경로와 이미지 브라우저 결과는 각 QA에 기록돼 있다. 반복 자연 플레이는 추가하지 않았다. 전체 프로젝트의 최종 전체 테스트는 앞선 R2의 938/938 일반·Worker이며, 이번 R3 코드로 전체 재실행했다고 보고하지 않는다. 실기기·운영·200층 자연 플레이 검증은 별도다.

## 다음 일반 구현 순서

1. **이미지 5연결**: backend 지원을 마친 Xerneas active와 Ogerpon Tera 4폼. 원본 파일은 이미 있으나 일반 이미지의 이전 native guard 때문에 아직 fallback이다. 보호된 6폼까지 열지 않는다. 생성기/타입/정체성·대표 앞뒤 경계를 확인한다.
2. **Keldeo Resolute 1폼**: Secret Sword 학습/망각과 시작 파티/상대 초기화에 실제 연결한다. `rogue-classic-growth.mjs`의 queueClassicMoves/learnClassicPendingMove, rewards의 TM/Memory, state의 초기 파티를 함께 검토한다. 주체만 변형하는 원본 규칙·저장·분리를 검사한다.
3. **일반 도구 폼 52개**: Deoxys3, Dialga/Palkia/Giratina origin3, Shaymin1, Arceus17, Therian4, Genesect4, Hoopa1, Silvally17, Crowned2. 단독 변신의 기존 지원과 일반 융합 연결 미완료를 구분한다. Arceus/Silvally는 native held-slot 대신 별도 source modifier를 읽는 타입 어댑터와 NoFusion 규칙이 필요하다. Judgment/Multi-Attack/Techno Blast는 양쪽 source 정체성/폼을 따라야 하며 whitelist만 늘리지 않는다.
4. **Terapagos 2폼**: Tera Shift NoFusion/NoTransform, Tera Shell/Teraform Zero·능력치·패시브·수명을 실제로 연결한다.
5. **효과/이벤트/AI 차이**: 도구 충돌 중 Wide Lens/Quick Claw/Grip Claw는 source와 native 효과가 달라 동등 이전으로 취급하지 않는다. 호출 FOLLOW_UP의 아직 확인하지 않은 flinch/Truant/infatuation/disable은 결함 확정 없이 원본과 대조한다. AI의 전체 행동/대상 점수·실패/교체·RNG 차이와 복잡한 꿈/이벤트 조합은 남는다. 대표 재현·검사 중심으로 진행한다.

폼 잔량 **62 = 일반 구현 55(52+Keldeo1+Terapagos2) + 보호 6 + 최종보스 전용1**이다. 보호6은 획득 불가 Marshadow Zenith와 적 전용 Revavroom Starmobile5이며, Eternamax는 별도 보스 경로다. 이 7행을 플레이어 일반 획득/융합 기능으로 임의 활성화하지 않는다.

## 운영 조사 차단과 별도 검증

사용자는 뮤츠의 DOCTYPE/409가 `ebc6a8d` 배포 전 발생했으며 현재 해결됐다고 말했다. 마지막 확인된 사용자 배포는 ebc6a8d/Sites v58이다. 이후 배포를 추정하지 않는다. 운영 POST 409의 정확한 과거 원인 및 PC 지속 끊김은 아직 미확정이다. 현재 추가로 진행하려면 재발 시각·직전 행동·오류 번호와 같은 요청의 안전한 진단, 사용자 PC의 해당 구간 성능 기록이 필요하다. 원시 저장/계정/토큰을 요구하지 않는다. 이 차단 때문에 독립적인 일반 구현을 멈추지 않는다.

실기기/Safari·전체 200층·운영 동시 요청과 배포 후 회귀는 검증 잔량이다. 이미 완료된 검사를 이유 없이 반복하기보다 새 코드·실패·미해결 경계에 맞춰 검사한다. 기능 단위 완료 시 Git 저장 결과와 실제 미구현/부분지원/검증만 남은 항목을 구분해 보고한다.
