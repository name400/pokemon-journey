# 더블 배치·복합 타입·기술 표시·진화 연출

기준: `1dcfdce`, `cloud/pokerogue-continue-20261105`. 이 작업은 UI와 격리 브라우저 검사 범위다. 운영 저장, Sites, 배포, Git 커밋/푸시는 이 하위 작업에서 변경하지 않았다.

## 실제 확인한 원인과 수정

- 38웨이브의 뮤츠/핑복 대 판짱/직구리 조합을 실제 PokeAPI Showdown GIF로 재현했다. 원래 `spriteFloor`는 가로로 긴 GIF를 96×96으로 늘여 분석했지만 실제 `img`는 `object-fit:contain`으로 정사각 영역 안에 표시했다. 그 차이로 뮤츠와 직구리의 표시 바닥이 링에서 벗어났다. 1280×800에서 아군 200px 박스와 뮤츠 1.327배 스케일도 약149px 슬롯 간격을 넘었다.
- 이미지 분석에 contain 여백을 반영하고, 이미지의 종별 스케일과 CSS zoom을 포함해 바닥 링을 계산한다. 캔버스 분석이 불가능한 Showdown URL은 원본 이미지 종횡비를 기준으로 보정한다. 애니메이션 GIF의 첫 프레임/원본 캔버스 기준은 다른 프레임의 미세한 움직임까지 정확히 고정하는 방식은 아니다.
- 승인된 슬롯 중심, HUD, 도구, 명령 디자인을 유지하면서 더블 전용 폭 상한을 적용한다. 짧은 화면에서는 상대의 바닥이 아군 HUD 밑으로 가리지 않도록 위로 제한한다. 싱글 및 적용 대상이 아닌 화면 크기로 전환할 때 오래된 더블 보정값을 지운다.
- `PokemonTypeBadge`가 `currentTypes[0]`/`types[0]`만 읽던 문제를 수정했다. 현재 방어 타입 전체를 표시한다. 일반 테라는 테라 타입 하나, Stellar는 현재 원래 방어 타입들을 표시한다. 좁은 더블 HUD는 타입과 이름을 숨기지 않고 레벨을 다음 줄로 배치한다.
- 서버의 새 `displayMoves`를 사용해 PP 0 기술도 원래 자리에 남긴다. 실행 목록인 `moves`와 API 판정은 유지한다. 카드/설명에 비활성 사유를 표시하며 i 버튼은 계속 쓸 수 있다. 1–4 단축키 역시 표시 슬롯을 기준으로 하고 PP 0/금지 기술을 실행하지 않는다. 전 기술 PP 0이면 네 비활성 카드와 다섯 번째 발버둥 버튼을 보여준다. 서버 수정의 원인·테스트는 `PP_ZERO_MOVE_VISIBILITY_QA_20261105.md`를 참조한다.
- 진화 결과를 별도 컴포넌트로 구성해 파티뿐 아니라 게임의 진화 확인 뒤에도 보여준다. 약1초의 한 번뿐인 빛/등장 효과, 즉시 가능한 확인 및 연출 건너뛰기, `prefers-reduced-motion`을 지원한다. 추가 대기 타이머나 게임 저장 변경은 없다. 슬롯 선택/새 도전에서는 이전 진화 결과를 지운다.
- 미스터리의 선택/확인/결과에 280ms 이하의 opacity/transform 전환을 추가했다. 대사/전투 순서, 실제 선택·취소·확인 동작은 그대로다.

## 격리 브라우저 근거

서버: `tests/browser/ui-readability/vite.config.mjs`, 로컬 포트5223. 서버는 합성 저장만 사용한다. 실제 `applyClassicAction`의 응답(`evolutionResult`, `finishedBattle` 포함)을 보존하고 저장 코덱 왕복 후 실제 화면에 전달한다. 이 서버는 저장 하나를 공유하므로 검사 스크립트를 순차 실행했다.

