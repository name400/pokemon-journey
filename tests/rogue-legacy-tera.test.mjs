import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReferenceMon } from '../lib/rogue-reference.mjs';
import { createClassicCombat } from '../lib/rogue-battle-engine.mjs';
import { ensureClassicState } from '../lib/rogue-classic-state.mjs';
import { encodeGameData, decodeGameData } from '../lib/game-storage.mjs';

function fixture(){
 const doc={collection:[],adventure:{safe:true}},state=ensureClassicState(doc),hero=makeReferenceMon(1,5,{boxId:'hero',moves:['Tackle']}),foe=makeReferenceMon(19,5,{boxId:'foe',moves:['Splash']});
 delete hero.teraType;
 const run={id:'legacy',wave:1,rng:3,party:[hero],modifiers:[],tools:{},encounter:{kind:'wild'},screen:'reward',pendingMoves:[],pendingGrowth:[]};
 run.combat=createClassicCombat(run,[foe]);run.combat.ended=true;run.combat.snapshot.ended=true;state.slots[0]=run;state.slots[1]={untouched:true};return doc;
}
test('finished legacy battle preserves its already visible tera type and leaves snapshot intact',async()=>{
 let doc=fixture(),run=doc.classic.slots[0];const before=structuredClone(run.combat),shown=run.combat.snapshot.sides[0].pokemon[0].set.teraType.toLowerCase();
 assert.equal(shown,'grass');ensureClassicState(doc);assert.equal(run.party[0].teraType,'Grass');assert.deepEqual(run.combat,before);
 doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];assert.equal(run.party[0].teraType,'Grass');assert.deepEqual(doc.classic.slots[1],{untouched:true});assert.deepEqual(doc.adventure,{safe:true});
 const foe=makeReferenceMon(19,5,{boxId:'next',moves:['Splash']});const next=createClassicCombat(run,[foe]);assert.equal(next.snapshot.sides[0].pokemon[0].set.teraType.toLowerCase(),shown);
});
test('active, ambiguous, conflicting and pending saves are left untouched',()=>{
 for(const change of [r=>{r.screen='battle';r.combat.ended=false;r.combat.snapshot.ended=false;},r=>r.pendingCapture={boxId:'pending'},r=>{r.combat.snapshot.sides[0].pokemon.push(structuredClone(r.combat.snapshot.sides[0].pokemon[0]));},r=>{r.combat.teams[0][0].teraType='Fire';},r=>{r.party[0].fusionSpecies='other';},r=>{r.combat.snapshot.sides[0].pokemon[0].transformed=true;},r=>{r.combat.snapshot.sides[0].pokemon[0].set.teraType='notatype';}]){
  const doc=fixture(),run=doc.classic.slots[0];change(run);const before=structuredClone(run);ensureClassicState(doc);assert.deepEqual(run,before);
 }
});
test('an existing explicitly selected type is never replaced',()=>{const doc=fixture(),run=doc.classic.slots[0];run.party[0].teraType='Fire';ensureClassicState(doc);assert.equal(run.party[0].teraType,'Fire');});

test('actual battle victory and reconnect retain the legacy battle type',async()=>{
 const {playClassicCombat}=await import('../lib/rogue-battle-engine.mjs');
 let doc=fixture(),run=doc.classic.slots[0],hero=makeReferenceMon(1,100,{boxId:'hero',moves:['Tackle']}),foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});
 delete hero.teraType;run.party=[hero];run.screen='battle';run.combat=createClassicCombat(run,[foe]);
 for(let i=0;i<8&&!run.combat.ended;i++){run.combat=playClassicCombat(run,{type:'move',move:'tackle'});run.party=run.combat.teams[0];}
 assert.equal(run.combat.ended,true);assert.equal(run.combat.snapshot.ended,true);run.screen='reward';
 const battleBefore=JSON.parse(JSON.stringify(run.combat));doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];
 assert.equal(run.party[0].teraType,'Grass');assert.deepEqual(run.combat,battleBefore);assert.deepEqual(doc.adventure,{safe:true});
});
