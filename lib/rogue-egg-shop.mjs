import {rollClassicEggTier,classicEggOdds,classicEggSpeciesWeight,MANAPHY_EGG_DENOMINATOR} from './rogue-egg-odds.mjs';
import {Dex} from '@pkmn/sim';
import {supportsShinyVariants,rollShinyVariant} from './rogue-wild-variants.mjs';
import {applyClassicEggForm} from './rogue-egg-forms.mjs';
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {rogueSpecies,makeReferenceMon,sourceMove} from './rogue-reference.mjs';
import {ensureClassicState} from './rogue-classic-state.mjs';
import {registerStarterCaught,starterProgress,starterDexEntry,SAME_SPECIES_EGG_COSTS} from './rogue-starter-system.mjs';
const records=[...rogueSpecies.values()].filter(p=>p.isStarter);
const definitions=[
 {id:'common',name:'일반 포켓몬 알',price:12000,min:1,max:3,tier:0,description:'스타터 비용 1–3 포켓몬 중 한 마리. 기본 스타터와 중복될 수 있습니다.'},
 {id:'rare',name:'희귀 포켓몬 알',price:48000,min:4,max:5,tier:1,description:'스타터 비용 4–5 포켓몬 중 한 마리.'},
 {id:'epic',name:'에픽 포켓몬 알',price:160000,min:6,max:7,tier:2,description:'스타터 비용 6–7 포켓몬 중 한 마리.'},
 {id:'legendary',name:'전설 포켓몬 알',price:650000,min:8,max:10,tier:3,description:'스타터 비용 8–10 포켓몬 중 한 마리. 전설 등 높은 비용의 후보만 등장합니다.'},
 {id:'shiny',name:'색이 다른 포켓몬 알',price:240000,min:1,max:5,tier:2,shiny:true,description:'스타터 비용 1–5 후보 중 색이 다른 포켓몬 한 마리가 확정으로 부화합니다.'},
 {id:'manaphy',name:'마나피의 알',price:12000,min:6,max:7,tier:2},
];
const pools=new Map([0,1,2,3].map(tier=>[tier,records.filter(p=>p.eggTier===tier&&![489,490,890].includes(p.sourceId))]));
const pool=product=>pools.get(product.tier)||[];
let cachedLegendaryDay=null,cachedLegendary=null;
export function legendaryPickupOptions(){return pool(definitions[3]).map(p=>({sourceId:p.sourceId,id:p.pokemonId,artId:p.artId,name:p.name})).sort((a,b)=>a.sourceId-b.sourceId);}
function pickupLegendary(sourceId){if(sourceId==null)return dailyLegendary();return pool(definitions[3]).find(p=>p.sourceId===sourceId)||dailyLegendary();}
function dailyLegendary(now=Date.now()){
 const day=Math.floor(now/86400000);if(day===cachedLegendaryDay)return cachedLegendary;const candidates=[...pool(definitions[3])].sort((a,b)=>a.sourceId-b.sourceId);if(!candidates.length)return null;
 const cycle=Math.floor(day/candidates.length),position=day%candidates.length;
 const seed=[...'1073741824'].map(char=>String.fromCharCode(char.charCodeAt(0)+cycle)).join(''),rng=rogueSeededRandom(seed);
 for(let remaining=candidates.length;remaining>1;remaining--){const selected=Math.floor(rng()*remaining),last=remaining-1;[candidates[selected],candidates[last]]=[candidates[last],candidates[selected]];}
 cachedLegendaryDay=day;cachedLegendary=candidates[position];return cachedLegendary;
}
function chooseEggSpecies(system,product,eggs,rng,variant=0){
 let candidates=pool(product);const tier=product.tier;system.eggUnlockPity||=[0,0,0,0];const owned=p=>!!system.dex?.[p.sourceId]?.registered||eggs.some(e=>e.pokemon?.rogueSourceId===p.sourceId);
 if(system.eggUnlockPity[tier]>=9){const locked=candidates.filter(p=>!owned(p));if(locked.length)candidates=locked;}
 if(variant){const supported=candidates.filter(p=>supportsShinyVariants(p.sourceId));if(supported.length)candidates=supported;}
 if(!candidates.length)throw Error('해당 등급의 알 후보가 없습니다.');
 const min=product.min,max=tier===3?9:product.max;const weights=candidates.map(p=>classicEggSpeciesWeight(p,(((max-Math.max(min,Math.min(max,p.starterCost)))/(max-min+1))*1.5+1)*100));let pick=Math.floor(rng()*weights.reduce((a,b)=>a+b,0)),selected=candidates[0];for(let i=0;i<candidates.length;i++){pick-=weights[i];if(pick<0){selected=candidates[i];break;}}
 system.eggUnlockPity[tier]=owned(selected)?Math.min((system.eggUnlockPity[tier]||0)+1,10):0;return selected;
}
const hatchWaves={common:10,rare:25,epic:50,legendary:100,shiny:50,manaphy:50};
const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const voucherTypes={regular:{name:'알 교환권',pulls:1},plus:{name:'알 교환권 플러스',pulls:5},premium:{name:'알 교환권 프리미엄',pulls:10},golden:{name:'알 교환권 골드',pulls:25}};
const machines=[{id:'move',name:'기술 UP',description:'희귀 유전기 출현 확률 상승'},{id:'legendary',name:'전설 UP',description:'전설 등급 알 출현 확률 상승'},{id:'shiny',name:'색이 다른 모습 UP',description:'색이 다른 모습 출현 확률 상승'}];
function voucherState(system){system.vouchers||={};for(const k of Object.keys(voucherTypes))if(!Number.isSafeInteger(system.vouchers[k])||system.vouchers[k]<0)system.vouchers[k]=0;return system.vouchers;}
export function grantClassicVoucher(system,type,amount=1){const counts=voucherState(system);if(!Object.hasOwn(voucherTypes,type)||!Number.isSafeInteger(amount)||amount<1)throw Error('교환권 종류를 확인하세요.');counts[type]+=amount;}
export function awardClassicVouchers(system,run){
 voucherState(system);system.voucherWins||={};run.voucherRewardWaves||=[];if(run.voucherRewardWaves.includes(run.wave))return;
 const rewards=[],trainer=run.encounter?.trainer;
 if(trainer&&(trainer.hasVoucher||['gym','elite','champion'].includes(run.encounter.kind))){const key='trainer:'+trainer.id,first=trainer.moneyMultiplier>=10?'premium':'plus',type=system.voucherWins[key]?(first==='premium'?'plus':'regular'):first;grantClassicVoucher(system,type);system.voucherWins[key]=true;rewards.push(voucherTypes[type].name);}
 if(run.wave===200){const key='classic-victory',type=system.voucherWins[key]?'premium':'golden';grantClassicVoucher(system,type);system.voucherWins[key]=true;rewards.push(voucherTypes[type].name);system.classicRibbonSpecies||={};for(const mon of run.party||[]){const record=rogueSpecies.get(mon.rogueSourceId),root=record?.starterId??record?.sourceId;if(root==null||system.classicRibbonSpecies[root])continue;system.classicRibbonSpecies[root]=true;grantClassicVoucher(system,'plus');rewards.push(voucherTypes.plus.name);}}
 if(rewards.length)run.lastVoucherReward={name:rewards.join(' · '),wave:run.wave};run.voucherRewardWaves.push(run.wave);
}
/** @param {any} document @param {{pickupSourceId?:number|null}} [options] */
export function eggShopView(document,{pickupSourceId=null}={}){const state=ensureClassicState(document);return {baseOdds:Object.fromEntries(machines.map(m=>[m.id,classicEggOdds(m.id)])),mythicalWeightMultiplier:.5,manaphyDenominator:MANAPHY_EGG_DENOMINATOR,pickupOverride:pickupSourceId!==null,pendingEventEggCount:state.system.pendingEventEggs?.length||0,blockedReason:!state.selection&&state.slots[state.activeSlot]?.screen==='reward'?'웨이브 보상을 먼저 선택해 주세요.':null,wallet:Math.max(0,document.coins||0),vouchers:voucherState(state.system),pity:Object.fromEntries(['rare','epic','legendary'].map(key=>[key,Number.isSafeInteger(state.system.eggPity?.[key])?Math.max(0,state.system.eggPity[key]):0])),voucherTypes,machines:machines.map(m=>m.id==='legendary'?{...m,featured:(()=>{const p=pickupLegendary(pickupSourceId);return p?{id:p.pokemonId,sourceId:p.sourceId,artId:p.artId,name:p.name}:null;})()}:m),eggs:(state.system.eggs||[]).map(({id,productId,purchasedAt,remainingWaves,source,descriptor})=>({id,productId,name:(definitions.find(p=>p.id===productId)?.name||'포켓몬 알')+(source==='event'&&descriptor?' · '+descriptor:''),image:'/game/eggs/'+productId+'.svg',purchasedAt,remainingWaves:Number.isInteger(remainingWaves)?remainingWaves:(hatchWaves[productId]||10)})),history:(state.system.hatchHistory||[]).slice(0,12)};}
/** @param {any} document @param {any} payload @param {()=>number} [rng] @param {{pickupSourceId?:number|null}} [options] */
export function drawClassicEggs(document,{machineId,voucherType,quantity=1,expectedFeaturedId},rng=random,{pickupSourceId=null}={}){
 const state=ensureClassicState(document),machine=machines.find(m=>m.id===machineId),ticket=Object.hasOwn(voucherTypes,voucherType)?voucherTypes[voucherType]:null,counts=voucherState(state.system),featured=pickupLegendary(pickupSourceId);
 if(!machine||!ticket||![1,10].includes(quantity)||quantity===10&&voucherType!=='regular')throw Error('뽑기 기계와 교환권을 확인하세요.');
 if(machineId==='legendary'&&featured&&expectedFeaturedId!==featured.sourceId)throw Error('전설 픽업이 갱신되었습니다. 다시 확인하세요.');
 const pulls=ticket.pulls*quantity;if(counts[voucherType]<quantity)throw Error('사용할 알 교환권이 부족합니다.');
 state.system.eggs||=[];if(state.system.eggs.length+pulls>99)throw Error('알은 99개까지 보관할 수 있습니다. 먼저 부화시키세요.');
 const eggs=[];state.system.eggPity||={rare:0,epic:0,legendary:0};const pity=state.system.eggPity;for(let i=0;i<pulls;i++){
  const shiny=rng()<(machineId==='shiny'?1/64:1/128),rolledVariant=shiny?rollShinyVariant(rng):0;
  const guaranteed=pulls===25?2:pulls===10?1:0,hasGuaranteed=eggs.some(egg=>egg.productId!=='manaphy'&&(definitions.find(product=>product.id===egg.productId)?.tier??0)>=guaranteed),forcedTier=i===pulls-1&&guaranteed>0&&!hasGuaranteed?guaranteed:null,roll=forcedTier===null?rollClassicEggTier(rng(),machineId):null,offset=machineId==='legendary'?1:0;pity.rare=(pity.rare||0)+1;pity.epic=(pity.epic||0)+1;pity.legendary=(pity.legendary||0)+1+offset;let tier=forcedTier??roll;if(tier===0){if(pity.legendary>=412)tier=3;else if(pity.epic>=59)tier=2;else if(pity.rare>=9)tier=1;}if(tier>0)pity[['','rare','epic','legendary'][tier]]=0;const manaphy=tier===0&&rng()<1/MANAPHY_EGG_DENOMINATOR,product=manaphy?definitions[5]:definitions[tier],selected=manaphy?(rogueSpecies.get(rng()<1/8?490:489)||chooseEggSpecies(state.system,product,[...state.system.eggs,...eggs],rng,rolledVariant)):tier===3&&machineId==='legendary'&&rng()<.5?(featured||chooseEggSpecies(state.system,product,[...state.system.eggs,...eggs],rng,rolledVariant)):chooseEggSpecies(state.system,product,[...state.system.eggs,...eggs],rng,rolledVariant),abilities=selected.abilities,hidden=abilities.find(a=>a.slot==='hidden'),normal=abilities.filter(a=>a.slot!=='hidden'),ability=hidden&&rng()<1/192?hidden:(normal.length?normal[Math.floor(rng()*normal.length)]:abilities[0]),ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,Math.max(Math.floor(rng()*32),Math.floor(rng()*32))]));
  const mon=applyClassicEggForm(makeReferenceMon(selected.sourceId,5,{boxId:crypto.randomUUID(),origin:'egg',ivs,nature:Dex.natures.all()[Math.floor(rng()*25)].id,ability:ability.key,rogueAbilitySlot:ability.slot,gender:selected.malePercent==null?'N':rng()*100<selected.malePercent?'M':'F',shiny,variant:supportsShinyVariants(selected.sourceId)?rolledVariant:0}),selected,rng);
  const rareMoveRates=machineId==='move'?[12,8,6,4]:[36,24,12,6],validMoves=(selected.eggMoves||[]).map((move,index)=>sourceMove(move)?index:null).filter(index=>index!==null),ordinary=validMoves.filter(index=>index<3),rare=validMoves.includes(3),eggMoveIndex=rare&&rng()<1/rareMoveRates[manaphy?2:tier]?3:ordinary.length?ordinary[Math.floor(rng()*ordinary.length)]:rare?3:null;eggs.push({id:crypto.randomUUID(),productId:product.id,remainingWaves:hatchWaves[product.id],paidPrice:12000,purchasedAt:Date.now(),pokemon:mon,eggMoveIndex,machineId,voucherType});
 }
 for(let i=eggs.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[eggs[i],eggs[j]]=[eggs[j],eggs[i]];}
 counts[voucherType]-=quantity;state.system.eggs.push(...eggs);return {count:pulls,machineId,eggs:eggs.map(egg=>({id:egg.id,productId:egg.productId,name:definitions.find(product=>product.id===egg.productId)?.name||'포켓몬 알',image:'/game/eggs/'+egg.productId+'.svg'}))};
}
// Event eggs have a fixed tier and do not increment gacha pull/tier pity.
// The per-run award key remains after hatching to prevent duplicate grants.
export function grantClassicEventEgg(document,run,{tier,awardKey,descriptor='이벤트 알'},rng=random){
 const state=ensureClassicState(document),system=state.system;
 if(!['common','rare','epic'].includes(tier)||typeof awardKey!=='string'||!awardKey||typeof descriptor!=='string')throw Error('이벤트 알 정보를 확인하세요.');
 if(run.eventEggAwards?.[awardKey])return {eggId:run.eventEggAwards[awardKey],alreadyGranted:true};
 const existing=system.eggs||[],queued=(system.pendingEventEggs||[]);
 const product=definitions.find(p=>p.id===tier),shiny=rng()<1/128,rolledVariant=shiny?rollShinyVariant(rng):0,selected=chooseEggSpecies(system,product,[...existing,...queued],rng,rolledVariant),abilities=selected.abilities,hidden=abilities.find(a=>a.slot==='hidden'),normal=abilities.filter(a=>a.slot!=='hidden'),ability=hidden&&rng()<1/192?hidden:(normal.length?normal[Math.floor(rng()*normal.length)]:abilities[0]);
 const ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,Math.max(Math.floor(rng()*32),Math.floor(rng()*32))]));
 const mon=applyClassicEggForm(makeReferenceMon(selected.sourceId,5,{boxId:crypto.randomUUID(),origin:'egg',ivs,nature:Dex.natures.all()[Math.floor(rng()*25)].id,ability:ability.key,rogueAbilitySlot:ability.slot,gender:selected.malePercent==null?'N':rng()*100<selected.malePercent?'M':'F',shiny,variant:supportsShinyVariants(selected.sourceId)?rolledVariant:0}),selected,rng);
 const valid=(selected.eggMoves||[]).map((move,index)=>sourceMove(move)?index:null).filter(index=>index!==null),ordinary=valid.filter(index=>index<3),rare=valid.includes(3),rates=[36,24,12,6],eggMoveIndex=rare&&rng()<1/rates[product.tier]?3:ordinary.length?ordinary[Math.floor(rng()*ordinary.length)]:rare?3:null;
 const egg={id:crypto.randomUUID(),productId:tier,remainingWaves:hatchWaves[tier],paidPrice:0,purchasedAt:Date.now(),pokemon:mon,eggMoveIndex,source:'event',descriptor};
 if(existing.length<99)system.eggs=[...existing,egg];else system.pendingEventEggs=[...queued,egg];run.eventEggAwards||={};run.eventEggAwards[awardKey]=egg.id;return {eggId:egg.id,alreadyGranted:false,queued:existing.length>=99};
}
// Candy eggs preserve existing egg objects, vouchers, and account currency.
export function buyClassicSpeciesEgg(document,{sourceId,expectedCost},rng=random){
 const system=ensureClassicState(document).system,record=rogueSpecies.get(sourceId),cost=record&&SAME_SPECIES_EGG_COSTS[record.starterCost-1];
 if(!Number.isSafeInteger(sourceId)||!record?.isStarter||!system.dex?.[sourceId]?.registered)throw Error('해금한 스타터를 선택하세요.');
 if(!cost||expectedCost!==cost)throw Error('사탕 비용을 다시 확인하세요.');
 const eggs=system.eggs||[];if(eggs.length>=99)throw Error('알은 99개까지 보관할 수 있습니다.');
 const existing=system.starterData?.[sourceId];if(!Number.isSafeInteger(existing?.candies)||existing.candies<cost)throw Error('스타터 사탕이 부족합니다.');
 const pity=[...(existing.sameSpeciesEggPity||[0,0])];if(pity.length!==2||pity.some(n=>!Number.isSafeInteger(n)||n<0))throw Error('알 누적 기록을 확인하세요.');
 pity[0]++;const chance=pity[0]<=15?1/12:pity[0]>=21?1:1/12+(pity[0]-15)/6*(11/12),shiny=rng()<chance;if(shiny)pity[0]=0;
 const dex=system.dex[sourceId],mask=Number.isInteger(dex.shinyVariantMask)?dex.shinyVariantMask:dex.shiny?1<<Math.max(0,Math.min(2,dex.highestShinyVariant||0)):0;
 const pending=new Set([...eggs,...(system.pendingEventEggs||[])].filter(e=>e.pokemon?.rogueSourceId===sourceId&&e.pokemon?.shiny).map(e=>e.pokemon.variant||0));
 const missing=supportsShinyVariants(sourceId)?[1,2].filter(v=>!(mask&(1<<v))&&!pending.has(v)):[];let variant=0;
 if(shiny){if(missing.length)pity[1]++;if(missing.length&&pity[1]>=11){variant=missing.length===2?(rng()<.25?2:1):missing[0];pity[1]=0;}else{variant=supportsShinyVariants(sourceId)?rollShinyVariant(rng):0;if(missing.includes(variant))pity[1]=0;}}
 const chosen=sourceId===489&&rng()<1/8?(rogueSpecies.get(490)||record):record,tier=Math.max(0,Math.min(3,record.eggTier||0)),abilities=chosen.abilities,hidden=abilities.find(a=>a.slot==='hidden'),normal=abilities.filter(a=>a.slot!=='hidden'),ability=hidden&&rng()<1/8?hidden:(normal[Math.floor(rng()*normal.length)]||abilities[0]);
 const ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,Math.max(Math.floor(rng()*32),Math.floor(rng()*32))]));
 const mon=applyClassicEggForm(makeReferenceMon(chosen.sourceId,5,{boxId:crypto.randomUUID(),origin:'egg',ivs,nature:Dex.natures.all()[Math.floor(rng()*25)].id,ability:ability.key,rogueAbilitySlot:ability.slot,gender:chosen.malePercent==null?'N':rng()*100<chosen.malePercent?'M':'F',shiny,variant}),chosen,rng);
 const productId=[489,490].includes(sourceId)?'manaphy':['common','rare','epic','legendary'][tier],valid=(chosen.eggMoves||[]).map((move,index)=>sourceMove(move)?index:null).filter(index=>index!==null),ordinary=valid.filter(index=>index<3),rare=valid.includes(3),rates=[12,8,6,4],eggMoveIndex=rare&&rng()<1/rates[productId==='manaphy'?2:tier]?3:ordinary.length?ordinary[Math.floor(rng()*ordinary.length)]:rare?3:null;
 const egg={id:crypto.randomUUID(),productId,remainingWaves:hatchWaves[productId],paidPrice:0,purchasedAt:Date.now(),pokemon:mon,eggMoveIndex,source:'candy',speciesId:sourceId};
 existing.candies-=cost;existing.sameSpeciesEggPity=pity;system.eggs=[...eggs,egg];return {eggId:egg.id,spent:cost};
}
export function hatchClassicEgg(document,id){
 const state=ensureClassicState(document),index=(state.system.eggs||[]).findIndex(e=>e.id===id);if(index<0)throw Error('부화할 알을 선택하세요.');const egg=state.system.eggs[index],mon=egg.pokemon;
 const previous=starterDexEntry(state.system,mon.rogueSourceId),duplicate=!!previous.registered&&previous.forms.includes(mon.rogueFormIndex||0)&&(!mon.shiny||previous.shiny),paidPrice=egg.paidPrice??definitions.find(p=>p.id===egg.productId)?.price??0,refund=duplicate?Math.floor(paidPrice*.25):0;
 const registration=registerStarterCaught(state.system,mon,{kind:'hatch'}),progress=starterProgress(state.system,mon.rogueSourceId),source=rogueSpecies.get(mon.rogueSourceId),eggMove=Number.isInteger(egg.eggMoveIndex)?sourceMove(source?.eggMoves?.[egg.eggMoveIndex]):null;if(eggMove)progress.eggMask|=1<<egg.eggMoveIndex;state.system.eggs.splice(index,1);document.coins=(document.coins||0)+refund;
 const result={id:egg.id,productId:egg.productId,hatchedAt:Date.now(),duplicate,refund,eggMove,refundRate:.25,pokemon:{id:mon.id,artId:mon.artId,name:mon.name,rogueSourceId:mon.rogueSourceId,rogueFormIndex:mon.rogueFormIndex,shiny:mon.shiny,variant:mon.variant??0,ivs:mon.ivs,nature:mon.nature,ability:mon.ability},...registration};state.system.hatchHistory||=[];state.system.hatchHistory.unshift(result);state.system.hatchHistory=state.system.hatchHistory.slice(0,100);return result;
}

