# Battle sprite occlusion checks (2026-11-17)

The isolated Chromium fixture, not a production save, was used for these checks. Pixel bounds below use the nontransparent pixels of the supplied 96×96 sprite images; a rectangle around that silhouette is a conservative approximation. The reference v52 source coordinates were checked where applicable, but these runs do not establish full pixel equivalence to the approved original or verify real phones.

- Adventure single: Eevee/Pidgey, Dragonite/Magnezone, Tyranitar/Sylveon and Bulbasaur/Venusaur at 320×568, 390×844, 844×390 and 1280×800. The standard coordinate fixture also checks the buttons and settings. Non-reference species are checked against the maximum size and anchor, not required to fill the full reference box.
- Adventure double: Bulbasaur and Dragonite against Venusaur and Sylveon at 320, 350, 351, 360, 375, 389 and 390 pixel portrait widths, 844×390 and 1280×800. At 320px the minimum-height HP cards overlapped Sylveon and both allied sprites. The narrow-container adjustment moves the allied and enemy actors apart from their HP cards; these cases now pass. Other species, status-expanded HP cards and triples have not been exhaustively checked for silhouette collisions. The effect anchors were not recalibrated for the 7px narrow-screen actor adjustment.
- PokéRogue single: Mewtwo/Lechonk at 390×844, 844×390 and 1280×800. The idle log background covered the Mewtwo silhouette; the idle command view now hides the log background and lines while preserving pending feedback, the history control and playback. The history control was opened and closed in the fixture.
- PokéRogue double: existing double-layout fixture passed 27 actual-sprite cases across six viewport sizes and transitions. This is not an exhaustive check of all HUD or message overlaps.
- Adventure double and triple party and bag selection: 320×568, 844×390 and 1280×800; paging, ownership, medicine, revive and switching passed. Double switch event order and reload during playback passed. The multi-status fixture passed its empty-slot cases at 390×844 and 1280×800.

The `cloud-multi-real-silhouettes.mjs` fixture needs `REAL_SPRITES_DIR` containing `back-1.png`, `back-149.png`, `front-3.png` and `front-700.png`, plus the local Vite fixture and Playwright/Chromium. It does not use or change a user save. A first set of parallel browser checks stopped when the Vite process was killed under memory pressure; the above reported cases were rerun sequentially. The separate PokéRogue move fixture was not rerun because its isolated API server was not running.

Not verified: physical devices, every species/form, all dynamic message states and animation frames, PokéRogue double HUD occlusion across all sprites, and complete visual identity with the approved reference. No Sites deployment.

## Responsive effect anchors

The narrow adventure multi-battle layout shifts allied sprites 7px up and opposing sprites 7px down. Attack, damage, status and other scene effects previously continued to use the unshifted scene positions; the switch cue already measured the displayed combatant. The responsive shift now feeds the effect positions and reviewed multi-target attack paths as well. Resize observation recomputes the percentages when the arena changes size. This changes presentation only.

Isolated Chromium checks used the actual engine for the Energy Ball command against each of two opponents, with real species sprite assets, at 320×844 and 390×844. At 320px, both the source offset and each target's offset followed the sprite shift, and the impact point fell inside the target's visible alpha bounding rectangle; at 390px, the original positions remained in effect. An additional synthetic paralysis event tested an allied status burst against the shifted slot. The status event was injected into the fixture response, not produced by the engine.

A separate 320px adventure-double switch test checked the recall orb against the shifted slot, command order and reload during playback. The switch fixture used placeholder images. Adventure single Flamethrower and PokéRogue single Flamethrower passed engine-event and message-order regression with representative sprites. PokéRogue double Dynamax, Terastallization and Z-move commands, selected actor, PP and reload passed with fixture images; switch message visibility passed at 320×568, 390×844, 844×390 and 1280×800 in the fixture's single and double cases.

These checks do not establish exact pixel alignment for every attack type, animation frame, species, resize during playback or alpha silhouette, and do not replace real-device testing or reference-video comparison. No Sites deployment or user-save access.

## 다중 배틀 상태 이상 표시

탐험 다중 배틀에서 포켓몬 네 마리에 마비 상태를 넣은 격리 화면을 실제 종별 PNG로 확인하자, 상태 배지가 HP 카드의 별도 줄을 차지해 320×568에서 확장된 카드가 포켓몬 실루엣을 덮었다. 상태 배지를 각 카드의 소유자·상대 번호가 있는 첫 줄로 옮겨 카드 높이를 줄였다. 매우 좁은 카드에서는 소유자 글자가 말줄임 될 수 있으며 전체 정보는 상태 확인 화면에서 볼 수 있다. 이 표시는 탐험 다중 배틀에만 바꿨고 포켓로그의 상태 배치와 전투·저장 처리는 변경하지 않았다.

실제 스프라이트 이중 배틀 픽스처의 네 상태 표시와 실루엣·HP 카드 경계를 320·350·351·360·375·389·390px 세로 화면, 844×390 및 1280×800에서 확인했다. 상태 없는 경우도 같은 화면에서 통과했다. 상태는 DTO에 주입했으며, 네 포켓몬이 동시에 마비되는 자연 전투 검증은 아니다. 탐험 이중·삼중 파티·가방·교체, 빈 슬롯 상태창, 포켓로그 단일·이중 상태창과 포획·볼 소모·재접속, 미션 37 및 의뢰 118 격리 D1 저장, 포켓로그 변화 후 HP·PP, 전체 타입 검사가 통과했다. 포켓로그 화면 회귀는 대체 이미지와 격리 픽스처를 사용했다.

