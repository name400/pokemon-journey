import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {knowsAdventureMove,sameAdventureMove} from '../lib/cloud-adventure/adventure-move-identity.mjs';
import {applyAdventureLevelMoves,applyAdventureIntroStarterMoves,applyAdventureEvolutionMoves,adventureLearnableMoves,teachAdventureMove} from '../lib/cloud-adventure/adventure-growth.mjs';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {canLearnResearchTm} from '../lib/cloud-adventure/adventure-research.mjs';

test('new Zone 1 families use reviewed ZA levels while legacy and unknown records stay unchanged',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [species,level,moves] of [[13,5,['독침','실뿜기']],[16,9,['울음소리','몸통박치기','바람일으키기']],[179,8,['울음소리','몸통박치기','전기쇼크','전기자석파']]]){
  const original=makeMon(species,level),before=structuredClone(original),fresh=prepareVerifiedWildMoves(original);assert.deepEqual(original,before);assert.equal(fresh.adventureZone1GrowthV1,true);assert.deepEqual(fresh.moves,moves);assert.deepEqual(fresh.pp,{});
  const future={...original,adventureZone1GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);assert.equal(markAdventureVerifiedGrowth(original),original);
 }
 for(const [species,level,move] of [[15,15,'기충전'],[17,21,'날개치기'],[180,17,'이상한빛'],[181,42,'와이드브레이커']]){
  const old={...makeMon(species,level-1),adventureZone1GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));
 }
 for(const [species,move] of [[14,'단단해지기'],[15,'바늘미사일'],[181,'번개펀치']]){const mon={...makeMon(species,30),adventureZone1GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.equal(mon.pp.tackle,3);assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
 assert.ok(adventureLearnableMoves({...makeMon(181,30),adventureZone1GrowthV1:true},{}).includes('괴전파'));
});

test('TM058 supports reviewed base species without guessing alternate forms',()=>{
 const bag={'za-tm058':1};
 for(const id of [7,304,374,659,701])assert.equal(canLearnStoryTm(bag,{...makeMon(id,10),moves:['몸통박치기']},'za-tm058'),true);
 for(const id of [1,152,664])assert.equal(canLearnStoryTm(bag,{...makeMon(id,10),moves:['몸통박치기']},'za-tm058'),false);
 const aron={...makeMon(304,10),moves:['아이언헤드']};assert.equal(canLearnStoryTm(bag,aron,'za-tm058'),false);assert.equal(canLearnStoryTm({}, {...aron,moves:['몸통박치기']},'za-tm058'),false);
 assert.equal(canLearnStoryTm(bag,{...makeMon(304,10),id:99999,formId:99999,moves:['몸통박치기']},'za-tm058'),false);
});

test('new Scatterbug family learns ZA growth and evolution moves without rewriting older data',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [level,moves] of [[5,['실뿜기','몸통박치기']],[7,['실뿜기','몸통박치기','저리가루']]]){const mon=makeMon(664,level),before=structuredClone(mon);assert.deepEqual(prepareVerifiedWildMoves(mon).moves,moves);assert.deepEqual(mon,before);}
 for(const mon of [{...makeMon(664,5),adventureAlpha:true},{...makeMon(664,5),formId:999},makeMon(665,10)])assert.equal(prepareVerifiedWildMoves(mon),mon);
 const initial={...makeMon(664,6),moves:['tackle','string shot','protect','light screen'],pp:{tackle:2},custom:{keep:true}},marked=markAdventureVerifiedGrowth(initial);
 assert.equal(initial.adventureScatterbugMovesV1,undefined);assert.equal(marked.adventureScatterbugMovesV1,true);
 const level=applyAdventureLevelMoves(marked,{...marked,level:7},{});assert.deepEqual(level.pending,['저리가루']);assert.equal(level.mon.pp.tackle,2);
 for(const [species,move] of [[665,'방어'],[666,'바람일으키기']]){const mon={...makeMon(species,12),adventureScatterbugMovesV1:true,moves:['tackle'],pp:{tackle:2}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.ok(adventureLearnableMoves(mon,{}).includes(move));assert.equal(mon.pp.tackle,2);}
 const vivillon={...makeMon(666,39),adventureScatterbugMovesV1:true,moves:['tackle','protect','gust','string shot']};assert.deepEqual(applyAdventureLevelMoves(vivillon,{...vivillon,level:40},{}).pending,['폭풍','신비의부적']);
 for(const mon of [{...initial,adventureScatterbugMovesV1:{version:2}},{...initial,formId:999}])assert.equal(markAdventureVerifiedGrowth(mon),mon);
});

