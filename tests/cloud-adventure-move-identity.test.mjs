import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {knowsAdventureMove,sameAdventureMove} from '../lib/cloud-adventure/adventure-move-identity.mjs';
import {applyAdventureLevelMoves,applyAdventureIntroStarterMoves,applyAdventureEvolutionMoves,adventureLearnableMoves,teachAdventureMove} from '../lib/cloud-adventure/adventure-growth.mjs';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {canLearnResearchTm} from '../lib/cloud-adventure/adventure-research.mjs';

test('Zone 14 Helioptile and directly encountered Excadrill use ZA growth safely',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');const old=makeMon(694,37),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,['볼트체인지','와이드브레이커','아침햇살','10만볼트']);assert.equal(fresh.adventureHelioptileGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureHelioptileGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureHelioptileGrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureHelioptileGrowthV1,undefined);
 for(const [id,level,move] of [[694,42,'충전'],[695,50,'번개']]){const mon={...makeMon(id,level-1),adventureHelioptileGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(mon,{...mon,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});}const evolved={...makeMon(695,37),adventureHelioptileGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,[]);assert.ok(adventureLearnableMoves(evolved,{}).includes('꼬리자르기'));
 const drill=makeMon(530,39);assert.equal(prepareVerifiedWildMoves(drill),drill);const encounter=prepareVerifiedWildMoves(drill,{zone14Evolved:true});assert.equal(encounter.adventureZone8BurrowGrowthV1,true);assert.deepEqual(encounter.moves,['시저크로스','구멍파기','스톤샤워','칼춤']);assert.equal(prepareVerifiedWildMoves({...drill,adventureAlpha:true},{zone14Evolved:true}).adventureZone8BurrowGrowthV1,undefined);const unknown={...drill,adventureZone8BurrowGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,{zone14Evolved:true}),unknown);
});

test('new Zone 14 wild families use ZA growth without rewriting older records',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[304,30,['박치기','방어','스톤샤워','아이언헤드']],[95,38,['와이드브레이커','싫은소리','모래지옥','스텔스록']],[587,37,['날개치기','괴전파','스파크','에어슬래시']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone14GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone14GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone14GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone14GrowthV1,undefined);}
 const lairon=makeMon(305,39);assert.equal(prepareVerifiedWildMoves(lairon),lairon);assert.deepEqual(prepareVerifiedWildMoves(lairon,{zone14Evolved:true}).moves,['스톤샤워','아이언헤드','금속음','돌진']);assert.equal(prepareVerifiedWildMoves({...lairon,adventureAlpha:true},{zone14Evolved:true}).adventureZone14GrowthV1,undefined);
 for(const [id,level,move] of [[304,33,'금속음'],[305,44,'아이언테일'],[306,48,'철벽'],[95,44,'구멍파기'],[208,36,'헤비봄버'],[587,40,'볼트체인지']]){const mon={...makeMon(id,level-1),adventureZone14GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(mon,{...mon,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...mon,level},{}).includes(move));}const steelix={...makeMon(208,38),adventureZone14GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(steelix,{}).learned,['아이언테일']);assert.ok(adventureLearnableMoves(steelix,{}).includes('록블라스트'));
});

