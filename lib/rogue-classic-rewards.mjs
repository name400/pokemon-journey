import {Dex,toID} from '@pkmn/sim';
import {classicBaseStatEligible,addClassicBaseStat} from './rogue-base-stat.mjs';
import tmReference from '../data/rogue-trainer-tms.json' with {type:'json'};
import {moves} from './game.mjs';
import {moveDetails} from './move-description.mjs';
import {rules,configure} from './pokemon-config.mjs';
import {sourceSpeciesFor,sourceMove} from './rogue-reference.mjs';
import {classicLuck,classicRewardTier,classicRerollCost,classicWaveMoney,classicMoneyGain} from './rogue-classic-rules.mjs';
import {classicRandom,spendClassicMoney} from './rogue-classic-state.mjs';
import {CLASSIC_SERVICE_TYPES,classicMaxPP,classicRemainingPP,classicServices,restoreClassicParty} from './rogue-classic-services.mjs';
import {classicExpToNext,gainClassicExperience,addClassicFriendship,recordClassicLevelGrowth} from './rogue-classic-growth.mjs';
import {classicTransformationItems} from './rogue-transformations.mjs';
import {grantClassicVoucher} from './rogue-egg-shop.mjs';
import {classicEvolutionItemCandidates} from './rogue-evolution.mjs';

