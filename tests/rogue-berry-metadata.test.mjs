import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const quantities=rows=>({bound:rows.filter(m=>m.id==='berrysitrus'&&m.boxId==='hero'&&m.transferable===false).reduce((n,m)=>n+m.count,0),free:rows.filter(m=>m.id==='berrysitrus'&&m.boxId==='hero'&&m.transferable!==false).reduce((n,m)=>n+m.count,0)});
test('opponent Incinerate consumes the selected transferable berry, not a bound berry',async()=>{
 const hero=makeReferenceMon(151,100,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(150,20,{boxId:'foe',moves:['Incinerate']}),run={id:'berry-meta',seed:'berry-meta',wave:41,biome:1,rng:42,screen:'battle',party:[hero],modifiers:[{id:'berrysitrus',boxId:'hero',count:1,transferable:false},{id:'berrysitrus',boxId:'hero',count:1}],tools:{},balls:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[],berryMoveRule:'source-v1'};run.combat=createClassicCombat(run,[foe],{trainer:true});run.combat=playClassicCombat(run,{type:'move',move:'splash'});
 for(const ledger of [run.modifiers,run.combat.modifiers])assert.deepEqual(quantities(ledger),{bound:1,free:0});const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(quantities(saved.run.modifiers),{bound:1,free:0});assert.deepEqual(saved.other,{safe:true});assert.ok(restoreClassicNativeBattle(saved.run.combat,saved.run).p1.active[0]);
});
for(const [move,rule,value] of [['Teatime','berryTeatimeRule','source-subset-v1'],['Stuff Cheeks','berryStuffRule','source-v1']])test(`${move} consumes the selected berry row and preserves the other one`,async()=>{
 const hero=makeReferenceMon(151,100,{boxId:'hero',moves:[move]}),foe=makeReferenceMon(150,20,{boxId:'foe',moves:['Splash']}),run={id:'berry-choice',seed:'berry-choice',wave:41,biome:1,rng:42,screen:'battle',party:[hero],modifiers:[{id:'berrysitrus',boxId:'hero',count:1,transferable:false},{id:'berrysitrus',boxId:'hero',count:1}],tools:{},balls:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[],[rule]:value};run.combat=createClassicCombat(run,[foe],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run),sample=b.sample;b.sample=function(items){return items.length===2&&items.every(x=>x?.id==='berrysitrus')?items[1]:sample.call(this,items);};b.makeChoices('move 1','move 1');
 for(const ledger of [run.modifiers,run.combat.modifiers])assert.deepEqual(quantities(ledger),{bound:1,free:0});
});