test('new Fletchling family uses ZA growth and preserves legacy or unknown forms',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [level,expected] of [[5,['울음소리','쪼기']],[8,['울음소리','쪼기','전광석화']],[25,['불꽃세례','깃털댄스','날려버리기','화염바퀴']]]){const mon=makeMon(661,level),old=structuredClone(mon);assert.deepEqual(prepareVerifiedWildMoves(mon).moves,expected);assert.deepEqual(mon,old);}
 for(const [level,move] of [[8,'전광석화'],[12,'불꽃세례'],[16,'깃털댄스'],[20,'날려버리기'],[25,'화염바퀴'],[30,'강철날개'],[35,'에어슬래시'],[40,'고속이동'],[45,'플레어드라이브']]){const old={...makeMon(661,level-1),moves:['울음소리','쪼기','방어','빛의장막'],pp:{peck:2},custom:{keep:true}},marked=markAdventureVerifiedGrowth(old),result=applyAdventureLevelMoves(marked,{...marked,level},{});assert.equal(old.adventureFletchlingMovesV1,undefined);assert.deepEqual(result.pending,[move]);assert.deepEqual(result.mon.pp,{peck:2});assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...marked,level},{}).includes(move));}
 for(const [id,move] of [[662,'날개치기'],[663,'브레이브버드']]){const mon={...makeMon(id,35),adventureFletchlingMovesV1:true,moves:['쪼기'],pp:{peck:2}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.equal(mon.pp.peck,2);assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
 const old=makeMon(661,10),future={...old,adventureFletchlingMovesV1:{version:2}},form={...old,formId:999};assert.equal(markAdventureVerifiedGrowth(future),future);assert.equal(markAdventureVerifiedGrowth(form),form);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureAlpha,true);assert.equal(adventureLearnableMoves(future,{}).includes('깃털댄스'),false);
});

test('new ordinary Bunnelby uses the reviewed growth table without modifying saved monsters',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [level,expected] of [[5,['째려보기','몸통박치기']],[13,['째려보기','몸통박치기','머드샷']],[32,['전광석화','세차게휘두르기','구멍파기','뛰어오르기']]]){
  const mon={...makeMon(659,level),pp:{tackle:2}},before=structuredClone(mon),prepared=prepareVerifiedWildMoves(mon);assert.deepEqual(prepared.moves,expected);assert.deepEqual(prepared.pp,{});assert.deepEqual(mon,before);
 }
 for(const mon of [{...makeMon(659,5),adventureAlpha:true},{...makeMon(659,5),formId:999},makeMon(660,32)])assert.equal(prepareVerifiedWildMoves(mon),mon);
});

test('move aliases are recognized without inventing unknown IDs',()=>{
 assert.equal(sameAdventureMove('화염방사','Flamethrower'),true);assert.equal(sameAdventureMove('rocksmash','바위깨기'),true);
 assert.equal(sameAdventureMove('unknown-a','unknown-b'),false);assert.equal(sameAdventureMove('unknown-a','unknown-a'),true);
 const charizard={...makeMon(6,50),moves:['Flamethrower']},pikachu={...makeMon(25,50),moves:['thunderbolt']};
 assert.equal(canLearnStoryTm({'za-tm062':1},charizard,'za-tm062'),false);assert.equal(canLearnResearchTm({zaResearchRewards:[24]},pikachu,24),false);
 assert.equal(knowsAdventureMove(charizard,'화염방사'),true);assert.equal(knowsAdventureMove(charizard,'냉동빔'),false);
});