const img=slug=>'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+slug+'.png';
const count=(run,id,boxId)=>run.modifiers.filter(m=>m.id===id&&(!boxId||m.boxId===boxId)).reduce((a,b)=>a+b.count,0);
const pick=(list,run)=>list[Math.floor(classicRandom(run)*list.length)];
const typeBoosterItems={Normal:['실크스카프','silk-scarf'],Fighting:['검은띠','black-belt'],Flying:['예리한부리','sharp-beak'],Poison:['독바늘','poison-barb'],Ground:['부드러운모래','soft-sand'],Rock:['딱딱한돌','hard-stone'],Bug:['은빛가루','silver-powder'],Ghost:['주술부적','spell-tag'],Steel:['금속코트','metal-coat'],Fire:['목탄','charcoal'],Water:['신비의물방울','mystic-water'],Grass:['기적의씨','miracle-seed'],Electric:['자석','magnet'],Psychic:['휘어진스푼','twisted-spoon'],Ice:['녹지않는얼음','never-melt-ice'],Dragon:['용의이빨','dragon-fang'],Dark:['검은안경','black-glasses'],Fairy:['요정의깃털','fairy-feather']};
const boosterTypeNames={Normal:'노말',Fighting:'격투',Flying:'비행',Poison:'독',Ground:'땅',Rock:'바위',Bug:'벌레',Ghost:'고스트',Steel:'강철',Fire:'불꽃',Water:'물',Grass:'풀',Electric:'전기',Psychic:'에스퍼',Ice:'얼음',Dragon:'드래곤',Dark:'악',Fairy:'페어리'};
function boosterMoveTypes(mon,move,run){const source=sourceSpeciesFor(mon),id=source?.sourceId,form=Number(mon.rogueFormIndex)||0,toType=value=>Object.keys(boosterTypeNames).find(key=>key.toLowerCase()===String(value||'').toLowerCase()||boosterTypeNames[key]===value);if(move.id==='hiddenpower'&&mon.ivs){const values=['hp','atk','def','spe','spa','spd'].map(key=>mon.ivs[key]);if(values.every(Number.isInteger)){const bits=values.reduce((sum,value,index)=>sum+(value&1)*(2**index),0);return [['Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel','Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark'][Math.floor(bits*15/63)]];}}if(move.id==='revelationdance'){const ownForm=source?.formList?.find(entry=>entry.formIndex===form);return [toType(ownForm?.types?.[0]||mon.types?.[0])||move.type];}if(move.id==='terablast'&&run.tools?.teraOrb&&!mon.mega&&!mon.gigantamax&&!mon.dynamaxed&&!mon.ultra){const tera=toType(mon.teraType||mon.types?.[0]);return tera&&tera!==move.type?[move.type,tera]:[move.type];}if(move.id==='aurawheel'&&id===877)return ['Dark','Electric'];if(move.id==='technoblast'&&id===649)return [({1:'Electric',2:'Fire',3:'Ice',4:'Water'})[form]||'Normal'];if(move.id==='ragingbull'&&id===8128)return [({1:'Fire',2:'Water'})[form]||'Fighting'];if(move.id==='ivycudgel'&&id===1017)return [({1:'Water',5:'Water',2:'Fire',6:'Fire',3:'Rock',7:'Rock'})[form]||'Grass'];if((move.id==='judgment'&&id===493)||(move.id==='multiattack'&&id===773)){const ownForm=source.formList.find(entry=>entry.formIndex===form),label=ownForm?.types?.[0],type=Object.keys(boosterTypeNames).find(key=>boosterTypeNames[key]===label);return [type||move.type];}const variable=new Set(['weatherball','judgment','revelationdance','multiattack','terrainpulse','naturalgift','technoblast','hiddenpower','aurawheel','ragingbull','ivycudgel','terablast','terastarstorm']);if(variable.has(move.id))return [move.type];let type=move.type;const normalTo={refrigerate:'Ice',pixilate:'Fairy',aerilate:'Flying',galvanize:'Electric',dragonize:'Dragon'};for(const ability of [mon.ability,mon.roguePassiveAbility].map(value=>toID(value||''))){if(ability==='normalize')type='Normal';else if(move.type==='Normal'&&normalTo[ability])type=normalTo[ability];else if(ability==='liquidvoice'&&move.flags?.sound)type='Water';}return [type];}
export function boosterTypePool(run){const weights=new Map();for(const mon of run.party||[])for(const name of mon.moves||[]){const move=Dex.moves.get(moves[name]?.key||name);if(!move.exists||move.category==='Status')continue;for(const type of boosterMoveTypes(mon,move,run)){if(!typeBoosterItems[type])continue;weights.set(type,Math.min(3,(weights.get(type)||0)+1));}}return [...weights].flatMap(([type,weight])=>Array(weight).fill(type)).filter(type=>run.party.some(mon=>run.modifiers.filter(m=>m.id==='typebooster'&&m.boxId===mon.boxId&&m.typeBoost===type).reduce((sum,m)=>sum+m.count,0)<99));}
// Never replace an existing held item when selecting a Z Crystal.
const zCrystals={Normal:'normaliumz',Fire:'firiumz',Water:'wateriumz',Electric:'electriumz',Grass:'grassiumz',Ice:'iciumz',Fighting:'fightiniumz',Poison:'poisoniumz',Ground:'groundiumz',Flying:'flyiniumz',Psychic:'psychiumz',Bug:'buginiumz',Rock:'rockiumz',Ghost:'ghostiumz',Dragon:'dragoniumz',Dark:'darkiniumz',Steel:'steeliumz',Fairy:'fairiumz'};
function zCrystalCandidates(run,{special=false}={}){
 if(!run.tools?.zRing)return [];
 return run.party.flatMap(mon=>{if(mon.item)return [];const known=mon.moves.map(name=>Dex.moves.get(moves[name]?.key||name)).filter(move=>move.exists);
  if(!special)return [...new Set(known.filter(move=>zCrystals[move.type]&&(move.category==='Status'||move.zMove?.basePower)).map(move=>zCrystals[move.type]))].map(item=>({boxId:mon.boxId,item}));
  const species=Dex.species.get(mon.rogueBattleSpecies||rules.species[mon.id]?.key);return Dex.items.all().filter(item=>item.zMoveFrom&&item.itemUser?.includes(species.name)&&known.some(move=>move.name===item.zMoveFrom)).map(item=>({boxId:mon.boxId,item:item.id}));});
}
const definitions=[];
function add(id,name,tier,weight,effect,extra={}){definitions.push({id,name,tier,weight,effect,image:img(extra.sprite||id),description:extra.description||name,...extra});}
for(const [id,name,tier,quantity,weight,sprite]of [['pokeball','몬스터볼',0,5,6,'poke-ball'],['greatball','슈퍼볼',1,5,6,'great-ball'],['ultraball','하이퍼볼',2,5,15,'ultra-ball'],['rogueball','로그볼',3,5,16,'dream-ball'],['masterball','마스터볼',4,1,24,'master-ball']])add(id,name,tier,weight,'balls',{quantity,sprite,description:`${name} ${quantity}개를 이번 도전의 가방에 추가합니다.`,max:99});
for(const [id,name,tier,voucherType,weight] of [['voucher','알 교환권',1,'regular',1],['voucherplus','알 교환권 플러스',3,'plus',3],['voucherpremium','알 교환권 프리미엄',4,'premium',5]])add(id,name,tier,weight,'voucher',{voucherType,image:'/game/vouchers/'+voucherType+'.svg',description:'알 뽑기 교환권을 영구 보관함에 추가합니다.'});
add('healingcharm','회복부적',4,18,'modifier',{max:5,image:'/game/items/healing-charm.svg',description:'전투 중 HP 회복과 회복 도구의 고정 회복량이 중첩당 10% 증가합니다. 부활에는 적용되지 않습니다.'});
for(const [id,name,tier,weight,duration,sprite] of [['lure','루어',0,2,10,'lure'],['superlure','슈퍼루어',1,4,15,'super-lure'],['maxlure','맥스루어',2,4,30,'max-lure']])add(id,name,tier,weight,'lure',{duration,sprite,description:'앞으로 '+duration+'번의 전투 동안 야생 더블배틀 확률이 증가합니다.'});
add('typebooster','타입 강화 도구',2,9,'modifier',{max:99,target:true,sprite:'silk-scarf',description:'선택한 타입의 기술 위력을 20% 높입니다.'});
add('rarecandy','이상한사탕',0,2,'candy',{sprite:'rare-candy',target:true,description:'선택한 포켓몬의 레벨을 1 올립니다. 진화는 직접 선택합니다.'});
for(const service of CLASSIC_SERVICE_TYPES)add(service.id,service.name,['potion','superpotion','ether','maxether'].includes(service.id)?0:1,1,'service',{...service,target:service.requiresTarget!==false});
for(const [id,name,tier,weight,max,sprite,description]of [
 ['amuletcoin','부적금화',2,3,5,'amulet-coin','트레이너 상금과 금화 보상에 중첩당 20%를 더합니다. 최대 5개.'],
 ['shinycharm','빛나는부적',4,14,4,'shiny-charm','야생 색이 다른 포켓몬의 출현 확률이 올라갑니다. 최대 4개.'],
 ['expshare','학습장치',2,10,5,'exp-share','참가하지 않은 포켓몬도 경험치를 얻습니다. 중첩당 참가자 몫의 20%.'],
 ['expcharm','경험부적',2,8,99,'exp-charm','모든 포켓몬의 획득 경험치가 중첩당 25% 증가합니다.'],
 ['superexpcharm','슈퍼경험부적',3,8,30,'exp-charm','모든 포켓몬의 획득 경험치가 중첩당 60% 증가합니다.'],
 ['goldenexpcharm','황금경험부적',4,4,10,'exp-charm','모든 포켓몬의 획득 경험치가 중첩당 100% 증가합니다.'],
 ['expparticipant','경험의챰',2,4,5,'exp-share','둘 이상 참가하면 참가자마다 경험치 배율을 중첩당 20% 더합니다.'],
 ['expbalance','경험치분배기',2,2,4,'exp-share','경험치의 20%를 평균 레벨 이하의 파티원에게 재분배합니다.'],
 ['luckyegg','행복의알',3,4,99,'lucky-egg','이 포켓몬의 획득 경험치가 중첩당 40% 증가합니다.'],
 ['goldenegg','황금알',4,2,99,'lucky-egg','이 포켓몬의 획득 경험치가 중첩당 100% 증가합니다.'],
 ['leftovers','먹다남은음식',3,3,4,'leftovers','매 턴 최대 HP의 1/16을 회복합니다. 최대 4개 중첩.'],
 ['soothebell','평온의방울',1,2,3,'soothe-bell','이 포켓몬의 친밀도 획득량이 중첩당 50% 증가합니다.'],
])add(id,name,tier,weight,'modifier',{max,sprite,description,target:['luckyegg','goldenegg','leftovers','soothebell'].includes(id)});
// Three supported berry variants preserve their individual source weight (2 × 1/6).
for(const [id,name,sprite,description] of [
 ['berrysitrus','자뭉열매','sitrus-berry','턴 종료 시 HP가 절반 미만이면 최대 HP의 1/4을 회복합니다.'],
 ['berrylum','리샘열매','lum-berry','턴 종료 시 상태 이상과 혼란을 회복합니다.'],
 ['berryleppa','과사열매','leppa-berry','턴 종료 시 PP가 없는 기술 하나의 PP를 10 회복합니다.'],
])add(id,name,0,1/3,'modifier',{max:2,target:true,sprite,description});
// Remaining source berry types each have common-pool weight 2 × (1/2 × 1/8).
for(const [id,name,sprite,max] of [
 ['berryenigma','의문열매','enigma-berry',2],['berryliechi','치리열매','liechi-berry',3],['berryganlon','용아열매','ganlon-berry',3],['berrypetaya','야타비열매','petaya-berry',3],['berryapicot','규살열매','apicot-berry',3],['berrysalac','캄라열매','salac-berry',3],['berrylansat','랑사열매','lansat-berry',3],['berrystarf','스타열매','starf-berry',3],
])add(id,name,0,1/8,'modifier',{max,target:true,sprite,description:'전투 중 조건을 만족하면 이 열매를 사용합니다.'});
for(const [id,name,sprite] of [['xattack','플러스파워','x-attack'],['xdefense','디펜드업','x-defense'],['xspatk','스페셜업','x-sp-atk'],['xspdef','스페셜가드','x-sp-def'],['xspeed','스피드업','x-speed'],['xaccuracy','명중률업','x-accuracy'],['direhit','크리티컬커터','dire-hit']])add(id,name,0,0,'xitem',{sprite,duration:5,description:'앞으로 5번의 전투 동안 파티 전체의 능력을 높입니다.'});
add('basestatbooster','기초 능력 강화',0,0,'modifier',{max:31,target:true,image:'/game/items/item-fallback.svg',description:'이 포켓몬의 기초 능력치를 올립니다.'});
add('berrypouch','열매주머니',3,4,'modifier',{max:3,image:'/game/items/item-fallback.svg',description:'열매를 사용할 때 중첩당 30% 확률로 소모하지 않습니다.'});
add('reviverseed','부활의씨앗',2,4,'modifier',{max:1,target:true,image:'/game/items/item-fallback.svg',description:'쓰러질 때 한 번 최대 HP의 절반을 회복하고 전투를 계속합니다.'});
add('quickclaw','선제공격손톱',2,3,'modifier',{max:3,target:true,sprite:'quick-claw',description:'기술 우선도가 같을 때 중첩당 10% 확률로 먼저 행동합니다. 최대 3개.'});
add('kingsrock','왕의징표석',3,3,'modifier',{max:3,target:true,sprite:'kings-rock',description:'풀죽음 효과가 없는 공격 명중 시 중첩당 10% 확률로 상대를 풀죽게 합니다. 최대 3개.'});
add('focusband','기합의머리띠',3,5,'modifier',{max:5,target:true,sprite:'focus-band',description:'기절할 피해를 받을 때 중첩당 10% 확률로 HP 1을 남깁니다. 최대 5개.'});
// Available through source-generated opposing Pokémon; not added to old reward pools.
add('scopelens','초점렌즈',3,0,'modifier',{max:1,target:true,sprite:'scope-lens',description:'급소율을 한 단계 높입니다.'});
add('gripclaw','집게손톱',3,0,'modifier',{max:5,target:true,sprite:'grip-claw',description:'공격 명중 시 중첩당 10% 확률로 상대 도구를 하나 빼앗습니다.'});
add('widelens','광각렌즈',3,0,'modifier',{max:3,target:true,sprite:'wide-lens',description:'필중과 일격기를 제외한 기술의 명중률을 중첩당 5%p 높입니다.'});
add('shellbell','조개껍질방울',3,0,'modifier',{max:4,target:true,sprite:'shell-bell',description:'공격으로 준 피해의 1/8을 중첩당 회복합니다.'});
add('mysticalrock','신비한바위',3,0,'modifier',{max:2,target:true,sprite:'smooth-rock',description:'이 포켓몬이 만든 날씨와 필드의 지속시간을 중첩당 2턴 늘립니다.'});
for(const [id,name,tier,tool,sprite]of [['megabracelet','메가팔찌',3,'megaBracelet','mega-bracelet'],['dynamaxband','다이맥스밴드',3,'dynamaxBand','dynamax-band'],['zring','Z링',3,'zRing','z-ring'],['teraorb','테라스탈오브',2,'teraOrb','tera-orb'],['map','지도',1,'map','town-map']])add(id,name,tier,id==='map'?2:9,'tool',{tool,sprite,description:id==='map'?'구간 종료 시 다음 바이옴을 직접 선택합니다.':id==='dynamaxband'?'전투마다 한 번 3턴 동안 다이맥스를 사용할 수 있습니다.':'이번 도전에서 '+name+'의 변신 기능을 해금합니다.'});
add('zcrystal','Z크리스탈',2,6,'zcrystal',{target:true,sprite:'normalium-z',description:'도구를 지니지 않은 포켓몬에게 맞는 타입의 Z크리스탈을 줍니다.'});
add('specialzcrystal','전용 Z크리스탈',3,4,'zcrystal',{target:true,special:true,sprite:'pikanium-z',description:'전용 기술을 아는 포켓몬에게 맞는 Z크리스탈을 줍니다.'});
for(const [id,name,tier,multiplier,weight,sprite]of [['nugget','금구슬',1,1,5,'nugget'],['bignugget','큰금구슬',2,2.5,12,'big-nugget'],['relicgold','고대금화',3,10,2,'relic-gold']])add(id,name,tier,weight,'money',{multiplier,sprite,description:'이번 도전의 소지금을 획득합니다.'});
for(const [id,name,tier,stages]of [['ppup','포인트업',1,1],['ppmax','포인트맥스',2,3]])add(id,name,tier,id==='ppup'?2:3,'ppup',{target:true,requiresMove:true,stages,sprite:id==='ppup'?'pp-up':'pp-max',description:'기술 하나의 최대 PP를 '+(stages===3?'최대로':'1단계')+' 늘립니다.'});
for(let tier=0;tier<3;tier++)add('tm'+tier,'기술머신',tier,[2,3,11][tier],'tm',{target:true,requiresReplace:true,sprite:'tm-normal',description:'이 포켓몬이 배울 수 있는 기술을 가르칩니다.'});
add('formitem','폼 변화 도구',2,6,'formitem',{target:true,sprite:'max-mushrooms',description:'필요한 장비를 가진 포켓몬에게 맞는 폼 변화 도구를 획득합니다.'});
add('rareformitem','희귀 폼 변화 도구',3,6,'formitem',{target:true,sprite:'charizardite-x',description:'메가·거다이맥스 등 파티에 맞는 변신 도구를 획득합니다.'});
add('evolutionitem','진화 도구',1,8,'evolutionitem',{target:true,sprite:'fire-stone',description:'파티에 필요한 진화 도구를 받습니다. 진화는 파티에서 직접 선택합니다.'});
add('rareevolutionitem','희귀 진화 도구',2,32,'evolutionitem',{target:true,sprite:'black-augurite',rare:true,description:'파티에 필요한 희귀 진화 도구를 받습니다. 진화는 파티에서 직접 선택합니다.'});
export const CLASSIC_REWARD_REGISTRY=Object.freeze(definitions);
export function classicModifierInventory(run){
 const modifiers=(run.modifiers||[]).filter(item=>item.count>0&&(!item.boxId||run.party.some(mon=>mon.boxId===item.boxId))).map(item=>{const definition=definitions.find(entry=>entry.id===item.id),typeItem=item.id==='typebooster'?typeBoosterItems[item.typeBoost]:null,owner=item.boxId?run.party.find(mon=>mon.boxId===item.boxId):null,name=typeItem?.[0]||definition?.name||({goldenpokeball:'황금 포켓볼',miniblackhole:'블랙홀'})[item.id]||'알 수 없는 도구',image=typeItem?img(typeItem[1]):definition?.image||null;return {key:['modifier',item.id,item.boxId||'',item.typeBoost||'',item.stat||''].join(':'),name:item.id==='basestatbooster'?name+' · '+({hp:'HP',atk:'공격',def:'방어',spa:'특공',spd:'특방',spe:'스피드'}[item.stat]||'능력치'):name,image,count:item.count,owner:owner?.name||null,remaining:Number.isInteger(item.remaining)?item.remaining:null};});
 const native=(run.party||[]).flatMap(mon=>{const item=Dex.items.get(mon.item||'');if(!item.exists)return [];return [{key:['native',item.id,mon.boxId].join(':'),name:rules.items[item.id]?.name||item.name,image:null,count:1,owner:mon.name,remaining:null}];});return [...modifiers,...native];
}
// Form-change items and simulator-specific take restrictions need separate handling.
function movableNativeItem(item){return !!item.exists&&(item.zMove?item.id!=='ultranecroziumz':!item.megaStone&&!item.forcedForme&&!item.onPlate&&!item.onDrive&&!item.onMemory&&item.onTakeItem===undefined);}
// Transfer only owned party-held effects. Validate every field before mutating.
export function classicTransferInventory(run, mon) {
 const held=(run.modifiers||[]).filter(m=>m.boxId===mon.boxId&&Number.isSafeInteger(m.count)&&m.count>0).flatMap(m=>{const def=definitions.find(d=>d.id===m.id);if(!def?.target||def.effect!=='modifier'||m.transferable===false)return [];return [{kind:'modifier',id:m.id,typeBoost:m.typeBoost||null,count:m.count,name:(m.id==='typebooster'?typeBoosterItems[m.typeBoost]?.[0]:null)||def.name}];});
 const item=Dex.items.get(mon.item||'');if(movableNativeItem(item))held.push({kind:'native',id:item.id,typeBoost:null,count:1,name:rules.items[item.id]?.name||item.name,crystal:true});return held;
}
export function transferClassicModifier(run,{fromBoxId,toBoxId,id,typeBoost=null,quantity=1,kind=null}) {
 if(!['reward','advance','interlude','route'].includes(run.screen))throw Error('전투와 선택을 마친 뒤 도구를 옮기세요.');
 if(typeof fromBoxId!=='string'||typeof toBoxId!=='string'||fromBoxId===toBoxId||typeof id!=='string'||!(typeBoost===null||typeof typeBoost==='string')||!Number.isSafeInteger(quantity)||quantity<1||![null,'native','modifier'].includes(kind))throw Error('옮길 도구와 대상을 확인하세요.');
 const from=run.party.find(p=>p.boxId===fromBoxId),to=run.party.find(p=>p.boxId===toBoxId);if(!from||!to)throw Error('파티 포켓몬을 확인하세요.');
 const item=Dex.items.get(id);if(kind!=='modifier'&&from.item===id&&movableNativeItem(item)) {const species=Dex.species.get(to.rogueBattleSpecies||rules.species[to.id]?.key);if(quantity!==1||typeBoost!==null||to.item||(item.zMove&&item.zMove!==true&&!item.itemUser?.includes(species.name)))throw Error('도구를 지니지 않은 호환 포켓몬을 선택하세요.');to.item=from.item;from.item='';run.log=[`${item.name}을(를) 옮겼다.`];return;}
 if(kind==='native')throw Error('옮길 수 있는 소지 도구가 아닙니다.');
 const source=run.modifiers.find(m=>m.id===id&&m.boxId===fromBoxId&&(m.typeBoost||null)===typeBoost),def=definitions.find(d=>d.id===id);
 if(!source||!Number.isSafeInteger(source.count)||source.transferable===false||!def?.target||def.effect!=='modifier'||quantity>source.count)throw Error('이 도구는 옮길 수 없거나 보유 수량이 부족합니다.');
 const destinations=run.modifiers.filter(m=>m.id===id&&m.boxId===toBoxId&&(m.typeBoost||null)===typeBoost),total=destinations.reduce((n,m)=>n+m.count,0);if(!Number.isSafeInteger(total)||total+quantity>(def.max??99))throw Error('받는 포켓몬의 도구 중첩 한도를 초과합니다.');
 source.count-=quantity;if(destinations.length)destinations[0].count+=quantity;else run.modifiers.push({...source,boxId:toBoxId,count:quantity});if(source.count===0)run.modifiers=run.modifiers.filter(m=>m!==source);run.log=[`${def.name} ${quantity}개를 옮겼다.`];
}
export function lapseClassicLures(run){for(const mod of run.modifiers||[])if(['lure','superlure','maxlure','xattack','xdefense','xspatk','xspdef','xspeed','xaccuracy','direhit'].includes(mod.id)&&Number.isInteger(mod.remaining))mod.remaining--;run.modifiers=(run.modifiers||[]).filter(mod=>!['lure','superlure','maxlure','xattack','xdefense','xspatk','xspdef','xspeed','xaccuracy','direhit'].includes(mod.id)||!Number.isInteger(mod.remaining)||mod.remaining>0);}
export function addClassicModifier(run,id,{boxId=null,count:amount=1,typeBoost=null,max=null}={}){
 const def=definitions.find(d=>d.id===id),limit=max??def?.max??99,existing=run.modifiers.find(m=>m.id===id&&m.boxId===boxId&&m.typeBoost===typeBoost);
 if((existing?.count||0)+amount>limit)throw Error('이 도구의 중첩 한도에 도달했습니다.');
 if(existing)existing.count+=amount;else run.modifiers.push({id,boxId,typeBoost,count:amount});
}
function allowedTMs(mon,tier){const record=sourceSpeciesFor(mon),form=record?.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0)),ids=[...(record?.tms||[]),...(record?.formTms?.[form?.formKey||'']||[])],levelMoves=[...(record?.levelMoves||[]),...(record?.formLevelMoves?.[form?.formKey||'']||[])].filter(([level])=>level<=mon.level).map(([,id])=>sourceMove(id)),excluded=new Set([...mon.moves,...(mon.rogueUsedTMs||[]),...levelMoves]),tierName=['COMMON','GREAT','ULTRA'][tier];return [...new Set(ids.filter(id=>tmReference.tiers[id]===tierName).map(sourceMove).filter(Boolean))].filter(name=>!excluded.has(name)&&Dex.moves.get(moves[name]?.key||name).exists);}
function target(mon,def,run){
 let eligible=true,reason='';if(def.effect==='candy')eligible=mon.hp>0&&mon.level<100;
 if(def.effect==='modifier')eligible=def.id==='basestatbooster'&&def.stat?classicBaseStatEligible(run,mon,def.stat):(def.id==='typebooster'&&def.typeBoost?run.modifiers.filter(m=>m.id===def.id&&m.boxId===mon.boxId&&m.typeBoost===def.typeBoost).reduce((sum,m)=>sum+m.count,0):count(run,def.id,mon.boxId))<def.max;
 if(def.effect==='zcrystal')eligible=zCrystalCandidates(run,{special:!!def.special}).some(candidate=>candidate.boxId===mon.boxId&&(!def.crystal||def.crystal===candidate.item));
 if(def.effect==='formitem')eligible=classicTransformationItems(mon,run).length>0;
 if(def.effect==='evolutionitem')eligible=classicEvolutionItemCandidates(run,{}, {rare:!!def.rare}).some(e=>e.boxId===mon.boxId);
 if(def.effect==='tm')eligible=allowedTMs(mon,def.tier).length>0;
 if(def.effect==='ppup')eligible=mon.moves.some((name,i)=>(mon.roguePPUps?.[Dex.moves.get(moves[name]?.key||name).id]||0)<3&&!Dex.moves.get(moves[name]?.key||name).noPPBoosts);
 if(!eligible)reason='효과를 적용할 수 없습니다.';
 return {boxId:mon.boxId,name:mon.name,hp:mon.hp,maxHp:mon.maxHp,eligible,reason,moves:mon.moves.map((name,index)=>name?{index,name,pp:classicRemainingPP(mon,index),maxPp:classicMaxPP(mon,index),canBoostPP:!Dex.moves.get(moves[name]?.key||name).noPPBoosts&&(mon.roguePPUps?.[Dex.moves.get(moves[name]?.key||name).id]||0)<3}:null).filter(Boolean)};
}
function weight(def,run){
 if(def.id==='amuletcoin'&&(run.economyRule!=='source-v1'||run.wave>=199))return 0;
 if(['berryenigma','berryliechi','berryganlon','berrypetaya','berryapicot','berrysalac','berrylansat','berrystarf','berrypouch'].includes(def.id)&&run.berryFullRule!=='source-v1')return 0;
 if(['berrysitrus','berrylum','berryleppa'].includes(def.id)&&run.berryCoreRule!=='source-v1')return 0;
 if(def.id==='reviverseed'&&run.reviverSeedRule!=='source-v1')return 0;
 if(def.id==='focusband'&&run.focusBandRule!=='source-v1')return 0;
 if(def.id==='kingsrock'&&run.kingsRockRule!=='source-v1')return 0;
 if(def.id==='quickclaw'&&run.quickClawRule!=='source-v1')return 0;
 if(def.id==='typebooster')return boosterTypePool(run).length?def.weight:0;
 if(def.effect==='zcrystal')return zCrystalCandidates(run,{special:!!def.special}).length?def.weight:0;
 if(def.effect==='lure'){const existing=run.modifiers.find(m=>m.id===def.id);return run.wave===199||existing&&existing.remaining>=def.duration*.6?0:def.weight;}
 if(def.effect==='voucher')return Math.max(0,def.weight-(run.rerolls||0)*(def.voucherType==='premium'?2:1));
 if(def.effect==='tool')return run.tools[def.tool]?0:def.weight*(def.id==='map'?Number(run.wave<180):Math.min(4,Math.ceil(run.wave/50)));
 if(def.effect==='balls')return (run.balls[def.id]||0)>=99?0:def.weight;
 if(def.effect==='service'){
  const service=classicServices({...run,wave:199}).find(s=>s.id===def.id);if(!service||service.disabledReason)return 0;
  const party=run.party,cap=n=>Math.min(3,n),heal=(missing,ratio)=>cap(party.filter(p=>p.hp>0&&p.maxHp-p.hp>=missing&&p.hp/p.maxHp<=ratio).length);
  return ({potion:heal(10,.875)*3,superpotion:heal(25,.75),hyperpotion:heal(100,.625)*3,maxpotion:heal(100,.5),fullheal:cap(party.filter(p=>p.hp>0&&p.status).length)*6,revive:cap(party.filter(p=>p.hp<=0).length)*9,maxrevive:cap(party.filter(p=>p.hp<=0).length)*3,sacredash:party.filter(p=>p.hp<=0).length>=Math.ceil(party.length/2)?1:0})[def.id]??1;
 }
 if(def.target)return run.party.some(p=>target(p,def,run).eligible)?def.weight:0;
 if(def.effect==='modifier')return count(run,def.id)>=def.max?0:def.weight;
 return def.weight;
}
function generateOne(run,tier){
 let pool=definitions.filter(d=>d.tier===tier).map(d=>({d,weight:weight(d,run)})).filter(p=>p.weight>0);
 while(!pool.length&&tier>0){tier--;pool=definitions.filter(d=>d.tier===tier).map(d=>({d,weight:weight(d,run)})).filter(p=>p.weight>0);}
 if(!pool.length)throw Error('선택 가능한 보상을 만들지 못했습니다.');
 let roll=classicRandom(run)*pool.reduce((n,p)=>n+p.weight,0),def=pool.at(-1).d;for(const p of pool){roll-=p.weight;if(roll<0){def=p.d;break;}}
 return makeReward(run,def);
}
function makeReward(run,def){
 const tier=def.tier,reward={...def,rewardId:crypto.randomUUID()};
 if(def.id==='typebooster'){const type=pick(boosterTypePool(run),run),[name,sprite]=typeBoosterItems[type];Object.assign(reward,{typeBoost:type,name,image:img(sprite),description:name+'을(를) 지닌 포켓몬의 '+(boosterTypeNames[type]||type)+' 타입 기술 위력이 중첩당 20% 증가합니다.'});}
 if(def.effect==='tm'){
  const candidates=[...new Set(run.party.flatMap(p=>allowedTMs(p,tier)))],name=pick(candidates,run),move=Dex.moves.get(moves[name]?.key||name);reward.moveName=name;reward.name='기술머신 · '+name;reward.description='배울 수 있는 포켓몬에게 '+name+'을(를) 가르칩니다.';reward.moveDescription=moveDetails(move).description;reward.movePower=move.basePower;reward.moveCategory=move.category;reward.moveAccuracy=move.accuracy;reward.moveType=moves[name]?.type||move.type;
 }
 if(def.effect==='zcrystal'){const selected=pick(zCrystalCandidates(run,{special:!!def.special}),run),item=Dex.items.get(selected.item),name=rules.items[item.id]?.name||item.name;Object.assign(reward,{crystal:item.id,boxId:selected.boxId,name,image:img(item.name.toLowerCase().replace(/\s+/g,'-')),description:'도구를 지니지 않은 포켓몬에게 Z크리스탈을 줍니다.'});}
 if(def.effect==='formitem'){const options=run.party.flatMap(p=>classicTransformationItems(p,run).map(o=>({...o,boxId:p.boxId}))),selected=pick(options,run);Object.assign(reward,{formItem:selected.key,boxId:selected.boxId,name:selected.name,description:'이 도전에서 사용할 폼 변화 도구를 획득합니다.'});}
 if(def.effect==='evolutionitem'){const selected=pick(classicEvolutionItemCandidates(run,{}, {rare:!!def.rare}),run);Object.assign(reward,{evolutionItem:selected.item,boxId:selected.boxId,name:selected.name,description:selected.pokemonName+'에게 사용할 진화 도구입니다. 파티 메뉴에서 직접 진화하세요.'});}
 return reward;
}
// A single preselected Fight or Flight reward, excluding TMs and Candy Jar.
export function drawClassicFightReward(run){
 const tier=run.wave>160?4:run.wave>120?3:run.wave>40?2:1;
 let pool=definitions.filter(d=>d.tier===tier&&d.effect!=='tm'&&d.id!=='candyjar').map(d=>({d,weight:weight(d,run)})).filter(x=>x.weight>0);
 if(!pool.length)return null;let roll=classicRandom(run)*pool.reduce((n,x)=>n+x.weight,0),def=pool.at(-1).d;for(const item of pool){roll-=item.weight;if(roll<0){def=item.d;break;}}return makeReward(run,def);
}
// Five berry offers for Berries Abound; omit offers no party member can hold.
export function generateClassicMysteryBerryRewards(run){
 const common=['berrysitrus','berrylum','berryleppa'],rare=['berryenigma','berryliechi','berryganlon','berrypetaya','berryapicot','berrysalac','berrylansat','berrystarf'];
 run.rewards=[];for(let i=0;i<5;i++){const roll=Math.floor(classicRandom(run)*12),id=roll<6?common[Math.floor(roll/2)]:rare[Math.floor(classicRandom(run)*rare.length)],def=definitions.find(d=>d.id===id);if(def&&weight(def,run)>0&&run.party.some(mon=>target(mon,def,run).eligible))run.rewards.push(makeReward(run,def));}return run.rewards;
}
// Supported source Department Store groups; X items remain unavailable until their battle effects are implemented.
export function generateClassicStoreRewards(run,category){const rewards=[],stats=['hp','atk','def','spa','spd','spe'];const find=id=>definitions.find(d=>d.id===id),addDef=def=>{if(def&&weight(def,run)>0)rewards.push(makeReward(run,def));};
 if(category==='balls'){for(let i=0;i<4;i++){const roll=Math.floor(classicRandom(run)*65),id=roll<10?'pokeball':roll<40?'greatball':roll<60?'ultraball':'rogueball';addDef(find(id));}}
 else if(category==='tms'){for(let i=0;i<5;i++){const roll=Math.floor(classicRandom(run)*5);addDef(find('tm'+(roll<2?0:roll<4?1:2)));}}
 else if(category==='xitems'){const ids=['xattack','xdefense','xspatk','xspdef','xspeed','xaccuracy'];for(let i=0;i<5;i++){const roll=Math.floor(classicRandom(run)*5),id=roll===0?'direhit':ids[Math.floor(classicRandom(run)*ids.length)],def=find(id);if(!run.modifiers.some(m=>m.id===id&&m.remaining>=5))rewards.push(makeReward(run,def));}}
 else if(category==='vitamins'){for(let i=0;i<3;i++){if(Math.floor(classicRandom(run)*3)===0)addDef(find('ppup'));else{const stat=stats[Math.floor(classicRandom(run)*stats.length)],def={...find('basestatbooster'),stat,name:'기초 능력 강화 · '+({hp:'HP',atk:'공격',def:'방어',spa:'특공',spd:'특방',spe:'스피드'})[stat],weight:1};if(run.party.some(mon=>classicBaseStatEligible(run,mon,stat)))rewards.push(makeReward(run,def));}}}
 else throw Error('상점 종류를 확인하세요.');run.rewards=rewards;return rewards;}
