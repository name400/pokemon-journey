import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const ivs={hp:31,atk:31,def:31,spa:31,spd:31,spe:31};
function fixture({rule='source-subset-v2',move='Future Sight',target=242,enemy=false,ability='adaptability'}={}){
 const user=makeReferenceMon(151,100,{boxId:'source',moves:[move,'Psychic','Flash Cannon','Splash'],ability,teraType:'Stellar',ivs:{...ivs}}),foe=makeReferenceMon(target,400,{boxId:'target',moves:['Splash'],ability:'pressure',ivs:{...ivs}});
 if(enemy)user.rogueInstantTera=true;
 const run={id:'stellar-delayed',wave:30,biome:1,rng:1234,screen:'battle',party:enemy?[foe]:[user],modifiers:[],tools:{teraOrb:true},teraCharged:true,balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};
 if(rule)run.adaptabilityRule=rule;run.combat=createClassicCombat(run,enemy?[user]:[foe],{trainer:true});return run;
}
function probe(run,{enemy=false,stab=null,called=null}={}){
 const b=restoreClassicNativeBattle(run.combat,run),side=enemy?1:0,p=b.sides[side].active[0],chance=b.randomChance.bind(b),random=b.random.bind(b),sample=b.sample.bind(b);
 b.randomChance=(n,d)=>n===1&&d===24?false:chance(n,d);
 b.random=(...args)=>{const value=random(...args);return args.length===1&&args[0]===16?0:value;};
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);
 if(stab!==null)b.onEvent('ModifySTAB',b.format,{priority:100},()=>stab);
 if(called)b.sample=values=>values.find(m=>m?.id===called)||sample(values);
 let hits=[];b.onEvent('DamagingHit',b.format,{priority:-100},function(damage,target,source,move){if(source.side.n===side)hits.push({damage,id:move.id});});
 return {b,p,turn(command='move splash',other='move splash'){hits=[];b.makeChoices(...(enemy?[other,command]:[command,other]));return [...hits];}};
}
async function roundTrip(run,b){
 run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);
 const doc={coins:29,adventure:{untouched:true}},state=ensureClassicState(doc);state.slots[0]=run;state.slots[1]={id:'other-slot',safe:true};
 const restored=await decodeGameData(await encodeGameData(doc));assert.deepEqual(restored.adventure,{untouched:true});assert.deepEqual(restored.classic.slots[1],{id:'other-slot',safe:true});assert.equal(restored.coins,29);return restored.classic.slots[0];
}
function oracle(move,stab){const r=fixture({move,ability:'pressure'}),p=probe(r,{stab});let hits=p.turn('move 1');if(Dex.moves.get(move).flags.futuremove){p.turn();hits=p.turn();}return hits.map(h=>h.damage);}

test('a resolved pre-Tera Future Sight or Doom Desire consumes its type through every saved boundary',async()=>{
 for(const [move,type,next,stab]of [['Future Sight','Psychic','move psychic terastallize',2],['Doom Desire','Steel','move flashcannon terastallize',1]]){
  let run=fixture({move}),p=probe(run);assert.deepEqual(p.turn('move 1'),[]);assert.deepEqual(p.p.stellarBoostedTypes,[]);
  run=await roundTrip(run,p.b);p=probe(run);p.turn();assert.deepEqual(p.p.stellarBoostedTypes,[]);
  run=await roundTrip(run,p.b);p=probe(run);assert.ok(p.turn().some(h=>h.id===Dex.moves.get(move).id));assert.ok(p.p.stellarBoostedTypes.includes(type));
  run=await roundTrip(run,p.b);p=probe(run);assert.deepEqual(p.turn(next).map(h=>h.damage),oracle(move==='Future Sight'?'Psychic':'Flash Cannon',stab));assert.equal(p.p.stellarBoostedTypes.filter(t=>t===type).length,1);
 }
});

test('a Stellar Future Sight blocked by a Dark switch still consumes Psychic only on resolution',async()=>{
 let run=fixture();run.combat=createClassicCombat(run,[...run.combat.teams[1],makeReferenceMon(197,400,{boxId:'dark-switch',moves:['Splash'],ability:'pressure',ivs:{...ivs}})],{trainer:true});let p=probe(run);
 p.turn('move futuresight terastallize');assert.deepEqual(p.p.stellarBoostedTypes,[]);p.turn('move splash','switch 2');assert.deepEqual(p.p.stellarBoostedTypes,[]);
 run=await roundTrip(run,p.b);p=probe(run);assert.deepEqual(p.turn(),[]);assert.ok(p.b.log.some(line=>line.startsWith('|-immune|')));assert.deepEqual(p.p.stellarBoostedTypes,['Psychic']);
});

test('Metronome calling a delayed attack records the actual type at impact, not the status caller or queue',async()=>{
 let run=fixture({move:'Metronome'}),p=probe(run,{called:'futuresight'});p.turn('move metronome');assert.ok(p.b.log.some(line=>line.includes('|Future Sight|')));assert.deepEqual(p.p.stellarBoostedTypes,[]);
 run=await roundTrip(run,p.b);p=probe(run);p.turn();p.turn();assert.deepEqual(p.p.stellarBoostedTypes,['Psychic']);assert.ok(!p.p.stellarBoostedTypes.includes('Normal'));
});

