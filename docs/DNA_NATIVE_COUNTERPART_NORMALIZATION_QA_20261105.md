# Native 도구와 원본 modifier 대응·정규화

2026-11-05. 고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 실제 도구 클래스/상수와 native 엔진 효과를 대조했다. 새 DNA 거래의 복사본에서 타입 강화 18종과 기합의머리띠·초점렌즈를 원본 modifier로 정규화한다. 기존 저장 로드나 진행 중 전투를 일괄 변환하지 않는다.

## 실제 대응 inventory

| 원본 분류 | native ID → modifier | 원본 효과·한도 | 이번 처리 |
| --- | --- | --- | --- |
| AttackTypeBoosterItem | silkscarf→Normal, blackbelt→Fighting, sharpbeak→Flying, poisonbarb→Poison, softsand→Ground, hardstone→Rock | 같은 타입 위력 `1 + 0.2 × count`, 타입별99 | 양쪽 native를 각각1개로 합산 |
| AttackTypeBoosterItem | silverpowder→Bug, spelltag→Ghost, metalcoat→Steel, charcoal→Fire, mysticwater→Water, miracleseed→Grass | 위와 동일 | 위와 동일 |
| AttackTypeBoosterItem | magnet→Electric, twistedspoon→Psychic, nevermeltice→Ice, dragonfang→Dragon, blackglasses→Dark, fairyfeather→Fairy | 위와 동일 | 위와 동일 |
| SurviveDamageModifier / FOCUS_BAND | focusband→focusband | 생존 확률 count/10, 최대5 | 양쪽 native를 합쳐 한 번의 판정으로 정규화 |
| CritBoosterModifier / SCOPE_LENS | scopelens→scopelens | 급소 단계+1, 최대1 | 혼합 소지품 이전 지원. 렌즈2개는 소모 전 거부 |
| 기존 회복 도구 단위 | leftovers / shellbell | 기존 QA의 source cap4 | 기존 손실 없는 이전 유지; 새 공통 cap 확장으로 분기가 넓어지지 않도록 회복2종을 명시 |
| 같은 이름이지만 효과 차이 있음 | widelens | 원본 +5 명중률/중첩, native ×1.1 | 등가 변환 미구현 |
| 같은 이름이지만 효과 차이 있음 | quickclaw | 원본 10%/중첩, native20% | 등가 변환 미구현 |
| 같은 이름이지만 효과 차이 있음 | gripclaw | 원본 타격 시 도구 훔치기, native 구속 지속 연장 | 등가 변환 미구현 |
| 이 원본 modifier 대응 없음 | lifeorb | source modifier/type 데이터에서 대응을 찾지 못함 | 가짜 modifier를 만들지 않음. 한 native 슬롯으로 보존 가능한 조합만 유지 |
| 별도 폼 도구/효과 | Plate/Memory/Drive 등 | 일반 타입 강화18종과 구분 필요 | 타입 도구로 바꾸지 않음. 기존 native 이전 제한 유지 |

18종 표는 실행에 사용하는 `lib/rogue-native-type-boosters.mjs`의 정확한 whitelist다. 원본 근거는 `modifier-type.ts`의 AttackTypeBoosterItem enum, `constants.ts`의 TYPE_BOOST_ITEM_BOOST_PERCENT=20, `modifier.ts`의 AttackTypeBoosterModifier/SurviveDamageModifier/CritBoosterModifier다. 이름이 비슷한 incense나 plate를 자동 별칭으로 추정하지 않는다.

## 처리와 보존

