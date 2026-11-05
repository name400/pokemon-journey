import {classicShopAllowed,classicReviveItemAllowed} from './rogue-challenge-rules.mjs';
import {sourceSpeciesFor,sourceMove,rogueSpecies,rogueForms} from './rogue-reference.mjs';
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';
import {classicWaveMoney,classicShopCost} from './rogue-classic-rules.mjs';
import {spendClassicMoney} from './rogue-classic-state.mjs';

const image=id=>'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+id+'.png';
const services=[
 {id:'potion',name:'상처약',image:image('potion'),wave:1,multiplier:.2,description:'HP 20 또는 최대 HP의 10% 중 큰 값 회복',kind:'heal',amount:20,percent:.1},
 {id:'ether',name:'PP에이드',image:image('ether'),wave:1,multiplier:.4,description:'선택한 기술의 PP를 10 회복',kind:'pp',amount:10,requiresMove:true},
 {id:'revive',name:'기력의조각',image:image('revive'),wave:1,multiplier:2,description:'쓰러진 포켓몬을 최대 HP의 50%로 회복',kind:'revive',percent:.5},
 {id:'superpotion',name:'좋은상처약',image:image('super-potion'),wave:21,multiplier:.45,description:'HP 50 또는 최대 HP의 25% 중 큰 값 회복',kind:'heal',amount:50,percent:.25},
 {id:'fullheal',name:'만병통치제',image:image('full-heal'),wave:21,multiplier:1,description:'상태이상을 모두 치료',kind:'status'},
 {id:'elixir',name:'PP에이더',image:image('elixir'),wave:51,multiplier:1,description:'모든 기술의 PP를 10 회복',kind:'ppall',amount:10},
 {id:'maxether',name:'PP회복',image:image('max-ether'),wave:51,multiplier:1,description:'선택한 기술의 PP를 전부 회복',kind:'pp',amount:Infinity,requiresMove:true},
 {id:'hyperpotion',name:'고급상처약',image:image('hyper-potion'),wave:81,multiplier:.8,description:'HP 200 또는 최대 HP의 50% 중 큰 값 회복',kind:'heal',amount:200,percent:.5},
 {id:'maxrevive',name:'기력의덩어리',image:image('max-revive'),wave:81,multiplier:2.75,description:'쓰러진 포켓몬의 HP를 전부 회복',kind:'revive',percent:1},
 {id:'memorymushroom',name:'기억버섯',image:image('big-mushroom'),wave:81,multiplier:4,description:'잊은 기술 한 개를 다시 배웁니다',kind:'memory',requiresReplace:true,requiresNewMove:true},
 {id:'maxpotion',name:'풀회복약',image:image('max-potion'),wave:111,multiplier:1.5,description:'HP를 전부 회복',kind:'heal',percent:1},
 {id:'maxelixir',name:'PP맥스',image:image('max-elixir'),wave:111,multiplier:2.5,description:'모든 기술의 PP를 전부 회복',kind:'ppall',amount:Infinity},
 {id:'fullrestore',name:'회복약',image:image('full-restore'),wave:141,multiplier:2.25,description:'HP와 상태이상을 모두 회복',kind:'restore'},
 {id:'sacredash',name:'성스러운분말',image:image('sacred-ash'),wave:171,multiplier:10,description:'쓰러진 파티 포켓몬 모두의 HP를 전부 회복',kind:'ash',requiresTarget:false},
];
export const CLASSIC_SERVICE_TYPES=Object.freeze(services);
export function classicMaxPP(mon,index){const name=mon.moves[index],move=Dex.moves.get(moves[name]?.key||name);if(!move.exists)return 0;const override=mon.roguePPMax?.[move.id];if(Number.isInteger(override)&&override>0&&override<=99)return override;return move.noPPBoosts?move.pp:Math.floor(move.pp*(1+.2*Math.min(3,Math.max(0,mon.roguePPUps?.[move.id]||0))));}
export function classicRemainingPP(mon,index){const key=moves[mon.moves[index]]?.key||Dex.moves.get(mon.moves[index]).id,max=classicMaxPP(mon,index),slot=(mon.rogueSketchRule==='source-v1'||mon.rogueTrainerSketch==='source-v1')?mon.rogueSketchPP?.[index]:undefined,value=Number.isInteger(slot)?slot:mon.pp?.[key];return Number.isInteger(value)?Math.max(0,Math.min(max,value)):max;}
export function classicRelearnMoves(mon,system=null){const names=new Set(mon.rogueMoveHistory||[]),seen=new Set();let record=sourceSpeciesFor(mon),first=true;while(record&&!seen.has(record.sourceId)){seen.add(record.sourceId);const form=first?record.formList.find(f=>f.formIndex===(mon.rogueFormIndex??rogueForms.get(Number(mon.id))?.formIndex??0)):null;const rows=[...(record.levelMoves||[]),...(record.formLevelMoves?.[form?.formKey||'']||[])];for(const [level,id]of rows)if(level<=mon.level){const name=sourceMove(id);if(name)names.add(name);}first=false;record=rogueSpecies.get(record.preEvolutionId??record.preEvolutionIds?.[0]);}if(system&&(mon.rogueMetBiome===-1||mon.origin==='starter')){const source=sourceSpeciesFor(mon),starter=rogueSpecies.get(source?.starterId??source?.sourceId)||source,mask=system.starterData?.[starter?.sourceId]?.eggMask||0;for(const [i,id]of(starter?.eggMoves||[]).entries())if(mask&(1<<i)){const name=sourceMove(id);if(name)names.add(name);}}for(const name of mon.rogueUsedTMs||[])names.add(name);return [...names].filter(name=>!mon.moves.includes(name));}
function eligible(mon,item,system=null){if(item.kind==='revive')return mon.hp<=0;if(item.kind==='pp'||item.kind==='ppall')return mon.moves.some((_,i)=>classicRemainingPP(mon,i)<classicMaxPP(mon,i));if(item.kind==='memory')return classicRelearnMoves(mon,system).length>0;if(mon.hp<=0)return false;if(item.kind==='status')return !!mon.status;if(item.kind==='restore')return mon.hp<mon.maxHp||!!mon.status;return mon.hp<mon.maxHp;}
function targetView(mon,item,system){const ok=eligible(mon,item,system);return {boxId:mon.boxId,name:mon.name,hp:mon.hp,maxHp:mon.maxHp,eligible:ok,learnableMoves:item.kind==='memory'?classicRelearnMoves(mon,system):undefined,reason:ok?'':mon.hp<=0?'쓰러진 포켓몬입니다.':'지금 사용할 필요가 없습니다.',moves:mon.moves.map((name,index)=>name?{index,name,pp:classicRemainingPP(mon,index),maxPp:classicMaxPP(mon,index)}:null).filter(Boolean)};}
export function classicServices(run,{costMultiplier=1,system=null,reward=false}={}){
 if(run.wave%10===0||!reward&&!classicShopAllowed(run))return [];
 const base=classicWaveMoney(run.wave);
 return services.filter(item=>run.wave>=item.wave&&classicReviveItemAllowed(run,item.id)).map(item=>({id:item.id,name:item.name,description:item.description,image:item.image,price:classicShopCost(run,Math.round(base*item.multiplier*costMultiplier)),requiresTarget:item.requiresTarget!==false,requiresMove:!!item.requiresMove,requiresReplace:!!item.requiresReplace,requiresNewMove:!!item.requiresNewMove,targets:run.party.map(p=>targetView(p,item,system)),disabledReason:item.kind==='ash'?!run.party.some(p=>p.hp<=0)?'쓰러진 포켓몬이 없습니다.':undefined:!run.party.some(p=>eligible(p,item,system))?'사용할 대상이 없습니다.':undefined}));
}
export function restoreClassicParty(party,itemId,{boxId,moveIndex,moveName,replaceIndex,system=null,healingCharms=0,run=null}={}){
 if(!classicReviveItemAllowed(run,itemId))throw Error('영구 기절 챌린지에서는 부활할 수 없습니다.');
 const item=services.find(p=>p.id===itemId);if(!item)throw Error('지원하지 않는 회복 도구입니다.');const next=structuredClone(party),target=next.find(p=>p.boxId===boxId);
 if(item.kind==='ash'){if(!next.some(p=>p.hp<=0))throw Error('쓰러진 포켓몬이 없습니다.');for(const p of next)if(p.hp<=0){p.hp=p.maxHp;p.status=null;p.rogueStatusState=null;}return next;}
 if(!target||!eligible(target,item,system))throw Error('도구를 사용할 포켓몬을 확인하세요.');
 if(item.kind==='heal')target.hp=Math.min(target.maxHp,target.hp+Math.max(Math.floor((item.amount||0)*(1+.1*Math.min(5,Math.max(0,healingCharms)))),Math.floor(target.maxHp*(item.percent||0))));
 if(item.kind==='revive'){target.hp=Math.max(1,Math.floor(target.maxHp*item.percent));target.status=null;target.rogueStatusState=null;}
 if(item.kind==='status'){target.status=null;target.rogueStatusState=null;}
 if(item.kind==='restore'){target.hp=target.maxHp;target.status=null;target.rogueStatusState=null;}
 if(item.kind==='pp'||item.kind==='ppall'){
  const indices=item.kind==='pp'?[moveIndex]:target.moves.map((_,i)=>i);
  if(indices.some(i=>!Number.isInteger(i)||i<0||i>=target.moves.length))throw Error('PP를 회복할 기술을 선택하세요.');
  if(!indices.some(i=>classicRemainingPP(target,i)<classicMaxPP(target,i)))throw Error('이미 PP가 가득 찼습니다.');target.pp||={};
  for(const i of indices){const key=moves[target.moves[i]]?.key||Dex.moves.get(target.moves[i]).id;const value=Math.min(classicMaxPP(target,i),classicRemainingPP(target,i)+item.amount);target.pp[key]=value;if(Array.isArray(target.rogueSketchPP))target.rogueSketchPP[i]=value;}
 }
 if(item.kind==='memory'){
  target.moves=target.moves.filter(Boolean);const slot=target.moves.length<4?target.moves.length:replaceIndex;if(!Number.isInteger(slot)||slot<0||slot>3||!classicRelearnMoves(target,system).includes(moveName)||target.moves.includes(moveName))throw Error('다시 배울 기술과 교체할 자리를 확인하세요.');
  target.pp||={};if(target.moves[slot]){target.rogueMoveHistory=[...new Set([...(target.rogueMoveHistory||[]),...target.moves])];const oldKey=moves[target.moves[slot]]?.key||Dex.moves.get(target.moves[slot]).id;delete target.pp[oldKey];if(target.roguePPUps)delete target.roguePPUps[oldKey];}target.moves[slot]=moveName;target.moves=target.moves.filter(Boolean);const key=moves[moveName]?.key||Dex.moves.get(moveName).id;if(target.roguePPUps)delete target.roguePPUps[key];target.pp[key]=classicMaxPP(target,target.moves.indexOf(moveName));if(Array.isArray(target.rogueSketchPP))target.rogueSketchPP[slot]=target.pp[key];
 }
 return next;
}
export function buyClassicService(run,payload,options={}){
 if(run.screen!=='reward')throw Error('전투 후 보급 화면에서 이용하세요.');const item=classicServices(run,options).find(p=>p.id===payload.itemId);if(!item)throw Error('지금 구매할 수 없는 도구입니다.');
 if(item.disabledReason)throw Error(item.disabledReason);const next=restoreClassicParty(run.party,item.id,{...payload,run,system:options.system,healingCharms:(run.modifiers||[]).filter(m=>m.id==='healingcharm').reduce((sum,m)=>sum+(m.count||0),0)});
 spendClassicMoney(run,item.price,payload.expectedPrice);run.party=next;run.log=[item.name+'을(를) 사용했다.'];return {itemId:item.id,price:item.price};
}
