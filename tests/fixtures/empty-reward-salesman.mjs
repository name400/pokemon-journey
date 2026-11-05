import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {ensureClassicState} from '../../lib/rogue-classic-state.mjs';
import {classicSalesmanOffer} from '../../lib/rogue-pokemon-salesman.mjs';
export function salesmanFixture({fullParty=false}={}){
 const doc={coins:77,adventure:{safe:true}},state=ensureClassicState(doc),run={id:'empty-reward-salesman',seed:'sales',rng:123456789,wave:23,biome:4,screen:'mystery',party:Array.from({length:fullParty?6:1},(_,i)=>makeReferenceMon(7,50,{boxId:'hero-'+i,moves:['Tackle']})),modifiers:[],tools:{},balls:{},money:100000,mystery:{type:'pokemon-salesman',stage:'choose'},mysteryState:{spawnWeight:3,history:[]},encounter:{kind:'mystery',key:'pokemon-salesman'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],rewards:[]};run.mystery.offer=classicSalesmanOffer(run);state.slots[0]=run;state.slots[1]={id:'other',untouched:true};return {doc,run};
}