1. `double-layout.mjs`: **27/27**. 1280×800, 1920×1080, 375×667, 320×568, 768×1024, 844×390의 싱글↔더블, 슬롯 순서 교환 및 같은 컴포넌트의 화면 크기 전환. 실제 스프라이트 요청6개, alpha 범위·바닥/링 좌표·아군/상대 간 비겹침·가로 넘침·오래된 보정값 제거 검사. 요청 URL, 실제 PokeAPI 원본 URL, SHA-256, 바이트 수는 결과 JSON에 기록했다. Showdown 요청은 해당 PokeAPI Showdown GIF 사본을 반환했으며 단순 이미지 stub이 아니다.
2. `types-and-motion.mjs`: **27/27**. 1280/375/320px에서 양쪽 싱글/더블의 누리레느 물/페어리, 리자몽 불꽃/비행, 일반 테라, Stellar, 전투 중 바뀐 타입을 검사했다. 진화 확인→결과, 건너뛰기/확인의 저장 불변, 이벤트 선택→확인→취소→떠나기와 reduced-motion을 검사했다. 포켓몬 외형은 stub이므로 실제 진화 자산 검사로 간주하지 않는다.
3. `pp-and-trainers.mjs`: **14/14**. 1280/375px에서 네 번째 신속 PP0, 전체 PP0+발버둥 실행, 회복된 신속 실행, 비활성 단축키/설명 버튼을 검사했다. 라이벌 male69×69/female70×70 실제 로컬 PNG가 상단·등장·대화에서 표시되는지, 일반 트레이너와 이미지 실패 fallback을 확인했다. 부모 작업이 라이벌 원본 자산과 기존 저장의 표시 보정을 제공했다. 포켓몬 외형은 stub이다.
4. 기존 `check.mjs`: **11/11**, `touch-move-info.mjs`: **40/40** 재통과. 8화면의 부화/기술 정보와 2화면의 대사 미확인6.5초 유지·포켓몬1회 등장·기절 후 승리 대화, 스타터 선택 reload, 터치 i 버튼 반복을 포함한다.

결과와 스크린샷: `.sites-runtime/tests/ui-readability/double-layout/`, `types-and-motion/`, `pp-and-trainers/` 및 기존 출력 디렉터리. 로그: `/tmp/double-layout-browser.log`, `/tmp/types-and-motion-browser.log`, `/tmp/pp-and-trainers-browser.log`, `/tmp/ui-incident-existing-browser.log`, `/tmp/ui-incident-touch-browser.log`.

새 컴포넌트/브라우저 파일 ESLint 오류·경고0. 기존 화면의 ESLint 진단은 기준 커밋과 동일하다: BattlePanel 오류36/경고10, RogueClassic 오류97/경고18. 타입 검사는 통과했으며 전체 테스트/최종 production 빌드는 부모의 통합 검증 결과를 기준으로 한다.

실제 모바일 기기/Safari, 운영 계정 자연 진행, 모든 종과 폼의 프레임별 스프라이트, 운영 배포는 이 검사 범위가 아니다.

## 최종 후속 확인

- 기존 `beast-and-rewards.mjs` **6/6** 재통과: 모바일 긴 설명/가격, 기절 회복 구매, 울트라볼 보상·포획·reload. `/tmp/ui-incident-beast-browser.log`.
- `UI_FOCUS=slot` **3/3**: 1280/375/320px에서 진화 결과가 보인 상태로 저장 슬롯 메뉴→계속하기를 선택하면 이전 결과가 남지 않는다. `/tmp/ui-incident-slot-browser.log`, `types-and-motion/slot-results.json`.
- 라이벌 최종 시각검토에서 기존 대화창의 2.35배 확대가 원본 Finn/Ivy의 얼굴을 잘라냈다. 부모가 원본 라이벌 두 PNG에만 `transform:none`을 적용했다. `UI_FOCUS=trainers` **8/8**로 상단/등장/대화·일반 트레이너·실패 fallback을 재검사했고, 대화 이미지 전체가 프레임 안에 들어오는 것을 좌표와 PC male/mobile female 스크린샷으로 확인했다. `/tmp/ui-incident-trainer-browser.log`, `pp-and-trainers/trainer-results.json`. 해당 스크린샷은 최종 CSS로 갱신했다.
- 새 테스트/컴포넌트 ESLint 오류·경고0, 기존 화면 진단 증가없음, `git diff --check` 통과. 부모 통합 검증은 일반/Worker **각814/814**, 최종 타입·production 빌드 통과로 전달받았으며 상세 로그는 `INCIDENT_UI_INTEGRATION_QA_20261105.md`를 참조한다.
