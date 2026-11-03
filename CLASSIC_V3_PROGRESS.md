# Classic v3 재구현 — 이어서 작업할 상태

## 최종 사용자 방향
- 포켓로그 모드부터 완성. 원본 시스템을 똑같이, UI는 복제가 아니라 더 높은 품질.
- 직접 원본 플레이 조사는 중단하고 공개 플레이 영상 참고. 참고 영상은 음소거 상태 유지.
- 최대 레벨100 / 자동 진화 금지 / 별도 게임 데이터 / 고가 다양한 포켓몬 가챠 / 넓은 관리자 지급·수정은 명시 예외로 유지.
- 변신은 실제 형태: 메가·G-Max 런 지속, 테라 결정화/왕관과 실제 상태. 일반3턴Dynamax를원본이라고활성화하지않음.
- 완성·검증 전 새 버전 배포 금지. 운영 v4 그대로, 지금 파일은 로컬 개발본.

## 검증한 사실과 구조
원본 기준 v1.12.2.3 / 29441f7aa7482d9e816b253d324293788936dc3e. `work/pokerogue-reference`는 공식 저장소의 해당 태그 clone(원본 앱 실행 안함,ignored). Agent 감사문서:
- outputs/pokerogue-system-audit.md
- outputs/pokerogue-economy-growth.md
- outputs/pokerogue-battle-carry.md

원본 사실:
- 시작27종 모두해금, IV15/EV0/레벨5, 파티6/비용총10. **27종이 전부3점인 것은 아님**(Torchic/Froakie/Gen9 등4점).
- source starterCost 선언된selectable종572, DTO기본+선택형태611개 매핑완료. species source1084→현재PokeAPI/Dex1084모두매핑(0누락).
- 원본base1084종baseStats는현재Dex데이터와전부동일. G-Max같은일부변신폼은커스텀BST/특성/타입으로별도적용필요.
- 원본모든base/passiveAbility는현재NativeDex.exists=true(Dragonize312/FireMane316/AuraGuard319 포함). 패시브배정192종; 모든조합완료라고주장하지않음.
- 새런돈1000/몬스터볼5/수정자[]/영구돈·레벨·도구carry안함.5개의런slot/영구Dex분리.
- Capture caught등록은actual→prevo전부. IV는첫selectable부터prevo까지최대값전파(Raichu26IV자체X,25→172). Candy는babyfamily172. **Pika25 costReduction/passive/candyrow는172와독립,prevo있어Candy메뉴도없음;getStarter25=25이지172아님.** Own eggMoves25=[]이며familyfallback하면틀림.
- wild XP=(폼baseExp*실제적레벨)/5+1. trainer먼저floor1.5. 참가자분배/기절·cap제외, 초기Share0/8라이벌Share1+SuperCharm1/25Share1.벤치Share없으면0.
- wild승리기본돈0. Trainer/돈보상/관련특성·수정자에서돈. Shop치료는즉시효과,영구재고X. firstPotion36/firstReroll250.10층은일반보상·유료상점생략하고고정성장보상→biome/heal.
- 같은구간야생은boosts/volatiles/임시특성·타입/PP/field/hazards보존. FakeOut은waveTurnCount라새wave첫턴가능.
- 일반승리턴residual은수행,10층Interlude는tag/heal/status스킵+fieldduration만lapse. incomingTrainer/Mystery/final/prev10경계의reset과무기한weather다르게처리.
- Champion190/Elite182,184,186,188/Rival8,25,55,95,145,195/Eternatus200.6gymstart20or30 이후30간격.

## 실제 구현된 새 코어(아직 전체 API/UI 미연동)
- data/rogue-reference.json (1.42MBserver-only): source1084/forms609/starter572/egg571/default27,정적진화544/formChange291,함수41/호출6은marker,Minun TM filter1은누락. 원본code라이선스AGPL-source고지포함,독립AST추출/코드실행X.
- scripts/import-rogue-reference.mjs :고정태그 ASTparser.
- lib/rogue-reference.mjs :Native/PokeAPI/source ID·enum·regional/form매핑. unmapped0,GenotypeMoveMapping.
- lib/rogue-starter-system.mjs :기본27/IV15,catch/IV/nature/ability/gender/shiny해금,candy,point10×6서버검증,새party레벨5/EV0/gear초기화. PikaCandyrow독립수정완료. 기본natures는중립cycle(원본seed순서와완전같다고주장X).
- lib/rogue-classic-state.mjs :5개독립run slots/영구자원분리/1000·볼5·레벨5·수정자초기화/시드RNG. startClassicRun은아직 **screen=prepared**인기초모델;완성실행루프아님.
- lib/rogue-classic-rules.mjs :원본레벨/cap/trainerstrength/money/tier·luckUpgrade/reroll/story스케줄/기초EXP분배. sourcecap·enemyLvl은마지막min100. EXP복수Charmfloor/Balance는후속progression모듈필요.
- lib/rogue-classic-services.mjs :즉시치료14종,동적가격/대상/PPbase용량(물대포25)/약품해금/기억버섯·learnableMoves/실패시무차감. 아직run API미연동.
- 위각 test*.test.mjs 통과. old legacyNatural601decisions관리자없이fresh짜랑꼬200완주도통과했으나**원본시스템동등증거아님**.

## 새 UI/시각 기반
- app/rogue.tsx+rogue-ui.css :v5 UI프로토타입,아직기존v2/RogueAPI. actorHP최종스포일러부모HUD/로그숨김.팝업전투제거.
- components/rogue-starter-select.tsx+css :611DTO용10포인트·6slot·세대/검색·유전설정·사탕UI. 아직메인미연동.
- components/rogue-classic-rewards.tsx+css :3랜덤무료/즉시유료정비/리롤/target/PP/TM/Memory버섯 선택UI. 아직미연동.
- BattlePanel/배경/앞뒤GIF/타격HP동기화/crown·결정화/Gmax오라/trueformfallback구현.
- lib/party-battle.mjs :표시필드 terastallized/dynamaxed/gigantamax/mega/primal/ultra/battleAppearance,before/beforeActive 추가. gen9에서nativeDmax요청없음정상. originalRogue고유룰은아직반영안됨.
- HMR영구잠금수정/2.8초재생budget/3.2초안전종료. `.sites-runtime/react-effects/check.mjs` 대조군으로버그재현/수정검증. global.empty padding80가거대원만들던CSS충돌도고침.
- PokemonImage 경량데이터39KB/동일폼artfallback/unknown폼은base가장X. scripts/verify-display-data 검사통과.
- Neo둥근모44KB공식OFL,public/fonts; 원본code-native battleSVG3종public/game/battle,CC0Kenney assets(후속탐험)public/game/town.
- VanillaRogueClient staticJSgzip407117→128346bytes(약68%감소),raw2661487→375595;outputs/rogue-performance.json. localWarmGET11–23ms(인터넷지연아님).

## 연구용 Native 어댑터 프로토타입(앱에 아직 승격 X)
1. `.sites-runtime/rogue-hooks-prototype/adapter.mjs` 및component-abilities.mjs, PHASE2.md:
   - BP스택/먹밥2/기본위협+패시브부유/개별억제/Gas/MoldBreaker/Trace/SkillSwap/스냅샷별프로세스복원/격리통과.
   - b.events Format callback은snapshot직전제거+restore필수; AI clone도같은serializer필수.
   - fromJSON은bind전에getRequests하므로activeRequestnulltombstone→bind→원래활성요청복구필요.
   - 현검증allowlist7개,192모두완료아님.
2. `.sites-runtime/wild-carry-prototype/README.md` +check.mjs:
   - 같은NativeBattle/p2에새Pokemon+side.team추가,oldfainted는refs용graveyard,10×double20개로24위치내snapshot가능.
   - boosts/PP/status/field/tags/seedSlot유지,p1Intimidate재발동X/p2발동,FakeOut첫턴허용,privatecurrentEnemy범위,RevivalBlessing과SupremeOverlord과거묘지영향격리.
   - 새battle부터win을residual완료까지유예하는instance훅필수. 추적없는legacyresidualKOsnapshot은남은효과정보없어거절해야함.
   - trainerfreshReset은HP/status/PP보존하고stage/태그/설치물·유한fieldreset;무기한환경재주입정책추가필요.

## 바로 다음 할 일
1. 검증된프로토타입을정식lib로리뷰/승격:직렬화·component능력·statefulheld스택·sourceStats/customGmax·기초PP·AIclone경로·wildcontinuity/승리residual/EXP시점.
2. source35biomes/NPC/라이벌/템플릿데이터어댑터:pixel_assets가data/rogue-world-reference.json과importer작성중(중간이미있음). callback1331marker는실제NPC생성구현이아님.
3. modifier registry/eligibility/가중보상·스택·즉시치료·캔디·TM·장비·gimmick·돈·route map/10층fixedgift를구현.
4. 전체phase state machine(각KO XP→새기술결정→turnResidual→capture교체→보상→biome→다음전투),wild기본돈0/런0carry,5slots+메타capsule분리.
5. doubles (랜덤쌍전/최종Eternamax2단계),typedtarget·각active선택지원. 현재party-battle는single하드코딩이어서아직필요.
6. 카드35biome비주얼/NPCsource파티/일정,목표원본core에맞춰UI붙이기. 기존고정+2level/heal/recruit보상은새core에서폐기.
7. adminRogue새starterDex와현재runparty선택·편집·감사반영,기존비밀값/사용자데이터유지.
8. 이전v2저장보관/명확한마이그레이션정책,교체중파일을완료라고오인배포하지않기.
9. PC/모바일/실제전체경로검증후테스트모의인증원복→빌드/sourcehelper/publicdeploy.

## 환경과 세션
- root path C:/Users/USER/Documents/Codex/2026-11-02/pc-ui-ai-ai-sites-ai/pokemon-roguelike
- D1로컬세션64141 npmdev5173, .dev.vars dummyADMIN. 원복백업 .sites-runtime/sites-vite-plugin.original.ts.
- mock1=local_seedy(127사용자프리뷰),2=local_second(localhostcookie1도2로격리),3=local_fresh(자동검증). 실제데이터아님. local_second에QAcoins50000, local_fresh naturaltest종료.
- browser2 / handles releaseTab3prod, researchTab4원본(더조작하지말것), roguePreviewTab5 127사용자, videoTab6음소거YouTube, qaRogueTab7localhostQA. 새컴팩션이면cua.rewriteDocumentation필수.
- viewportoverride1440×900설정했으나DOM은한호출늦게반영됨. 종료전reset.
- 운영프로젝트appgprj_6ae805126fcc81919e2957e973c8955a,v4,HEAD7b9de08d0903f054be19d8ae7592a529571e85bb. 새소스uncommitted,전부우리작업. credential세션만료되므로게시시새로get_site+credential+sourcehelper。
- 기존코블버스/전설급게임변경금지,다른Sites배포금지. 실제adminpassword클라이언트/파일출력금지.

## 최신 이어서 상태 (22:40경) — 위 미연동 상태는 이제 일부 오래된 기록

### 새 사용자 변경 (이 부분이 우선)
- 새 스타터 등록은 포획이 아니라 **상점에서 구매한 알을 부화**해야 한다. 기본27종은 그대로. 포획한 포켓몬은 현재 런 파티에 들어가고 관찰/포획/IV 기록은 남지만 신규 starter registered는 false. 관리자 명시 지급은 예외.
- 알 가격은 비싸게. 현재 common12,000 / rare48,000 / epic160,000 / legendary650,000 / shiny240,000 도전 코인. 후보 스타터cost구간별풀, 확률·풀크기표시. 런 소지금과 별도인 기존document.coins를상점지갑으로사용, 매wave/트레이너/구간/완주에서 서버지급(coinRewards로중복방지).
- 게임이 너무 쉬움: 실제 AI가 Growl 같은 음수 boosts를 자기 setup으로 판단해 반복하던 버그 수정. 아직 source 보스segments/관장고유후처리/랜덤트레이너/상세난이도 검증은 남음.
- 기술 hover 설명 + 모바일 i 버튼 요청: Korean826설명(pinnedPokéAPI) + 최신주요기술한글 + nativeShortDesc영어fallback, tooltip 구현. UI 동작 실제검증 더필요.
- 관장 사진 깨짐: server fullURL을client가다시URL템플릿으로감싼것이원인. normalize/fallback수정, 아래로컬PNG로교체. 상대 base스프라이트 폭20%/210px→15%/160px 축소;own25%/260→22%/230. 변형폼확대효과유지.
- 관리자 상단에 잘보이게: 상단관리자버튼 + 사이드바. 서버owner+비밀번호검증유지. UI는로그인된계정에진입보이되서버403은명시.
- 관리자 비밀번호 새 값은 **가장최근사용자메시지** 기준. 로컬ignored .dev.vars에만서버용저장(출력/클라이언트포함금지), ADMIN_EMAIL=second@sites.test 로QAidentity2를로컬테스트관리자로선택. **운영Sites환경의비밀번호는아직새값으로변경안함**. 최종출시시ADMIN_PASSWORD만nativeenvupdate하고기존ADMIN_EMAIL/다른Sites그대로.
- 틀리면 '비밀번호가 틀렸습니다.' 표시. API401/codeINVALID_ADMIN_PASSWORD 및UIinvalid-feedback rolealert실검증,맞으면200/HttpOnlySecurecookie/UI메뉴열림실검증.
- Bootstrap 적극활용: bootstrap@5.3.8 exact 설치, fullCSS를postcss로 .bootstrap-ui 안으로scope. script build-bootstrap-scoped.mjs/generated app/bootstrap-scoped.css/MITnotice보관. admin·eggshop적용,게임전투css격리. bootstrapJS는미사용.
- 되도록 한화면: 새 AdminConsole 3열+상단대상선택+하단savebar+기록별도탭. 1440x900에서 documentHeight900,saveBottom852,각panelclientHeight=scrollHeight=460(내부scroll0) 실제확인. outputs/admin-one-screen-1440x900.png. **viewport reset 완료**.

### 현재 앱 실제 연결
- app/rogue.tsx default는 app/rogue-classic.tsx로reexport. 구 v2 UI는 named LegacyRogue로보관(삭제안함). 새 /api/rogue-classic route 사용. 기존 /api/rogue legacy 보관. app/admin-panel.tsx default는새 app/admin-console.tsx로reexport,구 LegacyAdminPanel도보관.
- 새 RogueClassic UI: 5개슬롯/편성689DTO(종572+선택형태117)/실전/새기술결정/포획파티교체/3랜덤무료보상/유료즉시서비스/리롤/10웨이브interlude/route map/파티폼변화/알상점까지 연결.
- 새 lib/rogue-classic-game.mjs: actions.prepare/start/selectSlot/turn/capture/acceptCapture/learn/buyService/reroll/reward/skipReward/next/route/form/abandon/buyEgg/hatchEgg. document.classic만새코어저장. 구document.run/collection/inventory/coins 보관 (coins는이제meta상점지갑겸용).
- 시작:27종,고정default성격(실제원본 seed'default'배열),IV15EV0Lv5,10point6party,돈1000볼5. 성격23/27차이수정. 기본 moves가 last4이던것 first4로수정.
- ensureStarterSystem dexVersion3: .registered 필드로알/관리자등록과wild caught 분리. version1/2는기존관찰/포획데이터보관하며등록정책만명시마이그레이션. 기존origin gacha/admin은재등록보존. adminMoves예외허용.
- lib/rogue-egg-shop.mjs: 가격서버계산/재화서버차감/hiddeneggcontents/serverhatch/유전기bit+사탕+등록. 재부화거부. 즉시부화방식(사용자알구매요구에따름),원본의부화대기wave카운터와는다름(남은원본동등범위에기록).
- lib/rogue-classic-world.mjs:35바이옴정적풀,시간대,일부기후/연결,고정story스케줄,gym/rival/Elite/champ/evil 기본template/종/레벨생성. **원본동등완료아님**:랜덤트레이너없음,템플릿함수/후처리/라이벌finalreferencebalancing/evo강등&지연/전설reroll/luck등필수보완.