test('Zone 13 Scyther and evolved wilds use ZA growth without migrating older records',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');const old=makeMon(123,37),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,['기충전','시저크로스','벌레의야단법석','에어슬래시']);assert.equal(fresh.adventureScytherGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureScytherGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureScytherGrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureScytherGrowthV1,undefined);
 for(const [id,expected,marker] of [[70,['매지컬리프','독압정','독찌르기','흡혈'],'adventureZone5GrowthV1'],[666,['환상빔','유턴','에어슬래시','벌레의야단법석'],'adventureScatterbugMovesV1']]){const mon=makeMon(id,37);assert.equal(prepareVerifiedWildMoves(mon),mon);const result=prepareVerifiedWildMoves(mon,{zone13Evolved:true});assert.deepEqual(result.moves,expected);assert.equal(result[marker],true);assert.equal(prepareVerifiedWildMoves({...mon,adventureAlpha:true},{zone13Evolved:true})[marker],undefined);const unknown={...mon,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown,{zone13Evolved:true}),unknown);}
 for(const [id,level,move] of [[123,42,'칼춤'],[212,40,'철벽'],[900,50,'록블라스트']]){const mon={...makeMon(id,level-1),adventureScytherGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(mon,{...mon,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});}for(const [id,move] of [[212,'불릿펀치'],[900,'암석액스']]){const mon={...makeMon(id,37),adventureScytherGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
});

test('new Zone 13 woodland wilds use ZA growth while legacy records stay unchanged',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[214,37,['깨뜨리다','록블라스트','벌레의야단법석','덤벼들기']],[127,37,['판별','돌진','시저크로스','덤벼들기']],[708,36,['성장','우드혼','숲의저주','고스트다이브']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone13GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone13GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone13GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone13GrowthV1,undefined);}
 for(const [id,level,move] of [[214,38,'칼춤'],[127,40,'칼춤'],[708,44,'우드해머'],[709,30,'섀도클로']]){const old={...makeMon(id,level-1),adventureZone13GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}const tree={...makeMon(709,36),adventureZone13GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(tree,{}).learned,[]);
});

test('Zone 12 Snorunt and direct evolved encounters retain reviewed ZA growth',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');const old=makeMon(361,34),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,['방어','얼어붙은바람','거짓울음','얼음엄니']);assert.equal(fresh.adventureSnoruntGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureSnoruntGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureSnoruntGrowthV1,undefined);
 for(const [id,level,move] of [[361,35,'그림자분신'],[362,55,'대폭발'],[478,35,'냉동빔']]){const old={...makeMon(id,level-1),adventureSnoruntGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});}
 for(const [id,move] of [[362,'프리즈드라이'],[478,'드레인키스']]){const evolved={...makeMon(id,40),adventureSnoruntGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,[move]);assert.ok(adventureLearnableMoves(evolved,{}).includes(move));}assert.ok(adventureLearnableMoves({...makeMon(478,40),adventureSnoruntGrowthV1:true},{}).includes('고드름떨구기'));
 for(const [id,level,marker] of [[67,35,'adventureZone8GrowthV1'],[673,34,'adventureZone3GrowthV1']]){const mon=makeMon(id,level);assert.equal(prepareVerifiedWildMoves(mon),mon);assert.equal(prepareVerifiedWildMoves(mon,{zone12Evolved:true})[marker],true);assert.equal(prepareVerifiedWildMoves({...mon,adventureAlpha:true},{zone12Evolved:true})[marker],undefined);}
});

test('new Zone 12 ice families use ZA growth and preserve older records',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[225,34,['제비반환','얼음뭉치','에어슬래시','깃털댄스']],[459,33,['얼음뭉치','잎날가르기','얼어붙은바람','성장']],[712,33,['얼음엄니','철벽','HP회복','깨물어부수기']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone12GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone12GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone12GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone12GrowthV1,undefined);}
 for(const [id,level,move] of [[225,35,'냉동펀치'],[459,35,'씨뿌리기'],[460,41,'우드해머'],[712,36,'돌진'],[713,39,'고드름떨구기']]){const old={...makeMon(id,level-1),adventureZone12GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const aboma={...makeMon(460,40),adventureZone12GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(aboma,{}).learned,['냉동펀치']);assert.ok(adventureLearnableMoves(aboma,{}).includes('아이스해머'));assert.ok(prepareVerifiedWildMoves(makeMon(582,35)).moves.includes('냉동빔'));
});