test('growth skips an existing alias and replacement preserves remaining PP',()=>{
 const before={...makeMon(25,19),moves:['Spark','울음소리'],pp:{spark:3,growl:7}};
 const result=applyAdventureLevelMoves(before,{...before,level:20,moves:[...before.moves],pp:{...before.pp}});
 assert.deepEqual(result.learned,[]);assert.deepEqual(result.pending,[]);assert.deepEqual(result.mon.moves,before.moves);assert.deepEqual(result.mon.pp,before.pp);
 const previous={...makeMon(6,50),moves:['Flamethrower','울음소리'],pp:{flamethrower:2,growl:3}};teachAdventureMove(previous,'할퀴기',0);assert.deepEqual(previous.pp,{growl:3});
 const duplicate={...makeMon(6,50),moves:['Flamethrower','화염방사'],pp:{flamethrower:2}};teachAdventureMove(duplicate,'할퀴기',0);assert.deepEqual(duplicate.pp,{flamethrower:2});
});

test('intro starter level six respects four move slots and old growth',()=>{
 const before={speciesId:152,level:5,moves:['몸통박치기','꼬리흔들기','울음소리','빛의장막'],pp:{}};
 const after={...before,level:6,moves:[...before.moves]};
 const result=applyAdventureIntroStarterMoves(before,after);
 assert.deepEqual(result.mon.moves,before.moves);assert.deepEqual(result.pending,['나뭇잎']);
 const legacy=applyAdventureLevelMoves(before,{...before,level:6,moves:[...before.moves]});
 assert.ok(!legacy.pending.includes('나뭇잎'));
});

test('starter move relearning respects identity, level and old saves',()=>{
 const starter={...makeMon(152,6),boxId:'starter-1',origin:'starter'};
 const world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'starter-1'};
 assert.ok(adventureLearnableMoves(starter,world).includes('나뭇잎'));
 assert.ok(adventureLearnableMoves(starter,world).includes('꼬리흔들기'));
 assert.ok(!adventureLearnableMoves({...starter,level:5},world).includes('나뭇잎'));
 assert.ok(!adventureLearnableMoves({...starter,boxId:'other'},world).includes('나뭇잎'));
 assert.ok(!adventureLearnableMoves(starter,{}).includes('나뭇잎'));
 assert.ok(adventureLearnableMoves(starter,{zaIntroStarterMovesV1:true,zaIntroStarterSpecies:152}).includes('나뭇잎'));
});

test('intro starters gain confirmed early Z-A moves while preserving legacy saves and move slots',()=>{
 for(const [speciesId,from,to,name] of [[152,8,9,'차밍보이스'],[152,13,14,'씨뿌리기'],[158,14,15,'거품광선'],[498,14,15,'화염바퀴']]){
  const mon={...makeMon(speciesId,from),origin:'starter',boxId:'chosen',moves:['몸통박치기','꼬리흔들기','방어','빛의장막'],pp:{tackle:3}};
  const next={...mon,level:to,moves:[...mon.moves],pp:{...mon.pp}},world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'chosen'};
  const result=applyAdventureLevelMoves(mon,next,world);assert.ok(result.pending.includes(name),`${speciesId}: ${name}`);assert.deepEqual(result.mon.moves,mon.moves);assert.deepEqual(result.mon.pp,mon.pp);
  assert.ok(adventureLearnableMoves({...mon,level:to},world).includes(name));assert.ok(!adventureLearnableMoves({...mon,level:from},world).includes(name)||name==='씨뿌리기');
  const wrong={...world,zaIntroStarterBoxId:'other'},legacy=applyAdventureLevelMoves(mon,{...mon,level:to,moves:[...mon.moves]},wrong);assert.ok(!legacy.pending.includes(name));
 }
 const mon={...makeMon(152,8),origin:'starter',boxId:'chosen',moves:['몸통박치기'],pp:{tackle:3}},world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'chosen'};
 const next=applyAdventureLevelMoves(mon,{...mon,level:9,moves:[...mon.moves]},world);assert.ok(next.learned.includes('차밍보이스'));assert.equal(next.mon.pp.tackle,3);
});