### 실제 새 native 엔진
- lib/rogue-battle-engine.mjs: source스탯/타입/PP초기화,스냅샷save/restore시sourceSpecies+baseSpecies재주입,커스텀instance이벤트callback복원,AI도동일clone. source영구Mega/Gmax,tera gating,더블actors/target/단일호환,KO직후XP/참가자,야생승리residual,포획코어.
- lib/rogue-ability-components.mjs,rogue-battle-continuity.mjs,rogue-battle-lifecycle.mjs,rogue-encounter-guards.mjs 연구코드를검토승격. 선택능력은Dex존재여부가드확장했으나 **192패시브모든고유효과동등검증완료아님**. 실제검증allowlist7과나머지구분필요. phase복합 suppressed/hardcoded rawAbility경계남음.
- continuity blockWaves와globalwave분리,새native적만add/team등록/입장,fakeoutwave첫턴/PP/boost/field/temporaryabilitytags유지. HP/PP/새기술boundary재동기화. trainer/비움변경은새B로리셋(현재순수source정책추가보완필요).
- lib/rogue-classic-growth.mjs:SourceXP곡선.325species+.675cubic(100도source식),EXPshare/Balance/Charm그룹별floor,KO즉시레벨업및후속새기술선택큐,friendship3/기절-5/candyfriendship3배. sourcepositiveNatureceil,WonderGuardHP1반영은pokemon-config에서rogueSourceId 있을때만.
- lib/rogue-transformations.mjs: sourceformdata&gatedtools/items로영구폼적용. GmaxCharizardHP118SpA134/Berserk,BlastoiseWaterSteel. Mega/Primal/Ultra/Gmax와Tera동시불가request+server가드. 폼옵션함수condition동적인것은아직미지원,비어있는condition정적변화위주.
- lib/rogue-classic-capture.mjs:sourceGen6 .1875 shake공식3checks,criticaldexchance/잠듦2.5/3xRogueball/shiny2/masterguarantee. native포획은ball1개소모/실패상대턴,야생한마리남을때,trainer/final포획불가. sourcebosssegment플레이아직부족.
- Capture직접XP후native성장stats재동기화는한번더검토필요(onFaint경로는구현/검증).
- **현재200층1단계승리후screen=finalphase에멈춤:2단계Eternamax action/UI/더블전환 미구현**. 새v3전체완주통과라고절대보고/배포하지말것.
- lib/rogue-classic-rewards.mjs:실제효과연결된지원registry 약50개,가중무료3/paid14서비스/리롤/道具스택/XP/PP/TM/formtools/돈. **원본모든보상/중첩/berries/TM등등가완료아님**. 소스전체poolweight/specialsystems 확장필수.
- 새 move-description.mjs/data826/script,power/accuracy/PP/priority/contact/targetDTO. MoveCard hover/focus/i tooltip. 신기술영어fallbackactualshortDesc.

### 관리자 새 파이프라인
- lib/rogue-admin.mjs: destination='starter'|'run' 필수,runSlot0..4. starter관리자등록(알등록예외)+adminCollection에실제편집레코드. run지급/수정은실제party/native전투rebuild,별도audit/revision. 파티6이면신규거절하고기존수정안내. 다른slot/탐험/legacy보호.
- lib/admin-mutations.ts Rogue분기는mutateRogueAdmin 호출. app/api/admin GET box+runSlots/destination/runSlot지원. auth오류메시지구분.
- 새 AdminConsole Bootstrap3열viewport그리드,새target모드/지급위치/slot선택. 서버종/폼/레벨/EXP/성격/ability/item/IV/EV/기술검증기존유지. 아직새파이프라인실API지급+수정/audit회귀테스트필요(순수unit통과).

