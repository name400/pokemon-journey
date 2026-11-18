import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const mon=(id,boxId,moves)=>makeReferenceMon(id,100,{boxId,moves,ability:'runaway'});
function fixture(modern=true){
 const party=[mon(151,'player1',['Tackle','Flamethrower','Splash']),mon(151,'player2',['Splash'])];
 const foes=[mon(151,'fast',['Imprison','Tackle']),mon(143,'slow',['Imprison','Flamethrower']),mon(80,'reserve',['Splash'])];
 const run={id:'imprison-side-test',wave:30,biome:5,rng:42,screen:'battle',party,modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};
 if(modern)run.imprisonSideRule='source-v1';run.combat=createClassicCombat(run,foes,{trainer:true,doubles:true});return run;
}
const disabled=b=>Object.fromEntries(b.p1.activeRequest.active[0].moves.map(m=>[m.id,m.disabled]));
async function recover(run,b){run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const doc={coins:23,adventure:{safe:true}},state=ensureClassicState(doc);state.slots[0]=run;state.slots[1]={id:'other',safe:true};const result=await decodeGameData(await encodeGameData(doc));assert.equal(result.coins,23);assert.deepEqual(result.adventure,{safe:true});assert.deepEqual(result.classic.slots[1],{id:'other',safe:true});return result.classic.slots[0];}
test('only the first allied Imprison applies, including after save and restore',async()=>{
 let run=fixture(),b=restoreClassicNativeBattle(run.combat,run);b.makeChoices('move splash,move splash','move imprison,move imprison');assert.equal(!!b.p2.active[0].volatiles.imprison,true);assert.equal(!!b.p2.active[1].volatiles.imprison,false);assert.equal(b.p2.active[1].moveSlots[0].pp,9);assert.equal(disabled(b).tackle,true);assert.equal(disabled(b).flamethrower,false);assert.ok(b.log.some(s=>s.startsWith('|-fail|p2b:')));
 run=await recover(run,b);b=restoreClassicNativeBattle(run.combat,run);assert.equal(disabled(b).tackle,true);assert.equal(disabled(b).flamethrower,false);b.makeChoices('move splash,move splash','switch 3,move flamethrower 1');assert.equal(disabled(b).tackle,false);assert.equal(disabled(b).flamethrower,false);b.makeChoices('move splash,move splash','move splash,move imprison');assert.equal(disabled(b).flamethrower,true);
});
test('old runs retain their existing simulator behavior',()=>{const run=fixture(false),b=restoreClassicNativeBattle(run.combat,run);b.makeChoices('move splash,move splash','move imprison,move imprison');assert.equal(disabled(b).tackle,true);assert.equal(disabled(b).flamethrower,true);});
test('player-side duplicate fails without disabling the second move on either opponent',()=>{const run=fixture();run.party=[mon(151,'fast',['Imprison','Tackle']),mon(143,'slow',['Imprison','Flamethrower'])];const foes=[mon(151,'one',['Tackle','Flamethrower','Splash']),mon(80,'two',['Tackle','Flamethrower','Splash'])];run.combat=createClassicCombat(run,foes,{trainer:true,doubles:true});const b=restoreClassicNativeBattle(run.combat,run);b.makeChoices('move imprison,move imprison','move splash,move splash');assert.equal(!!b.p1.active[0].volatiles.imprison,true);assert.equal(!!b.p1.active[1].volatiles.imprison,false);for(const a of b.p2.active){const moves=Object.fromEntries(a.moveSlots.map(m=>[m.id,!!m.disabled]));assert.equal(moves.tackle,true);assert.equal(moves.flamethrower,false);}});
