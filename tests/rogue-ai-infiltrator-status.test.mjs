import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,ability='infiltrator',passive=null,move='Confuse Ray',targetAbility='pressure',targetSpecies=143}={}){
 const hero=makeReferenceMon(targetSpecies,100,{boxId:'hero',moves:['Splash'],ability:targetAbility}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Splash',move],ability});
 if(passive)foe.roguePassiveAbility=passive;
 const run={id:'ai-infiltrator',seed:'ai-infiltrator',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiStatusRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,[foe],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run);b.p1.active[0].addVolatile('substitute');run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=doc.run;run.combat=playClassicCombat(run,{type:'move',move:'splash'});const b=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(doc.other,{keep:true});return {run,b};}
test('Infiltrator enemy can select and apply confusion through Substitute',async()=>{
 const {run,b}=await act(fixture());assert.equal(run.combat.enemyAiStatusRule,'source-v1');assert.ok(b.log.some(line=>line.includes('|Confuse Ray|')));assert.ok(b.p1.active[0].volatiles.confusion);assert.ok(b.p1.active[0].volatiles.substitute);
});
test('legacy AI or an enemy without Infiltrator keeps the prior selection',async()=>{
 for(const options of [{modern:false},{ability:'pressure'}]){const {b}=await act(fixture(options));assert.ok(!b.log.some(line=>line.includes('|Confuse Ray|')));assert.ok(!b.p1.active[0].volatiles.confusion);}
});
test('status immunity still prevents AI from scoring confusion as useful',async()=>{
 const {b}=await act(fixture({targetAbility:'owntempo'}));assert.ok(!b.log.some(line=>line.includes('|Confuse Ray|')));assert.ok(!b.p1.active[0].volatiles.confusion);
});
test('a suppressed Infiltrator does not bypass the Substitute for AI scoring',async()=>{
 const {b}=await act(fixture({targetAbility:'neutralizinggas'}));assert.ok(!b.log.some(line=>line.includes('|Confuse Ray|')));assert.ok(!b.p1.active[0].volatiles.confusion);
});
test('an active passive Infiltrator also permits a status choice through Substitute',async()=>{
 const {b}=await act(fixture({ability:'pressure',passive:'infiltrator'}));assert.ok(b.log.some(line=>line.includes('|Confuse Ray|')));assert.ok(b.p1.active[0].volatiles.confusion);
});
test('Infiltrator can also select and apply Leech Seed through Substitute',async()=>{
 const {b}=await act(fixture({move:'Leech Seed'}));assert.ok(b.log.some(line=>line.includes('|Leech Seed|')));assert.ok(b.p1.active[0].volatiles.leechseed);
});
test('a Grass target still prevents Leech Seed from being scored as useful',async()=>{
 const {b}=await act(fixture({move:'Leech Seed',targetSpecies:1}));assert.ok(!b.log.some(line=>line.includes('|Leech Seed|')));assert.ok(!b.p1.active[0].volatiles.leechseed);
});
test('in doubles the AI selects the viable target behind Substitute over an immune target',async()=>{
 const hero=makeReferenceMon(143,100,{boxId:'hero',moves:['Splash'],ability:'pressure'}),ally=makeReferenceMon(242,100,{boxId:'ally',moves:['Splash'],ability:'owntempo'}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Splash','Confuse Ray'],ability:'infiltrator'}),foe2=makeReferenceMon(4,50,{boxId:'foe2',moves:['Splash']});
 const run={id:'ai-double',seed:'ai-double',rng:42,wave:20,screen:'battle',party:[hero,ally],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',enemyAiStatusRule:'source-v1'};run.combat=createClassicCombat(run,[foe,foe2],{trainer:true,doubles:true});const b=restoreClassicNativeBattle(run.combat,run);b.p1.active[0].addVolatile('substitute');run.combat.snapshot=snapshotClassicNativeBattle(b);
 const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}}));saved.run.combat=playClassicCombat(saved.run,{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]});const after=restoreClassicNativeBattle(saved.run.combat,saved.run);assert.ok(after.p1.pokemon[0].volatiles.confusion);assert.ok(!after.p1.pokemon[1].volatiles.confusion);assert.deepEqual(saved.other,{keep:true});
});
test('new games opt into this boundary without altering another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ai-status',seed:'ai-status'});assert.equal(run.enemyAiStatusRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
