import {installClassicMove,hasClassicMove} from './rogue-move-learning.mjs';
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {rules,configure} from './pokemon-config.mjs';
import {sourceSpeciesFor,sourceMove} from './rogue-reference.mjs';
import {classicLuck,classicRewardTier,classicRerollCost,classicWaveMoney} from './rogue-classic-rules.mjs';
import {classicRandom,spendClassicMoney} from './rogue-classic-state.mjs';
import {CLASSIC_SERVICE_TYPES,classicMaxPP,classicRemainingPP,classicServices,restoreClassicParty} from './rogue-classic-services.mjs';
import {classicExpToNext,gainClassicExperience,addClassicFriendship,queueClassicMoves} from './rogue-classic-growth.mjs';
import {classicTransformationItems} from './rogue-transformations.mjs';
import {classicEvolutionItemCandidates} from './rogue-evolution.mjs';

const img=slug=>'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+slug+'.png';
const count=(run,id,boxId)=>run.modifiers.filter(m=>m.id===id&&(!boxId||m.boxId===boxId)).reduce((a,b)=>a+b.count,0);
const pick=(list,run)=>list[Math.floor(classicRandom(run)*list.length)];
const typeItems={Normal:['노말','silk-scarf'],Fire:['불꽃','charcoal'],Water:['물','mystic-water'],Electric:['전기','magnet'],Grass:['풀','miracle-seed'],Ice:['얼음','never-melt-ice'],Fighting:['격투','black-belt'],Poison:['독','poison-barb'],Ground:['땅','soft-sand'],Flying:['비행','sharp-beak'],Psychic:['에스퍼','twisted-spoon'],Bug:['벌레','silver-powder'],Rock:['바위','hard-stone'],Ghost:['고스트','spell-tag'],Dragon:['드래곤','dragon-fang'],Dark:['악','black-glasses'],Steel:['강철','metal-coat'],Fairy:['페어리','fairy-feather']};
export function classicTypeBoosterName(type){const item=typeItems[type];if(!item)return '타입 강화 도구';return (rules.items[Dex.items.get(item[1]).id]?.name||item[0]+' 타입 강화 도구')+' · '+item[0];}
function attackTypePool(run){const weights=new Map();for(const mon of run.party)for(const name of mon.moves){const move=Dex.moves.get(moves[name]?.key||name);if(move.exists&&move.category!=='Status'&&typeItems[move.type])weights.set(move.type,Math.min(3,(weights.get(move.type)||0)+1));}return [...weights].filter(([type])=>run.party.some(mon=>run.modifiers.filter(m=>m.id==='typebooster'&&m.boxId===mon.boxId&&m.typeBoost===type).reduce((n,m)=>n+m.count,0)<99)).flatMap(([type,n])=>Array(n).fill(type));}

// Crystal rewards only target a Pokémon without a native held item; never
// replace an existing item or silently discard a previously earned crystal.
const zCrystals={Normal:'normaliumz',Fire:'firiumz',Water:'wateriumz',Electric:'electriumz',Grass:'grassiumz',Ice:'iciumz',Fighting:'fightiniumz',Poison:'poisoniumz',Ground:'groundiumz',Flying:'flyiniumz',Psychic:'psychiumz',Bug:'buginiumz',Rock:'rockiumz',Ghost:'ghostiumz',Dragon:'dragoniumz',Dark:'darkiniumz',Steel:'steeliumz',Fairy:'fairiumz'};
function zCrystalCandidates(run,{special=false}={}){
 if(!run.tools?.zRing)return [];
 return run.party.flatMap(mon=>{
  if(mon.item)return [];
  const known=mon.moves.map(name=>Dex.moves.get(moves[name]?.key||name)).filter(move=>move.exists);
  if(!special)return [...new Set(known.filter(move=>zCrystals[move.type]&&(move.category==='Status'||move.zMove?.basePower)).map(move=>zCrystals[move.type]))].map(item=>({boxId:mon.boxId,item}));
  const species=Dex.species.get(mon.rogueBattleSpecies||rules.species[mon.id]?.key);
  return Dex.items.all().filter(item=>item.zMoveFrom&&item.itemUser?.includes(species.name)&&known.some(move=>move.name===item.zMoveFrom)).map(item=>({boxId:mon.boxId,item:item.id}));
 });
}