export function lapseClassicEggs(document,run){
 if(run.wave>=200)return;run.eggLapseWaves||=[];if(run.eggLapseWaves.includes(run.wave))return;
 const state=ensureClassicState(document);state.system.pendingHatches||=[];const ready=[];for(const egg of state.system.eggs||[]){if(!Number.isInteger(egg.remainingWaves))egg.remainingWaves=hatchWaves[egg.productId]||10;egg.remainingWaves=Math.max(0,egg.remainingWaves-1);if(!egg.remainingWaves)ready.push(egg.id);}
 for(const id of ready)state.system.pendingHatches.push(hatchClassicEgg(document,id));if(state.system.pendingEventEggs?.length){const available=Math.max(0,99-state.system.eggs.length),pending=state.system.pendingEventEggs;state.system.eggs.push(...pending.slice(0,available));state.system.pendingEventEggs=pending.slice(available);}run.eggLapseWaves.push(run.wave);
}
export function acknowledgeClassicHatch(document,id){const system=ensureClassicState(document).system;system.pendingHatches||=[];if(!system.pendingHatches.length||system.pendingHatches[0].id!==id)throw Error('확인할 부화 결과가 변경되었습니다.');system.pendingHatches.shift();}

export function acknowledgeClassicHatches(document,ids){const system=ensureClassicState(document).system;system.pendingHatches||=[];const pending=system.pendingHatches;if(!Array.isArray(ids)||!pending.length||ids.length!==pending.length||ids.some((id,index)=>typeof id!=='string'||id!==pending[index].id))throw Error('부화 결과가 변경되었습니다. 다시 확인하세요.');system.pendingHatches=[];return {count:ids.length};}
