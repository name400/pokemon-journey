import {installClassicMove} from './rogue-move-learning.mjs';
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
const definitions=[];
function add(id,name,tier,weight,effect,extra={}){definitions.push({id,name,tier,weight,effect,image:img(extra.sprite||id),description:extra.description||name,...extra});}
for(const [id,name,tier,quantity,weight,sprite]of [['pokeball','몬스터볼',0,5,6,'poke-ball'],['greatball','슈퍼볼',1,5,6,'great-ball'],['ultraball','하이퍼볼',2,5,15,'ultra-ball'],['rogueball','로그볼',3,5,16,'dream-ball'],['masterball','마스터볼',4,1,24,'master-ball']])add(id,name,tier,weight,'balls',{quantity,sprite,description:`${name} ${quantity}개를 이번 도전의 가방에 추가합니다.`,max:99});
add('rarecandy','이상한사탕',0,2,'candy',{sprite:'rare-candy',target:true,description:'선택한 포켓몬의 레벨을 1 올립니다. 진화는 직접 선택합니다.'});
for(const service of CLASSIC_SERVICE_TYPES)add(service.id,service.name,['potion','superpotion','ether','maxether'].includes(service.id)?0:1,1,'service',{...service,target:service.requiresTarget!==false});
for(const [id,name,tier,weight,max,sprite,description]of [
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
for(const [id,name,tier,tool,sprite]of [['megabracelet','메가팔찌',3,'megaBracelet','mega-bracelet'],['dynamaxband','다이맥스밴드',3,'dynamaxBand','dynamax-band'],['teraorb','테라스탈오브',2,'teraOrb','tera-orb'],['map','지도',1,'map','town-map']])add(id,name,tier,id==='map'?2:9,'tool',{tool,sprite,description:id==='map'?'구간 종료 시 다음 바이옴을 직접 선택합니다.':'이번 도전에서 '+name+'의 변신 기능을 해금합니다.'});
for(const [id,name,tier,multiplier,weight,sprite]of [['nugget','금구슬',1,1,5,'nugget'],['bignugget','큰금구슬',2,2.5,12,'big-nugget'],['relicgold','고대금화',3,10,2,'relic-gold']])add(id,name,tier,weight,'money',{multiplier,sprite,description:'이번 도전의 소지금을 획득합니다.'});
for(const [id,name,tier,stages]of [['ppup','포인트업',1,1],['ppmax','포인트맥스',2,3]])add(id,name,tier,id==='ppup'?2:3,'ppup',{target:true,requiresMove:true,stages,sprite:id==='ppup'?'pp-up':'pp-max',description:'기술 하나의 최대 PP를 '+(stages===3?'최대로':'1단계')+' 늘립니다.'});
for(let tier=0;tier<3;tier++)add('tm'+tier,'기술머신',tier,tier+2,'tm',{target:true,requiresReplace:true,sprite:'tm-normal',description:'이 포켓몬이 배울 수 있는 기술을 가르칩니다.'});
add('formitem','폼 변화 도구',2,6,'formitem',{target:true,sprite:'max-mushrooms',description:'필요한 장비를 가진 포켓몬에게 맞는 폼 변화 도구를 획득합니다.'});
add('rareformitem','희귀 폼 변화 도구',3,6,'formitem',{target:true,sprite:'charizardite-x',description:'메가·거다이맥스 등 파티에 맞는 변신 도구를 획득합니다.'});
add('evolutionitem','진화 도구',1,8,'evolutionitem',{target:true,sprite:'fire-stone',description:'파티에 필요한 진화 도구를 받습니다. 진화는 파티에서 직접 선택합니다.'});
add('rareevolutionitem','희귀 진화 도구',2,32,'evolutionitem',{target:true,sprite:'black-augurite',rare:true,description:'파티에 필요한 희귀 진화 도구를 받습니다. 진화는 파티에서 직접 선택합니다.'});
export const CLASSIC_REWARD_REGISTRY=Object.freeze(definitions);
export function addClassicModifier(run,id,{boxId=null,count:amount=1,typeBoost=null,max=null}={}){
 const def=definitions.find(d=>d.id===id),limit=max??def?.max??99,existing=run.modifiers.find(m=>m.id===id&&m.boxId===boxId&&m.typeBoost===typeBoost);
 if((existing?.count||0)+amount>limit)throw Error('이 도구의 중첩 한도에 도달했습니다.');
 if(existing)existing.count+=amount;else run.modifiers.push({id,boxId,typeBoost,count:amount});
}
function allowedTMs(mon,tier){const record=sourceSpeciesFor(mon),form=record?.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0)),ids=[...(record?.tms||[]),...(record?.formTms?.[form?.formKey||'']||[])];return [...new Set(ids.map(sourceMove).filter(Boolean))].filter(name=>!mon.moves.includes(name)&&Math.min(2,Math.floor((Dex.moves.get(moves[name]?.key||name).basePower||0)/60))===tier);}
function target(mon,def,run){
 let eligible=true,reason='';if(def.effect==='candy')eligible=mon.hp>0&&mon.level<100;
 if(def.effect==='modifier')eligible=count(run,def.id,mon.boxId)<def.max;
 if(def.effect==='formitem')eligible=classicTransformationItems(mon,run).length>0;
 if(def.effect==='evolutionitem')eligible=classicEvolutionItemCandidates(run,{}, {rare:!!def.rare}).some(e=>e.boxId===mon.boxId);
 if(def.effect==='tm')eligible=allowedTMs(mon,def.tier).length>0;
 if(def.effect==='ppup')eligible=mon.moves.some((name,i)=>(mon.roguePPUps?.[Dex.moves.get(moves[name]?.key||name).id]||0)<3&&!Dex.moves.get(moves[name]?.key||name).noPPBoosts);
 if(!eligible)reason='효과를 적용할 수 없습니다.';
 return {boxId:mon.boxId,name:mon.name,hp:mon.hp,maxHp:mon.maxHp,eligible,reason,moves:mon.moves.map((name,index)=>{const move=Dex.moves.get(moves[name]?.key||name),ppUps=mon.roguePPUps?.[move.id]||0;return {index,name,pp:classicRemainingPP(mon,index),maxPp:classicMaxPP(mon,index),...(def.effect==='ppup'?{ppUps,canIncreasePp:move.exists&&!move.noPPBoosts&&ppUps<3}: {})};})};
}
function weight(def,run){
 if(def.id==='teraorb')return 0; // Classic grants this after the fourth rival instead.
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
 const reward={...def,rewardId:crypto.randomUUID()};
 if(def.effect==='tm'){
  const candidates=[...new Set(run.party.flatMap(p=>allowedTMs(p,tier)))],name=pick(candidates,run);reward.moveName=name;reward.name='기술머신 · '+name;reward.description='배울 수 있는 포켓몬에게 '+name+'을(를) 가르칩니다.';
 }
 if(def.effect==='formitem'){const options=run.party.flatMap(p=>classicTransformationItems(p,run).map(o=>({...o,boxId:p.boxId}))),selected=pick(options,run);Object.assign(reward,{formItem:selected.key,boxId:selected.boxId,name:selected.name,description:'이 도전에서 사용할 폼 변화 도구를 획득합니다.'});}
 if(def.effect==='evolutionitem'){const selected=pick(classicEvolutionItemCandidates(run,{}, {rare:!!def.rare}),run);Object.assign(reward,{evolutionItem:selected.item,boxId:selected.boxId,name:selected.name,description:selected.pokemonName+'에게 사용할 진화 도구입니다. 파티 메뉴에서 직접 진화하세요.'});}
 return reward;
}
export function generateClassicRewards(run){const bonus=Math.min(3,count(run,'goldenpokeball'));run.rewards=Array.from({length:3+bonus},()=>generateOne(run,classicRewardTier(()=>classicRandom(run),classicLuck(run.party))));return run.rewards;}
export function classicRewardView(run,system){return (run.rewards||[]).map(reward=>{
 const def=reward,service=def.effect==='service'?classicServices({...run,wave:199},{system}).find(s=>s.id===def.id):null;
 const targets=service?.targets||run.party.map(p=>{const row=target(p,def,run);if(def.effect==='tm'){row.eligible=allowedTMs(p,def.tier).includes(def.moveName);row.reason=row.eligible?'':'이 기술을 배울 수 없습니다.';}if(['formitem','evolutionitem'].includes(def.effect))row.eligible=p.boxId===def.boxId;return row;});
 return {id:def.rewardId,name:def.name,description:def.description,image:def.image,tier:def.tier,quantity:def.quantity||1,requiresTarget:!!def.target,requiresMove:!!def.requiresMove,moveSelection:def.effect==='ppup'?'pp-boost':undefined,requiresReplace:!!def.requiresReplace,requiresNewMove:!!def.requiresNewMove,targets,moveName:def.moveName};
 });}
