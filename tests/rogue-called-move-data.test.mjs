import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {installClassicMoveBalance} from '../lib/rogue-move-balance.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({caller='Metronome',balance='source-subset-v2',flags='source-subset-v1',ability='pressure',targetAbility='runaway'}={}){
 const user=makeReferenceMon(151,100,{boxId:'source',moves:[caller,'Slash','Dragon Claw','Splash'],ability:caller==='Sleep Talk'?'comatose':ability});
 const run={id:'called-source-data',wave:30,biome:5,rng:42,screen:'battle',party:[user],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'},adaptabilityRule:'source-subset-v2'};
 if(balance)run.moveBalanceRule=balance;if(flags)run.moveFlagRule=flags;
 run.combat=createClassicCombat(run,[makeReferenceMon(80,200,{boxId:'target',moves:['Splash'],ability:targetAbility})],{trainer:true});return run;
}
function probe(run,{called='slash'}={}){
 const b=restoreClassicNativeBattle(run.combat,run),p=b.p1.active[0],sample=b.sample.bind(b),random=b.random.bind(b),chance=b.randomChance.bind(b),seen=[],hits=[];
 b.sample=values=>values.find(move=>move===called||move?.id===called)||sample(values);b.random=(...args)=>{const n=random(...args);return args.length===1&&args[0]===16?0:n;};b.randomChance=(n,d)=>n===1&&d===24?false:chance(n,d);
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);b.onEvent('PrepareHit',b.format,{priority:-100},function(source,target,move){if(source.side===this.p1)seen.push({id:move.id,power:move.basePower,flags:{...move.flags}});});b.onEvent('DamagingHit',b.format,{priority:-100},function(damage,target,source,move){if(source.side===this.p1)hits.push({damage,id:move.id});});
 return {b,p,seen,hits,turn(command='move 1',other='move splash'){const start=hits.length;b.makeChoices(command,other);return hits.slice(start);}};
}
async function recover(run,b){run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const doc={coins:41,adventure:{safe:true}},state=ensureClassicState(doc);state.slots[0]=run;state.slots[1]={id:'other',safe:true};const restored=await decodeGameData(await encodeGameData(doc));assert.equal(restored.coins,41);assert.deepEqual(restored.adventure,{safe:true});assert.deepEqual(restored.classic.slots[1],{id:'other',safe:true});return restored.classic.slots[0];}

test('actual Metronome and Sleep Talk use source numeric data, and only caller PP is consumed',()=>{
 for(const caller of ['Metronome','Sleep Talk'])for(const balance of ['source-subset-v1','source-subset-v2',null]){const p=probe(fixture({caller,balance,flags:null})),original=p.p.moveSlots.map(slot=>({id:slot.id,pp:slot.pp}));p.turn();assert.equal(p.seen.find(m=>m.id==='slash').power,balance?80:70);assert.equal(p.p.moveSlots[0].pp,original[0].pp-1);for(let i=1;i<original.length;i++)assert.equal(p.p.moveSlots[i].pp,original[i].pp);assert.deepEqual(p.p.stellarBoostedTypes,['Normal']);}
});

test('version2-only move values remain versioned when the called move is absent from the moveset',()=>{
 for(const balance of ['source-subset-v1','source-subset-v2',null]){const p=probe(fixture({balance,flags:null}),{called:'snipeshot'});p.turn();assert.equal(p.seen.find(m=>m.id==='snipeshot').power,balance==='source-subset-v2'?85:80);assert.ok(!p.p.moveSlots.some(m=>m.id==='snipeshot'));assert.deepEqual(p.p.stellarBoostedTypes,['Water']);}
});

test('called source flags reach actual Sharpness and Wind Rider effects without patching shared moves',()=>{
 const original={slicing:Dex.moves.get('dragonclaw').flags.slicing,wind:Dex.moves.get('silverwind').flags.wind};
 const modern=probe(fixture({balance:null,ability:'sharpness'}),{called:'dragonclaw'}),legacy=probe(fixture({balance:null,flags:null,ability:'sharpness'}),{called:'dragonclaw'});const a=modern.turn()[0].damage,b=legacy.turn()[0].damage;assert.equal(modern.seen.at(-1).flags.slicing,1);assert.ok(a/b>1.4);
 for(const flags of ['source-subset-v1',null]){const run=fixture({caller:'Sleep Talk',balance:null,flags,targetAbility:'windrider'});run.party[0].moves[2]='Silver Wind';run.combat=createClassicCombat(run,run.combat.teams[1],{trainer:true});const p=probe(run,{called:'silverwind'}),hits=p.turn();assert.equal(p.seen.find(m=>m.id==='silverwind').flags.wind,flags?1:undefined);assert.equal(hits.length,flags?0:1);assert.equal(p.b.p2.active[0].boosts.atk,flags?1:0);}
 assert.deepEqual({slicing:Dex.moves.get('dragonclaw').flags.slicing,wind:Dex.moves.get('silverwind').flags.wind},original);
});

