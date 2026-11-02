import {Dex} from '@pkmn/sim';
import {rogueSpecies,makeReferenceMon} from './rogue-reference.mjs';
import {ensureClassicState} from './rogue-classic-state.mjs';
import {registerStarterCaught,starterProgress,starterDexEntry} from './rogue-starter-system.mjs';
const records=[...rogueSpecies.values()].filter(p=>p.isStarter);
const definitions=[
 {id:'common',name:'일반 포켓몬 알',price:12000,min:1,max:3,tier:0,description:'스타터 비용 1–3 포켓몬 중 한 마리. 기본 스타터와 중복될 수 있습니다.'},
 {id:'rare',name:'희귀 포켓몬 알',price:48000,min:4,max:5,tier:1,description:'스타터 비용 4–5 포켓몬 중 한 마리.'},
 {id:'epic',name:'에픽 포켓몬 알',price:160000,min:6,max:7,tier:2,description:'스타터 비용 6–7 포켓몬 중 한 마리.'},
 {id:'legendary',name:'전설 포켓몬 알',price:650000,min:8,max:10,tier:3,description:'스타터 비용 8–10 포켓몬 중 한 마리. 전설 등 높은 비용의 후보만 등장합니다.'},
 {id:'shiny',name:'색이 다른 포켓몬 알',price:240000,min:1,max:5,tier:2,shiny:true,description:'스타터 비용 1–5 후보 중 색이 다른 포켓몬 한 마리가 확정으로 부화합니다.'},
];
const pool=product=>records.filter(p=>p.starterCost>=product.min&&p.starterCost<=product.max);
const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
export function eggShopView(document){const state=ensureClassicState(document);return {wallet:Math.max(0,document.coins||0),products:definitions.map(p=>({...p,poolSize:pool(p).length,odds:100/pool(p).length,image:'/game/eggs/'+p.id+'.svg',featured:pool(p).slice(0,5).map(m=>({id:m.pokemonId,artId:m.artId,name:m.name,cost:m.starterCost}))})),eggs:(state.system.eggs||[]).map(({id,productId,purchasedAt})=>({id,productId,name:definitions.find(p=>p.id===productId)?.name||'포켓몬 알',image:'/game/eggs/'+productId+'.svg',purchasedAt})),history:(state.system.hatchHistory||[]).slice(0,12)};}
export function buyClassicEgg(document,{productId,expectedPrice},rng=random){
 const state=ensureClassicState(document),product=definitions.find(p=>p.id===productId);if(!product||expectedPrice!==product.price)throw Error('알 종류와 표시 가격을 확인하세요.');
 if((state.system.eggs||[]).length>=99)throw Error('알은 99개까지 보관할 수 있습니다. 먼저 부화시키세요.');if(!Number.isSafeInteger(document.coins)||document.coins<product.price)throw Error('알을 구매할 도전 코인이 부족합니다.');
 const candidates=pool(product),selected=candidates[Math.floor(rng()*candidates.length)],abilities=selected.abilities,ability=abilities[Math.floor(rng()*abilities.length)],ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,Math.max(Math.floor(rng()*32),Math.floor(rng()*32))]));
 const mon=makeReferenceMon(selected.sourceId,5,{boxId:crypto.randomUUID(),origin:'egg',ivs,nature:Dex.natures.all()[Math.floor(rng()*25)].id,ability:ability.key,rogueAbilitySlot:ability.slot,gender:selected.malePercent==null?'N':rng()*100<selected.malePercent?'M':'F',shiny:!!product.shiny||rng()<1/128});
 const egg={id:crypto.randomUUID(),productId,paidPrice:product.price,purchasedAt:Date.now(),pokemon:mon,eggMoveIndex:Math.floor(rng()*4)};document.coins-=product.price;state.system.eggs||=[];state.system.eggs.push(egg);return {eggId:egg.id,price:product.price};
}
export function hatchClassicEgg(document,id){
 const state=ensureClassicState(document),index=(state.system.eggs||[]).findIndex(e=>e.id===id);if(index<0)throw Error('부화할 알을 선택하세요.');const egg=state.system.eggs[index],mon=egg.pokemon;
 const previous=starterDexEntry(state.system,mon.rogueSourceId),duplicate=!!previous.registered,paidPrice=egg.paidPrice??definitions.find(p=>p.id===egg.productId)?.price??0,refund=duplicate?Math.floor(paidPrice*.25):0;
 const registration=registerStarterCaught(state.system,mon,{kind:'hatch'}),progress=starterProgress(state.system,mon.rogueSourceId);progress.eggMask|=1<<egg.eggMoveIndex;state.system.eggs.splice(index,1);document.coins=(document.coins||0)+refund;
 const result={id:egg.id,productId:egg.productId,hatchedAt:Date.now(),duplicate,refund,refundRate:.25,pokemon:{id:mon.id,artId:mon.artId,name:mon.name,shiny:mon.shiny,ivs:mon.ivs,nature:mon.nature,ability:mon.ability},...registration};state.system.hatchHistory||=[];state.system.hatchHistory.unshift(result);state.system.hatchHistory=state.system.hatchHistory.slice(0,100);return result;
}