test('new Zone 6 and 11 remaining species use ZA growth without altering old forms',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[129,18,['튀어오르기','몸통박치기']],[618,32,['암석봉인','충전','스파크','지진']],[676,32,['코튼가드','애교부리기','깨물어부수기','바크아웃']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone11RemainingGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone11RemainingGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone11RemainingGrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone11RemainingGrowthV1,undefined);}
 const wild=makeMon(130,32);assert.equal(prepareVerifiedWildMoves(wild),wild);assert.deepEqual(prepareVerifiedWildMoves(wild,{zone11Evolved:true}).moves,['몸통박치기','회오리','폭포오르기','깨물어부수기']);assert.equal(prepareVerifiedWildMoves({...wild,adventureAlpha:true},{zone11Evolved:true}).adventureZone11RemainingGrowthV1,undefined);
 for(const [id,level,move] of [[129,15,'몸통박치기'],[130,33,'아이언헤드'],[618,35,'방전'],[676,36,'이판사판태클']]){const old={...makeMon(id,level-1),adventureZone11RemainingGrowthV1:true,moves:['방어','빛의장막','물기','전광석화'],pp:{protect:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.protect,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const karp={...makeMon(129,24),adventureZone11RemainingGrowthV1:true,moves:['튀어오르기'],pp:{splash:3}};assert.deepEqual(applyAdventureLevelMoves(karp,{...karp,level:25},{}).pending,[]);const gyara={...makeMon(130,20),adventureZone11RemainingGrowthV1:true,moves:['튀어오르기'],pp:{splash:3}};assert.deepEqual(applyAdventureEvolutionMoves(gyara,{}).learned,['물기']);assert.ok(adventureLearnableMoves(gyara,{}).includes('바다회오리'));
});

test('new Zone 11 water families use ZA growth while old encounters remain untouched',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[686,32,['탁쳐서떨구기','환상빔','베어가르기','깜짝베기']],[692,30,['아쿠아제트','머드샷','물의파동','칼춤']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone11WaterGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone11WaterGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone11WaterGrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone11WaterGrowthV1,undefined);}
 for(const [id,level,move] of [[686,33,'사이코커터'],[687,42,'뒤집어엎기'],[692,34,'파동탄'],[693,55,'기합구슬']]){const old={...makeMon(id,level-1),adventureZone11WaterGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const malamar={...makeMon(687,35),adventureZone11WaterGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(malamar,{}).learned,[]);assert.ok(adventureLearnableMoves(malamar,{}).includes('문어굳히기'));assert.equal(malamar.pp.tackle,3);
});

test('new Zone 10 water and evolved wild species use reviewed growth safely',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');const tynamo=makeMon(602,31),before=structuredClone(tynamo),fresh=prepareVerifiedWildMoves(tynamo);assert.deepEqual(tynamo,before);assert.deepEqual(fresh.moves,['스파크','몸통박치기','전기자석파']);assert.equal(fresh.adventureTynamoGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(tynamo),tynamo);const future={...tynamo,adventureTynamoGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...tynamo,adventureAlpha:true}).adventureTynamoGrowthV1,undefined);
 for(const [id,expected,marker] of [[24,['뱀눈초리','세차게휘두르기','싫은소리','맹독'],'adventureZone4GrowthV1'],[505,['최면술','분노의앞니','기충전','분발'],'adventureZone2GrowthV1']]){const old=makeMon(id,31);assert.equal(prepareVerifiedWildMoves(old),old);const fresh=prepareVerifiedWildMoves(old,{zone10Evolved:true});assert.deepEqual(fresh.moves,expected);assert.equal(fresh[marker],true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},{zone10Evolved:true})[marker],undefined);}
 for(const [id,level,move] of [[603,33,'괴전파'],[604,36,'아쿠아브레이크']]){const old={...makeMon(id,level-1),adventureTynamoGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const eel={...makeMon(603,39),adventureTynamoGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(eel,{}).learned,['깨물어부수기']);assert.equal(eel.pp.tackle,3);
});

