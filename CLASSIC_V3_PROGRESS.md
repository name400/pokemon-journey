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
