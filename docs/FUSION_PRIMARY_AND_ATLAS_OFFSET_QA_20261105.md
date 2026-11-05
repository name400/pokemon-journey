# 일반폼 융합 주체·packed atlas 좌표·성공 tooltip

R3 일반폼 이미지 이후의 렌더러 후속 단위다. 게임/저장/획득 권한이나 palette 계산식을 변경하지 않았다. 원본 자산 commit은 `fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba`이며 원본 PNG·JSON 바이트를 수정하지 않았다. 운영 서비스·Sites·원격 쓰기는 없다.

## 재현과 수정

기존272일반폼을 실제 `applyClassicSourceForm → previewClassicDnaFusion`으로 검사했을 때213폼은 게임이 융합을 허용했지만 UI의 `classicFusionPaletteTarget`가 non-base 주체를 일괄 거부했다. 이 경로를 원본 이미지 정체성과 실제 게임 허용 결과를 교차한 작은 metadata로 연결했다. 생성기는 `scripts/generate-fusion-primary-artwork.mjs`, 제품 목록은 `data/rogue-fusion-primary-artwork.json`이다. 게임 권한을 설정하는 파일이 아니며 source id/index/key/native/id가 맞는 기존 융합 결과의 이미지에만 적용한다.

동시에 진행된 backend 변경으로 마지막 생성 시 Meloetta Pirouette(648:1), Ogerpon 일반 마스크3(1017:1/2/3)가 기존 게임 허용 결과에 추가됐다. 기존213행 변경/삭제는0이고 최종 **217허용/55거부**다. 신규4행만 추가 화면 검증했다. Ogerpon Tera4를 허용한 것은 아니다.

`15-mega`, `248-mega`, `445-mega`는 첫 frame이 PNG의0,0에 있지 않아 기존 origin0 보호 조건에서 fallback이었다. 실제 crop 코드는 좌표를 지원하고 있었으므로 단순히 검사를 제거하지 않고 `checkedAtlasFrame`으로 정수/양수/회전/PNG 바깥 좌표/trim 범위를 검사한다. 유효한 source rect를 캔버스0,0으로 정확하게 복사한 뒤 그 픽셀을 읽는다. 잘못된 좌표는 계속 null/fallback이다.

원본 코드 `pokemon.ts`는 crop을0,0에 그린 뒤 `getImageData(frame.cutX,frame.cutY,...)`로 읽는다. 새 처리는 packed 좌표의 이중 적용을 재현하는 대신 실제 sprite crop을 읽는 renderer 보정이다. 따라서 nonzero offset에서 원본의 빈/잘린 표본까지 동일하다고 주장하지 않는다. 기존 origin0 표본과 seeded palette 알고리즘은 유지했다.

실제 화면 검증 중 정상 색변종 fusion12개에 '변종 이미지를 불러올 수 없어 기본 이로치' tooltip이 남는 결함도 발견했다. `fusionSource`가 성공한 경우 일반 form/variant 실패 문구를 평가하지 않도록 PokemonImage의 조건만 좁게 수정했다. 실패한 융합/없는 변종의 안내는 유지한다.

## 검증

- 최초213폼의 주체×앞뒤×1280/375px **852출력**, 추가4폼의 같은 경계 **16출력**, 최종217폼 **868출력**. 실제 PNG와 frame loader 결과를 비교했고 pageerror0이다. 최종4행은 `/tmp/r4-primary-artwork-before.json`과의 비교에서 추가만 확인됐다.
- 세 packed Mega의 실제 PokemonImage normal/shiny/색변종2×주체/기증자×앞뒤는 각 화면48개, **총96출력**. 정상 이미지에 실패 tooltip이 없음을 확인했다. screenshot을 직접 검토했다.
- 제품 원본과 별도로 테스트용 atlas12개를 원본 픽셀 그대로 재배치했다. 원본 첫 frame을0,0에 두고 나머지 frame도 옮긴 canonical atlas와 원본 packed atlas의 **48조합/440 출력 frame이 완전히 일치**했다. 제품 파일은 변경하지 않았다. 원본이 아닌 새 그림을 대체해서 검사한 것이 아니다.
- 잘못된 source rectangle16조합은 모두 null/fallback. 순수 geometry 검사도 negative/fractional/out-of-image/rotated/empty/invalid-trim을 거부한다.
- 신규3집중 + 관련 image/source/trainer 회귀 합계25/25를 최종217행으로 통과했다. typecheck와 새 helper/generator/harness lint도 통과했다. 기존8메가 브라우저 회귀는 두 화면 각각72단독폼/38융합/14트레이너/실제BattlePanel2개 및 atlas/trainer404 fallback을 통과했다.
- 다른 source/native 작업 중 palette metadata drift는 해당 소유자가 재생성했다. 최종 두 생성기 `--check`와 기존 palette 회귀9/9도 통과했다. 위25개와 합계34/34이며 typecheck/타깃lint/diff 검사도 통과했다. 전체 test/build는 부모 통합 QA를 따른다.

재현은 `tests/browser/reviewed-assets/README.md`. 산출물은 `.sites-runtime/tests/{primary-fusion-artwork,primary-fusion-delta,offset-fusion-artwork}/`. 로그는 `/tmp/fusion-primary-artwork-*.log`, `/tmp/fusion-primary-delta-browser.log`, `/tmp/offset-fusion-browser.log`다. 첫 negative-route 회차가 shiny URL을 차단하지 못한 harness 오류와, 성공 tooltip 결함을 찾은 실패 회차는 최종 통과 수치에 포함하지 않았다.

## Sol 후속 인수인계

이미지 제품 코드는 이 단위에서 동결한다. Xerneas active의 backend alias/수명은 별도 담당자가 확인했지만 이 이미지 단위는 아직 적용하지 않았다. 후속은 `data/rogue-reviewed-form-atlases.json`의716:1 native를 `xerneas`로 연결하고 실제 DTO(id30132,source716,index1,keyactive),앞뒤/색상/주체 palette를 검사한 뒤 관련 inventory/permission/fixture를 재생성하면 된다. 관련 tests의272/11 및217/55 수치도 그때 갱신한다.

마지막 인수인계 때 별도 담당자가 Ogerpon Tera4의 native alias/실제 테라 수명/저장/양쪽 fusion 역할 검증도 완료했다. 그림 metadata는 아직 비어 있으므로 Sol 후속에서 source1017 index4..7의 `teal/wellspring/hearthflame/cornerstone-mask-tera`를 각각 `ogerpontealtera/ogerponwellspringtera/ogerponhearthflametera/ogerponcornerstonetera`와 실제 DTO로 교차 연결할 수 있다. source unobtainable6(Marshadow zenith,Starmobile5)은 계속 보호한다. 원시/울트라/거다이의 기존 fusion renderer 제한,전체 종 조합,실기기 및 운영 PC 끊김은 별도 잔량이다. 이번 결과로 운영 끊김 해결을 주장하지 않는다.

출처 metadata의 중복 path 배열은 별도 metadata-only 수정으로 정규화했다. 원본 `images/REUSE.toml` 전체274,140바이트는 `data/rogue-asset-attribution-REUSE.toml`에 그대로 있고 각 attribution은 원본 annotation index와 동일 author/license/관련 path를 가진다. 추가Mega80,618,151→329,224바이트,변신61,335,269→163,823바이트,일반폼383,734,387→1,024,790바이트로 줄였다. R2 snapshot의두파일도 같은 처리이며 source asset hash검사 R2 10/10,main일반폼4/4를 통과했다. 크레딧 소비 필드는 유지했다.