test('intro starter evolution grants the Z-A evolution move and retains it in move management',()=>{
 const world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'starter'};
 for(const [speciesId,move] of [[153,'기가드레인'],[154,'리프블레이드'],[159,'베어가르기'],[160,'깨물어부수기'],[499,'그로우펀치'],[500,'히트스탬프']]){
  const mon={...makeMon(speciesId,40),boxId:'starter',origin:'starter',moves:['몸통박치기','방어','울음소리','빛의장막'],pp:{tackle:2}};
  const result=applyAdventureEvolutionMoves({...mon,moves:[...mon.moves],pp:{...mon.pp}},world);assert.deepEqual(result.pending,[move]);assert.deepEqual(result.mon.moves,mon.moves);assert.equal(result.mon.pp.tackle,2);
  assert.ok(adventureLearnableMoves(mon,world).includes(move));assert.ok(adventureLearnableMoves(mon,world).includes('몸통박치기'));
  const available=applyAdventureEvolutionMoves({...mon,moves:['몸통박치기'],pp:{tackle:2}},world);assert.ok(available.learned.includes(move));assert.equal(available.mon.pp.tackle,2);
 }
 const evolved={...makeMon(154,40),boxId:'starter',origin:'starter'};
 assert.ok(adventureLearnableMoves(evolved,world).includes('기가드레인'));
 assert.ok(adventureLearnableMoves(evolved,world).includes('차밍보이스'));
 const other={...makeMon(499,17),boxId:'other',origin:'starter',moves:['몸통박치기'],pp:{}};
 assert.deepEqual(applyAdventureEvolutionMoves(structuredClone(other),world),applyAdventureEvolutionMoves(structuredClone(other)));
 assert.ok(adventureLearnableMoves(evolved,{zaIntroStarterMovesV1:true,zaIntroStarterSpecies:152}).includes('리프블레이드'));
});

test('intro starter families learn later Z-A moves and stage-specific moves safely',()=>{
 const world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'starter'};
 for(const [speciesId,from,to,name] of [[153,39,40,'광합성'],[160,25,26,'와이드브레이커'],[500,44,45,'인파이트'],[499,35,36,'벌크업']]){
  const mon={...makeMon(speciesId,from),boxId:'starter',origin:'starter',moves:['몸통박치기','방어','빛의장막','울음소리'],pp:{tackle:3}};
  const result=applyAdventureLevelMoves(mon,{...mon,level:to,moves:[...mon.moves],pp:{...mon.pp}},world);
  assert.equal(result.pending.filter(move=>sameAdventureMove(move,name)).length,1,`${speciesId} ${name}`);assert.deepEqual(result.mon.moves,mon.moves);assert.deepEqual(result.mon.pp,mon.pp);
  assert.ok(adventureLearnableMoves({...mon,level:to},world).some(move=>sameAdventureMove(move,name)));
 }
 const basic={...makeMon(498,35),boxId:'starter',origin:'starter'};assert.ok(!adventureLearnableMoves({...basic,level:36},world).includes('벌크업'));
 const partner={...makeMon(153,39),boxId:'other',origin:'starter',moves:['몸통박치기'],pp:{}};
 assert.deepEqual(applyAdventureLevelMoves(partner,{...partner,level:40,moves:[...partner.moves]},world),applyAdventureLevelMoves(partner,{...partner,level:40,moves:[...partner.moves]}));
});

test('new intro starter uses Z-A levels while old and unidentified saves keep their learnsets',()=>{
 const mon={...makeMon(152,8),boxId:'starter',origin:'starter',moves:['몸통박치기','꼬리흔들기','나뭇잎'],pp:{tackle:2}};
 const old={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'starter'},fresh={...old,zaIntroStarterMovesV2:true};
 const grow=world=>applyAdventureLevelMoves(mon,{...mon,level:9,moves:[...mon.moves],pp:{...mon.pp}},world);
 const before=grow(old),after=grow(fresh);assert.ok(before.learned.includes('독가루')||before.pending.includes('독가루'));assert.ok(after.learned.includes('차밍보이스'));assert.ok(![...after.learned,...after.pending].includes('독가루'));assert.equal(after.mon.pp.tackle,2);
 assert.ok(adventureLearnableMoves({...mon,level:9},old).includes('독가루'));assert.ok(!adventureLearnableMoves({...mon,level:9},fresh).includes('독가루'));
 const stranger={...mon,boxId:'other'};assert.deepEqual(adventureLearnableMoves(stranger,fresh),adventureLearnableMoves(stranger,{}));
 const changedSpecies={...makeMon(1,9),boxId:'starter',origin:'starter'};assert.deepEqual(adventureLearnableMoves(changedSpecies,fresh),adventureLearnableMoves(changedSpecies,{}));
 const evolving={...makeMon(153,20),boxId:'starter',origin:'starter'};assert.ok(adventureLearnableMoves(evolving,fresh).includes('기가드레인'));assert.ok(adventureLearnableMoves(evolving,fresh).includes('차밍보이스'));
 for(const [id,element] of [[152,'나뭇잎'],[158,'물대포'],[498,'불꽃세례']]){const s={...makeMon(id,5),boxId:'starter',origin:'starter',moves:['몸통박치기'],pp:{}},result=applyAdventureIntroStarterMoves(s,{...s,level:6,moves:[...s.moves]},fresh);assert.deepEqual(result.learned,[element]);}
});

