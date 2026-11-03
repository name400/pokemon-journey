import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {grantClassicLure} from '../lib/rogue-lure.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';

function fixture(withBench){const doc={coins:7,collection:[{id:'keep'}]},state=ensureClassicState(doc),lead=makeReferenceMon(151,40,{boxId:'lead',moves:['Rain Dance','Swords Dance','Seismic Toss']}),foe=makeReferenceMon(19,1,{boxId:'old',moves:['Splash']});foe.hp=1;const party=[lead];if(withBench)party.push(makeReferenceMon(7,20,{boxId:'ally',moves:['Splash']}));const run={id:'single-double',encounterDoubleRule:'source-v2',wave:2,biome:1,rng:42,party,modifiers:[],tools:{},teraCharged:false,participants:[],awardedFoes:[],pendingMoves:[],screen:'battle',encounter:{kind:'wild',doubles:false},money:1000,balls:{pokeball:5},rerolls:0};state.slots[0]=run;run.combat=createClassicCombat(run,[foe]);return {doc,run};}
for(const withBench of [false,true]){
 const {doc,run}=fixture(withBench);for(const move of ['raindance','swordsdance','seismictoss'])applyClassicAction(doc,{action:'turn',command:{type:'move',move}});assert.equal(run.screen,'reward');const leadBefore=run.party.find(p=>p.boxId==='lead'),hp=leadBefore.hp,pp=leadBefore.pp.seismictoss;
 for(const id of ['lure','superlure','maxlure'])grantClassicLure(run,id);applyClassicAction(doc,{action:'skipReward'});
 const saved=JSON.parse(JSON.stringify(doc)),r=ensureClassicState(saved).slots[0];applyClassicAction(saved,{action:'next'});assert.equal(r.wave,3);assert.equal(r.encounter.doubles,true);
 if(withBench){assert.equal(r.screen,'wildswitch');const paused=JSON.parse(JSON.stringify(saved));const pending=ensureClassicState(paused).slots[0];applyClassicAction(paused,{action:'chooseWildReplacement',boxId:'ally'});assert.equal(pending.screen,'battle');assert.equal(pending.combat.requests[0].actors.filter(a=>a.kind==='move').length,2);const native=restoreClassicNativeBattle(pending.combat,pending);assert.equal(native.p1.active[0].boosts.atk,2);assert.equal(native.field.weather,'raindance');assert.equal(pending.party.find(p=>p.boxId==='lead').hp,hp);assert.equal(pending.party.find(p=>p.boxId==='lead').pp.seismictoss,pp);applyClassicAction(paused,{action:'turn',command:{type:'turn',actions:[{actor:0,type:'move',move:'seismictoss',target:1},{actor:1,type:'move',move:'splash'}]}});assert.ok(pending.combat.turn>=1);}
 else {assert.equal(r.screen,'battle');assert.equal(r.combat.requests[0].actors.filter(a=>a.kind==='move').length,1);const native=restoreClassicNativeBattle(r.combat,r);assert.equal(native.p1.active[0].boosts.atk,2);assert.equal(native.field.weather,'raindance');applyClassicAction(saved,{action:'turn',command:{type:'turn',actions:[{actor:0,type:'move',move:'seismictoss',target:1}]}});assert.ok(r.combat.turn>=1);}
 assert.deepEqual(saved.collection,[{id:'keep'}]);assert.ok(saved.coins>=7);
}
console.log('Single-to-double wild continuity preserves weather, stages, HP and PP with one or two party members.');