export function rerollClassicRewards(run,expectedPrice){if(run.screen!=='reward')throw Error('보상 선택 화면에서만 리롤할 수 있습니다.');const price=classicRerollCost(run.wave,run.rerolls);spendClassicMoney(run,price,expectedPrice);run.rerolls++;generateClassicRewards(run);}
export function chooseClassicReward(run,payload,system){
 if(run.screen!=='reward')throw Error('전투 후 보상을 선택하세요.');const reward=run.rewards?.find(r=>r.rewardId===payload.rewardId);if(!reward)throw Error('선택할 보상을 확인하세요.');
 const view=classicRewardView(run,system).find(r=>r.id===reward.rewardId);if(reward.target&&!view.targets.some(t=>t.boxId===payload.boxId&&t.eligible))throw Error('보상 효과를 적용할 포켓몬을 선택하세요.');const mon=run.party.find(p=>p.boxId===payload.boxId);
 if(reward.effect==='service')run.party=restoreClassicParty(run.party,reward.id,{...payload,system});
 if(reward.effect==='balls')run.balls[reward.id]=Math.min(99,(run.balls[reward.id]||0)+reward.quantity);
 if(reward.effect==='money')run.money+=classicWaveMoney(run.wave,reward.multiplier);
 if(reward.effect==='tool'){run.tools[reward.tool]=true;if(reward.tool==='teraOrb')run.teraCharged=true;}
 if(reward.effect==='modifier')addClassicModifier(run,reward.id,{boxId:reward.target?mon.boxId:null});
 if(reward.effect==='formitem'){run.formItems||={};run.formItems[mon.boxId]=[...new Set([...(run.formItems[mon.boxId]||[]),reward.formItem])];}
 if(reward.effect==='evolutionitem'){run.evolutionItems||={};run.evolutionItems[reward.evolutionItem]=(run.evolutionItems[reward.evolutionItem]||0)+1;}
 if(reward.effect==='candy'){
  // Rare Candy can exceed the wave EXP cap, but the user's level 100 cap remains.
  const result=gainClassicExperience({...mon,experience:0},classicExpToNext(mon),run.wave,{capOverride:100});Object.assign(mon,result.mon);queueClassicMoves(run,mon,result.learned);addClassicFriendship(mon,6,system,{capped:true});
 }
 if(reward.effect==='ppup'){const i=payload.moveIndex,name=mon.moves[i],move=Dex.moves.get(moves[name]?.key||name);if(!Number.isInteger(i)||!name||move.noPPBoosts||(mon.roguePPUps?.[move.id]||0)>=3)throw Error('최대 PP를 늘릴 기술을 확인하세요.');const old=classicMaxPP(mon,i),remaining=classicRemainingPP(mon,i);mon.roguePPUps||={};mon.roguePPUps[move.id]=Math.min(3,(mon.roguePPUps[move.id]||0)+reward.stages);mon.pp||={};mon.pp[move.id]=Math.min(classicMaxPP(mon,i),remaining+classicMaxPP(mon,i)-old);}
 if(reward.effect==='tm'){installClassicMove(mon,reward.moveName,payload.replaceIndex);mon.rogueUsedTMs=[...new Set([...(mon.rogueUsedTMs||[]),reward.moveName])];}
 run.log=[reward.name+'을(를) 선택했다.'];run.rewards=null;run.rerolls=0;return reward;
}