test('newly caught verified starter families use Z-A growth without changing old or unknown records',async()=>{
 const {markAdventureVerifiedGrowth}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,move] of [[152,9,'차밍보이스'],[158,15,'거품광선'],[498,15,'화염바퀴']]){
  const saved={...makeMon(id,level-1),origin:'capture',moves:['몸통박치기','방어','울음소리','빛의장막'],pp:{tackle:3}},marked=markAdventureVerifiedGrowth(saved);assert.equal(saved.adventureVerifiedFamilyMovesV1,undefined);assert.equal(marked.adventureVerifiedFamilyMovesV1,true);
  const result=applyAdventureLevelMoves(marked,{...marked,level,moves:[...marked.moves],pp:{...marked.pp}},{});assert.ok(result.pending.includes(move));assert.deepEqual(result.mon.moves,marked.moves);assert.equal(result.mon.pp.tackle,3);assert.ok(adventureLearnableMoves({...marked,level},{}).includes(move));
 }
 const mon={...makeMon(152,8),adventureVerifiedFamilyMovesV1:{version:2}};assert.deepEqual(markAdventureVerifiedGrowth(mon),mon);assert.deepEqual(adventureLearnableMoves(mon,{}),adventureLearnableMoves({...mon,adventureVerifiedFamilyMovesV1:undefined},{}));
 const wrong={...makeMon(152,8),formId:999};assert.equal(markAdventureVerifiedGrowth(wrong).adventureVerifiedFamilyMovesV1,undefined);assert.equal(markAdventureVerifiedGrowth(makeMon(1,8)).adventureVerifiedFamilyMovesV1,undefined);
 const evolved={...makeMon(153,20),adventureVerifiedFamilyMovesV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.ok(applyAdventureEvolutionMoves(evolved,{}).learned.includes('기가드레인'));assert.equal(evolved.pp.tackle,3);
});

test('new ordinary wild starter-family base stages use verified latest level moves',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,expected] of [[152,['신비의부적','광합성','솔라빔','빛의장막']],[158,['싫은소리','아쿠아브레이크','하이드로펌프','역린']],[498,['기충전','화염방사','돌진','플레어드라이브']]]){
  const mon={...makeMon(id,id===158?56:55),pp:{future:2}},before=structuredClone(mon),result=prepareVerifiedWildMoves(mon);assert.deepEqual(result.moves,expected);assert.deepEqual(result.pp,{});assert.deepEqual(mon,before);
 }
 const alpha={...makeMon(152,55),adventureAlpha:true,moves:['원시의힘'],pp:{ancientpower:2}};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 const evolved=makeMon(153,55);assert.equal(prepareVerifiedWildMoves(evolved),evolved);const unknown={...makeMon(152,55),formId:999};assert.equal(prepareVerifiedWildMoves(unknown),unknown);
});

