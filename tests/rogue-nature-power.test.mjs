import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import {rogueReferenceData,makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicNaturePowerMoves,classicNaturePowerMove} from '../lib/rogue-nature-power.mjs';
import {classicBiome} from '../lib/rogue-classic-world.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({biome=0,terrain='',modern=true,enemy=false,doubles=false,stellar=false,move='Nature Power',ability='pressure'}={}){
 const user=makeReferenceMon(151,100,{boxId:'source',moves:[move,'Psychic','Splash'],ability,teraType:'Stellar'}),target=makeReferenceMon(80,400,{boxId:'target',moves:['Splash'],ability:'runaway'});
 const party=[user],foes=[target];if(doubles){party.push(makeReferenceMon(151,100,{boxId:'ally',moves:['Splash'],ability:'pressure'}));foes.push(makeReferenceMon(242,400,{boxId:'target2',moves:['Splash'],ability:'pressure'}));}
 const r={id:'nature-power',wave:30,biome,rng:42,screen:'battle',party:enemy?foes:party,modifiers:[],tools:{teraOrb:stellar},teraCharged:stellar,balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'},adaptabilityRule:'source-subset-v2',moveBalanceRule:'source-subset-v2',moveFlagRule:'source-subset-v1'};
 if(modern)r.naturePowerRule='source-biome-v1';r.combat=createClassicCombat(r,enemy?party:foes,{trainer:true,doubles,terrain});return r;
}
function probe(r,{enemy=false,stab=null}={}){
 const b=restoreClassicNativeBattle(r.combat,r),side=enemy?1:0,p=b.sides[side].active[0],random=b.random.bind(b),chance=b.randomChance.bind(b),calls=[],hits=[];
 b.random=(...args)=>{const value=random(...args);return args.length===1&&args[0]===16?0:value;};b.randomChance=(n,d)=>n===1&&d===24?false:chance(n,d);b.onEvent('Accuracy',b.format,{priority:-100},()=>true);
 if(stab!==null)b.onEvent('ModifySTAB',b.format,{priority:100},()=>stab);
 b.onEvent('PrepareHit',b.format,{priority:-100},function(source,target,move){if(source.side.n===side)calls.push({id:move.id,power:move.basePower,flags:{...move.flags}});});
 b.onEvent('DamagingHit',b.format,{priority:-100},function(damage,target,source,move){if(source.side.n===side)hits.push({damage,id:move.id,target:target.set.trainerToken});});
 return {b,p,calls,hits,turn(command='move naturepower',opponent='move splash'){const start=hits.length;b.makeChoices(...(enemy?[opponent,command]:[command,opponent]));return hits.slice(start);}};
}
async function recover(r,b){r.combat.teams=syncNativeTeams(b,r.combat.teams);r.party=r.combat.teams[0];r.combat.snapshot=snapshotClassicNativeBattle(b);const doc={coins:17,adventure:{keep:true}},s=ensureClassicState(doc);s.slots[0]=r;s.slots[1]={id:'other-slot',keep:true};const restored=await decodeGameData(await encodeGameData(doc));assert.equal(restored.coins,17);assert.deepEqual(restored.adventure,{keep:true});assert.deepEqual(restored.classic.slots[1],{id:'other-slot',keep:true});return restored.classic.slots[0];}

test('the app and pinned source share all35 biome identities and use real called moves',()=>{
 const entries=Object.entries(rogueReferenceData.enums.BiomeId);assert.equal(entries.length,35);assert.equal(Object.keys(classicNaturePowerMoves).length,entries.length);
 assert.equal(classicNaturePowerMove(0),'round');assert.equal(classicNaturePowerMove(5),'bugbuzz');assert.equal(classicNaturePowerMove(6),'hydropump');assert.equal(classicNaturePowerMove(40),'leaftornado');assert.equal(classicNaturePowerMove(50),'eternabeam');
 for(const [name,id]of entries){assert.equal(world.biomes[id].enumName,name);assert.equal(classicBiome({biome:id}).key,name.toLowerCase());const move=classicNaturePowerMove(id);assert.ok(Dex.moves.get(move).exists);const p=probe(fixture({biome:id}));p.turn();assert.ok(p.calls.some(c=>c.id===move),`${name} -> ${move}`);assert.ok(p.hits.some(h=>h.id===move),`${name} actual damaging effect`);}
});

