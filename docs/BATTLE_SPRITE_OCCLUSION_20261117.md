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
