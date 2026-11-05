import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,classicCombatView,continueClassicWild} from '../lib/rogue-battle-engine.mjs';
import {gainClassicExperience} from '../lib/rogue-classic-growth.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const moveNames=['Tackle','Quick Attack','Ember','Extreme Speed'];
function fixture({trainer=true,foeMoves=['Splash']}={}){const run={id:'bunny-pp',wave:8,biome:1,rng:42,party:[makeReferenceMon(813,9,{boxId:'bunny',moves:[...moveNames]})],tools:{},teraCharged:false,modifiers:[],encounter:{kind:trainer?'trainer':'wild'}};run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:foeMoves})],{trainer});run.party=run.combat.teams[0];return run;}
function play(run,command){run.combat=playClassicCombat(run,command);run.party=run.combat.teams[0];}
function view(run){return classicCombatView(run.combat).requests[0];}

test('Lv9 Scorbunny keeps Extreme Speed visible at PP0 after five uses and save/reload',async()=>{
 let run=fixture();for(let i=0;i<5;i++){play(run,{type:'move',move:'extremespeed'});run=await decodeGameData(await encodeGameData(run));}
 assert.deepEqual(run.party[0].moves,moveNames);assert.equal(run.party[0].pp.extremespeed,0);
 const req=view(run);assert.deepEqual(req.moves.map(m=>m.id),['tackle','quickattack','ember']);assert.equal(req.displayMoves.length,4);
 const card=req.displayMoves[3];assert.equal(card.id,'extremespeed');assert.equal(card.slot,4);assert.equal(card.name,'신속');assert.equal(card.pp,0);assert.equal(card.maxPp,5);assert.equal(card.disabled,true);assert.equal(card.disabledReason,'PP가 없습니다.');
 const before=JSON.stringify(run);assert.throws(()=>playClassicCombat(run,{type:'move',move:'extremespeed'}),/기술/);assert.equal(JSON.stringify(run),before);
 const grown=gainClassicExperience(run.party[0],1000,20).mon;assert.deepEqual(grown.moves,moveNames);assert.equal(grown.pp.extremespeed,0);
});
test('all four exhausted cards stay visible alongside usable Struggle',()=>{
 const run=fixture(),b=restoreClassicNativeBattle(run.combat,run);for(const p of b.p1.pokemon)for(const slot of p.moveSlots)slot.pp=0;for(const slot of b.p1.pokemon[0].baseMoveSlots)slot.pp=0;run.combat.snapshot=snapshotClassicNativeBattle(b);
 const req=view(run);assert.deepEqual(req.moves.map(m=>m.id),['struggle']);assert.equal(req.displayMoves.length,5);assert.deepEqual(req.displayMoves.slice(0,4).map(m=>m.slot),[1,2,3,4]);assert.ok(req.displayMoves.slice(0,4).every(m=>m.disabled&&m.pp===0));assert.equal(req.displayMoves[4].id,'struggle');assert.ok(!req.displayMoves[4].disabled);
 play(run,{type:'move',move:'struggle'});assert.deepEqual(run.party[0].moves,moveNames);assert.ok(run.combat.turn>1);
});
test('a disabled move retains its slot and description while the command remains rejected',()=>{
 const run=fixture({foeMoves:['Disable']});play(run,{type:'move',move:'extremespeed'});
 const req=view(run),card=req.displayMoves.find(m=>m.id==='extremespeed');assert.equal(card.disabled,true);assert.ok(card.pp>0);assert.equal(card.disabledReason,'지금 사용할 수 없습니다.');assert.equal(req.moves.some(m=>m.id==='extremespeed'),false);assert.throws(()=>playClassicCombat(run,{type:'move',move:'extremespeed'}),/기술/);
});
test('PP recovery restores the same visible card and legal command in a continuous wild encounter',()=>{
 const run=fixture({trainer:false});for(let i=0;i<5;i++)play(run,{type:'move',move:'extremespeed'});
 const b=restoreClassicNativeBattle(run.combat,run);b.p2.active[0].hp=1;run.combat.snapshot=snapshotClassicNativeBattle(b);play(run,{type:'move',move:'ember'});assert.ok(run.combat.ended);
 // The game's between-encounter services update the party PP before continuation.
 run.party[0].pp.extremespeed=5;run.wave++;
 run.combat=continueClassicWild(run,[makeReferenceMon(143,100,{boxId:'next',moves:['Splash']})]);run.party=run.combat.teams[0];
 const req=view(run),card=req.displayMoves.find(m=>m.id==='extremespeed');assert.equal(card.slot,4);assert.equal(card.pp,5);assert.ok(!card.disabled);assert.ok(req.moves.some(m=>m.id==='extremespeed'));play(run,{type:'move',move:'extremespeed'});assert.equal(run.party[0].pp.extremespeed,4);assert.deepEqual(run.party[0].moves,moveNames);
});