### 자산 신규
- data/rogue-form-appearance.json + scripts/build-rogue-form-appearance.mjs:source선택폼202행(0포함)/nonbase117모두appID매핑. sourceform0shellosEast→app30039,scatterbugMeadow→app30276역전포함.
- pinnedSmogon실spritefilekeys201/202,nonbase116/117. **SpikyPichu확실한frontsprite 1누락**(metadata.omissions);임의base이미지가장안함. agent rogue_ui마지막턴capacity에러지만위파일은작성완료,root가읽고연결해서689catalog검증함. 재생성검증/저작권고지끝내야함.
- rogue-reference가crosswalk읽어nativeSpecies/sourceImage/sourceBack/shiny/SpriteKey주입. PokemonImage direct정확폼sourceImage지원,대체색상기본이미지오인방지. source이미지들의reducedmotion정지GIF처리검토필요.
- data/rogue-trainer-appearance.json363KB,script build-rogue-trainer-appearance.mjs. localPNG241개/191900bytes/80x80/HTTP200+SHA256검증. source272types중252매핑;gym74/E442/champ16전부. 미확인20개srcnull. root worldgenerator는selectedsrc+artist만DTO,클라이언트전체import없음. credit기본경로UI연결. **작가/권리조건종합출처페이지추가필요**.
- public/game/eggs/*.svg5개 owncodevector. trainerfallback.svg owngenericicon(실제원작얼굴이라고가장안함).

### 검증된 결과와 환경
- 최신 npm run typecheck통과. npmtest전체27개통과(rogue-admin추가후전체28개재실행은아직,관련3개지속통과).
- 새tests/rogue-classic-engine.test,rogue-classic-game.test,rogue-egg-shop.test,rogue-admin.test 존재.
- tests/release-classic-api.mjs 실제localDummy3 API로27초기등록→3party/10pt/Lv5/PP35→34/한국어설명/저장재조회/알구매부화/CSRF403 통과. slot5는이fixture사용. 재실행시이미알부화등록있으므로초기27절대assert는완화/독립신규fixture필요.
- 추가실증 .sites-runtime/integration-prototype/check.mjs 현재native7필수회귀통과:sourceGmax193HP/Berserk,source재주입,WaterSteel,레벨업직후PerishSong기절레벨rollback없음,SDPPHP유지→FakeOut→새상대패시브Levitate실면역.
- outputs/rogue-trainer-generation.md199줄,rogue-starter-gaps.md163줄 정확한sourcefacts. defaultPhaserRNG25줄/UTC일일Pokerus5 sourceID선정참조있음. **Pokerus현재앱미구현**.
- dev session64141은정상종료. 새 **session29643 npm run dev5173**,신규ignored .dev.vars서버바인딩반영됨. mockauth플러그인원복백업그대로(.sites-runtime/sites-vite-plugin.original.ts),최종패키징전mock원복+ignoredvars삭제 필수. 새pw파일존재하므로cat/GetContent출력금지.
- browser2/qaRogueTab7 localhostadmin 현재모드rogue/destinationrun/targetlocal_fresh/slot5선택,실제지급클릭안함. admin쿠키정상인증UI실증. 사용자다른localhost탭으로조작할수있으므로자동테스트는profile3고정·현재개인playDB변경주의.
- viewport는마지막CUA에서reset함. YouTube음소거유지(원본PokéRogue계정조작금지).
- 운영v4아직그대로. 이새코어는로컬개발본,이번변경은전혀배포하지않음. 원본동등/최종boss/모든능력아이템AI/관리자실API/PC모바일/자산licensesource고지완료후에만패키지/배포.

### 22:55 이후 추가 완료 (이전 finalphase/진화 미구현 메모 일부 대체)
- rogue-admin 실제 HTTP QA통과: 로컬dummyadmin2→dummyfresh3의slot5만PikaLv31지급→Lv67수정,nature/IV/EV/item/shiny/moves/nativebattle 재빌드/감사destination=run 검증. 운영데이터무변경. slot5party이제4마리.
- lib/rogue-evolution.mjs source544진화/15종정적condition 해석,수동진화API/partyUI/도구보상(일반·희귀) 연결. 자동진화안함,IV/HP/PP/스택소유자보존,새source종이native연속야생에서도실제반영(forceSpecies). Nincada→Ninjask시빈자리+normalball조건으로Shedinja생성·modifier복제/HP1/Wonderguard검증(원본은볼보유검사만,미소모).
- 진화후패시브종별변경반영. 여전히RandomForm시드가personality%value라originalPhaserseedoffset와완전같은seed재현아님;TreasureTracker보상/일부held조건관련registry나머지확장필요. nativeSleep등일부evo시상태세부보존은회귀확장필요.
- lib/rogue-boss.mjs 실제source지수식damagegate/4→5방벽/가중statboost,회복시shield재생안함. native엔진Pokemon.damage instancewrapper로실제적용(처음시도AfterDamage는native이벤트없어수정). bossboost는ignoreAbilities=true이므로직접단계증가+native로그. 원본수식테스트통과.
- lib/rogue-final-battle.mjs 최종200층이제같은적개체Eternatus4구간마지막index0→Eternamax5구간실전전환. phase1HP1이하기절방지,적회복/태그정리/상태치료/새기술Recover1PP,playerHP/PP/boost/field유지,기존lead재입장안함/newpartner만입장. 원본처럼pendingenemyMove만취소,파트너입장은residual끝에. format참조gen9doublescustomgame·activePerHalf2·p1.active2,p2.active1(빈enemy slotPadding은native크래시). snapshot왕복+2v1실턴+마지막KO승리까지syntheticfixture 테스트통과.
- 최종전Moves phase1Eternabeam5/SludgeBomb10/Flamethrower15/CosmicPower20,phase2DynamaxCannon5/CrossPoison20/Flamethrower15/Recover1. IV31level100explicitoverrideHP421→651,기본Pressure·NeutralGaspassiveOFF. MiniBlackHolemod1 지급,Residual도구1stack흡수/StickyHold/최대중첩가드/실제nativehelditem take&set 구현. **멀티nativehelditem은수신자가이미nativeitem을가진경우아직제한**,추가registry검증필요.
- 아직최종전PerishSong/DestinyBond직접faint/멀티히트세부phase/턴잔여치유순서등전체원본동등경계 추가검증필요. 전체완료배포허용아님.
- Source최종boss포획게이트:572starter중571caught기록,마스터볼은challenge없을때shield우회+phase1에서도가능. API/UIcaptureAllowed구현. 일반boss도masterballshield우회,WonderGuard예외/sourceIndex gate. egg-only등록정책과caught기록은별도.
- `classicMaxPP`가서버NPC roguePPMax.recover1지원. partner2대1AI signedtarget요청도실제activePerHalf로판정.
- 보스HPUI구간tick/남은shield수,적폼데이터바뀜에맞춘finalsnapshot반영. Eternamax라벨/거대배율 등시각전용세부마무리남음.
- lib/korean-text.mjs subject/object/topic/direction 추가. full-battle로그이름조사/능력치조사와p2'야생/상대'접두어개선. 전체전투메시지극본완료는아님.
- tests추가 rogue-boss.test.mjs,rogue-evolution.test.mjs,rogue-final-battle.test.mjs 통과. 최종전fixture는불법능력접근가능성/밸런스주장이아닌synthetic mechanics 검증임(코멘트명시),natural200완주검증은미완료.
- source조사추가 outputs/rogue-final-boss-rules.md142줄, .sites-runtime/final-transition-prototype/{README,transition,check,resume,results}. agentown프로토타입rawAPI통합은rootproduction에독립반영함.
- 최근typecheck통과. CSS/logic변경후전체npmtest+실브라우저regression다시필요. bootstrapOneScreen최종1440x900 body900/panel460=content460/savebar852검증스크린샷첨부commentary완료. viewportreset완료.

### 2026-11-03 이후 최우선 최신 상태
- 사용자 최신 기본 해금 변경: 초기 스타팅 27종 중 플레이어별 랜덤 1종만 등록. dexVersion4로 기존 egg/admin 획득은 보존, 이전 기본 26종만 잠금. 계정 기준 결정적 seed로 미저장 GET/새로고침에도 동일, 초기화는 새 random seed. 기본 종 1마리만 IV15/EV0/Lv5. 사용자 이전요청(포획은 스타터해금 아님, 알 부화/관리자지급으로해금) 유지.
- 새 탐험전용 채팅을 같은 포켓몬 프로젝트에 실제 생성: 01a19cdc-65e0-7ab1-b73b-3eda873a3a07. ADVENTURE_HANDOFF.md와 소유범위를 초기에 전달. 여기서는 로그라이크 및 공통시스템 작업 계속.
- 관리자 초기화/복구: db/schema.ts와 drizzle/0010_polite_jackpot.sql 추가, 로컬에만 마이그레이션 적용. lib/admin-player-reset.ts, components/admin-player-reset.tsx, admin API/UI 연결. 게임·닉네임 확인, 스냅샷 CAS, 트랜잭션 백업, 감사기록, 초기화 후 진행이 바뀌면 복구차단. 탐험은 온라인대전/미완료교환 중 차단. 실제 로컬 dummy3만 초기화→복구/오류/감사/계정프로필보존 양쪽게임 테스트통과. 운영DB에는 미적용.
- 알 상점은 사이드바·상단 '알 뽑기'로 직접 접근. 동일 종·폼·색상 중복 부화는 구매가25% 서버환급,중복에도 사탕·유전기·IV 갱신; 첫 신종/폼/색상은 환급없음. 단위테스트통과.
- 기술3개 이하일 때 빈 슬롯에 자동학습,4개가 차야 교체선택. 이전에대기중인저장도repair. native실전요청에도새기술반영.
- 더블배틀 기절한 슬롯은 대기, 벤치있으면 강제교체, 벤치없으면 살아있는 포켓몬만 행동. 교체 후 stale CPU명령 실행오류도 수정. 빈/기절 Pokemon과 HP바는 연출 종료 후 숨김. 실제 native전투테스트통과.
- 더블야생 적 둘 중 포획대상선택/볼 종류별 원본 atlas/서버 대상검증, 한 마리포획 후 남은적과 전투 유지. 빈파티공간이면새고유ID로자동추가;6마리면선택후교체/놓아주기. 강제교체/남은상대턴/스냅샷 검증. 관련 `tests/rogue-double-capture.test.mjs` 통과. 코드최근연결이므로 실제브라우저/전체200층 회귀는 아직 필요.
- BattlePanel 설명툴팁중복방지, 포획결과·승리패널 개선, boss-announcement/battle-polish CSS연결. 포켓몬 기절후sprite/HP HUD 숨김. 새기술비교 rogue-move-learn 및 웨이브완료 rogue-wave-clear UI를부모에연결.
- 원본 볼 atlas `public/game/balls/pb.png`/json은원본무수정, 전용metadata에권리조건(LicenseRef-FAIR-USE) 기록. Spiky-eared Pichu HGSS front/back/shiny4개의공식PokeAPI PNG가추가검증되어 202개명시적선택폼에실제front/back/shiny 식별경로 있음.
- Pokerus UTC일일5스타터 및 party전파/기본희귀도+행운 기록, Minun TM 원본정적필터 보정. 관장/트레이너 272종 template정적규칙,272종 species filter,561 member callback IR을독립AST추출. template일부연결했으나 species filter/member 1082 opcode/Rival후처리 전체런타임연결은미완성.
- 2026-11-03 latest: `npm run typecheck` 통과, `npm test` 34개 통과. 실제200층 자연완주/모바일/모든특성·중첩아이템·트레이너 고유효과와자산라이선스/운영관리자암호변경은 미완료. 공개사이트는 여전히기존 v4. 미완성출시 금지라는사용자조건 준수.
- dev server session 29643/port5173, 임시mockauth와무시된 .dev.vars에사용자지정신규관리자암호(출력금지) 포함. 최종패키징전 mock플러그인을 `.sites-runtime/sites-vite-plugin.original.ts`로복원, .dev.vars 제거. 출시때만 지정 Sites 프로젝트의 ADMIN_PASSWORD를사용자최신값으로native environment update하고 ADMIN_EMAIL/기존다른Sites보존.

### 2026-11-03 GitHub 이어받기 — 저장 보존 및 출처 정정
- 기준 `main` b9a2eca. 이 문서의 이전 2026-11-03 항목 중 “이전 기본 26종만 잠금”은 기존 사용자 데이터 보존 요구와 충돌한다. `dexVersion` 1~3 기존 저장을 4로 이관할 때 이전에 등록된 스타터를 잠그거나 도감 항목을 삭제하지 않도록 수정했다. 버전 2의 기존 등록값과 버전 1의 기존 성격도 보존한다. 신규 계정은 여전히 계정별 결정적 시드로 무작위 기본 스타터 한 종만 받는다. 이미 버전 4로 이관되어 손실된 데이터는 이 변경으로 복구할 수 없으며, 확인되지 않은 값을 추정해 복구하지 않는다. 미버전·불완전 저장과 실제 운영 데이터의 다양한 이관 사례는 추가 검증 필요.
- `ATTRIBUTIONS.md`의 “포켓로그 자산을 복사하지 않았다”는 잘못된 설명을 수정했다. 실제 볼 아틀라스와 원본 기반 데이터의 출처 및 상류 고지를 명시했으며, 아티스트별 사용자 화면 고지 및 전체 권리·라이선스 검토는 미완료다.
- 이 스냅샷의 코드 및 테스트에서 초기 해금, 알, 기술 학습, 더블배틀 포획·기절, 수동 진화, 변신, 관리자 분리 구현을 확인했다. 이는 테스트된 경로가 있다는 뜻이며 사용자 요구 전체의 실서비스 완성을 뜻하지 않는다. PvP 보유 검증, 관리자 실제 인증·수정, 양 모드 저장 이관은 운영과 분리된 실제 통합 환경에서 추가 확인해야 한다.
- Node 24에서 `npm run typecheck` 통과, `npm test` 39개 통과. 저장 이관 회귀 테스트를 확장해 버전 1~3의 기존 성격·등록·도감과 신규 계정 기본 1종을 검증했다. 테스트는 실제 운영 데이터를 사용하지 않았다.
- 원본 참고: https://wiki.pokerogue.net/gameplay:modes:classic 및 https://wiki.pokerogue.net/gameplay:mechanics (보스·200층 규칙 자료). 검색에서 게임 영상 목록을 확인했으나 영상을 시청하거나 영상 기반 연출을 비교 검증하지 못했다.
- 다음 작업: 저장 이관·관리자/PvP의 실제 서버 경계 및 동시성 검증, 로그라이크 전체 200층 자연 플레이와 PC/모바일 브라우저 QA, 볼/공격/보스 애니메이션 검증·개선, 미연결 트레이너 규칙과 변신 경계 구현, 자산별 권리 검토. 탐험 모드 및 Z-A 스토리는 미완성으로 보존한다. `.sites-runtime/`과 `outputs/`의 과거 로컬 자료·계정·서버는 이 체크아웃에서 확인되지 않았으며 존재를 가정하지 않는다. 배포하지 않았다.

### 2026-11-03 클라우드 독립 검증 기록
- GitHub 개발 브랜치 원격 `f689e859e9ebab6fbc2fc08f9123e54b9e6c50ee`에서 독립 브랜치 `codex/classic-validation-20261103`을 생성했다. 이 커밋에 껍질몬 고정 벌레 테라스탈 수정이 포함된다. 기존 브랜치와 탐험 파일은 변경하지 않았다.
- Sites 공개 최신 저장 버전은 v4 (`7b9de08d0903f054be19d8ae7592a529571e85bb`). Sites 개발 브랜치의 원격 HEAD는 이 검증에서 확인하지 못했다. 배포하지 않았다.
- Node v24.19.0에서 `npm run typecheck` 및 `npm test` 76개 통과. 테스트 중 200층 검사는 각 층의 합성 1턴이므로 실제 완주가 아니다.
- `node scripts/classic-natural-probe.mjs`는 일반 게임 액션으로 포획·전투·회복·보상·수동 진화를 시도하고 매 행동 사이 JSON 저장 왕복을 수행하는 탐색용 자동 플레이어다. 인위적 전투력 주입 없이 실행한 한 번은 20층 패배, 최종 스크립트 실행은 8층 패배했다. 랜덤 실행과 단순 전략이므로 재현 가능한 200층 완주나 밸런스 검증은 아니다.
- 일반 3턴 다이맥스 및 Z기술은 아직 미구현이다. 클래식 엔진은 gen9이고 거다이맥스는 별도 지속 폼이어서 gen8 기능을 단순 활성화하면 테라스탈·HP·PP·저장 복원과 충돌할 수 있다. 설계, 구현과 실제 전투/복원 검증이 필요하다.
- 공통 전투 엔진 및 `components/battle-panel.tsx`는 탐험에서 공유한다. 후속 수정은 탐험 병렬 브랜치와 파일별 비교 및 회귀 검사가 필요하다. 운영 데이터, DB, 비밀값, 배포는 건드리지 않았다.
- 추가 격리 실험: gen9 네이티브 전투에서 `dynamaxUsed`만 해제하고 다이맥스 명령을 보내도 시뮬레이터가 Gen 8 전용이라며 거부했다. 따라서 UI 플래그만 켜는 방식은 동작하지 않는다. 이 실험은 제품 코드에 반영하지 않았다.

### 일반 다이맥스 싱글 전투 — 작업 중
- 밴드 획득 시 클래식 싱글 전투에서 네이티브 Max Move, 3턴, 교체 시 종료, 전투당 1회, 테라스탈·기존 거대/메가 폼과의 제한을 연결했다. HP 배율, 레벨 상승, 기존 저장 마이그레이션, 연속 야생전 및 새 전투 경계를 처리한다. 기존 야생전 연속 저장의 사용 이력은 보존한다.
- `tests/rogue-normal-dynamax.test.mjs`에서 밴드/테라 조건, 공격 및 상태기술, JSON 복원, 종료·교체·전투 경계·연속 야생전·레벨 상승·기존 저장을 검사했다. 레벨 상승 보정 후 전체 테스트 77개와 타입 검사가 통과했다. 실제 Faint/EXP 경계도 별도 테스트했다.
- 더블배틀 발동과 대상 선택은 아래 후속 작업에서 추가했다. 활성 상태로 최종전이 더블로 전환되는 경계와 브라우저 연출은 추가 검증이 필요하다. Z기술도 미구현. 원본 규칙과의 완전 일치, 200층 자연 완주 또는 배포 가능 판정은 아니다.
- 변경 파일 `lib/rogue-battle-engine.mjs`, `lib/rogue-classic-game.mjs`, `lib/rogue-classic-growth.mjs`, `lib/rogue-classic-rewards.mjs`는 클래식 전용이나 공통 전투 패널과 DTO가 연결되므로 탐험 브랜치와 통합 전에 비교해야 한다.

### 일반 다이맥스 더블배틀 확장 — 작업 중
- Max Move별 표시와 대상 선택을 별도 DTO 변형으로 제공하여 전체 공격→단일 적, 변화 기술→자신 등 원래 기술과 대상이 다른 경우를 처리했다. 같은 턴에 두 포켓몬이 같은 변화를 선택하는 명령도 UI와 서버에서 거부한다. 기존 탐험/PvP에는 변형 DTO가 없어 기존 기술 표시가 유지된다.
- `tests/rogue-normal-dynamax.test.mjs`에서 더블배틀의 Surf→Max Geyser 대상 2개, 잘못된 대상 및 중복 발동 거부, 실제 행동과 이후 요청을 검증했다. 전체 테스트 77개와 타입 검사 통과. 브라우저에서의 클릭·연출 및 최종전 변환 경계는 여전히 미검증이다. Z기술과 200층 자연 완주는 미완료.
- 공통 파일 `components/battle-panel.tsx`가 변경되었다. 탐험 스레드의 같은 파일 변경과 반드시 비교·병합하고 탐험 및 PvP 회귀를 확인해야 한다. 이 독립 브랜치에서만 수정했다.

### Z기술 및 최종전 변신 경계 — 작업 중
- 별도 Z링 보상과 18개 일반 타입 Z크리스탈 보상을 추가했다. 크리스탈은 기존 native 지닌 도구를 덮어쓰지 않으며, 빈 슬롯을 가진 파티원에게만 지급하고 빈 슬롯으로 옮길 수 있다. 이 보상 빈도와 조합은 이번 구현의 게임 규칙이며 참고 원본과의 동일성은 확인하지 않았다. 전용 Z크리스탈을 보상으로 얻는 경로와 브라우저 검증은 남았다.
- Z링/크리스탈/기술 타입·PP 조건, 전투당 1회, 싱글·더블 대상, 공격과 변화 Z기술, JSON 복원, 야생전 사이 장착·이동, 기존 도구 보존을 검사했다. 변화 Z기술의 native 로그가 공통 화면 이벤트 생성에서 오류를 내던 것도 수정했다.
- 다이맥스가 활성화된 상태에서 200층 최종전이 싱글에서 2대1 더블로 전환된 뒤 실제 턴을 실행하는 합성 fixture를 추가했다. 자연 200층 완주와 동일한 검증은 아니다.
- `npm test` 78개와 `npm run typecheck` 통과. 공통 `lib/full-battle.mjs`의 로그 파서와 앞서 변경한 `components/battle-panel.tsx`는 탐험/PvP 공유 파일이므로 병렬 스레드 통합 전에 반드시 비교·회귀 확인한다. 운영 배포는 하지 않았다.

### 자연 진행 재현 도구
- 탐색 플레이어가 새로 배울 공격 기술을 기존 기술과 비교하도록 개선했다. 10회 실행은 8층 전후부터 18층까지 도달 후 모두 패배했고 실행 예외는 없었다. 자동 전략의 한계가 있으므로 게임의 완주 불가능성을 뜻하지 않는다.
- `node scripts/classic-natural-probe.mjs --save-start /tmp/classic-start.json`과 `node scripts/classic-natural-probe.mjs --resume /tmp/classic-start.json`으로 테스트용 초기 저장을 재실행할 수 있다. 동일 초기 저장 두 실행의 출력이 일치했다. 이 도구는 실제 계정이나 운영 DB를 사용하지 않는다.

### 전용 Z크리스탈 보상
- 시뮬레이터의 전용 도구 대상 종과 필요 기술을 확인해 전용 Z크리스탈을 별도 희귀 보상으로 생성한다. 피카츄와 볼트태클을 이용해 전용 보상 생성·수령·전투 사용을 확인했다. 빈 도구 슬롯이고 전용 종 조건이 맞는 파티원으로만 이동할 수 있으며 울트라네크로Z는 폼 관련 부작용을 피하려고 이동 대상에서 제외했다.
- 보상 확률은 현재 게임의 설계값이며 원본과의 동등성은 미확인이다. 희귀도와 전용 크리스탈별 모든 폼 조합, UI와 장기 플레이는 계속 검증해야 한다.
- 연속 야생전에서 크리스탈을 대기 포켓몬에게 옮겼을 때 simulator의 `setItem`이 비활성 포켓몬에 실패하는 오류를 재현했다. 활성 포켓몬은 기존 아이템 이벤트를 따르고, 대기·기절 포켓몬은 다음 등장 시 사용할 아이템 상태를 갱신하도록 수정했으며 저장 복원 후 양쪽 슬롯을 검사했다.
- 자동 플레이어는 대상 보상·변신·저체력 교체·6마리 포획을 시도하도록 개선했다. 개선한 10회는 8~21층에서 패배하고 예외는 없었다. 별도의 이전 실행은 22층에서 패배했다. 이는 200층 승리나 밸런스에 대한 결론이 아니다.

### 더블배틀 동시 기절 교체 오류 수정
- 자연 진행 자동 플레이에서 두 활성 포켓몬이 함께 쓰러지고 대기 멤버가 하나일 때 두 자리 모두 같은 대기 멤버로 교체하라고 요구하는 오류를 발견했다. 전투 요청에서 살아 있는 서로 다른 대기 멤버 수만큼만 교체를 요구하고 나머지 빈 자리는 pass로 처리한다. 실제 Earthquake 동시 기절·저장 JSON 복원·교체 후 턴 요청까지 회귀 테스트를 추가했다.
- 자동 플레이어는 복원한 전투의 예상 피해를 참고해 기술과 교체를 선택하고, 오류 시 `--save-failure /tmp/파일명`으로 해당 시점의 테스트 저장을 남길 수 있다. 전략에 따른 패배는 게임의 완주 불가능성이나 200층 완주 성공을 뜻하지 않는다.

### 최신 우선순위와 원본 조사 — 2026-11-03
- 사용자 최신 지시: 일반 다이맥스와 Z기술은 명시적으로 구현하되, 진화·알 뽑기 등 기존 요구가 포켓로그와 다르면 원본을 우선한다. 따라서 두 기술은 **사용자 요청 확장**이며 원본 동등 기능이라고 주장하지 않는다.
- 현재 원본 `pagefaultgames/pokerogue`의 `7c0881255af5cd51992e513ff93c2f71adbe40e0`을 읽었다. `src/modifier/modifier-type.ts`의 다이맥스밴드는 거다이맥스 접근 도구이고, 원본 이슈 https://github.com/pagefaultgames/pokerogue/issues/5937 에서 Z기술은 계획하지 않는다고 명시한다. 일반 다이맥스/Z 보상은 이 게임의 별도 확장이다.
- 원본 `src/constants.ts`/`src/system/game-data.ts`에 맞춰 기본 스타터 27종을 해금하고, 포획한 종과 진화 전 계열을 스타터에 등록한다. dexVersion 5 이관은 기존 개체값·폼·사탕·알·다른 데이터와 이전 랜덤 스타터 기록을 지우지 않는다. 테스트는 이전 v4 포획 기록의 추가 해금과 이관 멱등성도 검사한다.
- 원본 `src/phases/level-up-phase.ts`, `src/phases/evolution-phase.ts`에 따라 새 레벨 획득 시 도구가 필요 없는 첫 진화가 자동으로 시작하며 취소 또는 일시 중지 가능하다. 대기 결정은 저장되고 기존 저장을 여는 것만으로 역행 진화하지 않는다. 전투 중 레벨업 후 원래 전투를 다시 여는 synthetic fixture 통과. 브라우저·다중 레벨과 조건의 완전한 원본 순서 검증은 미완료.
- 원본 알 뽑기는 바우처 1/5/10/25회, 세 종류의 가챠, 등급 확률·누적 보정과 10/25/50/100 웨이브 부화를 사용한다. `lib/rogue-egg-gacha-rules.mjs`에 확인된 티어·천장·묶음 보장과 관장/사천왕/챔피언 바우처 보상을 구현했으나 **기존 코인 알 상점은 아직 교체되지 않았고 바우처 사용·알 생성·웨이브 부화가 연결되지 않았다.** 기존 코인과 구매한 알은 보존해야 한다. 원본 legendary 일일 순환·마나피·잠재력·희귀 유전기 등도 별도 구현과 검증이 필요하다.
- 다이맥스 관련 30회 탐색은 이전 확장 규칙에서 가장 깊게 90층까지 진행한 뒤 패배했다. 이 결과는 200층 자연 완주가 아니며 새로운 진화·알 규칙 전체의 검증도 아니다. 탐험 병렬 작업과 충돌 가능 파일은 `components/battle-panel.tsx`, `lib/full-battle.mjs`; 분기 병합 전 반드시 비교한다.
- 확인된 원본 보상 중 체육관 관장·사천왕·챔피언·악의 조직 리더의 최초/재승리 바우처를 계정에 적립하고 저장 복원 후 중복 지급을 방지했다. 이벤트별 보너스와 다른 보스의 개별 예외는 미검증이다. 알 후보의 비용별 가중치와 레어 유전기 확률도 별도 규칙 테스트를 추가했으며, 바우처 소비/생성과 부화 경로는 아직 연결하지 않았다.
- 레벨 진화가 활성 다이맥스와 겹칠 때 임시 HP 배율을 보존하도록 보완했고, 실제 트레이너 전투의 첫 상대 처치→진화→같은 전투 재개 fixture가 통과했다. 원본 7c08812 기준 구현이며 사용자 요청 일반 다이맥스는 별도 확장으로 남긴다.

### 기본 스타터 변경 경위와 최신 지시
- 원격 기존 개발 기준 `f689e85`는 신규 계정에 기본 27종 중 무작위 1종을 지급했다. 2026-11-03 이 독립 작업에서 포켓로그 우선 지시를 받은 뒤, 작업자(Codex)가 원본 기본 27종 지급 규칙을 적용한 로컬 커밋 `4b9d987`을 만들었다. 이 변경을 먼저 사용자에게 별도 보고하지 못했다.
- `4b9d987` 작성 당시 원격에 푸시하거나 운영 사이트/DB에 배포하지 않았다. 테스트는 독립 작업 사본의 합성 데이터에서 실행했다. 이후 인계를 위해 브랜치 이력을 푸시하면 해당 커밋도 이력에 포함되지만, 후속 커밋에서 최신 1종 규칙을 복원한다. 직전 원격 브랜치 `fe1e171`도 1종 규칙이었다.
- 사용자가 이후 명시적으로 27종 중 무작위 1종 지급을 재지정했다. 신규 계정에 다시 1종을 지급하도록 변경한다. 이것은 포켓로그 기본 27종 지급에 대한 명시적 예외다. dexVersion 5 등에서 이미 해금된 스타터는 잠그지 않으며, 포획·부화·관리자 기록 및 기존 저장을 삭제하지 않는다. `initialStarterId`를 보존해 반복 조회에서 중복 지급하지 않는다.
- 원본과 다르거나 기존 규칙을 바꾸는 사항은 변경 전후·영향·적용 범위·남은 검증을 이 기록에 남기고 상위 채팅에 전달한다. 운영 배포는 승인되지 않았다.

### 개인 기록·글로벌 순위·친구 활동 표시
- 개인 화면의 최고 도달 웨이브는 현재 슬롯과 보존된 최근 도전 기록만 사용한다. 오래전에 잘려나간 기록은 복원할 수 없으므로 평생 전체 기록으로 단정하지 않는다.
- 글로벌 순위는 기능 도입 후 서버가 생성한 도전의 승리 웨이브를 서버 저장과 같은 SQLite/D1 배치에서 기록한다. 클라이언트 점수 입력을 사용하지 않고 관리자 지급 스타터 또는 도중 관리자 수정을 확인한 도전은 제외한다. 과거 저장은 무검증 순위로 자동 편입하지 않는다. 동점은 같은 순위로 표시하며 기록이 없으면 빈 상태다. 기존 보유 스타터 데이터의 과거 경로를 전부 증명할 수 없으므로 완전한 부정행위 방지라고 주장하지 않는다.
- 친구의 `players.last_seen`은 인증된 서버 활동을 뜻한다. 화면이 보이는 동안 주기적 신호를 보내고 최근 2분의 실제 활동만 `온라인 · 최근 2분 활동`으로 표시한다. 오래되었거나 확인할 수 없는 경우 `접속 상태 확인 안 됨`으로 표시하며, 요청 대기 중인 관계에는 상대 활동을 제공하지 않는다. 시간 창은 현재 접속을 보장하지 않는다.
- 격리 SQLite에서 실제 API의 인증·출처 거부, 친구 관계 범위, 동점, 서버 계산 점수, stale revision과 관리자 수정 제외를 검사했다. 화면 클릭/다중 기기·실운영 D1 검증은 미완료다. 신규 마이그레이션 `drizzle/0011_classic_leaderboard.sql`과 공통 `db/schema.ts`, `app/page.tsx`, `app/social.tsx`, 친구 API는 탐험 병렬 작업과 반드시 비교·병합해야 한다. 운영 DB에 마이그레이션하거나 배포하지 않았다.

### 바우처 알 뽑기 연결 — 2026-11-03
- 위의 '연결되지 않았다'는 항목은 당시 기록이다. 현재 독립 브랜치에는 바우처 사용, 세 종류(유전기 UP·전설 UP·이로치 UP), 알 생성, 저장·복원과 승리 웨이브 자동 부화를 연결했다. 원본 코드 기준은 `pagefaultgames/pokerogue` 커밋 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [egg.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/egg.ts), [rates.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/balance/rates.ts), [egg-gacha-ui-handler.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/ui/handlers/egg-gacha-ui-handler.ts), [victory-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/victory-phase.ts)다. 후보 종과 비용은 이 저장소에 고정된 1.12.2.3 참조 데이터를 쓰며 최신 원본 후보 목록과 동일하다고 단정하지 않는다. 변형 가능 종 키는 `data/rogue-variant-keys.json`에 고정된 원본 에셋 커밋과 사용 조건을 기록했다.
- 일반/희귀/에픽/전설 기본 추첨은 204/44/7/1을 256분율로 사용하고, 원본의 가챠별 누적 보정과 묶음 보장, 10/25/50/100 승리 웨이브 부화, 마나피 알 50웨이브 및 마나피 1/8, 종 비용 가중치·전설 일일 추천·희귀 유전기·이로치 확률을 구현했다. 가챠 알은 알 수 있는 정보만 화면에 보여주며 부화 전 종을 숨긴다. 기존 코인 알은 이전 그대로 수동 부화 및 중복 환급한다. 기존 코인/알/계정은 이관 삭제하지 않는다.
- **규칙 변경과 영향:** 이전에는 코인으로 알을 구입해 즉시 수동 부화했지만, 원본 우선 지시에 따라 신규 구입은 바우처 뽑기와 전투 웨이브 부화로 바꾸었다. 기존에 이미 산 알과 코인은 유지한다. 이 변경은 독립 개발 브랜치에만 있으며 운영 사이트에 반영하지 않았다. 유저 검수 시 이 전후 차이를 함께 전달한다.
- 아직 원본 완전 재현은 아니다. 고정된 종 데이터와 최신 원본 종 데이터 차이, 지역/특수 폼의 변형 에셋 매핑, 원본과 완전히 같은 난수 시드·호출 순서, 이벤트/특수 보스와 상점 보상 등 모든 바우처 획득 경로, 부화 애니메이션과 브라우저/운영 D1 동작은 미검증 또는 미구현이다. 무작위 결과의 정확한 동일 시드 재현은 주장하지 않는다. 더블 배틀·200층 자연 완주는 별도 검증이 필요하다.
- 격리 SQLite 실제 API에서 바우처 1회 소비 뒤 같은 revision의 요청을 재전송했을 때 409와 알 1개/바우처 0개 유지를 확인했다. 합성 전투·JSON 복원에서 자동 부화와 기존 코인 알 보존, 10/25/50/100 웨이브, 200층 제외, 99개 상한, 마나피 분기를 검사했다. API 파일은 다른 스레드와 통합 전에 비교한다. 운영 배포 및 DB 변경은 하지 않았다.
- 최종 회귀: `npm test` 83개 통과, `npm run typecheck` 통과. 200층 합성 1턴 검사는 자연 200층 완주가 아니다.

### 포켓로그 UI 배치 반영 — 2026-11-03
- 사용자 요청에 따라 알 뽑기 화면을 원본 `7c088125`의 `src/ui/handlers/egg-gacha-ui-handler.ts` 구조를 참고해 세 기계, 상단 바우처 수량, 하단 안내/뽑기 선택 창으로 바꾸었다. 기존 코인과 알·부화 버튼 및 실제 바우처 동작은 유지한다. 기계 그림은 현재 프로젝트의 알 그림과 CSS로 표현하며 원본 픽셀 자산의 동일 복제는 아니다.
- 실제 로컬 브라우저에서 1440px 및 390px 너비, 세 기계의 선택 상태, 다섯 뽑기 버튼, 페이지 가로 넘침 없음을 검사했고 타입 검사 통과했다. 기존 운영 사이트는 변경하지 않았다. 전투·스타터·다른 로그라이크 화면은 아직 이 배치로 전면 재작업하지 않았다.
- 미구현: 최신 원본과 알 종 후보 데이터·지역/특수 폼의 일치 여부 및 미연결 바우처 획득 경로, 원본과 동등한 모든 UI/연출. 구현됐으나 검증 미완료: 200층 자연 완주, 다이맥스·Z기술의 모든 조합, 진화의 모든 복합 조건, 실제 운영 D1 및 여러 기기 동작. 앞서 검증한 200층 합성 시작/1턴은 자연 완주를 뜻하지 않는다.
- 범위 정정: 사용자는 알 뽑기만이 아니라 게임 플레이 화면 전체를 포켓로그 배치에 맞추라고 했다. 추가로 스타터 상세를 왼쪽·도감 목록을 오른쪽으로 배치하고 전투 메시지/명령, 스타터, 보상 화면의 창 테두리와 색을 클래식 모드에 한해 조정했다. 로컬 테스트 계정에서 실제 스타터 추가→전투 진입→파티 명령과 모바일 390px 가로 폭을 확인했다. **이는 전체 화면의 완성이나 원본과의 완전 일치가 아니다.** 전투 내 세부 화면, 파티·보상·저장 및 결과 화면은 원본과 나란히 추가 대조하고 구조와 모바일 상호작용을 이어서 검증해야 한다. 공유 BattlePanel 자체는 수정하지 않았고 클래식 전용 스타일만 추가했다.

### 관리자 알 바우처 지급
- 관리자 인증 후 로그라이크와 플레이어를 선택해 일반·플러스·프리미엄·골드 바우처를 1~9,999장 지급한다. 로그라이크 계정의 바우처에 더하며 코인·보유 알·탐험 데이터는 바꾸지 않는다. 저장 revision 비교와 감사 기록을 같은 D1 배치에 넣고, 지급 요청 UUID를 저장해 같은 요청 재전송은 중복 지급하지 않는다. 동시 저장 충돌은 실패 처리하며 동일 요청으로 재시도할 수 있다.
- 글로벌 순위의 관리자 지급 제외 정책을 유지하려고 일반 바우처를 먼저 소비하고, 관리자 바우처를 사용한 묶음에서 나온 알에는 출처를 기록한다. 그 알에서 부화한 종은 기존 등록분까지 관리자 지급 종으로 표시되어 이를 선택한 이후 새 도전은 글로벌 순위에서 제외된다. 이 보수적인 종 단위 처리의 영향은 관리자 화면에 명시했다. 관리자 바우처와 일반 바우처를 섞어 한 묶음을 뽑으면 묶음의 모든 알에 이 정책이 적용된다.
- 격리 SQLite의 실제 관리자 API에서 인증·출처 검증, 잘못된 종류/수량, 동일 요청 재전송, 저장 경합, 감사 기록 1회, 탐험 데이터와 기존 코인 보존을 검사했다. 뽑기/부화 테스트는 일반 바우처 우선 소비와 관리자 출처 및 스타터 등록을 검증했다. 실제 운영 D1·관리자 브라우저 흐름은 아직 검증하지 않았다. 운영 배포 및 마이그레이션은 하지 않았다.
- 전체 회귀 `npm test` 83개와 타입 검사가 통과했다. 마지막 추가 유효하지 않은 종류 검사도 별도 관리자 API 테스트에서 통과했다.

### 완주 바우처 및 관리자 지급에 대한 최신 지시
- 원본 `7c088125`의 `src/phases/game-over-phase.ts`, `src/system/achv.ts`, `src/system/voucher.ts`를 대조해 클래식 첫 승리 업적의 골드 바우처 1장을 추가했다. 계정별 잠금 기록을 통해 중복 지급을 방지한다. 도입 이전 승리 이력에 대하여 소급 지급하지 않고, 기존 계정도 도입 후 처음으로 실제 완주했을 때 한 번 지급한다. 합성 최종전의 실제 게임 액션 및 저장 복원에서 확인했으며 200층 자연 완주는 아직 아니다.
- 사용자 최신 지시로 관리자 바우처로 부화한 종과 관리자 지급 포켓몬도 일반 획득처럼 새 글로벌 순위 도전에 사용할 수 있다. 이전에 기록된 `adminGranted`, 바우처 지급 및 알 데이터는 삭제하지 않고 새 도전의 판정에서 지급 여부를 배제했다. 명시적 관리자 **수정**은 기존 순위 제한을 유지하며 신규 수정부터 원인을 별도 기록한다. 과거에 제외된 진행 중 도전은 지급 때문인지 수정 때문인지 구별할 이력이 없어 `rankingEligible`을 무조건 재활성화하지 않았다. 예전 스타터 수정은 지급과 저장 필드를 공유해 완전한 소급 구분이 불가능하다. 이전에 제외되어 순위에 등록되지 않은 기록도 자동 복원하지 않는다.
- 관리자 포켓몬 지급은 기존 화면에서 대상·종·폼·레벨 등을 선택하는 기능을 유지하고, 지급 요청 UUID와 내용·결과를 새 `admin_grant_requests` 테이블에 원자적으로 기록해 같은 요청 재전송 시 중복 지급을 방지한다. 같은 UUID로 다른 지급을 요청하면 거부한다. 로그인/관리자 인증과 출처 검증을 서버에서 유지하며 감사 기록도 지급당 한 번만 남긴다. 격리 SQLite 실제 API에서 로그라이크·탐험 지급 재시도와 내용 변경 거부, 인증·경합·기존 데이터 보존을 검사했다.
- `drizzle/0012_admin_grant_requests.sql`, `db/schema.ts`, `lib/admin-mutations.ts`, `app/admin-console.tsx` 등은 탐험 병렬 브랜치와 충돌 가능성이 있어 통합 시 비교해야 한다. 관리자 UI의 실제 브라우저 지급과 운영 D1은 미검증이며 운영 배포·마이그레이션은 하지 않았다.
- 변경 후 전체 테스트 83개와 `npm run typecheck`가 통과했다. 관리자 순위 처리, 최종전 보상, 중복 지급 검사는 격리된 합성 데이터로 실행했다.

### 알에서 태어나는 모습
- 원본 `7c088125`의 [알 생성](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/egg.ts)과 [모습 선택](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/battle-scene.ts)을 대조했다. 기존 가챠 알은 모든 종을 기본 모습으로 만들었으나, 이제 고정 참조 데이터에 알 후보로 존재하는 종의 확인된 무작위·성별 규칙을 적용한다. 예: 피츄 삐죽귀 1/8, 데인차/차데스 특수 모습 1/16, 로토무·안농·팔데아 켄타로스 등의 후보 모습 균등 선택, 에써르의 성별에 따른 모습. 선택된 폼의 능력치·타입·특성·이미지를 저장하며 부화 시 해당 스타터 폼을 등록한다.
- 이미 생성된 알은 기존에 저장된 포켓몬과 모습을 바꾸지 않는다. 폼은 이 게임에서 뽑을 때 결정해 저장하므로 원본처럼 부화 시점의 동일 시드와 난수 순서를 재현한다고 주장하지 않는다. 종 목록은 여전히 이 저장소의 고정 버전을 사용하며 최신 원본과 전수 대조하지 않았다. 특수 폼별 전투와 변형 이로치 자산의 전수 검증은 남았다.
- 경계값 검사 및 로토무 워시폼의 실제 뽑기→JSON 복원→부화→스타터 해금을 검증했다. 22종의 매핑 가능한 폼 결과를 일반/색이 다른 이미지 경로로 생성하는 검사도 통과했다. 전체 회귀 83개와 타입 검사는 폼 선택 추가 후 통과했고 마지막 에써르 성별·팔데아 켄타로스 추가 후에는 관련 알 테스트를 다시 통과했다. 운영 배포는 하지 않았다.

### 원본 알 후보·폼 전수 대조와 완주 보상 — 2026-11-03
- `git ls-remote https://github.com/pagefaultgames/pokerogue.git refs/heads/beta`로 당시 원본 HEAD가 `7c0881255af5cd51992e513ff93c2f71adbe40e0`임을 재확인했다. `scripts/compare-egg-source.mjs /tmp/pokerogue-upstream`으로 1~9세대 원본 `eggTier`를 가진 571종의 ID·등급·스타터 기본 비용을 기존 고정 데이터와 비교해 추가·누락·변경 0건을 확인했다. `scripts/compare-egg-forms.mjs /tmp/pokerogue-upstream`으로 같은 571종의 `PokemonForm` 키와 순서를 TypeScript AST로 비교했고 누락·미해석·불일치 0건이었다. 이는 후보와 폼 키의 비교이며 기술·특성·모든 폼 효과나 이미지의 전수 검증은 아니다. 이후 원본 변경 시 지정 커밋과 도구를 다시 확인해야 한다.
- 원본 `src/phases/game-over-phase.ts`와 `src/system/game-data.ts`를 대조해 각 종 계열의 첫 클래식 리본마다 플러스 바우처 1장, 첫 승리 이후 매 완주마다 프리미엄 1장을 지급한다. 최초 골드와 함께 실제 승리 처리 및 저장에 포함되고 중복 웨이브 처리와 저장 복원에서 재지급하지 않는다. 피카츄/피츄처럼 일반 계열의 뿌리와 선택 가능한 스타터 뿌리가 다른 경우 각각 첫 리본을 센다. 이전 완주 이력이 완전하게 남아 있지 않아 기존 계정에 소급 지급하거나 이전 리본을 지어내지 않고 도입 후 실제 완주부터 기록한다.
- **마나피 알의 전후 차이:** 기존 구현은 새 일반 가챠의 마나피 알을 50웨이브로 만들었다. 확인한 원본 커밋은 `HATCH_WAVES_MANAPHY_EGG=50` 상수를 두지만, 가챠의 `new Egg({pulled:true, sourceType:...})`에서는 `egg.ts` 생성자가 종 결정 전에 `getEggTierDefaultHatchWaves()`를 호출하고 그 함수는 아직 미설정인 `_species`를 검사하므로 일반 등급의 10웨이브를 설정한다. 이후 종 결정만으로 남은 웨이브를 다시 설정하지 않는다. 사용자 포켓로그 우선 지시에 따라 **새 가챠 알만 10웨이브**로 바꿨다. 예전에 저장된 알의 50웨이브는 그대로 보존한다. 이 동작은 원본 코드의 실행 순서에 대한 판단이며 상수의 50이라는 의도와 불일치하므로 사용자에게 차이와 영향을 알린다. 종을 명시해 만드는 원본의 다른 알 경로는 이 결론에 포함하지 않는다.
- 검증: 알 후보·폼 목록 비교 스크립트, 마나피 생성과 기존 50웨이브 알 JSON 복원, 완주 골드·리본 플러스·재완주 프리미엄 및 중복 방지, 합성 최종전의 실제 게임 액션과 저장 처리. 전체 테스트 83개와 타입 검사가 통과했다. 자연 200층 완주, 브라우저 UI, 원본 특수 이벤트와 모든 다른 바우처 경로는 여전히 미검증 또는 미구현이다. 운영 배포는 하지 않았다.

### 같은 종의 사탕 알 — 2026-11-03
- 원본 `7c088125`의 [starters.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/balance/starters.ts), [egg.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/egg.ts), `starter-select-ui-handler.ts`에 있는 같은 종 알 구매를 추가했다. 해금된 스타터의 기본 비용에 따라 사탕 20/20/15/12/10/8/7/6/6/5개를 사용하며 기존 알 99개 제한과 서버 revision을 적용한다. 사탕을 차감한 뒤 알을 계정에 보관하고 일반 가챠 알과 같은 비최종 웨이브 부화 흐름을 사용한다. 기존 코인·구매 알·다른 계정 데이터는 건드리지 않는다.
- 원본의 이로치 기본 1/12, 16번째부터 증가해 21번째 보장, 숨겨진 특성 1/8, 희귀 유전기 상승 및 11회 변형 보정을 반영했다. 종을 지정한 마나피 계열 알은 원본 명시 종 생성 경로에 따라 50웨이브이며, 앞서 기록한 **일반 가챠 마나피 알의 실행 순서상 10웨이브**와 구분된다. 새로운 이로치 등록부터 본 변형을 개별 비트로 보존한다.
- 한계: 이전 저장은 가장 높은 이로치 단계만 보유하므로 과거에 다른 변형도 획득했는지 복원할 수 없다. 확인 가능한 최고 단계만 보존하여 새 변형 보정을 시작하며 사라진 정보를 추정해 해금하지 않는다. 기존 사탕 데이터 구조에서 피카츄처럼 가족 스타터와 선택 스타터가 나뉜 경우 종 계열의 사탕을 사용한다. 최신 원본의 난수 시드/호출 순서 및 모든 폼별 이로치 에셋의 완전한 일치는 주장하지 않는다.
- 격리 실제 SQLite API의 요청 재전송은 409와 사탕 1회 차감·알 1개 추가를 확인했다. 사탕 부족/가격 오류/99개 상한, 이로치 확률 경계·천장·변형 및 숨겨진 특성 분기, JSON 복원과 10웨이브 부화, 기존 코인·보유 데이터 보존을 테스트했다. 관리자 지급 순위 정책은 변경하지 않았다. 스타터 선택 UI의 실제 브라우저 클릭과 실운영 D1은 미검증이며 운영 배포는 하지 않았다.
- 전체 `npm test` 84개와 `npm run typecheck`가 통과했다. 마지막 사탕 부족 경계 검사는 관련 테스트를 다시 실행해 통과했다. 공통 `app/api/rogue-classic/route.ts`와 스타터 UI는 탐험 병렬 변경 통합 시 비교한다.

### 스타터 패시브 해금 — 2026-11-03
- 원본 `7c088125`의 `src/data/balance/starters.ts`와 `src/ui/handlers/starter-select-ui-handler.ts`에 따라 스타터 기본 비용별 패시브 해금 비용 40/40/35/30/25/20/15/10/10/10 사탕을 연결했다. 서버가 해금 여부·소지 사탕·표시 비용을 확인하고 계정별로 한 번만 차감한다. 기존 패시브 해금 및 사탕 기록은 유지한다. 계열 사탕을 사용하는 기존 저장 모델을 따르며, 도전 시작 전 선택 화면에서 해금된 패시브의 사용 여부를 고를 수 있다. 이전에 선택값이 없던 저장/호출은 기존과 같이 해금된 패시브를 사용한다.
- 실제 네이티브 전투 fixture에서 일반 특성과 패시브가 동시에 연결되는 것을 확인했고, 끈 상태·JSON 복원·해금 전 선택 거부·가격/잔액 오류·중복 해금 및 실제 격리 SQLite API의 revision 재전송을 검사했다. 패시브 전체 종류의 모든 전투 상호작용, 스타터 UI 실제 브라우저 클릭 및 실운영 D1은 미검증이다. 패시브 on/off는 이번 도전 편성에 적용되며 원본의 영구 설정 UI와 완전히 같다고 주장하지 않는다.
- 사용자 요청의 전체 포켓로그 UI 배치는 여전히 완료되지 않았다. 탐험 병렬 브랜치와 공통 `app/api/rogue-classic/route.ts`, 스타터 UI 및 전투 관련 코드를 통합할 때 비교한다. 운영 배포는 하지 않았다.
- 전체 `npm test` 85개와 `npm run typecheck`가 통과했다.

### 피카츄 스타터 사탕 구분 및 비용 감소 — 2026-11-03
- 원본 `7c088125`의 `src/data/species-data-registry.ts#getStarter`, `src/ui/handlers/starter-select-ui-handler.ts#openPokemonMenu`, `src/field/pokemon.ts`를 재확인했다. 피카츄는 피츄의 진화형이지만 별도 선택 가능한 스타터이며, 스타터 사탕 메뉴는 선택한 피카츄의 기록을 사용한다. 기존 구현은 피카츄의 비용 감소를 아예 막고, 피카츄의 같은 종 알·패시브 구매에는 피츄 사탕을 사용했다.
- 포켓로그 우선 지시에 따라 피카츄 비용 감소를 열고, 피카츄의 비용 감소·같은 종 알·패시브에는 피카츄 사탕을 사용하게 고쳤다. 선택 가능한 스타터의 친밀도 사탕도 해당 스타터에 쌓는다. **영향:** 이전에 피츄에 쌓인 사탕은 더 이상 피카츄 구매에 사용할 수 없고 피츄에 그대로 남는다. 기존 피카츄 사탕도 따로 보존해 사용할 수 있으며, 잔액이나 기존 친밀도 진행을 이동·합산·초기화하지 않는다. 위의 과거 ‘가족 스타터 사탕 사용’ 기록을 이 항목이 수정한다. 포켓로그 규칙을 우선하라는 기존 지시에 따른 변경이며 사용자에게 전후 차이를 전달한다.
- 피카츄 비용 감소의 첫 비용 15, 피카츄와 피츄 잔액 분리, 피카츄 친밀도 사탕·같은 종 알·패시브 구매를 테스트했다. 격리 실제 SQLite API에서 비용 감소의 revision 재전송은 409이며 사탕을 1회만 차감한다. 과거 피츄에 쌓인 친밀도 진행은 소급 구분할 수 없어 이동하지 않는다. 실제 브라우저·운영 D1은 미검증이고 운영 배포는 하지 않았다.
- 전체 테스트 85개와 타입 검사가 통과했고, 마지막 피카츄 패시브 경계 테스트도 개별 통과했다. 자동 플레이 1회는 8층에서 패배했고 실행 예외는 없었다. 이는 게임의 완주 가능 여부를 판정하지 않으며 자연 200층 완주는 아직 검증하지 못했다. 스타터 UI·사탕 성장 코드는 탐험 브랜치 통합 전에 비교한다.

### 포켓러스 전염 시점과 시드 — 2026-11-03
- 원본 `7c088125`의 [battle-scene.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/battle-scene.ts)의 `newBattle`, `doPostBattleCleanup`, `trySpreadPokerus`를 대조했다. 이전 구현은 첫 웨이브를 만들 때도 전염을 시도하고 도전 전체의 공용 난수 상태를 사용했다. 이제 새 도전은 첫 전투 시작 시에는 전염하지 않고, 이전 전투가 있는 다음 웨이브 진입 시 파티 위치별 `wave + (slot << 8)` 시드와 이웃별 1/10 판정을 쓴다. 그 전환에서 새로 전염된 포켓몬은 같은 전환에서 다시 전염시키지 않는다.
- 저장 보호: 새 도전에만 `pokerusSpreadRule: source-v1`을 저장한다. 이 표시가 없는 기존 진행 도전은 기존 난수·전염 방식을 유지하며 기존 감염 상태나 난수 기록을 변경하지 않는다. 새 방식에서는 포켓러스 판정이 기존 공용 난수 상태를 소모하지 않으므로 기존 신규 도전에 비해 이후 무작위 진행 결과가 달라질 수 있다. 같은 시드·웨이브·파티 상태의 해당 전염 판정만 원본과 비교했으며 게임 전체 난수 진행이 동일하다고 주장하지 않는다.
- 실제 게임 액션의 1→2 웨이브, 좌우 전염, 한 번의 전환에서 연쇄 전염 금지, JSON 복원, 기존 규칙 도전의 호환성을 검사했다. 별도로 Phaser 3.90의 [RandomDataGenerator.js](https://github.com/phaserjs/phaser/blob/v3.90.0/src/math/random-data-generator/RandomDataGenerator.js) 원본과 세 시드의 정수 난수 20개씩을 비교해 일치했다. 브라우저·자연 200층 완주는 미검증이고 운영 배포는 하지 않았다.
- 전체 `npm test` 86개와 `npm run typecheck`가 통과했다.

### 야생 전투 도망 — 2026-11-03
- 원본 `7c088125`의 [attempt-run-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/attempt-run-phase.ts), [command-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/command-phase.ts)를 대조해 클래식 야생 전투에서 도망을 추가했다. 일반 야생과 보스는 양쪽 활성 포켓몬의 속도 합, 이전 실패 횟수와 원본의 5–95%/5–25% 범위를 사용하고 `도주` 특성은 성공한다. 트레이너·엔드 바이옴 및 붙잡힌 포켓몬은 거부한다.
- 성공은 경험치·전투 보상·코인·알 부화 진행을 주지 않고 다음 웨이브로 넘어간다. 야생 연속 전투의 기존 상태를 재사용하며 10웨이브 경계에서는 기존 바이옴 이동 및 회복 흐름을 따른다. 실패하면 내 행동 없이 실제 상대 턴이 진행되고 시도 횟수를 저장한다. 저장을 복원해도 진행을 이어갈 수 있다. 기존 저장에는 새 필드를 선택적으로 추가하며 다른 모드 데이터는 건드리지 않는다.
- 원본은 별도의 전투 시드로 도망 난수를 생성하나 현재 게임은 기존 도전 RNG를 사용하므로 동일 시드의 도망 결과가 원본과 완전히 같다고 주장하지 않는다. 모든 특성·도구·더블배틀의 조합, 특수 이벤트, 자연 200웨이브 및 브라우저 조작은 아직 전수 검증하지 않았다. 기존에 이 게임에 없던 선택지가 추가되어 플레이어가 원하면 전투 보상을 포기하고 웨이브를 넘길 수 있다.
- 확률 경계·실패 후 상대 공격과 PP 보존·붙잡힘 및 금지 지역/트레이너 거부·도주 특성·더블배틀·성공 시 보상/알 미지급·JSON 복원 후 다음 야생 전투를 검사했다. UI는 기존 공유 BattlePanel의 이미 제공된 `onFlee`를 클래식에만 연결했고 공유 컴포넌트는 수정하지 않았다. 운영 배포는 하지 않았다.
- 전체 `npm test` 87개와 `npm run typecheck`가 통과했다. 이후 추가한 10→11 웨이브 도망 경계 및 파티 회복 fixture도 개별 통과했다.

### 더블 야생 포획 제한 — 2026-11-03
- 원본 `7c088125`의 [command-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/command-phase.ts)의 `handleBallCommand`를 확인했다. 기존 구현은 야생 더블배틀에서 살아 있는 상대 두 마리 중 대상을 선택해 볼을 던질 수 있었지만, 원본은 활성 상대가 둘 이상이면 볼 사용을 거부한다. 포켓로그 우선 지시에 따라 새 도전은 둘 이상일 때 거부하고 한 마리가 남으면 포획할 수 있게 했다. 거부된 요청은 볼과 턴을 소모하지 않는다.
- 기존 진행 도전의 동작을 갑자기 바꾸지 않기 위해 새 도전에만 `capturePolicy: source-v1`을 기록한다. 이 필드가 없는 기존 저장은 기존 대상 선택 방식을 유지하고 포켓몬·볼·다른 데이터를 이관하거나 삭제하지 않는다. UI의 포획 불가 사유와 서버의 실제 제한에 같은 판정을 사용한다. 이 변경은 신규 도전에서 기존과 다르게 더블배틀 중 즉시 포획할 수 없다는 영향이 있다.
- 실제 더블 전투에서 두 마리일 때 마스터볼 거부와 저장·볼 무변경, 한 마리를 쓰러뜨린 뒤 나머지 포획, 기존 저장의 두 대상 포획 호환성, UI용 사유를 검사했다. 실제 브라우저 클릭과 모든 특수 전투는 미검증이며 운영 배포는 하지 않았다.
- 전체 `npm test` 87개와 `npm run typecheck`가 통과했다.

### 전투 날씨에 따른 진화 조건 — 2026-11-03
- 원본 `7c088125`의 [pokemon-evolutions.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/balance/pokemon-evolutions.ts)와 [generation-06.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/balance/species/generation-06.ts), [generation-08.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/balance/species/generation-08.ts)를 대조했다. 일반·히스이 미끄네일은 비·안개·강한 비가 진화 조건이다. 기존 구현은 비바라기, 쾌청 또는 날씨 만료가 있어도 바이옴 최초 날씨만 확인했다.
- 현재 전투 스냅샷의 날씨를 우선하며 빈 문자열은 날씨 종료로 처리하도록 수정했다. 전투 날씨 필드가 없는 오래된 저장만 기존 바이옴 날씨로 대체한다. 기존 도전을 포함해 다음 진화 조건 확인부터 반영되며 이전과 달리 전투에서 비가 내리면 진화할 수 있고 비가 그치거나 쾌청으로 바뀌면 진화하지 않는다. 기존 포켓몬·기록을 소급 변경하거나 이관하지 않는다.
- 실제 전투의 비바라기→레벨 상승→진화 및 초기 비→쾌청→레벨 상승 시 진화 거부, 중간 저장·복원과 진화 결정 복원, 두 폼의 날씨 소멸·비·안개·강한 비 판정을 검사했다. 원본은 레벨업 단계의 날씨를 확인하지만 현재 게임은 턴 처리가 끝난 전투 스냅샷에서 대기 진화를 판단하므로 같은 턴에 날씨가 만료되는 경계는 원본과 다를 수 있다. 브라우저와 자연 200층 완주는 미검증이다. 운영 배포는 하지 않았다.
- 전체 `npm test` 88개와 `npm run typecheck`가 통과했다.

### 165층 잠금캡슐 및 사탕 상한 진행 — 2026-11-03
- 원본 `7c088125` [victory-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/victory-phase.ts)와 [select-modifier-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/select-modifier-phase.ts)를 대조했다. 이전 게임에는 165층 고정 잠금캡슐 보상과 등급 잠금 선택이 없었다. 이제 165층 악의 조직 보스에 승리하면 보상 선택 전에 도구를 얻고, 보상 등급 잠금을 켜서 같은 등급의 새 보상으로 새로고침할 수 있다. 잠금 리롤 금액은 선택지 등급별 50/125/300/750/2000의 합과 웨이브·리롤 횟수로 서버에서 계산하고 기존 가격 확인을 거친다. 잠금 설정은 저장된다. 원본과 같은 전체 보상 풀·중복 방지·무작위 시퀀스를 구현했다는 뜻은 아니다. 현재 등급에 유효한 보상 풀이 없을 때 기존 생성기처럼 하위 등급으로 대체한다.
- **영향:** 기존에도 진행 중인 도전은 앞으로 165층 보스를 이기면 새 도구를 받는다. 이미 해당 전투를 지난 저장에는 승리 여부를 확실하게 재구성할 수 없어 자동 소급 지급하지 않는다. 볼·코인·계정·기존 도구는 삭제하지 않는다. UI 변경은 클래식 전용 보상 컴포넌트와 클래식 화면이며 탐험 병렬 코드 통합 시 확인한다.
- 원본 [pokemon.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/pokemon.ts)와 [game-data.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/system/game-data.ts)를 대조해 사탕 9,999개에 이미 도달한 상태에서 친밀도가 다음 사탕 문턱을 넘으면 진행도를 문턱 직전으로 유지하도록 고쳤다. 이전에는 나머지만 남겨 진행도가 사라졌다. 사탕이 직전 획득으로 처음 9,999개에 도달한 경우 원본처럼 실제 나머지를 유지한다. 저장된 잔액·과거 진행도는 소급 변경하지 않고 다음 친밀도 획득부터 반영한다.
- 합성 165층 실제 전투 승리, 잠금 전환·가격 확인·오래된 가격 거부·등급 유지·저장 복원 및 기존 저장 미소급, 실제 전투의 만액 사탕 진행과 저장 복원 후 비용 감소·다음 사탕 지급을 검사했다. 실제 브라우저 클릭, 운영 D1 및 자연 200층 완주는 미검증이며 운영 배포는 하지 않았다.
- 전체 `npm test` 90개와 `npm run typecheck`가 통과했다.

### 사탕단지와 파티 전체 사탕 — 2026-11-03
- 원본 `7c088125`의 [init-modifier-pools.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/init-modifier-pools.ts), [modifier.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/modifier.ts), [modifier-type.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/modifier-type.ts)를 확인했다. 기존에는 이상한사탕으로 한 마리의 레벨만 1 올릴 수 있었다. 이제 하이퍼 등급 보상에 사탕단지와 파티 전체를 올리는 더이상한사탕을 추가했다. 사탕단지는 최대 99개 중첩되고 사탕 사용 시 중첩당 레벨 상승량을 1 늘린다. 원본처럼 199층 보상에서는 사탕단지가 나오지 않는다.
- 기존 이상한사탕도 사탕단지 효과를 받으며 기절한 포켓몬에게 사용할 수 있게 했다. 더이상한사탕은 기절한 포켓몬을 포함한 파티에 적용하되 부활시키지 않는다. **영향:** 새 보상이 등장하면서 기존 진행 도전을 포함해 향후 보상 구성과 난수 결과가 달라질 수 있다. 사용자의 기존 100레벨 한도는 유지하여 원본의 100 초과 성장 전체를 재현하지 않는다. 기존 도구·포켓몬·계정 데이터를 초기화하거나 소급 지급하지 않는다.
- 사탕단지 2중첩의 단일 사탕 3레벨, 새 기술 및 진화 대기·JSON 복원, 취소 후 파티 전체 사탕, 기절 상태 유지, 친밀도 1회 증가와 레벨 100 상한을 검사했다. 여러 레벨 상승의 진화·기술 처리 순서는 현재 기존 대기열을 재사용하므로 모든 복합 조건이 원본과 동일하다고 보장하지 않는다. 보상 전체 확률·동일 시드 재현, 실제 브라우저와 자연 200층 완주는 미검증이며 운영 배포는 하지 않았다. 클래식 공통 보상 코드의 탐험 병렬 변경은 통합 전 비교한다.
- 전체 `npm test` 91개와 `npm run typecheck`가 통과했고, 이후 기술 습득 확인을 추가한 해당 테스트도 개별 통과했다.

### 전투 후 알 바우처 보상 — 2026-11-03
- 원본 `7c088125`의 [init-modifier-pools.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/init-modifier-pools.ts), [modifier-type.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/modifier-type.ts), [modifier.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/modifier.ts)를 대조했다. 이전에는 트레이너·클리어 등의 경로만 있었고 일반 보상 선택지로 바우처를 얻을 수 없었다. 이제 로그 등급에 플러스 1장, 마스터 등급에 프리미엄 1장을 추가하며 각각 기본 가중치 3과 5를 사용한다. 리롤 횟수당 가중치는 각각 1과 2씩 감소해 세 번째 리롤부터 0이다. 선택한 보상은 해당 계정 바우처에 더해 기존 알뽑기에 바로 사용 가능하다. 직접 만든 바우처 그림을 사용한다.
- 보상 목록이 확장되어 **기존 진행 도전을 포함해 앞으로의 보상 구성·난수 결과가 달라질 수 있다.** 전체 보상 풀이 아직 원본과 달라 개별 선택지의 최종 출현 확률이 원본과 같다는 주장은 아니다. 기존 코인·알·바우처를 덮어쓰거나 소급 지급하지 않는다. 보상을 리롤한 뒤 건너뛸 때 다음 웨이브까지 리롤 횟수가 남던 오류도 고쳤으므로 다음 보상 가격과 바우처 가중치가 정상 초기화된다.
- 고정 시드·등급의 최초 등장 및 세 번째 리롤 이후 제외, 단일 지급·재선택 거부, 저장 후 플러스 바우처로 5회 뽑기, 기존 알·코인 보존을 검사했다. 격리 SQLite의 실제 API에서 동일 revision 재전송이 409로 거부되고 바우처가 1회만 들어오는 것도 확인했다. 실제 브라우저·운영 D1 및 자연 200층 완주는 미검증이다. 자동 플레이 탐색은 8층에서 패배했으며 완주 불가능의 증거가 아니다. 운영 배포는 하지 않았다. 공통 클래식 API 및 보상 코드는 탐험 병렬 작업과 통합 전 비교한다.
- 전체 `npm test` 92개와 `npm run typecheck`가 통과했다.
- 남은 진화 순서 차이: 원본 [level-up-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/level-up-phase.ts)는 기술 습득 단계를 먼저 큐에 넣은 뒤 진화를 앞에 삽입해 진화를 우선 처리하지만, 현재 구현은 빈 기술 칸을 즉시 채우고 기술 선택을 먼저 처리한 다음 진화 조건을 확인한다. 따라서 레벨업으로 배우는 기술에 따라 진화 가능 여부가 달라질 수 있다. 이번 변경에서는 이 순서를 바꾸지 않았으며 저장된 학습·진화 대기열의 호환성과 함께 수정·검증해야 한다.

### 새 도전의 진화·기술 순서 — 2026-11-03
- 위의 진화 순서 차이는 새 도전에 한해 수정했다. 경험치 또는 사탕 한 번으로 얻은 레벨과 기술을 저장 대기열에 넣고, 기존 기술 기준으로 진화를 판정한 다음 진화 기술과 해당 레벨 기술을 처리한다. 진화 취소·일시 중지 후에도 레벨 기술 습득을 이어간다. 여러 레벨을 한 번에 올린 경우 원본 `LevelUpPhase`처럼 해당 상승에 대해 한 번 판정한다.
- **전후 영향:** 예를 들어 덩쿠리가 33레벨에 원시의힘을 처음 배우면 이전에는 그 기술을 배운 직후 같은 레벨에서 진화할 수 있었고, 새 도전은 먼저 진화를 판정한 뒤 원시의힘을 배워 다음 레벨 상승 때 진화를 판정한다. 이전에 시작한 도전과 이미 저장된 기술·진화 선택은 `growthOrder` 표식이 없으므로 기존 순서를 유지한다. 계정·알·기존 도전 데이터를 변환하거나 초기화하지 않는다.
- 실제 전투 경험치와 사탕, 기술 조건 진화, 여러 레벨 상승, 진화 기술이 레벨 기술보다 먼저 나오는 순서, 진화·취소·일시 중지, 저장 복원 및 기존 도전 호환을 검사했다. 같은 턴의 복수 레벨 이벤트와 전투 중 날씨 만료, 보상 생성 시점 및 모든 복합 진화 조건까지 원본과 완전히 일치한다고 주장하지 않는다. 브라우저와 자연 200층 완주는 미검증이며 운영 배포는 하지 않았다.
- 전체 `npm test` 93개와 `npm run typecheck`가 통과했다.

### 전체 요구 기능 현황 — 2026-11-03
- **연결되어 주요 동작을 자동 검증한 범위:** 기존 데이터 보존 기반 클래식 슬롯과 27종 중 무작위 기본 스타터, 1~200층 구성 및 합성 전투, 계정 스타터·사탕, 알 바우처 뽑기와 승리 시 부화, 관리자 바우처·포켓몬 지급, 실제 데이터 기반 개인 기록·글로벌 순위와 최근 활동 표시, 일반 다이맥스와 Z기술의 기본 전투·저장 복원, 주요 폼과 진화, 165층 잠금캡슐과 바우처 보상. 각 항목은 기록된 테스트 범위에서 동작하며 포켓로그 전체 동등성이나 운영 검증을 뜻하지 않는다.
- **부분 구현:** 포켓로그 전체 전투 규칙·보상 풀·사건과 모든 폼/진화 조건, 알 특수 이벤트와 모든 바우처 획득 경로, 게임 플레이 화면 전체의 포켓로그식 UI, 관리자 지급과 예전 순위 제외 사유의 복구, 다이맥스·Z기술의 모든 상호작용과 시각 연출. 개인 최고 기록은 현재 슬롯과 보존된 최근 이력 기준이며 과거에 잘린 이력을 만들지 않는다. 글로벌 순위는 기능 도입 이후 서버 검증 기록만 사용하며 과거 기록은 자동 편입하지 않았다. 친구 온라인 표시는 최근 2분 활동 기반이다.
- **미구현 또는 범위 미확인:** 원본 미스터리 인카운터 전체와 시간 한정 이벤트, 아직 대조하지 않은 상점·아이템·연출·도전 조건. 게임 플레이 전 화면의 원본 수준 UI는 완료되지 않았다. 포켓로그 기반이 아닌 사용자 요청 확장인 다이맥스·Z기술을 원본 기능으로 오인해서는 안 된다.
- **검증 한계:** 200층 모두의 시작과 한 턴은 합성 검사했으나 자연 진행으로 200층을 완주하지 못했다. 실제 브라우저의 모든 새 화면·모바일·다중 기기, 운영 D1과 운영 배포는 검증하지 않았다. 기존 자동 플레이의 패배는 완주 불가능의 증거가 아니다. 탐험 병렬 브랜치와 공통 코드·마이그레이션은 비교 통합 전이며 운영 사이트는 배포하지 않았다.
- 사용자의 요청에 따른 **구현만의 대략적인 추정치: 약 55%**. 검증은 점수에 반영하지 않았다. 전체 요구를 아래 11개 기능군으로 임의로 나누어 같은 가중치를 주고, 지정된 범위가 연결된 군은 1점, 중요한 부분이 남은 군은 0.5점, 사실상 미구현 군은 0점으로 계산했다. 2개×1점 + 8개×0.5점 + 1개×0점 = 6점 / 11점 ≈ 54.5%다. 기능군마다 실제 작업량이 다르고 원본에서 아직 발견하지 못한 누락도 있으므로 이는 진행 계획용 주관적 추정이지 정확한 측정이나 출시 가능 판정이 아니다.
  - 1점: ① 명시된 27종 중 무작위 기본 지급·기본 팀 선택 ② 관리자 포켓몬·알 바우처 지급 기능.
  - 각 0.5점: ③ 1~200층 클래식 진행 ④ 일반 전투·포획·도망과 지속 상태 ⑤ 다이맥스·Z기술·폼 등 특수 전투 ⑥ 진화·기술 성장 ⑦ 알 뽑기·부화·특수 폼 ⑧ 전투 보상·상점·바우처 경로 ⑨ 개인·글로벌 기록과 친구 활동 ⑩ 전체 플레이 화면 UI. 각 군은 위의 부분 구현·미구현 범위가 남아 있다.
  - 0점: ⑪ 원본 미스터리 인카운터·시간 한정 이벤트 전체. 이벤트 일부 효과나 다른 보상 구현이 있다고 해서 전체 이벤트를 구현한 것으로 계산하지 않았다.
- **검증만 남은 상태가 아니다.** 위 부분 구현 및 미구현 외에도 운영 검증은 별도이며, 자동 테스트 개수나 자동 플레이 도달 층수는 위 구현률의 분자·분모로 사용하지 않았다.

### 루어와 야생 더블배틀 확률 — 2026-11-03
- 원본 `7c088125`의 [modifier.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/modifier.ts), [init-modifier-pools.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/init-modifier-pools.ts), [battle-scene.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/battle-scene.ts), [battle-end-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/battle-end-phase.ts)를 대조했다. 루어·슈퍼루어·맥스루어를 각 일반·슈퍼·하이퍼 보상에 연결하고 각 10·15·30전 지속, 다른 종류끼리 확률 중첩, 같은 종류 재획득 시 지속시간 초기화, 남은 전투 수 표시, 승리·포획·도망 등 전투 종료 시 감소를 구현했다. 동일 종류의 지속 시간이 원래의 60% 이상이면 그 종류는 보상에서 빠지며 199층에서는 새 루어가 나오지 않는다. 그림은 직접 만든 아이콘이다.
- **전후 영향:** 새 도전의 일반 야생 더블배틀 기본 확률은 이전 1/32에서 원본의 1/8로 바뀐다. 기존 진행 도전은 루어가 없을 때 기존 1/32를 유지하며, 루어를 선택한 동안에는 원본의 1/8 기반 배율을 적용한다. 루어 한 종류는 1/2, 서로 다른 두 종류 이상은 해당 조건에서 확정이다. 확률과 보상 풀이 달라지는 만큼 새 도전과 루어를 선택한 기존 도전의 이후 조우·난수 결과가 달라질 수 있다. 기존 포켓몬·계정·아이템은 이관하거나 초기화하지 않는다.
- 적용 범위 제한: 현재 게임의 기존 조건인 생존 파티 2마리 이상·첫 웨이브 제외·보스 제외는 그대로다. 원본이 허용하는 1대2·일부 보스 더블 및 특정 특성이 확률에 주는 영향, 트레이너 더블 조합과 원본의 동일 시드 난수는 아직 구현·검증하지 않았다. 루어가 모든 원본 전투 조건에서 완전하게 일치한다고 주장하지 않는다.
- 실제 보상 선택과 더블 야생 전투 생성, 성공 도망 및 일반 승리의 지속 감소, JSON 복원·중복 감소 방지, 세 종류의 지속·재충전·중첩과 199층 보상 제한을 검사했다. 실제 브라우저·자연 200층 완주는 미검증이며 운영 배포는 하지 않았다. 클래식 전용 진행·보상 파일은 탐험 브랜치와 통합 전 비교한다.
- 전체 `npm test` 94개와 `npm run typecheck`가 통과했다. 이후 추가한 실제 포획 시 지속 감소 검사도 개별 통과했다.

### 1대2·보스 더블배틀과 조우 특성 — 2026-11-03
- 위 항목에서 미구현으로 남겼던 부분을 새 도전 대상으로 추가했다. 원본 `7c088125` [battle-scene.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/battle-scene.ts)의 `checkIsDouble`, `getDoubleBattleChance`, [encounter-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/encounter-phase.ts)와 [abilities/init-abilities.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/abilities/init-abilities.ts)를 대조했다. 포켓몬이 한 마리뿐인 경우 및 일반 야생 보스에서도 더블배틀을 허용하고, 보스 웨이브의 기본 확률은 1/32로 계산한다. 두 야생 보스의 HP 구간은 원본처럼 종별 종족값 합계 비율로 배분한다. 구간이 하나인 보스도 보스 도망 확률 및 보스 기술 제한을 적용한다.
- 앞선 전투에서 실제 필드에 있던 포켓몬의 `발광`, `개미지옥`, `노가드`, `사령탑`과 서로 다른 패시브 각각은 확률 분모를 4로 나눈다. 저장된 실제 전투의 활성·기절 및 특성 억제 상태를 확인하고 대기 포켓몬은 제외한다. 루어와도 중첩된다. 트레이너 더블배틀 생성 및 원본과 정확히 같은 전체 난수 시퀀스는 여전히 미구현이다.
- **전후 영향:** 새로 시작한 도전에는 `encounterDoubleRule: source-v2`를 기록하므로 1층부터 한 마리 대 두 마리, 보스 더블과 조우 특성 효과가 가능해지고 야생 조우 및 이후 난수 결과가 달라질 수 있다. 기존 `source-v1` 도전과 그보다 오래된 도전은 이전 조우 조건을 유지한다. 이미 저장된 포켓몬·도전 상태를 이관하거나 초기화하지 않는다. 구간이 하나인 새 보스에 대한 보스 판정 보정은 이 특이 상태가 있는 기존 저장에도 적용된다.
- 엔진이 한 마리로 더블 전투 시작 시 빈 자리를 역참조하며 멈추는 문제를 수정했다. 실제 1대2 생성·공격·JSON 복원, 2마리 보스의 구간 배분과 전투, 1구간 보스의 도망 확률, 활성 특성·별도 패시브·대기 제외·위액 억제, 실제 이전 전투 후 다음 웨이브 생성 및 예전 저장의 조건 유지가 테스트에 포함된다. 단일/더블 전환 시 전장 상태 연속성의 모든 조합, 브라우저 및 자연 200층 완주는 미검증이다. 운영 배포는 하지 않았으며 공통 전투 코드 `lib/rogue-battle-engine.mjs`는 탐험 병렬 변경과 통합 전 비교한다.
- 1대2 중 남은 야생 포켓몬을 포획해 파티에 추가한 후 연속 더블 웨이브에서 빈 아군 슬롯을 선택·사용하는 실제 흐름도 검사했다. 기존에는 두 번째 슬롯을 만들지 않아 포획한 포켓몬이 대기에 남았다.
- 전체 `npm test` 95개와 `npm run typecheck`가 통과했다.

### 조직 조무래기 더블과 단일→더블 전장 유지 — 2026-11-03
- 원본 `7c088125`의 [battle.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/battle.ts), [trainer.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/trainer.ts), [fixed-battle-configs.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/trainers/fixed-battle-configs.ts)를 대조해 새 도전의 고정 악의 조직 조무래기 전투에 1/3 더블배틀 분기를 추가했다. 35·62·64·112층의 10개 조직 조무래기를 대상으로 하며 트레이너 파티와 전투 금지 행동은 기존 서버 규칙을 쓴다. 원본 분기는 비시드 난수를 사용하지만 현재 게임은 저장 가능한 도전 RNG를 쓰므로 동일 시드 결과는 다르다. 두 트레이너의 전용 초상화·대사는 아직 구현하지 않았다.
- **전후 영향:** 새 도전에서는 위 고정 전투가 이전의 싱글 전용과 달리 더블로 나올 수 있어 난수·파티·전투 양상이 달라진다. 새 도전의 `trainerDoubleRule: source-v1`만 적용하며 기존 진행 도전은 싱글 조건을 유지한다. 다른 계정·알·탐험 데이터는 바꾸지 않는다. 일반 무작위 트레이너 출현·더블 분기와 쌍둥이 관장의 두 사람 합동 파티는 아직 미구현이다.
- 같은 바이옴에서 단일 야생전 다음에 더블 야생전이 나올 때 이전에는 새 엔진 전투를 만들어 날씨·능력치 랭크 등 전장 상태를 잃었다. 이제 `encounterDoubleRule: source-v2` 도전은 기존 전투를 더블로 전환하고 기존 선봉·날씨·랭크·HP·PP를 유지하며, 대기 포켓몬이 있으면 두 번째 자리를 선택한다. 한 마리뿐이면 1대2로 계속한다. 기존 `source-v2` 진행 도전에도 앞으로 이 경계에서 적용되고, 다른 이전 저장은 기존 방식이다. 이 과정에서 새 상대의 빈 슬롯 위치를 바로잡았다.
- 10개 조직·4개 고정 층의 더블 분기와 구버전 싱글 유지, 실제 1대2 트레이너 행동·도망/포획 제한, 단일→더블 전환의 날씨·랭크·HP·PP·저장 복원·파트너 선택과 실제 다음 턴을 검사했다. 반대 방향인 더블→단일의 전장 유지, 다른 전투 효과·브라우저·자연 200층 완주는 미검증 또는 미구현이다. 운영 배포는 하지 않았고 전투 연속성 공통 파일은 탐험 병렬 작업과 통합 전 비교한다.
- 전체 `npm test` 97개와 `npm run typecheck`가 통과했다.

### 더블→단일 야생 전장 유지 — 2026-11-03
- 원본 `7c088125`의 [party-reorder-switch-phase.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/party-reorder-switch-phase.ts)와 [pokemon.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/pokemon.ts)의 퇴장 처리를 대조했다. 같은 바이옴의 더블 야생전 다음에 단일 야생전이 나오면 이전에는 새 전투를 만들어 기존 전장 상태를 잃었다. 이제 `encounterDoubleRule: source-v2` 도전은 기존 전투를 단일로 전환해 남는 선봉과 날씨를 유지하고 두 번째 포켓몬은 대기로 돌려보낸다. 퇴장 포켓몬의 랭크·일시 효과는 해제하고 재생력 등 퇴장 특성을 적용한다.
- 선봉이 쓰러지고 두 번째 포켓몬만 살아남았다면 다음 웨이브의 선봉 선택에서 이 포켓몬을 고를 수 있고, 다시 입장시켜 상태를 초기화하지 않고 필드 위치만 옮긴다. 1대2에서 한 마리만 있던 경우도 단일 전투로 이어진다. **영향:** 기존 `source-v2` 도전을 포함해 앞으로 이 경계에서 이전과 달리 유지할 전장 상태와 퇴장 특성이 적용된다. 그보다 오래된 도전은 기존 방식을 유지하고 포켓몬·도구·계정을 이관하거나 초기화하지 않는다.
- 실제 전투에서 날씨·선봉 랭크 유지, 두 번째 포켓몬의 랭크 해제·재생력 HP 회복, 선봉 기절 후 생존자 선택, 1대2→1대1, JSON 복원과 다음 턴을 검사했다. 전장 효과·특성·폼과 다이맥스의 모든 복합 조합, 브라우저 및 자연 200층 완주는 미검증이다. 일반 무작위 트레이너 및 쌍둥이 관장 합동 파티는 여전히 미구현이며 운영 배포는 하지 않았다. `lib/rogue-battle-engine.mjs`와 클래식 전투 연속성 파일은 탐험 병렬 작업과 통합 전 비교한다.
- 전체 `npm test` 98개와 `npm run typecheck`가 통과했다.

### 일반 트레이너·풍과 란 더블배틀 — 2026-11-03
- 원본 `7c088125`의 [game-mode.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/game-mode.ts), [battle-scene.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/battle-scene.ts), [arena.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/arena.ts), [trainer.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/trainer.ts)를 대조했다. 이전에는 고정 트레이너 외에 일반 트레이너가 나오지 않았다. 새 도전에 바이옴별 트레이너 출현과 희귀도별 후보, X0·X1 제외 및 고정 전투 2층 이내/앞선 후보 제한을 연결했다. 출현 판정은 웨이브별 저장 시드에서 계산하며 일반 트레이너는 볼 사용·도망을 막고 기존 승리 보상을 사용한다.
- 더블 전용 트레이너는 항상 더블로 생성하고, 더블이 가능한 일반 트레이너는 해당 웨이브 확률에 루어와 활성 특성을 적용한다. 한 마리 템플릿은 더블에서 두 마리로 늘린다. 유적 바이옴 체육관 관장 풍·란은 보스 더블 확률을 통과하면 함께 등장하며, 선봉은 풍일 때 솔록·루나톤, 란일 때 루나톤·솔록이고 이후 양쪽 종 풀을 번갈아 사용한다. 도전 중 보유한 루어·활성 특성도 반영한다. 관장 바우처는 원본처럼 해당 전투의 주 관장에게만 적용한다.
- **전후 영향:** `randomTrainerRule: source-v1`이 있는 새 도전에는 기존에 야생이었던 일부 웨이브에 일반 트레이너가 출현할 수 있고 풍·란 관장전도 더블이 될 수 있다. 따라서 이후 조우·보상·난수와 난도가 바뀐다. 기존 진행 도전에는 새 표식을 추가하지 않아 이전 출현 방식을 유지한다. 계정·알·기존 도전은 초기화하거나 이관하지 않는다. 풍·란 합동 초상화/대사 및 일반 더블 트레이너의 전용 초상화는 아직 없다.
- **원본 차이:** 출현 조건은 위 최신 원본을 따르지만 실제 바이옴 트레이너 후보와 트레이너 세부 데이터는 고정된 1.12.2.3 커밋 `29441f7`을 사용한다. 현재 최신 원본과 후보를 전수 대조하지 않았고 전체 트레이너 난수 호출 순서·포켓몬 기술/AI 및 모든 대사·연출이 동일하다고 주장하지 않는다. 트레이너 등장에 앞서 원본 미스터리 인카운터가 조우를 대체하는 경로는 여전히 미구현이다.
- 모든 트레이너 출현 바이옴의 생성, 고정 전투 인접 제한, 구버전 저장 유지, 더블 전용과 더블 가능 일반 트레이너의 실제 1대2 행동, 단일 멤버 템플릿 확장, 풍·란 양쪽과 20·50·80·110·140층 합동 편성·선봉·바우처 범위·실전 한 턴을 검사했다. 자동 플레이 탐색 1회는 4층 패배했으며 완주 가능 여부를 의미하지 않는다. 전체 브라우저·자연 200층 완주는 미검증이다. 운영 배포는 하지 않았고 공통 클래식 전투·화면 코드는 탐험 병렬 브랜치와 통합 전 비교한다.
- 전체 `npm test` 100개와 `npm run typecheck`가 통과했다.

### 최신 트레이너 출현 후보 대조 — 2026-11-03
- 원본 `pagefaultgames/pokerogue`의 beta 브랜치 최신 커밋이 `7c0881255af5cd51992e513ff93c2f71adbe40e0`임을 원격에서 확인했다. `scripts/compare-trainer-biomes.mjs /tmp/pokerogue-upstream`는 최신 원본 TypeScript 구문을 읽어 고정 데이터 `29441f7aa7482d9e816b253d324293788936dc3e`와 비교하며 원본 코드나 콜백을 실행하지 않는다.
- 결과: 35개 바이옴 각각의 트레이너 등장 분모와 9개 등급의 **순서까지 포함한** 후보 목록 315개가 모두 일치했다. 트레이너 ID 272개, 각 트레이너 선언의 더블 가능·더블 전용·짝 트레이너 직접 설정, 풍·란을 포함한 관장 대표 종 풀 74개와 그 종 ID도 모두 일치했다. 따라서 이 범위에서는 후보나 확률 값을 바꿀 필요가 없었고 기존 저장·도전 규칙과 데이터를 바꾸지 않았다. 검증 스크립트는 예상과 다른 구문이나 원본 커밋에 대해 조용히 성공하지 않고 실패한다.
- 이 비교는 최신 원본의 각 트레이너 포켓몬별 파티 생성·종 필터·기술·특성·아이템·AI·대사 전체가 같다는 뜻이 아니다. 그러한 세부 구현과 미스터리 인카운터 등은 추가 대조가 필요하다. 실제 사용자 대상을 수정하거나 운영 배포하지 않았다.
- 실제 게임 액션과 저장 복원을 반복하는 자동 플레이 탐색 3회는 각각 8·20·16층에서 패배했고 실행 예외는 없었다. 세 결과는 자연 200층 완주나 완주 불가능의 증거가 아니다.

### 트레이너 특성·개체값·친밀도 — 2026-11-03
- 포켓로그 beta `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [pokemon.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/pokemon.ts) `generateAbilityIndex`와 `EnemyPokemon` 생성, [starters.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/balance/starters.ts)를 대조했다. 신규 도전의 트레이너 포켓몬에 숨겨진 특성 1/256, 각 개체값 최솟값 `floor(층/10)`, 친밀도 `clamp(round(255*층/145),50,255)`를 적용했다. 플레이어의 특성부적은 트레이너 숨겨진 특성 확률에 관여하지 않는다. 특정 트레이너의 고정 특성·모습 설정은 생성 이후 우선 적용한다.
- **전후 영향:** 이전에는 트레이너의 숨겨진 특성이 임의로 나오지 않았고 개체값은 전 층 0~31, 친밀도는 종 기본값이었다. 새 `trainerTraitsRule: source-v1` 도전은 트레이너 난도, 은혜갚기·화풀이 위력 및 생성 후 난수 결과가 달라질 수 있다. 기존 진행 도전과 이미 생성된 적에게 표식을 소급 적용하지 않고 계정·알·탐험 데이터를 이관하거나 초기화하지 않는다. 원본의 난수 호출기와 전체 동일 시드 결과는 재현하지 않는다.
- 1/256 경계, 특성부적 무관, 실제 생성된 숨겨진 특성의 전투 연결, 고정 특성 우선, 층별 개체값·친밀도, JSON 복원 후 실제 엔진의 능력치·친밀도, 구버전 도전을 검사했다. 기존 무작위 진행 테스트가 정상적인 야생 더블 교체 화면을 실패로 처리하던 문제도 수정했다. `lib/rogue-battle-engine.mjs`와 저장 관련 코드는 탐험 병렬 브랜치와 통합 전 대조한다. 운영 배포는 하지 않았다.
- 트레이너의 원본 가중 기술 생성, 보유 아이템, 전투 AI 전체는 아직 일치한다고 확인하지 못했으며 추가 구현·대조가 필요하다. 브라우저와 자연스러운 200층 완주는 여전히 미검증이다.
- 전체 `npm test` 101개와 `npm run typecheck`가 통과했다.

### 특정 트레이너의 확정 아이템 — 2026-11-03
- 포켓로그 beta `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 [trainer-config.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/trainers/trainer-config.ts), [modifier-type.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/modifier-type.ts), [battle-scene.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/battle-scene.ts)의 확정 소지품 설정을 대조했다. 새 도전에서 레드의 피카츄에게 전기구슬, 윤진의 이상한비늘 밀로틱과 제이의 포이즌힐 글라이온·구즈마 2차전의 포이즌힐 글라이온에게 맹독구슬, 라이벌 5·6차전의 근성 스왈로에게 화염구슬을 지급한다. 슬롯·종·특성 조건이 일치할 때만 적용하고 시뮬레이터의 실제 전기구슬 및 구슬 상태이상 효과를 사용한다.
- **전후 영향:** 새 `trainerItemsRule: source-v1` 도전의 해당 트레이너전은 전기구슬의 공격·특수공격 배가 또는 턴 종료 상태이상으로 난도가 바뀐다. 기존 진행 도전과 이미 저장된 전투에는 소급하지 않으며 기존 계정·알·탐험 데이터를 바꾸지 않는다. 원본의 고정 아이템 전체가 적용된 것은 아니다.
- 원본의 강석·윤진 전용 날씨 연장 바위와 층별 임의 트레이너 아이템 풀은 아직 구현하지 않았다. 원본은 포켓몬 한 마리가 여러 아이템을 보유할 수 있지만 현재 시뮬레이터 기본 지닌 물건은 한 개이므로, 다중 아이템·중첩·이전·소모 등은 별도 전투 설계와 검증이 필요하다. 원본 트레이너 기술 생성·AI 전체와 브라우저·자연 200층 완주는 여전히 미완료 또는 미검증이다.
- 레드의 실제 공격 보정, 윤진의 맹독 적용, 라이벌 5·6차전의 근성 스왈로와 화상 적용, 조건 불일치 제외, 전투 JSON 복원 및 이전 도전의 구 규칙을 검사했다. `lib/rogue-classic-state.mjs` 등 공통 저장 관련 코드는 탐험 병렬 브랜치와 통합 전 비교한다. 운영 배포는 하지 않았다.
- 전체 `npm test` 102개와 `npm run typecheck`가 통과했다.

### 강석·윤진의 날씨·필드 연장 아이템 — 2026-11-03
- 앞 항목에서 누락했던 강석의 기가이어스와 윤진의 펠리퍼에게 원본 `7c088125` [trainer-config.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/trainers/trainer-config.ts)의 고정 Mystical Rock을 지급한다. 같은 버전 [modifier.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/modifier/modifier.ts)의 중첩당 2턴·최대 2개와 [arena.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/arena.ts)의 사용자가 만든 날씨·필드에 대한 적용을 구현했다. 기본 지닌 물건 칸과 별개인 클래식 전투 modifier로 저장하므로 다른 원생 지닌 물건과 공존한다. 기술·특성으로 만든 유한 지속시간만 확장한다.
- **전후 영향:** `trainerFieldItemsRule: source-v1` 새 도전에서는 강석의 모래날림과 윤진의 잔비가 5턴에서 7턴으로 늘어나 전투 난도에 영향을 줄 수 있다. 기존 진행 도전과 저장 전투에는 새 표식을 소급하지 않는다. 도난으로 획득한 바위는 소유 포켓몬에 남으며 파티 내 이동과 2개 상한을 지원한다. 획득물 표시는 추가했지만 보상 후보 가중치는 0으로 유지해 일반 보상 분포는 바꾸지 않았다.
- 실전 입장 특성 2종, 기술 필드, 중첩·다른 소유자·도구 억제·중복 필드, JSON 저장 복원, 미니블랙홀 탈취와 파티 내 이동 및 구 도전의 기존 지속시간을 검사했다. 모든 아이템 탈취 기술·다중 아이템 유형·무한 날씨 조합은 검증하지 않았다. 임의 트레이너 아이템 풀, 원본 기술 생성·AI 및 자연 진행 200층·실제 브라우저 검증은 여전히 미완료다. 전투·저장 공통 코드는 탐험 브랜치와 통합 전 비교하며 운영 배포하지 않았다.
- 전체 `npm test` 103개와 `npm run typecheck`가 통과했다.

### 마스터드·모란의 난수 분기 기술과 특수 모습 — 2026-11-03
- 포켓로그 beta `7c0881255af5cd51992e513ff93c2f71adbe40e0` [trainer-config.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/trainers/trainer-config.ts)의 마스터드 `MUSTARD` 우라오스와 2차전 모란 `PENNY_2` 부르르룸 분기를 확인했다. 이전에는 고정 트레이너 해석기가 저장된 난수 분기를 처리하지 못해 이 두 포켓몬의 모습, 기술, 일부 보스 설정이 모두 빠졌다. 새 도전에서는 저장된 IR의 허용된 분기만 해석하여 두 거다이맥스 우라오스 및 다섯 스타모빌 모습별 확정·무작위 기술 4개와 2구간 보스, 성별을 적용한다. 기술 및 후보가 지원되는지 확인하고 알 수 없는 IR 구조는 적용하지 않는다.
- **전후 영향:** `trainerSeededMovesRule: source-v1` 신규 도전의 해당 트레이너전은 적 모습, 기술과 능력치, 보스 체력 구간 및 이후 난수 결과가 바뀌며 난도가 달라질 수 있다. 선택은 이 게임의 저장 가능한 난수기를 사용하므로 원본과 같은 시드에서 같은 결과를 보장하지 않는다. 기존 진행 도전과 저장된 전투에는 소급하지 않으며 계정·알·탐험 데이터를 변경하지 않는다.
- 스타모빌의 데이터상 무성 설정이 시뮬레이터 기본 부르르룸 종 대체 과정에서 임의 성별로 바뀌던 오류도 해당 폼에 한해 고쳤다. 다섯 모습과 우라오스 두 모습의 후보·고정 기술·보스 설정, 실제 전투 진입·1턴·JSON 복원·시뮬레이터 성별, 기존 도전 유지 및 이미지 URL 접근을 검사했다. 스타모빌은 별도 시뮬레이터 종이 없어 원종을 기반으로 포켓로그 종족값·타입·특성·모습을 적용하며, 모든 전용 효과와 전체 브라우저 표현은 미검증이다.
- 이 변경은 다른 트레이너의 전반적인 가중 기술 생성·AI, 무작위·다중 아이템 완성을 뜻하지 않는다. 자연 진행 200층과 실제 브라우저 검증도 남았다. `lib/rogue-battle-engine.mjs`와 저장 공통 코드는 탐험 병렬 브랜치와 통합 전 대조한다. 운영 배포는 하지 않았다.
- 전체 `npm test` 104개와 `npm run typecheck`가 통과했다.

### 트레이너 AI 선택과 모란의 이브이 친밀도 — 2026-11-03
- 포켓로그 beta `7c0881255af5cd51992e513ff93c2f71adbe40e0` [pokemon.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/pokemon.ts)의 `EnemyPokemon.getNextMove()`를 확인했다. 새 도전의 트레이너 AI는 현재 구현의 피해 추정으로 상대를 쓰러뜨릴 수 있는 공격이 있으면 그 후보를 우선하고, 후보 점수가 비슷하면 원본 SMART 분기처럼 다음 후보의 점수 비율에 따른 난수 선택을 수행한다. 더블에서 같은 기술의 여러 대상은 점수가 가장 높은 대상으로 정리한 뒤 기술을 선택한다. 전투 난수는 스냅샷에 저장되므로 복원 후 같은 선택을 재현한다.
- **범위와 차이:** 원본의 복잡한 기술별 유익도·명중 조건·상대 특성 인지·교체 AI 전체를 이식한 것은 아니다. 여전히 기존의 피해·회복·상태·랭크 근사 점수와 시뮬레이터 피해 추정을 쓰므로 원본과 KO 판정, 점수, 선택 결과가 다를 수 있다. 야생 AI는 바꾸지 않았다. `trainerAiRule: source-v1` 신규 도전의 트레이너 선택·전투 난수·난도는 이전과 달라지며 기존 진행 도전과 저장된 전투는 이전 규칙을 유지한다.
- 같은 원본 [trainer-config.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/trainers/trainer-config.ts)의 모란 이브이 고정 친밀도 255도 기존 층별 친밀도보다 우선하도록 새 도전에 추가했다. 예를 들어 115층의 기존 도전은 202, 새 도전은 255다. 친밀도 의존 기술의 위력에 영향을 주며 원본 기술 생성 자체가 완성되었다는 뜻은 아니다.
- 실제 KO 우선 선택, 비슷한 점수의 서로 다른 선택, 더블 2명 행동, JSON 복원 후 동일 선택 및 PRNG, 구 도전 유지와 이브이 친밀도의 전투 반영을 검사했다. 모든 기술의 효과·타깃·상대 특성·교체 조합, 원본 가중 기술 생성·무작위/다중 아이템, 브라우저 및 자연 진행 200층은 여전히 미완료 또는 미검증이다. 계정·알·탐험 데이터는 변경하지 않고 공통 전투·저장 코드는 병렬 브랜치와 통합 전 비교한다. 운영 배포하지 않았다.
- 전체 `npm test` 105개와 `npm run typecheck`가 통과했다.

### 트레이너 이로치와 루브도 스케치 — 2026-11-03
- 포켓로그 beta `7c0881255af5cd51992e513ff93c2f71adbe40e0` [trainer-config.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/trainers/trainer-config.ts), [pokemon.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/field/pokemon.ts), [rates.ts](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/balance/rates.ts)를 대조했다. 이전에는 트레이너 포켓몬이 임의로 이로치로 생성되지 않았다. 새 도전은 기본 1/1024로 생성하고 플레이어 빛나는부적을 적용하지 않는다. 고정된 원본 에셋 목록에 해당 종의 변종이 있으면 노랑·파랑·빨강 6:3:1을 기록하며, 없으면 기본 이로치만 기록한다. 라이벌 5·6차전 레쿠쟈는 원본 고정 파랑 변종을 기록한다.
- **범위와 전후 영향:** `trainerGenerationRule: source-v1` 새 도전의 적 이로치·이후 난수 및 상대 표시가 바뀔 수 있다. 기존 진행 도전과 기존 저장 전투는 이전 생성 방식을 유지한다. 확률은 원본 기본값이지만 이 게임의 저장 난수를 사용하여 원본 ID XOR와 같은 시드 결과를 보장하지 않으며, 기간 이벤트의 이로치 보너스는 아직 반영하지 않았다. 변종 정보는 저장하나 모든 파랑·빨강 전용 스프라이트 표현은 아직 구현·검증하지 않았다.
- 같은 새 규칙에서 트레이너 루브도는 원본처럼 스케치 네 개로 생성한다. 실제 전투에서 스케치로 복사한 기술이 다음 저장 복원 시 원래 기술로 덮이는 오류를 해당 새 트레이너 루브도에 한해 고쳐 기술을 보존한다. 이 수정은 야생·플레이어의 다른 스케치 처리까지 완성했다는 뜻은 아니다.
- 1/1024 경계, 변종 확률 경계, 트레이너에 대한 빛나는부적 무관, 실제 이로치 상대 생성·전투·스케치 복사·JSON 복원, 기존 도전, 라이벌 고정 변종을 검사했다. 트레이너 가중 기술 생성·AI 전체, 무작위·다중 아이템, 각종 스케치 상호작용, 실제 브라우저 및 자연 진행 200층은 여전히 미완료 또는 미검증이다. 계정·알·탐험 데이터를 바꾸지 않았고 공통 전투·저장 코드는 탐험 병렬 브랜치와 통합 전 비교한다. 운영 배포하지 않았다.
- 전체 `npm test` 106개와 `npm run typecheck`가 통과했고, 새 도전의 모든 272종 트레이너를 별도 테스트에서 생성·한 턴·저장 복원했다. 이는 자연 진행 완주를 뜻하지 않는다.
- 배포 지시 변경: 사용자는 어느 정도 완성되면 Sites에 배포하고 개발을 계속하도록 했다. 이 시점의 후보는 로그라이크 개발 브랜치이며, 이전에 확인된 운영 Sites는 v4다. 탐험 병렬 변경 통합 여부·공통 파일·DB 마이그레이션 충돌, 실제 브라우저 및 자연 진행 200층은 검증되지 않았으므로 현재 후보를 완성 또는 운영 반영된 것으로 취급하지 않는다. 운영 DB·계정 데이터 초기화 없이 통합 후보와 검증 결과를 사용자 검수에 제출해야 한다.

### Sites 배포 준비 상태 확인 — 2026-11-03
- 사용자의 최신 지시와 상위 스레드 정정에 따라 별도의 재승인 요청 없이 안전한 통합·필수 검증이 완료된 시점에 배포한다. 중복 배포 방지를 위해 Sites 통합·배포는 상위 스레드가 담당하며, 탐험 스레드의 정확한 브랜치·커밋 확인 전 이 브랜치만으로 운영을 덮어쓰지 않는다. 앞 절의 '사용자 검수에 제출해야 한다'는 배포 재승인 요구가 아니다.
- Sites 조회 결과 현재 운영은 v4, 소스 `7b9de08d0903f054be19d8ae7592a529571e85bb`, 배포 상태 succeeded다. v4 아카이브와 버전 기록이 남아 롤백 후보로 확인되었다. 다만 롤백은 코드 버전을 되돌리는 것이며, 이미 적용된 DB 마이그레이션을 되돌리거나 데이터를 초기화하는 절차로 간주하지 않는다.
- 운영 `DB` 바인딩을 읽기 전용으로 조회했다. 사용자 테이블 `players`, `profiles`, `saves`, `worlds`, `pokemon_box` 등은 존재하지만 신규 `admin_player_backups`, `classic_leaderboard`, `admin_grant_requests` 테이블은 없다. 기존 `trades`에는 0009의 `offered_snapshot`, `received_snapshot` 컬럼이 있다. 전체 마이그레이션 이력은 이 읽기 도구로 확인하지 못했으므로 이를 테이블·컬럼만으로 추정하지 않는다. 코드 후보의 0010~0012 SQL은 각각 신규 테이블과 인덱스를 추가하며, Sites 문서상 배포 시 Worker 업로드 전에 미적용 마이그레이션이 적용된다. 실패한 배포에서도 DB 변경이 남을 수 있으므로 다른 브랜치의 SQL 및 저널과 충돌을 검증해야 한다.
- 실제 게임 액션과 매 단계 JSON 복원을 사용하는 자동 탐색 3회는 1·9·20층에서 패배했고 실행 예외는 없었다. 이는 200층 완주 또는 완주 불가능의 증거가 아니다. 272종 트레이너의 합성 한 턴 검사는 자연 진행이나 전체 브라우저 검증을 대신하지 않는다.
