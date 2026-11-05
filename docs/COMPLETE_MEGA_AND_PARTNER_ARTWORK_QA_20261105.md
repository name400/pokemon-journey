# 메가 전체·변신폼·파트너 초상 원본 자산 확장

기준은 `816348d` 이후다. 원본 코드 `7c0881255af5cd51992e513ff93c2f71adbe40e0`, 자산 `fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba`를 고정했다. 이전 8메가 작업은 `REVIEWED_MEGA_TRAINER_ARTWORK_QA_20261105.md`의 역사적 결과이며 아래 범위가 추가됐다. 운영 API·저장·Sites 변경은 없다. PC 끊김 원인이나 해결을 주장하지 않는다.

## 이번 제품 연결

- 메가 88폼 추가로 고정 원본의 **96메가 폼 / 97 native 성별 식별**을 연결했다. 추가 파일879개/1,233,429바이트(PNG370개), 원본 해시·경로·개별 고지는 `data/rogue-additional-mega-asset-provenance.json`에 있다.
- 거다이맥스33, 원시회귀2, 울트라1, 무한다이맥스1의 **37변신폼**도 연결했다. 파일374개/1,120,854바이트(PNG160개), 근거는 `data/rogue-transformation-asset-provenance.json`이다. 두 묶음 추가 합계1,253파일/2,354,283바이트다.
- 일반/이로치/추가 색변종 앞·뒤 자산을 원본 바이트 그대로 설치했다. 334/373/384 메가는 앞쪽이 독립 색변종 atlas(type2), 뒤쪽이 팔레트 변형(type1)이므로 방향별 kind를 보존하도록 loader와 fusion sampler를 연결했다. 대부분 정적 자산이며 원본에 있는 다중 프레임만 기존 최대12프레임 추출 정책으로 재생한다.
- 정확한 species/form index/form key/native appearance를 확인한다. 일시적 변신 DTO는 동일 source species와 명시적 변신 플래그, 일치하는 battle appearance가 모두 있어야 새 atlas를 쓴다. 일반 다이맥스, 다른 종으로 변신한 모습, 모순된 플래그/식별자는 새 매핑을 받지 않는다. PokemonImage 및 BattlePanel의 이미지 경로만 변경했고 엔진·저장·도구 규칙은 변경하지 않았다.
- 새37변신폼의 융합 조합은 이번에 무조건 허용하지 않았다. 메가의 기존 검증된 fusion 경로는 확장했지만 전체 조합 전수 검증을 뜻하지 않는다. 특히 `15-mega`, `248-mega`, `445-mega`의 첫 프레임 원점이0이 아닌 일부 atlas는 기존 원본 팔레트 표본의 origin0 보호 조건 때문에 융합색 fallback이 남는다. 이 조건을 무시하거나 임의 색상을 생성하지 않았다.

## 트레이너와 파트너

기존에 설치된 rival_m/rival_f/bug_type_superfan PNG3개를 원본과 다시 대조했고 바이트 일치를 확인했다. manifest에 라이벌1–6 공용 성별 원본과 Bug Superfan을 명시적으로 연결했다. 현재272 trainer record 중271매핑, UNKNOWN1개만 미매핑이며 PNG284개 검증 실패0이다. 출처는 `data/rogue-existing-trainer-asset-provenance.json`이다.

원본 라이벌 JSON은 남녀 각각 **1프레임**이다. TrainerConfig도1–6차전이 동일 rival_m/rival_f를 사용하며 별도 표정 키가 없다. 존재하지 않는 표정 자산을 추가했다고 보고하지 않는다.

`scripts/generate-trainer-portrait-pairs.mjs`가 원본 hasDouble/doubleOnly, 명시된 partnerId, 기존 검증된 성별 이미지를 compact metadata로 만든다. BattlePanel은 실제 double variant에서만 레드·그린 같은 지정 파트너 또는 남녀 클래스 쌍을 표시한다. Twins 등 원래 한 장에 둘이 그려진 doubleOnly 초상은1장을 유지한다. 저장된 partnerId가 원본과 다르면 추가 인물을 붙이지 않는다. 상대 헤더와 등장 장면에만 적용하며 대사 화자·RNG·전투 상태·skip 타이머는 바꾸지 않는다.

