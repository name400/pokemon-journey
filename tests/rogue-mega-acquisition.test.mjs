import assert from 'node:assert/strict';
import {test} from 'node:test';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog,registerStarterCaught} from '../lib/rogue-starter-system.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,captureClassicCombat,playClassicCombat,classicCombatView,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {CLASSIC_REWARD_REGISTRY,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

test('starter and captured Charizard stay normal until a battle Mega command',async()=>{
 let doc={adventure:{safe:true}},state=ensureClassicState(doc,{initialStarterId:4});state.slots[1]={id:'other'};
 const entry=starterCatalog(state.system).find(p=>p.id===4),selection={id:4,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves};
 let run=startClassicRun(doc,[selection],{id:'mega-acquisition',seed:'mega-acquisition'});assert.equal(run.party[0].rogueSourceId,4);assert.equal(run.party[0].rogueFormIndex,0);assert.ok(!run.party[0].mega);
 // Even a recorded Mega form must not become a selectable starter form.
 registerStarterCaught(state.system,{...makeReferenceMon(6,50),rogueFormIndex:1,rogueFormKey:'mega-x'},{kind:'capture'});assert.ok(!starterCatalog(state.system,{includeLocked:true}).some(p=>p.sourceId===6&&p.formIndex===1));
 run.screen='battle';run.wave=21;run.encounter={kind:'wild'};run.balls.masterball=1;run.combat=createClassicCombat(run,[makeReferenceMon(6,40,{boxId:'wild-charizard',moves:['Splash']})]);run.party=run.combat.teams[0];
 const capture=captureClassicCombat(run,'masterball',{system:state.system,targetBoxId:'wild-charizard'});assert.ok(capture.autoAdded);run.combat=capture.combat;const id=capture.caught.boxId;assert.equal(capture.caught.rogueFormIndex||0,0);assert.ok(!capture.caught.mega);
 doc=await decodeGameData(await encodeGameData(doc));state=doc.classic;run=state.slots[0];let mon=run.party.find(p=>p.boxId===id);assert.ok(mon);assert.equal(mon.rogueFormIndex||0,0);assert.ok(!mon.mega);
 run.screen='reward';run.tools.megaBracelet=true;run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='rareformitem'),rewardId:'stone',boxId:id,formItem:'charizarditex'}];chooseClassicReward(run,{rewardId:'stone',boxId:id},state.system);assert.equal(mon.rogueFormIndex||0,0);assert.ok(!mon.mega);
 doc=await decodeGameData(await encodeGameData(doc));state=doc.classic;run=state.slots[0];mon=run.party.find(p=>p.boxId===id);assert.ok(!mon.mega);assert.ok(run.formItems[id].includes('charizarditex'));
 run.screen='battle';run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'switch',slot:2});run.party=run.combat.teams[0];assert.ok(classicCombatView(run.combat).requests[0].actors[0].specials.some(s=>s.key==='mega:charizarditex'));
 run.combat=playClassicCombat(run,{type:'move',move:'splash',special:'mega:charizarditex'});run.party=run.combat.teams[0];assert.equal(run.party.find(p=>p.boxId===id).rogueFormKey,'mega-x');
 doc=await decodeGameData(await encodeGameData(doc));run=doc.classic.slots[0];assert.equal(run.party.find(p=>p.boxId===id).rogueFormKey,'mega-x');assert.equal(restoreClassicNativeBattle(run.combat,run).p1.active[0].species.id,'charizardmegax');assert.deepEqual(doc.classic.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});
});