export function generateClassicRewardsWithTiers(run,tiers){run.rewards=tiers.map(tier=>generateOne(run,tier));return run.rewards;}
export function generateClassicRewards(run){const bonus=Math.min(3,count(run,'goldenpokeball'));run.rewards=Array.from({length:3+bonus},()=>generateOne(run,classicRewardTier(()=>classicRandom(run),classicLuck(run.party))));return run.rewards;}
// Two guaranteed type boosters plus ordinary rewards for inspecting the teleporter.
export function generateClassicTeleportRewards(run){
 const rewards=generateClassicRewards(run),def=definitions.find(d=>d.id==='typebooster');
 const guaranteed=['Steel','Electric'].map(type=>{const [name,sprite]=typeBoosterItems[type];return {...def,rewardId:crypto.randomUUID(),typeBoost:type,name,image:img(sprite),description:name+'을(를) 지닌 포켓몬의 '+boosterTypeNames[type]+' 타입 기술 위력이 중첩당 20% 증가합니다.'};});
 run.rewards=[...guaranteed,...rewards.slice(0,Math.max(0,rewards.length-guaranteed.length))];return run.rewards;
}
export function classicRewardView(run,system){return (run.rewards||[]).map(reward=>{
 const def=reward,service=def.effect==='service'?classicServices({...run,wave:199},{system}).find(s=>s.id===def.id):null;
 const targets=service?.targets||run.party.map(p=>{const row=target(p,def,run);if(def.effect==='tm'){row.eligible=allowedTMs(p,def.tier).includes(def.moveName);row.reason=row.eligible?'':'이 기술을 배울 수 없습니다.';}if(['formitem','evolutionitem','zcrystal'].includes(def.effect))row.eligible=row.eligible&&p.boxId===def.boxId;return row;});
 return {id:def.rewardId,name:def.name,description:def.description,image:def.image,tier:def.tier,disabledReason:def.effect==='xitem'&&run.modifiers.some(m=>m.id===def.id&&m.remaining>=5)?'이미 최대 지속시간입니다.':undefined,quantity:def.quantity||1,requiresTarget:!!def.target,requiresMove:!!def.requiresMove,moveSelectionMode:def.effect==='ppup'?'ppup':undefined,requiresReplace:!!def.requiresReplace,requiresNewMove:!!def.requiresNewMove,targets,moveName:def.moveName,moveDescription:def.moveDescription,movePower:def.movePower,moveCategory:def.moveCategory,moveAccuracy:def.moveAccuracy,moveType:def.moveType};
 });}
