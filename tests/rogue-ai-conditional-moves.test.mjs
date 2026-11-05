import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,move='Steel Roller',heroId=4,terrain='',secondMove='Tackle',secondHeroId}={}) {
 const hero=makeReferenceMon(heroId,50,{boxId:'hero',moves:['Splash'],ability:'pressure'}); hero.hp=1;
 const foe=makeReferenceMon(151,50,{boxId:'foe',moves:[move,secondMove],ability:'pressure'});
 const party=[hero],enemies=[foe];
 if(secondHeroId){const h=makeReferenceMon(secondHeroId,50,{boxId:'hero2',moves:['Splash'],ability:'pressure'});h.hp=1;party.push(h);enemies.push(makeReferenceMon(4,50,{boxId:'foe2',moves:['Splash'],ability:'pressure'}));}
 const run={id:'ai-conditional',seed:'ai-conditional',rng:42,wave:20,screen:'battle',party,modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiConditionalMoveRule:'source-subset-v1'}:{})};
 run.combat=createClassicCombat(run,enemies,{trainer:true,...(secondHeroId?{doubles:true}:{})});
 const b=restoreClassicNativeBattle(run.combat,run);if(terrain)b.field.setTerrain(terrain,b.p2.active[0]);run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=doc.run;run.combat=playClassicCombat(run,run.party.length>1?{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]}:{type:'move',move:'splash'});const b=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(doc.other,{keep:true});return {run,b};}
test('AI avoids Steel Roller without terrain while old runs retain their behavior',async()=>{const current=await act(fixture()),old=await act(fixture({modern:false}));assert.ok(current.b.log.some(s=>s.includes('|Tackle|')));assert.equal(current.b.p1.pokemon[0].hp,0);assert.ok(old.b.log.some(s=>s.includes('|Steel Roller|')));assert.equal(old.b.p1.pokemon[0].hp,1);});
test('AI can use Steel Roller with terrain',async()=>{const {b}=await act(fixture({terrain:'electricterrain',secondMove:'Splash'}));assert.ok(b.log.some(s=>s.includes('|Steel Roller|')));assert.equal(b.p1.pokemon[0].hp,0);assert.equal(b.field.terrain,'');});
test('AI avoids Synchronoise when types do not overlap',async()=>{const current=await act(fixture({move:'Synchronoise'})),old=await act(fixture({move:'Synchronoise',modern:false}));assert.ok(current.b.log.some(s=>s.includes('|Tackle|')));assert.equal(current.b.p1.pokemon[0].hp,0);assert.ok(old.b.log.some(s=>s.includes('|Synchronoise|')));assert.equal(old.b.p1.pokemon[0].hp,1);});
test('AI can use Synchronoise against a shared type',async()=>{const {b}=await act(fixture({move:'Synchronoise',heroId:63,secondMove:'Splash'}));assert.ok(b.log.some(s=>s.includes('|Synchronoise|')));assert.equal(b.p1.pokemon[0].hp,0);});
test('new starts enable conditional filtering without changing another slot',async()=>{const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ai-conditional',seed:'ai-conditional'});assert.equal(run.enemyAiConditionalMoveRule,'source-subset-v1');assert.deepEqual(state.slots[1],{keep:true});});

test('spread Synchronoise evaluates the second opponent in doubles',async()=>{const {b}=await act(fixture({move:'Synchronoise',secondMove:'Splash',secondHeroId:63}));assert.ok(b.log.some(s=>s.includes('|Synchronoise|')));assert.equal(b.p1.pokemon[0].hp,1);assert.equal(b.p1.pokemon[1].hp,0);});
test('spread Synchronoise is avoided when neither opponent shares a type',async()=>{const {b}=await act(fixture({move:'Synchronoise',secondHeroId:7}));assert.ok(b.log.some(s=>s.includes('|Tackle|')));assert.ok(b.p1.pokemon.some(p=>p.hp===0));});
test('Dynamax attacks are not restricted by base move conditions',async()=>{for(const move of ['Steel Roller','Synchronoise']){const run=fixture({move,secondMove:'Splash'});const before=restoreClassicNativeBattle(run.combat,run);before.p2.active[0].addVolatile('dynamax');run.combat.snapshot=snapshotClassicNativeBattle(before);const {b}=await act(run);assert.equal(b.p1.pokemon[0].hp,0,move);}});