test('new Zone 10 families use ZA moves without migrating legacy or alternate forms',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[79,31,['물의파동','박치기','사념의박치기','망각술']],[318,30,['기충전','물기','퀵턴','싫은소리']],[120,31,['아쿠아제트','스피드스타','거품광선','환상빔']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone10GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone10GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone10GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone10GrowthV1,undefined);}
 for(const [id,level,move] of [[79,36,'파도타기'],[80,45,'미래예지'],[318,32,'깨물어부수기'],[319,36,'고속이동'],[120,32,'빛의장막'],[121,42,'아쿠아브레이크']]){const old={...makeMon(id,level-1),adventureZone10GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const shark={...makeMon(319,30),adventureZone10GrowthV1:true,moves:['물기']};assert.deepEqual(applyAdventureEvolutionMoves(shark,{}).learned,['베어가르기']);assert.ok(adventureLearnableMoves({...makeMon(199,40),adventureZone10GrowthV1:true},{}).includes('염동력'));
});

test('Zone 9 psychic growth follows species and known Meowstic gender',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[64,29,['순간이동','리플렉터','사이코커터','HP회복']],[677,28,['염동력','거짓울음','스피드스타','환상빔']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone9PsychicGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone9PsychicGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone9PsychicGrowthV1,undefined);}
 for(const [id,gender,level,move] of [[64,'M',30,'사이코쇼크'],[65,'F',35,'사이코키네시스'],[677,'F',30,'빛의장막'],[678,'M',46,'회복봉인'],[10025,'F',40,'섀도볼']]){const old={...makeMon(id,level-1),gender,adventureZone9PsychicGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.ok(result.pending.includes(move));assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const male={...makeMon(678,50),gender:'M',adventureZone9PsychicGrowthV1:true},female={...makeMon(10025,50),gender:'F',adventureZone9PsychicGrowthV1:true};assert.ok(adventureLearnableMoves(male,{}).includes('희망사항'));assert.ok(!adventureLearnableMoves(female,{}).includes('희망사항'));assert.ok(adventureLearnableMoves(female,{}).includes('순간이동'));assert.ok(adventureLearnableMoves(female,{}).includes('문포스'));assert.deepEqual(applyAdventureEvolutionMoves({...makeMon(64,16),adventureZone9PsychicGrowthV1:true,moves:['몸통박치기']},{}).learned,['염동력']);
});

test('new Zone 9 wild species use ZA growth without rewriting older records',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[302,28,['섀도클로','이상한빛','탁쳐서떨구기','환상빔']],[303,28,['애교부리기','드레인키스','철벽','깨물어부수기']],[703,29,['돌진','매지컬샤인','철벽','파워젬']]]){
  const old=makeMon(id,level),before=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,before);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone9GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone9GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);const form={...old,formId:999};assert.equal(prepareVerifiedWildMoves(form),form);
 }
 for(const [id,level,move] of [[302,33,'깜짝베기'],[303,36,'아이언헤드'],[703,30,'빛의장막']]){const old={...makeMon(id,level-1),adventureZone9GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'].map(x=>x===move?'물기':x),pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
});

test('Zone 8 burrow families and new evolved grass encounters use ZA growth safely',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[443,24,['모래지옥','몸통박치기','용의숨결','땅고르기']],[529,23,['몸통박치기','메탈클로','모래지옥','땅고르기']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone8BurrowGrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone8BurrowGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);}
 const wild=makeMon(552,29);assert.equal(prepareVerifiedWildMoves(wild),wild);assert.deepEqual(prepareVerifiedWildMoves(wild,{zone8Evolved:true}).moves,['물기','구멍파기','돌진','깨물어부수기']);assert.equal(prepareVerifiedWildMoves({...wild,adventureAlpha:true},{zone8Evolved:true}).adventureZone8GrowthV1,undefined);
 for(const [id,level,move] of [[443,25,'물기'],[444,36,'드래곤클로'],[529,24,'베어가르기'],[530,26,'시저크로스']]){const old={...makeMon(id,level-1),adventureZone8BurrowGrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});}
 const chomp={...makeMon(445,48),adventureZone8BurrowGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(chomp,{}).learned,['깨물어부수기']);const drill={...makeMon(530,31),adventureZone8BurrowGrowthV1:true,moves:['몸통박치기']};assert.deepEqual(applyAdventureEvolutionMoves(drill,{}).learned,[]);assert.ok(adventureLearnableMoves(drill,{}).includes('금속음'));
});

