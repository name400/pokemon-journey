import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
const world={adventureEngine:'cloud'};
const ready=(mon,target,ctx=world)=>evolutionOptions(mon,ctx).find(x=>x.id===target&&x.trigger==='trade')?.ready;
test('new trade evolutions use the held item at trade and only one trade event',()=>{
 const base={...makeMon(95,30),tradeCount:1,item:'metalcoat',adventureTradeSpeciesId:95};
 assert.equal(ready({...base,adventureTradeV1:true,adventureTradeHeldItem:'',adventureTradeConsumed:false},208),false);
 assert.equal(ready({...base,adventureTradeV1:true,adventureTradeHeldItem:'metalcoat',adventureTradeConsumed:false},208),true);
 assert.equal(ready({...base,adventureTradeV1:true,adventureTradeHeldItem:'metalcoat',adventureTradeConsumed:true},208),false);
 assert.equal(ready({...base,adventureTradeV1:true,adventureTradeHeldItem:'metalcoat',item:''},208),false);
 assert.equal(ready(base,208),true,'legacy trade state remains usable');
 assert.equal(ready({...base,adventureTradeV1:true,adventureTradeHeldItem:''},208,{mode:'rogue'}),true,'other modes are unchanged');
 assert.equal(ready({...makeMon(64,30),tradeCount:1,adventureTradeV1:true,adventureTradeSpeciesId:64,adventureTradeHeldItem:'',adventureTradeConsumed:false},65),true);
 assert.equal(ready({...makeMon(64,30),tradeCount:1,adventureTradeV1:true,adventureTradeSpeciesId:64,adventureTradeHeldItem:'',adventureTradeConsumed:true},65),false);
 assert.equal(ready({...makeMon(64,30),tradeCount:1,adventureTradeV1:true,adventureTradeSpeciesId:63,adventureTradeHeldItem:'',adventureTradeConsumed:false},65),false,'trading Abra cannot unlock Kadabra trade evolution');
});
