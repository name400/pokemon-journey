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

### 사이드 미션 95 — 고스트 타입 배틀
- 메인 미션 35 시작 후 기존 사이드 56 홀로베이터 옥상에서 Malé의 의뢰를 받고, 파티 전원이 실제 고스트 타입일 때 나목령·펌킨인·깜까미·팬텀과 배틀한다. 전투 상금 2,784원, 별도 의뢰 보상 4,444원과 주술부적은 각각 한 번만 지급한다. 구형 저장에 새 단계가 없으면 미수락 상태로 둔다.
- [Thonky](https://www.thonky.com/pokemon-legends-z-a/side-mission-095-a-haunting-experience) 기준 의뢰 해금·레벨·상금 및 보상을 반영했다. 기존 옥상과 의뢰인 위치는 2D 근사이며 원작 분수와 연결 경로의 정확한 좌표는 확인하지 못했다. 상대 기술·실시간 전투 동작은 기존 턴제 엔진의 근사다. 실제 Sites 병합본과 원작 실기는 검증하지 않았다.

### 구역 15 일반 개체 성장 기술
- 새로 만나는 기본 폼 애버라스·호바귀와 그 진화 계열에 Z-A 레벨·진화·떠올리기 기술을 연결했다. [애버라스](https://pokemondb.net/pokedex/larvitar/moves/9), [데기라스](https://pokemondb.net/pokedex/pupitar/moves/9), [마기라스](https://pokemondb.net/pokedex/tyranitar/moves/9), [호바귀](https://pokemondb.net/pokedex/pumpkaboo/moves/9), [펌킨인](https://pokemondb.net/pokedex/gourgeist/moves/9)의 2차 자료 기준이며, 야생 초기 4기술은 기존 엔진의 최근 기술 방식인 근사다. 크기별 호바귀 폼과 우두머리 기술은 검증되지 않아 그대로 두었다.
- 기존 성장표의 깨트리다·머드숏·록블레스트 표기를 실제 기술명으로 고치고, 이미 저장된 구 표기도 동일 기술로 해석한다. 저장 데이터나 기존 개체를 소급 변경하지 않는다. 다른 구역과 수생종의 누락은 계속 확인이 필요하다. Sites 병합본과 운영 환경은 이번 변경으로 재검증하지 않았다.

### 구역 16 및 이전 수변 성장 기술
- [대여르](https://pokemondb.net/pokedex/falinks/moves/9), [거북손손](https://pokemondb.net/pokedex/binacle/moves/9), [거북손데스](https://pokemondb.net/pokedex/barbaracle/moves/9)의 2차 Z-A 기술표를 새 일반 개체에 연결했다. 거북손손은 기존 구역 2·6에도 출현하며 거북손데스는 구역 16의 직접 조우에 적용한다. 레벨 성장과 기술 떠올리기에 반영하고 구형 개체·우두머리·미확인 표식은 소급하지 않는다.
- 야생 초기 기술을 레벨 이하에서 최근 4개로 고르는 것은 기존 엔진의 근사다. 크기별 호바귀와 우두머리 기술, 앞 구역의 다른 수생종, 구역 16의 나머지 진화형 직접 출현은 별도 확인이 필요하다. 운영·Sites 병합본은 이번 작업으로 재검증하지 않았다.

### 구역 17 및 하수도 성장 기술
- 새 일반 클레피와 불켜미·램프라·샹델라 계열에 Z-A 레벨 기술표를 적용하고, 구역 17 램프라와 하수도 불켜미의 전투·직접 포획 경로를 연결했다. 구역 17 직접 출현 파르토·화염레오도 이전에 검토한 계열 기술표를 쓰도록 연결했다. [클레피](https://pokemondb.net/pokedex/klefki/moves/9), [불켜미](https://pokemondb.net/pokedex/litwick/moves/9), [램프라](https://pokemondb.net/pokedex/lampent/moves/9), [샹델라](https://pokemondb.net/pokedex/chandelure/moves/9)의 2차 자료를 사용했다.
- 야생 초기 기술을 현재 레벨 이하 최근 4개로 고르는 것은 기존 엔진의 근사다. 기존 개체·우두머리·알 수 없는 성장 표식은 변경하지 않는다. 구역 17 무장조와 앞 구역 수생종·진화형 누락, 호바귀 크기별 폼과 우두머리는 추가 대조가 필요하다. Sites 병합본·운영 환경은 이번 변경으로 재검증하지 않았다.

### 구역 17 무장조·구역 18 아공이 성장 기술
- 새 일반 무장조와 아공이·쉘곤·보만다 계열의 Z-A 레벨 기술, 확인된 진화 기술 및 떠올리기 기술을 연결했다. [무장조](https://pokemondb.net/pokedex/skarmory/moves/9), [아공이](https://pokemondb.net/pokedex/bagon/moves/9), [쉘곤](https://pokemondb.net/pokedex/shelgon/moves/9), [보만다](https://pokemondb.net/pokedex/salamence/moves/9)의 2차 자료를 기준으로 했다. 초기 야생 기술은 기존 엔진의 레벨 이하 최근 4개 방식인 근사다.
- 구형 개체·진행 중 전투·우두머리·미확인 표식은 소급하지 않는다. 구역 18 파비코·음뱃 계열과 직접 출현 진화형, 앞 구역 수생종 및 호바귀 크기별 폼은 추가 대조가 필요하다. Sites 병합본 및 운영 환경은 이번 변경으로 재검증하지 않았다.

### 구역 18 옥상 파비코·음뱃 성장 기술
- 새 일반 파비코·파비코리·음뱃·음번에 Z-A 레벨과 확인된 진화 기술을 연결했다. 구역 18 옥상 직접 출현 진화형과 구역 6 파비코, 수정 하수도 음뱃 조우에도 적용한다. 근거는 [파비코](https://pokemondb.net/pokedex/swablu/moves/9), [파비코리](https://pokemondb.net/pokedex/altaria/moves/9), [음뱃](https://pokemondb.net/pokedex/noibat/moves/9), [음번](https://pokemondb.net/pokedex/noivern/moves/9)의 2차 자료다. 야생 초기 기술 4개는 기존 엔진의 근사다.
- 기존 개체·우두머리·불명 표식은 소급하지 않는다. 구역 16 직접 출현 진화형과 이전 수생종 및 크기별 호바귀 폼은 추가 대조가 필요하다. Sites 병합본과 운영 환경은 재검증하지 않았다.

### 구역 5·6 옥상 성장 기술
- 일반 캐이시와 썬더라이 계열에 Z-A 성장 기술표를 적용하고, 구역 5의 피죤 및 구역 6 옥상의 보송송에 기존 표를 연결했다. [캐이시](https://pokemondb.net/pokedex/abra/moves/9), [썬더라이](https://pokemondb.net/pokedex/electrike/moves/9), [썬더볼트](https://pokemondb.net/pokedex/manectric/moves/9), [피죤](https://pokemondb.net/pokedex/pidgeotto/moves/9)의 2차 자료 기준이다. 야생 초기 기술의 최근 4개 선택은 기존 엔진 근사이며 기존 저장·우두머리·미확인 표식은 소급하지 않는다.
- 후속 대조 후보: 플라베베 계열, 단칼빙, 이브이, 할비롱, 호바귀 크기별 폼, 직접 출현 딱충이·로젤리아·독침붕·휠구·펜드라·고우스트 및 분떠도리·불화살빈의 초기 야생 기술. 현재 코드·출현 경로 및 원작 자료를 다시 확인한 뒤 적용한다. 운영과 Sites 병합본은 재검증하지 않았다.

### 플라베베·단칼빙 계열 성장 기술
- 일반 플라베베·플라엣테·플라제스의 확인된 빨강·노랑·주황·파랑·하양 꽃과 일반 단칼빙·쌍검킬·킬가르도 실드폼에 Z-A 레벨·진화·떠올리기 기술표를 연결했다. [플라베베](https://pokemondb.net/pokedex/flabebe/moves/9), [플라엣테](https://pokemondb.net/pokedex/floette/moves/9), [플라제스](https://pokemondb.net/pokedex/florges/moves/9), [단칼빙](https://pokemondb.net/pokedex/honedge/moves/9), [쌍검킬](https://pokemondb.net/pokedex/doublade/moves/9), [킬가르도](https://pokemondb.net/pokedex/aegislash/moves/9)의 2차 자료 기준이다. 야생 초기 기술은 레벨 이하 최근 4개 방식인 근사다.
- 도시의 색상별 플라베베, 구역 3·7·16 일반 조우, 연구소 일반 단칼빙·쌍검킬을 연결했다. 영원한꽃·메가·블레이드폼과 우두머리 및 기존 저장은 소급하지 않는다. 이브이·할비롱·호바귀 크기별 폼과 이전 구역 진화형의 추가 확인이 남았다. Sites 병합본과 운영 환경은 재검증하지 않았다.

### 이브이·할비롱·호바귀 크기별 성장표

구역 19 일반 이브이·할비롱과 구역 15 일반 호바귀의 작은·큰·특대 품종에 Z-A 성장 기술을 신규 조우부터 연결했다. 이브이의 여덟 진화형과 호바귀의 대응 품종 진화형도 성장·기술 관리에 연결하며 기존 개체, 진행 중 전투, 우두머리와 알 수 없는 표식은 소급 변경하지 않는다. 야생 초기 기술은 기존 엔진의 최신 네 기술 규칙을 사용한 근사다. 자료는 [PokémonDB 이브이](https://pokemondb.net/pokedex/eevee/moves/9), [할비롱](https://pokemondb.net/pokedex/drampa/moves/9), 각 진화형 PokémonDB 및 [RotomLabs 호바귀 품종](https://rotomlabs.net/dex/legends-z-a/pumpkaboo/super-size)·펌킨인 품종의 2차 자료이며 실기 독립 검증은 남았다. 미확인 폼과 우두머리 고유 기술은 적용하지 않았다. Sites 병합본과 운영 환경 검증은 별도로 남는다.

### 직접 출현 진화형 성장 연결

구역 2 나무 딱충이의 직접 투척, 구역 7 풀숲의 딱충이·로젤리아, 구역 15 독침붕·휠구·펜드라·고우스트의 야생 전투와 직접 투척에서 기존 ZA 성장표를 신규 일반 개체에 연결했다. 구역 4 분떠도리와 구역 9 불화살빈은 이미 포획 후 성장 표식이 있었지만 초기 야생 기술이 공용 표를 쓰던 경로도 수정했다. [딱충이](https://pokemondb.net/pokedex/kakuna/moves/9), [분떠도리](https://pokemondb.net/pokedex/spewpa/moves/9), [불화살빈](https://pokemondb.net/pokedex/fletchinder/moves/9) 및 각 종의 PokémonDB Z-A 기술표를 2차 자료로 대조했다. 야생 초기 기술은 기존 최신 네 기술 규칙의 근사이며, 기존 저장과 우두머리 기술에는 소급 적용하지 않는다. 실기·Sites 병합본 검증은 별도로 남는다.

### 구역 20 일반 출현 성장표

현 코드의 구역 1~19 풀과 보이는 일반 개체를 표본 집계하고, 구역 20에서 일반 출현하나 성장표가 연결되지 않은 9종을 확인했다. 로즈레이드·칼라마네로·보스로라·하마돈은 기존 검토 표를 연결하고 루카리오·가디안·드래캄·더스트나·곤율거니는 PokémonDB의 Z-A 레벨 표를 별도 추가했다. 구역 20 풀숲·가시 개체 전투·직접 투척에 적용하며 기존 저장·우두머리·미확인 표식은 소급하지 않는다. 초기 야생 기술 최신 네 개 선택은 엔진 근사다. 2차 자료 예: https://pokemondb.net/pokedex/lucario/moves/9 https://pokemondb.net/pokedex/gardevoir/moves/9 https://pokemondb.net/pokedex/dragalge/moves/9 https://pokemondb.net/pokedex/garbodor/moves/9 https://pokemondb.net/pokedex/scrafty/moves/9 . 이벤트·우두머리와 연구소·도시 등 비정규 구역은 이번 집계 범위 밖이며 Sites 병합본 검증도 남는다.

### 도시 고정 출현 세 계열

도시·하수도 고정 출현 리오르·깨봉이·곤율랭은 신규 일반 조우의 초기 기술과 성장표를 ZA 자료에 연결했으며, 진화 시 기존 루카리오·더스트나·곤율거니 표식을 이어간다. 전투 진입과 필드 투척 양쪽에 적용하고 기존 저장·우두머리·알 수 없는 표식은 소급하지 않는다. 야생 초기 네 기술은 기존 엔진의 근사다. 자료: https://pokemondb.net/pokedex/riolu/moves/9 https://pokemondb.net/pokedex/trubbish/moves/9 https://pokemondb.net/pokedex/scraggy/moves/9 (2차 자료). 랄토스·데덴네·미뇽·미끄메라 등 다른 도시 출현과 연구소·하수도 별도 풀이 아직 남아 있고, Sites 병합본은 재검증하지 않았다.

### 도시 랄토스·데덴네·미뇽·미끄메라 성장표

도시 일반 고정 출현의 네 종과 일반 진화형에 ZA 레벨·진화·다시 배우기 기술표를 신규 개체부터 연결했다. 랄토스는 가디안·엘레이드 양쪽, 미뇽과 미끄메라는 일반 진화 단계까지 연결하며 별도 지방 폼과 우두머리는 적용하지 않는다. 전투와 필드 투척 모두 같은 초기 기술 규칙을 사용하며 기존 저장·진행 전투·불명 표식은 소급하지 않는다. 초기 네 기술 선택은 엔진의 근사다. 2차 출처 예: https://pokemondb.net/pokedex/ralts/moves/9 https://pokemondb.net/pokedex/dedenne/moves/9 https://pokemondb.net/pokedex/dratini/moves/9 https://pokemondb.net/pokedex/goomy/moves/9 및 각 일반 진화형 페이지. 도시 외 하수도·연구소의 별도 출현, 미확인 지방 폼과 Sites 병합본 검증은 남았다.

### 플라드리 연구소·마젠타 하수도 일반 출현 성장표

연구소 일반 메탕·메탕구의 ZA 성장·진화·기술 관리와 하수도 일반 수레기 계열을 추가했다. 연구소 일반 델빌·헬가·썬더라이·라이볼트·음뱃·음번·아보 및 하수도 아리아도스·오케이징·음뱃은 기존에 대조한 표를 재사용하도록 야생 전투와 필드 투척 경로를 연결했다. 하수도는 풀숲·접촉 조우도 같은 표를 쓴다. 기존 저장·진행 전투·알 수 없는 표식과 우두머리는 소급하지 않으며, 야생 초기 네 기술은 엔진 근사다. 2차 출처: https://pokemondb.net/pokedex/beldum/moves/9 https://pokemondb.net/pokedex/metang/moves/9 https://pokemondb.net/pokedex/metagross/moves/9 https://pokemondb.net/pokedex/skrelp/moves/9 . 출현 좌표·우두머리 확률은 기존 초안 그대로이며 Sites 병합본 검증은 남았다.