test('new Zone 8 families use ZA growth and preserve legacy records',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[322,23,['기충전','땅고르기','망각술','분연']],[66,24,['세차게휘두르기','불릿펀치','탁쳐서떨구기','벌크업']],[551,23,['몸통박치기','모래지옥','물기','구멍파기']]]){
  const old=makeMon(id,level),before=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,before);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone8GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone8GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 }
 for(const [id,level,move] of [[322,26,'대지의힘'],[323,40,'지진'],[66,25,'깨뜨리다'],[68,40,'헤비봄버'],[551,27,'깨물어부수기'],[552,36,'아이언테일'],[553,58,'역린']]){const old={...makeMon(id,level-1),adventureZone8GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 for(const [id,move] of [[323,'스톤샤워'],[553,'와이드브레이커']]){const mon={...makeMon(id,40),adventureZone8GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.equal(mon.pp.tackle,3);assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
});

test('new Zone 7 families use ZA growth while preserving legacy records',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[449,20,['저주','모래지옥','구멍파기','깨물어부수기']],[353,20,['이상한빛','탁쳐서떨구기','도깨비불','야습']],[582,19,['몸통박치기','도발','흰안개','얼어붙은바람']]]){
  const old=makeMon(id,level),before=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,before);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone7GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone7GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 }
 for(const [id,level,move] of [[449,20,'깨물어부수기'],[450,36,'헤비봄버'],[353,23,'섀도클로'],[354,34,'칼춤'],[582,35,'냉동빔'],[583,35,'냉동빔']]){const old={...makeMon(id,level-1),adventureZone7GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const evolved={...makeMon(584,40),adventureZone7GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.ok(adventureLearnableMoves(evolved,{}).includes('프리즈드라이'));assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,[]);assert.equal(evolved.pp.tackle,3);
});

test('new Zone 6 families learn reviewed ZA growth without rewriting old or unknown foes',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[228,18,['째려보기','몸통박치기','울부짖기','물기']],[307,20,['버티기','바위깨기','불릿펀치','환상빔']],[427,18,['튀어오르기','몸통박치기','드레인키스','전광석화']]]){
  const old=makeMon(id,level),before=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,before);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone6GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone6GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 }
 for(const [id,level,move] of [[228,24,'돌진'],[229,21,'바크아웃'],[307,23,'명상'],[308,34,'고속이동'],[427,20,'고속이동'],[428,36,'아이언테일']]){const old={...makeMon(id,level-1),adventureZone6GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const mon={...makeMon(229,25),adventureZone6GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[]);assert.equal(mon.pp.tackle,3);assert.ok(adventureLearnableMoves(mon,{}).includes('나쁜음모'));assert.ok(adventureLearnableMoves({...makeMon(308,40),adventureZone6GrowthV1:true},{}).includes('냉동펀치'));
});

test('new Zone 5 grass families use ZA growth without rewriting older or unknown foes',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[69,13,['덩굴채찍','엉겨붙기','잎날가르기','수면가루']],[543,13,['독침','구르기','방어','엉겨붙기']]]){
  const old=makeMon(id,level),before=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,before);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone5GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone5GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 }
 for(const [id,level,move] of [[69,15,'독가루'],[70,19,'탁쳐서떨구기'],[71,40,'오물웨이브'],[543,16,'싫은소리'],[545,44,'시저크로스']]){const old={...makeMon(id,level-1),adventureZone5GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 const mon={...makeMon(71,30),adventureZone5GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,['오물폭탄']);assert.equal(mon.pp.tackle,3);assert.ok(adventureLearnableMoves(mon,{}).includes('오물폭탄'));
 for(const id of [544,545])assert.ok(adventureLearnableMoves({...makeMon(id,30),adventureZone5GrowthV1:true},{}).includes('킬러스핀'));
});

