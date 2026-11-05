# 신규 메가·트레이너 실제 원본 자산 — 2026-11-05

## 완료 범위

기준 작업은 `b0d661a` 이후이며 원본 코드 `7c0881255af5cd51992e513ff93c2f71adbe40e0`, 원본 assets `fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba`를 고정했다. 운영 저장·Sites·원격 저장을 변경하지 않았다. 이 자산 작업을 PC 끊김 해결로 간주하지 않는다.

앞서 수치/저장만 지원하던 메가8폼에 실제 앞/뒤·기본 이로치 이미지를 연결했다. PNG32개, atlas JSON32개, 원본 색변종 팔레트14개를 원본 바이트 그대로 로컬에 포함했다. 추가 트레이너 PNG14개까지 합계92파일/69,089바이트다. 파일별 원본 경로·고정 commit·SHA-256·크기·일치하는 개별 저작권 표기는 `data/rogue-reviewed-asset-provenance.json`에 있다.

| 원본 폼 | 정확한 atlas | 추가 색변종 |
|---|---|---|
| 앱솔 Mega-Z | 359-mega-z | 1/2 앞·뒤 |
| 한카리아스 Mega-Z | 445-mega-z | 1/2 앞·뒤 |
| 루카리오 Mega-Z | 448-mega-z | 1/2 앞·뒤 |
| 냐오닉스 Mega | 678-mega | 1/2 앞·뒤 |
| 원래 색 마기아나 Mega | 801-mega-original | 원본 masterlist에 없음 |
| 싸리용 Mega 휜/축 늘어진/쭉 뻗은 모습 | 978-mega-curly/droopy/stretchy | 각각1/2 앞·뒤 |

원본8폼은 모두 **1프레임 정적 자산**이다. 임의 애니메이션이나 이미지를 생성하지 않았다. 냐오닉스의 두 native 성별은 원본 `genderDiffs:false`에 따라 같은 메가 atlas를 쓴다. 새 암컷 이미지를 꾸며내지 않았으며, 저장된 성별과 native ID가 모순되면 새 매핑을 적용하지 않는다. 마기아나 추가색은 원본에 없어 기본 이로치+기존 안내로 돌아간다.

## 실제 연결

이 자산들의 JSON은 최상위 `frames` 배열이다. 기존 loader는 `textures[0].frames`만 읽어 이미지가 있어도 추출할 수 없었다. 검증된 두 JSON 형식을 읽도록 하고, 새8폼만 고정 로컬 경로를 사용한다. 앞/뒤와 이로치·색변종별 cache key 및 실패 시 cache 제거 정책을 보존한다.

정확한 source species/form index/form key와 native appearance를 함께 확인한다. 변신과 무관한 종이나 불일치한 저장, 미검증 메가/거다이맥스는 기존 fallback을 유지한다. BattlePanel이 먼저 다른 외부 GIF로 빠지지 않도록 이 검증된 메가는 PokemonImage의 원본 atlas 경로를 사용한다. 도감/파티 이미지와 battle에서도 같은 매핑을 사용한다.

새 메가가 주체 또는 기증자인 융합 색상 경로를 열었다. 검증된 메가끼리, 메가+기존 지원 일반종/기증자 폼은 기존 팔레트 Worker를 그대로 사용한다. 정상/이로치/원본 색변종의 앞·뒤 표본으로 계산한다. 전투 수치·도구·폼 선택·저장 engine은 변경하지 않았다. 모든 종 조합을 전수 이미지 검사한 것은 아니며 미검증 변신과 없는 팔레트는 계속 fallback이다.

## 트레이너

원본 `TrainerConfig.getSpriteKey`의 enum identity와 명시적 `_m/_f`를 근거로 다음14 PNG를 연결했다.

- 기본 미매핑12개: 괴짜자매, Aliana, Celosia, Macro Grunt 남성, Victor/Victoria/Vivi/Vicky/Vito, Expert Pokémon Breeder, alternate player 남/녀.
- 누락 성별2개: Macro Grunt 여성, Bird Keeper 여성.

상대가 비슷해 보인다는 이유로 다른 캐릭터를 대입하지 않았다. 라이벌 Finn/Ivy 기본 원본 연결은 이전 작업을 보존한다. 새로운 라이벌 표정이나 존재를 확인하지 않은 double 합성 초상은 추가하지 않았다. 트레이너 manifest는281 PNG/272 source trainer record이며 `--verify` 실패0. 기존 Showdown 생성기에 pinned merge를 추가하여 재생성 때 이번 매핑이 사라지지 않도록 했다. 부모가 Winstrate 이벤트의 직접 fallback 지점도 이5인 manifest로 연결하고 실제5연전의 각 라운드 src 검사를 수행했다.

원본 PNG를 contact sheet로 직접 확인했다. Aliana/Celosia의 개별 원본 표기는 `2026 Red / CC-BY-NC-SA-4.0`다. 다른 파일에 일치하는 개별 PNG 표기가 없으면 null로 남겼고 인접 JSON의 라이선스를 추정 적용하지 않았다. 기존 `/game/trainers/pokerogue-credits.html` 고지를 보존하면서 `/game/pokerogue/credits.html`에 새46 PNG의 원본 경로/해시/개별 고지를 연결했다. 생성기는 `scripts/write-reviewed-artwork-credits.mjs`다.

## 검증과 한계

- 신규 집중4/4:92파일 hash/PNG와32 atlas 형식,8폼9 native·성별×앞뒤/이로치,메가 양쪽 융합 및 미지원 차단,트레이너 원본/여성 매핑 및 manifest 재생성 일치.
- 기존 source-form/fusion-palette/trainer-variant17/17 통과. 최초 이미지 코드 타입 검사 통과; 최종 전체 type/build는 부모 통합 기록을 따른다.
- 실제 브라우저1280px/375px 각각 단독폼72,융합38,트레이너14,실제BattlePanel2이미지 검사. normal/shiny/색변종 픽셀 출력 차이,냐오닉스 암수 공용 이미지,마기아나 없는 변종 fallback을 확인한다. 원본을 대체하는 이미지 stub은 사용하지 않았다. 외부 일반종 Mew 앞뒤4파일도 같은 고정 commit의 실제 바이트를 읽어 메가/일반종 양쪽 융합을 검사했다.
- 원본 atlas404와 trainer PNG404에서 기존 placeholder/일반인 fallback을 확인한다. 브라우저 pageerror0. 실제 화면 screenshot과 원본 contact sheet를 직접 검토했다.
- 새/수정 이미지 loader·helper·generator·tests 타깃 ESLint 오류/경고0. 기존 PokemonImage/BattlePanel의 기존 lint 진단은 통합 기준 비교를 따른다.

재현: `tests/browser/reviewed-assets/README.md`. 로그는 `/tmp/reviewed-assets-{new-tests,existing-tests,browser,lint}.log`, 산출물은 `.sites-runtime/tests/reviewed-assets/{results.json,1280.png,375.png}`다. 실제기기·운영 저장·200층 자연 플레이·모든 융합 조합 전수 검사는 이번 범위가 아니다. 원본 자산 다운로드 성공은 신규 메가8폼에 대한 과거 네트워크 미확인 상태를 해소했지만, 다른 미확인 폼/라이벌 표정/파트너 초상과 운영 PC 끊김은 별도로 남는다.