test('Copycat resolves the same source move data as the selected original move',()=>{
 const run=fixture({caller:'Copycat'});run.combat.teams[1][0].moves=['Slash'];run.combat=createClassicCombat(run,run.combat.teams[1],{trainer:true});const p=probe(run);p.turn('move splash','move slash');p.turn('move copycat','move slash');assert.equal(p.seen.find(m=>m.id==='slash').power,80);assert.deepEqual(p.p.stellarBoostedTypes,['Normal']);
});

test('called metadata survives repeated saved recovery without duplicate invocations or PP deductions',async()=>{
 let run=fixture(),p=probe(run);const pp=p.p.moveSlots[0].pp;p.turn();run=await recover(run,p.b);p=probe(run);p.turn();assert.equal(p.seen.filter(m=>m.id==='slash').length,1);assert.equal(p.hits.filter(m=>m.id==='slash').length,1);assert.equal(p.p.moveSlots[0].pp,pp-2);assert.equal(p.seen.find(m=>m.id==='slash').power,80);assert.deepEqual(p.p.stellarBoostedTypes,['Normal']);run=await recover(run,p.b);p=probe(run);p.turn();assert.equal(p.p.moveSlots[0].pp,pp-3);assert.equal(p.hits.length,1);
});

test('supplied Move objects retain identity and repeated installation does not layer wrappers',()=>{
 const run=fixture(),p=probe(run),before=p.b.actions.useMove,dex=p.b.dex;installClassicMoveBalance(p.b,run.combat,run);installClassicMoveBalance(p.b,run.combat,run);assert.equal(p.b.actions.useMove,before);assert.equal(p.b.dex,dex);
 const object=p.b.dex.getActiveMove('slash');object.basePower=13;let received,calls=0;p.b.actions.useMoveInner=move=>{received=move;calls++;return true;};p.b.actions.useMove(object,p.p);assert.equal(received,object);assert.equal(received.basePower,13);assert.equal(calls,1);p.b.actions.useMove('slash',p.p);assert.equal(received.basePower,80);assert.equal(calls,2);
 const runMove=probe(fixture()),active=runMove.b.dex.getActiveMove('slash');active.basePower=11;let forwarded,invocations=0;Object.defineProperty(runMove.b.actions,'useMove',{configurable:true,value(move){forwarded=move;invocations++;return true;}});runMove.b.actions.runMove(active,runMove.p,0,{externalMove:true});assert.equal(forwarded,active);assert.equal(forwarded.basePower,11);assert.equal(invocations,1);
 const legacy=probe(fixture({balance:null,flags:null}));assert.equal(Object.hasOwn(legacy.b.actions,'useMove'),false);
});

test('Dancer copies source Revelation Dance once without extra PP through saved recovery',async()=>{
 for(const balance of ['source-subset-v1','source-subset-v2',null]){
  let run=fixture({balance,flags:null,ability:'dancer'});run.party[0].moves=['Splash'];run.combat=createClassicCombat(run,[makeReferenceMon(741,100,{boxId:'dancing-target',moves:['Revelation Dance'],ability:'runaway'})],{trainer:true});let p=probe(run),pp=p.p.moveSlots[0].pp;
  for(let turn=1;turn<=2;turn++){p.turn('move splash','move revelationdance');const copied=p.seen.filter(m=>m.id==='revelationdance');assert.equal(copied.length,1);assert.equal(copied[0].power,balance?100:90);assert.equal(p.hits.filter(m=>m.id==='revelationdance').length,1);assert.equal(p.p.moveSlots[0].pp,pp-turn);assert.equal(p.p.moveSlots.length,1);if(turn===1){run=await recover(run,p.b);p=probe(run);}}
 }
});

test('local ActiveMove changes and cached source moves do not leak into another battle or shared Dex',()=>{
 const a=probe(fixture()),b=probe(fixture()),native=Dex.moves.get('slash');assert.notEqual(a.b.dex.moves.get('slash'),b.b.dex.moves.get('slash'));assert.notEqual(a.b.dex.moves.get('slash'),native);
 a.b.onEvent('ModifyMove',a.b.format,{priority:100},move=>{if(move.id==='slash'){move.basePower=1;move.flags.localOnly=1;}});a.turn();assert.equal(a.seen.find(m=>m.id==='slash').power,1);assert.equal(a.b.dex.moves.get('slash').basePower,80);assert.equal(b.b.dex.moves.get('slash').basePower,80);assert.equal(b.b.dex.moves.get('slash').flags.localOnly,undefined);assert.equal(native.basePower,70);assert.equal(native.flags.localOnly,undefined);b.turn();assert.equal(b.seen.find(m=>m.id==='slash').power,80);
});