test('new Zone 4 families use ZA growth while old or unknown records remain untouched',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[23,9,['째려보기','몸통박치기','독침','물기']],[92,8,['이상한빛','핥기','최면술','염동력']],[167,8,['독침','실뿜기','흡수','엉겨붙기']]]){
  const old=makeMon(id,level),before=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,before);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone4GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone4GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 }
 for(const [id,level,move] of [[23,12,'뱀눈초리'],[93,48,'오물웨이브'],[94,55,'고스트다이브'],[167,16,'시저크로스'],[168,40,'덤벼들기']]){const old={...makeMon(id,level-1),adventureZone4GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));}
 for(const [id,move] of [[24,'깨물어부수기'],[168,'칼춤']]){const mon={...makeMon(id,30),adventureZone4GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.equal(mon.pp.tackle,3);assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
});

test('new Zone 3 families use ZA level and evolution moves without migrating older foes',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,expected] of [[667,['째려보기','몸통박치기','불꽃세례','울부짖기']],[672,['성장','몸통박치기','덩굴채찍']],[674,['째려보기','몸통박치기']]]){
  const old=makeMon(id,7),before=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,before);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone3GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);const future={...old,adventureZone3GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 }
 for(const [id,level,expected] of [[667,8,['분발']],[673,55,['지진']],[675,34,['세차게휘두르기','깨물어부수기']]]){const old={...makeMon(id,level-1),adventureZone3GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,expected);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});}
 for(const [id,move] of [[668,'오버히트'],[673,'제비반환'],[675,'깜짝베기']]){const mon={...makeMon(id,40),adventureZone3GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.equal(mon.pp.tackle,3);assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
 assert.ok(adventureLearnableMoves({...makeMon(668,40),adventureZone3GrowthV1:true},{}).includes('파괴광선'));
});

test('new Zone 2 Budew and Patrat use ZA growth without changing legacy creatures',async()=>{
 const {markAdventureVerifiedGrowth,prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[406,6,['흡수','애교부리기','성장','저리가루']],[504,6,['몸통박치기','째려보기','물기']]]){
  const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone2GrowthV1,true);assert.equal(markAdventureVerifiedGrowth(old),old);
  const future={...old,adventureZone2GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);assert.equal(markAdventureVerifiedGrowth(future),future);const alpha={...old,adventureAlpha:true};assert.equal(prepareVerifiedWildMoves(alpha),alpha);
 }
 for(const [id,level,move] of [[315,33,'독찌르기'],[407,34,'독찌르기'],[504,11,'판별'],[505,40,'아이언테일']]){
  const old={...makeMon(id,level-1),adventureZone2GrowthV1:true,moves:['몸통박치기','방어','빛의장막','전광석화'],pp:{tackle:2},custom:{keep:true}},result=applyAdventureLevelMoves(old,{...old,level},{});assert.deepEqual(result.pending,[move]);assert.equal(result.mon.pp.tackle,2);assert.deepEqual(result.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...old,level},{}).includes(move));
 }
 for(const [id,move] of [[315,'독침'],[505,'이상한빛']]){const mon={...makeMon(id,25),adventureZone2GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(mon,{}).learned,[move]);assert.equal(mon.pp.tackle,3);assert.ok(adventureLearnableMoves(mon,{}).includes(move));}
 assert.ok(adventureLearnableMoves({...makeMon(407,30),adventureZone2GrowthV1:true},{}).includes('킬러스핀'));
});

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

test('Zone 15 ordinary families grow without changing old or unknown records',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[246,41,['깨물어부수기','지진','스톤에지','록블라스트']],[710,42,['세차게휘두르기','최면술','섀도볼','매지컬플레임']]]){const old=makeMon(id,level),copy=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,copy);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone15GrowthV1,true);const unknown={...old,adventureZone15GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(unknown),unknown);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone15GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone15GrowthV1,undefined);}
 for(const [id,level,move] of [[246,48,'파괴광선'],[248,53,'헤비봄버'],[710,46,'파워휩'],[711,44,'고스트다이브']]){const before={...makeMon(id,level-1),adventureZone15GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level},{});assert.deepEqual(out.pending,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level},{}).includes(move));}
 const evolved={...makeMon(247,41),adventureZone15GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,['철벽']);assert.equal(prepareVerifiedWildMoves(makeMon(10027,42)).adventureZone15GrowthV1,true);
});