export function rerollClassicRewards(run,expectedPrice){if(run.screen!=='reward')throw Error('보상 선택 화면에서만 리롤할 수 있습니다.');const price=classicRerollCost(run.wave,run.rerolls);spendClassicMoney(run,price,expectedPrice);run.rerolls++;generateClassicRewards(run);}
export function chooseClassicReward(run,payload,system){
 if(run.screen!=='reward')throw Error('전투 후 보상을 선택하세요.');const reward=run.rewards?.find(r=>r.rewardId===payload.rewardId);if(!reward)throw Error('선택할 보상을 확인하세요.');
 const view=classicRewardView(run,system).find(r=>r.id===reward.rewardId);if(reward.target&&!view.targets.some(t=>t.boxId===payload.boxId&&t.eligible))throw Error('보상 효과를 적용할 포켓몬을 선택하세요.');const mon=run.party.find(p=>p.boxId===payload.boxId);
 if(reward.effect==='service')run.party=restoreClassicParty(run.party,reward.id,{...payload,system,healingCharms:count(run,'healingcharm')});
 if(reward.effect==='zcrystal'){if(mon.item||!zCrystalCandidates(run,{special:!!reward.special}).some(candidate=>candidate.boxId===mon.boxId&&candidate.item===reward.crystal))throw Error('Z크리스탈을 줄 포켓몬을 확인하세요.');mon.item=reward.crystal;}
 if(reward.effect==='balls')run.balls[reward.id]=Math.min(99,(run.balls[reward.id]||0)+reward.quantity);
 if(reward.effect==='money')run.money+=classicMoneyGain(run,classicWaveMoney(run.wave,reward.multiplier))*(run.combat?.happyHour?2:1);
 if(reward.effect==='voucher')grantClassicVoucher(system,reward.voucherType);
 if(reward.effect==='tool'){run.tools[reward.tool]=true;if(reward.tool==='teraOrb')run.teraCharged=true;}
 if(reward.effect==='modifier'){if(reward.id==='basestatbooster'&&reward.stat){if(!addClassicBaseStat(run,mon,reward.stat))throw Error('이 능력치는 더 강화할 수 없습니다.');}else addClassicModifier(run,reward.id,{boxId:reward.target?mon.boxId:null,typeBoost:reward.typeBoost||null});}
 if(reward.effect==='xitem'){const existing=run.modifiers.find(m=>m.id===reward.id);if(existing?.remaining>=5)throw Error('이미 최대 지속시간입니다.');if(existing)existing.remaining=5;else run.modifiers.push({id:reward.id,boxId:null,count:1,remaining:5});}
 if(reward.effect==='lure'){const existing=run.modifiers.find(m=>m.id===reward.id);if(existing)existing.remaining=reward.duration;else run.modifiers.push({id:reward.id,boxId:null,count:1,remaining:reward.duration});}
 if(reward.effect==='formitem'){run.formItems||={};run.formItems[mon.boxId]=[...new Set([...(run.formItems[mon.boxId]||[]),reward.formItem])];}
 if(reward.effect==='evolutionitem'){run.evolutionItems||={};run.evolutionItems[reward.evolutionItem]=(run.evolutionItems[reward.evolutionItem]||0)+1;}
 if(reward.effect==='candy'){
  // Rare Candy can exceed the wave EXP cap, but the user's level 100 cap remains.
  const result=gainClassicExperience({...mon,experience:0},classicExpToNext(mon),run.wave,{capOverride:100});Object.assign(mon,result.mon);recordClassicLevelGrowth(run,mon,result.levels,result.learned);addClassicFriendship(mon,6,system,{capped:true});
 }
 if(reward.effect==='ppup'){const i=payload.moveIndex,name=mon.moves[i],move=Dex.moves.get(moves[name]?.key||name);if(!Number.isInteger(i)||!name||move.noPPBoosts||(mon.roguePPUps?.[move.id]||0)>=3)throw Error('최대 PP를 늘릴 기술을 확인하세요.');const old=classicMaxPP(mon,i),remaining=classicRemainingPP(mon,i);mon.roguePPUps||={};mon.roguePPUps[move.id]=Math.min(3,(mon.roguePPUps[move.id]||0)+reward.stages);mon.pp||={};mon.pp[move.id]=Math.min(classicMaxPP(mon,i),remaining+classicMaxPP(mon,i)-old);if(Array.isArray(mon.rogueSketchPP))mon.rogueSketchPP[i]=mon.pp[move.id];}
 if(reward.effect==='tm'){mon.moves=mon.moves.filter(Boolean);const slot=mon.moves.length<4?mon.moves.length:payload.replaceIndex;if(!Number.isInteger(slot)||slot<0||slot>3)throw Error('교체할 기술 자리를 선택하세요.');mon.rogueUsedTMs=[...new Set([...(mon.rogueUsedTMs||[]),reward.moveName])];mon.pp||={};if(mon.moves[slot]){mon.rogueMoveHistory=[...new Set([...(mon.rogueMoveHistory||[]),...mon.moves])];const oldKey=Dex.moves.get(moves[mon.moves[slot]]?.key||mon.moves[slot]).id;delete mon.pp[oldKey];if(mon.roguePPUps)delete mon.roguePPUps[oldKey];}mon.moves[slot]=reward.moveName;mon.moves=mon.moves.filter(Boolean);const learned=Dex.moves.get(moves[reward.moveName]?.key||reward.moveName);if(mon.roguePPUps)delete mon.roguePPUps[learned.id];mon.pp[learned.id]=learned.pp;if(Array.isArray(mon.rogueSketchPP))mon.rogueSketchPP[slot]=learned.pp;}
 run.log=[reward.name+'을(를) 선택했다.'];run.rewards=null;run.rerolls=0;return reward;
}
