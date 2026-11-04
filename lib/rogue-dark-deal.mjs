// Dark Deal normal-mode subset, based on PokéRogue beta 7c088125.
import {classicRandom} from './rogue-classic-state.mjs';
import {classicDarkDealBoss} from './rogue-classic-world.mjs';
import {rogueSpecies,rogueReferenceData} from './rogue-reference.mjs';
import {configure} from './pokemon-config.mjs';

const excludedNames=['ETERNATUS','NIHILEGO','BUZZWOLE','PHEROMOSA','XURKITREE','CELESTEELA','KARTANA','GUZZLORD','POIPOLE','NAGANADEL','STAKATAKA','BLACEPHALON','COSMOG','COSMOEM','SOLGALEO','LUNALA','NECROZMA','GREAT_TUSK','SCREAM_TAIL','BRUTE_BONNET','FLUTTER_MANE','SLITHER_WING','SANDY_SHOCKS','ROARING_MOON','WALKING_WAKE','GOUGING_FIRE','RAGING_BOLT','KORAIDON','IRON_TREADS','IRON_BUNDLE','IRON_HANDS','IRON_JUGULIS','IRON_MOTH','IRON_THORNS','IRON_VALIANT','IRON_LEAVES','IRON_BOULDER','IRON_CROWN','MIRAIDON','MEW','CELEBI','JIRACHI','DEOXYS','PHIONE','MANAPHY','DARKRAI','SHAYMIN','ARCEUS','VICTINI','KELDEO','MELOETTA','GENESECT','DIANCIE','HOOPA','VOLCANION','MAGEARNA','MARSHADOW','ZERAORA','MELTAN','MELMETAL','ZARUDE','PECHARUNT','ETERNAL_FLOETTE','BLOODMOON_URSALUNA','BATTLE_BOND_GRENINJA'];
const excluded=new Set(excludedNames.map(name=>rogueReferenceData.enums.SpeciesId[name]).filter(Number.isInteger));
const pool=[...rogueSpecies.values()].filter(s=>s.isStarter&&Number.isFinite(s.starterCost)&&s.abilities.length>0&&!excluded.has(s.sourceId));
const roll=(run,n)=>Math.floor(classicRandom(run)*n);
export function classicDarkDealEligible(run){const party=run.party||[],ids=new Set(party.map(p=>String(p.boxId))),held=(run.modifiers||[]).filter(m=>m.boxId!=null&&ids.has(String(m.boxId)));return party.length>=2&&party.some(p=>p.hp>0)&&party.every(p=>!p.item&&!p.mega&&!p.primal&&!p.ultra&&!p.gigantamax&&!p.dynamaxed&&!p.fusionSpecies&&!p.fusionId&&!p.fusionShiny&&!run.formItems?.[p.boxId]?.length)&&held.every(m=>Number.isSafeInteger(m.count)&&m.count>=0&&m.count<=1000&&(m.id!=='basestatbooster'||['hp','atk','def','spa','spd','spe'].includes(m.stat))&&(m.id!=='shucklejuice'||Number.isSafeInteger(m.statDelta)));}
export function classicDarkDealEncounterEligible(run){return classicDarkDealEligible(run)&&run.party.filter(p=>p.hp>0).length>=2;}
export function classicDarkDealTier(rollValue){if(!Number.isInteger(rollValue)||rollValue<0||rollValue>99)throw Error('전설 후보 등급을 확인하세요.');return rollValue>=65?[6,6]:rollValue>=15?[7,7]:rollValue>=5?[8,8]:[9,10];}
export function classicDarkDealPrepare(run){
 if(!classicDarkDealEligible(run))throw Error('교환할 파티 상태를 확인하세요.');const living=run.party.filter(p=>p.hp>0),candidates=living.length===1?run.party.filter(p=>p.hp<=0):living;if(!candidates.length)throw Error('교환할 파티원이 없습니다.');
 const removed=candidates[roll(run,candidates.length)],types=removed.currentTypes?.length?removed.currentTypes:removed.rogueTypes||removed.types||[];if(!types.length)throw Error('교환 포켓몬의 타입을 확인하세요.');
 let [min,max]=classicDarkDealTier(roll(run,100));const typed=pool.filter(s=>s.types.some(t=>types.includes(t)));let matches=typed.filter(s=>s.starterCost>=min&&s.starterCost<=max);
 while(!matches.length&&!(min===0&&max===10)){if(min>0)min--;else max++;matches=typed.filter(s=>s.starterCost>=min&&s.starterCost<=max);}
 const source=matches.length?matches[roll(run,matches.length)]:rogueSpecies.get(1);if(!source)throw Error('상대 후보를 찾지 못했습니다.');
 const boss=classicDarkDealBoss(run,source.sourceId),held=(run.modifiers||[]).filter(m=>String(m.boxId)===String(removed.boxId)&&m.count>0).map(m=>structuredClone(m)),boosts={},juice=[];let dew=0;
 for(const item of held){if(item.id==='basestatbooster')boosts[item.stat]=(boosts[item.stat]||0)+item.count;if(item.id==='shucklejuice')for(let i=0;i<item.count;i++)juice.push(item.statDelta);if(item.id==='souldew')dew+=item.count;}
 boss.rogueFixedModifiers=held;if(Object.keys(boosts).length)boss.rogueBaseBoosts=boosts;if(juice.length)boss.rogueJuiceMods=juice;if(dew)boss.rogueNatureDewCount=dew;Object.assign(boss,configure(boss));return {removedBoxId:removed.boxId,removedName:removed.name,boss};
}
export function classicDarkDealCommit(run){
 if(run.screen!=='mystery'||run.mystery?.type!=='dark-deal'||run.mystery.stage!=='confirm'||run.mystery.selection?.job!=='deal')throw Error('수상한 거래 단계를 확인하세요.');
 const balls=run.balls?.rogueball??0;if(!Number.isSafeInteger(balls)||balls<0)throw Error('로그볼 보유량을 확인하세요.');
 const prepared=classicDarkDealPrepare(run),id=String(prepared.removedBoxId);run.balls||={};
 run.party=run.party.filter(p=>String(p.boxId)!==id);run.modifiers=(run.modifiers||[]).filter(m=>String(m.boxId)!==id);run.pendingMoves=(run.pendingMoves||[]).filter(m=>String(m.boxId)!==id);run.pendingGrowth=(run.pendingGrowth||[]).filter(m=>String(m.boxId)!==id);run.balls.rogueball=balls>=99?balls:Math.min(99,balls+5);
 run.mystery.removedName=prepared.removedName;run.mystery.boss=prepared.boss;run.mystery.stage='battle';run.mystery.selection=null;return prepared;
}