test('historical misspelled moves resolve without rewriting saved moves or PP',async()=>{
 const {moves}=await import('../lib/game.mjs');const {fieldMove}=await import('../lib/cloud-adventure/adventure-field-moves.mjs');
 for(const [old,name] of [['깨트리다','깨뜨리다'],['머드숏','머드샷'],['록블레스트','록블라스트']]){const saved={moves:[old],pp:{[moves[name].key]:2}},copy=structuredClone(saved);assert.equal(moves[old].key,moves[name].key);assert.equal(fieldMove(old).key,moves[name].key);assert.ok(sameAdventureMove(old,name));assert.deepEqual(saved,copy);}
});

test('Zone 16 Falinks and the Binacle family use ZA growth only for new verified encounters',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[688,20,['돌떨구기','거품광선','록블라스트','땅고르기']],[870,41,['버티기','아이언헤드','깨뜨리다','배수의진']]]){const old=makeMon(id,level),original=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,original);assert.deepEqual(fresh.moves,expected);assert.equal(fresh.adventureZone16GrowthV1,true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone16GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone16GrowthV1,undefined);const future={...old,adventureZone16GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);}
 const barb=makeMon(689,42);assert.equal(prepareVerifiedWildMoves(barb),barb);assert.equal(prepareVerifiedWildMoves(barb,{zone16Evolved:true}).adventureZone16GrowthV1,true);
 for(const [id,level,move] of [[688,35,'철벽'],[689,43,'깨뜨리다'],[870,43,'철벽']]){const before={...makeMon(id,level-1),adventureZone16GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level},{});assert.deepEqual(out.pending,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level},{}).includes(move));}const evolved={...makeMon(689,39),adventureZone16GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,[]);
});

test('Zone 17 and sewer families use ZA growth while preserving existing records',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[607,35,['도깨비불','회오리불꽃','화염방사','섀도볼']],[707,45,['드레인키스','러스터캐논','치근거리기','매지컬샤인']]]){const old=makeMon(id,level),snapshot=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,snapshot);assert.equal(fresh.adventureZone17GrowthV1,true);assert.deepEqual(fresh.moves,expected);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone17GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone17GrowthV1,undefined);const future={...old,adventureZone17GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);}
 for(const [id,marker] of [[608,'adventureZone17GrowthV1'],[660,'adventureBunnelbyMovesV1'],[668,'adventureZone3GrowthV1']]){const old=makeMon(id,45);assert.equal(prepareVerifiedWildMoves(old),old);assert.equal(prepareVerifiedWildMoves(old,{zone17Evolved:true})[marker],true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},{zone17Evolved:true})[marker],undefined);const future={...old,[marker]:{version:2}};assert.equal(prepareVerifiedWildMoves(future,{zone17Evolved:true}),future);}
 for(const [id,level,move] of [[607,38,'화염바퀴'],[608,48,'회복봉인'],[609,52,'오버히트'],[707,52,'회복봉인']]){const before={...makeMon(id,level-1),adventureZone17GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level},{});assert.deepEqual(out.pending,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level},{}).includes(move));}const evolved={...makeMon(609,45),adventureZone17GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,[]);
});

test('Zone 17 Skarmory and Zone 18 Bagon family use ZA growth for new ordinary encounters',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[227,45,['강철날개','깜짝베기','드릴라이너','금속음']],[371,45,['드래곤클로','사념의박치기','기충전','화염방사']]]){const old=makeMon(id,level),snapshot=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,snapshot);assert.equal(fresh.adventureZone18GrowthV1,true);assert.deepEqual(fresh.moves,expected);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone18GrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone18GrowthV1,undefined);const future={...old,adventureZone18GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);}
 for(const [id,level,move] of [[227,46,'압정뿌리기'],[371,50,'역린'],[372,55,'이판사판태클'],[373,60,'에어슬래시']]){const before={...makeMon(id,level-1),adventureZone18GrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level},{});assert.deepEqual(out.pending,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level},{}).includes(move));}
 for(const [id,move] of [[372,'방어'],[373,'공중날기']]){const evolved={...makeMon(id,50),adventureZone18GrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,[move]);assert.ok(adventureLearnableMoves(evolved,{}).includes(move));}assert.ok(adventureLearnableMoves({...makeMon(227,45),adventureZone18GrowthV1:true},{}).includes('에어슬래시'));
});

