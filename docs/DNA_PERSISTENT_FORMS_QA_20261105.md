# 지속 폼 융합·역변신·폼 도구·이상한 꿈

2026-11-05, 사파리 수정 `6037c54` 이후. 원본 고정 SHA는 `7c0881255af5cd51992e513ff93c2f71adbe40e0`이다. 사파리 긴급 작업 전에 보존한 `WIP persistent fusion forms before urgent safari recovery` stash를 충돌 없이 apply했고 사파리 파일은 변경하지 않았다.

## 구현 범위

`rogue-native-form.mjs`로 기존 변신 엔진의 native 매핑을 공유하고, 원본 폼과 네이티브 분류가 일치하는 폼만 양쪽 DNA 융합에 허용한다. 비기본 폼 **131개**: Mega88, Gigantamax33, Primal2, Ultra1, 종족 결합6(Kyurem/Necrozma/Calyrex), Urshifu Rapid Strike1. 기존 주체 Mega4폼이 이 88개에 포함되므로 추가 폼 수는127이다. 기존 검증 일반/특수60폼과 합쳐 지원하는 비기본 메타데이터 항목은191개다. 종 수나 모든 가능한 조합의 수가 아니다.

정확한 source ID/폼 index/key/native ID/플래그/기초 능력치·타입·특성 증명을 유지한다. Ultra는 기존 전환 규칙과 같이 Dawn Wings 또는 Dusk Mane origin을 요구한다. 손상 정보나 단순히 Mega/Gmax 플래그만 세운 저장은 허용하지 않는다. 두 번째 포켓몬의 소모·기술 선택·원본 폼 정보·분리 시 첫 번째만 남는 규칙과 손실 가능한 이전 전체 거부 정책은 유지한다.

원본 `field/pokemon.ts`의 `PlayerPokemon.fuse`는 기증자의 `formIndex/abilityIndex`를 보존하고 모든 held modifier를 `tryTransferHeldItemModifier`로 옮긴다. `PokemonFormChangeItemModifier`도 held modifier이며 수동 이전 불가와 fuse 이전은 별개다. `battle-scene.ts`의 이전 함수는 같은 종류 스택 한도를 검사한다. 여기서는 확인된 **98종 폼 도구 키**를 다른 종 사이에도 이전·소유 보존하며 중복/손상/알 수 없는 키는 소모 전에 전체 거래를 거부한다. 맞지 않는 종의 스톤은 소유하되 사용 후보는 해당 종의 원본 규칙으로 제한한다. 도구 목록에도 소유자와 이름을 표시한다. 분리 뒤 도구는 첫 번째 포켓몬에 남는다. 원본의 초과분 유실 가능 동작은 모방하지 않는다.

`species-data-registry.ts:96`의 자동 reverse 규칙을 따라 명시적 반대 방향이 없는 item 변신에 해제 조작을 만든다. `reverse:<item>`은 행동 식별자이고 실제 소유 키는 기존 item 문자열이다. 해제는 도구를 버리지 않고, 장비를 다시 요구하거나 신규 보상 도구로 추첨하지 않는다. 같은 item reverse가 둘인 Ultra는 원본 registry 순서의 첫 후보인 Dawn Wings를 선택한다. 원본의 inactive modifier 이벤트 대신 여기서는 파티 메뉴의 명시적 해제 조작과 저장된 폼으로 처리하며, 모든 자동 활성·비활성 이벤트를 동일하게 재현했다고 주장하지 않는다.

이상한 꿈은 기존 `weirdDreamFusionRule: validated-v1` 도전에서 검증된 지속 폼 융합을 처리한다. Gmax의 독립 파티 검증은 유지하고, 융합은 같은 DNA/form 증명·계산 HP 검증을 추가한다. transform은 원본처럼 새 비융합 파티로 교체하고 도구·기증자를 복원하지 않는다. battle/leave는 기존 융합·폼 도구를 유지한다. 미확인 native 도구, 손상 정보, 이전 도전의 규칙 표시는 임의 확대하지 않는다.

## 자동 검사