test('the four actual terrains override biome choices, and clearing or changing terrain updates the next call',()=>{
 for(const [terrain,move]of Object.entries({electricterrain:'thunderbolt',grassyterrain:'energyball',psychicterrain:'psychic',mistyterrain:'moonblast'})){
  const p=probe(fixture({biome:5,terrain}));p.turn();assert.equal(p.calls.at(-1).id,move);assert.ok(p.hits.some(h=>h.id===move));p.b.field.clearTerrain();p.turn();assert.equal(p.calls.at(-1).id,'bugbuzz');p.b.field.setTerrain('electricterrain',p.p);p.turn();assert.equal(p.calls.at(-1).id,'thunderbolt');
 }
});

test('the current biome and rule survive actual command/codec restoration without changing caller PP ownership',async()=>{
 let r=fixture({biome:6});const pp=r.combat.requests[0].moves.find(m=>m.id==='naturepower').pp;
 r.combat=playClassicCombat(r,{type:'move',move:'naturepower'});r.party=r.combat.teams[0];assert.ok(r.combat.snapshot.log.some(line=>line.includes('|Hydro Pump|')));assert.equal(r.combat.requests[0].moves.find(m=>m.id==='naturepower').pp,pp-1);
 r=await recover(r,restoreClassicNativeBattle(r.combat,r));assert.equal(r.combat.naturePowerRule,'source-biome-v1');assert.equal(r.combat.biomeId,6);const p=probe(r);p.turn();assert.equal(p.calls.at(-1).id,'hydropump');assert.ok(!p.p.moveSlots.some(slot=>slot.id==='hydropump'));
});

test('the same called move is used by enemy trainers and spread calls keep their real doubles targets',()=>{
 const enemy=probe(fixture({biome:5,enemy:true}),{enemy:true});enemy.turn();assert.equal(enemy.calls.at(-1).id,'bugbuzz');assert.ok(enemy.hits.some(h=>h.target==='target'));
 const spread=probe(fixture({biome:18,doubles:true}));spread.turn('move naturepower 1,move splash','move splash,move splash');assert.ok(spread.hits.some(h=>h.id==='lavaplume'&&h.target==='ally'));assert.ok(spread.hits.some(h=>h.id==='lavaplume'&&h.target==='target'));assert.ok(spread.hits.some(h=>h.id==='lavaplume'&&h.target==='target2'));
});

test('called attack types reach the Stellar history while Nature Power itself remains a status move',async()=>{
 let r=fixture({biome:8,stellar:true,ability:'adaptability'}),p=probe(r);p.turn();assert.deepEqual(p.p.stellarBoostedTypes,['Water']);r=await recover(r,p.b);p=probe(r);const actual=p.turn('move naturepower terastallize').map(h=>h.damage);
 const control=probe(fixture({biome:8}),{stab:1});assert.deepEqual(actual,control.turn().map(h=>h.damage));assert.deepEqual(p.p.stellarBoostedTypes,['Water']);assert.equal(p.b.dex.moves.get('naturepower').category,'Status');assert.equal(p.b.dex.moves.get('naturepower').priority,0);
});

test('biome calls still use local source numeric and move-flag patches without changing shared Dex',()=>{
 const native=Dex.moves.get('naturepower').onTryHit,wind=Dex.moves.get('silverwind').flags.wind;
 const p=probe(fixture({biome:1}));p.turn();assert.equal(p.calls.at(-1).id,'silverwind');assert.equal(p.calls.at(-1).flags.wind,1);assert.equal(Dex.moves.get('silverwind').flags.wind,wind);assert.equal(Dex.moves.get('naturepower').onTryHit,native);
});

test('legacy or unknown biomes retain native behavior and new starts alone opt into the source rule',()=>{
 for(const options of [{biome:5,modern:false},{biome:999}]){const p=probe(fixture(options));p.turn();assert.equal(p.calls.at(-1).id,'triattack');}
 assert.equal(classicNaturePowerMove(undefined),null);assert.equal(classicNaturePowerMove(-1),null);
 const doc={},s=ensureClassicState(doc,{initialStarterId:1}),starter=starterCatalog(s.system).find(p=>p.id===1),run=startClassicRun(doc,[{id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]);assert.equal(run.naturePowerRule,'source-biome-v1');delete run.naturePowerRule;assert.equal(ensureClassicState(doc).slots[0].naturePowerRule,undefined);
});