test('Zone 18 rooftop birds use ZA growth and retain old records',async()=>{
 const {prepareVerifiedWildMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 for(const [id,level,expected] of [[333,44,['회오리','돌진','문포스','깃털댄스']],[714,44,['분노의앞니','에어슬래시','싫은소리','폭풍']]]){const old=makeMon(id,level),snapshot=structuredClone(old),fresh=prepareVerifiedWildMoves(old);assert.deepEqual(old,snapshot);assert.equal(fresh.adventureZone18BirdGrowthV1,true);assert.deepEqual(fresh.moves,expected);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true}).adventureZone18BirdGrowthV1,undefined);assert.equal(prepareVerifiedWildMoves({...old,formId:999}).adventureZone18BirdGrowthV1,undefined);const future={...old,adventureZone18BirdGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future),future);}
 for(const id of [334,715]){const old=makeMon(id,46);assert.equal(prepareVerifiedWildMoves(old),old);assert.equal(prepareVerifiedWildMoves(old,{zone18Evolved:true}).adventureZone18BirdGrowthV1,true);assert.equal(prepareVerifiedWildMoves({...old,adventureAlpha:true},{zone18Evolved:true}).adventureZone18BirdGrowthV1,undefined);const future={...old,adventureZone18BirdGrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(future,{zone18Evolved:true}),future);}
 for(const [id,level,move] of [[333,50,'브레이브버드'],[334,55,'드래곤다이브'],[714,44,'폭풍'],[715,52,'폭음파']]){const before={...makeMon(id,level-1),adventureZone18BirdGrowthV1:true,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:3},custom:{keep:true}},out=applyAdventureLevelMoves(before,{...before,level},{});assert.deepEqual(out.pending,[move]);assert.equal(out.mon.pp.tackle,3);assert.deepEqual(out.mon.custom,{keep:true});assert.ok(adventureLearnableMoves({...before,level},{}).includes(move));}
 for(const id of [334,715]){const evolved={...makeMon(id,48),adventureZone18BirdGrowthV1:true,moves:['몸통박치기'],pp:{tackle:3}};assert.deepEqual(applyAdventureEvolutionMoves(evolved,{}).learned,['용의파동']);assert.ok(adventureLearnableMoves(evolved,{}).includes('용의파동'));}
});

test('Mission 20 Gengar growth is opt-in and keeps old and alpha records intact',async()=>{
 const {prepareVerifiedWildMoves,adventureLearnableMoves,applyAdventureLevelMoves}=await import('../lib/cloud-adventure/adventure-growth.mjs');
 const old=makeMon(94,42),before=structuredClone(old);assert.equal(prepareVerifiedWildMoves(old),old);const fresh=prepareVerifiedWildMoves(old,{mission20Ghost:true});assert.deepEqual(old,before);assert.equal(fresh.adventureZone4GrowthV1,true);assert.ok(adventureLearnableMoves(fresh,{}).includes('섀도클로'));
 const alpha={...old,adventureAlpha:true},future={...old,adventureZone4GrowthV1:{version:2}};assert.equal(prepareVerifiedWildMoves(alpha,{mission20Ghost:true}),alpha);assert.equal(prepareVerifiedWildMoves(future,{mission20Ghost:true}),future);
 const mon={...fresh,level:47,moves:['몸통박치기','방어','물기','전광석화'],pp:{tackle:2},custom:{keep:true}},next=applyAdventureLevelMoves(mon,{...mon,level:48},{});assert.ok(next.pending.includes('오물웨이브'));assert.equal(next.mon.pp.tackle,2);assert.deepEqual(next.mon.custom,{keep:true});
});
