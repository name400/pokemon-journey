import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {hatchClassicEgg} from '../lib/rogue-egg-shop.mjs';
import {starterCatalog,registerStarterCaught} from '../lib/rogue-starter-system.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,classicCombatView,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('Skarmory cannot equip its locked egg move before the hatch unlock',async()=>{
 let doc={coins:0,collection:[],adventure:{safe:true}},state=ensureClassicState(doc,{initialStarterId:1});state.slots[1]={id:'other'};registerStarterCaught(state.system,makeReferenceMon(227,5,{boxId:'caught'}),{kind:'capture'});
 let entry=starterCatalog(state.system).find(e=>e.sourceId===227&&e.formIndex===0);assert.ok(entry?.unlocked);assert.ok(!entry.moves.includes('거수참'));const selection={id:entry.id,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:['거수참']};
 assert.throws(()=>startClassicRun(doc,[selection],{id:'locked-egg-move',seed:'locked-egg-move'}));assert.equal(state.slots[0],null);assert.deepEqual(state.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});
 doc=await decodeGameData(await encodeGameData(doc));state=doc.classic;entry=starterCatalog(state.system).find(e=>e.sourceId===227&&e.formIndex===0);assert.ok(!entry.moves.includes('거수참'));assert.throws(()=>startClassicRun(doc,[selection],{id:'locked-reload',seed:'locked-reload'}));assert.equal(state.slots[0],null);
});

test('Skarmory hatch unlocks its source egg move for a new run and real battle after reload',async()=>{
 let doc={coins:0,collection:[],adventure:{safe:true}},state=ensureClassicState(doc,{initialStarterId:1});state.slots[1]={id:'other'};state.system.eggs=[{id:'egg-test',productId:'rare',remainingWaves:0,paidPrice:0,pokemon:makeReferenceMon(227,5,{boxId:'egg'}),eggMoveIndex:1}];
 const hatch=hatchClassicEgg(doc,'egg-test');assert.equal(hatch.eggMove,'거수참');assert.equal(state.system.starterData[227].eggMask&2,2);
 doc=await decodeGameData(await encodeGameData(doc));state=doc.classic;const entry=starterCatalog(state.system).find(e=>e.sourceId===227&&e.formIndex===0);assert.ok(entry?.unlocked);assert.ok(entry.moves.includes('거수참'));
 const selection={id:entry.id,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:['거수참']};let run=startClassicRun(doc,[selection],{id:'egg-move-flow',seed:'egg-move-flow'});assert.deepEqual(run.party[0].moves,['거수참']);
 run.screen='battle';run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];const move=classicCombatView(run.combat).requests[0].actors[0].moves.find(m=>m.id==='behemothblade');assert.ok(move);assert.equal(move.pp,5);
 run.combat=playClassicCombat(run,{type:'move',move:'behemothblade'});run.party=run.combat.teams[0];assert.equal(run.party[0].pp.behemothblade,4);
 doc=await decodeGameData(await encodeGameData(doc));run=doc.classic.slots[0];assert.deepEqual(run.party[0].moves,['거수참']);assert.equal(run.party[0].pp.behemothblade,4);assert.equal(restoreClassicNativeBattle(run.combat,run).p1.active[0].moveSlots[0].pp,4);assert.equal(doc.classic.system.starterData[227].eggMask&2,2);assert.deepEqual(doc.classic.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});
});
