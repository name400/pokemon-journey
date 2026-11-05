# 일반폼 원본 그림·성별 기증자·hash atlas 연결

이 문서는 `COMPLETE_MEGA_AND_PARTNER_ARTWORK_QA_20261105.md`의 다음 단위다. 부모가 R2 검증 스냅샷을 `/tmp/pokerogue-round2-check`로 분리한 뒤 작업했다. 원본 코드 `7c0881255af5cd51992e513ff93c2f71adbe40e0`, 자산 `fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba`는 동일하다. 운영 저장·API·Sites·원격 쓰기는 없다. PC 끊김이나 전체 게임 동일성을 해결했다고 주장하지 않는다.

## 실제 변경

일반 non-base283폼의 원본 `PokemonForm.getFormSpriteKey()`와 성별 규칙으로245개 공용 atlas 및7개 성별 분기를 확인했다. 요청한2,415개 원본 파일이 모두HTTP200이며18,714,522바이트다(PNG1,029개). `data/rogue-form-asset-provenance.json`에 각 파일 경로·SHA-256·크기·고정 commit·일치하는 개별 PNG 고지를 기록했고 바이트를 수정하지 않았다. 원본의 정적/다중프레임 자산과 원본이 제공하는 앞뒤 일반/이로치/색상 palette를 사용한다.

현재 native 식별이 지원되는272일반폼을 실제 PokemonImage/BattlePanel에 연결했다. Scatterbug/Spewpa 각19패턴은 별도 그림을 만들지 않고 원본과 같은 공용 본체를 사용한다. Zygarde10/10-PC,Complete/10-Complete도 원본 atlas 공유를 유지한다. 성별 차이가 있는7피카츄 폼은 saved gender에 따라 `female/` 경로를 고른다. source species/index/key와 native appearance가 모순되거나 성별이 불명확하면 이 매핑을 적용하지 않는다.

약어리 school 뒤쪽 `back/746-school.json`은 기존 두 배열 형식과 달리 filename→frame 객체를 쓰는 실제 Aseprite hash atlas였다. 파일이 있어도 배열 연산에서 실패하던 경로를 수정했다. 객체의 키를 filename으로 보존해 배열로 읽으며 기존 배열과 원본 trim/sourceSize는 바꾸지 않는다. 전체 원본의 bounding rectangle/PNG크기/trim rectangle을 검사했다. 원본 school 앞쪽 일부 frame에는 sourceSize보다 큰 padded cut rectangle이 있으므로 trim 범위는 원본 spriteSourceSize로 검사하며 자산을 임의 보정하지 않는다.

기존에 허용된 융합 기증자7성별폼이 `form.atlas`의 남성 경로를 고르던 누락도 수정했다. 이제 확인된 원본 폼·성별의 atlas를 선택하고 불명확한 성별/모순된 appearance는 거부한다. 기존 허용된 기증자 경로에 대한 이미지 수정이며 일반폼 주체·새 변신·획득·융합 자격을 추가하지 않는다. female form 경로를 안전한 숫자/폼-key 정규식에 포함했고 전체 atlas registry는 Map으로 조회한다. 팔레트 계산, source-origin 보호 조건, Worker, 캐시 상한/실패 제거 정책은 유지했다.

## 보호되는11폼

11개는 원본 파일이 실재하지만 이미지 selector의 native 목록을 비워 두어 자동 연결하지 않았다. 이유는 자산 부족이 아니다.

- Xerneas active1: 현재 source/native 시각 폼 별칭 연결을 기다린다.
- Marshadow zenith 및 Revavroom Starmobile5: 원본 unobtainable/trainer 전용 정책을 보존한다. 같은 기본 수치나 자산 존재만으로 일반 획득·융합을 허용하지 않는다.
- Ogerpon Tera4: native 이름은 존재하지만 실제 테라 수명과 연결한 뒤 정확한 DTO로 허용해야 한다.

정책 근거는 `NATIVE_FORM_GAP_AUDIT_20261105.md`다. 이미지 도우미가 전투 engine/native-form을 변경하지 않았다. 현재 non-base416개 inventory는 메가96+변신37+일반272의405개 local 연결과 이11개 local-artwork-awaiting-native-or-policy로 정리된다. 원본에서 없는 추가 색변종은 기존 기본 이로치+안내 fallback을 유지한다.

## 검증

- 신규4개 집중 검사:2,415파일 해시/PNG/3종 atlas 형식, 공유/성별 source key, 실제 `applyClassicSourceForm` DTO272/272 연결과 무변경,11개 차단,기증자7성별/모순 경계.
- 초기 일반폼 연결 후 기존/신규 합계30/30 통과. 추가 기증자 성별 수정의 기능 검사도 통과했으나 동시 진행 중인 다른 source/native 작업으로 palette 생성기 `--check`만 drift가 났다. 해당 소유자에게 전달했으며 최종 regeneration/전체 통합 결과는 부모 QA를 따른다.
- 실제 브라우저1280px/375px에서 일반폼4,464개(각2,232)의 이미지 src가 실제 원본 방향/색상 loader의 decoded frames 중 하나와 일치했다.272폼+7성별 추가 식별을 normal/shiny/추가 색변종2개×앞뒤로 검사했다.46배치 전체 pageerror0. 없는 추가 색은 원본 기본 이로치가 정답이다.
- 실제 기증자 원본으로 남녀·앞뒤·색상 fusion224개(각112)를 비교했다. 화면별 female 원본 요청70경로 확인,pageerror0. 일반종 Mew의4파일도 같은 pinned 원본 바이트를 공급했으며 synthetic sprite stub은 쓰지 않았다.
- 두 화면 크기에서 약어리 hash 앞→뒤 교체, 성별/색상 전환,reduced-motion 시 프레임 정지,`loading=lazy` 이미지 스크롤 후 표시를 검증했다. 실제 atlas404→placeholder 안내→재마운트 성공 복구도 확인했다. 이 lazy 검사는 img 속성과 표시 경계이며 현재 atlas loader의 네트워크 요청 자체를 viewport까지 지연시킨다는 주장은 아니다.
- 대표 원본 출력과 BattlePanel screenshot을 직접 확인했다. 기존8메가/트레이너/융합/404 browser 회귀도 다시 수행한다. typecheck 및 수정 파일 lint는 개별 로그에 기록하고 전체 build는 부모가 통합한다.

## 재현과 다음 한계

`tests/browser/reviewed-assets/README.md`에서 ordinary-forms / ordinary-boundaries / ordinary-fusion 실행 명령을 제공한다. 산출물은 `.sites-runtime/tests/{ordinary-artwork,ordinary-artwork-boundaries,ordinary-fusion-artwork}/`, 로그는 `/tmp/ordinary-{artwork*,fusion*}.log`다. 초기에 fixture module과 검사 script의 basename 충돌을 수정한 실패 회차는 성공 표본에 포함하지 않았다.

`scripts/audit-rogue-form-artwork.mjs --check`로 현재 목록을 재검사할 수 있다. 기존 credits를 보존하며 `/game/pokerogue/credits.html`에 이번 파일의 원본·해시·개별 고지를 추가했다. 일치하는 PNG 고지가 없으면 null이고 이용 허락을 추정하지 않는다.

모든 원본 fusion 조합을 검증한 것은 아니다. 첫 frame 원점이0이 아닌 atlas의 기존 palette 표본 보호 조건, 일반폼 주체의 기존 제한,11개 정책/수명 연결은 별도 잔량이다. 임의 그림·표정·색을 만들거나 전투 규칙을 이미지 작업에서 확대하지 않았다.
