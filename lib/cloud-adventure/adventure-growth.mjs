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
// Only verified base-form families, and only newly caught individuals.
function verifiedFamily(mon){return !!starterBase[mon?.speciesId]&&mon.id===mon.speciesId&&(mon.formId==null||mon.formId===mon.speciesId);}
export function markAdventureVerifiedGrowth(mon){if(!mon)return mon;if(verifiedBunnelbyFamily(mon))return Object.hasOwn(mon,'adventureBunnelbyMovesV1')?mon:{...mon,adventureBunnelbyMovesV1:true};if(verifiedPichuFamily(mon))return Object.hasOwn(mon,'adventurePichuMovesV1')?mon:{...mon,adventurePichuMovesV1:true};if(verifiedKalosFamily(mon))return Object.hasOwn(mon,'adventureKalosMovesV1')?mon:{...mon,adventureKalosMovesV1:true};if(verifiedKantoFamily(mon))return Object.hasOwn(mon,'adventureKantoMovesV1')?mon:{...mon,adventureKantoMovesV1:true};if(!verifiedFamily(mon)||Object.hasOwn(mon,'adventureVerifiedFamilyMovesV1'))return mon;return {...mon,adventureVerifiedFamilyMovesV1:true};}
function hasVerifiedFamily(mon){return mon?.adventureVerifiedFamilyMovesV1===true&&verifiedFamily(mon);}
// Wild moves are provisional: use the engine's usual latest-four convention.
// Only new ordinary base-stage encounters are changed, never saved battles or alphas.
export function prepareVerifiedWildMoves(mon){
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
 if(hasVerifiedBunnelby(mon))return applyNewMoves(mon,mon.speciesId===660?['땅고르기']:[]);
 if(hasVerifiedPichuFamily(mon))return applyNewMoves(mon,mon.speciesId===26?[mon.id===10100?'사이코키네시스':'번개펀치']:[]);
 if(hasVerifiedKalos(mon))return applyNewMoves(mon,kalosEvolutionMoves[mon.speciesId]||[]);
 if(hasVerifiedKanto(mon))return applyNewMoves(mon,kantoEvolutionMoves[mon.speciesId]||[]);
 if((isIntroStarter(mon,world)||hasVerifiedFamily(mon))&&introEvolutionMoves[mon.speciesId])return applyNewMoves(mon,[introEvolutionMoves[mon.speciesId].at(-1)]);
 const rows=learnsets[mon.id]||learnsets[mon.artId]||learnsets[mon.speciesId]||[];
 return applyNewMoves(mon,rows.filter(row=>row.level===0).map(row=>moveNameByKey[row.id.replaceAll('-','')]).filter(Boolean));
}