test('enemy delayed attacks and a type consumed while an attack waits use the same history rules',()=>{
 const enemy=probe(fixture({enemy:true}),{enemy:true});enemy.turn('move futuresight');enemy.turn();enemy.turn();assert.deepEqual(enemy.p.stellarBoostedTypes,['Psychic']);
 const first=probe(fixture());first.turn('move futuresight');first.turn('move splash terastallize');assert.deepEqual(first.p.stellarBoostedTypes,[]);assert.deepEqual(first.turn().map(h=>h.damage),oracle('Future Sight',2.25));assert.deepEqual(first.p.stellarBoostedTypes,['Psychic']);
 const waiting=probe(fixture());waiting.turn('move futuresight');assert.deepEqual(waiting.p.stellarBoostedTypes,[]);assert.deepEqual(waiting.turn('move psychic terastallize').map(h=>h.damage),oracle('Psychic',2.25));
 const impact=waiting.turn();assert.deepEqual(impact.map(h=>h.damage),oracle('Future Sight',2));assert.equal(waiting.p.stellarBoostedTypes.filter(t=>t==='Psychic').length,1);
});

test('a queued target fainting in doubles cancels the strike without consuming its type after save recovery',async()=>{
 let run=fixture();run.party[0].moves=['Future Sight','Seismic Toss','Psychic','Splash'];run.party.push(makeReferenceMon(151,100,{boxId:'ally',moves:['Splash']}));run.combat=createClassicCombat(run,[...run.combat.teams[1],makeReferenceMon(242,400,{boxId:'survivor',moves:['Splash']})],{trainer:true,doubles:true});let p=probe(run);p.b.p2.active[0].hp=1;
 p.turn('move futuresight 1,move splash','move splash,move splash');p.turn('move seismictoss 1,move splash','move splash,move splash');assert.equal(p.b.p2.active[0].fainted,true);
 run=await roundTrip(run,p.b);p=probe(run);p.turn('move splash,move splash','move splash');assert.ok(p.b.log.some(line=>line.includes('Future Sight did not hit because the target is fainted')));assert.ok(!p.p.stellarBoostedTypes.includes('Psychic'));assert.ok(p.p.stellarBoostedTypes.includes('Fighting'));assert.equal(p.b.p2.active[1].fainted,false);
});

test('switching the source to the bench preserves delayed ownership across encoded recovery',async()=>{
 let run=fixture();run.party.push(makeReferenceMon(132,100,{boxId:'backup',moves:['Splash'],ability:'pressure'}));run.combat=createClassicCombat(run,run.combat.teams[1],{trainer:true});let p=probe(run);
 p.turn('move futuresight');p.turn('switch 2');assert.equal(p.b.p1.active[0].set.trainerToken,'backup');run=await roundTrip(run,p.b);p=probe(run);p.turn();
 const source=p.b.p1.pokemon.find(mon=>mon.set.trainerToken==='source');assert.deepEqual(source.stellarBoostedTypes,['Psychic']);assert.deepEqual(p.b.p1.active[0].stellarBoostedTypes,[]);assert.equal(p.b.p1.active[0].set.trainerToken,'backup');
});

test('an actual Classic command/codec path preserves the delayed type before a later Stellar action',async()=>{
 let run=fixture();for(const move of ['futuresight','splash','splash']){run.combat=playClassicCombat(run,{type:'move',move});run.party=run.combat.teams[0];const restored=await decodeGameData(await encodeGameData({classic:{slots:[run],activeSlot:0}}));run=restored.classic.slots[0];}
 const p=restoreClassicNativeBattle(run.combat,run).p1.active[0];assert.deepEqual(p.stellarBoostedTypes,['Psychic']);
 run.combat=playClassicCombat(run,{type:'move',move:'psychic',special:'terastallize'});assert.equal(run.combat.teams[0][0].terastallized,'Stellar');assert.deepEqual(restoreClassicNativeBattle(run.combat,run).p1.active[0].stellarBoostedTypes,['Psychic']);
});

test('resolved Normalize uses its actual delayed type and exceptions do not prematurely consume it',()=>{
 const normal=probe(fixture({ability:'normalize'}));normal.turn('move futuresight');assert.deepEqual(normal.p.stellarBoostedTypes,[]);normal.turn();normal.turn();assert.deepEqual(normal.p.stellarBoostedTypes,['Normal']);
 const failed=probe(fixture());failed.turn('move futuresight');const data=failed.b.p2.slotConditions[0].futuremove,move=new failed.b.dex.Move(data.moveData),native=failed.b.actions.hitStepAccuracy;
 failed.b.actions.hitStepAccuracy=()=>{throw Error('forced delayed strike failure');};assert.throws(()=>failed.b.actions.trySpreadMoveHit([failed.b.p2.active[0]],failed.p,move,true),/forced delayed strike failure/);assert.deepEqual(failed.p.stellarBoostedTypes,[]);failed.b.actions.hitStepAccuracy=native;
});

test('v1 and unmarked snapshots retain their old delayed history without modifying shared move data',()=>{
 for(const rule of ['source-subset-v1',null]){const p=probe(fixture({rule}));p.turn('move futuresight');p.turn();p.turn();assert.deepEqual(p.p.stellarBoostedTypes,[]);}
 assert.equal(Dex.moves.get('futuresight').flags.futuremove,1);assert.equal(Dex.moves.get('doomdesire').type,'Steel');
});