- `rogue-dna-persistent-forms.test.mjs`: 131폼×2역할의 실제 DNA 보상 후보/확인→기증자 소모→저장 codec→실제 native Splash 턴→다시 저장→게임 분리. 기초 특성·원본 폼·HP 계산, 다른 슬롯·탐험·재화 보존. Trace는 native `baseAbility`와 원래 특성을 비교하며 전투 중 복사한 특성은 `currentAbility`로 분리된다. 앞선 검사 실패는 이 구분을 하지 않은 테스트 기대값이었고 엔진의 영구 특성 덮어쓰기 결함은 재현되지 않았다.
- 융합 상태의 source item 정방향/자동 역방향 **129경로**, 도구 보존·복구·일반 폼 되돌림. Ultra의 origin과 첫 reverse 순서도 포함한다. 같은 종과 다른 종의 폼 도구 이전·중복 거래 원자성 및 Mega+Primal/Gmax+Ultra 등의 두 변형 파트너 실제 native 턴도 검사한다.
- 6분류×2역할의 손상된 폼/능력치/native ID/불법 플래그 및 불명확한 Ultra origin 거부. Mega Zygarde의 미지원 Complete 역변신은 분리 전 후보에서 제외하고, 분리 후에는 기존 standalone 변신으로 보존해 되돌릴 수 있다.
- `rogue-dna-persistent-dream.test.mjs`: Mega Alakazam, Primal Kyogre, Ultra Necrozma, Gmax Toxtricity, Rapid Gmax Urshifu ×2역할×3선택 =30경로. 확인/취소/실제 codec 복구/전투 턴/파티 교체·도구·다른 슬롯 보존과 손상/legacy/임시 Dynamax 거부.
- 실제 게임/파티 화면 `tests/browser/dna-persistent/`: 4화면×4분류=16경로, 터치/Enter·스크롤 hit test·폼 변경/해제·재접속·분리, 도구 표시·재화·다른 슬롯·탐험 보존, 오류·가로 overflow0. 외부 그림은 stub이므로 실제 이미지 자산 검증과는 구분한다.

## 미구현·부분 지원

네이티브 매핑이 없는 Magearna mega-original, Tatsugiri mega-curly/droopy/stretchy와 native Mega 분류가 일치하지 않는 Absol/Garchomp/Lucario mega-z 및 Meowstic mega는 계속 제외한다. 임시 3턴 Dynamax 융합, 이 목록 외 전투 중 자동 폼 변경과 진화·추가 개체 생성 조합도 별도다. Mega Zygarde의 Complete 중간형은 융합 상태로의 정방향/역방향을 지원하지 않아129경로에서 제외한다. 이미 Mega인 개체의 융합/전투/분리는 지원하고 역변신은 먼저 분리해야 한다.

미검증 도구 효과·opaque 기록·스택 초과·충돌하는 native 소지품은 계속 거부한다. source modifier의 개별 active 상태와 모든 자동 재활성 순서를 저장하는 완전한 modifier 모델은 아직 아니다. 미지원 이벤트/패시브/특성 변경 조합, 전체 전투 효과·원본 난수/AI 차이와 자산은 최신 잔량 목록에 남긴다. 비활성 원본 콘텐츠를 활성화하지 않고 탐험·Sites를 변경하지 않는다.

## 검증만 남은 범위

실계정 자연1~200·최종 보스/패배/재접속, 실기기 Safari/Android, 운영 동시 저장/장애·랭킹/대량 뽑기, 전 폼/도구/기술/특성/챌린지 조합 전수 및 원본 엔진 차등 검사. 이 자동 검사는 전체 원본 동등성이나 운영 배포 검증이 아니다.

지속 폼 확장 최종 검증: 전체 **745/745**(167.2초), 마지막 집중 **16/16**(4.9초), 타입·production빌드 통과. 실제 파티 화면4크기×4분류 **16/16**(변신/해제/reload/분리), 브라우저 오류·가로 overflow0. 변경 백엔드/테스트/harness 린트 오류0·기존경고2, diff 검사 통과. `/tmp/persistent-full.log`, `/tmp/persistent-final-focus.log`, `/tmp/persistent-type.log`, `/tmp/persistent-build.log`, `/tmp/persistent-browser.log`, `/tmp/persistent-lint.log`. 실계정·실기기·실제 자산·운영 배포 검증과는 구분한다. 승인 브랜치에 일반push 후 원격 SHA를 확인한다.
