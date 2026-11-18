import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
function fixture({modern=true,passive=false,suppressed=false,status='brn',enemy=false}={}) {
 const mon=(id,boxId,ability='pressure')=>makeReferenceMon(id,50,{boxId,moves:['Splash'],ability});
 const healer=mon(151,'healer',passive?'pressure':'healer'),ally=mon(143,'ally');ally.status=status;if(passive)healer.roguePassiveAbility='healer';
 const run={id:'healer-test',seed:'healer-test',rng:42,wave:20,screen:'battle',party:enemy?[mon(7,'hero'),mon(4,'hero2')]:[healer,ally],modifiers:[],tools:{},encounter:{kind:'trainer'},...(modern?{healerChanceRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,enemy?[healer,ally]:[mon(7,'foe'),mon(4,'foe2')],{trainer:true,doubles:true});
 if(suppressed){const b=restoreClassicNativeBattle(run.combat,run);b.sides[enemy?1:0].active[0].addVolatile('gastroacid');run.combat.snapshot=snapshotClassicNativeBattle(b);}
 return run;
}
function drive(run,success=true,enemy=false){const battle=restoreClassicNativeBattle(run.combat,run),calls=[];const old=battle.randomChance;battle.randomChance=function(n,d){if((n===3&&d===10)||(n===1&&d===2)){calls.push([n,d]);return success;}return old.call(this,n,d)};battle.makeChoices('move splash,move splash','move splash,move splash');return {battle,calls,ally:battle.sides[enemy?1:0].active[1]};}
for(const passive of [false,true])for(const success of [false,true])test(`${passive?'passive':'ordinary'} Healer uses 50% and ${success?'cures':'does not cure'} burn`,()=>{const {calls,ally}=drive(fixture({passive}),success);assert.deepEqual(calls,[[1,2]]);assert.equal(ally.status,success?'':'brn');});
test('legacy save retains native 30%',()=>{const {calls,ally}=drive(fixture({modern:false}));assert.deepEqual(calls,[[3,10]]);assert.equal(ally.status,'');});
test('suppression prevents the ability from curing',()=>{const {calls,ally}=drive(fixture({suppressed:true}));assert.deepEqual(calls,[]);assert.equal(ally.status,'brn');});
test('enemy Healer cures its own ally',()=>{const {calls,ally}=drive(fixture({enemy:true}),true,true);assert.deepEqual(calls,[[1,2]]);assert.equal(ally.status,'');});
test('new run saves source rule without changing another slot',async()=>{const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs');const {starterCatalog}=await import('../lib/rogue-starter-system.mjs');const document={},state=ensureClassicState(document,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(document,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'healer-start'});assert.equal(run.healerChanceRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});});
test('new rule and RNG cursor survive combat save and restore',async()=>{const run=fixture(),doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));doc.run.combat=playClassicCombat(doc.run,{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]});const saved=await decodeGameData(await encodeGameData(doc));assert.equal(saved.run.combat.healerChanceRule,'source-v1');assert.deepEqual(saved.other,{keep:true});const b=restoreClassicNativeBattle(saved.run.combat),original=b.randomChance,calls=[];b.randomChance=function(n,d){if(n===1&&d===2){calls.push([n,d]);return true;}return original.call(this,n,d)};b.p1.active[1].status='brn';b.makeChoices('move splash,move splash','move splash,move splash');assert.deepEqual(calls,[[1,2]]);assert.equal(b.p1.active[1].status,'');});
for(const status of ['psn','tox','par','slp','frz'])test(`Healer can cure ${status}`,()=>{
 const run=fixture({status}),b=restoreClassicNativeBattle(run.combat,run),ally=b.p1.active[1],effect=b.dex.abilities.get('healer');
 const original=b.randomChance;let chance;b.randomChance=function(n,d){chance=[n,d];return true};effect.onResidual.call(b,b.p1.active[0]);b.randomChance=original;
 assert.deepEqual(chance,[1,2]);assert.equal(ally.status,'');
});
test('passive suppression prevents a cure',()=>{const {calls,ally}=drive(fixture({passive:true,suppressed:true}));assert.deepEqual(calls,[]);assert.equal(ally.status,'brn');});
test('healthy ally is unchanged',()=>{const {calls,ally}=drive(fixture({status:''}));assert.deepEqual(calls,[]);assert.equal(ally.status,'');});
