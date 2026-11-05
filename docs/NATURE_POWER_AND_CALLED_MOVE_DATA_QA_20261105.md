# Nature Power와 호출 기술의 전투별 데이터 보완

기준은 `816348d` 이후 작업 트리이며 원본은 `pagefaultgames/pokerogue`의 `7c0881255af5cd51992e513ff93c2f71adbe40e0`, native 전투기는 `@pkmn/sim 0.10.12`이다. 이번 단위의 제품 소유 파일은 `lib/rogue-nature-power.mjs`와 `lib/rogue-move-balance.mjs`다. run/combat 플래그 및 engine 설치 연결은 root가 통합했다. Sites·운영 저장·Git 원격·commit 작업은 이 담당자가 수행하지 않았다.

## 확인한 차이와 변경

### Nature Power

원본 `src/data/moves/move.ts`의 `NaturePowerAttr.getMoveId`는 지형이 있으면 전기/풀/사이코/미스트에 따라 각각 10만볼트/에너지볼/사이코키네시스/문포스를 호출한다. 지형이 없으면 원본 35개 바이옴별 기술을 호출한다. 기존 native는 지형이 없을 때 모두 트라이어택을 사용했다.

앱의 `run.biome`, 전투의 `combat.biomeId`, `world.biomes`는 원본의 비연속 숫자 enum을 그대로 사용한다. 원본 enum 이름→ID와 앱 바이옴의 이름을 35개 모두 대조했고, 이를 기준으로 매핑했다. 새 도전의 `naturePowerRule: source-biome-v1`만 활성화한다. 기존/무표시/알 수 없는 바이옴 저장은 기존 native 동작을 유지한다. 저장 schema나 과거 전투 결과를 소급 변경하지 않는다.

새 helper는 전투에 한정된 Nature Power Move를 만든다. 실제 발동 시점의 지형과 전투 바이옴을 조회하며, 호출 대상은 현재 전투 Dex의 Move 객체로 전달한다. 따라서 Silver Wind의 원본 wind 플래그 등 기존 전투별 보정도 유지한다. 전역 Dex를 수정하지 않는다.

### Metronome·Sleep Talk·Copycat·Dancer의 데이터

기존 전투별 Dex에서 Slash의 위력이 80으로 조회돼도, 실제 손가락흔들기·잠꼬대가 문자열로 Slash를 호출하면 native 생성 시점의 Dex에 남은 70으로 실행되는 차이를 재현했다. Dancer의 Revelation Dance 복사도 원본 보정 100 대신 90으로 실행됐다. Dragon Claw의 slicing, Silver Wind의 wind 플래그도 문자열 호출에서 사라졌다.

원인은 native `BattleActions.dex`가 전투별 Dex 설치 전에 캡처된다는 점이다. `moveBalanceRule` v1/v2 또는 `moveFlagRule` v1이 있는 전투에서만 `actions.useMove`와 `actions.runMove`의 문자열 인자를 현재 전투 Dex의 Move 객체로 정규화한다. 제공된 Move/ActiveMove 객체와 나머지 인자는 그대로 전달하며 native의 사용/트리거 처리기는 한 번만 실행한다. 재설치 시 wrapper를 추가하지 않는다. 무표시 도전의 native 메서드는 그대로다.

이는 기존 보정 자료의 실제 호출 연결 수정이다. Metronome의 후보 목록·원본 난수 알고리즘 또는 모든 호출 기술의 성공 조건을 원본과 같게 구현했다는 의미는 아니다.

## 검증

`tests/rogue-nature-power.test.mjs` 7개:

- 35개 바이옴 enum/이름과 실제 호출 기술·피해 대조.
- 네 지형의 우선순위와 전투 중 지형 변경/해제.
- 실제 Classic 명령, 저장 codec 왕복, run/combat 규칙 보존, 호출자 PP만 소비.
- 적 측 발동과 더블의 Lava Plume이 아군 및 상대 둘에게 적용되는 경로.
- 호출된 Scald의 실제 Water 스텔라 이력 및 이미 소비한 보너스와 STAB 대조군.
- 호출된 Silver Wind의 원본 wind 플래그, 전역 Dex 보존.
- 기존/무표시/알 수 없는 바이옴은 native Tri Attack, 새 도전만 opt-in.

`tests/rogue-called-move-data.test.mjs` 8개:

- 실제 Metronome·Sleep Talk의 Slash 위력: v1/v2 80, 무표시 70. v2 전용 Snipe Shot 85와 v1/무표시 80.
- 호출한 Dragon Claw의 Sharpness 피해 및 Silver Wind의 Wind Rider 면역·공격 상승. Silver Wind는 native Metronome의 Past 제외 정책 때문에 잠꼬대로 호출해 검사한다.
- 실제 Copycat의 Slash 보정과 PP/스텔라 타입 이력.
- 반복 저장/복구 후 호출 횟수·피해·PP 중복 없음, 다른 슬롯·탐험·재화 보존.
- useMove/runMove 입력 ActiveMove 동일성과 수정값 보존, 중복 설치 방지, 무표시 메서드 보존.
- 실제 Dancer 복사가 한 번만 발생하고 위력 100/90 구분, 추가 PP 소비나 moveset 삽입 없음, codec 이후도 유지.
- ActiveMove의 일시적 수정이 캐시·다른 전투·전역 Dex로 전파되지 않음.

기존 Stellar 15개·지연 호출 9개·MultiLens 1개를 합쳐 표준 Node **40/40**(약4.39초), Worker runtime loader **40/40**(약3.59초) 통과했다. 변경한 제품/검사 4파일 ESLint 오류·경고 0, `git diff --check` 통과. 근거 로그는 `/tmp/nature-called-release-focus.log`, `/tmp/nature-called-release-worker.log`, `/tmp/nature-called-release-lint.log`다. 전체 프로젝트 통합 검사는 root 담당이다.

## 남은 구현과 별도 검증

- 실제 미대조/부분지원: 원본 Metronome 후보·금지 목록과 challenge 제한, 다른 호출 기술의 원본 실패/대상 규칙, 추가 연타와 특수 타입 변경·폼·패시브 조합. native 기술 존재 여부만으로 원본 동등성을 판정하지 않는다.
- 검사만 남음: 이번 범위의 실계정·실기기 플레이와 운영 배포 후 검증. 이번 집중 검사는 격리된 합성 저장과 실제 native 엔진을 사용한다.
- 이번 구현은 운영 409나 PC 끊김의 원인을 확인하거나 해결했다는 근거가 아니다. 해당 원인은 별도 조사 범위다.
