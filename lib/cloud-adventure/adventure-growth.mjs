import {learnableMoves,moveNameByKey} from '../pokemon-config.mjs';
import {adventureMoveKey,knowsAdventureMove,sameAdventureMove} from './adventure-move-identity.mjs';
import learnsets from '../../data/learnsets-modern.json' with {type:'json'};

// A newly learned move starts with full PP. Remaining moves keep their PP.
export function teachAdventureMove(mon,name,slot){
 const previous=mon.moves[slot],next=mon.moves.slice(),pp={...(mon.pp||{})};
 next[slot]=name;mon.moves=next.filter(Boolean);
 const oldKey=adventureMoveKey(previous),newKey=adventureMoveKey(name);
 if(oldKey&&!mon.moves.some(move=>adventureMoveKey(move)===oldKey))delete pp[oldKey];
 if(newKey)delete pp[newKey];
 mon.pp=pp;return mon;
}

// Compare the old and new level, rather than treating older relearnable moves as
// new on every level-up. Moves that do not fit remain available in management.
function applyNewMoves(after,unlocked){
 const learned=[],pending=[];
 for(const name of unlocked){
  if(knowsAdventureMove(after,name)||pending.some(move=>sameAdventureMove(move,name)))continue;
  if(after.moves.length<4){teachAdventureMove(after,name,after.moves.length);learned.push(name);}
  else pending.push(name);
 }
 return {mon:after,learned,pending};
}
// Confirmed Z-A level moves for the three starter families. Legacy saves
// retain their existing learnset; newly marked captures use the verified table.
const introLevelMoves={
 152:[[9,'차밍보이스'],[12,'잎날가르기'],[14,'씨뿌리기'],[22,'누르기'],[27,'리플렉터'],[36,'신비의부적'],[40,'광합성'],[45,'솔라빔'],[50,'빛의장막'],[56,'리프스톰']],
 158:[[10,'물기'],[15,'거품광선'],[21,'아쿠아제트'],[26,'와이드브레이커'],[35,'싫은소리'],[40,'아쿠아브레이크'],[50,'하이드로펌프'],[56,'역린']],
 498:[[10,'구르기'],[13,'연막'],[15,'화염바퀴'],[20,'회오리불꽃'],[24,'기충전'],[29,'화염방사'],[32,'돌진'],[50,'플레어드라이브'],[56,'양날박치기']]
};
const introStageMoves={499:[[36,'벌크업']],500:[[36,'벌크업'],[45,'인파이트']]};
function starterLevelMoves(speciesId){const base=starterBase[speciesId],element={152:'나뭇잎',158:'물대포',498:'불꽃세례'}[base];return [...(element?[[6,element]]:[]),...(introLevelMoves[base]||[]),...(introStageMoves[speciesId]||[])].sort((a,b)=>a[0]-b[0]);}
const starterBase={152:152,153:152,154:152,158:158,159:158,160:158,498:498,499:498,500:498};
const introEvolutionMoves={153:['기가드레인'],154:['기가드레인','리프블레이드'],159:['베어가르기'],160:['베어가르기','깨물어부수기'],499:['그로우펀치'],500:['그로우펀치','히트스탬프']};
// The Kanto families have their own version marker so earlier captured/shared
// Pokémon retain their previous growth and move-management behavior.
const kantoBase={1:1,2:1,3:1,4:4,5:4,6:4,7:7,8:7,9:7};
const kantoLevels={
 1:[[1,'울음소리'],[1,'몸통박치기'],[3,'덩굴채찍'],[6,'성장'],[9,'씨뿌리기'],[12,'잎날가르기'],[15,'독가루'],[15,'수면가루'],[25,'돌진'],[30,'매지컬리프'],[35,'광합성'],[40,'망각술'],[42,'오물웨이브'],[45,'이판사판태클'],[55,'솔라빔']],
 4:[[1,'울음소리'],[1,'몸통박치기'],[4,'불꽃세례'],[8,'연막'],[12,'용의숨결'],[17,'불꽃엄니'],[20,'회오리불꽃'],[24,'베어가르기'],[30,'화염방사'],[42,'드래곤다이브'],[54,'플레어드라이브']],
 7:[[1,'몸통박치기'],[1,'꼬리흔들기'],[3,'물대포'],[12,'물기'],[15,'거품광선'],[20,'얼어붙은바람'],[30,'아쿠아링'],[35,'아쿠아제트'],[40,'철벽'],[45,'아쿠아브레이크']]
};
const kantoEvolutionMoves={3:['파워휩'],6:['에어슬래시','불대문자'],9:['러스터캐논','하이드로펌프']};
const kalosBase={650:650,651:650,652:650,653:653,654:653,655:653,656:656,657:656,658:656};
const kalosLevels={
 650:[[1,'울음소리'],[1,'덩굴채찍'],[5,'성장'],[8,'구르기'],[11,'물기'],[15,'씨뿌리기'],[18,'바늘미사일'],[27,'돌진'],[35,'깨뜨리다'],[42,'누르기'],[48,'우드해머']],
 653:[[1,'몸통박치기'],[1,'꼬리흔들기'],[5,'불꽃세례'],[14,'애교부리기'],[17,'환상빔'],[20,'회오리불꽃'],[25,'빛의장막'],[31,'사이코쇼크'],[35,'화염방사'],[38,'도깨비불'],[41,'사이코키네시스'],[54,'불대문자']],
 656:[[1,'울음소리'],[1,'몸통박치기'],[5,'물대포'],[8,'전광석화'],[10,'핥기'],[14,'거품광선'],[18,'연막'],[35,'대타출동'],[38,'깜짝베기'],[43,'뛰어오르기'],[51,'그림자분신'],[57,'하이드로펌프']]
};
const kalosStageLevels={652:[[38,'벌크업'],[45,'인파이트'],[55,'기가임팩트']],654:[[46,'고속이동']],655:[[46,'고속이동']],657:[[23,'제비반환'],[28,'야습']],658:[[23,'제비반환'],[28,'야습']]};
const kalosEvolutionMoves={652:['니들가드'],655:['매지컬플레임'],658:['물수리검']};
const kalosRememberMoves={655:['미래예지','섀도볼']};
function verifiedKalosFamily(mon){return !!kalosBase[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasVerifiedKalos(mon){return mon?.adventureKalosMovesV1===true&&verifiedKalosFamily(mon);}
function kalosLevelMoves(speciesId){return [...(kalosLevels[kalosBase[speciesId]]||[]),...(kalosStageLevels[speciesId]||[])].sort((a,b)=>a[0]-b[0]);}
function verifiedKantoFamily(mon){return !!kantoBase[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasVerifiedKanto(mon){return mon?.adventureKantoMovesV1===true&&verifiedKantoFamily(mon);}
function kantoLevelMoves(speciesId){return [...(speciesId===6?[[1,'드래곤클로']]:[]),...(kantoLevels[kantoBase[speciesId]]||[])];}
// Pichu, Pikachu and the reviewed Raichu forms share this Z-A level table.
// Existing creatures and unreviewed alternate forms retain their old behavior.
// https://pokemondb.net/pokedex/pichu/moves/9
// https://pokemondb.net/pokedex/pikachu/moves/9
// https://pokemondb.net/pokedex/raichu/moves/9
// https://rotomlabs.net/dex/legends-z-a/raichu/alolan
const pichuFamilyLevels=[[1,'울음소리'],[1,'전광석화'],[1,'꼬리흔들기'],[1,'전기쇼크'],[4,'전기자석파'],[12,'볼부비부비'],[16,'스파크'],[20,'애교부리기'],[25,'10만볼트'],[30,'충전'],[35,'빛의장막'],[40,'번개'],[99,'볼트태클']];
function verifiedPichuFamily(mon){return !!mon&&([172,25,26].includes(mon.speciesId)&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId)||mon.id===10100&&mon.speciesId===26&&(mon.formId==null||mon.formId===10202));}
function hasVerifiedPichuFamily(mon){return mon?.adventurePichuMovesV1===true&&verifiedPichuFamily(mon);}
// Bunnelby and Diggersby share these Z-A levels; Bulldoze is an evolution move.
// https://pokemondb.net/pokedex/bunnelby/moves/9
// https://pokemondb.net/pokedex/diggersby/moves/9
const bunnelbyLevels=[[1,'째려보기'],[1,'몸통박치기'],[7,'머드샷'],[14,'전광석화'],[24,'세차게휘두르기'],[28,'구멍파기'],[32,'뛰어오르기'],[36,'돌진'],[40,'분노의앞니'],[44,'지진']];
function verifiedBunnelbyFamily(mon){return !!mon&&[659,660].includes(mon.speciesId)&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasVerifiedBunnelby(mon){return mon?.adventureBunnelbyMovesV1===true&&verifiedBunnelbyFamily(mon);}
// Fletchling's Z-A levels differ from the general modern learnset.
// https://pokemondb.net/pokedex/fletchling/moves/9
// https://pokemondb.net/pokedex/fletchinder/moves/9
// https://pokemondb.net/pokedex/talonflame/moves/9
const fletchlingLevels=[[1,'울음소리'],[1,'쪼기'],[8,'전광석화'],[12,'불꽃세례'],[16,'깃털댄스'],[20,'날려버리기'],[25,'화염바퀴'],[30,'강철날개'],[35,'에어슬래시'],[40,'고속이동'],[45,'플레어드라이브']];
function verifiedFletchlingFamily(mon){return !!mon&&[661,662,663].includes(mon.speciesId)&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasVerifiedFletchling(mon){return mon?.adventureFletchlingMovesV1===true&&verifiedFletchlingFamily(mon);}
// Base-form Scatterbug family: Z-A level, evolution and reminder moves.
// https://pokemondb.net/pokedex/scatterbug/moves/9
// https://pokemondb.net/pokedex/spewpa/moves/9
// https://pokemondb.net/pokedex/vivillon/moves/9
const scatterbugLevels={664:[[1,'실뿜기'],[1,'몸통박치기'],[7,'저리가루']],665:[[1,'단단해지기'],[1,'독가루'],[1,'실뿜기'],[1,'몸통박치기'],[7,'저리가루'],[10,'엉겨붙기']],666:[[1,'독가루'],[1,'수면가루'],[1,'저리가루'],[10,'엉겨붙기'],[12,'빛의장막'],[15,'드레인키스'],[17,'초음파'],[21,'환상빔'],[25,'유턴'],[28,'에어슬래시'],[35,'벌레의야단법석'],[40,'폭풍'],[40,'신비의부적'],[45,'날려버리기']]};
function verifiedScatterbugFamily(mon){return !!mon&&[664,665,666].includes(mon.speciesId)&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasVerifiedScatterbug(mon){return mon?.adventureScatterbugMovesV1===true&&verifiedScatterbugFamily(mon);}
// Reviewed Z-A level/evolution/reminder data for the three Zone 1 families.
// https://pokemondb.net/pokedex/weedle/moves/9
// https://pokemondb.net/pokedex/beedrill/moves/9
// https://pokemondb.net/pokedex/pidgey/moves/9
// https://pokemondb.net/pokedex/ampharos/moves/9
const earlyFamilies={13:13,14:13,15:13,16:16,17:16,18:16,179:179,180:179,181:179};
const weedleLevels={13:[[1,'독침'],[1,'실뿜기']],14:[[1,'독침'],[1,'실뿜기'],[7,'단단해지기']],15:[[1,'독침'],[1,'실뿜기'],[7,'단단해지기'],[15,'기충전'],[20,'세차게휘두르기'],[25,'시저크로스'],[27,'벌레의야단법석'],[29,'독압정'],[33,'덤벼들기'],[35,'독찌르기'],[40,'드릴라이너']]};
const pidgeyLevels=[[1,'울음소리'],[1,'몸통박치기'],[9,'바람일으키기'],[13,'전광석화'],[17,'회오리'],[21,'날개치기'],[25,'날려버리기'],[29,'고속이동'],[33,'에어슬래시'],[40,'깃털댄스'],[45,'폭풍'],[50,'브레이브버드']];
const mareepLevels=[[1,'울음소리'],[1,'몸통박치기'],[4,'전기쇼크'],[8,'전기자석파'],[15,'충전'],[17,'이상한빛'],[28,'코튼가드'],[32,'파워젬'],[36,'10만볼트'],[40,'빛의장막'],[45,'번개']];
function earlyFamily(mon){return !!earlyFamilies[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasEarlyFamily(mon){return mon?.adventureZone1GrowthV1===true&&earlyFamily(mon);}
function earlyLevels(species){return earlyFamilies[species]===13?weedleLevels[species]:earlyFamilies[species]===16?pidgeyLevels:species===181?[...mareepLevels,[42,'와이드브레이커'],[50,'전자포']].sort((a,b)=>a[0]-b[0]):mareepLevels;}
// Zone 2 base forms and their evolutions; only newly generated ordinary foes
// receive the marker, so pending encounters retain their previous rules.
// https://pokemondb.net/pokedex/budew/moves/9
// https://pokemondb.net/pokedex/roselia/moves/9
// https://pokemondb.net/pokedex/roserade/moves/9
// https://pokemondb.net/pokedex/patrat/moves/9
// https://pokemondb.net/pokedex/watchog/moves/9
const zone2Families={406:406,315:406,407:406,504:504,505:504};
const budewBase=[[1,'흡수'],[1,'애교부리기'],[1,'성장'],[1,'저리가루']];
const roseLevels=[[5,'잎날가르기'],[8,'바늘미사일'],[10,'씨뿌리기'],[15,'매지컬리프'],[18,'수면가루'],[22,'독압정'],[30,'기가드레인'],[37,'광합성'],[44,'맹독'],[55,'리프스톰']];
const patratLevels=[[1,'몸통박치기'],[3,'째려보기'],[6,'물기'],[11,'판별'],[16,'깨물어부수기'],[18,'최면술'],[21,'분노의앞니'],[26,'기충전'],[28,'분발'],[33,'나쁜음모']];
function zone2Family(mon){return !!zone2Families[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasZone2Family(mon){return mon?.adventureZone2GrowthV1===true&&zone2Family(mon);}
function zone2Levels(species){if(species===406)return budewBase;if(species===315||species===407)return [...budewBase,...roseLevels,[species===315?33:34,'독찌르기']].sort((a,b)=>a[0]-b[0]);return species===505?[...patratLevels,[40,'아이언테일'],[46,'돌진'],[50,'이판사판태클']]:patratLevels;}
// Reviewed Z-A tables for three ordinary Zone 3 families.
// https://pokemondb.net/pokedex/litleo/moves/9
// https://pokemondb.net/pokedex/pyroar/moves/9
// https://pokemondb.net/pokedex/skiddo/moves/9
// https://pokemondb.net/pokedex/gogoat/moves/9
// https://pokemondb.net/pokedex/pancham/moves/9
// https://pokemondb.net/pokedex/pangoro/moves/9
const zone3Families={667:667,668:667,672:672,673:672,674:674,675:674};
const litleoLevels=[[1,'째려보기'],[1,'몸통박치기'],[5,'불꽃세례'],[6,'울부짖기'],[8,'분발'],[11,'박치기'],[16,'바크아웃'],[20,'돌진'],[23,'불꽃엄니'],[28,'대지의힘'],[32,'화염방사'],[36,'깨물어부수기'],[42,'하이퍼보이스']];
const skiddoLevels=[[1,'성장'],[1,'몸통박치기'],[7,'덩굴채찍'],[9,'꼬리흔들기'],[12,'씨뿌리기'],[13,'잎날가르기'],[16,'머드샷'],[20,'광합성'],[22,'돌진'],[26,'땅고르기'],[34,'우드혼'],[38,'벌크업'],[42,'이판사판태클'],[45,'리프블레이드'],[50,'메가혼']];
const panchamLevels=[[1,'째려보기'],[1,'몸통박치기'],[8,'도발'],[15,'깨뜨리다'],[20,'분발'],[24,'베어가르기'],[28,'판별'],[30,'막말내뱉기'],[34,'깨물어부수기'],[44,'누르기']];
function zone3Family(mon){return !!zone3Families[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasZone3Family(mon){return mon?.adventureZone3GrowthV1===true&&zone3Family(mon);}
function zone3Levels(species){if(species===667)return litleoLevels;if(species===668)return [[1,'불꽃세례'],...litleoLevels.filter(([level,move])=>!(level===5&&move==='불꽃세례'))];if(species===672)return skiddoLevels;if(species===673)return [...skiddoLevels,[55,'지진']];if(species===674)return panchamLevels;return [[1,'불릿펀치'],[1,'째려보기'],[1,'몸통박치기'],[1,'도발'],...panchamLevels.filter(([level])=>level>=15&&level<34),[34,'세차게휘두르기'],...panchamLevels.filter(([level])=>level>=34),[50,'역린'],[54,'기충전'],[58,'인파이트']];}
// Reviewed Z-A tables for three base-form Zone 4 families.
// https://pokemondb.net/pokedex/ekans/moves/9
// https://pokemondb.net/pokedex/arbok/moves/9
// https://pokemondb.net/pokedex/gastly/moves/9
// https://pokemondb.net/pokedex/haunter/moves/9
// https://pokemondb.net/pokedex/gengar/moves/9
// https://pokemondb.net/pokedex/spinarak/moves/9
// https://pokemondb.net/pokedex/ariados/moves/9
const zone4Families={23:23,24:23,92:92,93:92,94:92,167:167,168:167};
const ekansLevels=[[1,'째려보기'],[1,'몸통박치기'],[4,'독침'],[9,'물기'],[12,'뱀눈초리'],[15,'세차게휘두르기'],[17,'싫은소리'],[25,'맹독'],[33,'흡혈'],[36,'독찌르기'],[41,'흑안개'],[49,'더스트슈트']];
const gastlyLevels=[[1,'이상한빛'],[1,'핥기'],[4,'최면술'],[8,'염동력'],[12,'야습'],[20,'저주'],[24,'흑안개'],[28,'얼어붙은바람'],[36,'악의파동'],[40,'섀도볼'],[50,'멸망의노래']];
const spinarakLevels=[[1,'독침'],[1,'실뿜기'],[5,'흡수'],[8,'엉겨붙기'],[12,'야습'],[16,'시저크로스'],[21,'싫은소리'],[24,'끈적끈적네트'],[27,'바늘미사일'],[30,'사이코키네시스'],[33,'독찌르기'],[35,'벌레의야단법석'],[37,'흡혈'],[40,'덤벼들기'],[44,'메가혼']];
function zone4Family(mon){return !!zone4Families[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasZone4Family(mon){return mon?.adventureZone4GrowthV1===true&&zone4Family(mon);}
function zone4Levels(species){if([23,24].includes(species))return ekansLevels;if([92,93,94].includes(species))return species===92?gastlyLevels:[...gastlyLevels,[16,'섀도클로'],[48,'오물웨이브'],[55,'고스트다이브']].sort((a,b)=>a[0]-b[0]);return species===168?[[1,'기충전'],...spinarakLevels]:spinarakLevels;}
// Reviewed Zone 5 grass families. New ordinary base-stage encounters only.
// https://pokemondb.net/pokedex/bellsprout/moves/9
// https://pokemondb.net/pokedex/weepinbell/moves/9
// https://pokemondb.net/pokedex/victreebel/moves/9
// https://pokemondb.net/pokedex/venipede/moves/9
// https://pokemondb.net/pokedex/whirlipede/moves/9
// https://pokemondb.net/pokedex/scolipede/moves/9
const zone5Families={69:69,70:69,71:69,543:543,544:543,545:543};
const bellsproutLevels=[[1,'성장'],[1,'덩굴채찍'],[8,'엉겨붙기'],[10,'잎날가르기'],[13,'수면가루'],[15,'독가루'],[17,'저리가루'],[19,'탁쳐서떨구기'],[23,'매지컬리프'],[26,'독압정'],[30,'독찌르기'],[33,'흡혈'],[40,'오물웨이브'],[44,'파워휩'],[48,'리프스톰']];
const venipedeLevels=[[1,'째려보기'],[1,'독침'],[4,'구르기'],[8,'방어'],[12,'엉겨붙기'],[16,'싫은소리'],[20,'바늘미사일'],[24,'돌진'],[28,'독찌르기'],[36,'맹독'],[48,'고속이동'],[52,'이판사판태클']];
function zone5Family(mon){return !!zone5Families[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasZone5Family(mon){return mon?.adventureZone5GrowthV1===true&&zone5Family(mon);}
function zone5Levels(species){if(species===69||species===70)return bellsproutLevels;if(species===71)return [[1,'덤벼들기'],...bellsproutLevels];if(species===543||species===544)return venipedeLevels;return [[1,'철벽'],...venipedeLevels,[40,'아이언테일'],[44,'시저크로스'],[56,'메가혼']].sort((a,b)=>a[0]-b[0]);}
// Reviewed Zone 6 ordinary base forms and their Z-A evolutions.
// https://pokemondb.net/pokedex/houndour/moves/9
// https://pokemondb.net/pokedex/houndoom/moves/9
// https://pokemondb.net/pokedex/meditite/moves/9
// https://pokemondb.net/pokedex/medicham/moves/9
// https://pokemondb.net/pokedex/buneary/moves/9
// https://pokemondb.net/pokedex/lopunny/moves/9
const zone6Families={228:228,229:228,307:307,308:307,427:427,428:427};
const houndourLevels=[[1,'불꽃세례'],[1,'째려보기'],[6,'몸통박치기'],[13,'울부짖기'],[16,'물기'],[24,'돌진'],[28,'불꽃엄니'],[44,'화염방사'],[49,'깨물어부수기']];
const medititeLevels=[[1,'염동력'],[1,'분발'],[9,'판별'],[12,'버티기'],[14,'바위깨기'],[16,'불릿펀치'],[20,'환상빔'],[23,'명상'],[25,'사념의박치기'],[30,'돌진'],[41,'HP회복'],[52,'폭발펀치']];
const bunearyLevels=[[1,'튀어오르기'],[1,'몸통박치기'],[14,'드레인키스'],[16,'전광석화'],[20,'고속이동'],[24,'애교부리기'],[28,'세차게휘두르기'],[32,'박치기'],[42,'코튼가드'],[48,'뛰어오르기'],[52,'폭발펀치']];
function zone6Family(mon){return !!zone6Families[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasZone6Family(mon){return mon?.adventureZone6GrowthV1===true&&zone6Family(mon);}
function zone6Levels(species){if(species===228)return [...houndourLevels,[52,'나쁜음모']];if(species===229)return [[1,'불꽃세례'],[1,'째려보기'],[1,'나쁜음모'],...houndourLevels.filter(([level])=>level>1),[21,'바크아웃'],[34,'악의파동'],[55,'오버히트']].sort((a,b)=>a[0]-b[0]);if(species===307)return medititeLevels;if(species===308)return [...medititeLevels,[34,'고속이동']].sort((a,b)=>a[0]-b[0]);if(species===427)return bunearyLevels;return [...bunearyLevels,[6,'그로우펀치'],[9,'마하펀치'],[12,'그림자분신'],[36,'아이언테일']].sort((a,b)=>a[0]-b[0]);}
// Reviewed Z-A tables for Zone 7 day/night ordinary base forms.
// https://pokemondb.net/pokedex/hippopotas/moves/9
// https://pokemondb.net/pokedex/hippowdon/moves/9
// https://pokemondb.net/pokedex/shuppet/moves/9
// https://pokemondb.net/pokedex/banette/moves/9
// https://pokemondb.net/pokedex/vanillite/moves/9
// https://pokemondb.net/pokedex/vanillish/moves/9
// https://pokemondb.net/pokedex/vanilluxe/moves/9
const zone7Families={449:449,450:449,353:353,354:353,582:582,583:582,584:582};
const hippopotasLevels=[[1,'몸통박치기'],[4,'물기'],[8,'저주'],[12,'모래지옥'],[16,'구멍파기'],[20,'깨물어부수기'],[24,'망각술'],[28,'돌진'],[32,'울부짖기'],[40,'지진'],[44,'이판사판태클']];
const shuppetLevels=[[1,'핥기'],[1,'싫은소리'],[8,'이상한빛'],[12,'탁쳐서떨구기'],[16,'도깨비불'],[19,'야습'],[23,'섀도클로'],[26,'저주'],[30,'섀도볼'],[34,'칼춤'],[42,'고스트다이브'],[48,'더스트슈트']];
const vanilliteLevels=[[1,'단단해지기'],[1,'몸통박치기'],[4,'도발'],[8,'흰안개'],[12,'얼어붙은바람'],[20,'자폭'],[24,'고드름떨구기'],[32,'녹기'],[35,'냉동빔'],[46,'대폭발'],[58,'눈보라']];
function zone7Family(mon){return !!zone7Families[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
function hasZone7Family(mon){return mon?.adventureZone7GrowthV1===true&&zone7Family(mon);}
function zone7Levels(species){if(species===449)return hippopotasLevels;if(species===450)return [[1,'물기'],[1,'몸통박치기'],...hippopotasLevels.filter(([level])=>level>=12),[36,'헤비봄버']].sort((a,b)=>a[0]-b[0]);if(species===353)return shuppetLevels;if(species===354)return [[1,'핥기'],[1,'싫은소리'],[1,'베어가르기'],...shuppetLevels.filter(([level])=>level>1)];if(species===584)return [[1,'프리즈드라이'],...vanilliteLevels];return vanilliteLevels;}
// Only verified base-form families, and only newly caught individuals.
function verifiedFamily(mon){return !!starterBase[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
export function markAdventureVerifiedGrowth(mon){if(!mon)return mon;if(verifiedScatterbugFamily(mon))return Object.hasOwn(mon,'adventureScatterbugMovesV1')?mon:{...mon,adventureScatterbugMovesV1:true};if(verifiedFletchlingFamily(mon))return Object.hasOwn(mon,'adventureFletchlingMovesV1')?mon:{...mon,adventureFletchlingMovesV1:true};if(verifiedBunnelbyFamily(mon))return Object.hasOwn(mon,'adventureBunnelbyMovesV1')?mon:{...mon,adventureBunnelbyMovesV1:true};if(verifiedPichuFamily(mon))return Object.hasOwn(mon,'adventurePichuMovesV1')?mon:{...mon,adventurePichuMovesV1:true};if(verifiedKalosFamily(mon))return Object.hasOwn(mon,'adventureKalosMovesV1')?mon:{...mon,adventureKalosMovesV1:true};if(verifiedKantoFamily(mon))return Object.hasOwn(mon,'adventureKantoMovesV1')?mon:{...mon,adventureKantoMovesV1:true};if(!verifiedFamily(mon)||Object.hasOwn(mon,'adventureVerifiedFamilyMovesV1'))return mon;return {...mon,adventureVerifiedFamilyMovesV1:true};}
function hasVerifiedFamily(mon){return mon?.adventureVerifiedFamilyMovesV1===true&&verifiedFamily(mon);}
// Wild moves are provisional: use the engine's usual latest-four convention.
// Only new ordinary base-stage encounters are changed, never saved battles or alphas.
export function prepareVerifiedWildMoves(mon){
 if(zone7Family(mon)&&[449,353,582].includes(mon.speciesId)&&mon.adventureAlpha!==true&&!Object.hasOwn(mon,'adventureZone7GrowthV1')&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,adventureZone7GrowthV1:true,moves:zone7Levels(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(zone6Family(mon)&&[228,307,427].includes(mon.speciesId)&&mon.adventureAlpha!==true&&!Object.hasOwn(mon,'adventureZone6GrowthV1')&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,adventureZone6GrowthV1:true,moves:zone6Levels(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(zone5Family(mon)&&[69,543].includes(mon.speciesId)&&mon.adventureAlpha!==true&&!Object.hasOwn(mon,'adventureZone5GrowthV1')&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,adventureZone5GrowthV1:true,moves:zone5Levels(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(zone4Family(mon)&&[23,92,167].includes(mon.speciesId)&&mon.adventureAlpha!==true&&!Object.hasOwn(mon,'adventureZone4GrowthV1')&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,adventureZone4GrowthV1:true,moves:zone4Levels(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(zone3Family(mon)&&[667,672,674].includes(mon.speciesId)&&mon.adventureAlpha!==true&&!Object.hasOwn(mon,'adventureZone3GrowthV1')&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,adventureZone3GrowthV1:true,moves:zone3Levels(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(zone2Family(mon)&&[406,504].includes(mon.speciesId)&&mon.adventureAlpha!==true&&!Object.hasOwn(mon,'adventureZone2GrowthV1')&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,adventureZone2GrowthV1:true,moves:zone2Levels(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(earlyFamily(mon)&&![14,15,17,18,180,181].includes(mon.speciesId)&&mon.adventureAlpha!==true&&!Object.hasOwn(mon,'adventureZone1GrowthV1')&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,adventureZone1GrowthV1:true,moves:earlyLevels(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(verifiedScatterbugFamily(mon)&&mon.speciesId===664&&mon.adventureAlpha!==true&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,moves:scatterbugLevels[664].filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(verifiedFletchlingFamily(mon)&&mon.speciesId===661&&mon.adventureAlpha!==true&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,moves:fletchlingLevels.filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(verifiedBunnelbyFamily(mon)&&mon.speciesId===659&&mon.adventureAlpha!==true&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,moves:bunnelbyLevels.filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(verifiedPichuFamily(mon)&&mon.adventureAlpha!==true&&[172,25].includes(mon.speciesId)&&mon.id===mon.speciesId&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,moves:pichuFamilyLevels.filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(verifiedKalosFamily(mon)&&mon.adventureAlpha!==true&&[650,653,656].includes(mon.speciesId)&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,moves:kalosLevelMoves(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(verifiedKantoFamily(mon)&&mon.adventureAlpha!==true&&[1,4,7].includes(mon.speciesId)&&Number.isSafeInteger(mon.level)&&mon.level>=1&&mon.level<=100)return {...mon,moves:kantoLevelMoves(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move).slice(-4),pp:{}};
 if(!verifiedFamily(mon)||mon.adventureAlpha===true||![152,158,498].includes(mon.speciesId)||!Number.isSafeInteger(mon.level)||mon.level<1||mon.level>100)return mon;
 const first=['몸통박치기',mon.speciesId===158?'째려보기':'꼬리흔들기'];
 const moves=[...first,...starterLevelMoves(mon.speciesId).filter(([level])=>level<=mon.level).map(([,move])=>move)].slice(-4);
 return {...mon,moves,pp:{}};
}
function isIntroStarter(mon,world){
 if(world?.zaIntroStarterMovesV1!==true||mon?.origin!=='starter')return false;
 const id=world.zaIntroStarterBoxId;
 return typeof id==='string'?id===mon.boxId:world.zaIntroStarterSpecies!=null?world.zaIntroStarterSpecies===(starterBase[mon.speciesId]??mon.speciesId):
  ['andi','escape','brigitte','barrierRoute','barrier','tunnel','hotel'].includes(world.zaIntroStage)&&world.activeId===mon.boxId;
}
export function applyAdventureLevelMoves(before,after,world){
 if(hasZone7Family(before))return applyNewMoves(after,zone7Levels(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasZone6Family(before))return applyNewMoves(after,zone6Levels(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasZone5Family(before))return applyNewMoves(after,zone5Levels(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasZone4Family(before))return applyNewMoves(after,zone4Levels(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasZone3Family(before))return applyNewMoves(after,zone3Levels(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasZone2Family(before))return applyNewMoves(after,zone2Levels(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasEarlyFamily(before))return applyNewMoves(after,earlyLevels(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasVerifiedScatterbug(before))return applyNewMoves(after,scatterbugLevels[before.speciesId].filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasVerifiedFletchling(before))return applyNewMoves(after,fletchlingLevels.filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasVerifiedBunnelby(before))return applyNewMoves(after,bunnelbyLevels.filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasVerifiedPichuFamily(before))return applyNewMoves(after,pichuFamilyLevels.filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasVerifiedKalos(before))return applyNewMoves(after,kalosLevelMoves(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if(hasVerifiedKanto(before))return applyNewMoves(after,kantoLevelMoves(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 if((world?.zaIntroStarterMovesV2===true&&isIntroStarter(before,world)&&starterBase[before.speciesId])||hasVerifiedFamily(before)){
  return applyNewMoves(after,starterLevelMoves(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move));
 }
 const knownBefore=new Set(learnableMoves(before,before.level));
 const legacy=applyNewMoves(after,learnableMoves(after,after.level).filter(name=>!knownBefore.has(name)));
 const extra=isIntroStarter(before,world)?starterLevelMoves(before.speciesId).filter(([level])=>before.level<level&&level<=after.level).map(([,move])=>move):[];
 const next=applyNewMoves(legacy.mon,extra.filter(name=>!legacy.pending.some(move=>sameAdventureMove(move,name))));
 return {mon:next.mon,learned:[...legacy.learned,...next.learned],pending:[...legacy.pending,...next.pending]};
}
// Keep the Z-A introduction's verified moves available for that same starter.
// Older saves without a box ID use the original starter species (or the active
// starter during the introduction); no save or shared Pokémon is rewritten.
export function adventureLearnableMoves(mon,world){
 if(hasZone7Family(mon))return zone7Levels(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move);
 if(hasZone6Family(mon))return [...zone6Levels(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===308?['불꽃펀치','냉동펀치','번개펀치']:[])];
 if(hasZone5Family(mon))return [...zone5Levels(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===70?['덤벼들기']:mon.speciesId===71?['오물폭탄']:mon.speciesId===544||mon.speciesId===545?['킬러스핀']:[])];
 if(hasZone4Family(mon))return [...zone4Levels(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===24?['깨물어부수기']:mon.speciesId===168?['칼춤']:[])];
 if(hasZone3Family(mon))return [...zone3Levels(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===668?['오버히트','파괴광선']:mon.speciesId===673?['제비반환']:mon.speciesId===675?['깜짝베기']:[])];
 if(hasZone2Family(mon))return [...zone2Levels(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===315?['독침']:mon.speciesId===407?['킬러스핀','독침']:mon.speciesId===505?['이상한빛']:[])];
 if(hasEarlyFamily(mon))return [...earlyLevels(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===15?['바늘미사일']:mon.speciesId===181?['번개펀치','괴전파']:[])];
 if(hasVerifiedScatterbug(mon))return [...scatterbugLevels[mon.speciesId].filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===665?['방어']:mon.speciesId===666?['바람일으키기','단단해지기','방어','실뿜기','몸통박치기']:[])];
 if(hasVerifiedFletchling(mon))return [...fletchlingLevels.filter(([level])=>mon.level>=level).map(([,move])=>move),...([662,663].includes(mon.speciesId)?['날개치기']:[]),...(mon.speciesId===663?['브레이브버드']:[])];
 if(hasVerifiedBunnelby(mon))return [...bunnelbyLevels.filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===660?['땅고르기']:[])];
 if(hasVerifiedPichuFamily(mon))return [...pichuFamilyLevels.filter(([level])=>mon.level>=level).map(([,move])=>move),...(mon.speciesId===26?[mon.id===10100?'사이코키네시스':'번개펀치','드레인키스','괴전파']:mon.speciesId===25?['드레인키스']:[])];
 if(hasVerifiedKalos(mon))return [...kalosLevelMoves(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(kalosEvolutionMoves[mon.speciesId]||[]),...(kalosRememberMoves[mon.speciesId]||[])];
 if(hasVerifiedKanto(mon))return [...kantoLevelMoves(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(kantoEvolutionMoves[mon.speciesId]||[])];
 const isStarter=isIntroStarter(mon,world),verified=hasVerifiedFamily(mon);
 const result=(world?.zaIntroStarterMovesV2===true&&isStarter&&starterBase[mon.speciesId])||verified?[]:learnableMoves(mon,mon.level);
 if(!isStarter&&!verified)return result;
 const base=starterBase[mon.speciesId],element={152:'나뭇잎',158:'물대포',498:'불꽃세례'}[base];
 if(!element)return result;
 const moves=['몸통박치기',base===158?'째려보기':'꼬리흔들기',...(mon.level>=6?[element]:[]),...starterLevelMoves(mon.speciesId).filter(([level])=>mon.level>=level).map(([,move])=>move),...(introEvolutionMoves[mon.speciesId]||[])];
 for(const move of moves)if(!result.some(name=>sameAdventureMove(name,move)))result.push(move);
 return result;
}
// Only newly created Z-A introduction starters use this verified first level.
export function applyAdventureIntroStarterMoves(before,after,world){
 const move={152:'나뭇잎',158:'물대포',498:'불꽃세례'}[before.speciesId];
 if(!move||before.level>=6||after.level<6)return applyAdventureLevelMoves(before,after,world);
 const first=applyNewMoves(after,[move]);
 const later=applyAdventureLevelMoves({...before,level:6},first.mon,world);
 return {mon:later.mon,learned:[...first.learned,...later.learned],pending:[...first.pending,...later.pending.filter(name=>!first.pending.some(old=>sameAdventureMove(old,name)))]};
}
export function applyAdventureEvolutionMoves(mon,world){
 if(hasZone7Family(mon))return applyNewMoves(mon,[]);
 if(hasZone6Family(mon))return applyNewMoves(mon,[]);
 if(hasZone5Family(mon))return applyNewMoves(mon,mon.speciesId===71?['오물폭탄']:[]);
 if(hasZone4Family(mon))return applyNewMoves(mon,mon.speciesId===24?['깨물어부수기']:mon.speciesId===168?['칼춤']:[]);
 if(hasZone3Family(mon))return applyNewMoves(mon,mon.speciesId===668?['오버히트']:mon.speciesId===673?['제비반환']:mon.speciesId===675?['깜짝베기']:[]);
 if(hasZone2Family(mon))return applyNewMoves(mon,mon.speciesId===315?['독침']:mon.speciesId===505?['이상한빛']:[]);
 if(hasEarlyFamily(mon))return applyNewMoves(mon,mon.speciesId===14?['단단해지기']:mon.speciesId===15?['바늘미사일']:mon.speciesId===181?['번개펀치']:[]);
 if(hasVerifiedScatterbug(mon))return applyNewMoves(mon,mon.speciesId===665?['방어']:mon.speciesId===666?['바람일으키기']:[]);
 if(hasVerifiedFletchling(mon))return applyNewMoves(mon,mon.speciesId===662?['날개치기']:mon.speciesId===663?['브레이브버드']:[]);
 if(hasVerifiedBunnelby(mon))return applyNewMoves(mon,mon.speciesId===660?['땅고르기']:[]);
 if(hasVerifiedPichuFamily(mon))return applyNewMoves(mon,mon.speciesId===26?[mon.id===10100?'사이코키네시스':'번개펀치']:[]);
 if(hasVerifiedKalos(mon))return applyNewMoves(mon,kalosEvolutionMoves[mon.speciesId]||[]);
 if(hasVerifiedKanto(mon))return applyNewMoves(mon,kantoEvolutionMoves[mon.speciesId]||[]);
 if((isIntroStarter(mon,world)||hasVerifiedFamily(mon))&&introEvolutionMoves[mon.speciesId])return applyNewMoves(mon,[introEvolutionMoves[mon.speciesId].at(-1)]);
 const rows=learnsets[mon.id]||learnsets[mon.artId]||learnsets[mon.speciesId]||[];
 return applyNewMoves(mon,rows.filter(row=>row.level===0).map(row=>moveNameByKey[row.id.replaceAll('-','')]).filter(Boolean));
}
