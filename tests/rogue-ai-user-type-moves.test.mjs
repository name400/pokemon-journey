import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,move='Steel Roller',heroId=4,terrain='',secondMove='Tackle',secondHeroId,foeId=151}={}) {
 const hero=makeReferenceMon(heroId,50,{boxId:'hero',moves:['Splash'],ability:'pressure'}); hero.hp=1;
 const foe=makeReferenceMon(foeId,50,{boxId:'foe',moves:[move,secondMove],ability:'pressure'});
 const party=[hero],enemies=[foe];
 if(secondHeroId){const h=makeReferenceMon(secondHeroId,50,{boxId:'hero2',moves:['Splash'],ability:'pressure'});h.hp=1;party.push(h);enemies.push(makeReferenceMon(4,50,{boxId:'foe2',moves:['Splash'],ability:'pressure'}));}
 const run={id:'ai-conditional',seed:'ai-conditional',rng:42,wave:20,screen:'battle',party,modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiUserTypeRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,enemies,{trainer:true,...(secondHeroId?{doubles:true}:{})});
 const b=restoreClassicNativeBattle(run.combat,run);if(terrain)b.field.setTerrain(terrain,b.p2.active[0]);run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=doc.run;run.combat=playClassicCombat(run,run.party.length>1?{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]}:{type:'move',move:'splash'});const b=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(doc.other,{keep:true});return {run,b};}

for(const [move,foeId] of [['Burn Up',4],['Double Shock',25]]){
 test(`${move}: AI avoids attack without the required user type`,async()=>{const current=await act(fixture({move})),old=await act(fixture({move,modern:false}));assert.ok(current.b.log.some(s=>s.includes('|Tackle|')));assert.equal(current.b.p1.pokemon[0].hp,0);assert.ok(old.b.log.some(s=>s.includes(`|${move}|`)));assert.equal(old.b.p1.pokemon[0].hp,1);});
 test(`${move}: AI attacks when its user has the required type`,async()=>{const {b}=await act(fixture({move,foeId,secondMove:'Splash'}));assert.ok(b.log.some(s=>s.includes(`|${move}|`)));assert.equal(b.p1.pokemon[0].hp,0);});
 test(`${move}: Dynamax does not require the base move type`,async()=>{const run=fixture({move,secondMove:'Splash'}),before=restoreClassicNativeBattle(run.combat,run);before.p2.active[0].addVolatile('dynamax');run.combat.snapshot=snapshotClassicNativeBattle(before);const {b}=await act(run);assert.equal(b.p1.pokemon[0].hp,0);});
}
test('new starts enable user type filtering without altering another slot',async()=>{const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ai-type',seed:'ai-type'});assert.equal(run.enemyAiUserTypeRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});});
for(const [move,type,foeId] of [['Burn Up','Fire',4],['Double Shock','Electric',25]]){
 test(`${move}: restored current type determines eligibility`,async()=>{for(const [id,changed,shouldUse] of [[151,type,true],[foeId,'Water',false]]){const run=fixture({move,foeId:id,secondMove:shouldUse?'Splash':'Tackle'});const before=restoreClassicNativeBattle(run.combat,run);before.p2.active[0].setType(changed,true);run.combat.snapshot=snapshotClassicNativeBattle(before);const {b}=await act(run);assert.ok(b.log.some(s=>s.includes(`|${shouldUse?move:'Tackle'}|`)));assert.equal(b.p1.pokemon[0].hp,0);}});
}