test('new Pichu family captures use Z-A levels while legacy and unknown forms stay unchanged',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const id of [172,25,26]){
  const old={...makeMon(id,11),moves:['울음소리','전광석화','꼬리흔들기','전기쇼크'],pp:{thundershock:3}},fresh=markAdventureVerifiedGrowth(old);
  const result=applyAdventureLevelMoves(fresh,{...fresh,level:12,moves:[...fresh.moves],pp:{...fresh.pp}},{});assert.deepEqual(result.pending,['볼부비부비']);assert.equal(result.mon.pp.thundershock,3);assert.equal(old.adventurePichuMovesV1,undefined);
  assert.ok(adventureLearnableMoves({...fresh,level:12},{}).includes('볼부비부비'));
 }
 const raichu={...makeMon(26,25),adventurePichuMovesV1:true,moves:['울음소리','전광석화','꼬리흔들기','전기쇼크']};assert.deepEqual(applyAdventureEvolutionMoves(raichu,{}).pending,['번개펀치']);
 const future={...makeMon(172,11),adventurePichuMovesV1:{version:2}};assert.deepEqual(markAdventureVerifiedGrowth(future),future);
 const alola=markAdventureVerifiedGrowth({...makeMon(10100,25),moves:['울음소리','전광석화','꼬리흔들기','전기쇼크']});assert.equal(alola.adventurePichuMovesV1,true);assert.deepEqual(applyAdventureEvolutionMoves(alola,{}).pending,['사이코키네시스']);assert.ok(adventureLearnableMoves(alola,{}).includes('사이코키네시스'));assert.ok(!adventureLearnableMoves(alola,{}).includes('번개펀치'));
 const invalid={...makeMon(10100,25),formId:999};assert.equal(markAdventureVerifiedGrowth(invalid).adventurePichuMovesV1,undefined);
 for(const id of [172,25]){const mon=makeMon(id,7),result=prepareVerifiedWildMoves(mon);assert.deepEqual(result.moves,['전광석화','꼬리흔들기','전기쇼크','전기자석파']);assert.notEqual(result,mon);const alpha={...mon,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);}
 assert.equal(prepareVerifiedWildMoves(alola),alola);
});

test('new Kanto-family captures use verified growth and evolution while old records remain unchanged',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[1,15,['독가루','수면가루']],[4,20,['회오리불꽃']],[7,20,['얼어붙은바람']]]){
  const old={...makeMon(id,level-1),moves:['몸통박치기','방어','울음소리','빛의장막'],pp:{tackle:3}},fresh=markAdventureVerifiedGrowth(old),result=applyAdventureLevelMoves(fresh,{...fresh,level,moves:[...fresh.moves],pp:{...fresh.pp}},{});
  assert.deepEqual(result.pending,expected);assert.equal(result.mon.pp.tackle,3);assert.deepEqual(old.moves,result.mon.moves);assert.equal(old.adventureKantoMovesV1,undefined);
  for(const move of expected)assert.ok(adventureLearnableMoves({...fresh,level},{}).includes(move));
 }
 for(const [id,expected] of [[3,['파워휩']],[6,['에어슬래시','불대문자']],[9,['러스터캐논','하이드로펌프']]]){
  const mon={...makeMon(id,50),adventureKantoMovesV1:true,moves:['몸통박치기','방어','울음소리','빛의장막'],pp:{tackle:3}},result=applyAdventureEvolutionMoves(mon,{});assert.deepEqual(result.pending,expected);assert.equal(result.mon.pp.tackle,3);for(const name of expected)assert.ok(adventureLearnableMoves(mon,{}).includes(name));
 }
 const future={...makeMon(1,14),adventureKantoMovesV1:{version:2}};assert.deepEqual(markAdventureVerifiedGrowth(future),future);assert.deepEqual(adventureLearnableMoves(future,{}),adventureLearnableMoves({...future,adventureKantoMovesV1:undefined},{}));
 const wrong={...makeMon(1,14),formId:999};assert.equal(markAdventureVerifiedGrowth(wrong).adventureKantoMovesV1,undefined);
 for(const [id,expected] of [[1,['광합성','망각술','오물웨이브','이판사판태클']],[4,['베어가르기','화염방사','드래곤다이브','플레어드라이브']],[7,['아쿠아링','아쿠아제트','철벽','아쿠아브레이크']]])assert.deepEqual(prepareVerifiedWildMoves(makeMon(id,54)).moves,expected);
 const alpha={...makeMon(1,54),adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
});