이 helper가 읽는 기존 world export의 출처 표기는 `29441f7aa7482d9e816b253d324293788936dc3e`다. 해당48 trainer 구성의 hasDouble/doubleOnly/hasGenders/명시 partner를 현재 고정 코드 `7c08812`의 TrainerConfig와 다시 대조했고 차이0이었다. UNKNOWN을 제외한 성별 대응은 모두 있고, 복합1장 클래스에는 별도 합성 PNG를 만들지 않는다.

기존 고지를 유지하며 `/game/pokerogue/credits.html`에 추가 PNG의 고정 원본 경로/해시/개별 라이선스 표기를 확장했다. 원본 REUSE.toml에 일치하는 PNG 표기가 없으면 null이며 인접 JSON의 라이선스나 퍼블릭 도메인을 추정하지 않는다. 생성기는 `scripts/write-reviewed-artwork-credits.mjs`다.

## 검증

- 집중10/10: 추가 전체 파일 SHA-256/PNG 서명/프레임 경계,96메가 정체성·97 native, 앞뒤 variant 종류,37변신폼 식별·모순 차단,파트너 원본 구성·상태 무변경·생성기 재현.
- 실제 `applyClassicSourceForm(makeReferenceMon(...))` 결과37/37에서 이미지 라우트 일치. 기존 source-form/fusion-palette/trainer-variant17/17 통과.
- 1280px 및375px에서 메가 **1,552개**(각776) 단독 이미지의 실제 decoded frame과 방향/색상 loader 출력을 비교했다. 대표 fusion **88개**(각44)도 실제 바이트로 표시했다. 외부 일반종 Mew4파일은 동일 고정 commit의 원본을 로컬 route로 공급했고 이미지 대체 stub은 쓰지 않았다.
-37변신폼은 두 화면 크기에서 **592개**(각296) 단독 앞뒤/색상 출력 일치. 별도원본 로더 오류나 pageerror0.
- 실제 classic redesign CSS와 rc-shell을 적용한 헤더·등장 장면에서 Red/Blue, ACE 남녀, Twins의6경계,skip,이미지 decode,두 초상 비겹침,가로넘침 없음을 확인했다. 파트너만404일 때 그쪽만 일반인 fallback이고 주인물은 보존되는 경계1개도 통과했다. 이 화면 screenshot을 직접 확인했다.
- 기존8폼 브라우저 회귀도 최종 CSS 상태에서 두 화면 크기 각각72단독폼/38융합/14트레이너/실제 BattlePanel2개 및 atlas404·trainer404 fallback을 재확인했다. 이미지 전용 harness의 이전 CSS 누락은 harness에서 보완했으며 제품 결함으로 분류하지 않았다.
- 수정 helper/loader/generator/tests 타깃 lint 오류0. partners 테스트의 unused import 경고1건은 제거 후 재검사했다. 전체 type/build 및 공통 회귀는 부모 통합 QA를 따른다.

로그: `/tmp/all-artwork-{existing-tests,final-browser,final-lint}.log`, `/tmp/partner-artwork-browser.log`, `/tmp/transform-artwork-browser.log`. 결과·screenshot은 `.sites-runtime/tests/{all-mega-artwork,transformation-artwork,partner-artwork,reviewed-assets}/`. 재현 명령은 `tests/browser/reviewed-assets/README.md`에 있다. 전체 게임 자연진행·실물 기기·모든 융합 조합·운영 지연 검증을 대신하지 않는다.

## 다음 단위의 실재 잔량

`scripts/audit-rogue-form-artwork.mjs`의416개 non-base inventory는 local Mega96,local transformation37,기존 명시적 외부 source117,미검증 numeric/native fallback166으로 분리된다. 기계적 폼 지원 여부와 그림 지원 여부는 서로 다른 열이다.

동결 이후 다음 단위를 준비하며 남은 일반폼283개의 원본 `getFormSpriteKey`와 성별 공유 규칙을 대조했다.245공용 atlas 및7개 성별 차이를 포함하여 요청한2,415파일 모두 HTTP200,18,714,522바이트를 `/tmp/ordinary-form-assets`에 확보했다. **이 파일들은 이번 제품에 아직 연결하지 않았다.** 남은 일을 원본 자산 부재로 잘못 분류하지 않는다. classicNativeForm가 null인11개(Xerneas active,Marshadow zenith,Revavroom Starmobile5,Ogerpon Tera4)는 별도 native/전투 식별 지원을 확인해야 한다. 이를 제외한 일반폼 그림 연결과 공용 atlas·성별·fallback 회귀를 다음 묶음에서 계속한다.