export function classicCrystalTransferTargets(run,from){
 const item=Dex.items.get(from?.item||'');if(!item.zMove||item.id==='ultranecroziumz')return [];
 return run.party.filter(mon=>mon.boxId!==from.boxId&&!mon.item&&(item.zMove===true||item.itemUser?.includes(Dex.species.get(mon.rogueBattleSpecies||rules.species[mon.id]?.key).name))).map(mon=>mon.boxId);
}

const definitions=[];
function add(id,name,tier,weight,effect,extra={}){definitions.push({id,name,tier,weight,effect,image:img(extra.sprite||id),description:extra.description||name,...extra});}
for(const [id,name,tier,quantity,weight,sprite]of [['pokeball','몬스터볼',0,5,6,'poke-ball'],['greatball','슈퍼볼',1,5,6,'great-ball'],['ultraball','하이퍼볼',2,5,15,'ultra-ball'],['rogueball','로그볼',3,5,16,'dream-ball'],['masterball','마스터볼',4,1,24,'master-ball']])add(id,name,tier,weight,'balls',{quantity,sprite,description:`${name} ${quantity}개를 이번 도전의 가방에 추가합니다.`,max:99});
add('rarecandy','이상한사탕',0,2,'candy',{sprite:'rare-candy',target:true,description:'선택한 포켓몬의 레벨을 1 올립니다. 조건을 만족하면 진화합니다.'});
add('typebooster','타입 강화 도구',2,9,'typebooster',{target:true,max:99,sprite:'charcoal',description:'특정 타입의 기술 위력을 높입니다.'});
for(const service of CLASSIC_SERVICE_TYPES)add(service.id,service.name,['potion','superpotion','ether','maxether'].includes(service.id)?0:1,1,'service',{...service,target:service.requiresTarget!==false});
for(const [id,name,tier,weight,max,sprite,description]of [
 ['amuletcoin','부적금화',2,3,5,'amulet-coin','트레이너 승리와 금전 보상의 도전 소지금이 중첩당 20% 증가합니다.'],
 ['goldenpunch','황금주먹',2,2,5,'amulet-coin','이 포켓몬이 상대에게 기술 피해를 주면 피해량의 50%만큼 도전 소지금을 얻습니다. 최대 5개 중첩.'],
 ['widelens','광각렌즈',2,7,3,'wide-lens','이 포켓몬의 기술 명중률을 중첩당 5%p 높입니다. 최대 3개 중첩.'],
 ['scopelens','초점렌즈',3,4,1,'scope-lens','이 포켓몬의 공격이 급소에 맞을 확률을 한 단계 높입니다.'],
 ['shellbell','조개껍질방울',3,3,4,'shell-bell','이 포켓몬이 공격으로 준 피해의 1/8만큼 HP를 회복합니다. 최대 4개 중첩.'],
 ['abilitycharm','특성부적',3,6,4,'ability-capsule','야생 포켓몬의 숨겨진 특성 출현 확률이 증가합니다. 최대 4개 중첩.'],
 ['shinycharm','빛나는부적',4,14,4,'shiny-charm','야생 포켓몬의 색이 다른 모습 출현 확률이 증가합니다. 최대 4개 중첩.'],
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
])add(id,name,tier,weight,'modifier',{max,sprite,description,target:['luckyegg','goldenegg','leftovers','soothebell','goldenpunch','widelens','scopelens','shellbell'].includes(id)});
for(const [id,name,tier,tool,sprite]of [['megabracelet','메가팔찌',3,'megaBracelet','mega-bracelet'],['dynamaxband','다이맥스밴드',3,'dynamaxBand','dynamax-band'],['zring','Z링',3,'zRing','z-ring'],['teraorb','테라스탈오브',2,'teraOrb','tera-orb'],['map','지도',1,'map','town-map']])add(id,name,tier,id==='map'?2:9,'tool',{tool,sprite,description:id==='map'?'구간 종료 시 다음 바이옴을 직접 선택합니다.':id==='dynamaxband'?'이번 도전에서 거다이맥스 폼 도구와 전투당 한 번 3턴 다이맥스를 해금합니다.':'이번 도전에서 '+name+'의 변신 기능을 해금합니다.'});
for(const [id,name,tier,multiplier,weight,sprite]of [['nugget','금구슬',1,1,5,'nugget'],['bignugget','큰금구슬',2,2.5,12,'big-nugget'],['relicgold','고대금화',3,10,2,'relic-gold']])add(id,name,tier,weight,'money',{multiplier,sprite,description:'이번 도전의 소지금을 획득합니다.'});
for(const [id,name,tier,stages]of [['ppup','포인트업',1,1],['ppmax','포인트맥스',2,3]])add(id,name,tier,id==='ppup'?2:3,'ppup',{target:true,requiresMove:true,stages,sprite:id==='ppup'?'pp-up':'pp-max',description:'기술 하나의 최대 PP를 '+(stages===3?'최대로':'1단계')+' 늘립니다.'});
for(let tier=0;tier<3;tier++)add('tm'+tier,'기술머신',tier,tier+2,'tm',{target:true,requiresReplace:true,sprite:'tm-normal',description:'이 포켓몬이 배울 수 있는 기술을 가르칩니다.'});
add('zcrystal','Z크리스탈',2,6,'zcrystal',{target:true,sprite:'normalium-z',description:'도구를 지니지 않은 포켓몬에게 맞는 타입의 Z크리스탈을 줍니다.'});
add('specialzcrystal','전용 Z크리스탈',3,4,'zcrystal',{target:true,special:true,sprite:'pikanium-z',description:'전용 기술을 아는 포켓몬에게 맞는 Z크리스탈을 줍니다.'});
add('formitem','폼 변화 도구',2,6,'formitem',{target:true,sprite:'max-mushrooms',description:'필요한 장비를 가진 포켓몬에게 맞는 폼 변화 도구를 획득합니다.'});
add('rareformitem','희귀 폼 변화 도구',3,6,'formitem',{target:true,rare:true,sprite:'charizardite-x',description:'메가·거다이맥스 등 파티에 맞는 변신 도구를 획득합니다.'});
add('evolutionitem','진화 도구',1,8,'evolutionitem',{target:true,sprite:'fire-stone',description:'파티에 필요한 진화 도구를 받습니다. 진화는 파티에서 직접 선택합니다.'});
add('rareevolutionitem','희귀 진화 도구',2,32,'evolutionitem',{target:true,sprite:'black-augurite',rare:true,description:'파티에 필요한 희귀 진화 도구를 받습니다. 진화는 파티에서 직접 선택합니다.'});
export const CLASSIC_REWARD_REGISTRY=Object.freeze(definitions);
export function classicMoneyReward(run,multiplier=1){const amount=classicWaveMoney(run.wave,multiplier),stacks=Math.min(5,count(run,'amuletcoin'));return amount+Math.floor(amount*.2*stacks);}
export function addClassicModifier(run,id,{boxId=null,count:amount=1,typeBoost=null,max=null,saturate=false}={}){
 const def=definitions.find(d=>d.id===id),limit=max??def?.max??99,existing=run.modifiers.find(m=>m.id===id&&m.boxId===boxId&&m.typeBoost===typeBoost);
 const current=existing?.count||0;if(current+amount>limit&&!saturate)throw Error('이 도구의 중첩 한도에 도달했습니다.');
 const granted=saturate?Math.max(0,Math.min(amount,limit-current)):amount;if(!granted)return;
 if(existing)existing.count+=granted;else run.modifiers.push({id,boxId,typeBoost,count:granted});
}
// Move only existing owned held modifiers; validate everything before mutation.
export function transferClassicModifier(run,{fromBoxId,toBoxId,id,typeBoost=null,quantity=1}){
 if(!['reward','advance','interlude','route'].includes(run.screen))throw Error('전투와 선택을 마친 뒤 도구를 옮기세요.');
 if(typeof fromBoxId!=='string'||typeof toBoxId!=='string'||fromBoxId===toBoxId||!run.party.some(p=>p.boxId===fromBoxId)||!run.party.some(p=>p.boxId===toBoxId))throw Error('도구를 주고받을 파티 포켓몬을 확인하세요.');
 if(typeof id!=='string'||!(typeBoost===null||typeof typeBoost==='string')||!Number.isSafeInteger(quantity)||quantity<1)throw Error('옮길 도구와 수량을 확인하세요.');
 const from=run.party.find(p=>p.boxId===fromBoxId),to=run.party.find(p=>p.boxId===toBoxId);
 if(from.item===id&&Dex.items.get(id).zMove&&id!=='ultranecroziumz'){if(quantity!==1||typeBoost!==null||!classicCrystalTransferTargets(run,from).includes(to.boxId))throw Error('도구를 지니지 않은 포켓몬을 선택하세요.');to.item=from.item;from.item='';run.log=[`${Dex.items.get(id).name}을(를) 옮겼다.`];return {id,quantity,fromBoxId,toBoxId};}
 const source=run.modifiers.find(m=>m.id===id&&m.boxId===fromBoxId&&(m.typeBoost||null)===typeBoost),def=definitions.find(d=>d.id===id);
 if(!source||source.transferable===false||id==='evolutiontracker'||!def?.target||!['modifier','typebooster'].includes(def.effect)||quantity>source.count)throw Error('이 도구는 옮길 수 없거나 보유 수량이 부족합니다.');
 const destination=run.modifiers.find(m=>m.id===id&&m.boxId===toBoxId&&(m.typeBoost||null)===typeBoost),limit=def.max??99;
 if((destination?.count||0)+quantity>limit)throw Error('받는 포켓몬의 도구 중첩 한도를 초과합니다.');
 source.count-=quantity;if(destination)destination.count+=quantity;else run.modifiers.push({...source,boxId:toBoxId,count:quantity});
 if(source.count===0)run.modifiers=run.modifiers.filter(m=>m!==source);
 run.log=[`${def.name} ${quantity}개를 옮겼다.`];return {id,quantity,fromBoxId,toBoxId};
}
function allowedTMs(mon,tier){const record=sourceSpeciesFor(mon),form=record?.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0)),ids=[...(record?.tms||[]),...(record?.formTms?.[form?.formKey||'']||[])];return [...new Set(ids.map(sourceMove).filter(Boolean))].filter(name=>!hasClassicMove(mon,name)&&Math.min(2,Math.floor((Dex.moves.get(moves[name]?.key||name).basePower||0)/60))===tier);}
function target(mon,def,run,system=null){
 let eligible=true,reason='';if(def.effect==='candy')eligible=mon.hp>0&&mon.level<100;
 if(def.effect==='zcrystal')eligible=zCrystalCandidates(run,{special:!!def.special}).some(candidate=>candidate.boxId===mon.boxId&&(!def.crystal||def.crystal===candidate.item));
 if(def.effect==='modifier')eligible=count(run,def.id,mon.boxId)<def.max;
 if(def.effect==='typebooster'&&def.typeBoost)eligible=run.modifiers.filter(m=>m.id===def.id&&m.boxId===mon.boxId&&m.typeBoost===def.typeBoost).reduce((n,m)=>n+m.count,0)<def.max;
 if(def.effect==='formitem')eligible=classicTransformationItems(mon,run,{rare:!!def.rare,system}).length>0;
 if(def.effect==='evolutionitem')eligible=classicEvolutionItemCandidates(run,system, {rare:!!def.rare}).some(e=>e.boxId===mon.boxId);
 if(def.effect==='tm')eligible=allowedTMs(mon,def.tier).length>0;
 if(def.effect==='ppup')eligible=mon.moves.some((name,i)=>(mon.roguePPUps?.[Dex.moves.get(moves[name]?.key||name).id]||0)<3&&!Dex.moves.get(moves[name]?.key||name).noPPBoosts);
 if(!eligible)reason='효과를 적용할 수 없습니다.';
 return {boxId:mon.boxId,name:mon.name,hp:mon.hp,maxHp:mon.maxHp,eligible,reason,moves:mon.moves.map((name,index)=>{const move=Dex.moves.get(moves[name]?.key||name),ppUps=mon.roguePPUps?.[move.id]||0;return {index,name,pp:classicRemainingPP(mon,index),maxPp:classicMaxPP(mon,index),...(def.effect==='ppup'?{ppUps,canIncreasePp:move.exists&&!move.noPPBoosts&&ppUps<3}: {})};})};
}
function weight(def,run,system=null){
 if(def.effect==='typebooster')return attackTypePool(run).length?def.weight:0;
 if(def.effect==='zcrystal')return zCrystalCandidates(run,{special:!!def.special}).length?def.weight:0;
 if(def.id==='abilitycharm'&&run.wave>189)return 0;
 if(def.id==='teraorb')return 0; // Classic grants this after the fourth rival instead.
 if(def.effect==='tool')return run.tools[def.tool]?0:def.weight*(def.id==='map'?Number(run.wave<180):Math.min(4,Math.ceil(run.wave/50)));
 if(def.effect==='balls')return (run.balls[def.id]||0)>=99?0:def.weight;
 if(def.effect==='service'){
  const service=classicServices({...run,wave:199},{system}).find(s=>s.id===def.id);if(!service||service.disabledReason)return 0;
  const party=run.party,cap=n=>Math.min(3,n),heal=(missing,ratio)=>cap(party.filter(p=>p.hp>0&&p.maxHp-p.hp>=missing&&p.hp/p.maxHp<=ratio).length);
  return ({potion:heal(10,.875)*3,superpotion:heal(25,.75),hyperpotion:heal(100,.625)*3,maxpotion:heal(100,.5),fullheal:cap(party.filter(p=>p.hp>0&&p.status).length)*6,revive:cap(party.filter(p=>p.hp<=0).length)*9,maxrevive:cap(party.filter(p=>p.hp<=0).length)*3,sacredash:party.filter(p=>p.hp<=0).length>=Math.ceil(party.length/2)?1:0})[def.id]??1;
 }
 if(def.target)return run.party.some(p=>target(p,def,run,system).eligible)?def.weight:0;
 if(def.effect==='modifier')return count(run,def.id)>=def.max?0:def.weight;
 return def.weight;
}
function generateOne(run,tier,system=null){
 let pool=definitions.filter(d=>d.tier===tier).map(d=>({d,weight:weight(d,run,system)})).filter(p=>p.weight>0);
 while(!pool.length&&tier>0){tier--;pool=definitions.filter(d=>d.tier===tier).map(d=>({d,weight:weight(d,run,system)})).filter(p=>p.weight>0);}
 if(!pool.length)throw Error('선택 가능한 보상을 만들지 못했습니다.');
 let roll=classicRandom(run)*pool.reduce((n,p)=>n+p.weight,0),def=pool.at(-1).d;for(const p of pool){roll-=p.weight;if(roll<0){def=p.d;break;}}
 const reward={...def,rewardId:crypto.randomUUID()};
 if(def.effect==='typebooster'){
  const type=pick(attackTypePool(run),run),[label,sprite]=typeItems[type];Object.assign(reward,{typeBoost:type,name:classicTypeBoosterName(type),image:img(sprite),description:label+' 타입 공격 기술의 위력을 중첩당 20% 높입니다.'});
 }
 if(def.effect==='tm'){
  const candidates=[...new Set(run.party.flatMap(p=>allowedTMs(p,tier)))],name=pick(candidates,run);reward.moveName=name;reward.name='기술머신 · '+name;reward.description='배울 수 있는 포켓몬에게 '+name+'을(를) 가르칩니다.';
 }
 if(def.effect==='zcrystal'){const selected=pick(zCrystalCandidates(run,{special:!!def.special}),run),item=Dex.items.get(selected.item),name=rules.items[item.id]?.name||item.name;Object.assign(reward,{crystal:item.id,boxId:selected.boxId,name,image:img(item.name.toLowerCase().replace(/\s+/g,'-')),description:'도구를 지니지 않은 선택 포켓몬에게 Z크리스탈을 줍니다.'});}
 if(def.effect==='formitem'){const options=run.party.flatMap(p=>classicTransformationItems(p,run,{rare:!!def.rare,system}).map(o=>({...o,boxId:p.boxId}))),selected=pick(options,run);Object.assign(reward,{formItem:selected.key,boxId:selected.boxId,name:selected.name,description:'이 도전에서 사용할 폼 변화 도구를 획득합니다.'});}
 if(def.effect==='evolutionitem'){const selected=pick(classicEvolutionItemCandidates(run,system, {rare:!!def.rare}),run);Object.assign(reward,{evolutionItem:selected.item,boxId:selected.boxId,name:selected.name,description:selected.pokemonName+'에게 사용할 진화 도구입니다. 파티 메뉴에서 직접 진화하세요.'});}
 return reward;
}
export function generateClassicRewards(run,system=null){const bonus=Math.min(3,count(run,'goldenpokeball'));run.rewards=Array.from({length:3+bonus},()=>generateOne(run,classicRewardTier(()=>classicRandom(run),classicLuck(run.party)),system));return run.rewards;}
export function classicRewardView(run,system){return (run.rewards||[]).map(reward=>{
 const def=reward,service=def.effect==='service'?classicServices({...run,wave:199},{system}).find(s=>s.id===def.id):null;
 const targets=service?.targets||run.party.map(p=>{const row=target(p,def,run,system);if(def.effect==='tm'){row.eligible=allowedTMs(p,def.tier).includes(def.moveName);row.reason=row.eligible?'':'이 기술을 배울 수 없습니다.';}if(['formitem','evolutionitem','zcrystal'].includes(def.effect))row.eligible=row.eligible&&p.boxId===def.boxId;return row;});
 return {id:def.rewardId,name:def.name,description:def.description,image:def.image,tier:def.tier,quantity:def.quantity||1,requiresTarget:!!def.target,requiresMove:!!def.requiresMove,moveSelection:def.effect==='ppup'?'pp-boost':undefined,requiresReplace:!!def.requiresReplace,requiresNewMove:!!def.requiresNewMove,targets,moveName:def.moveName};
 });}