test('Kalos gifts and captures use verified level and evolution moves without rewriting old forms',async()=>{
 const {markAdventureVerifiedGrowth}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,name] of [[650,15,'씨뿌리기'],[653,17,'환상빔'],[657,23,'제비반환'],[658,28,'야습'],[652,38,'벌크업'],[655,46,'고속이동']]){
  const old={...makeMon(id,level-1),moves:['몸통박치기','방어','울음소리','빛의장막'],pp:{tackle:3}},fresh=markAdventureVerifiedGrowth(old),result=applyAdventureLevelMoves(fresh,{...fresh,level,moves:[...fresh.moves],pp:{...fresh.pp}},{});assert.equal(fresh.adventureKalosMovesV1,true);assert.equal(old.adventureKalosMovesV1,undefined);assert.ok(result.pending.includes(name));assert.equal(result.mon.pp.tackle,3);assert.ok(adventureLearnableMoves({...fresh,level},{}).includes(name));
 }
 for(const [id,name] of [[652,'니들가드'],[655,'매지컬플레임'],[658,'물수리검']]){
  const mon={...makeMon(id,45),adventureKalosMovesV1:true,moves:['몸통박치기','방어','울음소리','빛의장막'],pp:{tackle:3}},result=applyAdventureEvolutionMoves(mon,{});assert.deepEqual(result.pending,[name]);assert.ok(adventureLearnableMoves(mon,{}).includes(name));assert.equal(result.mon.pp.tackle,3);
 }
 const delphox={...makeMon(655,36),adventureKalosMovesV1:true};assert.ok(adventureLearnableMoves(delphox,{}).includes('미래예지'));assert.ok(adventureLearnableMoves(delphox,{}).includes('섀도볼'));
 const future={...makeMon(650,14),adventureKalosMovesV1:{version:2}},wrong={...makeMon(650,14),formId:999};assert.deepEqual(markAdventureVerifiedGrowth(future),future);assert.deepEqual(adventureLearnableMoves(future,{}),adventureLearnableMoves({...future,adventureKalosMovesV1:undefined},{}));assert.equal(markAdventureVerifiedGrowth(wrong).adventureKalosMovesV1,undefined);
});

test('new ordinary Kalos wild encounters use verified moves without altering alphas or forms',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[650,22,['구르기','물기','씨뿌리기','바늘미사일']],[653,22,['불꽃세례','애교부리기','환상빔','회오리불꽃']],[656,23,['전광석화','핥기','거품광선','연막']]]){
  const mon={...makeMon(id,level),pp:{tackle:2}},old=structuredClone(mon),result=prepareVerifiedWildMoves(mon);assert.deepEqual(result.moves,expected);assert.deepEqual(result.pp,{});assert.deepEqual(mon,old);
 }
 const alpha={...makeMon(656,23),adventureAlpha:true,moves:['얼어붙은바람'],pp:{icywind:2}},form={...makeMon(656,23),formId:999};assert.equal(prepareVerifiedWildMoves(alpha),alpha);assert.equal(prepareVerifiedWildMoves(form),form);
});

test('newly caught Bunnelby family uses verified ZA growth without rewriting old saves',async()=>{
 const {markAdventureVerifiedGrowth}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [level,move] of [[7,'머드샷'],[14,'전광석화'],[24,'세차게휘두르기'],[28,'구멍파기'],[32,'뛰어오르기'],[36,'돌진'],[40,'분노의앞니'],[44,'지진']]){
  const old={...makeMon(659,level-1),moves:['몸통박치기','울음소리','방어','빛의장막'],pp:{tackle:3},custom:{keep:true}},mon=markAdventureVerifiedGrowth(old);
  assert.equal(old.adventureBunnelbyMovesV1,undefined);assert.equal(mon.adventureBunnelbyMovesV1,true);
  const result=applyAdventureLevelMoves(mon,{...mon,level},{});assert.deepEqual(result.pending,[move]);assert.deepEqual(result.mon.pp,{tackle:3});assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...mon,level},{}).includes(move));
 }
 const diggersby={...makeMon(660,20),adventureBunnelbyMovesV1:true,moves:['몸통박치기'],pp:{tackle:2}};
 assert.deepEqual(applyAdventureEvolutionMoves(diggersby,{}).learned,['땅고르기']);assert.equal(diggersby.pp.tackle,2);assert.ok(adventureLearnableMoves(diggersby,{}).includes('땅고르기'));
 const future={...makeMon(659,20),adventureBunnelbyMovesV1:{version:2}};assert.deepEqual(markAdventureVerifiedGrowth(future),future);
 const other={...makeMon(659,20),formId:999};assert.equal(markAdventureVerifiedGrowth(other).adventureBunnelbyMovesV1,undefined);
});