단일 배틀용 v52 원본과 구형 게임 캡처도 확인했으나 원본 이미지가 빠진 캡처이므로 완전 일치를 판정하지 않았다. 다중 배틀을 위한 별도 승인 좌표는 확인되지 않았다. 모든 종·상태·실기기와 화면 회전은 미검증이다. 재접속 시 연출 중복은 미확인 이벤트 손실 위험 때문에 보류를 유지한다. Sites 배포는 하지 않았다.

## 긴 기술명과 보조 버튼

단일 전투 기술창에서 긴 이름이 말줄임되는 현상을 재현했다. 픽스처 문자열 `하늘을태우는멸망의빛`의 텍스트는 320px 화면에서 이름 칸의 64 CSS px에 83 CSS px가 필요했다. 원래 글자가 들어가지 않을 때에만 칸에 맞춰 글꼴을 줄이고, PP·행 크기·명령 ID와 설명 버튼은 유지한다. 최소 크기 제한 때문에 임의로 더 긴 문자열은 여전히 줄임될 수 있으며 설명창에는 전체 이름을 제공한다.

탐험과 포켓로그 단일 전투의 320×568·390×844·844×390·1280×800 Chromium에서 긴 시험 이름 네 개의 실제 텍스트 폭·PP·설명 열기 및 선택 요청을 확인했다. 해당 이름들은 표시용으로 DTO에 주입했으며 포켓로그는 원래 엔진 기술 ID를 전송했다. 탐험은 가로채는 API 픽스처로 선택 문자열을 확인했으므로 주입된 이름이 엔진에서 유효한 기술이라는 뜻은 아니다. 양쪽 테스트에서 각 모드의 실 PNG 스프라이트 두 개가 실제 로드됐다.

기술 설명과 명령 복귀·기록 버튼은 기존 터치 영역을 유지하면서 보이는 크기를 줄였다. 같은 네 화면에서 인접 복귀·기록 영역과 설정 영역, 기술 설명 버튼 표시 크기와 입력을 확인했다. 기존 짧은 이름의 탐험 v52 코드와 같은 데이터의 행 위치·PP·배율·터치 및 실제 명령, 포켓로그 단일·이중 기술 목록의 엔진 값 회귀도 통과했다. 탐험의 긴 이름 상태창·파티·가방·아이템 대상·부활·교체는 네 화면의 격리 픽스처로 확인했다. 파티 목록의 긴 이름은 여전히 말줄임될 수 있고 선택된 상세에서 전체 이름을 확인할 수 있다. 이 가방 테스트는 대체 이미지를 사용했다.

원본 v52 기술창 코드에는 현재 게임의 기술 설명 `i`와 별도 전투 기록 버튼이 없다. 이 조작은 기존 기능을 위해 남겼기 때문에 화면이 승인 원본과 한 치도 다르지 않다고 할 수 없다. 원본은 긴 시험 문자열의 처리도 직접 제공하지 않는다. 원본 전체 이미지·실기기·모든 언어 및 긴 이름의 가독성, 더블의 긴 이름 전체 화면은 미검증이다. 재접속 중복 억제는 그대로 보류했고 Sites에는 배포하지 않았다.

## 파티의 긴 이름과 상세 정보

기준 `b2332b92`에서 320px 탐험 단일 파티의 시험 이름 `울트라네크로즈마1`은 실제 이름 칸 42 CSS px에 71 CSS px가 필요해 잘렸다. 원본의 111×23 논리 좌표 행과 HP 위치는 유지하고, 이름이 들어가지 않을 때만 글꼴을 줄이도록 했다. 탐험 단일 파티·가방과 다중 파티·가방 대상, 포켓로그 단일·더블 파티에 적용한다. 이름 전체는 DOM과 접근성 텍스트 및 제목에 남고, 선택한 상세에도 표시된다. 최소 글자 크기를 기본의 50%로 제한하므로 이보다 훨씬 긴 임의 이름은 여전히 잘릴 수 있다. 작은 화면에서 축소된 글자 자체의 물리 기기 가독성도 미검증이다.

탐험 단일에서는 긴 이름 여섯 개와 대기 포켓몬의 긴 기술명 네 개를 DTO에 주입해 320×568·390×844·844×390·1280×800에서 목록 및 상세 텍스트 폭, 원본 코드의 행 좌표, 가방 대상·회복·부활·교체를 검사했다. 탐험 더블·트리플에서는 320×568·844×390·1280×800에서 긴 이름의 목록·가방 대상과 페이징·동료 제외·도구·교체를 확인했다. 포켓로그 싱글·더블에서는 네 크기에서 긴 이름과 상세 기술·PP 폭, 기절·교체 예약·교체·재접속을 검사하고 강제 교체와 교체 불가도 별도 확인했다. 이 파티 검사들은 이미지 대체 또는 DTO 주입을 사용하며 정상 육성이나 원작 종별 전체 목록 검사가 아니다.

직전 변경의 원본에 없는 설명·복귀·전투 기록 조작에 대해 실제 PNG 스프라이트 두 개씩을 불러 기술창에서 각각의 보이는 조작 부분과 스프라이트 알파 경계가 겹치지 않는지 두 모드·네 크기에서 검사했다. 시험한 종과 장면 이외는 미검증이다. 기존 조작은 유지했으므로 원본 v52와 무오차라고 판정하지 않는다. 타입 검사는 통과했고 Sites에는 배포하지 않았다.