export function rerollClassicRewards(run,expectedPrice,system=null){if(run.screen!=='reward')throw Error('보상 선택 화면에서만 리롤할 수 있습니다.');const price=classicRerollCost(run.wave,run.rerolls);spendClassicMoney(run,price,expectedPrice);run.rerolls++;generateClassicRewards(run,system);}
export function chooseClassicReward(run,payload,system){
 if(run.screen!=='reward')throw Error('전투 후 보상을 선택하세요.');const reward=run.rewards?.find(r=>r.rewardId===payload.rewardId);if(!reward)throw Error('선택할 보상을 확인하세요.');
 const view=classicRewardView(run,system).find(r=>r.id===reward.rewardId);if(reward.target&&!view.targets.some(t=>t.boxId===payload.boxId&&t.eligible))throw Error('보상 효과를 적용할 포켓몬을 선택하세요.');const mon=run.party.find(p=>p.boxId===payload.boxId);
 if(reward.effect==='service')run.party=restoreClassicParty(run.party,reward.id,{...payload,system});
 if(reward.effect==='zcrystal'){if(mon.item||!zCrystalCandidates(run,{special:!!reward.special}).some(candidate=>candidate.boxId===mon.boxId&&candidate.item===reward.crystal))throw Error('Z크리스탈을 줄 포켓몬을 확인하세요.');mon.item=reward.crystal;}
 if(reward.effect==='balls')run.balls[reward.id]=Math.min(99,(run.balls[reward.id]||0)+reward.quantity);
 if(reward.effect==='money'){
  run.money+=classicMoneyReward(run,reward.multiplier);
  // Pinned upstream MoneyRewardModifier increments each party Gimmighoul's
  // non-transferable evolution tracker by floor(multiplier), capped at three.
  const gained=Math.min(Math.floor(reward.multiplier),3);
  for(const member of run.party){if(sourceSpeciesFor(member)?.sourceId!==999||gained<=0)continue;addClassicModifier(run,'evolutiontracker',{boxId:member.boxId,count:gained,max:999,saturate:true});const tracker=run.modifiers.find(m=>m.id==='evolutiontracker'&&m.boxId===member.boxId);if(tracker)tracker.transferable=false;}
 }
 if(reward.effect==='tool'){run.tools[reward.tool]=true;if(reward.tool==='teraOrb')run.teraCharged=true;}
 if(reward.effect==='modifier'||reward.effect==='typebooster')addClassicModifier(run,reward.id,{boxId:reward.target?mon.boxId:null,typeBoost:reward.typeBoost||null});
 if(reward.effect==='formitem'){run.formItems||={};run.formItems[mon.boxId]=[...new Set([...(run.formItems[mon.boxId]||[]),reward.formItem])];}
 if(reward.effect==='evolutionitem'){run.evolutionItems||={};run.evolutionItems[reward.evolutionItem]=(run.evolutionItems[reward.evolutionItem]||0)+1;}
 if(reward.effect==='candy'){
  // Rare Candy can exceed the wave EXP cap, but the user's level 100 cap remains.
  const result=gainClassicExperience({...mon,experience:0},classicExpToNext(mon),run.wave,{capOverride:100});Object.assign(mon,result.mon);if(result.levels.length){run.pendingEvolutionChecks||=[];for(const level of result.levels)run.pendingEvolutionChecks.push({boxId:mon.boxId,level});}queueClassicMoves(run,mon,result.learned);addClassicFriendship(mon,6,system,{capped:true,sootheBells:count(run,'soothebell',mon.boxId)});
 }
 if(reward.effect==='ppup'){const i=payload.moveIndex,name=mon.moves[i],move=Dex.moves.get(moves[name]?.key||name);if(!Number.isInteger(i)||!name||move.noPPBoosts||(mon.roguePPUps?.[move.id]||0)>=3)throw Error('최대 PP를 늘릴 기술을 확인하세요.');const old=classicMaxPP(mon,i),remaining=classicRemainingPP(mon,i);mon.roguePPUps||={};mon.roguePPUps[move.id]=Math.min(3,(mon.roguePPUps[move.id]||0)+reward.stages);mon.pp||={};mon.pp[move.id]=Math.min(classicMaxPP(mon,i),remaining+classicMaxPP(mon,i)-old);}
 if(reward.effect==='tm'){installClassicMove(mon,reward.moveName,payload.replaceIndex);mon.rogueUsedTMs=[...new Set([...(mon.rogueUsedTMs||[]),reward.moveName])];}
 run.log=[reward.name+'을(를) 선택했다.'];run.rewards=null;run.rerolls=0;return reward;
}
