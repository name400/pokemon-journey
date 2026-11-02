# 탐험 모험 전용 새 채팅 인계

현재 사이트는 한 프로젝트의 두 독립 게임입니다. 사용자 요청으로 새 채팅에서 **탐험 모험**을 병행하고, 기존 채팅은 **포켓로그와 공통 시스템**을 계속 작업합니다.

## 작업 구분
- 탐험 채팅: `app/adventure.tsx`, 탐험 전용 새 CSS/컴포넌트/`lib/adventure-*`, `app/api/world/route.ts`의 탐험 기능. 2D 직접 이동/타일맵/탐험/관장/스토리/포획/성장/UI 완성도 개선.
- 기존 채팅 소유: RogueClassic 전체, 공통 BattlePanel·PokemonImage·전투 엔진·로그인·계정·관리자·친구·PvP·루트 메뉴·Sites 배포. 공통 변경이 필요하면 별도 패치로 남겨 통합할 수 있게 한다.
- 데이터는 기존처럼 탐험(worlds/pokemon_box/wallets/inventory)과 로그라이크(saves.classic)를 분리한다. 관리자 초기화·복구가 선택한 게임만 처리하도록 기존 채팅에서 연결 중이다.
- 레벨 최대100, 자동 진화 금지, PvP본인소유만, 서버 관리자 인증·비밀번호클라이언트비노출 유지. 다른 기존 Sites(코블버스/전설급게임) 변경 금지.

## 충돌 방지
- 현재 작업 폴더 전체에 큰 미커밋 변경이 있으므로 되돌리기/전체체크아웃/임의커밋·배포 금지. **별도 브랜치·worktree에서 탐험 전용 변경**으로 작업한다.
- db/schema.ts와drizzle마이그레이션은 기존 채팅이0010_polite_jackpot(초기화백업)을 추가했다. 적용된0000–0009와생성된0010을수정하지 않는다. 추가스키마필요시별도제안/통합패치로협의한다.
- 기존 로컬5173은 포켓로그 작업자가 사용 중이다. 별도 프리뷰 포트/별도 로컬 DB로 QA한다. `.dev.vars`/서버비밀값/모의인증플러그인을 변경하지 않는다.
- **운영배포는 기존 채팅에서 통합 검증 후 일괄 진행**한다. 새 채팅은 현재 공개v4를 재배포하거나 사이트를 새로 만들지 않는다.

## 참고 자산/이미 구현
- `public/game/town/`에Kenney TinyTown/TinyBattle CC0타일과89좌표/건물3레이아웃/고지문이 있다. 새 탐험 타일맵에사용가능.
- `lib/world-movement.mjs`와test는이동충돌/물/배지문/전환batch용초안,실API미연결. `outputs/world-route-movement-draft.ts`도초안. 현`/api/world`는기존단일이동.
- 전체1025종/1579폼,full @pkmn/sim전투/수동진화/지급편집/계정저장/친구·닉네임/PvP는기존구현이있으나사용자가완성도를낮게평가했다. 이름만구현된것처럼보고하지말고실제플레이검증필요.
- 최신공통작업상태는`CLASSIC_V3_PROGRESS.md`의맨아래추가내용이우선이다. 초기부분의미연동메모는이미일부대체됐다.

Site project_id: appgprj_6ae805126fcc81919e2957e973c8955a
운영v4: https://pokemon-roguelike-adventure.jminwoo0823.chatgpt.site
현재큰미커밋변경의새코어는아직운영배포되지않았다.
