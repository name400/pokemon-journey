# 스텔라 지연 공격의 타입 사용 이력 보완

기준은 `b0d661a`, 원본은 `7c0881255af5cd51992e513ff93c2f71adbe40e0`이다. 전투4번 잔량 중 Future Sight(미래예지)·Doom Desire(파멸의소원)의 실제 지연 타격과 타입 이력 누락을 수정했다. `lib/rogue-stellar-adaptability.mjs`와 신규 집중 검사만 변경하며 engine/state/game의 공통 파일은 건드리지 않았다. Sites·운영 저장·Git 원격·commit 작업은 수행하지 않았다.

## 원본과 실제 재현

원본 `src/phases/move-effect-phase.ts`의 `start`는 `DelayedAttackAttr`의 대기 효과가 원래 기술을 override하면 phase를 끝낸다. 이 대기 단계는 공격 타입을 소모하지 않는다. 이후 `src/data/positional-tags/positional-tag.ts`의 `DelayedAttackTag`가 `MoveUseMode.DELAYED_ATTACK`으로 실제 `MoveEffectPhase`를 만든다. 그 단계의 `postAnimCallback`은 효과 적용이 끝나면 공격 기술 타입을 테라스탈 이전에도 `stellarTypesBoosted`에 기록한다. 피해가 면역으로0이어도 해당 단계를 완료하면 기록한다. 소스/대상이 없어지거나 대상이 기절·자기 자신이면 tag가 실제 공격 단계를 만들지 않는다.

기존 v2는 일반 완료 공격의 native `AfterMove`를 통해 이력을 기록하면서 futuremove를 대기 단계로 보고 제외했다. 그러나 native 지연 조건의 실제 타격은 `AfterMove`를 거치지 않는다. 이에 다음을 실제 전투에서 재현했다.

- 테라 전 미래예지를 예약하고3턴 후 해피너스에게 피해를 준 뒤에도 Psychic 이력이 비어 있었다. 이후 스텔라 에스퍼 공격이 소모된 일회 보너스를 다시 받을 수 있었다.
- 이미 스텔라인 상태에서 미래예지 대상 슬롯이 블래키로 교체돼 면역이 되면 Psychic 이력이 비어 있었다.

native가 스텔라 피해 계산을 수행하면 자체 이력을 기록하므로, **이미 스텔라인 모든 지연 타격이 실패했다는 주장은 아니다**. 핵심 누락은 테라 전 실제 타격과 피해 계산까지 가지 않은 완료 공격이다.

## 구현과 데이터 보존

기존 `adaptabilityRule: source-subset-v2` 내부에서만, 실제 native 지연 타격 진입인 `trySpreadMoveHit(..., notActive=true)`를 감싼다. ID는 미래예지/파멸의소원이고 futuremove인 공격 기술로 제한한다. 원래 처리기가 정상 반환한 뒤 실제 기술 타입을 중복 없이 기록한다. 예약은 기록하지 않으며 원래 처리 도중 예외가 나면 기록하지 않는다. 기절/소실/자기 대상이 실제 타격 이전에 취소된 경로도 기록하지 않는다.

기존 `stellarBoostedTypes`와 전투 snapshot/codec을 사용하며 새 저장 schema나 run flag를 추가하지 않는다. v1·규칙 없는 도전과 전역 Dex의 기술 자료는 그대로다. 이미 계산된 과거 피해/보상이나 이력이 없는 옛 결과를 소급 복원하지 않는다. 현재 v2의 원본 일회 소비 의도에 맞춘 누락 보완이다.

## 검증

신규 `tests/rogue-stellar-delayed-called.test.mjs`9개와 기존 Stellar15개를 함께 검사한다.

- 미래예지·파멸의소원의 예약/중간 턴/실제 타격 각각의 encode/decode 복구. 테라 전 실제 사용 이력 뒤 스텔라의 적응력 Psychic2배·비원래 타입 Steel1배를 비테라 STAB 고정 대조군과 비교.
- 예약 후 테라스탈하면 실제 타격에서 첫 보너스2.25배가 적용되고, 예약 중 다른 Psychic 공격이 먼저 소모하면 지연 타격에는 반복 배율2배 적용.
- 대상 슬롯의 블래키 교체로 면역이 돼도 실제 시점에서만 소비. 양쪽 진영 동일 처리.
- 실제 손가락흔들기(Metronome)가 미래예지를 호출하면 Normal/예약 타입을 먼저 소비하지 않고 실제 공격 시 Psychic만 기록.
- 더블에서 예약한 대상이 실제 지구던지기로 기절한 뒤 저장/복구해 지연 공격이 취소될 때 Psychic 소비가 추가되지 않음. 생존한 다른 상대와 이미 사용한 Fighting 이력은 유지.
- 공격자를 대기 파티로 교체하고 저장/복구해도 실제 지연 타격의 이력은 원래 공격자에게 기록하며 새 출전 개체에게 옮기지 않음.
- 실제 `playClassicCombat` 명령과 저장 codec 왕복, 일반화(Normalize)의 실제 Normal 타입, 처리 도중 강제 예외의 미소비, v1/무룰과 전역 기술 데이터 보존.
- 저장 경계에서 다른 슬롯·탐험·재화 보존.

최종 표준 집중 **24/24**(약5.4초), Worker 정책 집중 **24/24**(약5.1초), 변경 파일 ESLint 오류/경고0, diff 공백 검사 통과. 근거는 `/tmp/stellar-delayed-final-focus.log`, `/tmp/stellar-delayed-final-worker.log`, `/tmp/stellar-delayed-final-lint.log`다. 전체 프로젝트 통합 회귀·타입·빌드는 root가 다른 병렬 변경과 함께 검사한다.

## 완료와 남은 범위

완료는 위 두 지연 기술의 v2 사용 이력과 검증된 Metronome 호출 경로다. 모든 호출 기술, 모든 대상 소실/방출/포획/자기 슬롯 교환, 추가 연타 도구·폼·타입 변환·패시브/특성 조합, source와 native의 지연 공격 자체 피해/시점/소스 기절 정책 전수 동등성까지 완료한 것은 아니다. 이 작업은 native의 대상 선정/타격 일정/피해 파이프라인을 바꾸지 않는다.

실계정·실기기·자연200층·운영 배포 검증은 별도다. 앞서 보고된 운영409와 PC 지속 끊김 원인은 이 변경으로 재현·해결됐다고 보고하지 않는다.
