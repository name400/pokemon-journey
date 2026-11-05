import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

function fixture(ability,passive,modern){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Water Gun','Ember','Splash']});
 hero.ability=passive?'pressure':ability;if(passive)hero.roguePassiveAbility=ability;
 const foe=makeReferenceMon(242,100,{boxId:'foe',moves:['Splash']});
 const run={id:'protean-test',seed:'protean-test',rng:1,wave:1,biome:1,screen:'battle',party:[hero],foes:[foe],modifiers:[],balls:{},tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};
 if(modern)run.proteanRule='source-subset-v1';run.combat=createClassicCombat(run,run.foes,{trainer:true});return run;
}
for(const ability of ['protean','libero'])for(const passive of [false,true])for(const modern of [false,true]){
 let run=fixture(ability,passive,modern);run.combat=playClassicCombat(run,{type:'move',move:'watergun'});
 assert.deepEqual(restoreClassicNativeBattle(run.combat,run).p1.active[0].getTypes(),['Water']);
 run=JSON.parse(JSON.stringify(run));run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'ember'});
 assert.deepEqual(restoreClassicNativeBattle(run.combat,run).p1.active[0].getTypes(),[modern?'Fire':'Water'],`${ability} passive=${passive} modern=${modern}`);
}
// Suppression still applies after the first type change and survives restoration.
{let run=fixture('protean',false,true);run.combat=playClassicCombat(run,{type:'move',move:'watergun'});run.party=run.combat.teams[0];let b=restoreClassicNativeBattle(run.combat,run);b.p1.active[0].addVolatile('gastroacid');const {snapshotClassicNativeBattle}=await import('../lib/rogue-battle-engine.mjs');run.combat.snapshot=snapshotClassicNativeBattle(b);run=JSON.parse(JSON.stringify(run));run.combat=playClassicCombat(run,{type:'move',move:'ember'});b=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(b.p1.active[0].getTypes(),['Water']);}
// Forced Struggle does not change type, even after an earlier type change.
for(const passive of [false,true]){const run=fixture('protean',passive,true);run.combat=playClassicCombat(run,{type:'move',move:'watergun'});run.party=run.combat.teams[0];const b=restoreClassicNativeBattle(run.combat,run),p=b.p1.active[0];for(const slot of p.moveSlots)slot.pp=0;b.makeChoices('move 1','move 1');assert.equal(p.lastMove?.id,'struggle');assert.deepEqual(p.getTypes(),['Water']);}
// A self-targeting status move also changes type on a later turn.
{const run=fixture('protean',false,true);run.combat=playClassicCombat(run,{type:'move',move:'watergun'});run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.deepEqual(restoreClassicNativeBattle(run.combat,run).p1.active[0].getTypes(),['Normal']);}
// The full save retains the rule and leaves other slots untouched.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let run=fixture('libero',true,true);run.combat=playClassicCombat(run,{type:'move',move:'watergun'});run.party=run.combat.teams[0];let doc={coins:3,adventure:{safe:true}},state=ensureClassicState(doc);state.slots[0]=run;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];assert.equal(run.combat.proteanRule,'source-subset-v1');run.combat=playClassicCombat(run,{type:'move',move:'ember'});assert.deepEqual(restoreClassicNativeBattle(run.combat,run).p1.active[0].getTypes(),['Fire']);assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