- 첫 번째와 두 번째 개체의 해당 native 슬롯을 모두 비우고, 기존 같은 타입/도구 modifier 수량과 합산한다. 한 native를 남기면 1.2×1.2=1.44배가 되므로 양쪽을 처리한다. 실제 native BasePower 이벤트에서 정규화2개는140, 잘못 남긴 native1+modifier1은144로 구별되는 것을 18타입 모두 확인했다.
- 같은 타입 외의 수량은 합치지 않는다. 타입별99, 머리띠5, 렌즈1 한도를 넘거나 비정상 수량·알 수 없는 메타데이터·이전 금지 표시가 있으면 거래 전체를 거부한다. 기존 donor snapshot은 원래 개체와 native 도구를 그대로 보관하며, 실제 donor 소유품을 중복 복원하지 않는다.
- 정규화 뒤에도 보상·직접 지급·Fiery 자동 지급·수동 이전·Thief/Trick·Grip Claw·Mini Black Hole·Pickup의 공통 한도가 native와 modifier 합계를 센다. 타입 강화는 정확히 같은 타입끼리 계산한다. 초과 상태의 추가 획득은 막지만 기존 수량을 삭제하지 않으며 다른 개체로 옮겨 줄이는 행동은 허용한다.
- 기존 raw native+modifier 저장은 codec/조회만으로 바꾸지 않는다. 기존 위력144를 유지하는 것을 검사했다. 정규화는 새 DNA 거래의 의미 있는 효과 변경이다. 예전 초과 소지품도 그대로 읽고, 보존 불가능한 새 거래만 거부한다.
- 생명의구슬 등은 원래 native 효과를 유지한다. 예를 들어 목탄을 modifier로 바꿔 생명의구슬을 native 슬롯에 유지할 수는 있지만, 생명의구슬2개를 임의의 source stack으로 바꾸지는 않는다. 기존 첫 번째 개체의 Plate도 그대로 유지하며 타입18종의 동등성으로 주장하지 않는다.

## 검증

- `rogue-dna-native-type-boosters.test.mjs` **5 tests**: 18×18=324쌍의 원자적 이전·수량 보존; 실제 DNA 보상/codec/분리의 같은 타입18+다른 타입18조합; 위력140/144 대조; 저장 후 실제 연속 전투·Magic Room; cap99·손상 메타데이터·legacy 초과 보존·미지원 native 충돌.
- `rogue-type-booster-acquisition-cap.test.mjs` **3 tests**: native/modifier ×98/99/100개에서 Grip Claw/Black Hole/Pickup, 실제 Thief/Trick, 보상/직접 지급/자동 지급/수동 이전. 막힌 Pickup은 다시 추첨하지 않고 원래 소유품을 유지한다.
- `rogue-dna-native-battle-items.test.mjs` **4 tests**: 실제 보상/저장/분리, 두 머리띠가 native 전투의 피해 처리에서 정확히 한 번 `[2,10]` 확률 판정 후 HP1로 생존하고 복구되는 경로, 렌즈 급소단계+1, 렌즈2개 및 초과/손상 원자적 거부, 이후 native 획득 한도와 legacy 보존.
- 이전 회복2종/획득 cap/active 모델/Grip Claw/Pickup/수동이전/Fiery 회귀까지 합친 집중 검사: 표준 **59/59**, Worker **59/59**. 로그 `/tmp/astra-native-normalization-standard.log`, `/tmp/astra-native-normalization-worker.log`.
- 수정 helper/모듈/신규 test ESLint **0 errors**, rewards 기존 경고2개 유지. 로그 `/tmp/astra-native-normalization-lint.log`.

## 남은 범위

동명인데 효과가 다른 native 도구를 원본 도구로 바꾸는 정책·구현은 아직 하지 않았다. source counterpart가 없는 도구의 임의 등가 모델, source와 native의 모든 피해 반올림·도구 소지 여부 참조 기술/특성 조합까지 동등성 검증한 것은 아니다. 기존 BasePower modifier adapter의 계산 체계는 그대로 사용한다. 새 UI 화면을 추가하지 않았으며 이 단위는 브라우저 검사를 다시 수행하지 않았다. 전체 통합 검사/타입/빌드는 root 기록을 따른다. 운영/Sites/원격 Git 변경 없음. 과거 409/PC 끊김 정확한 원인은 계속 미확정이다.
