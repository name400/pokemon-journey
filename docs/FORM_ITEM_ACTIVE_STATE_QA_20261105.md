# 폼 도구 독립 활성 상태와 원본 발동 수명

2026-11-05. 현재 지원되는 지속 폼 도구 103키의 active 상태 모델을 실제 보상·파티 토글·DNA 이전·진화 복제·꿈 이벤트·저장 복구에 연결했다. 원본 기준은 `/workspace/pokerogue-reference`의 고정 커밋 `7c0881255af5cd51992e513ff93c2f71adbe40e0`이다. 운영 데이터/Sites/원격 Git은 이 작업에서 변경하지 않았다.

## 구현과 원본 근거

- 새 도전은 `formItemStateRule: 'source-v1'`을 저장한다. 소유 목록 `formItems`와 별도로 `formItemStates[boxId][itemKey]`에 boolean을 기록한다. 기존 도전의 marker를 자동 추가하지 않으며, marker 없는 저장은 기존 획득·수동 변신·이전 동작을 유지한다.
- `PokemonFormChangeItemModifier`의 `active`, `clone`, `getArgs`, `apply`와 `battle-scene.ts`의 `addModifier`/`tryTransferHeldItemModifier`를 대조했다. 획득은 활성화되고, 이전·복제는 원래 active 값을 유지한다. 다른 종에게 이전된 도구도 소유한 상태로 활성/비활성을 바꿀 수 있다. 실제 지원 폼·장비·포획 기록 검사와 중복 도구의 손실 방지 거부는 유지한다.
- 원본 `phase-manager.ts`의 `unshiftPhase`는 같은 동기 작업에서 추가한 phase를 FIFO로 실행한다. DNA의 여러 도구 이전 중에는 아직 변하지 않은 첫 번째 개체 폼에서 매번 전환을 선택한 뒤, 선택된 목표들을 FIFO 적용한다. 솔+울트라Z를 동시에 이전할 때 즉시 울트라로 연쇄 변신시키지 않는 회귀를 포함한다.
- 일반 진화는 원본처럼 도구를 다시 발동하지 않는다. 껍질몬 추가 생성은 개체별 소유·활성 기록을 독립 복사하고, 복제된 도구 추가 시점의 전환을 적용한다. 일반 진화의 새 상태 경로와 융합 진화는 복사본에서 검증한 후 반영한다.
- 꿈의 파티 변환은 교체되는 개체의 폼 도구와 활성 기록을 함께 제외한다. 대체 전투·거절은 유지한다. 새 개체 ID가 기존 활성 기록과 충돌하면 원본 파티를 변경하지 않고 거부한다. 무관한 기존 기록이나 다른 저장 슬롯은 삭제하지 않는다.
- 원본 파티 UI와 같이 활성 도구가 있으면 그것의 해제와 울트라Z만 제공하고, 울트라Z 활성 중에는 그것의 해제만 제공한다. 실제 폼 변화가 없는 독립 토글은 파티 버튼에 활성화/해제 이름만 표시한다.

## 확인한 Ultra 복귀 결함

기존 구현은 Ultra의 두 해제 전환을 같은 키로 중복 제거하면서 첫 번째 dawn-wings 전환을 선택했다. 따라서 dusk-mane 출신도 dawn-wings로 돌아갈 수 있었다. 원본 `triggerPokemonFormChange`는 활성 lunarizer 우선, 다음 solarizer를 검사한다. 새 모델은 이 규칙을 사용한다. marker 없는 기존 저장은 검증 가능한 `rogueUltraOrigin`이 있으면 해당 출신으로 복귀하며, 출신 기록이 없으면 기존 fallback을 유지한다. 원본 기록 없는 저장의 출신을 추측하지 않는다.

## 검증

- 신규 `tests/rogue-active-form-items.test.mjs` **13/13**: 실제 보상 선택, 두 활성값의 이전, 동시에 이전되는 도구의 순서, 외래 도구 토글, Ultra 두 출신, 일반 진화/껍질몬 복제, 꿈 3선택, 손상 기록 및 ID충돌의 원자적 거부, 새 run opt-in/legacy/다른 슬롯 보존, 실제 전투 복구와 분리. 한 테스트 안에서 검토된 item forward/해제 **137경로**를 순회한다.
- 기존 지속 폼·꿈·토중몬·남은 조건 진화 회귀와 합친 집중 검사: 표준 **36/36**, Worker **36/36**. 로그 `/tmp/astra-active-form-regression-final.log`, `/tmp/astra-active-form-worker-final.log`.
- 수정 모듈·신규 테스트·브라우저 harness ESLint: **0 errors**. rewards의 기존 미사용 변수 경고 2개 유지. 로그 `/tmp/astra-active-form-lint-final.log`.
- 실제 Page/API 격리 Chromium **6/6**: 375px/1280px × 외래 도구/Mega/Ultra의 해제→페이지 재접속→활성화. codec을 거친 POST와 저장 상태를 확인하고 가로 넘침/페이지 예외가 없음을 검사했다. `tests/browser/active-form-items`, 결과 `.sites-runtime/tests/active-form-items/results.json`, 화면 6장. 외부 그림은 stub이므로 자산 픽셀 검사가 아니다.
- 첫 브라우저 fixture는 interlude를 사용하여 앱의 정상 자동 다음 전투가 실행돼 파티 버튼이 잠겼다. 실제 보상 중 파티 메뉴로 fixture를 바꾼 후 위 6경로를 통과했다. 이를 제품 결함으로 오인해 자동 진행 코드를 바꾸지 않았다.

## 범위와 잔량

이 단위는 **이미 검토된 지속 폼 도구들의 독립 active 수명**을 구현한 것이다. 아직 허용되지 않은 Arceus/Memory/Plate 등의 일반 아이템 폼과 관련 native 타입·전용 기술 어댑터를 활성화한 것은 아니다. 다른 native 소지품 충돌, 미검증 특수 메타데이터, 원본 대비 모든 효과 조합은 별도 구현·검증 범위다. 과거 초과 소지품을 삭제하거나 손실 가능 이전을 허용하지 않는다. 전체 프로젝트 검사/타입/빌드는 통합 담당 기록을 따른다. 이전 운영 409/PC 끊김의 정확한 원인은 미확정 상태를 유지한다.
