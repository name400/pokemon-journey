import test from 'node:test';import assert from 'node:assert/strict';import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,weather='desolateland',move='Hydro Pump',ability='pressure',heroAbility='pressure',target=4}={}){
 const hero=makeReferenceMon(target,50,{boxId:'hero',moves:['Splash'],ability:heroAbility}),foe=makeReferenceMon(151,50,{boxId:'foe',moves:[move,'Tackle'],ability});hero.hp=1;
 const run={id:'ai-weather',seed:'ai-weather',rng:42,wave:20,screen:'battle',party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiWeatherRule:'source-v1'}:{})};run.combat=createClassicCombat(run,[foe],{trainer:true});const b=restoreClassicNativeBattle(run.combat,run);b.field.setWeather(weather,b.p2.active[0]);run.combat.snapshot=snapshotClassicNativeBattle(b);return run;
}
async function act(run){const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));run=doc.run;run.combat=playClassicCombat(run,{type:'move',move:'splash'});const b=restoreClassicNativeBattle(run.combat,run);assert.deepEqual(doc.other,{keep:true});return {run,b};}
test('harsh sun excludes canceled Water attacks from KO candidates',async()=>{
 const modern=await act(fixture()),old=await act(fixture({modern:false}));assert.ok(modern.b.log.some(s=>s.includes('|Tackle|')));assert.equal(modern.b.p1.pokemon[0].hp,0);assert.equal(modern.run.combat.enemyAiWeatherRule,'source-v1');
 assert.ok(old.b.log.some(s=>s.includes('|Hydro Pump|')));assert.equal(old.b.p1.pokemon[0].hp,1);
});
test('heavy rain excludes canceled Fire attacks from KO candidates',async()=>{
 const modern=await act(fixture({weather:'primordialsea',move:'Flamethrower',target:1})),old=await act(fixture({modern:false,weather:'primordialsea',move:'Flamethrower',target:1}));
 assert.ok(modern.b.log.some(s=>s.includes('|Tackle|')));assert.equal(modern.b.p1.pokemon[0].hp,0);assert.ok(old.b.log.some(s=>s.includes('|Flamethrower|')));assert.equal(old.b.p1.pokemon[0].hp,1);
});
test('Cloud Nine and Normalize keep a now-valid attack available',async()=>{
 for(const options of [{heroAbility:'cloudnine'},{ability:'normalize'}]){const {b}=await act(fixture(options));assert.ok(b.log.some(s=>s.includes('|Hydro Pump|')));assert.equal(b.p1.pokemon[0].hp,0);}
});
test('Liquid Voice changes a sound attack to blocked Water without mutating the shared move',async()=>{
 const move=Dex.moves.get('hypervoice'),before=move.type,modern=await act(fixture({move:'Hyper Voice',ability:'liquidvoice'})),old=await act(fixture({modern:false,move:'Hyper Voice',ability:'liquidvoice'}));
 assert.ok(modern.b.log.some(s=>s.includes('|Tackle|')));assert.equal(modern.b.p1.pokemon[0].hp,0);assert.ok(old.b.log.some(s=>s.includes('|Hyper Voice|')));assert.equal(old.b.p1.pokemon[0].hp,1);assert.equal(Dex.moves.get('hypervoice').type,before);
});
test('new starts enable weather filtering without modifying another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ai-weather',seed:'ai-weather'});assert.equal(run.enemyAiWeatherRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
